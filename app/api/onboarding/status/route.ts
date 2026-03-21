import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

  } catch (error: any) {
    console.error("Fetch Onboarding Status Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
