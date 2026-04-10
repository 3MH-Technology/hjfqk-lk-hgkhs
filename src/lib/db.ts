import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  })
}

// In development, always create a fresh client to avoid stale schema issues
export const db = process.env.NODE_ENV === 'production'
  ? (globalForPrisma.prisma ??= createPrismaClient())
  : createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
