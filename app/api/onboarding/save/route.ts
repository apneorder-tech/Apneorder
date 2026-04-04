import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-new";
import { verifyManagerSession, unauthorizedResponse, forbiddenResponse } from "@/lib/auth";
import { OnboardingSaveSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = OnboardingSaveSchema.safeParse(body);

    if (!result.success) {
      console.error("Onboarding Validation Error Details:", JSON.stringify(result.error.format(), null, 2));
      return NextResponse.json({ 
        success: false, 
        error: "Invalid onboarding data", 
        details: result.error.format() 
      }, { status: 400 });
    }

    const { 
      managerId, 
      phone,
      restaurantName, 
      ownerName, 
      city, 
      address, 
      upiId, 
      themeColor, 
      menuCategories, 
      tableCount 
    } = result.data;

    // 1. Verify Authentication
    const auth = await verifyManagerSession(request);
    if (!auth.authenticated) return unauthorizedResponse(auth.error);

    // 2. Critical: Ensure the manager can only save for themselves
    if (!managerId || (auth.uid !== managerId && auth.uid !== "ADMIN_UID")) {
      return forbiddenResponse("Unauthorized manager ID");
    }

    const trimmedUpiId = upiId ? upiId.trim() : "";

    // 0. Verify Manager Exists (Robust Lookup)
    let managerRecord = await prisma.manager.findUnique({
        where: { id: managerId }
    });

    if (!managerRecord && phone) {
        // Fallback to phone lookup if ID fails (resolves CUID/UID mismatch)
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        managerRecord = await prisma.manager.findUnique({
            where: { phone: formattedPhone }
        });
    }

    if (!managerRecord) {
        console.error(`Manager NOT found in DB. ID: ${managerId}, Phone: ${phone}`);
        return NextResponse.json({ error: `Manager record not found for ID: ${managerId}. Please logout and login again.` }, { status: 400 });
    }

    const verifiedManagerId = managerRecord.id;

    // 1. Create or Update Restaurant
    const restaurant = await prisma.restaurant.upsert({
       where: { managerId: verifiedManagerId },
       update: {
         name: restaurantName,
         ownerName,
         city,
         address,
         upiId: trimmedUpiId,
         themeColor,
       },
       create: {
         managerId: verifiedManagerId,
         name: restaurantName,
         ownerName,
         city,
         address,
         upiId: trimmedUpiId,
         themeColor,
       },
    });

    // 2. Handle Menu Categories and Items
    await prisma.category.deleteMany({ where: { restaurantId: restaurant.id } });

    for (const cat of menuCategories) {
      const category = await prisma.category.create({
        data: {
          restaurantId: restaurant.id,
          name: cat.name,
        },
      });

      for (const item of cat.items) {
        await prisma.menuItem.create({
          data: {
            categoryId: category.id,
            name: item.name,
            price: item.price, // Prisma handles string/number to Decimal
            type: item.type,   // 'veg' or 'non-veg'
          },
        });
      }
    }

    // 3. Handle Tables
    await prisma.table.deleteMany({ where: { restaurantId: restaurant.id } });
    const count = parseInt(tableCount) || 0;
    
    // Server-side origin detection
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const origin = `${protocol}://${host}`;

    const tables = [];
    for (let i = 1; i <= count; i++) {
        tables.push({
            restaurantId: restaurant.id,
            tableNumber: i.toString(),
            qrCodeUrl: `${origin}/menu/${restaurant.id}?table=${i}`,
        });
    }
    
    await prisma.table.createMany({
        data: tables
    });

    // 4. Audit Log
    const { logAction, AuditAction } = await import("@/lib/logger");
    await logAction(
        auth.uid, 
        AuditAction.SAVE_ONBOARDING, 
        "Restaurant", 
        restaurant.id, 
        { restaurantName, ownerName, tableCount }
    );

    return NextResponse.json({ success: true, restaurantId: restaurant.id });

  } catch (error: unknown) {
    console.error("Onboarding Save Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
