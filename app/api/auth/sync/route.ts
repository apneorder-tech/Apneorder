import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import prisma from "@/lib/prisma-new";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id: uid, email } = user;

    // Upsert Manager record — id = Supabase UUID
    let manager = await prisma.manager.findUnique({
      where: { id: uid },
      include: { restaurant: { select: { id: true } } },
    });

    if (!manager) {
      manager = await prisma.manager.create({
        data: {
          id: uid,
          email: email ?? null,
          isVerified: true,
        },
        include: { restaurant: { select: { id: true } } },
      });
    } else {
      manager = await prisma.manager.update({
        where: { id: uid },
        data: { isVerified: true, email: email ?? undefined },
        include: { restaurant: { select: { id: true } } },
      });
    }

    return NextResponse.json({
      success: true,
      managerId: manager.id,
      hasRestaurant: !!manager.restaurant,
    });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
