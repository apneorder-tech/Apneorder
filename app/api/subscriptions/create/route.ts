import { NextResponse } from "next/server";
import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";
import prisma from "@/lib/prisma-new";

import { createCashfreeSubscriptionV2, createSubscriptionPlan } from "@/lib/cashfree";

export async function POST(request: Request) {
  const authStatus = await verifyManagerSession(request);
  if (!authStatus.authenticated || !authStatus.uid) {
    return unauthorizedResponse();
  }

  try {
    const { customerName, customerEmail } = await request.json();
    const managerId = authStatus.uid;

    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host");
    const baseUrl = `${protocol}://${host}`;

    // 1. Check if manager exists
    const manager = await prisma.manager.findUnique({
      where: { id: managerId },
      include: { restaurant: true }
    });

    if (!manager) {
      return NextResponse.json({ success: false, error: "Manager not found" }, { status: 404 });
    }

    // 1.5 Avoid redundant subscriptions if already active
    const existingActiveSub = await (prisma as any).subscription.findFirst({
      where: { managerId: managerId, status: "ACTIVE" }
    });

    if (existingActiveSub) {
      return NextResponse.json({ 
        success: false, 
        error: "You already have an active subscription for this restaurant." 
      }, { status: 400 });
    }

    // 2. Create a unique subscription ID for Cashfree
    const internalSubId = `sub_${Date.now()}_${managerId.slice(-4)}`;

    // 2.5 Ensure Plan exists (Cashfree throws error if it already exists, so we ignore 409)
    await createSubscriptionPlan().catch(() => {});

    // 3. Create Subscription in Cashfree v2 (returns authLink)
    const cfResponse = await createCashfreeSubscriptionV2({
      subscriptionId: `sub_${internalSubId}_${Date.now()}`,
      planId: "MONTHLY_1499",
      customerName: customerName || manager.name || "Restaurant Manager",
      customerEmail: customerEmail || `manager_${managerId}@apneorder.com`,
      customerPhone: manager.phone || "9999999999",
      returnUrl: `${baseUrl}/dashboard?subscription=success`
    });

    if (cfResponse.status === "OK" && cfResponse.authLink) {
      // 4. Create or Update placeholder in DB
      // We save the subReferenceId (Cashfree's ID) for status polling
      await (prisma as any).subscription.upsert({
        where: { managerId: managerId },
        update: {
          cashfreeSubscriptionId: cfResponse.subReferenceId.toString(),
          status: "INACTIVE",
          currentPeriodEnd: new Date(),
        },
        create: {
          managerId: managerId,
          cashfreeSubscriptionId: cfResponse.subReferenceId.toString(),
          status: "INACTIVE",
          currentPeriodEnd: new Date(),
        }
      });

      console.log("Cashfree v2 Subscription Created:", cfResponse.authLink);

      return NextResponse.json({ 
        success: true, 
        subscriptionId: internalSubId,
        authLink: cfResponse.authLink
      });
    }

    console.log("Cashfree Response:", cfResponse);

    return NextResponse.json({ 
      success: false, 
      error: cfResponse.message || "Failed to create subscription",
      details: cfResponse
    }, { status: 500 });

  } catch (error: any) {
    console.error("Subscription Creation Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error", 
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
