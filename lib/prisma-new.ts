import { PrismaClient } from '../generated/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaV3: undefined | ReturnType<typeof prismaClientSingleton>
}

// v3 with unique global variable to force new instance
const prisma = globalThis.prismaV3 ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaV3 = prisma
