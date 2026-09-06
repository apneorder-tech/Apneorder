/**
 * SEED CIGARETTES & CHAI + SUTTA COMBOS - The Green Cafe
 * Target Restaurant ID: cmp9wbytq0001cadsw5bu0gez
 */

const { PrismaClient } = require("@prisma/client");
const { Redis } = require("@upstash/redis");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres.ouhprlabdudquodlfvym:%40Live7014167848@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
    }
  }
});

const TARGET_RESTAURANT_ID = "cmp9wbytq0001cadsw5bu0gez"; // The Green Cafe
const BASE_IMG = "https://ouhprlabdudquodlfvym.supabase.co/storage/v1/object/public/menu-images/green-cafe";

const CIGARETTES = [
  { name: "Marlboro Advance", price: 20, type: "veg" },
  { name: "Badi Advance", price: 30, type: "veg" },
  { name: "Marlboro Vista Fusion", price: 30, type: "veg" },
  { name: "Marlboro Gold", price: 30, type: "veg" },
  { name: "Classic Double Burst", price: 30, type: "veg" },
  { name: "Classic Ice Burst", price: 30, type: "veg" },
  { name: "Classic Milds", price: 30, type: "veg" },
  { name: "Classic Ultra Milds", price: 30, type: "veg" },
  { name: "Classic Regular", price: 30, type: "veg" },
  { name: "Classic Connect", price: 30, type: "veg" },
  { name: "Esse Lights", price: 20, type: "veg" },
  { name: "Fine Touch", price: 30, type: "veg" },
  { name: "Badi Gold Flake", price: 30, type: "veg" },
  { name: "Gold Flake", price: 20, type: "veg" },
];

const COMBOS = [
  { name: "Chai + Marlboro Advance Combo", price: 35, type: "veg" },
  { name: "Chai + Gold Flake Combo", price: 35, type: "veg" },
  { name: "Chai + Esse Lights Combo", price: 35, type: "veg" },
  { name: "Chai + Badi Advance Combo", price: 45, type: "veg" },
  { name: "Chai + Classic Ice Burst Combo", price: 45, type: "veg" },
  { name: "Chai + Classic Double Burst Combo", price: 45, type: "veg" },
  { name: "Chai + Classic Milds Combo", price: 45, type: "veg" },
  { name: "Chai + Classic Ultra Milds Combo", price: 45, type: "veg" },
  { name: "Chai + Classic Regular Combo", price: 45, type: "veg" },
  { name: "Chai + Classic Connect Combo", price: 45, type: "veg" },
  { name: "Chai + Marlboro Gold Combo", price: 45, type: "veg" },
  { name: "Chai + Marlboro Vista Fusion Combo", price: 45, type: "veg" },
  { name: "Chai + Fine Touch Combo", price: 45, type: "veg" },
  { name: "Chai + Badi Gold Flake Combo", price: 45, type: "veg" },
];

async function main() {
  console.log("\n🚀 Starting Cigarettes and Chai + Sutta Combos seed...\n");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: TARGET_RESTAURANT_ID },
  });

  if (!restaurant) {
    throw new Error(`Target restaurant ${TARGET_RESTAURANT_ID} not found.`);
  }

  console.log(`✅ Found restaurant: "${restaurant.name}" (${restaurant.id})\n`);

  // ── 1. Create or Find "Cigarettes" Category ──
  let cigCat = await prisma.category.findFirst({
    where: { restaurantId: TARGET_RESTAURANT_ID, name: "Cigarettes" },
  });

  if (!cigCat) {
    cigCat = await prisma.category.create({
      data: {
        name: "Cigarettes",
        restaurantId: TARGET_RESTAURANT_ID,
      },
    });
    console.log(`📁 Created category: "Cigarettes" (${cigCat.id})`);
  } else {
    console.log(`📁 Found category: "Cigarettes" (${cigCat.id})`);
  }

  let cigCount = 0;
  for (const item of CIGARETTES) {
    const existing = await prisma.menuItem.findFirst({
      where: {
        categoryId: cigCat.id,
        name: item.name,
        isDeleted: false,
      },
    });

    if (!existing) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          price: item.price,
          type: item.type,
          categoryId: cigCat.id,
          isAvailable: true,
          isDeleted: false,
          prepTimeMinutes: 1,
        },
      });
      console.log(`   ➕ Added Cigarette: ${item.name} (₹${item.price})`);
      cigCount++;
    } else {
      console.log(`   ℹ️ Already exists: ${item.name}`);
    }
  }

  // ── 2. Create or Find "Chai & Sutta Combos" Category ──
  let comboCat = await prisma.category.findFirst({
    where: { restaurantId: TARGET_RESTAURANT_ID, name: "Chai & Sutta Combos" },
  });

  if (!comboCat) {
    comboCat = await prisma.category.create({
      data: {
        name: "Chai & Sutta Combos",
        restaurantId: TARGET_RESTAURANT_ID,
      },
    });
    console.log(`\n📁 Created category: "Chai & Sutta Combos" (${comboCat.id})`);
  } else {
    console.log(`\n📁 Found category: "Chai & Sutta Combos" (${comboCat.id})`);
  }

  let comboCount = 0;
  for (const item of COMBOS) {
    const existing = await prisma.menuItem.findFirst({
      where: {
        categoryId: comboCat.id,
        name: item.name,
        isDeleted: false,
      },
    });

    if (!existing) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          price: item.price,
          type: item.type,
          categoryId: comboCat.id,
          imageUrl: `${BASE_IMG}/cat_tea.jpg`,
          isAvailable: true,
          isDeleted: false,
          prepTimeMinutes: 5,
        },
      });
      console.log(`   ➕ Added Combo: ${item.name} (₹${item.price})`);
      comboCount++;
    } else {
      console.log(`   ℹ️ Already exists: ${item.name}`);
    }
  }

  // ── 3. Invalidate Redis Cache ──
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "https://supreme-bonefish-80728.upstash.io",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "gQAAAAAAATtYAAIncDFmZTcxODNjZGQwNDM0ZmY0YjIxMDVmYTYwODFjODhhMnAxODA3Mjg",
    });
    await redis.del(`menu_v2:${TARGET_RESTAURANT_ID}`);
    console.log("\n🧹 Flushed Redis menu cache for restaurant.");
  } catch (err) {
    console.warn("⚠️ Could not flush Redis cache automatically:", err.message);
  }

  console.log(`\n🎉 DONE! Added ${cigCount} cigarettes and ${comboCount} Chai+Sutta combos to The Green Cafe.\n`);
}

main()
  .catch((e) => {
    console.error("❌ Fatal Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
