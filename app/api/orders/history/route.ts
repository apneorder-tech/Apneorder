import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { ratelimit } from "@/lib/ratelimit";

/**
 * GET /api/orders/history?phone=XXXXXXXXXX&restaurantId=xxx
 * Returns the most recent completed order for a phone number at a restaurant.
 * No auth required — phone number is the identity.
 * Rate-limited per IP to prevent phone enumeration.
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

    // Validate phone: must be exactly 10 digits
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Rate limit: 10 requests per minute per IP — prevents enumeration attacks
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = await ratelimit(`order-history:${ip}`, 10, 60);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    // Find the most recent non-cancelled order from this phone at this restaurant
    const lastOrder = await prisma.order.findFirst({
      where: {
        restaurantId,
        customerPhone: phone,
        status: { notIn: ["cancelled"] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        orderItems: {
          select: {
            quantity: true,
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
                type: true,
                isAvailable: true,
                isDeleted: true,
              },
            },
          },
        },
      },
    });

    if (!lastOrder) {
      return NextResponse.json({ success: true, hasHistory: false });
    }

    // Filter out soft-deleted items, keep only items that still exist on the menu
    const items = lastOrder.orderItems
      .filter((oi) => !oi.menuItem.isDeleted)
      .map((oi) => ({
        id: oi.menuItem.id,
        name: oi.menuItem.name,
        price: Number(oi.menuItem.price),
        type: oi.menuItem.type,
        isAvailable: oi.menuItem.isAvailable,
        quantity: oi.quantity,
      }));

    if (items.length === 0) {
      return NextResponse.json({ success: true, hasHistory: false });
    }

    return NextResponse.json({
      success: true,
      hasHistory: true,
      lastOrder: {
        id: lastOrder.id,
        createdAt: lastOrder.createdAt.toISOString(),
        items,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Order History Error:", message, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
