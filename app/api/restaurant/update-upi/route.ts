import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        let { restaurantId, upiId } = await request.json();

        if (!restaurantId || !upiId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        upiId = upiId.trim();

        // Basic UPI ID validation
        if (!upiId.includes("@") || upiId.includes(" ")) {
            return NextResponse.json({ error: "Invalid UPI ID format" }, { status: 400 });
        }

        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: { upiId },
        });

        return NextResponse.json({ 
            success: true, 
            upiId: updatedRestaurant.upiId 
        });

    } catch (error: any) {
        console.error("Update UPI API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
