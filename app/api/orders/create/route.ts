import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { OrderCreateSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = OrderCreateSchema.safeParse(body);
    
    if (!result.success) {
        return NextResponse.json({ 
            error: "Invalid order data", 
            details: result.error.format() 
        }, { status: 400 });
    }

    const { restaurantId, tableNumber, items, transactionId, paymentMethod, customerPhone } = result.data;

    // 1. Find the table record
    const table = await prisma.table.findFirst({
        where: {
            restaurantId,
            tableNumber: tableNumber
        }
    });

    if (!table) {
        return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // 2. Calculate Total & build order items (with optional special instructions)
    let totalAmount = 0;
    const orderItemsData = [];
    for (const item of items) {
        const menuItem = await (prisma.menuItem as any).findFirst({
            where: { id: item.id, isDeleted: false }
        });
        if (menuItem) {
            const subtotal = Number(menuItem.price) * item.quantity;
            totalAmount += subtotal;
            orderItemsData.push({
                menuItemId: item.id,
                quantity: item.quantity,
                subtotal: subtotal,
                // Sanitise: trim whitespace, collapse to null if empty
                notes: item.notes?.trim() || null,
            });
        }
    }

    // 3. Mark table as occupied
    await prisma.table.update({
      where: { id: table.id },
      data: { isOccupied: true }
    });

    // 4. Create the Order
    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        restaurantId,
        totalAmount,
        status: paymentMethod === "CASH" ? "pending" : "payment_pending",
        paymentMethod: paymentMethod,
        transactionId: transactionId || null,
        customerPhone: customerPhone || null,
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
    const message = error instanceof Error ? error.message : String(error);
    console.error("Order Creation Error:", message, error);
    return NextResponse.json({ success: false, error: "Internal server error", _detail: message }, { status: 500 });
  }
}
