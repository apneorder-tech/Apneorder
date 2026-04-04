const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking last 5 orders...");
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      restaurantId: true,
      status: true,
      createdAt: true
    }
  });

  console.table(orders);

  console.log("\nChecking restaurants...");
  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      managerId: true,
      name: true
    }
  });
  console.table(restaurants);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
