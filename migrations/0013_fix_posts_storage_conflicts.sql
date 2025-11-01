-- Migration: Clean up conflicting posts storage policies
-- Date: 2025-11-01

-- Drop all conflicting policies on posts bucket
DROP POLICY IF EXISTS "allow_public_read_posts" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload_posts" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_update_posts" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_delete_posts" ON storage.objects;

-- Create clean policies for posts bucket
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
  AND owner_id = auth.uid()::text
);

CREATE POLICY "allow_owner_delete_posts" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'posts' 
  AND owner_id = auth.uid()::text
);

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';