import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";
import { redis, CACHE_KEYS } from "@/lib/redis-new";
import { z } from "zod";

const BodySchema = z.object({
  restaurantId: z.string().min(1),
  upiId: z
    .string()
    .min(3)
    .max(50)
    .refine((v) => v.includes("@"), { message: "Invalid UPI ID format" }),
});

export async function POST(request: Request) {
  try {
    // 1. Verify authentication
    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) {
      return unauthorizedResponse(auth.error);
    }

    // 2. Parse & validate body
    const body = await request.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { restaurantId, upiId } = parsed.data;

    // 3. Confirm this restaurant belongs to the authenticated manager
    const restaurant = await (prisma as any).restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, managerId: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const effectiveManagerId =
      auth.uid === "ADMIN_UID" ? restaurant.managerId : auth.uid;

    if (restaurant.managerId !== effectiveManagerId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // 4. Update UPI ID in the database
    const updated = await (prisma as any).restaurant.update({
      where: { id: restaurantId },
      data: { upiId: upiId.trim() },
      select: { upiId: true },
    });

    // 5. Bust the menu Redis cache so customers immediately get the new UPI QR
    await redis.del(CACHE_KEYS.menu(restaurantId));

    return NextResponse.json({ success: true, upiId: updated.upiId });
  } catch (err) {
    console.error("[update-upi] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
