-- Fix videos table and policies
-- This migration ensures the videos table exists with proper structure and RLS policies

-- First, create the videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  tags TEXT[],
  is_monetized BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create related tables if they don't exist
CREATE TABLE IF NOT EXISTS public.video_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  watch_duration INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.video_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.video_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.video_comments(id) ON DELETE CASCADE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ensure RLS is enabled on all video-related tables
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read for public videos" ON public.videos;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.videos;
DROP POLICY IF EXISTS "Allow owner to update/delete" ON public.videos;
DROP POLICY IF EXISTS "Anyone can view public videos" ON public.videos;
DROP POLICY IF EXISTS "Users can create their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON public.videos;

-- Create proper RLS policies for videos table
-- Public read access for public videos
CREATE POLICY "Allow public read for public videos"
  ON public.videos
  FOR SELECT
  USING (is_public = TRUE);

-- Authenticated users can insert their own videos
CREATE POLICY "Allow insert for authenticated users"
  ON public.videos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owners can update and delete their own videos
CREATE POLICY "Allow owner to update/delete"
  ON public.videos
  FOR UPDATE, DELETE
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT ON public.videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.videos TO authenticated;

-- Policies for video_views
DROP POLICY IF EXISTS "Users can view their own video views" ON public.video_views;
DROP POLICY IF EXISTS "Anyone can create video views" ON public.video_views;

CREATE POLICY "Users can view their own video views"
  ON public.video_views
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can create video views"
  ON public.video_views
  FOR INSERT
  WITH CHECK (true);

GRANT SELECT, INSERT ON public.video_views TO anon, authenticated;

-- Policies for video_likes
DROP POLICY IF EXISTS "Anyone can view video likes" ON public.video_likes;
DROP POLICY IF EXISTS "Users can create their own video likes" ON public.video_likes;
DROP POLICY IF EXISTS "Users can delete their own video likes" ON public.video_likes;

CREATE POLICY "Anyone can view video likes"
  ON public.video_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own video likes"
  ON public.video_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video likes"
  ON public.video_likes
  FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.video_likes TO anon, authenticated;

-- Policies for video_comments
DROP POLICY IF EXISTS "Anyone can view video comments" ON public.video_comments;
DROP POLICY IF EXISTS "Users can create video comments" ON public.video_comments;
DROP POLICY IF EXISTS "Users can update their own video comments" ON public.video_comments;
DROP POLICY IF EXISTS "Users can delete their own video comments" ON public.video_comments;

CREATE POLICY "Anyone can view video comments"
  ON public.video_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create video comments"
  ON public.video_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video comments"
  ON public.video_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video comments"
  ON public.video_comments
  FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_comments TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_category ON public.videos(category);
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON public.video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_user_id ON public.video_views(user_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON public.video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON public.video_comments(video_id);

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';