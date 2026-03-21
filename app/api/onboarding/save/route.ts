import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
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
    } = data;

    const trimmedUpiId = upiId ? upiId.trim() : "";

    if (!managerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return NextResponse.json({ success: true, restaurantId: restaurant.id });

  } catch (error: any) {
    console.error("Onboarding Save Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
