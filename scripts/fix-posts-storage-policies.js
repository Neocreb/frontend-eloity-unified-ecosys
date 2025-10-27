import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPostsStoragePolicies() {
  console.log('🔧 Fixing storage policies for posts bucket...\n');
  
  // Drop existing policies on the posts bucket
  const dropPolicies = [
    `DROP POLICY IF EXISTS "allow_public_read_posts" ON storage.objects;`,
    `DROP POLICY IF EXISTS "allow_authenticated_upload_posts" ON storage.objects;`,
    `DROP POLICY IF EXISTS "allow_owner_update_posts" ON storage.objects;`,
    `DROP POLICY IF EXISTS "allow_owner_delete_posts" ON storage.objects;`
  ];
  
  for (const policy of dropPolicies) {
    try {
      const { error } = await supabase.rpc('execute_sql', { sql: policy });
      if (error) {
        console.error(`❌ Error dropping policy: ${error.message}`);
      } else {
        console.log(`✅ Dropped policy: ${policy.split(' ')[2]}`);
      }
    } catch (err) {
      console.error(`❌ Error executing policy: ${err.message}`);
    }
  }
  
  // Create proper policies for the posts bucket
  const createPolicies = [
    `CREATE POLICY "allow_public_read_posts" ON storage.objects FOR SELECT USING (bucket_id = 'posts');`,
    `CREATE POLICY "allow_authenticated_upload_posts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');`,
    `CREATE POLICY "allow_owner_update_posts" ON storage.objects FOR UPDATE USING (bucket_id = 'posts' AND owner_id = (auth.uid())::text);`,
    `CREATE POLICY "allow_owner_delete_posts" ON storage.objects FOR DELETE USING (bucket_id = 'posts' AND owner_id = (auth.uid())::text);`
  ];
  
  for (const policy of createPolicies) {
    try {
      const { error } = await supabase.rpc('execute_sql', { sql: policy });
      if (error) {
        console.error(`❌ Error creating policy: ${error.message}`);
      } else {
        console.log(`✅ Created policy: ${policy.split(' ')[2]}`);
      }
    } catch (err) {
      console.error(`❌ Error executing policy: ${err.message}`);
    }
  }
  
  // Ensure RLS is enabled on storage.objects
  try {
    const { error } = await supabase.rpc('execute_sql', { 
      sql: 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;' 
    });
    if (error) {
      console.error(`❌ Error enabling RLS: ${error.message}`);
    } else {
      console.log('✅ Enabled RLS on storage.objects');
    }
  } catch (err) {
    console.error(`❌ Error enabling RLS: ${err.message}`);
  }
  
  // Refresh the PostgREST schema cache
  try {
    const { error } = await supabase.rpc('execute_sql', { 
      sql: "NOTIFY pgrst, 'reload schema';" 
    });
    if (error) {
      console.error(`❌ Error refreshing schema: ${error.message}`);
    } else {
      console.log('✅ Refreshed PostgREST schema cache');
    }
  } catch (err) {
    console.error(`❌ Error refreshing schema: ${err.message}`);
  }
  
  console.log('\n🎉 Posts storage policies fix completed!');
}

// Run the fix
fixPostsStoragePolicies();