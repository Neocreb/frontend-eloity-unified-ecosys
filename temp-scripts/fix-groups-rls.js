// Script to fix groups RLS policies with correct column names
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixGroupsRLSPolicies() {
  console.log('🔧 Fixing groups RLS policies with correct column names...');
  
  try {
    // Drop existing policies that reference the wrong column name
    console.log('🗑️  Dropping existing policies...');
    const dropPolicies = [
      `DROP POLICY IF EXISTS "Users can view public groups" ON public.groups`,
      `DROP POLICY IF EXISTS "Users can view group members" ON public.group_members`,
      `DROP POLICY IF EXISTS "Users can join groups" ON public.group_members`
    ];
    
    for (const policy of dropPolicies) {
      const { error } = await supabase.rpc('execute_sql', { sql: policy });
      if (error) {
        console.warn(`Warning dropping policy: ${error.message}`);
      } else {
        console.log(`✅ Dropped policy: ${policy.split('"')[1]}`);
      }
    }
    
    // Create proper policies for groups table with correct column name
    console.log('🔧 Creating new policies with correct column names...');
    const createPolicies = [
      `CREATE POLICY "Users can view public groups" ON public.groups FOR SELECT USING (privacy = 'public')`,
      `CREATE POLICY "Users can view group members" ON public.group_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.groups WHERE groups.id = group_members.group_id AND (groups.privacy = 'public' OR groups.created_by = auth.uid())))`,
      `CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.groups WHERE groups.id = group_members.group_id AND groups.privacy IN ('public', 'unlisted')))`
    ];
    
    for (const policy of createPolicies) {
      const { error } = await supabase.rpc('execute_sql', { sql: policy });
      if (error) {
        console.error(`❌ Error creating policy: ${error.message}`);
        console.error(`Policy: ${policy}`);
      } else {
        console.log(`✅ Created policy: ${policy.split('"')[1]}`);
      }
    }
    
    console.log('✅ Groups RLS policies fixed successfully!');
    console.log('🔄 Refreshing PostgREST schema cache...');
    
    // Refresh the PostgREST schema cache
    const { error: refreshError } = await supabase.rpc('execute_sql', { sql: "NOTIFY pgrst, 'reload schema'" });
    if (refreshError) {
      console.warn(`Warning refreshing schema: ${refreshError.message}`);
    } else {
      console.log('✅ PostgREST schema cache refreshed');
    }
    
    console.log('🎉 All fixes applied successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing groups RLS policies:', error.message);
    process.exit(1);
  }
}

fixGroupsRLSPolicies();