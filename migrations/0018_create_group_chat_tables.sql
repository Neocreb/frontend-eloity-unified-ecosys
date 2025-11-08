-- Migration: Create group chat tables
-- This migration creates the necessary tables for group chat functionality

-- Create group chat threads table
CREATE TABLE IF NOT EXISTS public.group_chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL DEFAULT 'group',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar TEXT,
    cover TEXT,
    privacy VARCHAR(20) DEFAULT 'public' NOT NULL,
    member_count INTEGER DEFAULT 0 NOT NULL,
    post_count INTEGER DEFAULT 0 NOT NULL,
    admin_ids JSONB DEFAULT '[]'::jsonb,
    moderator_ids JSONB DEFAULT '[]'::jsonb,
    rules JSONB,
    tags JSONB DEFAULT '[]'::jsonb,
    category VARCHAR(50),
    location TEXT,
    website TEXT,
    join_approval_required BOOLEAN DEFAULT false,
    post_approval_required BOOLEAN DEFAULT false,
    allow_events BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create group participants table
CREATE TABLE IF NOT EXISTS public.group_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.group_chat_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    role VARCHAR(20) DEFAULT 'member' NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
    invited_by UUID REFERENCES auth.users(id),
    mute_notifications BOOLEAN DEFAULT false,
    permissions JSONB,
    last_read_message_id UUID,
    last_seen TIMESTAMP DEFAULT NOW()
);

-- Create group messages table
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.group_chat_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT,
    type VARCHAR(20) DEFAULT 'text' NOT NULL,
    media_urls JSONB DEFAULT '[]'::jsonb,
    mentions JSONB DEFAULT '[]'::jsonb,
    hashtags JSONB DEFAULT '[]'::jsonb,
    location TEXT,
    reply_to_message_id UUID REFERENCES public.group_messages(id),
    is_pinned BOOLEAN DEFAULT false,
    pinned_by UUID REFERENCES auth.users(id),
    pinned_at TIMESTAMP,
    edited BOOLEAN DEFAULT false,
    deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create group invite links table
CREATE TABLE IF NOT EXISTS public.group_invite_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.group_chat_threads(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    max_uses INTEGER,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_chat_threads_created_by ON public.group_chat_threads(created_by);
CREATE INDEX IF NOT EXISTS idx_group_chat_threads_category ON public.group_chat_threads(category);
CREATE INDEX IF NOT EXISTS idx_group_chat_threads_privacy ON public.group_chat_threads(privacy);
CREATE INDEX IF NOT EXISTS idx_group_participants_group_id ON public.group_participants(group_id);
CREATE INDEX IF NOT EXISTS idx_group_participants_user_id ON public.group_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_group_participants_group_user ON public.group_participants(group_id, user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_thread_id ON public.group_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender_id ON public.group_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON public.group_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_invite_links_code ON public.group_invite_links(code);
CREATE INDEX IF NOT EXISTS idx_group_invite_links_group_id ON public.group_invite_links(group_id);

-- Enable RLS (Row Level Security) on tables
ALTER TABLE public.group_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invite_links ENABLE ROW LEVEL SECURITY;

-- Create policies for group chat threads
CREATE POLICY "Users can view group chat threads they are members of" ON public.group_chat_threads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_participants 
            WHERE group_participants.group_id = group_chat_threads.id 
            AND group_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create group chat threads" ON public.group_chat_threads
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their group chat threads" ON public.group_chat_threads
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their group chat threads" ON public.group_chat_threads
    FOR DELETE USING (auth.uid() = created_by);

-- Create policies for group participants
CREATE POLICY "Users can view group participants for groups they belong to" ON public.group_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_participants gp
            WHERE gp.group_id = group_participants.group_id
            AND gp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join groups through invite links" ON public.group_participants
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.group_chat_threads 
            WHERE group_chat_threads.id = group_participants.group_id
        )
    );

CREATE POLICY "Users can leave groups" ON public.group_participants
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for group messages
CREATE POLICY "Users can view messages in groups they belong to" ON public.group_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_participants 
            WHERE group_participants.group_id = group_messages.thread_id 
            AND group_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can send messages" ON public.group_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.group_participants 
            WHERE group_participants.group_id = group_messages.thread_id 
            AND group_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON public.group_messages
    FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" ON public.group_messages
    FOR DELETE USING (auth.uid() = sender_id);

-- Create policies for group invite links
CREATE POLICY "Users can view invite links for groups they admin" ON public.group_invite_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_participants 
            WHERE group_participants.group_id = group_invite_links.group_id 
            AND group_participants.user_id = auth.uid()
            AND group_participants.role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Group admins can create invite links" ON public.group_invite_links
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_participants 
            WHERE group_participants.group_id = group_invite_links.group_id 
            AND group_participants.user_id = auth.uid()
            AND group_participants.role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Group admins can update invite links" ON public.group_invite_links
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_participants 
            WHERE group_participants.group_id = group_invite_links.group_id 
            AND group_participants.user_id = auth.uid()
            AND group_participants.role IN ('admin', 'owner')
        )
    );

CREATE POLICY "Group admins can delete invite links" ON public.group_invite_links
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.group_participants 
            WHERE group_participants.group_id = group_invite_links.group_id 
            AND group_participants.user_id = auth.uid()
            AND group_participants.role IN ('admin', 'owner')
        )
    );

-- Grant permissions
GRANT ALL ON public.group_chat_threads TO authenticated;
GRANT ALL ON public.group_participants TO authenticated;
GRANT ALL ON public.group_messages TO authenticated;
GRANT ALL ON public.group_invite_links TO authenticated;