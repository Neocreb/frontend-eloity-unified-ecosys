-- Fix storage bucket RLS policies for the posts bucket
-- The current policies are preventing uploads from authenticated users

-- First, drop existing policies on the posts bucket
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
  AND owner_id = auth.uid()
);

-- Allow owners to delete their own files
CREATE POLICY "allow_owner_delete_posts" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'posts' 
  AND owner_id = auth.uid()
);

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';