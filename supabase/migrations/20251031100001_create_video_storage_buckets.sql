-- Create storage buckets for videos and thumbnails
-- This migration sets up storage buckets for video content with appropriate permissions

-- Insert video and thumbnail buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('videos', 'videos', true),
  ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Create policies for videos bucket (public read, authenticated write)
CREATE POLICY "allow_public_read_videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "allow_authenticated_upload_videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "allow_owner_update_videos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'videos' AND owner_id = auth.uid());

CREATE POLICY "allow_owner_delete_videos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'videos' AND owner_id = auth.uid());

-- Create policies for thumbnails bucket (public read, authenticated write)
CREATE POLICY "allow_public_read_thumbnails" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'thumbnails');

CREATE POLICY "allow_authenticated_upload_thumbnails" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "allow_owner_update_thumbnails" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'thumbnails' AND owner_id = auth.uid());

CREATE POLICY "allow_owner_delete_thumbnails" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'thumbnails' AND owner_id = auth.uid());

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';