import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS } from "@/lib/redis-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { MenuItemUpdateSchema } from "@/lib/schemas";

// PATCH /api/menu/items/[itemId] - Update price, availability, or name
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const { itemId } = await params;
        const body = await request.json();
        const result = MenuItemUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ 
                success: false, 
                error: "Invalid item data", 
                details: result.error.format() 
            }, { status: 400 });
        }

        const { name, price, isAvailable } = result.data;

        // 1. Verify Authentication
        const auth = await verifyManagerSession(request);
        if (!auth.authenticated) return unauthorizedResponse(auth.error);

        // 2. Verify Authorization
        const item = await (prisma.menuItem as any).findFirst({
            where: { id: itemId, isDeleted: false },
            include: { category: { select: { restaurant: { select: { managerId: true } } } } }
        });

        if (!item) return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        if ((item as any).category.restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
            return forbiddenResponse();
        }

        const updatedItem = await (prisma.menuItem as any).update({
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

        // 3. Audit Log
        const { logAction, AuditAction } = await import("@/lib/logger");
        await logAction(
            auth.uid, 
            AuditAction.UPDATE_ITEM, 
            "MenuItem", 
            itemId, 
            { name, price, isAvailable }
        );

        // 4. Invalidate Redis Cache
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

        // 1. Verify Authentication
        const auth = await verifyManagerSession(request);
        if (!auth.authenticated) return unauthorizedResponse(auth.error);

        // 2. Fetch to get restaurantId before deletion and check auth
        const item = await (prisma.menuItem as any).findFirst({
            where: { id: itemId, isDeleted: false },
            include: {
                category: {
                    select: { 
                        restaurantId: true,
                        restaurant: { select: { managerId: true } } 
                    }
                }
            }
        });

        if (!item) return NextResponse.json({ success: true }); // Already gone
        if ((item as any).category.restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
            return forbiddenResponse();
        }

        await (prisma.menuItem as any).update({
            where: { id: itemId },
            data: { isDeleted: true }
        });

        // 3. Audit Log
        const { logAction, AuditAction } = await import("@/lib/logger");
        await logAction(
            auth.uid, 
            AuditAction.DELETE_ITEM, 
            "MenuItem", 
            itemId, 
            { restaurantId: item.category.restaurantId, name: item.name }
        );

        // 4. Invalidate Redis Cache
        if (item) {
            await redis.del(CACHE_KEYS.menu((item as any).category.restaurantId));
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Delete Item Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
