import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { AddTableSchema } from "@/lib/schemas";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = AddTableSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ 
                success: false, 
                error: "Invalid table data", 
                details: result.error.format() 
            }, { status: 400 });
        }

        const { restaurantId, tableNumber } = result.data;

        // 1. Verify Authentication
        const auth = await verifyManagerSession(request);
        if (!auth.authenticated) return unauthorizedResponse(auth.error);

        // 2. Verify Authorization
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

        // 1. Validate tableNumber is a positive integer > 0
        const num = parseInt(tableNumber);
        if (isNaN(num) || num <= 0) {
            return NextResponse.json({ 
                success: false, 
                error: "Table number must be a positive number greater than 0." 
            }, { status: 400 });
        }

        // 2. Check if table number already exists for this restaurant
        const existingTable = await prisma.table.findFirst({
            where: {
                restaurantId,
                tableNumber: tableNumber.trim()
            }
        });

        if (existingTable) {
            return NextResponse.json({ 
                success: false, 
                error: `Table "${tableNumber}" already exists.` 
            }, { status: 400 });
        }

        // 2. Generate QR URL
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const origin = `${protocol}://${host}`;
        const qrCodeUrl = `${origin}/menu/${restaurantId}?table=${encodeURIComponent(tableNumber.trim())}`;

        // 2. Check Subscription & Table Limit
    const [manager, tableCount] = await Promise.all([
      prisma.manager.findUnique({
        where: { id: restaurant.managerId }, // Corrected: Use restaurant.managerId to find the manager
        include: { subscription: true }
      }),
      prisma.table.count({ where: { restaurantId } })
    ]);

    // If no active subscription and already have 3 tables, deny.
    if ((!manager?.subscription || manager.subscription.status !== "ACTIVE") && tableCount >= 3) {
      return NextResponse.json({ 
        success: false, 
        error: "Table limit reached", 
        message: "Free plan is limited to 3 tables. Upgrade to Premium for unlimited tables!" 
      }, { status: 403 });
    }

    // 3. Create the table
        const newTable = await prisma.table.create({
            data: {
                restaurantId,
                tableNumber: tableNumber.trim(),
                qrCodeUrl
            }
        });

        // 4. Audit Log
        const { logAction, AuditAction } = await import("@/lib/logger");
        await logAction(
            auth.uid, 
            AuditAction.ADD_TABLE, 
            "Table", 
            newTable.id, 
            { tableNumber: tableNumber.trim(), restaurantId }
        );

        return NextResponse.json({ success: true, table: newTable });

    } catch (error: unknown) {
        console.error("Add Table Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
