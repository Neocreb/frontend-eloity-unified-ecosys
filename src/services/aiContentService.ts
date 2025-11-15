// @ts-nocheck

import { supabase } from "@/lib/supabase/client";

export interface ContentRecommendation {
  id: string;
  user_id: string;
  post_id: string;
  score: number;
  reason?: string;
  shown: boolean;
  clicked: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  interests: string[];
  preferred_content_types: string[];
  interaction_patterns: Record<string, any>;
  ai_enabled: boolean;
  updated_at: string;
}

export interface ContentAnalytics {
  id: string;
  post_id: string;
  sentiment_score?: number;
  engagement_score?: number;
  topics: string[];
  hashtags: string[];
  quality_score?: number;
  analyzed_at: string;
}

export interface UserScores {
  id: string;
  user_id: string;
  trading_score: number;
  content_score: number;
  reputation_score: number;
  risk_score: number;
  updated_at: string;
}

export const aiContentService = {
  // Get personalized content recommendations
  async getContentRecommendations(userId: string, limit: number = 20): Promise<ContentRecommendation[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('content_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('shown', false)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting content recommendations:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error getting content recommendations:', error);
      return [];
    }
  },

  // Mark recommendation as shown
  async markRecommendationShown(recommendationId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('content_recommendations')
        .update({ shown: true })
        .eq('id', recommendationId);

      return !error;
    } catch (error) {
      console.error('Error marking recommendation as shown:', error);
      return false;
    }
  },

  // Mark recommendation as clicked
  async markRecommendationClicked(recommendationId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('content_recommendations')
        .update({ clicked: true })
        .eq('id', recommendationId);

      return !error;
    } catch (error) {
      console.error('Error marking recommendation as clicked:', error);
      return false;
    }
  },

  // Get user preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return await this.createDefaultPreferences(userId);
        }
        console.error('Error getting user preferences:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  },

  // Create default user preferences
  async createDefaultPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_preferences')
        .insert({
          user_id: userId,
          interests: [],
          preferred_content_types: ['text', 'image'],
          interaction_patterns: {},
          ai_enabled: true
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating default preferences:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating default preferences:', error);
      return null;
    }
  },

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('user_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  },

  // Analyze content
  async analyzeContent(postId: string, content: string): Promise<ContentAnalytics | null> {
    try {
      // Simple content analysis (in a real app, this would use AI APIs)
      const words = content.toLowerCase().split(/\s+/);
      const hashtags = content.match(/#\w+/g) || [];
      const topics = this.extractTopics(words);
      const sentimentScore = this.calculateSentiment(words);
      const qualityScore = this.calculateQuality(content);

      const analytics = {
        post_id: postId,
        sentiment_score: sentimentScore,
        engagement_score: 0, // Will be updated based on actual engagement
        topics,
        hashtags: hashtags.map(tag => tag.slice(1)),
        quality_score: qualityScore
      };

      const { data, error } = await (supabase as any)
        .from('content_analytics')
        .insert(analytics)
        .select('*')
        .single();

      if (error) {
        console.error('Error analyzing content:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error analyzing content:', error);
      return null;
    }
  },

  // Get user scores
  async getUserScores(userId: string): Promise<UserScores | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return await this.createDefaultScores(userId);
        }
        console.error('Error getting user scores:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error getting user scores:', error);
      return null;
    }
  },

  // Create default user scores
  async createDefaultScores(userId: string): Promise<UserScores | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_scores')
        .insert({
          user_id: userId,
          trading_score: 0,
          content_score: 0,
          reputation_score: 0,
          risk_score: 0
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating default scores:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating default scores:', error);
      return null;
    }
  },

  // Helper methods for content analysis
  extractTopics(words: string[]): string[] {
    const topicKeywords = {
      crypto: ['bitcoin', 'crypto', 'blockchain', 'ethereum', 'trading'],
      tech: ['technology', 'ai', 'software', 'coding', 'development'],
      finance: ['money', 'investment', 'finance', 'market', 'profit'],
      social: ['friends', 'family', 'social', 'community', 'people']
    };

    const topics = [];
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        topics.push(topic);
      }
    }
    return topics;
  },

  calculateSentiment(words: string[]): number {
    const positiveWords = ['good', 'great', 'amazing', 'excellent', 'love', 'happy', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'disappointed'];

    let score = 0;
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    return Math.max(-1, Math.min(1, score / words.length));
  },

  calculateQuality(content: string): number {
    let score = 0.5; // Base score

    // Length factor
    if (content.length > 100) score += 0.2;
    if (content.length > 300) score += 0.2;

    // Grammar and structure (simplified)
    if (content.includes('.') || content.includes('!') || content.includes('?')) score += 0.1;

    return Math.min(1, score);
  }
};
