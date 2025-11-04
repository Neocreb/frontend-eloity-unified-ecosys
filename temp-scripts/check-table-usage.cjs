const { Client } = require('pg');
const fs = require('fs');

// Get database URL from .env.local
let databaseUrl;
try {
  const envLocal = fs.readFileSync('.env.local', 'utf8');
  const dbUrlMatch = envLocal.match(/DATABASE_URL=(.*)/);
  databaseUrl = dbUrlMatch ? dbUrlMatch[1] : null;
} catch (err) {
  console.log('Note: .env.local not found, trying environment variables');
  databaseUrl = process.env.DATABASE_URL;
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env.local or environment variables');
  process.exit(1);
}

console.log('🔍 Checking if page_follows table should be removed...');

const client = new Client({
  connectionString: databaseUrl,
});

async function checkTableUsage() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Check if page_follows table has any data
    console.log('🔍 Checking page_follows table data...');
    const { rows } = await client.query(`
      SELECT COUNT(*) as count FROM public.page_follows
    `);
    
    console.log(`page_follows table has ${rows[0].count} records`);
    
    if (rows[0].count > 0) {
      console.log('⚠️  page_follows table has data and should not be removed');
    } else {
      console.log('✅ page_follows table is empty and could potentially be removed');
    }
    
    // Check foreign key relationships
    console.log('\n🔍 Checking foreign key relationships...');
    const { rows: fkRows } = await client.query(`
      SELECT
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.table_name IN ('page_follows', 'page_followers')
    `);
    
    if (fkRows.length > 0) {
      console.log('Foreign key relationships found:');
      fkRows.forEach(row => {
        console.log(`  ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('No foreign key relationships found');
    }
    
  } catch (error) {
    console.error('❌ Error checking table usage:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed.');
  }
}

checkTableUsage();