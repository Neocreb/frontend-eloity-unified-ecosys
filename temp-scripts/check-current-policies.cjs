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

console.log('🔍 Checking current RLS policies...');

const client = new Client({
  connectionString: databaseUrl,
});

async function checkCurrentPolicies() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Get current policies for groups table
    const { rows: groupsPolicies } = await client.query(`
      SELECT polname, polpermissive, polroles, polcmd, polqual, polwithcheck
      FROM pg_policy pol
      JOIN pg_class cls ON cls.oid = pol.polrelid
      WHERE cls.relname = 'groups'
    `);
    
    console.log('\n📋 Current policies for groups table:');
    console.log('====================================');
    groupsPolicies.forEach(row => {
      console.log(`Policy: ${row.polname}`);
      console.log(`  Command: ${row.polcmd}`);
      console.log(`  Qual: ${row.polqual}`);
      console.log(`  With Check: ${row.polwithcheck}`);
      console.log('---');
    });
    
    // Get current policies for group_members table
    const { rows: groupMembersPolicies } = await client.query(`
      SELECT polname, polpermissive, polroles, polcmd, polqual, polwithcheck
      FROM pg_policy pol
      JOIN pg_class cls ON cls.oid = pol.polrelid
      WHERE cls.relname = 'group_members'
    `);
    
    console.log('\n📋 Current policies for group_members table:');
    console.log('==========================================');
    groupMembersPolicies.forEach(row => {
      console.log(`Policy: ${row.polname}`);
      console.log(`  Command: ${row.polcmd}`);
      console.log(`  Qual: ${row.polqual}`);
      console.log(`  With Check: ${row.polwithcheck}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error checking policies:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔒 Database connection closed.');
  }
}

checkCurrentPolicies();