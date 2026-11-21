/**
 * Generates lib/d1-sql.generated.ts from prisma/schema.prisma and prisma/dev.db.
 *
 * Run with: node scripts/generate-d1-sql.mjs
 *
 * The generated module is executed once per D1 database by lib/d1.ts when the
 * storefront first boots on Cloudflare. Only public catalogue data and store
 * settings are copied; user, session and enquiry tables are created empty.
 *
 * Prisma's local SQLite connector stores DateTime columns as integer
 * milliseconds, while the Prisma D1 adapter reads and writes ISO-8601 text.
 * Every DateTime value is therefore normalised before it is emitted as SQL.
 */
import { execFileSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const schemaPath = path.join(root, "prisma", "schema.prisma");
const dbPath = path.join(root, "prisma", "dev.db");
const outputPath = path.join(root, "lib", "d1-sql.generated.ts");

const rawSchema = execFileSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "prisma",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema-datamodel",
    schemaPath,
    "--script",
  ],
  { cwd: root, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
);

const schemaSql = rawSchema
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .replace(/CREATE TABLE /g, "CREATE TABLE IF NOT EXISTS ")
  .replace(/CREATE UNIQUE INDEX /g, "CREATE UNIQUE INDEX IF NOT EXISTS ")
  .replace(/CREATE INDEX /g, "CREATE INDEX IF NOT EXISTS ")
  .trim();

// D1's exec() is line-oriented, so emit one statement per array entry and run
// them through prepare()/run() one at a time.
const schemaStatements = schemaSql
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean);

const db = new DatabaseSync(dbPath);

const columnTypes = new Map();

function getColumnTypes(table) {
  if (!columnTypes.has(table)) {
    const columns = db.prepare(`PRAGMA table_info("${table}")`).all();
    columnTypes.set(
      table,
      new Map(
        columns.map((column) => [
          column.name,
          String(column.type || "").toUpperCase(),
        ]),
      ),
    );
  }
  return columnTypes.get(table);
}

function isDateTimeColumn(table, column) {
  return /^(DATETIME|DATE|TIMESTAMP)$/.test(
    getColumnTypes(table).get(column) || "",
  );
}

function toIso(date) {
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid DateTime value: ${String(date)}`);
  }
  // This is exactly the representation the Prisma D1 adapter writes and
  // expects. Prisma's local SQLite connector uses integer milliseconds, so
  // copying raw values into D1 is what caused the original crash.
  return date.toISOString().replace("Z", "+00:00");
}

function epochToIso(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`Invalid DateTime number: ${String(value)}`);
  }
  const milliseconds =
    Math.abs(numeric) >= 100_000_000_000 ? numeric : numeric * 1000;
  return toIso(new Date(milliseconds));
}

function toDateTime(value) {
  if (value === null || value === undefined) return null;

  if (typeof value === "number" || typeof value === "bigint") {
    return epochToIso(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
      return epochToIso(Number(trimmed));
    }

    // SQLite's CURRENT_TIMESTAMP is UTC but uses a space instead of "T".
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(trimmed)) {
      return toIso(new Date(`${trimmed.replace(" ", "T")}Z`));
    }

    // ISO strings without an explicit offset are UTC in this database.
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(trimmed)) {
      return toIso(new Date(`${trimmed}Z`));
    }

    return toIso(new Date(trimmed));
  }

  throw new Error(`Unsupported DateTime value: ${String(value)}`);
}

function quote(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (value instanceof Uint8Array) {
    return `X'${Buffer.from(value).toString("hex")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function insertStatements(table, rows) {
  return rows.map((row) => {
    const columns = Object.keys(row);
    const values = columns.map((column) => {
      const value = row[column];
      return quote(
        isDateTimeColumn(table, column) ? toDateTime(value) : value,
      );
    });
    return `INSERT OR IGNORE INTO "${table}" (${columns
      .map((column) => `"${column}"`)
      .join(", ")}) VALUES (${values.join(", ")})`;
  });
}

const settings = db.prepare("SELECT * FROM SiteSettings").all();
const categories = db
  .prepare('SELECT * FROM "Category" ORDER BY "sortOrder" ASC')
  .all();
const products = db.prepare('SELECT * FROM "Product" ORDER BY "createdAt" ASC').all();

const seedStatements = [
  ...insertStatements("SiteSettings", settings),
  ...insertStatements("Category", categories),
  ...insertStatements("Product", products),
];

db.close();

const moduleSource = `// Generated by scripts/generate-d1-sql.mjs. Do not edit by hand.\n\nexport const D1_SCHEMA_STATEMENTS: string[] = ${JSON.stringify(
  schemaStatements,
  null,
  2,
)};\n\nexport const D1_SEED_STATEMENTS: string[] = ${JSON.stringify(
  seedStatements,
  null,
  2,
)};\n`;

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, moduleSource, "utf8");

console.log(
  `Wrote ${path.relative(root, outputPath)} (${schemaStatements.length} schema statements, ${seedStatements.length} seed statements).`,
);
