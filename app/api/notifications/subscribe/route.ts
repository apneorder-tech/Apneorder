import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse } from "@/lib/auth";
import { z } from "zod";

const SubscribeSchema = z.object({
  managerId: z.string(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
  userAgent: z.string().optional(),
});

const UnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) {
      return unauthorizedResponse(auth.error);
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = SubscribeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { managerId, subscription, userAgent } = parseResult.data;
    const effectiveManagerId = auth.uid === "ADMIN_UID" ? managerId : auth.uid;

    const saved = await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        managerId: effectiveManagerId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
        updatedAt: new Date(),
      },
      create: {
        managerId: effectiveManagerId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json({ success: true, subscriptionId: saved.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Subscribe Error:", message, error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) {
      return unauthorizedResponse(auth.error);
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = UnsubscribeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Endpoint required" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint: parseResult.data.endpoint },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Unsubscribe Error:", message, error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
