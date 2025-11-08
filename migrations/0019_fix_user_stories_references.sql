-- Migration: Fix user stories table references
-- This migration fixes the foreign key references in user_stories and story_views tables
-- to point to auth.users instead of public.users

-- Drop existing tables
DROP TABLE IF EXISTS public.story_views;
DROP TABLE IF EXISTS public.user_stories;

-- Recreate user stories table with correct references
CREATE TABLE IF NOT EXISTS public.user_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    media_url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL, -- 'image', 'video'
    caption TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate story views table with correct references
CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.user_stories(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_stories_user_id ON public.user_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_created_at ON public.user_stories(created_at);
CREATE INDEX IF NOT EXISTS idx_user_stories_expires_at ON public.user_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON public.story_views(user_id);

-- Enable RLS (Row Level Security) on tables
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own stories" ON public.user_stories
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own stories" ON public.user_stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" ON public.user_stories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" ON public.user_stories
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own story views" ON public.story_views
    FOR SELECT USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.user_stories TO authenticated;
GRANT ALL ON public.story_views TO authenticated;