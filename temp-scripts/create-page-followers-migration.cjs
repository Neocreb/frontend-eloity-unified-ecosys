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

console.log('🔍 Checking current policies and creating migration...');

const client = new Client({
  connectionString: databaseUrl,
});

async function createPageFollowersMigration() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Create a migration file to fix the page_followers policies
    const migrationContent = `-- Migration: Fix page_followers RLS policies
-- Date: ${new Date().toISOString().split('T')[0]}

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view page followers" ON public.page_followers;
DROP POLICY IF EXISTS "Users can follow pages" ON public.page_followers;
DROP POLICY IF EXISTS "Users can unfollow pages" ON public.page_followers;

-- Create proper policies with correct USING and WITH CHECK conditions
CREATE POLICY "Anyone can view page followers" ON public.page_followers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can follow pages" ON public.page_followers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow pages" ON public.page_followers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
`;

    // Write migration file
    const fs = require('fs');
    const migrationFileName = `migrations/0017_fix_page_followers_policies.sql`;
    fs.writeFileSync(migrationFileName, migrationContent);
    console.log(`✅ Created migration file: ${migrationFileName}`);
    
    console.log('📋 Migration content:');
    console.log('====================');
    console.log(migrationContent);
    
  } catch (error) {
    console.error('❌ Error creating migration:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed.');
  }
}

createPageFollowersMigration();