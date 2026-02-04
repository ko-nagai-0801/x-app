/* lib/db.ts */
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import WebSocket from "ws";

declare global {
  var prisma: PrismaClient | undefined;
}

// neonConfig.webSocketConstructor は「WebSocket コンストラクタ」を要求する
neonConfig.webSocketConstructor = WebSocket as unknown as typeof globalThis.WebSocket;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Please set it in .env and Vercel env vars.",
  );
}

const adapter = new PrismaNeon({ connectionString: databaseUrl });

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
