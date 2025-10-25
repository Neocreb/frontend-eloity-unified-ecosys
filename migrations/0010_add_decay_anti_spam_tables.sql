-- Migration to add decay and anti-spam functionality for Enhanced Eloits Reward System

-- Create spam_detection table for tracking spam patterns
CREATE TABLE IF NOT EXISTS public.spam_detection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    action_type TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_spam BOOLEAN DEFAULT false,
    spam_reason TEXT,
    detected_by TEXT, -- 'system' or 'manual'
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trust_decay_log table for tracking trust score decay
CREATE TABLE IF NOT EXISTS public.trust_decay_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    previous_score NUMERIC(5,2) NOT NULL,
    new_score NUMERIC(5,2) NOT NULL,
    decay_reason TEXT NOT NULL,
    decay_amount NUMERIC(5,2) NOT NULL,
    activity_type TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spam_detection_user_id ON public.spam_detection(user_id);
CREATE INDEX IF NOT EXISTS idx_spam_detection_action_type ON public.spam_detection(action_type);
CREATE INDEX IF NOT EXISTS idx_spam_detection_timestamp ON public.spam_detection(timestamp);
CREATE INDEX IF NOT EXISTS idx_spam_detection_is_spam ON public.spam_detection(is_spam);
CREATE INDEX IF NOT EXISTS idx_trust_decay_log_user_id ON public.trust_decay_log(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_decay_log_created_at ON public.trust_decay_log(created_at);

-- Enable RLS (Row Level Security) on new tables
ALTER TABLE public.spam_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_decay_log ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Admins can manage spam detection" ON public.spam_detection
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can view their own trust decay logs" ON public.trust_decay_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert trust decay logs" ON public.trust_decay_log
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.spam_detection TO authenticated;
GRANT SELECT, INSERT ON public.trust_decay_log TO authenticated;