-- Add followers_count column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- Add following_count column to profiles table (if not exists)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_followers_count ON public.profiles (followers_count);
CREATE INDEX IF NOT EXISTS idx_profiles_following_count ON public.profiles (following_count);

-- Update existing records with default values (if any NULL values exist)
UPDATE public.profiles 
SET followers_count = COALESCE(followers_count, 0),
    following_count = COALESCE(following_count, 0)
WHERE followers_count IS NULL OR following_count IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.followers_count IS 'Number of followers for this user';
COMMENT ON COLUMN public.profiles.following_count IS 'Number of users this user is following';