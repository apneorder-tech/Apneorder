import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ratelimit } from "@/lib/ratelimit";

export async function proxy(request: NextRequest) {
    const response = NextResponse.next();

    // 1. Add Security Headers
    // response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    
    if (process.env.NODE_ENV === "production") {
        response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }

    // Add Permissions Policy (Disables risky browser APIs by default)
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

    // 2. Content Security Policy (Advanced Fortification)
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.supabase.co https://*.cashfree.com https://js.sentry-cdn.com;
        connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.cashfree.com https://js.sentry-cdn.com;
        img-src 'self' blob: data: https://*.supabase.co https://api.qrserver.com https://*.cashfree.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.cashfree.com;
        font-src 'self' https://fonts.gstatic.com https://*.cashfree.com;
        media-src 'self' https://assets.mixkit.co;
        frame-src 'self' https://*.cashfree.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self' https://*.cashfree.com;
        frame-ancestors 'self';
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set("Content-Security-Policy", cspHeader);

    // 3. Global & Specific Rate Limiting
    const pathname = request.nextUrl.pathname;
    const isApi = pathname.startsWith("/api/");
    
    if (isApi) {
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const clientIp = ip.split(',')[0];
        
        let limit = 120; // Baseline: 120 requests per minute for any API (2 per second)
        let duration = 60;

        if (pathname.startsWith("/api/orders/create")) {
            limit = 20; // Allow a few more orders
        } else if (pathname.startsWith("/api/menu/")) {
            limit = 60; // Standard menu limit
        } else if (pathname.startsWith("/api/onboarding/save")) {
            limit = 10; // Onboarding should be rare
        } else if (pathname.startsWith("/api/auth/sync")) {
            limit = 30; // More lenient for sync to avoid false positives during auth-state changes
        }

        const res = await ratelimit(clientIp, limit, duration);

        if (!res.success) {
            return new NextResponse(
                JSON.stringify({ 
                    error: "Too many requests", 
                    message: "Please wait a moment before trying again." 
                }),
                { 
                    status: 429, 
                    headers: { "Content-Type": "application/json" } 
                }
            );
        }
    }

    return response;
}

// Ensure middleware runs for API and specific routes
export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
