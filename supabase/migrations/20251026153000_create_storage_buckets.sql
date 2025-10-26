-- Create storage buckets for the Eloity platform
-- This migration sets up all necessary storage buckets with appropriate permissions

-- Create buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('posts', 'posts', true),
  ('stories', 'stories', true),
  ('products', 'products', true),
  ('documents', 'documents', false),
  ('portfolio', 'portfolio', true),
  ('chat-attachments', 'chat-attachments', false),
  ('verification', 'verification', false),
  ('admin-assets', 'admin-assets', false),
  ('temp', 'temp', false)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Create policies for avatars bucket (public read, authenticated write)
CREATE POLICY "allow_public_read_avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "allow_authenticated_upload_avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "allow_owner_update_avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND owner_id = auth.uid());

CREATE POLICY "allow_owner_delete_avatars" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND owner_id = auth.uid());

-- Create policies for posts bucket (public read, authenticated write)
CREATE POLICY "allow_public_read_posts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'posts');

CREATE POLICY "allow_authenticated_upload_posts" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "allow_owner_update_posts" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'posts' AND owner_id = auth.uid());

CREATE POLICY "allow_owner_delete_posts" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'posts' AND owner_id = auth.uid());

-- Create policies for stories bucket (public read, authenticated write)
CREATE POLICY "allow_public_read_stories" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'stories');

CREATE POLICY "allow_authenticated_upload_stories" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'stories' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "allow_owner_update_stories" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'stories' AND owner_id = auth.uid());

CREATE POLICY "allow_owner_delete_stories" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'stories' AND owner_id = auth.uid());

-- Create policies for products bucket (public read, authenticated write)
CREATE POLICY "allow_public_read_products" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "allow_authenticated_upload_products" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "allow_owner_update_products" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'products' AND owner_id = auth.uid());

CREATE POLICY "allow_owner_delete_products" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'products' AND owner_id = auth.uid());

-- Create policies for documents bucket (private - owner only)
CREATE POLICY "allow_owner_access_documents" 
ON storage.objects FOR ALL 
USING (bucket_id = 'documents' AND owner_id = auth.uid());

-- Create policies for portfolio bucket (public read, authenticated write)
CREATE POLICY "allow_public_read_portfolio" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'portfolio');

CREATE POLICY "allow_authenticated_upload_portfolio" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "allow_owner_update_portfolio" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'portfolio' AND owner_id = auth.uid());

CREATE POLICY "allow_owner_delete_portfolio" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'portfolio' AND owner_id = auth.uid());

-- Create policies for chat-attachments bucket (private - owner only)
CREATE POLICY "allow_owner_access_chat_attachments" 
ON storage.objects FOR ALL 
USING (bucket_id = 'chat-attachments' AND owner_id = auth.uid());

-- Create policies for verification bucket (private - owner only)
CREATE POLICY "allow_owner_access_verification" 
ON storage.objects FOR ALL 
USING (bucket_id = 'verification' AND owner_id = auth.uid());

-- Create policies for admin-assets bucket (private - owner only)
CREATE POLICY "allow_owner_access_admin_assets" 
ON storage.objects FOR ALL 
USING (bucket_id = 'admin-assets' AND owner_id = auth.uid());

-- Create policies for temp bucket (private - owner only)
CREATE POLICY "allow_owner_access_temp" 
ON storage.objects FOR ALL 
USING (bucket_id = 'temp' AND owner_id = auth.uid());

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;