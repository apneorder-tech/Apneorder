import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json({ error: "Missing managerId" }, { status: 400 });
    }

    // 1. Verify Authentication
    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) return unauthorizedResponse(auth.error);

    // 2. Verify Authorization
    if (auth.uid !== managerId && auth.uid !== "ADMIN_UID") {
        return forbiddenResponse();
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { managerId },
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
               select: {
                   id: true,
                   name: true,
                   price: true,
                   type: true,
                   isAvailable: true
               }
            },
          },
        },
        tables: {
            select: {
                id: true,
                tableNumber: true
            }
        },
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
