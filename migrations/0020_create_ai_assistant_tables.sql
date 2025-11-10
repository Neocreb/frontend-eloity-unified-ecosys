-- Migration: Create AI Assistant tables
-- This migration creates tables for AI assistant functionality including assistants, insights, and interactions

-- Create ai_assistants table
CREATE TABLE IF NOT EXISTS public.ai_assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Edith',
    personality VARCHAR(50) NOT NULL DEFAULT 'friendly',
    preferences JSONB,
    learning_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT,
    actionable BOOLEAN DEFAULT false,
    action_label VARCHAR(100),
    action_url TEXT,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    category VARCHAR(100),
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create ai_interactions table
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assistant_id UUID REFERENCES public.ai_assistants(id) ON DELETE CASCADE,
    interaction_type VARCHAR(100) NOT NULL,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_assistants_user_id ON public.ai_assistants(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON public.ai_insights(type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON public.ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON public.ai_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_insights_expires_at ON public.ai_insights(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_type ON public.ai_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON public.ai_interactions(created_at);

-- Enable RLS (Row Level Security) on tables
ALTER TABLE public.ai_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own AI assistants" ON public.ai_assistants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI assistants" ON public.ai_assistants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI assistants" ON public.ai_assistants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI assistants" ON public.ai_assistants
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI insights" ON public.ai_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI insights" ON public.ai_insights
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own AI interactions" ON public.ai_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI interactions" ON public.ai_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.ai_assistants TO authenticated;
GRANT ALL ON public.ai_insights TO authenticated;
GRANT ALL ON public.ai_interactions TO authenticated;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_assistants_updated_at 
    BEFORE UPDATE ON public.ai_assistants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();