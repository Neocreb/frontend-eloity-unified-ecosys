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

console.log('🔧 Fixing group_members RLS policies to prevent infinite recursion...');

const client = new Client({
  connectionString: databaseUrl,
});

async function fixGroupMembersPolicies() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Drop ALL existing policies on group_members table
    console.log('🗑️  Dropping ALL existing group_members policies...');
    const dropAllPolicies = `
      DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
      DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
      DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
      DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;
      DROP POLICY IF EXISTS "Anyone can view group memberships" ON public.group_members;
    `;
    
    // Execute all drop statements
    const dropStatements = dropAllPolicies.split(';').filter(stmt => stmt.trim() !== '');
    for (const statement of dropStatements) {
      try {
        await client.query(statement);
        console.log(`✅ Executed: ${statement.trim().substring(0, 50)}...`);
      } catch (error) {
        console.warn(`Warning executing statement: ${error.message}`);
      }
    }
    
    // Create clean policies for group_members table
    console.log('🔧 Creating clean policies for group_members...');
    const createPolicies = `
      CREATE POLICY "Users can view group members" ON public.group_members 
      FOR SELECT 
      USING (
        auth.uid() = user_id 
        OR EXISTS (
          SELECT 1 FROM public.groups 
          WHERE groups.id = group_members.group_id 
          AND (groups.privacy = 'public' OR groups.creator_id = auth.uid())
        )
      );
      
      CREATE POLICY "Users can join groups" ON public.group_members 
      FOR INSERT 
      WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
          SELECT 1 FROM public.groups 
          WHERE groups.id = group_members.group_id 
          AND groups.privacy IN ('public', 'unlisted')
        )
      );
      
      CREATE POLICY "Users can leave groups" ON public.group_members 
      FOR DELETE 
      USING (auth.uid() = user_id);
      
      CREATE POLICY "Group admins can manage members" ON public.group_members 
      FOR ALL 
      USING (
        EXISTS (
          SELECT 1 FROM public.group_members gm 
          WHERE gm.group_id = group_members.group_id 
          AND gm.user_id = auth.uid() 
          AND gm.role IN ('admin', 'moderator')
        ) 
        OR EXISTS (
          SELECT 1 FROM public.groups g 
          WHERE g.id = group_members.group_id 
          AND g.creator_id = auth.uid()
        )
      );
    `;
    
    // Execute all create statements
    const createStatements = createPolicies.split(';').filter(stmt => stmt.trim() !== '');
    for (const statement of createStatements) {
      try {
        await client.query(statement);
        const policyName = statement.match(/"([^"]+)"/);
        if (policyName) {
          console.log(`✅ Created policy: ${policyName[1]}`);
        }
      } catch (error) {
        console.error(`❌ Error creating policy: ${error.message}`);
        console.error(`Policy statement: ${statement.trim()}`);
      }
    }
    
    console.log('✅ Group members RLS policies fixed successfully!');
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
    console.error('❌ Error fixing group_members RLS policies:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed.');
  }
}

fixGroupMembersPolicies();