-- Migration: Ensure user_stories table exists with proper setup

-- Drop and recreate from scratch to ensure clean state
DROP TABLE IF EXISTS public.story_views CASCADE;
DROP TABLE IF EXISTS public.user_stories CASCADE;

-- Create user_stories table
CREATE TABLE public.user_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
    caption TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create story_views table
CREATE TABLE public.story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.user_stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_stories_user_id ON public.user_stories(user_id);
CREATE INDEX idx_user_stories_created_at ON public.user_stories(created_at DESC);
CREATE INDEX idx_user_stories_expires_at ON public.user_stories(expires_at);
CREATE INDEX idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX idx_story_views_user_id ON public.story_views(user_id);

-- Enable RLS
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own stories" ON public.user_stories;
DROP POLICY IF EXISTS "Users can insert their own stories" ON public.user_stories;
DROP POLICY IF EXISTS "Users can update their own stories" ON public.user_stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.user_stories;
DROP POLICY IF EXISTS "Users can view their own story views" ON public.story_views;
DROP POLICY IF EXISTS "Anyone can view stories" ON public.user_stories;
DROP POLICY IF EXISTS "Users can create their own stories" ON public.user_stories;
DROP POLICY IF EXISTS "Users can update own stories" ON public.user_stories;
DROP POLICY IF EXISTS "Users can delete own stories" ON public.user_stories;
DROP POLICY IF EXISTS "Anyone can view story views" ON public.story_views;
DROP POLICY IF EXISTS "Users can record story views" ON public.story_views;

-- Create new policies - allow public viewing, private creation/modification
CREATE POLICY "Anyone can view stories"
    ON public.user_stories FOR SELECT
    USING (true);

CREATE POLICY "Users can create own stories"
    ON public.user_stories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories"
    ON public.user_stories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories"
    ON public.user_stories FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view story views"
    ON public.story_views FOR SELECT
    USING (true);

CREATE POLICY "Users can record story views"
    ON public.story_views FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_views TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Refresh schema cache (if supported)
NOTIFY pgrst, 'reload schema';
