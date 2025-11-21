-- Create post_preferences table for tracking user preferences on specific posts
CREATE TABLE IF NOT EXISTS public.post_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    interested BOOLEAN,
    hidden BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);

-- Create post_reports table for tracking reported posts
CREATE TABLE IF NOT EXISTS public.post_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, reporter_id)
);

-- Create post_edit_history table for tracking post edits
CREATE TABLE IF NOT EXISTS public.post_edit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    edited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_post_preferences_user_id ON public.post_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_post_preferences_post_id ON public.post_preferences(post_id);
CREATE INDEX IF NOT EXISTS idx_post_preferences_hidden ON public.post_preferences(hidden);
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reporter_id ON public.post_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON public.post_reports(status);
CREATE INDEX IF NOT EXISTS idx_post_edit_history_post_id ON public.post_edit_history(post_id);
CREATE INDEX IF NOT EXISTS idx_post_edit_history_edited_at ON public.post_edit_history(edited_at);

-- Enable Row Level Security
ALTER TABLE public.post_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_edit_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_preferences
CREATE POLICY "Users can view their own post preferences"
ON public.post_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own post preferences"
ON public.post_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own post preferences"
ON public.post_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post preferences"
ON public.post_preferences FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for post_reports
CREATE POLICY "Users can view their own reports"
ON public.post_reports FOR SELECT
USING (auth.uid() = reporter_id OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Users can insert reports"
ON public.post_reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports"
ON public.post_reports FOR UPDATE
USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'))
WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- RLS Policies for post_edit_history
CREATE POLICY "Users can view edit history of their own posts"
ON public.post_edit_history FOR SELECT
USING (
    edited_by = auth.uid() OR 
    post_id IN (SELECT id FROM public.posts WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert edit history for their own posts"
ON public.post_edit_history FOR INSERT
WITH CHECK (
    edited_by = auth.uid()
);
