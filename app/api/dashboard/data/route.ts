import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    const isSubscriptionOnly = searchParams.get("subscriptionOnly") === "true";

    // 2.5 Fetch Subscription Status First (Pre-flight Security)
    let subscription = await (prisma as any).subscription.findUnique({
      where: { managerId: effectiveManagerId },
      select: { status: true, currentPeriodEnd: true }
    });

    // Auto-expire: if DB says ACTIVE but currentPeriodEnd has passed, mark it EXPIRED
    if (
      subscription?.status === "ACTIVE" &&
      subscription?.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd) < new Date()
    ) {
      await (prisma as any).subscription.update({
        where: { managerId: effectiveManagerId },
        data: { status: "EXPIRED" }
      });
      subscription = { ...subscription, status: "EXPIRED" };
    }

    // 2.6 Quick Subscription Check mode
    if (isSubscriptionOnly) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { managerId: effectiveManagerId },
        select: { id: true, name: true }
      });

      if (!restaurant) return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });

      return NextResponse.json({
        success: true,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        subscription: subscription || null
      });
    }

    // 2.7 Security Enforcement: Ensure ACTIVE subscription for any operational data
    if (!subscription || subscription.status !== "ACTIVE") {
      // We still need to return basic restaurant info so the dashboard can show the UI/Plans state
      const restaurant = await prisma.restaurant.findUnique({
        where: { managerId: effectiveManagerId },
        select: { id: true, name: true }
      });
      
      return NextResponse.json({
        success: true, // success = true but content is restricted
        restricted: true,
        message: "Active subscription required for this data",
        restaurantId: restaurant?.id,
        restaurantName: restaurant?.name,
        subscription: subscription || null
      });
    }

    // 3. Fetch Data based on mode
    if (isEssentials) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { managerId: effectiveManagerId },
        select: { 
          id: true, name: true, upiId: true,
          categories: { 
            select: { 
              id: true, 
              name: true,
              menuItems: {
                where: { isDeleted: false } as any,
                select: { id: true, name: true, price: true, costPrice: true, type: true, isAvailable: true }
              }
            }
          },
          tables: {
            select: {
              id: true, tableNumber: true, qrCodeUrl: true, isOccupied: true,
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

      const allOrders = ((restaurant as any).tables || []).flatMap((t: any) => t.orders || []).map((o: any) => ({
        ...o,
        items: (o.orderItems || []).map((oi: any) => ({
          id: oi.id,
          name: oi.menuItem.name,
          quantity: oi.quantity,
          price: Number(oi.menuItem.price),
          notes: oi.notes || null,
        })),
        tableNumber: o.table?.tableNumber
      }));

      return NextResponse.json({
        success: true,
        orders: allOrders.filter((o: any) => o.status !== "completed"),
        completedOrders: allOrders.filter((o: any) => o.status === "completed").slice(0, 10),
        restaurantId: (restaurant as any).id,
        restaurantName: (restaurant as any).name,
        upiId: (restaurant as any).upiId,
        menuCategories: (restaurant as any).categories.map((cat: any) => ({
          ...cat,
          menuItems: (cat.menuItems || []).filter((item: any) => !item.isDeleted)
        })),
        tables: (restaurant as any).tables?.map((t: any) => ({ id: t.id, tableNumber: t.tableNumber, qrCodeUrl: t.qrCodeUrl, isOccupied: t.isOccupied })),
        stats: null
      });
    }

    // Full fetch (for backwards compatibility or specific needs)
    if (!(prisma as any).subscription) {
      console.error("Prisma subscription model NOT FOUND. Available models:", Object.keys(prisma));
    }

    const currentYearNum = new Date().getFullYear();
    const currentYearStart = new Date(currentYearNum, 0, 1);
    const nextYearStart = new Date(currentYearNum + 1, 0, 1);

    // Build time buckets for chart queries BEFORE the Promise.all so we can
    // use plain Prisma aggregates (same ORM path as the scalar stats — avoids
    // $queryRaw timezone issues where date_trunc uses the DB timezone).
    const weekBuckets = Array.from({ length: 7 }, (_, i) => {
      const start = new Date(now);
      start.setUTCDate(now.getUTCDate() - (6 - i));
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(start.getUTCDate() + 1);
      return { start, end, label: start.toLocaleDateString("en-IN", { weekday: "short" }) };
    });

    const monthBuckets = Array.from({ length: 4 }, (_, i) => {
      const start = new Date(now);
      start.setUTCDate(now.getUTCDate() - (21 - i * 7));
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(start.getUTCDate() + 7);
      return { start, end, label: `Week ${i + 1}` };
    });

    const yearBuckets = Array.from({ length: 12 }, (_, i) => {
      const start = new Date(Date.UTC(currentYearNum, i, 1));
      const end = new Date(Date.UTC(currentYearNum, i + 1, 1));
      return { start, end, label: start.toLocaleDateString("en-IN", { month: "short" }) };
    });

    const [
      restaurant,
      salesAggToday,
      salesAggWeek,
      salesAggMonth,
      salesAggYear,
      preparedTodayCount,
      topItemsAgg,
      completedOrders,
      totalCompletedCount,
      allItemsSoldWeek,
      weekChartResults,
      monthChartResults,
      yearChartResults,
    ] = await Promise.all([
      prisma.restaurant.findUnique({
        where: { managerId: effectiveManagerId },
        select: {
          id: true, name: true, upiId: true, themeColor: true,
          categories: {
            select: {
              id: true,
              name: true,
              menuItems: {
                where: { isDeleted: false } as any,
                select: { id: true, name: true, price: true, costPrice: true, type: true, isAvailable: true }
              }
            }
          },
          tables: {
            select: {
              id: true, tableNumber: true, qrCodeUrl: true, isOccupied: true,
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
      // DB-level aggregates for scalar stats — avoids loading full order rows
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed", createdAt: { gte: todayStart } }
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed", createdAt: { gte: sevenDaysAgo } }
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed", createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed", createdAt: { gte: oneYearAgo } }
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
      // completedOrders: use select on nested orderItems to avoid over-fetching
      prisma.order.findMany({
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed" },
        include: {
          orderItems: {
            select: {
              id: true,
              quantity: true,
              notes: true,
              menuItem: { select: { name: true, type: true, price: true } }
            }
          },
          table: { select: { tableNumber: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: completedLimit
      }),
      prisma.order.count({
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed" }
      }),
      // Quantity sold per item in the last 7 days — used for profit contribution
      prisma.orderItem.groupBy({
        by: ["menuItemId"],
        _sum: { quantity: true },
        where: {
          order: {
            table: { restaurant: { managerId: effectiveManagerId } },
            status: "completed",
            createdAt: { gte: sevenDaysAgo },
          },
        },
      }),
      // Chart queries: one Prisma aggregate per bucket — avoids $queryRaw timezone issues
      Promise.all(weekBuckets.map(({ start, end }) => prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed", createdAt: { gte: start, lt: end } },
      }))),
      Promise.all(monthBuckets.map(({ start, end }) => prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed", createdAt: { gte: start, lt: end } },
      }))),
      Promise.all(yearBuckets.map(({ start, end }) => prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed", createdAt: { gte: start, lt: end } },
      }))),
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

    // ── Profit Margin Computation ──────────────────────────────
    const allMenuItems = (restaurant as any).categories.flatMap((c: any) => c.menuItems);
    const itemsWithoutCost = allMenuItems.filter((i: any) => i.costPrice == null).length;

    const profitItems = allMenuItems
      .filter((item: any) => item.costPrice != null)
      .map((item: any) => {
        const price = Number(item.price);
        const costPrice = Number(item.costPrice);
        const margin = price > 0 ? ((price - costPrice) / price) * 100 : 0;
        const soldEntry = allItemsSoldWeek.find((s: any) => s.menuItemId === item.id);
        const quantitySold = soldEntry?._sum?.quantity ?? 0;
        const profitContribution = (price - costPrice) * quantitySold;
        return { id: item.id, name: item.name, type: item.type, price, costPrice, margin: Math.round(margin * 10) / 10, quantitySold, profitContribution };
      })
      .sort((a: any, b: any) => b.profitContribution - a.profitContribution);

    const totalProfitWeek = profitItems.reduce((sum: number, i: any) => sum + i.profitContribution, 0);
    const lossLeaders = profitItems.filter((i: any) => i.margin < 20);
    const profitData = profitItems.length > 0
      ? { items: profitItems, totalProfitWeek, topProfitItem: profitItems[0] ?? null, lossLeaders, itemsWithoutCost }
      : null;
    // ────────────────────────────────────────────────────────────

    // Scalar stats from DB-level aggregates
    const salesDaily = Number(salesAggToday._sum.totalAmount ?? 0);
    const salesWeekly = Number(salesAggWeek._sum.totalAmount ?? 0);
    const salesMonthly = Number(salesAggMonth._sum.totalAmount ?? 0);
    const salesYearly = Number(salesAggYear._sum.totalAmount ?? 0);

    // Chart data — derived from per-bucket Prisma aggregates (no timezone issues)
    const chartWeek = weekBuckets.map(({ label }, i) => ({
      date: label,
      sales: Number(weekChartResults[i]._sum.totalAmount ?? 0),
    }));

    const chartMonth = monthBuckets.map(({ label }, i) => ({
      date: label,
      sales: Number(monthChartResults[i]._sum.totalAmount ?? 0),
    }));

    const chartYear = yearBuckets.map(({ label }, i) => ({
      date: label,
      sales: Number(yearChartResults[i]._sum.totalAmount ?? 0),
    }));

    const mapItems = (oi: any) => ({
      id: oi.id,
      name: oi.menuItem.name,
      quantity: oi.quantity,
      price: Number(oi.menuItem.price),
      notes: oi.notes || null,
    });
    const activeOrders = restaurant.tables.flatMap(t => t.orders).filter(o => o.status !== "completed").map((o: any) => ({ ...o, items: o.orderItems.map(mapItems), tableNumber: o.table.tableNumber }));
    const todayCompleted = restaurant.tables.flatMap(t => t.orders).filter(o => o.status === "completed").map((o: any) => ({ ...o, items: o.orderItems.map(mapItems), tableNumber: o.table.tableNumber }));
    const historyOrders = completedOrders.map((o: any) => ({ ...o, items: o.orderItems.map(mapItems), tableNumber: o.table.tableNumber }));

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
        tablesFilled: `${restaurant.tables.filter((t: any) => t.isOccupied).length}/${restaurant.tables.length}`,
        activeOrdersCount: activeOrders.length,
        timeframes: { week: { chartData: chartWeek, topItems }, month: { chartData: chartMonth, topItems }, year: { chartData: chartYear, topItems } },
        profitData,
      },
      tables: restaurant.tables.map((t: any) => ({ id: t.id, tableNumber: t.tableNumber, qrCodeUrl: t.qrCodeUrl, isOccupied: t.isOccupied })),
      subscription: subscription
    });

  } catch (error: unknown) {
    console.error("Dashboard Data Optimization Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
