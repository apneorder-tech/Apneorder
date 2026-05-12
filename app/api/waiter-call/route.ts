import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { WaiterCallSchema } from "@/lib/schemas";
import { ratelimit } from "@/lib/ratelimit";
import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";

/**
 * POST /api/waiter-call
 * Called by the customer to request waiter assistance.
 * No auth required — rate-limited per restaurant+table (1 call per 2 minutes).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = WaiterCallSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: result.error.format() },
        { status: 400 }
      );
    }

    const { restaurantId, tableNumber } = result.data;

    // Rate limit: max 1 call per table per 2 minutes
    const rl = await ratelimit(`waiter-call:${restaurantId}:${tableNumber}`, 1, 120);
    if (!rl.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Please wait before calling the waiter again.",
          cooldownSeconds: 120,
        },
        { status: 429 }
      );
    }

    // Verify the restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });
    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    const waiterCall = await (prisma as any).waiterCall.create({
      data: { restaurantId, tableNumber },
      select: {
        id: true,
        restaurantId: true,
        tableNumber: true,
        isAcknowledged: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, waiterCall });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Waiter Call POST Error:", message, error);
    return NextResponse.json(
      { success: false, error: "Internal server error", _detail: message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/waiter-call?restaurantId=xxx
 * Fetch all unacknowledged waiter calls for a restaurant.
 * Requires manager auth — used as polling fallback in the dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) return unauthorizedResponse(auth.error);

    const restaurantId = request.nextUrl.searchParams.get("restaurantId");
    if (!restaurantId) {
      return NextResponse.json({ success: false, error: "restaurantId required" }, { status: 400 });
    }

    const waiterCalls = await (prisma as any).waiterCall.findMany({
      where: { restaurantId, isAcknowledged: false },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        restaurantId: true,
        tableNumber: true,
        isAcknowledged: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, waiterCalls });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Waiter Call GET Error:", message, error);
    return NextResponse.json(
      { success: false, error: "Internal server error", _detail: message },
      { status: 500 }
    );
  }
}
