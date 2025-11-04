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

console.log('🔍 Checking RLS policies on page tables...');

const client = new Client({
  connectionString: databaseUrl,
});

async function checkRLSPolicies() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Check RLS status for both tables
    const { rows: rlsStatus } = await client.query(`
      SELECT relname as table_name, relrowsecurity as rls_enabled
      FROM pg_class 
      WHERE relname IN ('page_followers', 'page_follows') 
      AND relkind = 'r'
    `);
    
    console.log('\n📋 RLS Status:');
    console.log('==============');
    rlsStatus.forEach(row => {
      console.log(`${row.table_name}: ${row.rls_enabled ? 'ENABLED' : 'DISABLED'}`);
    });
    
    // Check policies for page_followers
    console.log('\n📋 Policies for page_followers:');
    console.log('=============================');
    const { rows: followersPolicies } = await client.query(`
      SELECT polname, polcmd, polqual, polwithcheck
      FROM pg_policy pol
      JOIN pg_class cls ON cls.oid = pol.polrelid
      WHERE cls.relname = 'page_followers'
    `);
    
    if (followersPolicies.length === 0) {
      console.log('No policies found');
    } else {
      followersPolicies.forEach(row => {
        console.log(`Policy: ${row.polname}`);
        console.log(`  Command: ${row.polcmd}`);
        console.log(`  Qual: ${row.polqual}`);
        console.log('---');
      });
    }
    
    // Check policies for page_follows
    console.log('\n📋 Policies for page_follows:');
    console.log('===========================');
    const { rows: followsPolicies } = await client.query(`
      SELECT polname, polcmd, polqual, polwithcheck
      FROM pg_policy pol
      JOIN pg_class cls ON cls.oid = pol.polrelid
      WHERE cls.relname = 'page_follows'
    `);
    
    if (followsPolicies.length === 0) {
      console.log('No policies found');
    } else {
      followsPolicies.forEach(row => {
        console.log(`Policy: ${row.polname}`);
        console.log(`  Command: ${row.polcmd}`);
        console.log(`  Qual: ${row.polqual}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking RLS policies:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔒 Database connection closed.');
  }
}

checkRLSPolicies();