import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";

/**
 * PATCH /api/waiter-call/[id]/acknowledge
 * Manager marks a waiter call as acknowledged (dismissed).
 * Requires Firebase manager auth.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) return unauthorizedResponse(auth.error);

    const { id } = await params;

    // Find the call and verify it belongs to this manager's restaurant
    const waiterCall = await (prisma as any).waiterCall.findUnique({
      where: { id },
      select: {
        id: true,
        restaurant: { select: { managerId: true } },
      },
    });

    if (!waiterCall) {
      return NextResponse.json({ success: false, error: "Waiter call not found" }, { status: 404 });
    }

    if (waiterCall.restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await (prisma as any).waiterCall.update({
      where: { id },
      data: { isAcknowledged: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Waiter Call Acknowledge Error:", message, error);
    return NextResponse.json(
      { success: false, error: "Internal server error", _detail: message },
      { status: 500 }
    );
  }
}
