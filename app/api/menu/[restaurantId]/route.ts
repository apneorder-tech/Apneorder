import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis-new";
import { z } from "zod";

const ParamsSchema = z.object({
    restaurantId: z.string().min(1)
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId: rawId } = await params;
    const result = ParamsSchema.safeParse({ restaurantId: rawId });

    if (!result.success) {
        return NextResponse.json({ success: false, error: "Invalid Restaurant ID" }, { status: 400 });
    }

    const { restaurantId } = result.data;

    // 1. Check Redis Cache
    const cacheKey = CACHE_KEYS.menu(restaurantId);
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json({ success: true, restaurant: cachedData });
    }

    // 2. Fetch from database with explicit selection (Data Minimization)
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
          id: true,
          name: true,
          ownerName: true,
          city: true,
          address: true,
          upiId: true,
          themeColor: true,
          categories: {
              select: {
                  id: true,
                  name: true,
                  menuItems: {
                      where: { isDeleted: false } as any,
                      select: {
                          id: true,
                          name: true,
                          price: true,
                          type: true,
                          isAvailable: true
                      }
                  }
              }
          }
      }
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
