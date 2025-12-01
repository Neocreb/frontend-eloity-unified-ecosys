#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStorageBuckets() {
  console.log('🔧 Fixing Supabase Storage buckets...\n');

  const buckets = ['posts', 'stories', 'avatars', 'products', 'digital-products'];

  for (const bucketName of buckets) {
    try {
      console.log(`Checking bucket: ${bucketName}...`);

      // Note: This approach may not work with anon key
      // Instead, we'll provide instructions for manual setup
      console.log(`
      To make '${bucketName}' bucket PUBLIC, follow these steps:
      
      1. Go to Supabase Dashboard → Storage
      2. Click on '${bucketName}' bucket
      3. Click "Policies" tab
      4. Click "Create policy for SELECT" if not exists
      5. Create the policy:
         - Policy Name: "Public read access"
         - For role: "anon"
         - Mode: Toggle mode
         - Expression: "true"
         - Click "Review"
         - Click "Save policy"
      6. Verify bucket is marked as PUBLIC in bucket settings
      `);
    } catch (error) {
      console.error(`Error checking ${bucketName}:`, error);
    }
  }

  console.log('\n✅ Bucket setup instructions provided');
  console.log('\nAlternatively, you can run this SQL in Supabase SQL Editor:');
  console.log(`
    -- Enable public access to storage buckets
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types, owner, owner_id, version, created_at, updated_at)
    VALUES 
      ('posts', 'posts', true, false, NULL, NULL, 'postgres', NULL, 0, now(), now()),
      ('stories', 'stories', true, false, NULL, NULL, 'postgres', NULL, 0, now(), now()),
      ('avatars', 'avatars', true, false, NULL, NULL, 'postgres', NULL, 0, now(), now()),
      ('products', 'products', true, false, NULL, NULL, 'postgres', NULL, 0, now(), now()),
      ('digital-products', 'digital-products', true, false, NULL, NULL, 'postgres', NULL, 0, now(), now())
    ON CONFLICT (id) DO UPDATE SET public = true, updated_at = now();
    
    -- Add public read policy for posts bucket
    CREATE POLICY "Public read access for posts" ON storage.objects
      FOR SELECT USING (bucket_id = 'posts');
    
    CREATE POLICY "Public read access for stories" ON storage.objects
      FOR SELECT USING (bucket_id = 'stories');
    
    CREATE POLICY "Public read access for avatars" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
    
    CREATE POLICY "Public read access for products" ON storage.objects
      FOR SELECT USING (bucket_id = 'products');
    
    CREATE POLICY "Public read access for digital-products" ON storage.objects
      FOR SELECT USING (bucket_id = 'digital-products');
  `);
}

fixStorageBuckets().catch(console.error);
