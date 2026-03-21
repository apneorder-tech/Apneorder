import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/menu/categories/[categoryId] - Rename category
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const { categoryId } = await params;
        const { name } = await request.json();

        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: { name }
        });

        return NextResponse.json({ success: true, category: updatedCategory });
    } catch (error: any) {
        console.error("Update Category Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/menu/categories/[categoryId] - Delete category and its items
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ categoryId: string }> }
) {
    try {
        const { categoryId } = await params;

        // Note: Prisma will fail if there are dependent items and no cascade. 
        // We handle it by deleting items first or ensuring cascade in schema.
        await prisma.menuItem.deleteMany({ where: { categoryId } });
        await prisma.category.delete({ where: { id: categoryId } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Category Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
