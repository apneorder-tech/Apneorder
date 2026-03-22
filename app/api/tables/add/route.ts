import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";

export async function POST(request: Request) {
    try {
        const { restaurantId, tableNumber } = await request.json();

        if (!restaurantId || !tableNumber) {
            return NextResponse.json({ error: "Restaurant ID and Table Number are required" }, { status: 400 });
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

        // 3. Create the new table
        const newTable = await prisma.table.create({
            data: {
                restaurantId,
                tableNumber: tableNumber.trim(),
                qrCodeUrl
            }
        });

        return NextResponse.json({ success: true, table: newTable });

    } catch (error: unknown) {
        console.error("Add Table Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
