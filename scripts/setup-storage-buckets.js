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

// Define buckets for different types of content
const buckets = [
  {
    name: 'avatars',
    public: true,
    description: 'User profile pictures and avatars'
  },
  {
    name: 'posts',
    public: true,
    description: 'Social media posts images and videos'
  },
  {
    name: 'stories',
    public: true,
    description: 'Instagram-style stories content'
  },
  {
    name: 'products',
    public: true,
    description: 'E-commerce product images and media'
  },
  {
    name: 'documents',
    public: false,
    description: 'Private documents like contracts, invoices, and legal documents'
  },
  {
    name: 'portfolio',
    public: true,
    description: 'Freelancer portfolio items and work samples'
  },
  {
    name: 'chat-attachments',
    public: false,
    description: 'Private chat attachments and files'
  },
  {
    name: 'verification',
    public: false,
    description: 'User verification documents (ID, certificates, etc.)'
  },
  {
    name: 'admin-assets',
    public: false,
    description: 'Private admin panel assets and reports'
  },
  {
    name: 'temp',
    public: false,
    description: 'Temporary files and uploads'
  }
];

async function setupStorageBuckets() {
  console.log('🚀 Setting up Supabase storage buckets...\n');
  
  for (const bucket of buckets) {
    try {
      console.log(`📦 Creating bucket: ${bucket.name}`);
      
      // Check if bucket already exists
      const { data: existingBuckets, error: listError } = await supabase
        .storage
        .listBuckets();
      
      if (listError) {
        console.error(`❌ Error listing buckets: ${listError.message}`);
        continue;
      }
      
      const bucketExists = existingBuckets.some(b => b.name === bucket.name);
      
      if (bucketExists) {
        console.log(`⚠️  Bucket ${bucket.name} already exists, updating settings...`);
        
        // Update bucket settings
        const { error: updateError } = await supabase
          .storage
          .updateBucket(bucket.name, {
            public: bucket.public
          });
        
        if (updateError) {
          console.error(`❌ Error updating bucket ${bucket.name}: ${updateError.message}`);
          continue;
        }
        
        console.log(`✅ Updated bucket ${bucket.name} (public: ${bucket.public})`);
      } else {
        // Create new bucket
        const { data, error } = await supabase
          .storage
          .createBucket(bucket.name, {
            public: bucket.public,
            fileSizeLimit: 52428800, // 50MB limit
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
          console.error(`❌ Error creating bucket ${bucket.name}: ${error.message}`);
          continue;
        }
        
        console.log(`✅ Created bucket ${bucket.name} (public: ${bucket.public})`);
      }
      
      // Set up basic policies for the bucket
      console.log(`🔐 Setting up RLS policies for ${bucket.name}...`);
      
      if (bucket.public) {
        // For public buckets, allow authenticated users to upload and everyone to read
        const policies = [
          `CREATE POLICY "allow_public_read_${bucket.name}" ON storage.objects FOR SELECT USING (bucket_id = '${bucket.name}');`,
          `CREATE POLICY "allow_authenticated_upload_${bucket.name}" ON storage.objects FOR INSERT WITH CHECK (bucket_id = '${bucket.name}' AND (storage.foldername(name))[1] = auth.uid()::text);`,
          `CREATE POLICY "allow_owner_update_${bucket.name}" ON storage.objects FOR UPDATE USING (bucket_id = '${bucket.name}' AND owner_id = auth.uid());`,
          `CREATE POLICY "allow_owner_delete_${bucket.name}" ON storage.objects FOR DELETE USING (bucket_id = '${bucket.name}' AND owner_id = auth.uid());`
        ];
        
        for (const policy of policies) {
          try {
            const { error: policyError } = await supabase.rpc('execute_sql', {
              sql: policy
            });
            
            if (policyError) {
              console.error(`❌ Error creating policy: ${policyError.message}`);
            }
          } catch (policyErr) {
            console.error(`❌ Error executing policy: ${policyErr.message}`);
          }
        }
        
        console.log(`✅ Set up public policies for ${bucket.name}`);
      } else {
        // For private buckets, only allow owners to access
        const policies = [
          `CREATE POLICY "allow_owner_access_${bucket.name}" ON storage.objects FOR ALL USING (bucket_id = '${bucket.name}' AND owner_id = auth.uid());`
        ];
        
        for (const policy of policies) {
          try {
            const { error: policyError } = await supabase.rpc('execute_sql', {
              sql: policy
            });
            
            if (policyError) {
              console.error(`❌ Error creating policy: ${policyError.message}`);
            }
          } catch (policyErr) {
            console.error(`❌ Error executing policy: ${policyErr.message}`);
          }
        }
        
        console.log(`✅ Set up private policies for ${bucket.name}`);
      }
      
      console.log(`✅ Completed setup for ${bucket.name}\n`);
      
    } catch (error) {
      console.error(`❌ Error setting up bucket ${bucket.name}: ${error.message}\n`);
    }
  }
  
  console.log('🎉 Storage bucket setup completed!');
  console.log('\n📋 Summary of created buckets:');
  buckets.forEach(bucket => {
    console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'}): ${bucket.description}`);
  });
}

// Run the setup
setupStorageBuckets();