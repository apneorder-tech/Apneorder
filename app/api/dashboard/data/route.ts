import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { managerId },
      include: {
        tables: {
          include: {
            orders: {
              where: {
                status: {
                  notIn: ["completed", "cancelled"]
                }
              },
              include: {
                orderItems: {
                  include: {
                    menuItem: true
                  }
                },
                table: true
              },
              orderBy: {
                  createdAt: 'desc'
              }
            }
          }
        }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // 1. Get Today's Start
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Fetch Stats
    // Total Sale Today
    const completedOrdersToday = await prisma.order.findMany({
      where: {
        table: { restaurantId: restaurant.id },
        status: "completed",
        createdAt: { gte: today }
      }
    });
    const totalSaleToday = completedOrdersToday.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);

    // Prepared Today (Ready + Completed)
    const preparedTodayCount = await prisma.order.count({
      where: {
        table: { restaurantId: restaurant.id },
        status: { in: ["ready", "completed"] },
        createdAt: { gte: today }
      }
    });

    // Tables Stats
    const totalTables = restaurant.tables.length;
    const activeTablesCount = restaurant.tables.filter((t: any) => t.orders.length > 0).length;

    // Flatten all active orders from all tables
    const activeOrders = restaurant.tables.flatMap((t: any) => t.orders);

    return NextResponse.json({ 
      success: true, 
      orders: activeOrders,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      stats: {
        totalSaleToday,
        preparedTodayCount,
        tablesFilled: `${activeTablesCount}/${totalTables}`,
        activeOrdersCount: activeOrders.length
      },
      tables: restaurant.tables.map(t => ({
          id: t.id,
          tableNumber: t.tableNumber,
          qrCodeUrl: t.qrCodeUrl
      }))
    });

  } catch (error: any) {
    console.error("Fetch Dashboard Data Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
