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

async function testStorageSetup() {
  console.log('🔍 Testing Supabase storage setup...\n');
  
  try {
    // List all buckets
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error.message);
      return;
    }
    
    console.log('📋 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    // Test creating a simple file in the temp bucket
    console.log('\n📂 Testing file upload to temp bucket...');
    
    const testFile = new Blob(['Hello, Eloity!'], { type: 'text/plain' });
    const fileName = `${Date.now()}_test.txt`;
    
    const { data, error: uploadError } = await supabase
      .storage
      .from('temp')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Error uploading test file:', uploadError.message);
    } else {
      console.log('✅ Test file uploaded successfully');
      
      // Try to download the file
      console.log('\n📥 Testing file download...');
      
      const { data: downloadData, error: downloadError } = await supabase
        .storage
        .from('temp')
        .download(fileName);
      
      if (downloadError) {
        console.error('❌ Error downloading test file:', downloadError.message);
      } else {
        console.log('✅ Test file downloaded successfully');
        
        // Clean up - delete the test file
        console.log('\n🧹 Cleaning up test file...');
        
        const { error: deleteError } = await supabase
          .storage
          .from('temp')
          .remove([fileName]);
        
        if (deleteError) {
          console.error('❌ Error deleting test file:', deleteError.message);
        } else {
          console.log('✅ Test file deleted successfully');
        }
      }
    }
    
    // Test public bucket access
    console.log('\n🌐 Testing public bucket access...');
    
    const { data: publicBuckets, error: publicError } = await supabase
      .storage
      .listBuckets();
    
    if (!publicError) {
      const publicBucket = publicBuckets.find(b => b.public);
      if (publicBucket) {
        console.log(`✅ Public bucket "${publicBucket.name}" is accessible`);
      } else {
        console.log('⚠️  No public buckets found');
      }
    }
    
    console.log('\n🎉 Storage setup verification completed!');
    
  } catch (error) {
    console.error('❌ Error during storage setup test:', error.message);
  }
}

// Run the test
testStorageSetup();