import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS } from "@/lib/redis-new";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    });

    return NextResponse.json({ success: true, order });

  } catch (error: unknown) {
    console.error("Get Order Status Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { status } = await request.json();
    const { orderId } = await params;

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status !== "payment_pending" && status !== "cancelled" ? { paymentStatus: "paid" } : {}),
      },
      include: {
        restaurant: {
          select: { managerId: true, id: true }
        }
      }
    });

    // Invalidate Redis dashboard cache so refreshed pages immediately see updated orders
    if (order?.restaurant?.managerId) {
      redis.del(CACHE_KEYS.dashboard(order.restaurant.managerId)).catch(() => {});
    }

    return NextResponse.json({ success: true, order });

  } catch (error: unknown) {
    console.error("Update Order Status Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

