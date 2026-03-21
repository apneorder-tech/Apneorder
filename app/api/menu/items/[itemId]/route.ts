import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/menu/items/[itemId] - Update price, availability, or name
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const { itemId } = await params;
        const { name, price, isAvailable } = await request.json();

        const updatedItem = await prisma.menuItem.update({
            where: { id: itemId },
            data: {
                ...(name && { name }),
                ...(price !== undefined && { price }),
                ...(isAvailable !== undefined && { isAvailable }),
            }
        });

        return NextResponse.json({ success: true, item: updatedItem });
    } catch (error: unknown) {
        console.error("Update Item Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/menu/items/[itemId]
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const { itemId } = await params;
        await prisma.menuItem.delete({
            where: { id: itemId }
        });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete Item Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
