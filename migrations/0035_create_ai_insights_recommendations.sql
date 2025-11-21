-- Migration: Create AI Insights and Recommendations
-- This migration creates tables for AI-powered insights, recommendations, and performance analysis

-- Create ai_insights_recommendations table (main insights table)
CREATE TABLE IF NOT EXISTS public.ai_insights_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL CHECK (category IN ('content', 'audience', 'engagement', 'revenue', 'growth', 'optimization', 'trending', 'health')),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    insight_text TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low', 'info')),
    confidence INTEGER CHECK (confidence >= 0 AND confidence >= 100),
    impact_score NUMERIC(5, 2),
    potential_impact VARCHAR(255),
    data_points JSONB,
    supporting_metrics JSONB,
    metadata JSONB,
    is_actionable BOOLEAN DEFAULT true,
    action_type VARCHAR(100),
    action_label VARCHAR(100),
    action_url TEXT,
    action_params JSONB,
    related_content_ids UUID[],
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'snoozed', 'dismissed')),
    status_changed_at TIMESTAMP WITH TIME ZONE,
    snoozed_until TIMESTAMP WITH TIME ZONE,
    dismissed_reason VARCHAR(255),
    viewed_at TIMESTAMP WITH TIME ZONE,
    acted_on_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create ai_performance_analysis table (detailed performance breakdowns)
CREATE TABLE IF NOT EXISTS public.ai_performance_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL CHECK (analysis_type IN ('daily', 'weekly', 'monthly', 'custom')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metrics JSONB NOT NULL,
    trends JSONB,
    comparisons JSONB,
    top_performers JSONB,
    bottom_performers JSONB,
    anomalies JSONB,
    predictions JSONB,
    recommendations TEXT[],
    summary TEXT,
    detailed_report_url TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_content_recommendations table (specific content recommendations)
CREATE TABLE IF NOT EXISTS public.ai_content_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(100) NOT NULL CHECK (recommendation_type IN ('topic', 'format', 'posting_time', 'hashtags', 'length', 'style', 'audience')),
    content_type VARCHAR(50) CHECK (content_type IN ('post', 'video', 'story', 'product', 'event', 'all')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    suggestion_text TEXT NOT NULL,
    reasoning TEXT,
    examples JSONB,
    confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
    potential_reach_increase NUMERIC(5, 2),
    potential_engagement_increase NUMERIC(5, 2),
    effort_level VARCHAR(50) CHECK (effort_level IN ('low', 'medium', 'high')),
    implementation_steps VARCHAR(255)[],
    tools_needed VARCHAR(255)[],
    estimated_results JSONB,
    was_implemented BOOLEAN DEFAULT false,
    implementation_date TIMESTAMP WITH TIME ZONE,
    result_metrics JSONB,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'not_relevant')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_audience_insights table (audience analysis)
CREATE TABLE IF NOT EXISTS public.ai_audience_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL CHECK (insight_type IN ('demographics', 'behavior', 'interests', 'growth', 'engagement', 'retention')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    insight_data JSONB NOT NULL,
    segments JSONB,
    cohort_analysis JSONB,
    growth_metrics JSONB,
    retention_metrics JSONB,
    churn_risk JSONB,
    recommendations TEXT[],
    comparison_period VARCHAR(50),
    trend_direction VARCHAR(20) CHECK (trend_direction IN ('up', 'down', 'stable')),
    trend_percentage NUMERIC(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_growth_strategies table (personalized growth plans)
CREATE TABLE IF NOT EXISTS public.ai_growth_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    strategy_name VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type VARCHAR(100) NOT NULL CHECK (goal_type IN ('followers', 'engagement', 'revenue', 'reach', 'retention')),
    goal_value INTEGER,
    goal_timeframe INTEGER,
    timeline_unit VARCHAR(20) CHECK (timeline_unit IN ('days', 'weeks', 'months')),
    current_value INTEGER,
    progress_percentage NUMERIC(5, 2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    tactics TEXT[],
    milestones JSONB,
    resources_needed JSONB,
    budget_required NUMERIC(12, 2),
    priority INTEGER DEFAULT 0,
    confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
    expected_results JSONB,
    actual_results JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_anomaly_detection table (unusual patterns)
CREATE TABLE IF NOT EXISTS public.ai_anomaly_detection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    anomaly_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    affected_metric VARCHAR(255),
    expected_value NUMERIC(12, 2),
    actual_value NUMERIC(12, 2),
    variance_percentage NUMERIC(5, 2),
    possible_causes TEXT[],
    recommended_actions TEXT[],
    data_context JSONB,
    flagged_for_review BOOLEAN DEFAULT false,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_insight_feedback table (track user feedback on insights)
CREATE TABLE IF NOT EXISTS public.ai_insight_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_id UUID NOT NULL REFERENCES public.ai_insights_recommendations(id) ON DELETE CASCADE,
    is_helpful BOOLEAN,
    rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    feedback_text TEXT,
    action_taken BOOLEAN,
    action_description TEXT,
    result_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, insight_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_recommendations_user_id ON public.ai_insights_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_recommendations_category ON public.ai_insights_recommendations(category);
CREATE INDEX IF NOT EXISTS idx_ai_insights_recommendations_priority ON public.ai_insights_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_ai_insights_recommendations_status ON public.ai_insights_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_recommendations_created_at ON public.ai_insights_recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_recommendations_expires_at ON public.ai_insights_recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_performance_analysis_user_id ON public.ai_performance_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_analysis_period ON public.ai_performance_analysis(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ai_performance_analysis_type ON public.ai_performance_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_content_recommendations_user_id ON public.ai_content_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_recommendations_type ON public.ai_content_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_content_recommendations_status ON public.ai_content_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_audience_insights_user_id ON public.ai_audience_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audience_insights_type ON public.ai_audience_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_growth_strategies_user_id ON public.ai_growth_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_growth_strategies_status ON public.ai_growth_strategies(status);
CREATE INDEX IF NOT EXISTS idx_ai_growth_strategies_goal_type ON public.ai_growth_strategies(goal_type);
CREATE INDEX IF NOT EXISTS idx_ai_anomaly_detection_user_id ON public.ai_anomaly_detection(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_anomaly_detection_severity ON public.ai_anomaly_detection(severity);
CREATE INDEX IF NOT EXISTS idx_ai_anomaly_detection_created_at ON public.ai_anomaly_detection(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insight_feedback_user_id ON public.ai_insight_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insight_feedback_insight_id ON public.ai_insight_feedback(insight_id);

-- Enable Row Level Security
ALTER TABLE public.ai_insights_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_performance_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audience_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_growth_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_anomaly_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insight_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_insights_recommendations
CREATE POLICY "Users can view their own insights"
ON public.ai_insights_recommendations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
ON public.ai_insights_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
ON public.ai_insights_recommendations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
ON public.ai_insights_recommendations FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for ai_performance_analysis
CREATE POLICY "Users can view their own analysis"
ON public.ai_performance_analysis FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis"
ON public.ai_performance_analysis FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_content_recommendations
CREATE POLICY "Users can view their own content recommendations"
ON public.ai_content_recommendations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content recommendations"
ON public.ai_content_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content recommendations"
ON public.ai_content_recommendations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_audience_insights
CREATE POLICY "Users can view their own audience insights"
ON public.ai_audience_insights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audience insights"
ON public.ai_audience_insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_growth_strategies
CREATE POLICY "Users can view their own growth strategies"
ON public.ai_growth_strategies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own growth strategies"
ON public.ai_growth_strategies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth strategies"
ON public.ai_growth_strategies FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_anomaly_detection
CREATE POLICY "Users can view their own anomalies"
ON public.ai_anomaly_detection FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert anomalies"
ON public.ai_anomaly_detection FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_insight_feedback
CREATE POLICY "Users can view their own feedback"
ON public.ai_insight_feedback FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
ON public.ai_insight_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
ON public.ai_insight_feedback FOR UPDATE
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

CREATE TRIGGER update_ai_insights_recommendations_updated_at
    BEFORE UPDATE ON public.ai_insights_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_performance_analysis_updated_at
    BEFORE UPDATE ON public.ai_performance_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_content_recommendations_updated_at
    BEFORE UPDATE ON public.ai_content_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_audience_insights_updated_at
    BEFORE UPDATE ON public.ai_audience_insights
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_growth_strategies_updated_at
    BEFORE UPDATE ON public.ai_growth_strategies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_anomaly_detection_updated_at
    BEFORE UPDATE ON public.ai_anomaly_detection
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insight_feedback_updated_at
    BEFORE UPDATE ON public.ai_insight_feedback
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions to authenticated users
GRANT ALL ON public.ai_insights_recommendations TO authenticated;
GRANT ALL ON public.ai_performance_analysis TO authenticated;
GRANT ALL ON public.ai_content_recommendations TO authenticated;
GRANT ALL ON public.ai_audience_insights TO authenticated;
GRANT ALL ON public.ai_growth_strategies TO authenticated;
GRANT ALL ON public.ai_anomaly_detection TO authenticated;
GRANT ALL ON public.ai_insight_feedback TO authenticated;
