import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaV4: undefined | ReturnType<typeof prismaClientSingleton>
}

// v4 with unique global variable to force new instance
const prisma = globalThis.prismaV4 ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaV4 = prisma
