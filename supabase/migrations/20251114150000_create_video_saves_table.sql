-- Create video_saves table
CREATE TABLE IF NOT EXISTS public.video_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_saves_video_id ON public.video_saves(video_id);
CREATE INDEX IF NOT EXISTS idx_video_saves_user_id ON public.video_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_video_saves_created_at ON public.video_saves(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.video_saves ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own video saves" ON public.video_saves
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own video saves" ON public.video_saves
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own video saves" ON public.video_saves
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all video saves" ON public.video_saves
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON public.video_saves TO authenticated;
GRANT ALL ON public.video_saves TO anon;