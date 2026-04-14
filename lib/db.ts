import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function normalizeDatabaseUrl(rawUrl?: string) {
  if (!rawUrl) return rawUrl;

  try {
    const parsedUrl = new URL(rawUrl);
    const sslMode = parsedUrl.searchParams.get("sslmode");

    if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
      // Keep current behavior explicit per pg warning guidance.
      parsedUrl.searchParams.set("sslmode", "verify-full");
    }

    return parsedUrl.toString();
  } catch {
    return rawUrl;
  }
}

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL) });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const db = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
