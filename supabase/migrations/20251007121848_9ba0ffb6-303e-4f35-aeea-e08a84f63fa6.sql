-- Add privacy column to posts table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'posts' 
    AND column_name = 'privacy'
  ) THEN
    ALTER TABLE public.posts 
    ADD COLUMN privacy text NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private'));
  END IF;
END $$;

-- Create index on privacy for efficient queries
CREATE INDEX IF NOT EXISTS idx_posts_privacy ON public.posts(privacy);

-- Create index on user_id and privacy for user-specific queries
CREATE INDEX IF NOT EXISTS idx_posts_user_privacy ON public.posts(user_id, privacy);

-- Update RLS policies for posts table to respect privacy settings
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.posts;

-- New policy: Users can view public posts
CREATE POLICY "Users can view public posts" 
ON public.posts 
FOR SELECT 
USING (privacy = 'public');

-- New policy: Users can view their own posts regardless of privacy
CREATE POLICY "Users can view own posts" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = user_id);

-- New policy: Users can view friends-only posts if they follow each other
CREATE POLICY "Users can view friends posts" 
ON public.posts 
FOR SELECT 
USING (
  privacy = 'friends' 
  AND EXISTS (
    SELECT 1 FROM public.followers f1
    WHERE f1.follower_id = auth.uid() 
    AND f1.following_id = posts.user_id
  )
  AND EXISTS (
    SELECT 1 FROM public.followers f2
    WHERE f2.follower_id = posts.user_id 
    AND f2.following_id = auth.uid()
  )
);

COMMENT ON COLUMN public.posts.privacy IS 'Privacy setting: public, friends (mutual follows), or private (owner only)';
