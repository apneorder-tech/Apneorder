import { supabaseAdmin } from "./supabase-admin";
import { NextResponse } from "next/server";

export async function verifyManagerSession(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authenticated: false, error: "Missing or invalid authorization header" };
    }

    const token = authHeader.split("Bearer ")[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

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
