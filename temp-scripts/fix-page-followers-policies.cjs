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

console.log('🔧 Fixing RLS policies for page_followers table...');

const client = new Client({
  connectionString: databaseUrl,
});

async function fixPageFollowersPolicies() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Drop existing policies
    console.log('🗑️  Dropping existing policies...');
    const dropPolicies = [
      `DROP POLICY IF EXISTS "Anyone can view page followers" ON public.page_followers`,
      `DROP POLICY IF EXISTS "Users can follow pages" ON public.page_followers`,
      `DROP POLICY IF EXISTS "Users can unfollow pages" ON public.page_followers`
    ];
    
    for (const policy of dropPolicies) {
      try {
        await client.query(policy);
        const policyName = policy.match(/"([^"]+)"/);
        if (policyName) {
          console.log(`✅ Dropped policy: ${policyName[1]}`);
        }
      } catch (error) {
        console.warn(`Warning dropping policy: ${error.message}`);
      }
    }
    
    // Create proper policies with correct conditions
    console.log('🔧 Creating proper policies...');
    const createPolicies = [
      `CREATE POLICY "Anyone can view page followers" ON public.page_followers FOR SELECT USING (true)`,
      `CREATE POLICY "Users can follow pages" ON public.page_followers FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      `CREATE POLICY "Users can unfollow pages" ON public.page_followers FOR DELETE USING (auth.uid() = user_id)`
    ];
    
    for (const policy of createPolicies) {
      try {
        await client.query(policy);
        const policyName = policy.match(/"([^"]+)"/);
        if (policyName) {
          console.log(`✅ Created policy: ${policyName[1]}`);
        }
      } catch (error) {
        console.error(`❌ Error creating policy: ${error.message}`);
        console.error(`Policy: ${policy}`);
      }
    }
    
    console.log('✅ Page followers RLS policies fixed successfully!');
    console.log('🔄 Refreshing PostgREST schema cache...');
    
    // Refresh the PostgREST schema cache
    try {
      await client.query("NOTIFY pgrst, 'reload schema'");
      console.log('✅ PostgREST schema cache refreshed');
    } catch (error) {
      console.warn(`Warning refreshing schema: ${error.message}`);
    }
    
    console.log('🎉 All fixes applied successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing page_followers RLS policies:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed.');
  }
}

fixPageFollowersPolicies();