# Storage Policies Fix Needed

## Current Issue
The storage upload is failing with "new row violates row-level security policy" error. This indicates that the RLS (Row Level Security) policies for the storage buckets are not properly configured.

## Root Cause
The RLS policies for storage buckets are preventing authenticated users from uploading files to public buckets, even though they should be allowed to do so.

## Solution
The migration file `supabase/migrations/20251026163000_fix_storage_policies.sql` contains the correct policies but they haven't been applied to the database.

## Required SQL Statements

### Drop Existing Policies
```sql
DROP POLICY IF EXISTS "allow_public_read_avatars" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload_avatars" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_update_avatars" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_delete_avatars" ON storage.objects;

DROP POLICY IF EXISTS "allow_public_read_posts" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload_posts" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_update_posts" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_delete_posts" ON storage.objects;

DROP POLICY IF EXISTS "allow_public_read_videos" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload_videos" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_update_videos" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_delete_videos" ON storage.objects;

DROP POLICY IF EXISTS "allow_public_read_stories" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload_stories" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_update_stories" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_delete_stories" ON storage.objects;

DROP POLICY IF EXISTS "allow_public_read_products" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload_products" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_update_products" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_delete_products" ON storage.objects;

DROP POLICY IF EXISTS "allow_public_read_portfolio" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload_portfolio" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_update_portfolio" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_delete_portfolio" ON storage.objects;
```

### Create Proper Policies for Public Buckets

#### Posts Bucket
```sql
CREATE POLICY "allow_public_read_posts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'posts');

CREATE POLICY "allow_authenticated_upload_posts" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "allow_owner_update_posts" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'posts' 
  AND owner_id = auth.uid()
);

CREATE POLICY "allow_owner_delete_posts" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'posts' 
  AND owner_id = auth.uid()
);
```

(Similar policies needed for avatars, videos, stories, products, and portfolio buckets)

### Create Proper Policies for Private Buckets
```sql
CREATE POLICY "allow_owner_access_documents" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'documents' 
  AND owner_id = auth.uid()
);

CREATE POLICY "allow_owner_access_chat_attachments" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'chat-attachments' 
  AND owner_id = auth.uid()
);

CREATE POLICY "allow_owner_access_verification" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'verification' 
  AND owner_id = auth.uid()
);

CREATE POLICY "allow_owner_access_admin_assets" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'admin-assets' 
  AND owner_id = auth.uid()
);

CREATE POLICY "allow_owner_access_temp" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'temp' 
  AND owner_id = auth.uid()
);
```

### Enable RLS and Refresh Schema
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
NOTIFY pgrst, 'reload schema';
```

## Next Steps
1. Apply the above SQL statements through the Supabase dashboard or CLI
2. Test storage uploads to verify the fix works
3. Monitor for any accessibility warnings in the UI components