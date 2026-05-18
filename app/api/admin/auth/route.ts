import { NextResponse } from "next/server";
import { createAdminToken, adminCookieName } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { password } = body;

  const secret = process.env.ADMIN_SECRET;
  if (!secret || !password || password !== secret) {
    // Fixed delay to prevent timing attacks
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = createAdminToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(adminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}
