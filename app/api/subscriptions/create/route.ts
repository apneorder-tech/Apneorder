import { NextResponse } from "next/server";
import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";
import prisma from "@/lib/prisma-new";
import { createCashfreeOrder } from "@/lib/cashfree";

const SUBSCRIPTION_AMOUNT = 1499;

// Cashfree hosted checkout URL — redirect manager here after order creation
const cashfreeCheckoutBase = process.env.NODE_ENV === "production"
  ? "https://payments.cashfree.com/order"
  : "https://payments-test.cashfree.com/order";

export async function POST(request: Request) {
  const auth = await verifyManagerSession(request);
  if (!auth.authenticated || !auth.uid) return unauthorizedResponse();

  try {
    const managerId = auth.uid;

    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host");
    const returnUrl = `${protocol}://${host}/dashboard?subscription=success`;

    const manager = await (prisma as any).manager.findUnique({
      where: { id: managerId },
      select: { name: true, phone: true, email: true },
    });

    if (!manager) {
      return NextResponse.json({ success: false, error: "Manager not found" }, { status: 404 });
    }

    // order_id stored in DB — used by webhook + sync to identify which manager paid
    // Format: ao_<8-char managerId tail>_<timestamp>
    const orderId = `ao_${managerId.slice(-8)}_${Date.now()}`;

    const cfRes = await createCashfreeOrder({
      orderId,
      amount: SUBSCRIPTION_AMOUNT,
      customerPhone: manager.phone || "9999999999",
      customerEmail: manager.email || `mgr_${managerId}@apneorder.com`,
      customerName: manager.name || "Restaurant Manager",
      customerId: managerId.slice(-20), // Cashfree customer_id max 50 chars
      returnUrl,
    });

    if (!cfRes.payment_session_id) {
      console.error("[subscriptions/create] Cashfree error:", cfRes);
      return NextResponse.json(
        { success: false, error: cfRes.message || "Failed to create payment order", details: cfRes },
        { status: 500 }
      );
    }

    // Save order_id so webhook/sync can find this manager
    await (prisma as any).subscription.upsert({
      where: { managerId },
      update: {
        cashfreeSubscriptionId: orderId,
        status: "INACTIVE",
      },
      create: {
        managerId,
        cashfreeSubscriptionId: orderId,
        status: "INACTIVE",
        currentPeriodEnd: new Date(),
      },
    });

    // Redirect manager to Cashfree hosted checkout
    const authLink = `${cashfreeCheckoutBase}/#${cfRes.payment_session_id}`;

    return NextResponse.json({ success: true, authLink });
  } catch (err: any) {
    console.error("[subscriptions/create] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error", details: err?.message },
      { status: 500 }
    );
  }
}
