# Storage Policies Fix Instructions

## Issue
The posts storage bucket is not allowing authenticated users to upload files, resulting in a "400 Bad Request" error with the message "new row violates row-level security policy".

## Root Cause
The Row Level Security (RLS) policies for the posts storage bucket are not properly configured to allow authenticated users to upload files.

## Solution
Apply the correct RLS policies to the posts storage bucket.

## Manual Fix Instructions

1. Open the Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the following SQL commands:

```sql
-- Drop existing policies on the posts bucket
DROP POLICY IF EXISTS "allow_public_read_posts" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload_posts" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_update_posts" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_delete_posts" ON storage.objects;

-- Create proper policies for the posts bucket
-- Allow public read access
CREATE POLICY "allow_public_read_posts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'posts');

-- Allow authenticated users to upload files
CREATE POLICY "allow_authenticated_upload_posts" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
);

-- Allow owners to update their own files
CREATE POLICY "allow_owner_update_posts" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'posts' 
  AND owner_id = (auth.uid())::text
);

-- Allow owners to delete their own files
CREATE POLICY "allow_owner_delete_posts" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'posts' 
  AND owner_id = (auth.uid())::text
);

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
```

4. Click "Run" to execute the SQL commands
5. Test the file upload functionality again

## Verification
After applying the fix, you should be able to upload files to the posts bucket without encountering the RLS policy violation error.