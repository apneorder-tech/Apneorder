import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis-new";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params;

    // 1. Check Redis Cache
    const cacheKey = CACHE_KEYS.menu(restaurantId);
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log(`[Redis] Cache Hit: ${cacheKey}`);
      return NextResponse.json({ success: true, restaurant: cachedData });
    }

    console.log(`[Redis] Cache Miss: ${cacheKey}`);

    // 2. Fetch from database if cache miss
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        categories: {
          include: {
            menuItems: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // 3. Store in Redis for future requests (1 hour TTL)
    await redis.set(cacheKey, restaurant, { ex: CACHE_TTL.ONE_HOUR });

    return NextResponse.json({ success: true, restaurant });

  } catch (error: unknown) {
    console.error("Menu Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
