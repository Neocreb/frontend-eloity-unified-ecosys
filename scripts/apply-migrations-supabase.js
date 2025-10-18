#!/usr/bin/env node
/* Apply SQL migrations to a Postgres-compatible database (e.g., Supabase) using SUPABASE_DB_URL env var.
   This script is intended for CI usage. Set SUPABASE_DB_URL in CI secrets to the full postgres connection string.
*/

import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('No database URL set. Set SUPABASE_DB_URL (preferred) or DATABASE_URL to your Supabase Postgres connection string.');
    process.exit(1);
  }

  const sql = postgres(dbUrl, { ssl: { rejectUnauthorized: false } });

  try {
    const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      console.log('Applying migration', file);
      await sql.begin(async (tx) => {
        await tx.unsafe(content);
      });
    }
    console.log('Migrations applied successfully');
    await sql.end();
  } catch (e) {
    console.error('Migration failed', e);
    try { await sql.end(); } catch (_) {}
    process.exit(1);
  }
}

main();
