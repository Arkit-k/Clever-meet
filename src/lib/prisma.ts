// Import Prisma Client
import { PrismaClient } from '@prisma/client'

// Declare global variable for Prisma
declare global {
  var __prisma: PrismaClient | undefined
}

// Initialize Prisma Client
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
  prisma = global.__prisma
}

export { prisma }
