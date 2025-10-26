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

// Define all buckets that should be created
const bucketsToCreate = [
  { name: 'avatars', isPublic: true },
  { name: 'posts', isPublic: true },
  { name: 'videos', isPublic: true },
  { name: 'stories', isPublic: true },
  { name: 'products', isPublic: true },
  { name: 'documents', isPublic: false },
  { name: 'portfolio', isPublic: true },
  { name: 'chat-attachments', isPublic: false },
  { name: 'verification', isPublic: false },
  { name: 'admin-assets', isPublic: false },
  { name: 'temp', isPublic: false }
];

async function createBuckets() {
  console.log('🚀 Creating storage buckets directly...\n');
  
  for (const bucket of bucketsToCreate) {
    try {
      console.log(`📦 Creating bucket: ${bucket.name} (${bucket.isPublic ? 'public' : 'private'})`);
      
      // Try to create the bucket
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.isPublic,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'image/*',
          'video/*',
          'audio/*',
          'text/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ]
      });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Bucket ${bucket.name} already exists`);
          
          // Update the bucket settings if it already exists
          const { error: updateError } = await supabase.storage.updateBucket(bucket.name, {
            public: bucket.isPublic
          });
          
          if (updateError) {
            console.error(`❌ Error updating bucket ${bucket.name}: ${updateError.message}`);
          } else {
            console.log(`✅ Updated bucket ${bucket.name} settings`);
          }
        } else {
          console.error(`❌ Error creating bucket ${bucket.name}: ${error.message}`);
        }
      } else {
        console.log(`✅ Created bucket ${bucket.name}`);
      }
    } catch (error) {
      console.error(`❌ Error processing bucket ${bucket.name}: ${error.message}`);
    }
  }
  
  console.log('\n📋 Verifying created buckets...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error.message);
    } else {
      console.log('\n📦 Current buckets:');
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }
  } catch (error) {
    console.error('❌ Error verifying buckets:', error.message);
  }
  
  console.log('\n🎉 Bucket creation process completed!');
}

// Run the bucket creation
createBuckets();