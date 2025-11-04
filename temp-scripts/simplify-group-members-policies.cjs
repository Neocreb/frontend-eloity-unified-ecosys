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

console.log('🔧 Simplifying group_members RLS policies to prevent infinite recursion...');

const client = new Client({
  connectionString: databaseUrl,
});

async function simplifyGroupMembersPolicies() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // First, disable RLS temporarily
    console.log('⏸️  Disabling RLS on group_members temporarily...');
    await client.query('ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY');
    
    // Drop ALL existing policies on group_members table
    console.log('🗑️  Dropping ALL existing group_members policies...');
    const dropStatements = [
      'DROP POLICY IF EXISTS "Users can view group members" ON public.group_members',
      'DROP POLICY IF EXISTS "Users can join groups" ON public.group_members',
      'DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members',
      'DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members',
      'DROP POLICY IF EXISTS "Anyone can view group memberships" ON public.group_members'
    ];
    
    for (const statement of dropStatements) {
      try {
        await client.query(statement);
        console.log(`✅ ${statement}`);
      } catch (error) {
        console.warn(`Warning: ${error.message}`);
      }
    }
    
    // Re-enable RLS
    console.log('▶️  Re-enabling RLS on group_members...');
    await client.query('ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY');
    
    // Create very simple policies
    console.log('🔧 Creating simple policies for group_members...');
    const createPolicies = [
      'CREATE POLICY "Users can view group members" ON public.group_members FOR SELECT USING (auth.uid() = user_id)',
      'CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id)',
      'CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id)'
    ];
    
    for (const statement of createPolicies) {
      try {
        await client.query(statement);
        const policyName = statement.match(/"([^"]+)"/);
        if (policyName) {
          console.log(`✅ Created policy: ${policyName[1]}`);
        }
      } catch (error) {
        console.error(`❌ Error creating policy: ${error.message}`);
        console.error(`Policy statement: ${statement}`);
      }
    }
    
    console.log('✅ Group members RLS policies simplified successfully!');
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
    console.error('❌ Error simplifying group_members RLS policies:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed.');
  }
}

simplifyGroupMembersPolicies();