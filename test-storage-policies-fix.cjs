const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStoragePoliciesFix() {
  console.log('🔍 Testing storage policies fix...\n');
  
  try {
    // Test uploading to posts bucket with anon key
    console.log('📂 Testing upload to posts bucket with anon key...');
    
    const testFile = new Blob(['Test content after policy fix'], { type: 'text/plain' });
    const fileName = `policy-fix-test-${Date.now()}.txt`;
    
    const { data, error } = await supabase
      .storage
      .from('posts')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.log('❌ Error uploading to posts bucket:', error.message);
      console.log('   Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Successfully uploaded to posts bucket');
      console.log('   File path:', data.path);
      
      // Test downloading the file
      console.log('\n📥 Testing download of uploaded file...');
      
      const { data: downloadData, error: downloadError } = await supabase
        .storage
        .from('posts')
        .download(fileName);
      
      if (downloadError) {
        console.log('❌ Error downloading file:', downloadError.message);
      } else {
        console.log('✅ Successfully downloaded file');
        console.log('   File size:', downloadData.size, 'bytes');
      }
      
      // Clean up - delete the test file
      console.log('\n🧹 Cleaning up test file...');
      
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
    
    // Test other public buckets
    const publicBuckets = ['avatars', 'videos', 'stories', 'products', 'portfolio'];
    
    for (const bucket of publicBuckets) {
      console.log(`\n📂 Testing upload to ${bucket} bucket...`);
      
      const testFile = new Blob([`Test content for ${bucket} bucket`], { type: 'text/plain' });
      const fileName = `${bucket}-test-${Date.now()}.txt`;
      
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .upload(fileName, testFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.log(`❌ Error uploading to ${bucket} bucket:`, error.message);
      } else {
        console.log(`✅ Successfully uploaded to ${bucket} bucket`);
        
        // Clean up
        await supabase.storage.from(bucket).remove([fileName]);
      }
    }
    
    console.log('\n🎉 Storage policies fix test completed!');
    
  } catch (error) {
    console.error('❌ Error during storage policies fix test:', error.message);
  }
}

testStoragePoliciesFix();