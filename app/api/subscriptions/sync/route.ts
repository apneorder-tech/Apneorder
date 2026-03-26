// Last Sync: 2026-03-26T20:37:00
import { NextResponse } from "next/server";
import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";
import prisma from "@/lib/prisma-new";
import { checkCashfreeSubscriptionV2 } from "@/lib/cashfree";

export async function POST(request: Request) {
  const authStatus = await verifyManagerSession(request);
  if (!authStatus.authenticated || !authStatus.uid) {
    return unauthorizedResponse();
  }

  try {
    const managerId = authStatus.uid;

    // 1. Get current subscription from DB
    const subscription = await (prisma as any).subscription.findUnique({
      where: { managerId }
    });

    if (!subscription || !subscription.cashfreeSubscriptionId) {
      return NextResponse.json({ success: false, error: "No subscription session found" }, { status: 404 });
    }

    // 2. Fetch latest status from Cashfree
    // Guard: Legacy IDs (starting with sub_) cannot be fetched via v2 path
    if (subscription.cashfreeSubscriptionId.startsWith("sub_")) {
       return NextResponse.json({ 
         success: false, 
         error: "Legacy Payment Format",
         message: "This record uses an old ID format. Please click 'Upgrade to Premium' again to start a modern session."
       }, { status: 400 });
    }

    console.log("Syncing subscription status for:", subscription.cashfreeSubscriptionId);
    const cfSub = await checkCashfreeSubscriptionV2(subscription.cashfreeSubscriptionId);

    // 3. Update DB if status changed
    // Cashfree v2 statuses: INITIALIZED, ACTIVE, ON_HOLD, DEACTIVATED, CANCELLED
    const statusMap: Record<string, string> = {
      "ACTIVE": "ACTIVE",
      "INITIALIZED": "INACTIVE",
      "ON_HOLD": "PAST_DUE",
      "DEACTIVATED": "CANCELED",
      "CANCELLED": "CANCELED"
    };

    const newStatus = statusMap[cfSub.status] || "INACTIVE";

    if (newStatus !== subscription.status) {
      const updateData: any = { status: newStatus };
      
      if (newStatus === "ACTIVE") {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        updateData.currentPeriodEnd = nextMonth;
      }

      await (prisma as any).subscription.update({
        where: { managerId },
        data: updateData
      });

      console.log(`Updated subscription status to ${newStatus} for ${managerId}`);
    }

    return NextResponse.json({ 
      success: true, 
      status: newStatus,
      subscription: {
        status: newStatus,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    });

  } catch (error: any) {
    console.error("Subscription Sync Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || "Failed to reach Cashfree" 
    }, { status: 502 }); // Bad Gateway for external API failure
  }
}
