-- 20251027_fix_storage_policies.sql
-- Fix storage policies: cast auth.uid() to text, create bucket-specific policies, enable RLS

-- Drop existing policies (safe: IF EXISTS)
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

-- Public buckets: avatars
CREATE POLICY "allow_public_read_avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "allow_authenticated_upload_avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "allow_owner_update_avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND owner_id = (auth.uid())::text
  );

CREATE POLICY "allow_owner_delete_avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND owner_id = (auth.uid())::text
  );

-- Public buckets: posts
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
    AND owner_id = (auth.uid())::text
  );

CREATE POLICY "allow_owner_delete_posts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'posts'
    AND owner_id = (auth.uid())::text
  );

-- Public buckets: videos
CREATE POLICY "allow_public_read_videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "allow_authenticated_upload_videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "allow_owner_update_videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'videos'
    AND owner_id = (auth.uid())::text
  );

CREATE POLICY "allow_owner_delete_videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'videos'
    AND owner_id = (auth.uid())::text
  );

-- Public buckets: stories
CREATE POLICY "allow_public_read_stories"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stories');

CREATE POLICY "allow_authenticated_upload_stories"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'stories'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "allow_owner_update_stories"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'stories'
    AND owner_id = (auth.uid())::text
  );

CREATE POLICY "allow_owner_delete_stories"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'stories'
    AND owner_id = (auth.uid())::text
  );

-- Public buckets: products
CREATE POLICY "allow_public_read_products"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "allow_authenticated_upload_products"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "allow_owner_update_products"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'products'
    AND owner_id = (auth.uid())::text
  );

CREATE POLICY "allow_owner_delete_products"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products'
    AND owner_id = (auth.uid())::text
  );

-- Public buckets: portfolio
CREATE POLICY "allow_public_read_portfolio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

CREATE POLICY "allow_authenticated_upload_portfolio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "allow_owner_update_portfolio"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolio'
    AND owner_id = (auth.uid())::text
  );

CREATE POLICY "allow_owner_delete_portfolio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio'
    AND owner_id = (auth.uid())::text
  );

-- Private buckets: owner-only ALL operations
CREATE POLICY "allow_owner_access_documents"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'documents'
    AND owner_id = (auth.uid())::text
  );

CREATE POLICY "allow_owner_access_chat_attachments"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'chat-attachments'
    AND owner_id = (auth.uid())::text
  );

CREATE POLICY "allow_owner_access_verification"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'verification'
    AND owner_id = (auth.uid())::text
  );

CREATE POLICY "allow_owner_access_admin_assets"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'admin-assets'
    AND owner_id = (auth.uid())::text
  );

CREATE POLICY "allow_owner_access_temp"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'temp'
    AND owner_id = (auth.uid())::text
  );

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Ask PostgREST to reload its schema cache so policies/buckets take effect in the API
NOTIFY pgrst, 'reload schema';