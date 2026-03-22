import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";

export async function POST(request: Request) {
  try {
    const { restaurantId, tableNumber, items, transactionId, paymentMethod = "ONLINE" } = await request.json();

    // 1. Find the table record
    const table = await prisma.table.findFirst({
        where: {
            restaurantId,
            tableNumber: tableNumber.toString()
        }
    });

    if (!table) {
        return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // 2. Calculate Total
    let totalAmount = 0;
    const orderItemsData = [];
    for (const item of items) {
        const menuItem = await prisma.menuItem.findUnique({ where: { id: item.id } });
        if (menuItem) {
            const subtotal = Number(menuItem.price) * item.quantity;
            totalAmount += subtotal;
            orderItemsData.push({
                menuItemId: item.id,
                quantity: item.quantity,
                subtotal: subtotal
            });
        }
    }

    // 3. Create the Order
    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        restaurantId,
        totalAmount,
        status: paymentMethod === "CASH" ? "pending" : "payment_pending",
        paymentMethod: paymentMethod,
        transactionId: transactionId || null,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
          orderItems: {
              include: {
                  menuItem: true
              }
          },
          table: true
      }
    });

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: unknown) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
