import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
    log: Bun.env.NODE_ENV === 'development' ? [] : [],
})
