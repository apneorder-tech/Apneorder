import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis-new";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PostSchema = z.object({
  restaurantId: z.string().min(1),
  showImages: z.boolean(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ success: false, error: "restaurantId is required" }, { status: 400 });
    }

    // Read from Redis
    const cacheKey = CACHE_KEYS.settings(restaurantId);
    const cachedSettings = await redis.get<{ showImages?: boolean }>(cacheKey);

    return NextResponse.json({
      success: true,
      settings: {
        showImages: cachedSettings?.showImages ?? true,
      },
    });
  } catch (error) {
    console.error("[restaurant/settings GET] Error:", error);
    return NextResponse.json({
      success: true,
      settings: { showImages: true },
    });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verify authentication
    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) {
      return unauthorizedResponse(auth.error);
    }

    // 2. Parse body
    const body = await request.json();
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { restaurantId, showImages } = parsed.data;

    // 3. Confirm this restaurant belongs to the authenticated manager
    const restaurant = await (prisma as any).restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, managerId: true },
    });

    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
    }

    const effectiveManagerId = auth.uid === "ADMIN_UID" ? restaurant.managerId : auth.uid;
    if (restaurant.managerId !== effectiveManagerId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // 4. Update settings in Redis
    const cacheKey = CACHE_KEYS.settings(restaurantId);
    const updatedSettings = { showImages };
    await redis.set(cacheKey, updatedSettings, { ex: CACHE_TTL.ONE_WEEK * 52 });

    // 5. Invalidate menu cache so customer menu gets updated settings immediately
    await redis.del(CACHE_KEYS.menu(restaurantId));

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("[restaurant/settings POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
