import { adminAuth } from "./firebaseAdmin";
import { NextResponse } from "next/server";

export async function verifyManagerSession(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authenticated: false, error: "Missing or invalid authorization header" };
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    return { 
      authenticated: true, 
      uid: decodedToken.uid,
      phoneNumber: decodedToken.phone_number 
    };
  } catch (error) {
    console.error("Auth Verification Error:", error);
    return { authenticated: false, error: "Unauthorized" };
  }
}

/**
 * Helper to wrap common 401 response for API routes
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

/**
 * Helper for 403 Forbidden (Authenticated but not authorized for this resource)
 */
export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}
