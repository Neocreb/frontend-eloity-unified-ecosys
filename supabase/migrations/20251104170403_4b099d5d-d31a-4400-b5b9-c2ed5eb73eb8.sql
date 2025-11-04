-- Add foreign key constraint from videos.user_id to profiles.user_id
-- This establishes the proper relationship for Supabase queries

-- Drop existing constraint if it exists
ALTER TABLE public.videos 
DROP CONSTRAINT IF EXISTS videos_user_id_fkey;

-- Add the proper foreign key constraint
ALTER TABLE public.videos
ADD CONSTRAINT videos_user_id_profiles_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';