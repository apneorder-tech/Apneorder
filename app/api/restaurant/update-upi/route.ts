import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";

export async function POST(request: Request) {
    try {
        const { restaurantId, upiId } = await request.json();

        if (!restaurantId || !upiId) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const updated = await prisma.restaurant.update({
            where: { id: restaurantId },
            data: { upiId: upiId.trim() },
        });

        return NextResponse.json({ success: true, upiId: updated.upiId });

    } catch (error: unknown) {
        console.error("Update UPI Error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
