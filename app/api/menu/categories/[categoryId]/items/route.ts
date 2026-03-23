import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS } from "@/lib/redis-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { MenuItemCreateSchema } from "@/lib/schemas";

// POST /api/menu/categories/[categoryId]/items - Add new item to category
export async function POST(
    request: Request,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const { categoryId } = await params;
        const body = await request.json();
        const result = MenuItemCreateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ 
                success: false, 
                error: "Invalid item data", 
                details: result.error.format() 
            }, { status: 400 });
        }

        const { name, price, type } = result.data;

        // 1. Verify Authentication
        const auth = await verifyManagerSession(request);
        if (!auth.authenticated) return unauthorizedResponse(auth.error);

        // 2. Verify Authorization (Does this manager own the restaurant of this category?)
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: { restaurant: { select: { managerId: true } } }
        });

        if (!category) {
            return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
        }

        if (category.restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
            return forbiddenResponse();
        }

        const newItem = await prisma.menuItem.create({
            data: {
                categoryId,
                name,
                price,
                type,
                isAvailable: true
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
            AuditAction.CREATE_ITEM, 
            "MenuItem", 
            newItem.id, 
            { name, price, type, categoryId }
        );

        // 4. Invalidate Redis Cache
        await redis.del(CACHE_KEYS.menu(newItem.category.restaurantId));

        return NextResponse.json({ success: true, item: newItem });
    } catch (error: unknown) {
    console.error("Fetch Items Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
