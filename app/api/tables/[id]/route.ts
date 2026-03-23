import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verify Authentication
    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) return unauthorizedResponse(auth.error);

    // 2. Fetch table to verify ownership
    const table = await prisma.table.findUnique({
        where: { id },
        select: { restaurant: { select: { id: true, managerId: true } }, tableNumber: true }
    });

    if (!table) return NextResponse.json({ success: true }); // Already gone

    // 3. Verify Authorization
    if (table.restaurant.managerId !== auth.uid && auth.uid !== "ADMIN_UID") {
        return forbiddenResponse();
    }

    const restaurantId = table.restaurant.id;

    // 4. Check for active orders (payment_pending, placed, preparing, ready)
    const activeOrdersCount = await prisma.order.count({
      where: {
        tableId: id,
        status: {
          in: ["payment_pending", "placed", "preparing", "ready"]
        }
      }
    });

    if (activeOrdersCount > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot delete table with active orders. Please complete or cancel them first." 
      }, { status: 400 });
    }

    // 2. Cascading Delete in a Transaction
    await prisma.$transaction(async (tx) => {
      // a. Find all orders for this table
      const tableOrders = await tx.order.findMany({
        where: { tableId: id },
        select: { id: true }
      });
      const orderIds = tableOrders.map(o => o.id);

      // b. Delete OrderItems for these orders
      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } }
        });
      }

      // c. Delete Orders for this table
      await tx.order.deleteMany({
        where: { tableId: id }
      });

      // d. Finally delete the table
      await tx.table.delete({
        where: { id }
      });
    });

    // 4. Audit Log
    const { logAction, AuditAction } = await import("@/lib/logger");
    await logAction(
        auth.uid, 
        AuditAction.DELETE_TABLE, 
        "Table", 
        id, 
        { restaurantId, tableNumber: table.tableNumber }
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Delete Table Error:", error);
    
    // Check for Prisma foreign key constraint error (P2003)
    if (error.code === 'P2003') {
        return NextResponse.json({ 
            success: false, 
            error: "Cannot delete table because it has associated order history. Please contact support to archive this table." 
        }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
