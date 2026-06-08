import { NextResponse } from "next/server";
import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";
import prisma from "@/lib/prisma-new";
import { getCashfreePaymentLinkStatus } from "@/lib/cashfree";

function nextPeriodEnd(currentEnd: Date | null): Date {
  const base = currentEnd && currentEnd > new Date() ? currentEnd : new Date();
  const next = new Date(base);
  next.setMonth(next.getMonth() + 1);
  return next;
}

export async function POST(request: Request) {
  const auth = await verifyManagerSession(request);
  if (!auth.authenticated || !auth.uid) return unauthorizedResponse();

  try {
    const managerId = auth.uid;

    const subscription = await (prisma as any).subscription.findUnique({
      where: { managerId },
    });

    // If already active — return immediately, no need to call Cashfree
    if (subscription?.status === "ACTIVE") {
      return NextResponse.json({
        success: true,
        status: "ACTIVE",
        subscription: {
          status: "ACTIVE",
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      });
    }

    if (!subscription?.cashfreeSubscriptionId) {
      return NextResponse.json(
        { success: false, error: "No subscription session found" },
        { status: 404 }
      );
    }

    const linkId: string = subscription.cashfreeSubscriptionId;

    // Check Cashfree for the payment link status
    const linkData = await getCashfreePaymentLinkStatus(linkId);
    const linkStatus: string = linkData?.link_status ?? "";

    console.log(`[subscriptions/sync] link_id=${linkId} status=${linkStatus}`);

    if (linkStatus === "PAID") {
      const newEnd = nextPeriodEnd(subscription.currentPeriodEnd);

      await (prisma as any).subscription.update({
        where: { managerId },
        data: {
          status: "ACTIVE",
          currentPeriodEnd: newEnd,
        },
      });

      return NextResponse.json({
        success: true,
        status: "ACTIVE",
        subscription: { status: "ACTIVE", currentPeriodEnd: newEnd },
      });
    }

    // Not paid yet — return current status
    return NextResponse.json({
      success: true,
      status: subscription.status ?? "INACTIVE",
      subscription: {
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (err: any) {
    console.error("[subscriptions/sync] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to sync status" },
      { status: 502 }
    );
  }
}
