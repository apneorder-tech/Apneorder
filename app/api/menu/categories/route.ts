import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { redis, CACHE_KEYS } from "@/lib/redis-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { MenuCategoryCreateSchema } from "@/lib/schemas";

// POST /api/menu/categories - Create a new category
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = MenuCategoryCreateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ 
                success: false, 
                error: "Invalid category data", 
                details: result.error.format() 
            }, { status: 400 });
        }

        const { restaurantId, name } = result.data;

        // 1. Verify Authentication
        const auth = await verifyManagerSession(request);
        if (!auth.authenticated) return unauthorizedResponse(auth.error);

        // 2. Verify Authorization (Does this manager own this restaurant?)
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { managerId: true }
        });

        if (!restaurant) {
            return NextResponse.json({ success: false, error: "Restaurant not found" }, { status: 404 });
        }

        if (restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
            return forbiddenResponse();
        }

        const category = await prisma.category.create({
            data: {
                restaurantId,
                name
            }
        });

        // 4. Audit Log
        const { logAction, AuditAction } = await import("@/lib/logger");
        await logAction(
            auth.uid, 
            AuditAction.CREATE_CATEGORY, 
            "Category", 
            category.id, 
            { name, restaurantId }
        );

        // 5. Invalidate Redis Cache for this restaurant
        await redis.del(CACHE_KEYS.menu(restaurantId));

        return NextResponse.json({ success: true, category });
    } catch (error: unknown) {
        console.error("Create Category Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
