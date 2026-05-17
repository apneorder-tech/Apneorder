import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS } from "@/lib/redis-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

// Helper: fetch item with ownership info
async function getItemWithOwner(itemId: string) {
    return (prisma.menuItem as any).findFirst({
        where: { id: itemId, isDeleted: false },
        include: {
            category: {
                select: {
                    restaurantId: true,
                    restaurant: { select: { managerId: true } },
                },
            },
        },
    });
}

// POST /api/menu/items/[itemId]/image — set imageUrl
export async function POST(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const { itemId } = await params;

        // 1. Verify Authentication
        const auth = await verifyManagerSession(request);
        if (!auth.authenticated) return unauthorizedResponse(auth.error);

        // 2. Parse body
        const body = await request.json();
        const { imageUrl } = body as { imageUrl?: string };
        if (!imageUrl || typeof imageUrl !== "string") {
            return NextResponse.json({ success: false, error: "imageUrl is required" }, { status: 400 });
        }

        // 3. Verify Authorization
        const item = await getItemWithOwner(itemId);
        if (!item) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }
        if (item.category.restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
            return forbiddenResponse();
        }

        // 4. Update imageUrl in DB
        await (prisma.menuItem as any).update({
            where: { id: itemId },
            data: { imageUrl },
        });

        // 5. Invalidate Redis cache
        await redis.del(CACHE_KEYS.menu(item.category.restaurantId));

        return NextResponse.json({ success: true, imageUrl });
    } catch (error: unknown) {
        console.error("Image Upload Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/menu/items/[itemId]/image — clear imageUrl
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ itemId: string }> }
) {
    try {
        const { itemId } = await params;

        // 1. Verify Authentication
        const auth = await verifyManagerSession(request);
        if (!auth.authenticated) return unauthorizedResponse(auth.error);

        // 2. Verify Authorization
        const item = await getItemWithOwner(itemId);
        if (!item) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }
        if (item.category.restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
            return forbiddenResponse();
        }

        // 3. Clear imageUrl in DB
        await (prisma.menuItem as any).update({
            where: { id: itemId },
            data: { imageUrl: null },
        });

        // 4. Invalidate Redis cache
        await redis.del(CACHE_KEYS.menu(item.category.restaurantId));

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("Image Delete Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
