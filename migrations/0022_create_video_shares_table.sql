-- Create video_shares table
CREATE TABLE IF NOT EXISTS public.video_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_shares_video_id ON public.video_shares(video_id);
CREATE INDEX IF NOT EXISTS idx_video_shares_user_id ON public.video_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_video_shares_platform ON public.video_shares(platform);
CREATE INDEX IF NOT EXISTS idx_video_shares_created_at ON public.video_shares(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.video_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own video shares" ON public.video_shares
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own video shares" ON public.video_shares
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all video shares" ON public.video_shares
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.video_shares TO authenticated;
GRANT ALL ON public.video_shares TO anon;