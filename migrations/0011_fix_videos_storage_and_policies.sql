-- Migration: Fix videos storage bucket and policies
-- Date: 2025-11-01

-- Ensure videos bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Ensure thumbnails bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "allow_public_read_videos" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload_videos" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_update_videos" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_delete_videos" ON storage.objects;

DROP POLICY IF EXISTS "allow_public_read_thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_upload_thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_update_thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "allow_owner_delete_thumbnails" ON storage.objects;

-- Create proper policies for videos bucket (public read, authenticated write)
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
  AND owner_id = auth.uid()::text
);

CREATE POLICY "allow_owner_delete_videos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'videos' 
  AND owner_id = auth.uid()::text
);

-- Create proper policies for thumbnails bucket (public read, authenticated write)
CREATE POLICY "allow_public_read_thumbnails" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'thumbnails');

CREATE POLICY "allow_authenticated_upload_thumbnails" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'thumbnails' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "allow_owner_update_thumbnails" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'thumbnails' 
  AND owner_id = auth.uid()::text
);

CREATE POLICY "allow_owner_delete_thumbnails" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'thumbnails' 
  AND owner_id = auth.uid()::text
);

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Fix videos table RLS if needed
-- Enable RLS on videos table
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Ensure proper policies exist for videos table
DROP POLICY IF EXISTS "Anyone can view public videos" ON public.videos;
DROP POLICY IF EXISTS "Users can create their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON public.videos;

CREATE POLICY "Anyone can view public videos" ON public.videos
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own videos" ON public.videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" ON public.videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" ON public.videos
  FOR DELETE USING (auth.uid() = user_id);

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';