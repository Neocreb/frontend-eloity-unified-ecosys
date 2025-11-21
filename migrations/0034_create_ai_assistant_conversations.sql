-- Migration: Create AI Assistant Conversations
-- This migration creates tables for tracking AI assistant conversations and message history

-- Create ai_assistant_conversations table (conversation threads)
CREATE TABLE IF NOT EXISTS public.ai_assistant_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    context VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (context IN ('general', 'content_creation', 'analytics', 'growth', 'monetization', 'troubleshooting')),
    model VARCHAR(100) NOT NULL DEFAULT 'edith-v1',
    system_prompt TEXT,
    temperature NUMERIC(3, 2) DEFAULT 0.7,
    message_count INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_assistant_messages table (individual messages in conversations)
CREATE TABLE IF NOT EXISTS public.ai_assistant_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_assistant_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'code', 'image', 'file')),
    message_index INTEGER NOT NULL,
    metadata JSONB,
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    is_edited BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    feedback_rating INTEGER CHECK (feedback_rating IS NULL OR (feedback_rating >= 1 AND feedback_rating <= 5)),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_assistant_actions table (track actions suggested/taken by assistant)
CREATE TABLE IF NOT EXISTS public.ai_assistant_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.ai_assistant_conversations(id) ON DELETE SET NULL,
    message_id UUID REFERENCES public.ai_assistant_messages(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    action_title VARCHAR(255),
    action_description TEXT,
    action_url TEXT,
    parameters JSONB,
    is_executed BOOLEAN DEFAULT false,
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_conversation_context table (store context for better conversations)
CREATE TABLE IF NOT EXISTS public.ai_conversation_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.ai_assistant_conversations(id) ON DELETE CASCADE,
    context_type VARCHAR(100) NOT NULL CHECK (context_type IN ('user_profile', 'recent_activity', 'content_metrics', 'goals', 'preferences')),
    context_key VARCHAR(255) NOT NULL,
    context_value JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, context_type, context_key)
);

-- Create ai_assistant_preferences table (personalization)
CREATE TABLE IF NOT EXISTS public.ai_assistant_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    personality VARCHAR(50) DEFAULT 'professional' CHECK (personality IN ('professional', 'friendly', 'casual', 'enthusiastic')),
    tone VARCHAR(50) DEFAULT 'balanced' CHECK (tone IN ('formal', 'casual', 'balanced')),
    response_length VARCHAR(50) DEFAULT 'balanced' CHECK (response_length IN ('brief', 'balanced', 'detailed')),
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    conversation_history_retention_days INTEGER DEFAULT 90,
    auto_clear_old_conversations BOOLEAN DEFAULT true,
    disable_feedback BOOLEAN DEFAULT false,
    disable_analytics BOOLEAN DEFAULT false,
    suggestions_enabled BOOLEAN DEFAULT true,
    reminder_frequency VARCHAR(50) DEFAULT 'weekly' CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly', 'never')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_assistant_conversations_user_id ON public.ai_assistant_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_conversations_created_at ON public.ai_assistant_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_conversations_is_archived ON public.ai_assistant_conversations(is_archived);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_conversations_context ON public.ai_assistant_conversations(context);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_messages_conversation_id ON public.ai_assistant_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_messages_user_id ON public.ai_assistant_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_messages_role ON public.ai_assistant_messages(role);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_messages_created_at ON public.ai_assistant_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_messages_feedback_rating ON public.ai_assistant_messages(feedback_rating);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_actions_user_id ON public.ai_assistant_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_actions_conversation_id ON public.ai_assistant_actions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_actions_is_executed ON public.ai_assistant_actions(is_executed);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_context_user_id ON public.ai_conversation_context(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_context_conversation_id ON public.ai_conversation_context(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_context_type ON public.ai_conversation_context(context_type);
CREATE INDEX IF NOT EXISTS idx_ai_assistant_preferences_user_id ON public.ai_assistant_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE public.ai_assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistant_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistant_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_assistant_conversations
CREATE POLICY "Users can view their own conversations"
ON public.ai_assistant_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
ON public.ai_assistant_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.ai_assistant_conversations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.ai_assistant_conversations FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for ai_assistant_messages
CREATE POLICY "Users can view their own conversation messages"
ON public.ai_assistant_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
ON public.ai_assistant_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
ON public.ai_assistant_messages FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.ai_assistant_messages FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for ai_assistant_actions
CREATE POLICY "Users can view their own actions"
ON public.ai_assistant_actions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions"
ON public.ai_assistant_actions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actions"
ON public.ai_assistant_actions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_conversation_context
CREATE POLICY "Users can view their own context"
ON public.ai_conversation_context FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own context"
ON public.ai_conversation_context FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own context"
ON public.ai_conversation_context FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_assistant_preferences
CREATE POLICY "Users can view their own preferences"
ON public.ai_assistant_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
ON public.ai_assistant_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.ai_assistant_preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_assistant_conversations_updated_at
    BEFORE UPDATE ON public.ai_assistant_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_assistant_messages_updated_at
    BEFORE UPDATE ON public.ai_assistant_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_assistant_actions_updated_at
    BEFORE UPDATE ON public.ai_assistant_actions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_conversation_context_updated_at
    BEFORE UPDATE ON public.ai_conversation_context
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_assistant_preferences_updated_at
    BEFORE UPDATE ON public.ai_assistant_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions to authenticated users
GRANT ALL ON public.ai_assistant_conversations TO authenticated;
GRANT ALL ON public.ai_assistant_messages TO authenticated;
GRANT ALL ON public.ai_assistant_actions TO authenticated;
GRANT ALL ON public.ai_conversation_context TO authenticated;
GRANT ALL ON public.ai_assistant_preferences TO authenticated;
