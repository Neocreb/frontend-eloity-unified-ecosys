const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', supabaseAnonKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStorageRLS() {
  console.log('🔍 Checking storage RLS policies...\n');
  
  try {
    // Try to check storage policies using the anon key (like the frontend would)
    console.log('🔐 Testing with anon key (frontend simulation)...');
    
    // Try to upload a test file with anon key
    const testFile = new Blob(['Test content with anon key'], { type: 'text/plain' });
    const fileName = `anon-test-${Date.now()}.txt`;
    
    const { data, error } = await supabase
      .storage
      .from('posts')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.log('❌ Error uploading with anon key:', error.message);
      console.log('   This confirms the RLS policy issue');
      
      // Check if we can at least list objects
      console.log('\n📂 Testing object listing with anon key...');
      
      const { data: listData, error: listError } = await supabase
        .storage
        .from('posts')
        .list();
      
      if (listError) {
        console.log('❌ Error listing objects with anon key:', listError.message);
      } else {
        console.log('✅ Object listing works with anon key');
        if (listData && listData.length > 0) {
          console.log(`   Found ${listData.length} objects`);
        }
      }
    } else {
      console.log('✅ Successfully uploaded with anon key');
      
      // Clean up
      const { error: deleteError } = await supabase
        .storage
        .from('posts')
        .remove([fileName]);
      
      if (deleteError) {
        console.log('❌ Error deleting test file:', deleteError.message);
      } else {
        console.log('✅ Test file deleted successfully');
      }
    }
    
    // Check if user is authenticated
    console.log('\n👤 Checking user authentication status...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Auth error:', userError.message);
    } else if (user) {
      console.log(`✅ User authenticated: ${user.id}`);
    } else {
      console.log('⚠️  No authenticated user');
    }
    
  } catch (error) {
    console.error('❌ Error during storage RLS check:', error.message);
  }
}

checkStorageRLS();