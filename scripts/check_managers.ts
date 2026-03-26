import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const managers = await prisma.manager.findMany({
    select: { id: true, phone: true }
  });
  console.log(JSON.stringify(managers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
