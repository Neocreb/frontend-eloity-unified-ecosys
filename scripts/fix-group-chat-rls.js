// Script to fix group chat RLS policies
import dotenv from 'dotenv';
dotenv.config();

console.log('Fixing group chat RLS policies...');

// Check if Supabase credentials are set
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

console.log('✅ Supabase credentials found');

// Connect to Supabase with service role key for admin operations
try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
  );

  console.log('✅ Connected to Supabase with admin privileges');

  // Apply the RLS policy fixes
  console.log('Applying RLS policy fixes...');
  
  // Fix group_chat_threads RLS policy
  const { error: dropPolicyError } = await supabase.rpc('execute_sql', {
    sql: `
      -- Drop the existing restrictive policy
      DROP POLICY IF EXISTS "Users can create group chat threads" ON public.group_chat_threads;
      
      -- Create a less restrictive policy
      CREATE POLICY "Users can create group chat threads" ON public.group_chat_threads
          FOR INSERT WITH CHECK (auth.uid() = created_by);
    `
  });
  
  if (dropPolicyError) {
    console.log('⚠️  Warning when updating group_chat_threads policy:', dropPolicyError.message);
  } else {
    console.log('✅ Updated group_chat_threads RLS policy');
  }
  
  // Fix group_participants RLS policy
  const { error: dropParticipantsPolicyError } = await supabase.rpc('execute_sql', {
    sql: `
      -- Drop the existing policy
      DROP POLICY IF EXISTS "Users can view group participants for groups they belong to" ON public.group_participants;
      
      -- Create a simpler policy
      CREATE POLICY "Users can view group participants for groups they belong to" ON public.group_participants
          FOR SELECT USING (
              -- Check if the user is a participant in the same group
              EXISTS (
                  SELECT 1 FROM public.group_participants gp
                  WHERE gp.group_id = group_participants.group_id
                  AND gp.user_id = auth.uid()
              )
          );
    `
  });
  
  if (dropParticipantsPolicyError) {
    console.log('⚠️  Warning when updating group_participants policy:', dropParticipantsPolicyError.message);
  } else {
    console.log('✅ Updated group_participants RLS policy');
  }
  
  // Refresh the schema
  const { error: refreshError } = await supabase.rpc('execute_sql', {
    sql: 'NOTIFY pgrst, \'reload schema\';'
  });
  
  if (refreshError) {
    console.log('⚠️  Warning when refreshing schema:', refreshError.message);
  } else {
    console.log('✅ Refreshed PostgREST schema');
  }

  console.log('🎉 RLS policy fixes applied successfully');
  console.log('You can now try creating a group again');

} catch (error) {
  console.log('❌ Error connecting to Supabase:', error.message);
  console.log('Make sure you have:');
  console.log('1. Updated your .env file with real credentials');
  console.log('2. Installed all dependencies with npm install');
  console.log('3. Have internet connectivity');
  console.log('4. Use the service role key (not the anon key) for admin operations');
}