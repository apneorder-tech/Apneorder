import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { UpdateUpiSchema } from "@/lib/schemas";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = UpdateUpiSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ 
                success: false, 
                error: "Invalid UPI data", 
                details: result.error.format() 
            }, { status: 400 });
        }

        const { restaurantId, upiId } = result.data;

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
            return forbiddenResponse("You do not have permission to manage this restaurant");
        }

        // 3. Perform Update
        const updated = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: { upiId: upiId.trim() },
        });

        // 4. Audit Log
        const { logAction, AuditAction } = await import("@/lib/logger");
        await logAction(
            auth.uid, 
            AuditAction.UPDATE_UPI, 
            "Restaurant", 
            restaurantId, 
            { upiId: upiId.trim() }
        );

        // 5. Clear SQL/Redis Cache (Proper logic for realtime removal of old UPI)
        const { redis } = await import("@/lib/redis-new");
        const { CACHE_KEYS } = await import("@/lib/redis-new");
        await redis.del(CACHE_KEYS.menu(restaurantId));

        return NextResponse.json({ success: true, upiId: updated.upiId });

    } catch (error: unknown) {
        console.error("Update UPI Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
