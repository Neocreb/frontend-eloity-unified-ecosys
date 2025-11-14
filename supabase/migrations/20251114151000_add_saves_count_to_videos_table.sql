-- Add saves_count column to videos table
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS saves_count INTEGER NOT NULL DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_videos_saves_count ON public.videos(saves_count);

-- Update existing videos to have saves_count = 0 (already set by default, but ensuring consistency)
UPDATE public.videos 
SET saves_count = 0 
WHERE saves_count IS NULL;