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

console.log('🔍 Checking actual page-related tables in database...');

const client = new Client({
  connectionString: databaseUrl,
});

async function checkActualTables() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Check what page-related tables actually exist
    const { rows } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%page%'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Page-related tables in database:');
    console.log('====================================');
    rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check the structure of page_follows table
    console.log('\n📋 Structure of page_follows table:');
    console.log('==================================');
    const { rows: followsColumns } = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'page_follows'
      ORDER BY ordinal_position
    `);
    
    followsColumns.forEach(row => {
      console.log(`${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check if page_followers table exists
    const { rows: followersExists } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'page_followers'
    `);
    
    if (followersExists.length > 0) {
      console.log('\n📋 Structure of page_followers table:');
      console.log('====================================');
      const { rows: followersColumns } = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'page_followers'
        ORDER BY ordinal_position
      `);
      
      followersColumns.forEach(row => {
        console.log(`${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('\n📋 page_followers table does not exist in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking database tables:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔒 Database connection closed.');
  }
}

checkActualTables();