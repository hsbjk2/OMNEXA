import "server-only";

import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import type { D1Database } from "@cloudflare/workers-types";
import { ensureDatabase, getCloudflareEnv } from "@/lib/d1";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let sqliteClient: PrismaClient | undefined;
let loggedAdapter: string | undefined;

// D1 bindings are stateless request/isolate-scoped objects. Cache the thin
// Prisma client per binding so repeated property access in one request does
// not allocate a new client for every query.
const d1Clients = new WeakMap<object, PrismaClient>();

function logAdapter(kind: "Cloudflare D1" | "local SQLite", detail: string) {
  const key = `${kind}:${detail}`;
  if (loggedAdapter === key) return;
  loggedAdapter = key;
  console.info(`[db] Prisma adapter: ${kind} (${detail})`);
}

function getSqliteClient() {
  if (!sqliteClient) {
    sqliteClient =
      globalForPrisma.prisma ??
      new PrismaClient({
        log:
          process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
    logAdapter(
      "local SQLite",
      process.env.DATABASE_URL ? "DATABASE_URL" : "Prisma default",
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = sqliteClient;
  }

  return sqliteClient;
}

function createD1Client(db: D1Database) {
  // Every Prisma operation waits for the idempotent D1 bootstrap/migration.
  // This makes direct route-handler and server-action queries safe even when
  // no storefront/admin layout has rendered yet.
  return new PrismaClient({
    adapter: new PrismaD1(db),
    log: ["error"],
  }).$extends({
    query: {
      $allOperations: async ({ args, query }) => {
        await ensureDatabase();
        return query(args);
      },
    },
  }) as unknown as PrismaClient;
}

function getD1Client() {
  const db = getCloudflareEnv()?.DB;
  if (!db) return null;

  const key = db as unknown as object;
  let client = d1Clients.get(key);
  if (!client) {
    client = createD1Client(db);
    d1Clients.set(key, client);
    logAdapter("Cloudflare D1", "binding DB");
  }

  return client;
}

function getClient() {
  const configured = process.env.OMNEXA_DATABASE?.trim().toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  if (configured === "sqlite") {
    if (isProduction) {
      throw new Error("[db] SQLite is disabled in production.");
    }
    return getSqliteClient();
  }

  if (configured === "d1") {
    const client = getD1Client();
    if (!client) {
      throw new Error("[db] D1 binding DB is unavailable.");
    }
    return client;
  }

  if (configured && configured !== "auto") {
    console.warn(`[db] Unknown OMNEXA_DATABASE value "${configured}".`);
  }

  const d1Client = getD1Client();

  if (d1Client) return d1Client;

  if (isProduction) {
    throw new Error(
      "[db] Cloudflare D1 is unavailable. Refusing SQLite fallback in production.",
    );
  }

  return getSqliteClient();
}
/**
 * A Prisma client that selects the Cloudflare D1 binding when the app runs on
 * Workers and falls back to the local SQLite database for `next dev`/`next start`.
 *
 * Set OMNEXA_DATABASE to "d1" or "sqlite" to force one adapter explicitly.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
