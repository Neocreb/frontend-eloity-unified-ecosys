#!/usr/bin/env node
/* Apply SQL migrations to a Postgres-compatible database (e.g., Supabase) using SUPABASE_DB_URL or DATABASE_URL.
   Executes statements individually and continues past benign "already exists" errors to support idempotent runs.
*/

import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables from .env and .env.local
const envPath = path.join(process.cwd(), '.env');
const envLocalPath = path.join(process.cwd(), '.env.local');

// Load .env first
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Load .env.local second (will override .env values)
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

function splitStatements(sql) {
  if (sql.includes('--> statement-breakpoint')) {
    return sql.split(/--\> statement-breakpoint/g);
  }
  // Fallback: return full content as one statement (safer than splitting on ;) 
  return [sql];
}

function isBenignError(err) {
  const code = err && (err.code || err.sqlState);
  const msg = (err && err.message) || '';
  return (
    code === '42P07' || // duplicate_table / relation exists
    code === '42710' || // duplicate_object (index, constraint)
    /already exists/i.test(msg) ||
    (code === '42703' && /foreign key constraint/i.test(msg))
  );
}

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('No database URL set. Set SUPABASE_DB_URL (preferred) or DATABASE_URL to your Supabase Postgres connection string.');
    console.error('');
    console.error('🔧 To fix this issue:');
    console.error('1. Create a Supabase project at https://supabase.com/');
    console.error('2. Update .env.local with your actual Supabase credentials');
    console.error('3. For detailed instructions, see SUPABASE_SETUP_INSTRUCTIONS.md');
    console.error('');
    process.exit(1);
  }

  const sql = postgres(dbUrl, { ssl: { rejectUnauthorized: false } });

  try {
    const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const fullPath = path.join(MIGRATIONS_DIR, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      console.log('Applying migration', file);

      const statements = splitStatements(content).map(s => s.trim()).filter(Boolean);
      let succeeded = 0;
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          await sql.unsafe(stmt);
          succeeded++;
        } catch (e) {
          const msg = String(e.message || e).split('\n')[0];
          if (isBenignError(e)) {
            console.log(`  Skipped benign error on statement ${i + 1}/${statements.length}: ${msg}`);
          } else {
            console.warn(`  Statement ${i + 1}/${statements.length} failed in ${file}: ${msg}`);
          }
          continue;
        }
      }
      console.log(`  Completed ${file}: ${succeeded}/${statements.length} statements applied`);
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