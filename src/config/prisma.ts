import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// Singleton para evitar múltiples instancias de Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) global.prisma = new PrismaClient();
  prisma = global.prisma;
}

// Manejo de cierre de conexiones
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
