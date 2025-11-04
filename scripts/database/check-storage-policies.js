import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStoragePolicies() {
  console.log('🔍 Checking storage bucket policies...\n');
  
  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message);
      return;
    }
    
    console.log('📋 Storage buckets:');
    for (const bucket of buckets) {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      
      // Try to get bucket info
      try {
        const { data: bucketInfo, error: infoError } = await supabase
          .storage
          .getBucket(bucket.name);
        
        if (infoError) {
          console.log(`    ❌ Error getting bucket info: ${infoError.message}`);
        } else {
          console.log(`    ✅ Bucket exists: ${bucketInfo.name}`);
        }
      } catch (infoErr) {
        console.log(`    ❌ Error getting bucket info: ${infoErr.message}`);
      }
    }
    
    // Test uploading to posts bucket specifically
    console.log('\n📂 Testing upload to posts bucket...');
    
    const testFile = new Blob(['Test content for posts bucket'], { type: 'text/plain' });
    const fileName = `test-${Date.now()}.txt`;
    
    const { data, error } = await supabase
      .storage
      .from('posts')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.log('❌ Error uploading to posts bucket:', error.message);
      console.log('   Error code:', error.statusCode);
      console.log('   Error details:', error);
    } else {
      console.log('✅ Successfully uploaded to posts bucket');
      
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
    
    // Check current user
    console.log('\n👤 Checking current user authentication...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Authentication error:', userError.message);
    } else if (user) {
      console.log(`✅ User authenticated: ${user.id}`);
    } else {
      console.log('⚠️  No user is currently authenticated');
    }
    
  } catch (error) {
    console.error('❌ Error during storage policy check:', error.message);
  }
}

checkStoragePolicies();