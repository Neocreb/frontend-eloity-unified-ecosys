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

console.log('🔧 Directly fixing page_followers policies...');

const client = new Client({
  connectionString: databaseUrl,
});

async function fixPoliciesDirectly() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Drop existing policies
    console.log('🗑️  Dropping existing policies...');
    await client.query(`DROP POLICY IF EXISTS "Anyone can view page followers" ON public.page_followers`);
    await client.query(`DROP POLICY IF EXISTS "Users can follow pages" ON public.page_followers`);
    await client.query(`DROP POLICY IF EXISTS "Users can unfollow pages" ON public.page_followers`);
    console.log('✅ Dropped existing policies');

    // Create new policies with explicit syntax
    console.log('🔧 Creating new policies...');
    await client.query(`
      CREATE POLICY "Anyone can view page followers" 
      ON public.page_followers 
      FOR SELECT 
      USING (true)
    `);
    
    await client.query(`
      CREATE POLICY "Users can follow pages" 
      ON public.page_followers 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id)
    `);
    
    await client.query(`
      CREATE POLICY "Users can unfollow pages" 
      ON public.page_followers 
      FOR DELETE 
      USING (auth.uid() = user_id)
    `);
    
    console.log('✅ Created new policies');
    
    // Refresh schema
    await client.query(`NOTIFY pgrst, 'reload schema'`);
    console.log('✅ Schema cache refreshed');

    console.log('🎉 All fixes applied successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing policies:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed.');
  }
}

fixPoliciesDirectly();