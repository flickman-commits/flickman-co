#!/usr/bin/env node
/**
 * Applies SQL migrations to the Supabase Postgres database via psql.
 *
 * Usage:
 *   1. Add your connection string to .env.local:
 *        SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
 *      (Supabase dashboard → Settings → Database → Connection string → URI)
 *   2. Run: npm run db:setup
 *
 * Requires the `psql` CLI to be installed.
 */
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Minimal .env.local parser (avoids adding a dotenv dependency).
function readEnvLocal() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*SUPABASE_DB_URL\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local */
  }
  return process.env.SUPABASE_DB_URL;
}

const dbUrl = readEnvLocal();
if (!dbUrl) {
  console.error(
    "✗ SUPABASE_DB_URL not found. Add it to .env.local (Supabase → Settings → Database → Connection string → URI)."
  );
  process.exit(1);
}

const migrationsDir = join(root, "supabase", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  const path = join(migrationsDir, file);
  console.log(`→ applying ${file}`);
  try {
    execFileSync("psql", [dbUrl, "-v", "ON_ERROR_STOP=1", "-f", path], {
      stdio: "inherit",
    });
  } catch {
    console.error(`✗ failed applying ${file}`);
    process.exit(1);
  }
}

console.log("✓ migrations applied");
