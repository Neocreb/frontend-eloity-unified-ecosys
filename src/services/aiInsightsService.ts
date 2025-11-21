import { supabase } from '@/integrations/supabase/client';

export interface InsightRecommendation {
  id: string;
  user_id: string;
  category: 'content' | 'audience' | 'engagement' | 'revenue' | 'growth' | 'optimization' | 'trending' | 'health';
  type: string;
  title: string;
  description?: string;
  insight_text: string;
  priority: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence?: number;
  impact_score?: number;
  potential_impact?: string;
  data_points?: Record<string, any>;
  supporting_metrics?: Record<string, any>;
  is_actionable?: boolean;
  action_type?: string;
  action_label?: string;
  action_url?: string;
  action_params?: Record<string, any>;
  status: 'active' | 'archived' | 'snoozed' | 'dismissed';
  viewed_at?: string;
  acted_on_at?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface PerformanceAnalysis {
  id: string;
  user_id: string;
  analysis_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  period_start: string;
  period_end: string;
  metrics: Record<string, any>;
  trends?: Record<string, any>;
  comparisons?: Record<string, any>;
  top_performers?: Record<string, any>;
  anomalies?: Record<string, any>;
  predictions?: Record<string, any>;
  recommendations?: string[];
  summary?: string;
  created_at: string;
}

export interface ContentRecommendation {
  id: string;
  user_id: string;
  recommendation_type: 'topic' | 'format' | 'posting_time' | 'hashtags' | 'length' | 'style' | 'audience';
  content_type?: 'post' | 'video' | 'story' | 'product' | 'event' | 'all';
  title: string;
  description?: string;
  suggestion_text: string;
  reasoning?: string;
  examples?: Record<string, any>;
  confidence_level?: number;
  potential_reach_increase?: number;
  effort_level?: 'low' | 'medium' | 'high';
  was_implemented?: boolean;
  status: 'new' | 'in_progress' | 'completed' | 'not_relevant';
  created_at: string;
}

export interface AudienceInsight {
  id: string;
  user_id: string;
  insight_type: 'demographics' | 'behavior' | 'interests' | 'growth' | 'engagement' | 'retention';
  title: string;
  description?: string;
  insight_data: Record<string, any>;
  segments?: Record<string, any>;
  recommendations?: string[];
  trend_direction?: 'up' | 'down' | 'stable';
  trend_percentage?: number;
  created_at: string;
}

export interface GrowthStrategy {
  id: string;
  user_id: string;
  strategy_name: string;
  description?: string;
  goal_type: 'followers' | 'engagement' | 'revenue' | 'reach' | 'retention';
  goal_value?: number;
  goal_timeframe?: number;
  current_value?: number;
  progress_percentage?: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  tactics?: string[];
  priority?: number;
  confidence_level?: number;
  expected_results?: Record<string, any>;
  actual_results?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class AIInsightsService {
  // Insights & Recommendations
  async getInsights(userId: string, filters?: { category?: string; priority?: string; status?: string }, limit = 50) {
    let query = supabase
      .from('ai_insights_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching insights:', error);
      return [];
    }
    return data || [];
  }

  async getInsight(insightId: string) {
    const { data, error } = await supabase
      .from('ai_insights_recommendations')
      .select('*')
      .eq('id', insightId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching insight:', error);
    }
    return data;
  }

  async createInsight(userId: string, insight: Partial<InsightRecommendation>) {
    const { data, error } = await supabase
      .from('ai_insights_recommendations')
      .insert({
        user_id: userId,
        status: 'active',
        ...insight,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating insight:', error);
      throw error;
    }
    return data;
  }

  async updateInsightStatus(insightId: string, status: 'active' | 'archived' | 'snoozed' | 'dismissed', reason?: string) {
    const updates: any = { status };
    if (status === 'dismissed' && reason) {
      updates.dismissed_reason = reason;
    }
    if (status === 'snoozed') {
      updates.snoozed_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }

    const { data, error } = await supabase
      .from('ai_insights_recommendations')
      .update(updates)
      .eq('id', insightId)
      .select()
      .single();

    if (error) {
      console.error('Error updating insight status:', error);
      throw error;
    }
    return data;
  }

  async markInsightViewed(insightId: string) {
    return this.updateInsightStatus(insightId, 'active');
  }

  // Performance Analysis
  async getPerformanceAnalysis(userId: string, type: 'daily' | 'weekly' | 'monthly' | 'custom' = 'weekly') {
    const { data, error } = await supabase
      .from('ai_performance_analysis')
      .select('*')
      .eq('user_id', userId)
      .eq('analysis_type', type)
      .order('period_end', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching performance analysis:', error);
    }
    return data;
  }

  async createPerformanceAnalysis(userId: string, analysis: Partial<PerformanceAnalysis>) {
    const { data, error } = await supabase
      .from('ai_performance_analysis')
      .insert({
        user_id: userId,
        ...analysis,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating performance analysis:', error);
      throw error;
    }
    return data;
  }

  // Content Recommendations
  async getContentRecommendations(userId: string, filters?: { type?: string; status?: string }, limit = 50) {
    let query = supabase
      .from('ai_content_recommendations')
      .select('*')
      .eq('user_id', userId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.type) {
      query = query.eq('recommendation_type', filters.type);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching content recommendations:', error);
      return [];
    }
    return data || [];
  }

  async createContentRecommendation(userId: string, rec: Partial<ContentRecommendation>) {
    const { data, error } = await supabase
      .from('ai_content_recommendations')
      .insert({
        user_id: userId,
        status: 'new',
        ...rec,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating content recommendation:', error);
      throw error;
    }
    return data;
  }

  async updateContentRecommendation(recId: string, updates: Partial<ContentRecommendation>) {
    const { data, error } = await supabase
      .from('ai_content_recommendations')
      .update(updates)
      .eq('id', recId)
      .select()
      .single();

    if (error) {
      console.error('Error updating content recommendation:', error);
      throw error;
    }
    return data;
  }

  // Audience Insights
  async getAudienceInsights(userId: string, type?: string) {
    let query = supabase
      .from('ai_audience_insights')
      .select('*')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('insight_type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audience insights:', error);
      return [];
    }
    return data || [];
  }

  async createAudienceInsight(userId: string, insight: Partial<AudienceInsight>) {
    const { data, error } = await supabase
      .from('ai_audience_insights')
      .insert({
        user_id: userId,
        ...insight,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating audience insight:', error);
      throw error;
    }
    return data;
  }

  // Growth Strategies
  async getGrowthStrategies(userId: string, status?: 'active' | 'paused' | 'completed' | 'abandoned') {
    let query = supabase
      .from('ai_growth_strategies')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching growth strategies:', error);
      return [];
    }
    return data || [];
  }

  async createGrowthStrategy(userId: string, strategy: Partial<GrowthStrategy>) {
    const { data, error } = await supabase
      .from('ai_growth_strategies')
      .insert({
        user_id: userId,
        status: 'active',
        ...strategy,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating growth strategy:', error);
      throw error;
    }
    return data;
  }

  async updateGrowthStrategy(strategyId: string, updates: Partial<GrowthStrategy>) {
    const { data, error } = await supabase
      .from('ai_growth_strategies')
      .update(updates)
      .eq('id', strategyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating growth strategy:', error);
      throw error;
    }
    return data;
  }

  // Insight Feedback
  async addInsightFeedback(userId: string, insightId: string, helpful: boolean, rating?: number, feedback?: string) {
    const { data, error } = await supabase
      .from('ai_insight_feedback')
      .upsert(
        {
          user_id: userId,
          insight_id: insightId,
          is_helpful: helpful,
          rating,
          feedback_text: feedback,
        },
        { onConflict: 'user_id,insight_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error adding insight feedback:', error);
    }
    return data;
  }
}

export const aiInsightsService = new AIInsightsService();
