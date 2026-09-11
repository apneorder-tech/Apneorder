import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis-new";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
    }

    // Check Redis cache first
    try {
      const cached = await redis.get<any>(CACHE_KEYS.menu(restaurantId));
      if (cached) {
        const cats = Array.isArray(cached) ? cached : cached.categories;
        if (Array.isArray(cats)) {
          return NextResponse.json({ success: true, menuCategories: cats });
        }
      }
    } catch {}

    const categories = await prisma.category.findMany({
      where: { restaurantId },
      include: {
        menuItems: {
          where: { isDeleted: false } as any,
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, menuCategories: categories });
  } catch (error) {
    console.error("Menu Data Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}


