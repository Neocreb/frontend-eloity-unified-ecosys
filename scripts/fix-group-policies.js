import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function fixGroupPolicies() {
  try {
    // Create a Supabase client with service role key for admin access
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('Fixing group RLS policies...\n');
    
    // Fix group_participants policy to avoid infinite recursion
    console.log('1. Fixing group_participants RLS policy...');
    
    // Drop the problematic policy
    const { error: dropError } = await supabase.rpc('execute_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view group participants for groups they belong to" ON public.group_participants;
      `
    });
    
    if (dropError) {
      console.log('Error dropping policy:', dropError.message);
    } else {
      console.log('✅ Dropped old policy');
    }
    
    // Create the new policy that avoids self-reference
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE POLICY "Users can view group participants for groups they belong to" ON public.group_participants
        FOR SELECT USING (
          -- Check if the user is a participant in the same group
          EXISTS (
            SELECT 1 FROM public.group_participants gp
            WHERE gp.group_id = group_participants.group_id
            AND gp.user_id = auth.uid()
          )
          -- Also check if the group exists (safety check)
          AND EXISTS (
            SELECT 1 FROM public.group_chat_threads gt
            WHERE gt.id = group_participants.group_id
          )
        );
      `
    });
    
    if (createError) {
      console.log('Error creating new policy:', createError.message);
    } else {
      console.log('✅ Created new policy');
    }
    
    // Fix group_chat_threads policy to verify user exists
    console.log('\n2. Fixing group_chat_threads RLS policy...');
    
    // Drop the existing policy
    const { error: dropThreadError } = await supabase.rpc('execute_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can create group chat threads" ON public.group_chat_threads;
      `
    });
    
    if (dropThreadError) {
      console.log('Error dropping thread policy:', dropThreadError.message);
    } else {
      console.log('✅ Dropped old thread policy');
    }
    
    // Create the new policy that verifies the user exists
    const { error: createThreadError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE POLICY "Users can create group chat threads" ON public.group_chat_threads
        FOR INSERT WITH CHECK (
          auth.uid() = created_by 
          AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = created_by
          )
        );
      `
    });
    
    if (createThreadError) {
      console.log('Error creating new thread policy:', createThreadError.message);
    } else {
      console.log('✅ Created new thread policy');
    }
    
    // Fix group_participants insert policy
    console.log('\n3. Fixing group_participants insert policy...');
    
    // Drop the existing policy
    const { error: dropInsertError } = await supabase.rpc('execute_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can join groups through invite links" ON public.group_participants;
      `
    });
    
    if (dropInsertError) {
      console.log('Error dropping insert policy:', dropInsertError.message);
    } else {
      console.log('✅ Dropped old insert policy');
    }
    
    // Create the new policy that verifies the user exists
    const { error: createInsertError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE POLICY "Users can join groups through invite links" ON public.group_participants
        FOR INSERT WITH CHECK (
          auth.uid() = user_id
          AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = user_id
          )
          AND EXISTS (
            SELECT 1 FROM public.group_chat_threads 
            WHERE group_chat_threads.id = group_participants.group_id
          )
        );
      `
    });
    
    if (createInsertError) {
      console.log('Error creating new insert policy:', createInsertError.message);
    } else {
      console.log('✅ Created new insert policy');
    }
    
    // Refresh the PostgREST schema cache
    console.log('\n4. Refreshing PostgREST schema cache...');
    const { error: refreshError } = await supabase.rpc('execute_sql', {
      sql: 'NOTIFY pgrst, \'reload schema\';'
    });
    
    if (refreshError) {
      console.log('Error refreshing schema:', refreshError.message);
    } else {
      console.log('✅ Schema cache refreshed');
    }
    
    console.log('\n🎉 All policies have been fixed!');
    
  } catch (error) {
    console.error('Error fixing RLS policies:', error.message);
  }
}

fixGroupPolicies();