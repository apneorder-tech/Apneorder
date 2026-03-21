import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { restaurantId } = await request.json();

        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
        }

        // 1. Get current tables to find the next table number
        const currentTables = await prisma.table.findMany({
            where: { restaurantId },
            orderBy: { tableNumber: 'asc' }
        });

        // Parse table numbers as integers to find the max
        const tableNumbers = currentTables.map(t => parseInt(t.tableNumber)).filter(n => !isNaN(n));
        const nextNumber = tableNumbers.length > 0 ? Math.max(...tableNumbers) + 1 : 1;
        const newTableNumber = nextNumber.toString();

        // 2. Generate QR URL
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        const origin = `${protocol}://${host}`;
        const qrCodeUrl = `${origin}/menu/${restaurantId}?table=${newTableNumber}`;

        // 3. Create the new table
        const newTable = await prisma.table.create({
            data: {
                restaurantId,
                tableNumber: newTableNumber,
                qrCodeUrl
            }
        });

        return NextResponse.json({ success: true, table: newTable });

    } catch (error: unknown) {
        console.error("Add Table Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
