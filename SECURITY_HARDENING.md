# 🛡️ Security Hardening Report: Apneorder

This document outlines the comprehensive security measures implemented to protect the Apneorder platform against unauthorized access, data breaches, and financial fraud.

---

## 1. Authentication & Identity Management
We transitioned from unverified `managerId` passing to a robust, token-based authentication system.

- **Firebase ID Token Verification**: All sensitive API routes now require a valid Firebase ID token in the `Authorization: Bearer <token>` header.
- **Centralized Auth Helper**: Created `lib/auth.ts` which provides a `verifyManagerSession` utility. This utility decrypts the token on the server side using the Firebase Admin SDK to ensure the requester is who they claim to be.
- **Consistent Error Handling**: Standarized `401 Unauthorized` and `403 Forbidden` responses across the entire API.

## 2. Authorization & IDOR Protection
Identity is not enough; we now strictly enforce **Resource-Level Authorization**.

- **Ownership Verification**: Before any sensitive operation (updating UPI, renaming categories, deleting items), the system queries the database to confirm that the authenticated `managerId` owns the specific `restaurantId` or resource.
- **IDOR Prevention**: Insecure Direct Object Reference vulnerabilities were patched in the dashboard data and onboarding status APIs, preventing users from viewing other restaurants' data by simply changing an ID in the URL.
- **Admin Bypass**: Implemented a secure `ADMIN_UID` bypass for platform maintenance while keeping standard manager restrictions tight.

## 3. Data Integrity & Validation (Zod)
We replaced manual property checks with strict, typed schema validation using **Zod**.

- **Centralized Schemas**: Defined all API input requirements in `lib/schemas.ts`.
- **Strict Enforcement**: Every management API (Menu, Tables, Onboarding) now parses incoming requests through these schemas. This prevents:
    - Malformed data entry.
    - Unexpected field injection.
    - Type-mismatch bugs (e.g., negative prices or invalid UPI formats).

## 4. Spam & Abuse Protection
- **API Rate Limiting**: Implemented a Redis-backed rate limiter in the global Next.js middleware.
- **Targeted Protection**: The public `api/orders/create` endpoint is specifically protected to prevent automated bot spam, limited to 10 orders per minute per IP address.

## 5. Infrastructure Security
Implemented a global [middleware.ts](file:///Users/1234/Desktop/Apneorder/my-app/middleware.ts) to inject production-grade security headers into every response:

- **X-Frame-Options: DENY**: Protects against Clickjacking.
- **X-Content-Type-Options: nosniff**: Prevents MIME-type sniffing attacks.
- **Referrer-Policy**: Ensures privacy when navigating between pages.
- **Strict-Transport-Security (HSTS)**: Forces HTTPS in production environments.

## 6. Privacy & Data Minimization
Modified database queries to use explicit Prisma `.select()` statements.
- **Field Whitelisting**: We only return the specific fields the frontend needs. Internal metadata like `managerId`, `updatedAt`, and internal database IDs are filtered out of public-facing responses to minimize information disclosure.

## 7. Audit Logging (Phase 3)
We've added a tamper-resistant record of every administrative action (UPI changes, menu deletions, table additions).
- **Location**: `AuditLog` table in Prisma.
- **Scope**: Every `POST/PATCH/DELETE` operation on management routes now captures the `managerId`, `timestamp`, and specific `Json` details of the change.

## 8. Advanced Content Security Policy (Phase 3)
Implemented a strict CSP in [middleware.ts](file:///Users/1234/Desktop/Apneorder/my-app/middleware.ts) that limits where the browser can load data and scripts from.
- **Whitelisted**: Firebase, Supabase, Google Fonts.
- **Blocked**: All other untrusted third-party domains, `object-src`, and `frame-ancestors`.

## 9. Global Defensive Rate Limiting (Phase 5)
Every single `/api/` endpoint is now protected against flood attacks and brute-force attempts.
- **Global Baseline**: 60 requests per minute per IP.
- **Strict Login/Orders**: 10 requests per minute.
- **Ultra-Strict Onboarding**: 5 requests per minute.

## 10. Browser Permissions-Policy (Phase 6)
Hard-disabled risky browser APIs at the header level to prevent unauthorized script behavior if a future injection is attempted.
- **Blocked**: `camera`, `microphone`, `geolocation`, and `interest-cohort`.

## 11. Infrastructure Cloaking (Phase 5)
Disabled the `X-Powered-By` header in [next.config.ts](file:///Users/1234/Desktop/Apneorder/my-app/next.config.ts) to hide the server technology from automated scanner bots.

---

### Final Security Status

| Vulnerability | Status | Mitigation Applied |
| :--- | :--- | :--- |
| **Authentication Bypass** | ✅ Fixed | Mandatory Firebase ID Token verification. |
| **IDOR (Data Theft)** | ✅ Fixed | Strict ownership checks on every request. |
| **UPI Hijacking** | ✅ Fixed | Auth-guarded UPI update API with validation. |
| **Menu Vandalism** | ✅ Fixed | RBAC protection on all menu management routes. |
| **Request Spam** | ✅ Fixed | Global Redis-backed rate limiting. |
| **Clickjacking** | ✅ Fixed | X-Frame-Options: DENY headers. |
| **XSS / Script Injection** | ✅ Fixed | Advanced CSP + Permissions-Policy. |
| **Admin Traceability**| ✅ Fixed | Administrative Audit Logging system. |

> [!IMPORTANT]
> The security of Apneorder is now at a professional, production-grade level. Ongoing maintenance should involve regular `npm audit` and monitoring of the `AuditLog` for unusual activity.
