import { load } from "@cashfreepayments/cashfree-js";

const isProd = process.env.NODE_ENV === "production";
const baseUrl = isProd 
  ? "https://api.cashfree.com/pg" 
  : "https://sandbox.cashfree.com/pg";

const subBaseUrl = isProd 
  ? "https://api.cashfree.com/pg" 
  : "https://sandbox.cashfree.com/pg";

export const cashfreeConfig = {
  appId: process.env.CASHFREE_APP_ID!,
  secretKey: process.env.CASHFREE_SECRET_KEY!,
  env: isProd ? "PRODUCTION" : "SANDBOX",
};

/**
 * Creates a subscription plan on Cashfree
 */
export async function createSubscriptionPlan() {
  const response = await fetch(`${subBaseUrl}/plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": cashfreeConfig.appId,
      "x-client-secret": cashfreeConfig.secretKey,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify({
      plan_id: "MONTHLY_1499",
      plan_name: "Apneorder Monthly Premium",
      plan_type: "PERIODIC",
      plan_currency: "INR",
      plan_recurring_amount: 1499,
      plan_max_amount: 1499,
      plan_max_cycles: 120,
      plan_intervals: 1,
      plan_interval_type: "MONTH",
      plan_note: "Premium access to Apneorder Dashboard",
    }),
  });

  return await response.json();
}

/**
 * Creates a subscription session on Cashfree
 */
export async function createCashfreeSubscription({
  customerPhone,
  customerEmail,
  customerName,
  subscriptionId,
  baseUrl,
}: {
  customerPhone: string;
  customerEmail?: string;
  customerName: string;
  subscriptionId: string;
  baseUrl: string;
}) {
  const response = await fetch(`${subBaseUrl}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": cashfreeConfig.appId,
      "x-client-secret": cashfreeConfig.secretKey,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify({
      subscription_id: subscriptionId,
      plan_details: {
        plan_id: "MONTHLY_1499",
      },
      customer_details: {
        customer_phone: customerPhone,
        customer_email: customerEmail || "customer@example.com",
        customer_name: customerName,
      },
      subscription_meta: {
        return_url: `${baseUrl}/dashboard?subscription=success`,
      }
    }),
  });

  return await response.json();
}

/**
 * Fetch subscription status from v2 API
 */
export async function checkCashfreeSubscriptionV2(id: string) {
  const isProd = process.env.NEXT_PUBLIC_CASHFREE_MODE === "production";
  const baseUrl = isProd ? "https://api.cashfree.com/api/v2" : "https://test.cashfree.com/api/v2";
  
  // Try path-based fetch (common for v2)
  const url = `${baseUrl}/subscriptions/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Client-Id": process.env.CASHFREE_APP_ID!,
      "X-Client-Secret": process.env.CASHFREE_SECRET_KEY!,
    },
  });

  const result = await response.json();

  if (!response.ok || result.status !== "OK") {
    // If it fails, maybe it was a merchant subscriptionId, but we'll let the caller handle it.
    throw new Error(result.message || `Failed to fetch v2 subscription: ${result.status}`);
  }

  return result.subscription || result;
}

/**
 * Create a subscription using the stable v2 API (returns authLink)
 */
export async function createCashfreeSubscriptionV2(data: {
  subscriptionId: string;
  planId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
}) {
  const isProd = process.env.NEXT_PUBLIC_CASHFREE_MODE === "production";
  const baseUrl = isProd ? "https://api.cashfree.com/api/v2" : "https://test.cashfree.com/api/v2";

  const response = await fetch(`${baseUrl}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": process.env.CASHFREE_APP_ID!,
      "X-Client-Secret": process.env.CASHFREE_SECRET_KEY!,
    },
    body: JSON.stringify({
      subscriptionId: data.subscriptionId,
      planId: data.planId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      returnUrl: data.returnUrl
    }),
  });

  const result = await response.json();
  if (!response.ok || result.status !== "OK") {
    throw new Error(result.message || "Failed to create v2 subscription");
  }

  return result; // contains authLink
}
