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

console.log('🔍 Testing direct insert into page_followers...');

const client = new Client({
  connectionString: databaseUrl,
});

async function testDirectInsert() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Try to insert a test record directly
    console.log('🔧 Testing direct insert...');
    const pageId = '965334ff-901e-4cf8-b62e-02709a156d91';
    const userId = '293caea5-0e82-4b2d-9642-67f3cdbd95fb';
    
    try {
      const result = await client.query(
        `INSERT INTO public.page_followers (page_id, user_id) VALUES ($1, $2) RETURNING *`,
        [pageId, userId]
      );
      console.log('✅ Direct insert succeeded');
      console.log('Inserted data:', result.rows[0]);
    } catch (error) {
      console.log('❌ Direct insert failed:', error.message);
      
      // Check if it's related to RLS
      if (error.message.includes('row-level security')) {
        console.log('This confirms it\'s an RLS policy issue');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing direct insert:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed.');
  }
}

testDirectInsert();