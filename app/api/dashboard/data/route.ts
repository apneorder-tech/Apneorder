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

    // 2. Define Pagination Context (Before Parallel Fetch)
    const completedPage = parseInt(searchParams.get("page") || "1");
    const completedLimit = parseInt(searchParams.get("limit") || "20");
    const skip = (completedPage - 1) * completedLimit;

    // 3. Fetch everything in PARALLEL (< 2s latency architecture)
    // Supavisor Transaction Port (6543) makes this safe and extremely fast.
    const [
      restaurant,
      salesDailyAgg,
      salesWeeklyAgg,
      salesMonthlyAgg,
      salesYearlyAgg,
      preparedTodayCount,
      topItemsAgg,
      chartOrders,
      completedOrders,
      totalCompletedCount
    ] = await Promise.all([
      // Restaurant Profile & Active Orders
      prisma.restaurant.findUnique({
        where: { managerId },
        select: {
          id: true, name: true, upiId: true, themeColor: true,
          categories: { include: { menuItems: true } },
          tables: {
            select: {
              id: true, tableNumber: true, qrCodeUrl: true,
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
      }),
      // Sales Aggregates
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId } }, status: "completed", createdAt: { gte: todayStart } }
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId } }, status: "completed", createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId } }, status: "completed", createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId } }, status: "completed", createdAt: { gte: oneYearAgo } }
      }),
      // Other metrics
      prisma.order.count({
        where: { table: { restaurant: { managerId } }, status: { in: ["ready", "completed"] }, createdAt: { gte: todayStart } }
      }),
      prisma.orderItem.groupBy({
        by: ['menuItemId'],
        _sum: { quantity: true },
        where: { order: { table: { restaurant: { managerId } }, status: "completed", createdAt: { gte: sevenDaysAgo } } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      // Chart Data
      prisma.order.findMany({
        where: { table: { restaurant: { managerId } }, status: "completed", createdAt: { gte: oneYearAgo } },
        select: { totalAmount: true, createdAt: true }
      }),
      // History Feed
      prisma.order.findMany({
        where: { table: { restaurant: { managerId } }, status: "completed" },
        include: {
          orderItems: { include: { menuItem: { select: { name: true, type: true } } } },
          table: { select: { tableNumber: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: completedLimit
      }),
      // Total Feed Count
      prisma.order.count({
        where: { table: { restaurant: { managerId } }, status: "completed" }
      })
    ]);

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // 4. Secondary Parallel Pass for Top Item Meta
    const topItems = await Promise.all(topItemsAgg.map(async (item) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        select: { name: true, type: true }
      });
      return { name: menuItem?.name || "Unknown", count: item._sum.quantity || 0, type: menuItem?.type || "veg" };
    }));

    // 5. Tally Sales Totals
    const salesDaily = Number(salesDailyAgg._sum.totalAmount || 0);
    const salesWeekly = Number(salesWeeklyAgg._sum.totalAmount || 0);
    const salesMonthly = Number(salesMonthlyAgg._sum.totalAmount || 0);
    const salesYearly = Number(salesYearlyAgg._sum.totalAmount || 0);

    // 6. Generate Chart Data (Optimized via single-pass chartOrders)
    // Weekly (Last 7 Days)
    const chartWeek = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      const val = chartOrders.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end)
                                     .reduce((s, o) => s + Number(o.totalAmount), 0);
      return { date: start.toLocaleDateString('en-IN', { weekday: 'short' }), sales: val };
    }).reverse();

    // Monthly (Last 4 Weeks)
    const chartMonth = Array.from({ length: 4 }).map((_, i) => {
      const start = new Date(); start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date(); end.setDate(end.getDate() - i * 7);
      const val = chartOrders.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end)
                                     .reduce((s, o) => s + Number(o.totalAmount), 0);
      return { date: `Week ${4-i}`, sales: val };
    }).reverse();

    // Yearly (Current Calendar Year)
    const currentYearNum = new Date().getFullYear();
    const chartYear = Array.from({ length: 12 }).map((_, i) => {
      const start = new Date(currentYearNum, i, 1);
      const end = new Date(currentYearNum, i + 1, 0, 23, 59, 59, 999);
      const val = chartOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      }).reduce((s, o) => s + Number(o.totalAmount), 0);
      return { date: start.toLocaleDateString('en-IN', { month: 'short' }), sales: val };
    });

    const hasMoreCompleted = totalCompletedCount > skip + completedOrders.length;

    // Active Orders (Payment Pending, Preparing, Ready)
    const activeOrders = restaurant.tables.flatMap(t => t.orders).filter(o => o.status !== "completed");
    // Also include TODAY'S completed orders for the "Completed" tab initial view
    const todayCompleted = restaurant.tables.flatMap(t => t.orders).filter(o => o.status === "completed");

    return NextResponse.json({ 
      success: true, 
      orders: activeOrders,
      completedOrders: completedPage === 1 ? todayCompleted : completedOrders,
      hasMoreCompleted,
      totalCompleted: totalCompletedCount,
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
        activeOrdersCount: activeOrders.length,
        timeframes: {
          week: { chartData: chartWeek, topItems: topItems },
          month: { chartData: chartMonth, topItems: topItems },
          year: { chartData: chartYear, topItems: topItems }
        }
      },
      tables: restaurant.tables.map(t => ({ id: t.id, tableNumber: t.tableNumber, qrCodeUrl: t.qrCodeUrl }))
    });

  } catch (error: unknown) {
    console.error("Dashboard Data Optimization Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
