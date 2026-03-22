import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS } from "@/lib/redis-new";

// PATCH /api/menu/categories/[categoryId] - Rename category
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const { categoryId } = await params;
        const { name } = await request.json();

        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: { name }
        });

        // Invalidate Redis Cache
        await redis.del(CACHE_KEYS.menu(updatedCategory.restaurantId));

        return NextResponse.json({ success: true, category: updatedCategory });
    } catch (error: unknown) {
        console.error("Update Category Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/menu/categories/[categoryId] - Delete category and its items
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const { categoryId } = await params;

        // Fetch category to get restaurantId before deletion
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: { restaurantId: true }
        });

        // Note: Prisma will fail if there are dependent items and no cascade. 
        // We handle it by deleting items first or ensuring cascade in schema.
        await prisma.menuItem.deleteMany({ where: { categoryId } });
        await prisma.category.delete({ where: { id: categoryId } });

        // Invalidate Redis Cache
        if (category) {
            await redis.del(CACHE_KEYS.menu(category.restaurantId));
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete Category Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
