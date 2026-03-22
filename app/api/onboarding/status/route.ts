import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json({ error: "Missing managerId" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { managerId },
      include: {
        categories: {
          include: {
            menuItems: true,
          },
        },
        tables: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ 
      exists: true, 
      restaurant 
    });

  } catch (error: unknown) {
    console.error("Status Check Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
