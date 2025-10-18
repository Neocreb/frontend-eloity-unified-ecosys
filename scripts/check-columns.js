#!/usr/bin/env node
import postgres from 'postgres';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const sql = postgres(dbUrl, { ssl: { rejectUnauthorized: false } });
  try {
    const posts = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='posts'
      ORDER BY ordinal_position`;
    const products = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='products'
      ORDER BY ordinal_position`;
    console.log('posts columns:', posts.map(r=>r.column_name).join(', '));
    console.log('products columns:', products.map(r=>r.column_name).join(', '));
  } finally {
    try { await sql.end(); } catch {}
  }
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });
