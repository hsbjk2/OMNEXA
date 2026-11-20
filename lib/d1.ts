import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  D1_SCHEMA_STATEMENTS,
  D1_SEED_STATEMENTS,
} from "@/lib/d1-sql.generated";

export type CloudflareEnv = {
  DB?: D1Database;
  FILES?: R2Bucket;
};

/**
 * The Cloudflare bindings for the current request, or null during plain
 * `next dev` / `next start` where the app runs against the local SQLite file.
 */
export function getCloudflareEnv(): CloudflareEnv | null {
  try {
    const context = getCloudflareContext();
    return (context.env ?? null) as CloudflareEnv | null;
  } catch {
    return null;
  }
}

let databaseReady: Promise<void> | null = null;

// `CREATE TABLE IF NOT EXISTS` never adds columns to a table that already
// exists. D1 databases seeded by an earlier release therefore keep their old
// shape until each new column is added explicitly. Keep this list in sync with
// any column added to prisma/schema.prisma after the first deployment.
const COLUMN_MIGRATIONS: Record<
  string,
  { name: string; definition: string }[]
> = {
  SiteSettings: [
    {
      name: "googleBusinessUrl",
      definition: `"googleBusinessUrl" TEXT NOT NULL DEFAULT ''`,
    },
    {
      name: "whatsappChannelUrl",
      definition: `"whatsappChannelUrl" TEXT NOT NULL DEFAULT ''`,
    },
  ],
};

async function runStatements(db: D1Database, statements: string[]) {
  for (const statement of statements) {
    await db.prepare(statement).run();
  }
}

async function applyColumnMigrations(db: D1Database) {
  for (const [table, migrations] of Object.entries(COLUMN_MIGRATIONS)) {
    const { results } = await db
      .prepare(`PRAGMA table_info("${table}")`)
      .all<{ name: string }>();
    const existing = new Set(results.map((column) => column.name));

    for (const migration of migrations) {
      if (!existing.has(migration.name)) {
        await db
          .prepare(`ALTER TABLE "${table}" ADD COLUMN ${migration.definition}`)
          .run();
      }
    }
  }
}

async function initializeDatabase(db: D1Database) {
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS "_freebuff_seed" ("id" INTEGER NOT NULL PRIMARY KEY)',
    )
    .run();

  const marker = await db
    .prepare('SELECT "id" FROM "_freebuff_seed" WHERE "id" = 1')
    .first();

  if (marker) {
    await applyColumnMigrations(db);
    return;
  }

  // D1 starts empty; create the Prisma schema and copy the public catalogue.
  await runStatements(db, D1_SCHEMA_STATEMENTS);
  await applyColumnMigrations(db);
  await runStatements(db, D1_SEED_STATEMENTS);
  await db.prepare('INSERT OR IGNORE INTO "_freebuff_seed" ("id") VALUES (1)').run();
}

/**
 * Creates and seeds the D1 schema once per Worker isolate. Safe to call on
 * every request: the work is memoised and the SQL is idempotent.
 */
export async function ensureDatabase(): Promise<void> {
  const db = getCloudflareEnv()?.DB;
  if (!db) return;

  if (!databaseReady) {
    databaseReady = initializeDatabase(db).catch((error) => {
      databaseReady = null;
      throw error;
    });
  }

  await databaseReady;
}
