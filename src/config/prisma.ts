import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// Singleton para evitar múltiples instancias de Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

const adapter = new PrismaMariaDb({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: 5,
});

if (env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) global.prisma = new PrismaClient({ adapter });
  prisma = global.prisma;
}

// Manejo de cierre de conexiones
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
