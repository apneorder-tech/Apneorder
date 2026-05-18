import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

const QuerySchema = z.object({
  managerId: z.string(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryResult = QuerySchema.safeParse({ managerId: searchParams.get("managerId") });
    if (!queryResult.success) {
      return NextResponse.json({ success: false, error: "Manager ID is required" }, { status: 400 });
    }
    const { managerId } = queryResult.data;

    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) return unauthorizedResponse(auth.error);

    const effectiveManagerId = auth.uid === "ADMIN_UID" ? managerId : auth.uid;

    const now = new Date();
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
    const oneYearAgo = new Date(now); oneYearAgo.setFullYear(now.getFullYear() - 1);

    const currentYearNum = now.getFullYear();

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

    const whereBase = { table: { restaurant: { managerId: effectiveManagerId } }, status: "completed" as const };

    const [
      salesAggWeek,
      salesAggMonth,
      salesAggYear,
      topItemsAgg,
      allItemsSoldWeek,
      weekChartResults,
      monthChartResults,
      yearChartResults,
      menuItems,
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { ...whereBase, createdAt: { gte: sevenDaysAgo } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { ...whereBase, createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { ...whereBase, createdAt: { gte: oneYearAgo } } }),
      prisma.orderItem.groupBy({
        by: ["menuItemId"],
        _sum: { quantity: true },
        where: { order: { ...whereBase, createdAt: { gte: sevenDaysAgo } } },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.orderItem.groupBy({
        by: ["menuItemId"],
        _sum: { quantity: true },
        where: { order: { ...whereBase, createdAt: { gte: sevenDaysAgo } } },
      }),
      Promise.all(weekBuckets.map(({ start, end }) =>
        prisma.order.aggregate({ _sum: { totalAmount: true }, where: { ...whereBase, createdAt: { gte: start, lt: end } } })
      )),
      Promise.all(monthBuckets.map(({ start, end }) =>
        prisma.order.aggregate({ _sum: { totalAmount: true }, where: { ...whereBase, createdAt: { gte: start, lt: end } } })
      )),
      Promise.all(yearBuckets.map(({ start, end }) =>
        prisma.order.aggregate({ _sum: { totalAmount: true }, where: { ...whereBase, createdAt: { gte: start, lt: end } } })
      )),
      prisma.menuItem.findMany({
        where: { category: { restaurant: { managerId: effectiveManagerId } }, isDeleted: false } as any,
        select: { id: true, name: true, type: true, price: true, costPrice: true },
      }),
    ]);

    const topItemIds = topItemsAgg.map((i) => i.menuItemId);
    const topItemsMeta = menuItems.filter((m) => topItemIds.includes(m.id));

    const topItems = topItemsAgg.map((item) => {
      const meta = topItemsMeta.find((m) => m.id === item.menuItemId);
      return { name: meta?.name || "Unknown", count: item._sum.quantity || 0, type: meta?.type || "veg" };
    });

    const profitItems = menuItems
      .filter((item) => item.costPrice != null)
      .map((item) => {
        const price = Number(item.price);
        const costPrice = Number(item.costPrice);
        const margin = price > 0 ? ((price - costPrice) / price) * 100 : 0;
        const soldEntry = allItemsSoldWeek.find((s) => s.menuItemId === item.id);
        const quantitySold = soldEntry?._sum?.quantity ?? 0;
        const profitContribution = (price - costPrice) * quantitySold;
        return { id: item.id, name: item.name, type: item.type, price, costPrice, margin: Math.round(margin * 10) / 10, quantitySold, profitContribution };
      })
      .sort((a, b) => b.profitContribution - a.profitContribution);

    const itemsWithoutCost = menuItems.filter((i) => i.costPrice == null).length;
    const totalProfitWeek = profitItems.reduce((sum, i) => sum + i.profitContribution, 0);
    const lossLeaders = profitItems.filter((i) => i.margin < 20);
    const profitData = profitItems.length > 0
      ? { items: profitItems, totalProfitWeek, topProfitItem: profitItems[0] ?? null, lossLeaders, itemsWithoutCost }
      : null;

    const chartWeek = weekBuckets.map(({ label }, i) => ({ date: label, sales: Number(weekChartResults[i]._sum.totalAmount ?? 0) }));
    const chartMonth = monthBuckets.map(({ label }, i) => ({ date: label, sales: Number(monthChartResults[i]._sum.totalAmount ?? 0) }));
    const chartYear = yearBuckets.map(({ label }, i) => ({ date: label, sales: Number(yearChartResults[i]._sum.totalAmount ?? 0) }));

    return NextResponse.json({
      success: true,
      stats: {
        salesWeekly: Number(salesAggWeek._sum.totalAmount ?? 0),
        salesMonthly: Number(salesAggMonth._sum.totalAmount ?? 0),
        salesYearly: Number(salesAggYear._sum.totalAmount ?? 0),
        timeframes: {
          week: { chartData: chartWeek, topItems },
          month: { chartData: chartMonth, topItems },
          year: { chartData: chartYear, topItems },
        },
        profitData,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
