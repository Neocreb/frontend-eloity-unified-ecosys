import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL in environment variables');
  console.log('Please ensure you have a .env.local file with the Supabase configuration');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY in environment variables');
  console.log('Please ensure you have a .env.local file with the Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorageConnection() {
  console.log('🔍 Testing storage connection and policies...\n');
  
  try {
    // Test if we can list buckets
    console.log('1. Testing connection to Supabase storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      console.log('\n📝 Troubleshooting tips:');
      console.log('- Check your Supabase URL and API key in .env.local');
      console.log('- Ensure your Supabase project is accessible');
      return;
    }
    
    console.log('✅ Successfully connected to storage');
    
    // Show all buckets
    console.log(`📦 Found ${buckets.length} buckets:`);
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    // Check if posts bucket exists
    console.log('\n2. Checking for posts bucket...');
    const postsBucket = buckets.find(bucket => bucket.name === 'posts');
    if (!postsBucket) {
      console.log('⚠️  Posts bucket not found');
      console.log('Please create the posts bucket first');
      return;
    }
    
    console.log('✅ Posts bucket exists and is', postsBucket.public ? 'public' : 'private');
    
    // Test upload with a small test file
    console.log('\n3. Testing upload to posts bucket...');
    
    // Create a small test file (1x1 pixel PNG in base64)
    const testFile = new Blob(['\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x07\x00\x00\xd1\x89\xcf_\x00\x00\x00\x00IEND\xaeB`\x82'], { type: 'image/png' });
    const fileName = `test-${Date.now()}.png`;
    
    console.log('   Uploading test file...');
    const { data, error } = await supabase.storage
      .from('posts')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Upload failed:', error.message);
      
      // Provide specific troubleshooting based on error message
      if (error.message.includes('row violates row-level security policy')) {
        console.log('\n🔧 This is the exact error you reported!');
        console.log('📝 Solution:');
        console.log('1. Run the fix-posts-storage-policies.sql script in your Supabase SQL Editor');
        console.log('2. Or run: node scripts/apply-posts-storage-fix.js for instructions');
      } else if (error.message.includes(' Bucket not found')) {
        console.log('\n📝 The posts bucket does not exist');
        console.log('🔧 Solution: Create the posts bucket in your Supabase Storage settings');
      } else {
        console.log('\n📝 Please check your Supabase configuration and try again');
        console.log('🔧 Make sure your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct');
      }
    } else {
      console.log('✅ Upload successful!');
      console.log('📁 File path:', data.path);
      
      // Test download
      console.log('\n4. Testing file download...');
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('posts')
        .download(fileName);
      
      if (downloadError) {
        console.error('❌ Download failed:', downloadError.message);
      } else {
        console.log('✅ Download successful!');
        console.log('📊 File size:', downloadData.size, 'bytes');
      }
      
      // Clean up - delete the test file
      console.log('\n5. Cleaning up test file...');
      const { error: deleteError } = await supabase.storage
        .from('posts')
        .remove([fileName]);
      
      if (deleteError) {
        console.log('⚠️  Could not delete test file:', deleteError.message);
        console.log('📝 You may need to manually delete the file from the Supabase dashboard');
      } else {
        console.log('🗑️  Test file deleted successfully');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n📝 Troubleshooting tips:');
    console.log('- Check your internet connection');
    console.log('- Verify your Supabase credentials in .env.local');
    console.log('- Ensure your Supabase project is not paused or disabled');
  }
  
  console.log('\n🎉 Storage test completed!');
}

// Show instructions
console.log('🧪 Posts Storage Test Script');
console.log('===========================');
console.log('This script will test if the posts storage bucket is working correctly.\n');

// Run the test
testStorageConnection();