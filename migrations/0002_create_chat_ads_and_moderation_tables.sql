-- Create chat ads table
CREATE TABLE IF NOT EXISTS public.chat_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor TEXT,
    title TEXT NOT NULL,
    body TEXT,
    image_url TEXT,
    cta_label TEXT,
    cta_url TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    media_urls JSONB,
    metadata JSONB,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat threads table
CREATE TABLE IF NOT EXISTS public.chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    is_group BOOLEAN DEFAULT false,
    participants JSONB, -- Array of user IDs
    thread_type TEXT DEFAULT 'private',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flagged messages table for moderation
CREATE TABLE IF NOT EXISTS public.flagged_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    thread_id UUID NOT NULL,
    reporter_id UUID,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, resolved
    priority TEXT DEFAULT 'medium', -- low, medium, high
    auto_detected BOOLEAN DEFAULT false,
    confidence_score NUMERIC(5,2),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    roles TEXT[] DEFAULT ARRAY['content_admin'],
    permissions TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.admin_users(id),
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin activity logs table
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.admin_users(id),
    admin_name TEXT,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    category TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    last_modified_by UUID REFERENCES public.admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_flagged_messages_status ON public.flagged_messages(status);
CREATE INDEX IF NOT EXISTS idx_flagged_messages_priority ON public.flagged_messages(priority);
CREATE INDEX IF NOT EXISTS idx_flagged_messages_created_at ON public.flagged_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON public.admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_ads_is_active ON public.chat_ads(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_ads_priority ON public.chat_ads(priority);

-- Insert default admin user
INSERT INTO public.admin_users (user_id, email, name, roles, permissions, is_active)
SELECT 
    u.id,
    u.email,
    u.full_name,
    ARRAY['super_admin'],
    ARRAY[
        'admin.all',
        'users.all',
        'content.all',
        'marketplace.all',
        'crypto.all',
        'freelance.all',
        'settings.all',
        'moderation.all'
    ],
    true
FROM public.users u
WHERE u.email = 'admin@eloity.com'
ON CONFLICT (email) DO NOTHING;

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, category, description, is_public)
VALUES 
    ('platform_name', '"Eloity Platform"', 'general', 'Platform display name', true),
    ('maintenance_mode', 'false', 'general', 'Enable maintenance mode', false),
    ('chat_ads_enabled', 'true', 'chat', 'Enable chat advertisements', true),
    ('moderation_auto_flag_threshold', '0.85', 'moderation', 'AI confidence threshold for auto-flagging', false)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS (Row Level Security) on tables
ALTER TABLE public.chat_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all chat ads" ON public.chat_ads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admins can view all flagged messages" ON public.flagged_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admins can view all admin activity logs" ON public.admin_activity_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE admin_users.user_id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.chat_ads TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_threads TO authenticated;
GRANT ALL ON public.flagged_messages TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_sessions TO authenticated;
GRANT ALL ON public.admin_activity_logs TO authenticated;
GRANT ALL ON public.platform_settings TO authenticated;