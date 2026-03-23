import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 });
    }

    const categories = await prisma.category.findMany({
      where: { restaurantId },
      include: { menuItems: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, menuCategories: categories });
  } catch (error) {
    console.error("Menu Data Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
