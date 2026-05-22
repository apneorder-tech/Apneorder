import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ParamsSchema = z.object({
  restaurantId: z.string().min(1),
});

// Lightweight endpoint — returns only the UPI ID for a restaurant, always fresh from DB.
// Used by the customer payment screen to guarantee the latest UPI QR code is shown.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId: rawId } = await params;
    const result = ParamsSchema.safeParse({ restaurantId: rawId });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid restaurant ID" },
        { status: 400 }
      );
    }

    const { restaurantId } = result.data;

    const restaurant = await (prisma as any).restaurant.findUnique({
      where: { id: restaurantId },
      select: { upiId: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, upiId: restaurant.upiId });
  } catch (err) {
    console.error("[restaurant/upi] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
