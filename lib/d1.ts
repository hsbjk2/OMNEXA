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

// New tables must be created explicitly on databases that already have the
// seed marker, because the full schema is only run for a brand-new D1 database.
// Keep this list in sync with tables added to prisma/schema.prisma after the
// first deployment.
const TABLE_MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS "PendingRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastSentAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PendingRegistration_email_key" ON "PendingRegistration" ("email")`,
  `CREATE INDEX IF NOT EXISTS "PendingRegistration_expiresAt_idx" ON "PendingRegistration" ("expiresAt")`,
  `CREATE INDEX IF NOT EXISTS "PendingRegistration_lastSentAt_idx" ON "PendingRegistration" ("lastSentAt")`,
  `CREATE TABLE IF NOT EXISTS "RateLimit" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "RateLimit_resetAt_idx" ON "RateLimit" ("resetAt")`,
];

// `CREATE TABLE IF NOT EXISTS` never adds columns to a table that already
// exists. D1 databases seeded by an earlier release therefore keep their old
// shape until each new column is added explicitly. Keep this list in sync with
// any column added to prisma/schema.prisma after the first deployment.
const COLUMN_MIGRATIONS: Record<
  string,
  { name: string; definition: string }[]
> = {
  User: [
    // Facebook returns a stable user id with every authorization, which is
    // used to recognise returning users when their email address changes.
    { name: "facebookSub", definition: `"facebookSub" TEXT` },
  ],
  Product: [
    { name: "amazonUrl", definition: `"amazonUrl" TEXT` },
    { name: "flipkartUrl", definition: `"flipkartUrl" TEXT` },
  ],
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

// `ALTER TABLE ... ADD COLUMN` cannot add a UNIQUE constraint, so indexes that
// back a Prisma `@unique` column added after the first release are created
// explicitly. `IF NOT EXISTS` keeps this idempotent.
const INDEX_MIGRATIONS = [
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_facebookSub_key" ON "User" ("facebookSub")`,
];

// Prisma's local SQLite connector stores DateTime values as integer
// milliseconds, while the D1 driver adapter writes and expects ISO-8601 text
// (for example 2026-11-18T12:19:47.112+00:00). Databases seeded from
// prisma/dev.db before this migration contain the integer form and make every
// DateTime read fail with "Inconsistent column data". This migration converts
// those values in place, without touching any other column or row.
const DATETIME_MIGRATION_ID = "datetime-iso-v1";

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function runStatements(db: D1Database, statements: string[]) {
  for (const statement of statements) {
    await db.prepare(statement).run();
  }
}

async function applyColumnMigrations(db: D1Database) {
  await runStatements(db, TABLE_MIGRATIONS);

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

  const userTable = await db
    .prepare(
      `SELECT "name" FROM "sqlite_master" WHERE "type" = 'table' AND "name" = 'User'`,
    )
    .first();

  if (userTable) {
    for (const statement of INDEX_MIGRATIONS) {
      await db.prepare(statement).run();
    }
  }
}

type DateTimeColumn = { table: string; column: string };

/**
 * Finds every DATETIME/DATE/TIMESTAMP column in the live D1 schema, including
 * legacy tables that are no longer part of the Prisma schema.
 */
async function listDateTimeColumns(db: D1Database): Promise<DateTimeColumn[]> {
  const { results: tables } = await db
    .prepare(
      `SELECT "name" FROM "sqlite_master"
       WHERE "type" = 'table'
         AND "name" NOT LIKE 'sqlite_%'
         AND "name" NOT LIKE '_cf_%'
         AND "name" NOT LIKE '_freebuff_%'
       ORDER BY "name"`,
    )
    .all<{ name: string }>();

  const columns: DateTimeColumn[] = [];
  for (const table of tables) {
    const { results } = await db
      .prepare(`PRAGMA table_info(${quoteIdentifier(table.name)})`)
      .all<{ name: string; type: string }>();

    for (const column of results) {
      if (/^(datetime|date|timestamp)$/i.test((column.type || "").trim())) {
        columns.push({ table: table.name, column: column.name });
      }
    }
  }

  return columns;
}

function numericDateTimeUpdate(table: string, column: string) {
  const t = quoteIdentifier(table);
  const c = quoteIdentifier(column);
  const numeric = `CAST(${c} AS REAL)`;

  // Values >= 1e11 are Unix milliseconds; smaller values in the supported
  // range are Unix seconds. The range guard keeps invalid numbers untouched
  // instead of converting them to NULL.
  return `
    UPDATE ${t}
    SET ${c} = CASE
      WHEN ABS(${numeric}) >= 100000000000
        THEN strftime('%Y-%m-%dT%H:%M:%f+00:00', ${numeric} / 1000.0, 'unixepoch')
      ELSE strftime('%Y-%m-%dT%H:%M:%f+00:00', ${numeric}, 'unixepoch')
    END
    WHERE (
      typeof(${c}) IN ('integer', 'real')
      OR (
        typeof(${c}) = 'text'
        AND ${c} GLOB '[0-9]*'
        AND ${c} NOT GLOB '*[^0-9.]*'
      )
    )
    AND ABS(${numeric}) BETWEEN 1000000000 AND 9999999999999
  `;
}

function sqliteTextDateTimeUpdate(table: string, column: string) {
  const t = quoteIdentifier(table);
  const c = quoteIdentifier(column);

  // SQLite's CURRENT_TIMESTAMP default produces "YYYY-MM-DD HH:MM:SS" (UTC).
  // Normalise it to the same ISO-8601 shape the Prisma D1 adapter writes.
  // `datetime(c) = c` is a cheap validity check that avoids the long GLOB
  // patterns D1 rejects as too complex.
  return `
    UPDATE ${t}
    SET ${c} = replace(${c}, ' ', 'T') || '.000+00:00'
    WHERE typeof(${c}) = 'text'
      AND length(${c}) = 19
      AND datetime(${c}) = ${c}
  `;
}

async function repairDateTimeValues(db: D1Database) {
  const columns = await listDateTimeColumns(db);
  let repaired = 0;

  for (const { table, column } of columns) {
    const numeric = await db
      .prepare(numericDateTimeUpdate(table, column))
      .run();
    const numericChanges = numeric.meta?.changes ?? 0;
    if (numericChanges > 0) {
      repaired += numericChanges;
      console.warn(
        `[db] D1 repaired ${numericChanges} numeric DateTime value(s) in ${table}.${column}`,
      );
    }

    const sqliteText = await db
      .prepare(sqliteTextDateTimeUpdate(table, column))
      .run();
    const sqliteTextChanges = sqliteText.meta?.changes ?? 0;
    if (sqliteTextChanges > 0) {
      repaired += sqliteTextChanges;
      console.warn(
        `[db] D1 normalised ${sqliteTextChanges} SQLite DateTime value(s) in ${table}.${column}`,
      );
    }
  }

  return repaired;
}

async function applyDataMigrations(db: D1Database) {
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS "_freebuff_migrations" ("id" TEXT NOT NULL PRIMARY KEY, "appliedAt" TEXT NOT NULL)',
    )
    .run();

  const applied = await db
    .prepare('SELECT "id" FROM "_freebuff_migrations" WHERE "id" = ?')
    .bind(DATETIME_MIGRATION_ID)
    .first();

  if (applied) return;

  const repaired = await repairDateTimeValues(db);

  await db
    .prepare(
      'INSERT OR IGNORE INTO "_freebuff_migrations" ("id", "appliedAt") VALUES (?, ?)',
    )
    .bind(
      DATETIME_MIGRATION_ID,
      new Date().toISOString().replace("Z", "+00:00"),
    )
    .run();

  if (repaired > 0) {
    console.warn(
      `[db] D1 migration "${DATETIME_MIGRATION_ID}" repaired ${repaired} DateTime value(s).`,
    );
  }
}

async function initializeDatabase(db: D1Database) {
  let step = "create seed marker";

  try {
    await db
      .prepare(
        'CREATE TABLE IF NOT EXISTS "_freebuff_seed" ("id" INTEGER NOT NULL PRIMARY KEY)',
      )
      .run();

    step = "read seed marker";
    const marker = await db
      .prepare('SELECT "id" FROM "_freebuff_seed" WHERE "id" = 1')
      .first();

    if (marker) {
      step = "apply column migrations";
      await applyColumnMigrations(db);
      step = "repair DateTime values";
      await applyDataMigrations(db);
      return;
    }

    // D1 starts empty; create the Prisma schema and copy the public catalogue.
    step = "create schema";
    await runStatements(db, D1_SCHEMA_STATEMENTS);
    step = "apply column migrations";
    await applyColumnMigrations(db);
    step = "seed public catalogue";
    await runStatements(db, D1_SEED_STATEMENTS);
    step = "repair DateTime values";
    await applyDataMigrations(db);
    step = "write seed marker";
    await db
      .prepare('INSERT OR IGNORE INTO "_freebuff_seed" ("id") VALUES (1)')
      .run();
  } catch (error) {
    console.error(`[db] D1 initialization failed during "${step}"`, error);
    throw error;
  }
}

/**
 * Creates, migrates and repairs the D1 schema once per Worker isolate. Safe to
 * call on every request: the work is memoised and the SQL is idempotent.
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
