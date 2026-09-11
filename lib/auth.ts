import { supabaseAdmin } from "./supabase-admin";
import { NextResponse } from "next/server";

// Fast in-memory token cache (TTL: 2 minutes)
interface CachedUser {
  uid: string;
  email?: string;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedUser>();
const TOKEN_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function getCachedUser(token: string) {
  const now = Date.now();
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > now) {
    return { user: { id: cached.uid, email: cached.email }, error: null };
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (user && !error) {
    // Prune old entries if cache grows too large
    if (tokenCache.size > 500) {
      for (const [k, v] of tokenCache.entries()) {
        if (v.expiresAt <= now) tokenCache.delete(k);
      }
    }
    tokenCache.set(token, {
      uid: user.id,
      email: user.email,
      expiresAt: now + TOKEN_CACHE_TTL_MS,
    });
  }

  return { user, error };
}

export async function verifyManagerSession(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authenticated: false, error: "Missing or invalid authorization header" };
    }

    const token = authHeader.split("Bearer ")[1];
    const { user, error } = await getCachedUser(token);

    if (error || !user) {
      return { authenticated: false, error: "Unauthorized" };
    }

    return {
      authenticated: true,
      uid: user.id,
      email: user.email,
    };
  } catch (error) {
    console.error("Auth Verification Error:", error);
    return { authenticated: false, error: "Unauthorized" };
  }
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

