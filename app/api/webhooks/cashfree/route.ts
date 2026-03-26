import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import crypto from "crypto";

// Cashfree Webhook Verification
function verifySignature(payload: string, signature: string, secretKey: string) {
  const generatedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(payload)
    .digest("base64");
  return generatedSignature === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-cf-signature");
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!signature || !secretKey) {
      return NextResponse.json({ success: false, error: "Missing signature or secret key" }, { status: 401 });
    }

    // 1. Verify Signature
    const isValid = verifySignature(body, signature, secretKey);
    if (!isValid) {
      console.error("Invalid Cashfree Webhook Signature");
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const { event, subscriptionId, status, data } = payload;
    
    // Some Cashfree versions nest data in 'data' object
    const subId = subscriptionId || data?.subscriptionId;
    const eventType = event || data?.event;

    if (!subId) {
      return NextResponse.json({ success: true, message: "No subscription ID found" });
    }

    console.log(`Processing Cashfree Webhook: ${eventType} for ${subId}`);

    // 2. Map Events to DB Updates
    const statusMap: Record<string, string> = {
      "SUBSCRIPTION_ACTIVATED": "ACTIVE",
      "SUB_PAYMENT_SUCCESS": "ACTIVE",
      "SUBSCRIPTION_DEACTIVATED": "CANCELED",
      "SUB_PAYMENT_FAILED": "PAST_DUE",
      "SUBSCRIPTION_ON_HOLD": "PAST_DUE",
      "SUBSCRIPTION_CANCELLED": "CANCELED",
    };

    const newStatus = statusMap[eventType];

    if (newStatus) {
      const updateData: any = { status: newStatus };
      
      // Update expiry if payment was successful
      if (newStatus === "ACTIVE") {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        updateData.currentPeriodEnd = nextMonth;
      }

      await prisma.subscription.update({
        where: { cashfreeSubscriptionId: subId },
        data: updateData
      });

      // Log the event
      const subscription = await prisma.subscription.findUnique({
        where: { cashfreeSubscriptionId: subId },
        select: { managerId: true }
      });

      if (subscription) {
        const { logAction, AuditAction } = await import("@/lib/logger");
        await logAction(
          subscription.managerId,
          "SUBSCRIPTION_UPDATE" as any, // Cast to any if not in enum yet
          "Subscription",
          subId,
          { event: eventType, newStatus }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cashfree Webhook Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
