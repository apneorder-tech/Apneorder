import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { z } from "zod";

const QuerySchema = z.object({
    managerId: z.string(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryResult = QuerySchema.safeParse({
        managerId: searchParams.get("managerId")
    });

    if (!queryResult.success) {
        return NextResponse.json({ success: false, error: "Manager ID is required" }, { status: 400 });
    }

    const { managerId } = queryResult.data;

    // 1. Verify Authentication
    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) {
      return unauthorizedResponse(auth.error);
    }

    // 2. Critical: Use the authenticated UID as the primary managerId for security and to resolve legacy CUID mismatches.
    const effectiveManagerId = auth.uid === "ADMIN_UID" ? managerId : auth.uid;

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

    const isEssentials = searchParams.get("essentials") === "true";

    // 3. Fetch Data based on mode
    if (isEssentials) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { managerId: effectiveManagerId },
        select: { 
          id: true, name: true, upiId: true,
          categories: { select: { id: true } },
          tables: {
            select: {
              id: true, tableNumber: true, qrCodeUrl: true,
              orders: {
                where: {
                  OR: [
                    { status: { notIn: ["completed", "cancelled"] } },
                    { status: "completed", createdAt: { gte: todayStart } }
                  ]
                },
                include: {
                  orderItems: { include: { menuItem: { select: { name: true, type: true, price: true } } } },
                  table: { select: { tableNumber: true } }
                },
                orderBy: { createdAt: 'desc' }
              }
            }
          }
        }
      });

      if (!restaurant) return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });

      const allOrders = restaurant.tables.flatMap(t => t.orders).map((o: any) => ({
        ...o,
        items: o.orderItems.map((oi: any) => ({ id: oi.id, name: oi.menuItem.name, quantity: oi.quantity, price: Number(oi.menuItem.price) })),
        tableNumber: o.table.tableNumber
      }));

      return NextResponse.json({
        success: true,
        orders: allOrders.filter(o => o.status !== "completed"),
        completedOrders: allOrders.filter(o => o.status === "completed").slice(0, 10),
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        upiId: restaurant.upiId,
        menuCategories: restaurant.categories,
        tables: restaurant.tables.map(t => ({ id: t.id, tableNumber: t.tableNumber, qrCodeUrl: t.qrCodeUrl })),
        stats: null
      });
    }

    // Full fetch (for backwards compatibility or specific needs)
    // ... existing full fetch logic ...
    const [
      restaurant,
      salesAnnualArr,
      preparedTodayCount,
      topItemsAgg,
      completedOrders,
      totalCompletedCount
    ] = await Promise.all([
      prisma.restaurant.findUnique({
        where: { managerId: effectiveManagerId },
        select: {
          id: true, name: true, upiId: true, themeColor: true,
          categories: { select: { id: true } },
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
                  orderItems: { include: { menuItem: { select: { name: true, type: true, price: true } } } },
                  table: { select: { tableNumber: true } }
                },
                orderBy: { createdAt: 'desc' }
              }
            }
          }
        }
      }),
      prisma.order.findMany({
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed", createdAt: { gte: oneYearAgo } },
        select: { totalAmount: true, createdAt: true }
      }),
      prisma.order.count({
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: { in: ["ready", "completed"] }, createdAt: { gte: todayStart } }
      }),
      prisma.orderItem.groupBy({
        by: ['menuItemId'],
        _sum: { quantity: true },
        where: { order: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed", createdAt: { gte: sevenDaysAgo } } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      prisma.order.findMany({
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed" },
        include: {
          orderItems: { include: { menuItem: { select: { name: true, type: true, price: true } } } },
          table: { select: { tableNumber: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: completedLimit
      }),
      prisma.order.count({
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed" }
      })
    ]);

    if (!restaurant) return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });

    const topItemIds = topItemsAgg.map(item => item.menuItemId);
    const topItemsMeta = await prisma.menuItem.findMany({
      where: { id: { in: topItemIds } },
      select: { id: true, name: true, type: true }
    });
    
    const topItems = topItemsAgg.map(item => {
      const meta = topItemsMeta.find(m => m.id === item.menuItemId);
      return { name: meta?.name || "Unknown", count: item._sum.quantity || 0, type: meta?.type || "veg" };
    });

    const salesDaily = salesAnnualArr.filter(o => o.createdAt >= todayStart).reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const salesWeekly = salesAnnualArr.filter(o => o.createdAt >= sevenDaysAgo).reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const salesMonthly = salesAnnualArr.filter(o => o.createdAt >= thirtyDaysAgo).reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const salesYearly = salesAnnualArr.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    // Chart logic
    const chartOrders = salesAnnualArr;
    const chartWeek = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      const val = chartOrders.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end).reduce((s, o) => s + Number(o.totalAmount), 0);
      return { date: start.toLocaleDateString('en-IN', { weekday: 'short' }), sales: val };
    }).reverse();

    const chartMonth = Array.from({ length: 4 }).map((_, i) => {
      const start = new Date(); start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date(); end.setDate(end.getDate() - i * 7);
      const val = chartOrders.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end).reduce((s, o) => s + Number(o.totalAmount), 0);
      return { date: `Week ${4-i}`, sales: val };
    }).reverse();

    const currentYearNum = new Date().getFullYear();
    const chartYear = Array.from({ length: 12 }).map((_, i) => {
      const start = new Date(currentYearNum, i, 1);
      const end = new Date(currentYearNum, i + 1, 0, 23, 59, 59, 999);
      const val = chartOrders.filter(o => { const d = new Date(o.createdAt); return d >= start && d <= end; }).reduce((s, o) => s + Number(o.totalAmount), 0);
      return { date: start.toLocaleDateString('en-IN', { month: 'short' }), sales: val };
    });

    const activeOrders = restaurant.tables.flatMap(t => t.orders).filter(o => o.status !== "completed").map(o => ({ ...o, items: o.orderItems.map(oi => ({ id: oi.id, name: oi.menuItem.name, quantity: oi.quantity, price: Number(oi.menuItem.price) })), tableNumber: o.table.tableNumber }));
    const todayCompleted = restaurant.tables.flatMap(t => t.orders).filter(o => o.status === "completed").map(o => ({ ...o, items: o.orderItems.map(oi => ({ id: oi.id, name: oi.menuItem.name, quantity: oi.quantity, price: Number(oi.menuItem.price) })), tableNumber: o.table.tableNumber }));
    const historyOrders = completedOrders.map(o => ({ ...o, items: o.orderItems.map(oi => ({ id: oi.id, name: oi.menuItem.name, quantity: oi.quantity, price: Number(oi.menuItem.price) })), tableNumber: o.table.tableNumber }));

    return NextResponse.json({ 
      success: true, 
      orders: activeOrders,
      completedOrders: completedPage === 1 ? todayCompleted : historyOrders,
      hasMoreCompleted: totalCompletedCount > skip + completedOrders.length,
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
        timeframes: { week: { chartData: chartWeek, topItems }, month: { chartData: chartMonth, topItems }, year: { chartData: chartYear, topItems } }
      },
      tables: restaurant.tables.map(t => ({ id: t.id, tableNumber: t.tableNumber, qrCodeUrl: t.qrCodeUrl }))
    });

  } catch (error: unknown) {
    console.error("Dashboard Data Optimization Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
