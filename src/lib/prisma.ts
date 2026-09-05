import { PrismaClient } from "@prisma/client";

// Standard Next.js singleton so hot-reload in dev doesn't spawn new clients.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
