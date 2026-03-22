import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS } from "@/lib/redis-new";

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
            },
            include: {
                category: {
                    select: { restaurantId: true }
                }
            }
        });

        // Invalidate Redis Cache
        await redis.del(CACHE_KEYS.menu(updatedItem.category.restaurantId));

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

        // Fetch to get restaurantId before deletion
        const item = await prisma.menuItem.findUnique({
            where: { id: itemId },
            include: {
                category: {
                    select: { restaurantId: true }
                }
            }
        });

        await prisma.menuItem.delete({
            where: { id: itemId }
        });

        // Invalidate Redis Cache
        if (item) {
            await redis.del(CACHE_KEYS.menu(item.category.restaurantId));
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete Item Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
