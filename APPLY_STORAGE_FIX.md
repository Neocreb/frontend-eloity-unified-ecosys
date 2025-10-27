# How to Apply the Storage Policies Fix

## Quick Fix Instructions

1. **Open the Supabase SQL Editor**:
   Click this link to go directly to your project's SQL Editor:
   https://app.supabase.com/project/hjebzdekquczudhrygns/sql

2. **Copy the SQL Commands**:
   Copy the following SQL commands:

```sql
-- Fix storage policies for the posts bucket
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

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
```

3. **Paste and Run**:
   - Paste the commands into the SQL editor
   - Click the "Run" button

4. **Test the Fix**:
   Try uploading a file to the posts bucket again. The error should be resolved.

## Alternative Method

If you prefer to use the command line:

1. Make sure you have the Supabase CLI installed
2. Run the following command:
   ```bash
   npx supabase sql -f fix-posts-storage-policies.sql
   ```

## Verification

After applying the fix, test the storage functionality to ensure it's working correctly.