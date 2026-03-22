import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Define Today's Start
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Fetch everything SEQUENTIALLY to prevent connection pool exhaustion (MaxClientsInSessionMode)
    const restaurant = await prisma.restaurant.findUnique({
      where: { managerId },
      select: {
        id: true,
        name: true,
        upiId: true,
        themeColor: true,
        categories: {
          include: {
            menuItems: true
          }
        },
        tables: {
          select: {
            id: true,
            tableNumber: true,
            qrCodeUrl: true,
            orders: {
              where: {
                status: {
                  notIn: ["cancelled"]
                },
                OR: [
                  { status: { notIn: ["completed"] } },
                  { 
                    status: "completed",
                    createdAt: { gte: today }
                  }
                ]
              },
              include: {
                orderItems: {
                  include: {
                    menuItem: {
                      select: {
                        name: true,
                        type: true
                      }
                    }
                  }
                },
                table: {
                  select: {
                    tableNumber: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    });

    const completedOrdersToday = await prisma.order.findMany({
      where: {
        table: { restaurant: { managerId } },
        status: "completed",
        createdAt: { gte: today }
      },
      select: {
        totalAmount: true
      }
    });

    const preparedTodayCount = await prisma.order.count({
      where: {
        table: { restaurant: { managerId } },
        status: { in: ["ready", "completed"] },
        createdAt: { gte: today }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // 3. Process data
    const totalSaleToday = completedOrdersToday.reduce((sum, o) => sum + Number(o.totalAmount.toString()), 0);
    const activeOrders = restaurant.tables.flatMap(t => t.orders);
    const activeTablesCount = restaurant.tables.filter(t => t.orders.length > 0).length;

    return NextResponse.json({ 
      success: true, 
      orders: activeOrders,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      upiId: restaurant.upiId,
      menuCategories: restaurant.categories,
      stats: {
        totalSaleToday,
        preparedTodayCount,
        tablesFilled: `${activeTablesCount}/${restaurant.tables.length}`,
        activeOrdersCount: activeOrders.length
      },
      tables: restaurant.tables.map(t => ({
          id: t.id,
          tableNumber: t.tableNumber,
          qrCodeUrl: t.qrCodeUrl
      }))
    });

  } catch (error: unknown) {
    console.error("Dashboard Data Optimization Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
