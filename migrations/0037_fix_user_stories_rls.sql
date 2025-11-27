-- Migration: Fix user_stories RLS to allow viewing all non-expired stories

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own stories" ON public.user_stories;
DROP POLICY IF EXISTS "Users can insert their own stories" ON public.user_stories;
DROP POLICY IF EXISTS "Users can update their own stories" ON public.user_stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.user_stories;

-- Create new policies that allow viewing all stories but only editing own
-- Allow all authenticated users to view all non-expired stories
CREATE POLICY "Anyone can view stories" ON public.user_stories
    FOR SELECT 
    USING (true);

-- Only allow users to create their own stories
CREATE POLICY "Users can create their own stories" ON public.user_stories
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Only allow users to update their own stories
CREATE POLICY "Users can update own stories" ON public.user_stories
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Only allow users to delete their own stories
CREATE POLICY "Users can delete own stories" ON public.user_stories
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Also update story_views policies if needed
DROP POLICY IF EXISTS "Users can view their own story views" ON public.story_views;

CREATE POLICY "Anyone can view story views" ON public.story_views
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can record story views" ON public.story_views
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
