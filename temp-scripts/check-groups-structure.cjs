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

console.log('🔍 Checking groups table structure...');

const client = new Client({
  connectionString: databaseUrl,
});

async function checkGroupsTableStructure() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Get column information for groups table
    const { rows } = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'groups'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Groups table columns:');
    console.log('========================');
    rows.forEach(row => {
      console.log(`${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Get column information for group_members table
    const { rows: groupMembersRows } = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'group_members'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Group members table columns:');
    console.log('=============================');
    groupMembersRows.forEach(row => {
      console.log(`${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔒 Database connection closed.');
  }
}

checkGroupsTableStructure();