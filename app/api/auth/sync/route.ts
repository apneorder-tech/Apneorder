import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma-new";

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
      where: { id: uid },
      include: { restaurant: { select: { id: true } } }
    });

    if (!manager) {
      // 1. Check if a manager with this phone already exists (Legacy CUID)
      const legacyManager = await prisma.manager.findUnique({
        where: { phone: phone_number },
        include: { restaurant: true }
      });

      if (legacyManager) {
        // 2. MIGRATE: Atomically move data from CUID to Firebase UID
        console.log(`[Sync] Migrating legacy manager ${legacyManager.id} to Firebase UID ${uid}`);
        
        await prisma.$transaction(async (tx) => {
          // a. Change legacy manager's phone to avoid unique constraint conflict
          await tx.manager.update({
            where: { id: legacyManager.id },
            data: { phone: `${legacyManager.phone}_MIGRATED_${Date.now()}` }
          });

          // b. Create new manager with Firebase UID and actual phone
          await tx.manager.create({
            data: {
              id: uid,
              phone: phone_number,
              name: legacyManager.name,
              isVerified: true,
              createdAt: legacyManager.createdAt
            }
          });

          // c. Point Restaurant to new Manager record
          if (legacyManager.restaurant) {
            await tx.restaurant.update({
              where: { managerId: legacyManager.id },
              data: { managerId: uid }
            });
          }
          
          // d. Update Audit Logs (if any)
          await (tx as any).auditLog.updateMany({
              where: { managerId: legacyManager.id },
              data: { managerId: uid }
          });

          // e. Delete legacy record
          await tx.manager.delete({
            where: { id: legacyManager.id }
          });
        });

        // 3. Re-fetch for return
        manager = await prisma.manager.findUnique({
          where: { id: uid },
          include: { restaurant: { select: { id: true } } }
        });
      } else {
        // 4. Brand New Manager
        manager = await prisma.manager.create({
          data: {
            id: uid,
            phone: phone_number,
            isVerified: true,
          },
          include: { restaurant: { select: { id: true } } }
        });
      }
    } else {
      // 5. Existing UID Manager - just update verification/phone
      manager = await prisma.manager.update({
        where: { id: uid },
        data: { isVerified: true, phone: phone_number },
        include: { restaurant: { select: { id: true } } }
      });
    }

    return NextResponse.json({ 
      success: true, 
      managerId: manager?.id, 
      hasRestaurant: !!manager?.restaurant 
    });

  } catch (error: unknown) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
