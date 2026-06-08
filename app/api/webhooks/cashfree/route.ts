import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import crypto from "crypto";

function verifySignature(payload: string, signature: string, secretKey: string): boolean {
  const generated = crypto
    .createHmac("sha256", secretKey)
    .update(payload)
    .digest("base64");
  return generated === signature;
}

/** Extend by 30 days from whichever is later — now or the current end date.
 *  Early renewals never lose days. */
function nextPeriodEnd(currentEnd: Date | null): Date {
  const base = currentEnd && currentEnd > new Date() ? currentEnd : new Date();
  const next = new Date(base);
  next.setMonth(next.getMonth() + 1);
  return next;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-cf-signature");
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    // Signature check — we always return 200 to Cashfree so the webhook endpoint
    // can be saved via the "Test & Add" button. However we only process the event
    // when the signature is present and valid. The "Test & Add" button sends a
    // dummy payload with no real signature — it will get acknowledged (200) but
    // no DB changes will happen.
    if (signature && secretKey) {
      if (!verifySignature(body, signature, secretKey)) {
        console.error("[cashfree webhook] Invalid signature — acknowledging but not processing");
        return NextResponse.json({ success: true, message: "Acknowledged" });
      }
    } else {
      // No signature — acknowledge without processing (Cashfree test button)
      console.warn("[cashfree webhook] No signature — acknowledged without processing");
      return NextResponse.json({ success: true, message: "Acknowledged" });
    }

    const payload = JSON.parse(body);
    const type: string = payload.type ?? "";
    const data = payload.data ?? {};

    console.log("[cashfree webhook] Event:", type, "link_id:", data?.link_id ?? "n/a");

    // ── Payment Link paid ──────────────────────────────────────────────────
    // Real payload structure from Cashfree:
    // {
    //   "type": "PAYMENT_LINK_EVENT",
    //   "data": {
    //     "link_id": "ao_xxx_1234567890",
    //     "link_status": "PAID",
    //     "order": { "transaction_status": "SUCCESS" }
    //   }
    // }
    // ── PG Order paid (subscription via hosted checkout) ──────────────────
    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId: string = data?.order?.order_id ?? "";
      const paymentStatus: string = data?.payment?.payment_status ?? "";

      // Only process subscription orders (our order IDs start with "ao_")
      if (paymentStatus !== "SUCCESS" || !orderId.startsWith("ao_")) {
        return NextResponse.json({ success: true, message: "Non-subscription order — ignored" });
      }

      const subscription = await (prisma as any).subscription.findFirst({
        where: { cashfreeSubscriptionId: orderId },
      });

      if (!subscription) {
        console.error("[cashfree webhook] No subscription found for order_id:", orderId);
        return NextResponse.json({ success: true, message: "Order not tracked" });
      }

      const newEnd = nextPeriodEnd(subscription.currentPeriodEnd);

      await (prisma as any).subscription.update({
        where: { id: subscription.id },
        data: { status: "ACTIVE", currentPeriodEnd: newEnd },
      });

      console.log(`[cashfree webhook] ✅ Subscription activated for manager ${subscription.managerId}. Expires: ${newEnd.toISOString()}`);
      return NextResponse.json({ success: true });
    }

    // ── Payment Link paid (kept for backward compat) ───────────────────────
    if (type === "PAYMENT_LINK_EVENT") {
      const linkId: string = data?.link_id ?? "";
      const transactionStatus: string = data?.order?.transaction_status ?? "";
      const linkStatus: string = data?.link_status ?? "";
      const isSuccess = linkStatus === "PAID" || transactionStatus === "SUCCESS";

      if (!isSuccess || !linkId) {
        return NextResponse.json({ success: true, message: "Non-success event ignored" });
      }

      const subscription = await (prisma as any).subscription.findFirst({
        where: { cashfreeSubscriptionId: linkId },
      });

      if (!subscription) {
        return NextResponse.json({ success: true, message: "Link not tracked" });
      }

      const newEnd = nextPeriodEnd(subscription.currentPeriodEnd);
      await (prisma as any).subscription.update({
        where: { id: subscription.id },
        data: { status: "ACTIVE", currentPeriodEnd: newEnd },
      });

      return NextResponse.json({ success: true });
    }

    // ── Legacy Cashfree Subscription events (backward compat) ────────────
    const subId =
      payload.subscriptionId ??
      data?.subscriptionId ??
      data?.subscription?.subscriptionId;

    if (subId) {
      const statusMap: Record<string, string> = {
        SUBSCRIPTION_ACTIVATED: "ACTIVE",
        SUB_PAYMENT_SUCCESS: "ACTIVE",
        SUBSCRIPTION_DEACTIVATED: "CANCELED",
        SUB_PAYMENT_FAILED: "PAST_DUE",
        SUBSCRIPTION_ON_HOLD: "PAST_DUE",
        SUBSCRIPTION_CANCELLED: "CANCELED",
      };

      const newStatus = statusMap[type];
      if (newStatus) {
        const sub = await (prisma as any).subscription.findFirst({
          where: { cashfreeSubscriptionId: subId },
        });
        if (sub) {
          await (prisma as any).subscription.update({
            where: { id: sub.id },
            data: {
              status: newStatus,
              ...(newStatus === "ACTIVE" && {
                currentPeriodEnd: nextPeriodEnd(sub.currentPeriodEnd),
              }),
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[cashfree webhook] Error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
