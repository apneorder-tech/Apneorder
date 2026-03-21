import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/menu/categories/[categoryId]/items - Add new item to category
export async function POST(
    request: Request,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const { categoryId } = await params;
        const { name, price, type } = await request.json();

        if (!name || !price || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newItem = await prisma.menuItem.create({
            data: {
                categoryId,
                name,
                price,
                type,
                isAvailable: true
            }
        });

        return NextResponse.json({ success: true, item: newItem });
    } catch (error: unknown) {
    console.error("Fetch Items Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
