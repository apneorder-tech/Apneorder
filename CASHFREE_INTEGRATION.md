# Cashfree Integration — ApneOrder

This document explains how Cashfree is integrated into ApneOrder, a Next.js (App Router)
restaurant SaaS. Cashfree is used for **ONE purpose only: collecting the ₹1499/month
premium subscription from restaurant owners (managers).**

> IMPORTANT: Cashfree is NOT used for customer food-order payments. Customers pay the
> restaurant directly via the restaurant's own UPI QR code (peer-to-peer, no gateway).
> Cashfree touches only the subscription (SaaS billing) flow.

---

## 1. Why PG Orders (not Payment Links or Subscriptions)

Cashfree offers three relevant products. We landed on **PG Orders** after hitting blockers:

- **Cashfree Subscriptions API** — tried first. Never activated correctly on the account
  (auth/plan issues). Abandoned. Legacy code still exists in `lib/cashfree.ts` but is unused.
- **Payment Links API** — tried second. Returned `link_creation_api is not enabled or
  approved`. Requires manual activation by Cashfree support. Abandoned.
- **PG Orders API** — always enabled by default on any Cashfree account. **This is what we use.**

So the current live flow is: create a Cashfree **Order**, open Cashfree's hosted checkout
via the JS SDK, and activate the subscription when the payment webhook fires.

---

## 2. Environment Variables

```
CASHFREE_APP_ID            server-side  — Cashfree API client id
CASHFREE_SECRET_KEY        server-side  — Cashfree API secret (also used for webhook HMAC)
CASHFREE_MODE              "production" | "sandbox" — chooses the API base URL
NEXT_PUBLIC_CASHFREE_MODE  client-side  — SDK mode (must match CASHFREE_MODE)
```

Base URL selection (`lib/cashfree.ts`):
```ts
const isCashfreeProd = (process.env.CASHFREE_MODE ?? process.env.NODE_ENV) === "production";
const baseUrl = isCashfreeProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
```

The account uses **live/production** credentials (`cfsk_ma_prod_...`), so `CASHFREE_MODE=production`.

The manager's site domain (`apneorder.com` and `www.apneorder.com`) must be **whitelisted**
in Cashfree → Developers → Whitelisting, otherwise the SDK checkout shows "domain not approved".

---

## 3. Data Model (Prisma)

The `Subscription` model (one per `Manager`):
```prisma
model Subscription {
  id                     String   @id @default(cuid())
  managerId              String   @unique
  status                 String   @default("INACTIVE") // ACTIVE | INACTIVE | PAST_DUE | CANCELED
  planId                 String   @default("MONTHLY_1499")
  currentPeriodStart     DateTime @default(now())
  currentPeriodEnd       DateTime
  cashfreeSubscriptionId String?  @unique  // REUSED to store the Cashfree ORDER ID
  ...
}
```

Key detail: `cashfreeSubscriptionId` is a legacy field name. We now store the **Cashfree
order_id** in it. This is the join key between our DB and Cashfree.

---

## 4. The Order ID Convention

Every subscription payment creates an order id of the form:
```
ao_<last 8 chars of managerId>_<timestamp>
e.g. ao_69228baa_1780940947768
```
- The `ao_` prefix lets the webhook distinguish *subscription* orders from any other order.
- The id is stored in `Subscription.cashfreeSubscriptionId` so the webhook/sync can find the manager.

---

## 5. Full Flow (step by step)

### A. Manager clicks "Upgrade to Premium"
Component: `app/dashboard/_components/SubscriptionCard.tsx` → `handleSubscribe()`

1. Gets the Supabase session token.
2. `POST /api/subscriptions/create` with `Authorization: Bearer <token>`.

### B. Server creates the Cashfree order
Route: `app/api/subscriptions/create/route.ts`

1. `verifyManagerSession()` authenticates the manager (Supabase JWT).
2. Builds `orderId = ao_<managerId tail>_<timestamp>`.
3. Calls `createCashfreeOrder()` → `POST {baseUrl}/orders` with headers
   `x-client-id`, `x-client-secret`, `x-api-version: 2023-08-01`.
   Body includes `order_id`, `order_amount: 1499`, `order_currency: INR`,
   `customer_details`, and `order_meta.return_url = /dashboard?subscription=success`.
4. Cashfree responds with a `payment_session_id`.
5. Upserts the `Subscription` row: `cashfreeSubscriptionId = orderId`, `status = INACTIVE`.
6. Returns `{ success, paymentSessionId }` to the client.

### C. Client opens the hosted checkout via the SDK
Back in `SubscriptionCard.tsx`:
```ts
const cashfree = await load({ mode: NEXT_PUBLIC_CASHFREE_MODE === "production" ? "production" : "sandbox" });
await cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
```
> NOTE: We must use the **SDK's `checkout()`** — redirecting to a raw
> `payments.cashfree.com/order/#<session>` URL fails with "client session is invalid".

Manager pays (UPI/card/netbanking) on Cashfree's page, then is redirected back to
`/dashboard?subscription=success`.

### D. Activation — two independent paths (redundant on purpose)

**Path 1 — Webhook (primary):** `app/api/webhooks/cashfree/route.ts`
- Cashfree sends `POST /api/webhooks/cashfree` with header `x-cf-signature`.
- Signature verified via HMAC-SHA256(base64) of the raw body using `CASHFREE_SECRET_KEY`.
- On event `type === "PAYMENT_SUCCESS_WEBHOOK"` with `data.payment.payment_status === "SUCCESS"`
  and `order_id` starting with `ao_`:
  - Find `Subscription` by `cashfreeSubscriptionId === order_id`.
  - Set `status = ACTIVE`, `currentPeriodEnd = nextPeriodEnd(...)` (+30 days).
- Webhook must be registered in Cashfree → Developers → Webhooks (Payment Gateway tab),
  URL `https://apneorder.com/api/webhooks/cashfree`, event = success payment.

**Path 2 — Sync polling (fallback):** `app/api/subscriptions/sync/route.ts`
- After redirect, `SubscriptionCard` polls `POST /api/subscriptions/sync` every 2s (up to ~30s).
- Sync first checks the DB — if already ACTIVE (webhook won the race), returns immediately.
- Otherwise calls `getCashfreeOrderStatus()` → `GET {baseUrl}/orders/{orderId}`.
- If `order_status === "PAID"`, sets `status = ACTIVE`, `currentPeriodEnd = +30 days`.

Whichever path fires first activates the plan; the other becomes a no-op. This guarantees
activation even if the webhook is delayed or the manager closes the tab early.

### E. Renewal
Renewing just repeats the whole flow (new order id). `nextPeriodEnd()` extends from the
**later of** now or the current expiry, so an early renewal never loses remaining days:
```ts
function nextPeriodEnd(currentEnd) {
  const base = currentEnd && currentEnd > new Date() ? currentEnd : new Date();
  const next = new Date(base); next.setMonth(next.getMonth() + 1); return next;
}
```

---

## 6. Webhook Signature — Important Nuance

The webhook route **always returns HTTP 200** to Cashfree, but only mutates the DB when the
signature is valid. Reason: Cashfree's dashboard "Test & Add" button sends a dummy payload
with no real signature; returning 401 there prevents the endpoint from being saved. So:
- Valid signature → process the event.
- Missing/invalid signature → acknowledge with 200 but do nothing.

---

## 7. Access Control (Gating Premium)

- `Subscription.status === "ACTIVE"` unlocks premium dashboard sections
  (`SubscriptionLock.tsx` / `SubscriptionCard.tsx`).
- Table creation limit: free plan (non-ACTIVE) is capped at 3 tables
  (`app/api/tables/add/route.ts`); ACTIVE = unlimited.

---

## 8. Files Involved

| File | Role |
|------|------|
| `lib/cashfree.ts` | `createCashfreeOrder`, `getCashfreeOrderStatus`, base-URL/mode logic (+ dead legacy subscription/plan/link helpers) |
| `app/api/subscriptions/create/route.ts` | Auth, create Cashfree order, upsert Subscription, return `paymentSessionId` |
| `app/api/subscriptions/sync/route.ts` | Fallback: poll Cashfree order status, activate if PAID |
| `app/api/webhooks/cashfree/route.ts` | Verify HMAC, activate on `PAYMENT_SUCCESS_WEBHOOK` (order id `ao_*`) |
| `app/dashboard/_components/SubscriptionCard.tsx` | UI, calls create, opens SDK checkout, polls sync |
| `prisma/schema.prisma` | `Subscription` model |

---

## 9. Known / Deliberate Notes for Whoever Extends This

- `lib/cashfree.ts` still contains **unused** `createSubscriptionPlan`, `createCashfreeSubscription`,
  `createCashfreeSubscriptionV2`, `checkCashfreeSubscriptionV2` and Payment-Link helpers. These are
  dead code from earlier attempts — the live path uses only `createCashfreeOrder` and
  `getCashfreeOrderStatus`. Safe to delete when cleaning up.
- The webhook also still handles `PAYMENT_LINK_EVENT` for backward compatibility — not currently used.
- `SUBSCRIPTION_AMOUNT` is hardcoded to `1499` in the create route. It was temporarily set to `1`
  for testing, then restored.
- There is no auto-debit / recurring mandate — every renewal is a manual payment. Auto-debit would
  require Cashfree's Subscriptions product to be activated on the account.
