import { NextResponse } from "next/server";
import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";
import prisma from "@/lib/prisma-new";
import { createCashfreePaymentLink } from "@/lib/cashfree";

const SUBSCRIPTION_AMOUNT = 1499;

export async function POST(request: Request) {
  const auth = await verifyManagerSession(request);
  if (!auth.authenticated || !auth.uid) return unauthorizedResponse();

  try {
    const managerId = auth.uid;

    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host");
    const returnUrl = `${protocol}://${host}/dashboard?subscription=success`;

    // Get manager info for customer details
    const manager = await (prisma as any).manager.findUnique({
      where: { id: managerId },
      select: { name: true, phone: true, email: true },
    });

    if (!manager) {
      return NextResponse.json({ success: false, error: "Manager not found" }, { status: 404 });
    }

    // Unique link ID — stored in DB to identify the manager when webhook fires
    // Format: ao_<8-char managerId tail>_<timestamp>
    const linkId = `ao_${managerId.slice(-8)}_${Date.now()}`;

    // Create the payment link on Cashfree
    const cfRes = await createCashfreePaymentLink({
      linkId,
      amount: SUBSCRIPTION_AMOUNT,
      customerPhone: manager.phone || "9999999999",
      customerEmail: manager.email || `mgr_${managerId}@apneorder.com`,
      customerName: manager.name || "Restaurant Manager",
      returnUrl,
    });

    if (!cfRes.link_url) {
      console.error("[subscriptions/create] Cashfree error:", cfRes);
      return NextResponse.json(
        { success: false, error: cfRes.message || "Failed to create payment link", details: cfRes },
        { status: 500 }
      );
    }

    // Persist the link_id so the webhook and sync routes can look up this manager
    await (prisma as any).subscription.upsert({
      where: { managerId },
      update: {
        cashfreeSubscriptionId: linkId,
        status: "INACTIVE",
      },
      create: {
        managerId,
        cashfreeSubscriptionId: linkId,
        status: "INACTIVE",
        currentPeriodEnd: new Date(),
      },
    });

    // Return authLink — same field SubscriptionCard already expects
    return NextResponse.json({ success: true, authLink: cfRes.link_url });
  } catch (err: any) {
    console.error("[subscriptions/create] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error", details: err?.message },
      { status: 500 }
    );
  }
}
