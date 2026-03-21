import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    // 1. Verify Firebase ID Token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, phone_number } = decodedToken;

    if (!phone_number) {
      return NextResponse.json({ error: "Phone number not found in token" }, { status: 400 });
    }

    // 2. Sync with Prisma Manager table
    // Try UID first, then phone.
    let manager = await prisma.manager.findUnique({
      where: { id: uid }
    });

    if (!manager) {
      manager = await prisma.manager.findUnique({
        where: { phone: phone_number }
      });
    }

    if (!manager) {
      // Create new manager with UID as primary ID
      manager = await prisma.manager.create({
        data: {
          id: uid,
          phone: phone_number,
          isVerified: true,
        }
      });
    } else {
      // Update existing record (could be ID=uid or ID=cuid)
      manager = await prisma.manager.update({
        where: { id: manager.id },
        data: { isVerified: true, phone: phone_number }
      });
    }

    return NextResponse.json({ 
      success: true, 
      managerId: manager.id, 
      hasRestaurant: false 
    });

  } catch (error: unknown) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
