import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/menu/categories - Create a new category
export async function POST(request: Request) {
    try {
        const { restaurantId, name } = await request.json();

        if (!restaurantId || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                restaurantId,
                name
            }
        });

        return NextResponse.json({ success: true, category });
    } catch (error: unknown) {
        console.error("Create Category Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
