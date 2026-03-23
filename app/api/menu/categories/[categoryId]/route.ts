import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS } from "@/lib/redis-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

// PATCH /api/menu/categories/[categoryId] - Rename category
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const { categoryId } = await params;
        const { name } = await request.json();

        // 1. Verify Authentication
        const auth = await verifyManagerSession(request);
        if (!auth.authenticated) return unauthorizedResponse(auth.error);

        // 2. Verify Authorization
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: { restaurant: { select: { managerId: true } } }
        });

        if (!category) return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
        if (category.restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
            return forbiddenResponse();
        }

        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: { name }
        });

        // 3. Audit Log
        const { logAction, AuditAction } = await import("@/lib/logger");
        await logAction(
            auth.uid, 
            AuditAction.UPDATE_CATEGORY, 
            "Category", 
            categoryId, 
            { name }
        );

        // 4. Invalidate Redis Cache
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

        // 1. Verify Authentication
        const auth = await verifyManagerSession(request);
        if (!auth.authenticated) return unauthorizedResponse(auth.error);

        // 2. Fetch category to get restaurantId before deletion and check auth
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: { restaurant: { select: { managerId: true } } }
        });

        if (!category) return NextResponse.json({ success: true }); // Already gone
        if (category.restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
            return forbiddenResponse();
        }

        // Note: Prisma will fail if there are dependent items and no cascade. 
        // We handle it by deleting items first or ensuring cascade in schema.
        await prisma.menuItem.deleteMany({ where: { categoryId } });
        await prisma.category.delete({ where: { id: categoryId } });

        // 3. Audit Log
        const { logAction, AuditAction } = await import("@/lib/logger");
        await logAction(
            auth.uid, 
            AuditAction.DELETE_CATEGORY, 
            "Category", 
            categoryId, 
            { restaurantId: category.restaurantId, name: category.name }
        );

        // 4. Invalidate Redis Cache
        if (category) {
            await redis.del(CACHE_KEYS.menu(category.restaurantId));
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete Category Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
