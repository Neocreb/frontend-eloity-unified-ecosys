-- Fix RLS policies for posts table
-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own posts
CREATE POLICY "Users can insert their own posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view public posts and their own posts
CREATE POLICY "Users can view public posts and their own posts" ON public.posts
    FOR SELECT USING (
        privacy = 'public' 
        OR user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.followers 
            WHERE followers.following_id = posts.user_id 
            AND followers.follower_id = auth.uid()
        )
    );

-- Allow users to update their own posts
CREATE POLICY "Users can update their own posts" ON public.posts
    FOR UPDATE USING (user_id = auth.uid());

-- Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts" ON public.posts
    FOR DELETE USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON public.posts TO authenticated;