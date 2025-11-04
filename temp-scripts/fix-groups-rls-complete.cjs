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

console.log('🔧 Fixing groups RLS policies with correct column names...');

const client = new Client({
  connectionString: databaseUrl,
});

async function fixGroupsRLSPolicies() {
  try {
    await client.connect();
    console.log('✅ Connected to database successfully!');

    // Drop existing policies that reference the wrong column names
    console.log('🗑️  Dropping existing policies...');
    const dropPolicies = [
      `DROP POLICY IF EXISTS "Users can view groups they created" ON public.groups`,
      `DROP POLICY IF EXISTS "Users can view public groups" ON public.groups`,
      `DROP POLICY IF EXISTS "Users can create groups" ON public.groups`,
      `DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups`,
      `DROP POLICY IF EXISTS "Group creators can delete their groups" ON public.groups`,
      `DROP POLICY IF EXISTS "Users can view group members" ON public.group_members`,
      `DROP POLICY IF EXISTS "Users can join groups" ON public.group_members`,
      `DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members`,
      `DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members`
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
    
    // Create proper policies for groups table with correct column names
    console.log('🔧 Creating new policies with correct column names...');
    const createPolicies = [
      `CREATE POLICY "Users can view groups they created" ON public.groups FOR SELECT USING (creator_id = auth.uid())`,
      `CREATE POLICY "Users can view public groups" ON public.groups FOR SELECT USING (privacy = 'public')`,
      `CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = creator_id)`,
      `CREATE POLICY "Group creators can update their groups" ON public.groups FOR UPDATE USING (auth.uid() = creator_id)`,
      `CREATE POLICY "Group creators can delete their groups" ON public.groups FOR DELETE USING (auth.uid() = creator_id)`,
      `CREATE POLICY "Users can view group members" ON public.group_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.groups WHERE groups.id = group_members.group_id AND (groups.privacy = 'public' OR groups.creator_id = auth.uid())))`,
      `CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.groups WHERE groups.id = group_members.group_id AND groups.privacy IN ('public', 'unlisted')))`,
      `CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.group_members gm JOIN public.groups g ON g.id = gm.group_id WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin' AND g.creator_id = auth.uid()))`,
      `CREATE POLICY "Group admins can manage members" ON public.group_members FOR ALL USING (EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role IN ('admin', 'moderator')) OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_members.group_id AND g.creator_id = auth.uid()))`
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
    
    console.log('✅ Groups RLS policies fixed successfully!');
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
    console.error('❌ Error fixing groups RLS policies:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed.');
  }
}

fixGroupsRLSPolicies();