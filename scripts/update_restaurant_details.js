/**
 * UPDATE RESTAURANT DETAILS
 * Target Restaurant ID: cmp9wbytq0001cadsw5bu0gez
 * New Name: "The Night Watch Cafe"
 * New Address: "Jaipur"
 * New City: "Jaipur"
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

const TARGET_RESTAURANT_ID = "cmp9wbytq0001cadsw5bu0gez";

async function main() {
  console.log("\n🔄 Updating restaurant details...\n");

  const existing = await prisma.restaurant.findUnique({
    where: { id: TARGET_RESTAURANT_ID },
  });

  if (!existing) {
    throw new Error(`Restaurant ${TARGET_RESTAURANT_ID} not found.`);
  }

  console.log(`Current Name: "${existing.name}"`);
  console.log(`Current Address: "${existing.address}"`);
  console.log(`Current City: "${existing.city}"\n`);

  const updated = await prisma.restaurant.update({
    where: { id: TARGET_RESTAURANT_ID },
    data: {
      name: "The Night Watch Cafe",
      address: "Jaipur",
      city: "Jaipur",
    },
  });

  console.log(`✅ Updated Name: "${updated.name}"`);
  console.log(`✅ Updated Address: "${updated.address}"`);
  console.log(`✅ Updated City: "${updated.city}"\n`);

  // Invalidate Redis caches
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "https://supreme-bonefish-80728.upstash.io",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "gQAAAAAAATtYAAIncDFmZTcxODNjZGQwNDM0ZmY0YjIxMDVmYTYwODFjODhhMnAxODA3Mjg",
    });
    await redis.del(`menu_v2:${TARGET_RESTAURANT_ID}`);
    await redis.del(`restaurant_settings:${TARGET_RESTAURANT_ID}`);
    console.log("🧹 Flushed Redis menu and settings cache.");
  } catch (err) {
    console.warn("⚠️ Redis cache flush warning:", err.message);
  }

  console.log("\n🎉 Successfully updated restaurant details!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
