import "server-only";

import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareEnv } from "@/lib/d1";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let sqliteClient: PrismaClient | undefined;

function getSqliteClient() {
  if (!sqliteClient) {
    sqliteClient =
      globalForPrisma.prisma ??
      new PrismaClient({
        log:
          process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = sqliteClient;
  }

  return sqliteClient;
}

function getD1Client() {
  const db = getCloudflareEnv()?.DB;
  if (!db) return null;

  // Workers forbid sharing I/O objects across requests, so each request gets
  // its own thin Prisma client over the request-scoped D1 binding.
  return new PrismaClient({
    adapter: new PrismaD1(db),
    log: ["error"],
  });
}

function getClient() {
  return getD1Client() ?? getSqliteClient();
}

/**
 * A Prisma client that selects the Cloudflare D1 binding when the app runs on
 * Workers and falls back to the local SQLite database for `next dev`/`next start`.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
