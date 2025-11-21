import { supabase } from '@/integrations/supabase/client';

export interface AssistantConversation {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  context: 'general' | 'content_creation' | 'analytics' | 'growth' | 'monetization' | 'troubleshooting';
  model: string;
  system_prompt?: string;
  temperature?: number;
  message_count?: number;
  total_tokens_used?: number;
  is_archived?: boolean;
  is_pinned?: boolean;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AssistantMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  content_type?: 'text' | 'code' | 'image' | 'file';
  message_index: number;
  metadata?: Record<string, any>;
  tokens_used?: number;
  response_time_ms?: number;
  is_edited?: boolean;
  is_flagged?: boolean;
  feedback_rating?: number;
  feedback_text?: string;
  created_at: string;
  updated_at: string;
}

export interface AssistantPreferences {
  id: string;
  user_id: string;
  personality: 'professional' | 'friendly' | 'casual' | 'enthusiastic';
  tone: 'formal' | 'casual' | 'balanced';
  response_length: 'brief' | 'balanced' | 'detailed';
  language: string;
  timezone: string;
  conversation_history_retention_days?: number;
  auto_clear_old_conversations?: boolean;
  disable_feedback?: boolean;
  disable_analytics?: boolean;
  suggestions_enabled?: boolean;
  reminder_frequency?: 'daily' | 'weekly' | 'monthly' | 'never';
  created_at: string;
  updated_at: string;
}

class AIAssistantService {
  // Conversations
  async createConversation(userId: string, conversation: Partial<AssistantConversation>) {
    const { data, error } = await supabase
      .from('ai_assistant_conversations')
      .insert({
        user_id: userId,
        context: 'general',
        model: 'edith-v1',
        ...conversation,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
    return data;
  }

  async getConversation(conversationId: string) {
    const { data, error } = await supabase
      .from('ai_assistant_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching conversation:', error);
    }
    return data;
  }

  async getUserConversations(userId: string, limit = 50, archived = false) {
    const { data, error } = await supabase
      .from('ai_assistant_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', archived)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user conversations:', error);
      return [];
    }
    return data || [];
  }

  async updateConversation(conversationId: string, updates: Partial<AssistantConversation>) {
    const { data, error } = await supabase
      .from('ai_assistant_conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
    return data;
  }

  async deleteConversation(conversationId: string) {
    const { error } = await supabase
      .from('ai_assistant_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  async archiveConversation(conversationId: string, archive = true) {
    return this.updateConversation(conversationId, { is_archived: archive });
  }

  async pinConversation(conversationId: string, pin = true) {
    return this.updateConversation(conversationId, { is_pinned: pin });
  }

  // Messages
  async addMessage(conversationId: string, userId: string, message: Partial<AssistantMessage>) {
    const conversation = await this.getConversation(conversationId);
    const messageIndex = (conversation?.message_count || 0) + 1;

    const { data, error } = await supabase
      .from('ai_assistant_messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        message_index: messageIndex,
        ...message,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      throw error;
    }

    // Update conversation metadata
    await this.updateConversation(conversationId, {
      message_count: messageIndex,
      last_message_at: new Date().toISOString(),
    });

    return data;
  }

  async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('ai_assistant_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('message_index', { ascending: true });

    if (error) {
      console.error('Error fetching conversation messages:', error);
      return [];
    }
    return data || [];
  }

  async updateMessage(messageId: string, updates: Partial<AssistantMessage>) {
    const { data, error } = await supabase
      .from('ai_assistant_messages')
      .update(updates)
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      throw error;
    }
    return data;
  }

  async addMessageFeedback(messageId: string, rating: number, feedbackText?: string) {
    return this.updateMessage(messageId, {
      feedback_rating: rating,
      feedback_text: feedbackText,
    });
  }

  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('ai_assistant_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Preferences
  async getOrCreatePreferences(userId: string): Promise<AssistantPreferences> {
    let { data, error } = await supabase
      .from('ai_assistant_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error?.code === 'PGRST116') {
      // Preferences don't exist, create default ones
      const defaultPrefs = {
        user_id: userId,
        personality: 'friendly',
        tone: 'balanced',
        response_length: 'balanced',
        language: 'en',
        timezone: 'UTC',
        suggestions_enabled: true,
      };

      const { data: newData, error: createError } = await supabase
        .from('ai_assistant_preferences')
        .insert(defaultPrefs)
        .select()
        .single();

      if (createError) {
        console.error('Error creating preferences:', createError);
        return defaultPrefs as AssistantPreferences;
      }
      return newData;
    }

    if (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
    return data;
  }

  async updatePreferences(userId: string, updates: Partial<AssistantPreferences>) {
    const { data, error } = await supabase
      .from('ai_assistant_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
    return data;
  }

  // Actions
  async recordAction(userId: string, conversationId: string, action: Record<string, any>) {
    const { data, error } = await supabase
      .from('ai_assistant_actions')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        ...action,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording action:', error);
    }
    return data;
  }

  async getUserActions(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('ai_assistant_actions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user actions:', error);
      return [];
    }
    return data || [];
  }

  async markActionExecuted(actionId: string, result?: Record<string, any>) {
    const { data, error } = await supabase
      .from('ai_assistant_actions')
      .update({
        is_executed: true,
        executed_at: new Date().toISOString(),
        execution_result: result,
      })
      .eq('id', actionId)
      .select()
      .single();

    if (error) {
      console.error('Error marking action executed:', error);
    }
    return data;
  }
}

export const aiAssistantService = new AIAssistantService();
