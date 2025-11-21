-- Migration: Create AI Generation History
-- This migration creates tables for tracking AI-generated content including images, videos, and text

-- Create ai_generation_jobs table (for async generation tracking)
CREATE TABLE IF NOT EXISTS public.ai_generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'video', 'text', 'edit')),
    prompt TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    model VARCHAR(100) NOT NULL DEFAULT 'edith-v1',
    parameters JSONB,
    result_url TEXT,
    result_data JSONB,
    error_message TEXT,
    cost_tokens INTEGER DEFAULT 0,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create ai_generated_content table (final stored generation history)
CREATE TABLE IF NOT EXISTS public.ai_generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    generation_job_id UUID REFERENCES public.ai_generation_jobs(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'video', 'text', 'audio')),
    title VARCHAR(255),
    description TEXT,
    prompt TEXT NOT NULL,
    content_url TEXT,
    thumbnail_url TEXT,
    storage_path VARCHAR(512),
    metadata JSONB,
    tags VARCHAR(100)[],
    model_used VARCHAR(100),
    generation_time_ms INTEGER,
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    usage_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    content_type VARCHAR(100),
    file_size_bytes BIGINT,
    dimensions JSONB,
    duration_seconds NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create ai_content_usage table (track where generated content is used)
CREATE TABLE IF NOT EXISTS public.ai_content_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    generated_content_id UUID NOT NULL REFERENCES public.ai_generated_content(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    story_id UUID REFERENCES public.user_stories(id) ON DELETE SET NULL,
    usage_type VARCHAR(50) NOT NULL CHECK (usage_type IN ('post', 'product', 'story', 'profile', 'ad', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_generation_templates table (save favorite prompts/templates)
CREATE TABLE IF NOT EXISTS public.ai_generation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'video', 'text', 'edit')),
    prompt_template TEXT NOT NULL,
    default_parameters JSONB,
    tags VARCHAR(100)[],
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_generation_jobs_user_id ON public.ai_generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_jobs_status ON public.ai_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_generation_jobs_type ON public.ai_generation_jobs(type);
CREATE INDEX IF NOT EXISTS idx_ai_generation_jobs_created_at ON public.ai_generation_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_user_id ON public.ai_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_type ON public.ai_generated_content(type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_created_at ON public.ai_generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_is_archived ON public.ai_generated_content(is_archived);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_is_favorite ON public.ai_generated_content(is_favorite);
CREATE INDEX IF NOT EXISTS idx_ai_content_usage_user_id ON public.ai_content_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_usage_generated_content_id ON public.ai_content_usage(generated_content_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_usage_post_id ON public.ai_content_usage(post_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_templates_user_id ON public.ai_generation_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_templates_type ON public.ai_generation_templates(type);

-- Enable Row Level Security
ALTER TABLE public.ai_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_generation_jobs
CREATE POLICY "Users can view their own generation jobs"
ON public.ai_generation_jobs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation jobs"
ON public.ai_generation_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generation jobs"
ON public.ai_generation_jobs FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generation jobs"
ON public.ai_generation_jobs FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for ai_generated_content
CREATE POLICY "Users can view their own generated content"
ON public.ai_generated_content FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own generated content"
ON public.ai_generated_content FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated content"
ON public.ai_generated_content FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated content"
ON public.ai_generated_content FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for ai_content_usage
CREATE POLICY "Users can view their own content usage"
ON public.ai_content_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content usage"
ON public.ai_content_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content usage"
ON public.ai_content_usage FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for ai_generation_templates
CREATE POLICY "Users can view their own templates and public templates"
ON public.ai_generation_templates FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own templates"
ON public.ai_generation_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.ai_generation_templates FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.ai_generation_templates FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_generation_jobs_updated_at
    BEFORE UPDATE ON public.ai_generation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_generated_content_updated_at
    BEFORE UPDATE ON public.ai_generated_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_generation_templates_updated_at
    BEFORE UPDATE ON public.ai_generation_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions to authenticated users
GRANT ALL ON public.ai_generation_jobs TO authenticated;
GRANT ALL ON public.ai_generated_content TO authenticated;
GRANT ALL ON public.ai_content_usage TO authenticated;
GRANT ALL ON public.ai_generation_templates TO authenticated;
