import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

// POST /api/tables/[id]/clear — mark table as free
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) return unauthorizedResponse(auth.error);

    const table = await prisma.table.findUnique({
      where: { id },
      select: { restaurant: { select: { managerId: true } }, tableNumber: true }
    });

    if (!table) return NextResponse.json({ success: false, error: "Table not found" }, { status: 404 });

    if (table.restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
      return forbiddenResponse();
    }

    await prisma.table.update({
      where: { id },
      data: { isOccupied: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clear Table Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
