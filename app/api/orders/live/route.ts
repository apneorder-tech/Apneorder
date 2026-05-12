import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { ratelimit } from "@/lib/ratelimit";

/**
 * GET /api/orders/live?phone=XXXXXXXXXX&restaurantId=xxx
 * Returns active orders for a phone number at a restaurant (last 6 hours).
 * No auth required — phone number is the identity.
 * Rate-limited per IP.
 */
export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get("phone");
    const restaurantId = request.nextUrl.searchParams.get("restaurantId");

    if (!phone || !restaurantId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = await ratelimit(`order-live:${ip}`, 20, 60);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        customerPhone: phone,
        createdAt: { gte: sixHoursAgo },
        status: { notIn: ["cancelled"] },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        paymentMethod: true,
        createdAt: true,
        table: {
          select: { tableNumber: true },
        },
        orderItems: {
          select: {
            quantity: true,
            menuItem: {
              select: {
                name: true,
                price: true,
                type: true,
              },
            },
          },
        },
      },
    });

    const result = orders.map((o) => ({
      id: o.id,
      status: o.status,
      tableNumber: o.table.tableNumber,
      totalAmount: Number(o.totalAmount),
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt.toISOString(),
      items: o.orderItems.map((oi) => ({
        name: oi.menuItem.name,
        price: Number(oi.menuItem.price),
        type: oi.menuItem.type,
        quantity: oi.quantity,
      })),
    }));

    return NextResponse.json({ success: true, orders: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Live Orders Error:", message, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
