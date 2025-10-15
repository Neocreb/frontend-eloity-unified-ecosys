-- Create SMS templates table
CREATE TABLE IF NOT EXISTS public.sms_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create SMS logs table
CREATE TABLE IF NOT EXISTS public.sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    provider_response JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES public.users(id),
    template_id UUID REFERENCES public.sms_templates(id)
);

-- Create SMS providers table
CREATE TABLE IF NOT EXISTS public.sms_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- 'twilio', 'africastalking', 'termii'
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call sessions table
CREATE TABLE IF NOT EXISTS public.call_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id UUID NOT NULL REFERENCES public.users(id),
    callee_id UUID NOT NULL REFERENCES public.users(id),
    call_type VARCHAR(10) NOT NULL, -- 'voice' or 'video'
    status VARCHAR(20) NOT NULL, -- 'initiated', 'ringing', 'connected', 'ended', 'missed'
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    call_quality JSONB, -- For analytics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call quality metrics table
CREATE TABLE IF NOT EXISTS public.call_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.call_sessions(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    connection_time INTEGER, -- ms
    latency INTEGER, -- ms
    packet_loss FLOAT, -- percentage
    jitter INTEGER, -- ms
    bitrate INTEGER, -- kbps
    resolution VARCHAR(20), -- for video
    frame_rate INTEGER, -- for video
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create KYC verifications table
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    provider VARCHAR(50) NOT NULL, -- 'jumio', 'onfido', etc.
    verification_id VARCHAR(255), -- External provider ID
    status VARCHAR(20) NOT NULL, -- 'pending', 'approved', 'rejected'
    level INTEGER NOT NULL, -- 0-3
    documents JSONB, -- Document details
    verification_data JSONB, -- Provider response
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crypto orders table
CREATE TABLE IF NOT EXISTS public.crypto_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    pair VARCHAR(20) NOT NULL, -- 'BTC/USDT', 'ETH/USDT'
    order_type VARCHAR(10) NOT NULL, -- 'market', 'limit', 'stop_loss'
    side VARCHAR(4) NOT NULL, -- 'buy', 'sell'
    amount NUMERIC NOT NULL,
    price NUMERIC, -- For limit orders
    status VARCHAR(20) NOT NULL, -- 'open', 'filled', 'cancelled', 'partially_filled'
    exchange VARCHAR(50) NOT NULL, -- 'binance', 'coinbase', etc.
    exchange_order_id VARCHAR(255), -- External order ID
    filled_amount NUMERIC DEFAULT 0,
    average_price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    type VARCHAR(50) NOT NULL, -- 'message', 'call', 'trade', 'system'
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- Create user analytics table
CREATE TABLE IF NOT EXISTS public.user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    metric_type VARCHAR(50) NOT NULL,
    metric_data JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user stories table
CREATE TABLE IF NOT EXISTS public.user_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    media_url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL, -- 'image', 'video'
    caption TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create story views table
CREATE TABLE IF NOT EXISTS public.story_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.user_stories(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Create community events table
CREATE TABLE IF NOT EXISTS public.community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    max_attendees INTEGER,
    is_private BOOLEAN DEFAULT false,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event attendees table
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.community_events(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    status VARCHAR(20) DEFAULT 'interested', -- 'interested', 'going', 'attended'
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    hashtag VARCHAR(100),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    prize_pool NUMERIC,
    rules TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    cover_image_url TEXT,
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    followers_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    privacy_level VARCHAR(20) DEFAULT 'public', -- 'public', 'private', 'unlisted'
    cover_image_url TEXT,
    profile_image_url TEXT,
    member_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON public.sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON public.sms_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_call_sessions_caller_id ON public.call_sessions(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_callee_id ON public.call_sessions(callee_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_started_at ON public.call_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON public.kyc_verifications(status);
CREATE INDEX IF NOT EXISTS idx_crypto_orders_user_id ON public.crypto_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_orders_status ON public.crypto_orders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_metric_type ON public.user_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_recorded_at ON public.user_analytics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_user_stories_user_id ON public.user_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_created_at ON public.user_stories(created_at);
CREATE INDEX IF NOT EXISTS idx_user_stories_expires_at ON public.user_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON public.story_views(user_id);
CREATE INDEX IF NOT EXISTS idx_community_events_creator_id ON public.community_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_community_events_start_date ON public.community_events(start_date);
CREATE INDEX IF NOT EXISTS idx_community_events_event_type ON public.community_events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_creator_id ON public.challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenges_start_date ON public.challenges(start_date);
CREATE INDEX IF NOT EXISTS idx_pages_created_by ON public.pages(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);

-- Enable RLS (Row Level Security) on tables
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own SMS logs" ON public.sms_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own call sessions" ON public.call_sessions
    FOR SELECT USING (caller_id = auth.uid() OR callee_id = auth.uid());

CREATE POLICY "Users can view their own KYC verifications" ON public.kyc_verifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own crypto orders" ON public.crypto_orders
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own user analytics" ON public.user_analytics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own stories" ON public.user_stories
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own story views" ON public.story_views
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view public community events" ON public.community_events
    FOR SELECT USING (is_private = false);

CREATE POLICY "Users can view events they created" ON public.community_events
    FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Users can view events they're attending" ON public.community_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.event_attendees 
            WHERE event_attendees.event_id = community_events.id 
            AND event_attendees.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view event attendees for events they can see" ON public.event_attendees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.community_events 
            WHERE community_events.id = event_attendees.event_id 
            AND (
                community_events.is_private = false 
                OR community_events.creator_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.event_attendees ea 
                    WHERE ea.event_id = community_events.id 
                    AND ea.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can view challenges they created" ON public.challenges
    FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Users can view public pages" ON public.pages
    FOR SELECT USING (true);

CREATE POLICY "Users can view groups they created" ON public.groups
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can view public groups" ON public.groups
    FOR SELECT USING (privacy_level = 'public');

-- Grant necessary permissions
GRANT ALL ON public.sms_templates TO authenticated;
GRANT ALL ON public.sms_logs TO authenticated;
GRANT ALL ON public.sms_providers TO authenticated;
GRANT ALL ON public.call_sessions TO authenticated;
GRANT ALL ON public.call_quality_metrics TO authenticated;
GRANT ALL ON public.kyc_verifications TO authenticated;
GRANT ALL ON public.crypto_orders TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;
GRANT ALL ON public.user_analytics TO authenticated;
GRANT ALL ON public.user_stories TO authenticated;
GRANT ALL ON public.story_views TO authenticated;
GRANT ALL ON public.community_events TO authenticated;
GRANT ALL ON public.event_attendees TO authenticated;
GRANT ALL ON public.challenges TO authenticated;
GRANT ALL ON public.pages TO authenticated;
GRANT ALL ON public.groups TO authenticated;