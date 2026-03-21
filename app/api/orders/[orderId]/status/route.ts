import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { status } = await request.json();
    const { orderId } = await params;

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true, order });

  } catch (error: any) {
    console.error("Update Order Status Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
