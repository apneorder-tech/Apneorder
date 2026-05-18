import { NextResponse, NextRequest } from "next/server";
import { verifyAdminToken, adminCookieName } from "@/lib/admin-auth";
import prisma from "@/lib/prisma-new";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(adminCookieName())?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalManagers,
    totalRestaurants,
    subscriptionBreakdown,
    ordersToday,
    ordersThisWeek,
    newSignupsWeek,
    newSignupsMonth,
    allRestaurants,
    monthlySignups,
    revenueThisMonth,
  ] = await Promise.all([
    prisma.manager.count(),
    prisma.restaurant.count(),
    (prisma as any).subscription.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.order.count({
      where: { createdAt: { gte: todayStart }, status: { notIn: ["cancelled"] } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: sevenDaysAgo }, status: { notIn: ["cancelled"] } },
    }),
    prisma.restaurant.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.restaurant.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.restaurant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        manager: {
          select: {
            email: true,
            phone: true,
            subscription: {
              select: { status: true, currentPeriodEnd: true, currentPeriodStart: true },
            },
          },
        },
        _count: { select: { orders: true } },
      },
    }),
    prisma.$queryRaw<{ month: Date; count: number }[]>`
      SELECT
        date_trunc('month', "createdAt") AS month,
        COUNT(*)::int AS count
      FROM "Restaurant"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY 1
      ORDER BY 1
    `,
    // Active subscriptions × ₹1499 = MRR
    (prisma as any).subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  const activeCount = subscriptionBreakdown.find(
    (s: any) => s.status === "ACTIVE"
  )?._count?.status ?? 0;

  return NextResponse.json({
    success: true,
    stats: {
      totalManagers,
      totalRestaurants,
      activeSubscriptions: activeCount,
      mrr: activeCount * 1499,
      ordersToday,
      ordersThisWeek,
      newSignupsWeek,
      newSignupsMonth,
    },
    subscriptionBreakdown,
    allRestaurants,
    monthlySignups: monthlySignups.map((r) => ({
      month: new Date(r.month).toISOString(),
      count: Number(r.count),
    })),
  });
}
