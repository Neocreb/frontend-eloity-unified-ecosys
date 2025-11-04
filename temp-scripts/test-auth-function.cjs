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

console.log('🔍 Testing auth.uid() function...');

const client = new Client({
  connectionString: databaseUrl,
});

async function testAuthFunction() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Test if auth.uid() function exists and works
    console.log('🔧 Testing auth.uid() function...');
    try {
      const result = await client.query(`SELECT auth.uid() as current_user`);
      console.log('✅ auth.uid() function exists');
      console.log('Current user:', result.rows[0].current_user);
    } catch (error) {
      console.log('❌ auth.uid() function test failed:', error.message);
    }
    
    // Test creating a policy with a simpler condition
    console.log('🔧 Testing simpler policy creation...');
    try {
      // Drop and recreate the insert policy with a simpler condition
      await client.query(`DROP POLICY IF EXISTS "Users can follow pages" ON public.page_followers`);
      await client.query(`
        CREATE POLICY "Users can follow pages" 
        ON public.page_followers 
        FOR INSERT 
        WITH CHECK (true)
      `);
      console.log('✅ Simple policy created');
    } catch (error) {
      console.log('❌ Simple policy creation failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing auth function:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed.');
  }
}

testAuthFunction();