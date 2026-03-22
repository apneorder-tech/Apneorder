import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Define Time Ranges
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // 2. Fetch everything SEQUENTIALLY to prevent connection pool exhaustion
    const restaurant = await prisma.restaurant.findUnique({
      where: { managerId },
      select: {
        id: true,
        name: true,
        upiId: true,
        themeColor: true,
        categories: { include: { menuItems: true } },
        tables: {
          select: {
            id: true,
            tableNumber: true,
            qrCodeUrl: true,
            orders: {
              where: {
                status: { notIn: ["cancelled"] },
                OR: [
                  { status: { notIn: ["completed"] } },
                  { status: "completed", createdAt: { gte: todayStart } }
                ]
              },
              include: {
                orderItems: { include: { menuItem: { select: { name: true, type: true } } } },
                table: { select: { tableNumber: true } }
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Fetch orders for the last year for comprehensive analytics
    const completedOrdersYear = await prisma.order.findMany({
      where: {
        table: { restaurantId: restaurant.id },
        status: "completed",
        createdAt: { gte: oneYearAgo }
      },
      select: {
        totalAmount: true,
        createdAt: true,
        orderItems: { include: { menuItem: { select: { name: true, type: true } } } }
      }
    });

    const preparedTodayCount = await prisma.order.count({
      where: {
        table: { restaurantId: restaurant.id },
        status: { in: ["ready", "completed"] },
        createdAt: { gte: todayStart }
      }
    });

    // 3. Process Advanced Analytics for Multi-Timeframe
    const getTopItems = (orders: any[]) => {
      const itemMap: Record<string, { count: number, type: string }> = {};
      orders.forEach(order => {
        order.orderItems.forEach((item: any) => {
          const name = item.menuItem.name;
          if (!itemMap[name]) itemMap[name] = { count: 0, type: item.menuItem.type };
          itemMap[name].count += item.quantity;
        });
      });
      return Object.entries(itemMap)
        .map(([name, data]) => ({ name, count: data.count, type: data.type }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    };

    const salesDaily = completedOrdersYear
      .filter(o => new Date(o.createdAt) >= todayStart)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);
    
    const salesWeekly = completedOrdersYear
      .filter(o => new Date(o.createdAt) >= sevenDaysAgo)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const salesMonthly = completedOrdersYear
      .filter(o => new Date(o.createdAt) >= thirtyDaysAgo)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const salesYearly = completedOrdersYear.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    // --- Chart Data Generators ---
    
    // Weekly (Last 7 Days)
    const chartWeek = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      const val = completedOrdersYear.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end)
                                     .reduce((s, o) => s + Number(o.totalAmount), 0);
      return { date: start.toLocaleDateString('en-IN', { weekday: 'short' }), sales: val };
    }).reverse();

    // Monthly (Last 4 Weeks)
    const chartMonth = Array.from({ length: 4 }).map((_, i) => {
      const start = new Date(); start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date(); end.setDate(end.getDate() - i * 7);
      const val = completedOrdersYear.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end)
                                     .reduce((s, o) => s + Number(o.totalAmount), 0);
      return { date: `Week ${4-i}`, sales: val };
    }).reverse();

    // Yearly (Current Calendar Year: January to December)
    const currentYear = new Date().getFullYear();
    const chartYear = Array.from({ length: 12 }).map((_, i) => {
      const start = new Date(currentYear, i, 1);
      const end = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);
      const val = completedOrdersYear.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      }).reduce((s, o) => s + Number(o.totalAmount), 0);
      
      return { date: start.toLocaleDateString('en-IN', { month: 'short' }), sales: val };
    });

    return NextResponse.json({ 
      success: true, 
      orders: restaurant.tables.flatMap(t => t.orders),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      upiId: restaurant.upiId,
      menuCategories: restaurant.categories,
      stats: {
        totalSaleToday: salesDaily,
        salesWeekly,
        salesMonthly,
        salesYearly,
        preparedTodayCount,
        tablesFilled: `${restaurant.tables.filter(t => t.orders.length > 0).length}/${restaurant.tables.length}`,
        activeOrdersCount: restaurant.tables.flatMap(t => t.orders).length,
        timeframes: {
          week: { chartData: chartWeek, topItems: getTopItems(completedOrdersYear.filter(o => new Date(o.createdAt) >= sevenDaysAgo)) },
          month: { chartData: chartMonth, topItems: getTopItems(completedOrdersYear.filter(o => new Date(o.createdAt) >= thirtyDaysAgo)) },
          year: { chartData: chartYear, topItems: getTopItems(completedOrdersYear) }
        }
      },
      tables: restaurant.tables.map(t => ({ id: t.id, tableNumber: t.tableNumber, qrCodeUrl: t.qrCodeUrl }))
    });

  } catch (error: unknown) {
    console.error("Dashboard Data Optimization Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
