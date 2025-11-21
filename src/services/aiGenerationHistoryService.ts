import { supabase } from '@/integrations/supabase/client';

export interface GenerationJob {
  id: string;
  user_id: string;
  type: 'image' | 'video' | 'text' | 'edit';
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  model: string;
  parameters?: Record<string, any>;
  result_url?: string;
  result_data?: Record<string, any>;
  error_message?: string;
  cost_tokens?: number;
  duration_ms?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface GeneratedContent {
  id: string;
  user_id: string;
  generation_job_id?: string;
  type: 'image' | 'video' | 'text' | 'audio';
  title?: string;
  description?: string;
  prompt: string;
  content_url?: string;
  thumbnail_url?: string;
  storage_path?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  model_used?: string;
  generation_time_ms?: number;
  quality_score?: number;
  usage_count?: number;
  is_favorite?: boolean;
  is_archived?: boolean;
  content_type?: string;
  file_size_bytes?: number;
  dimensions?: Record<string, any>;
  duration_seconds?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface GenerationTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: 'image' | 'video' | 'text' | 'edit';
  prompt_template: string;
  default_parameters?: Record<string, any>;
  tags?: string[];
  is_public?: boolean;
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

class AIGenerationHistoryService {
  // Generation Jobs
  async createGenerationJob(userId: string, job: Partial<GenerationJob>) {
    const { data, error } = await supabase
      .from('ai_generation_jobs')
      .insert({
        user_id: userId,
        ...job,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating generation job:', error);
      throw error;
    }
    return data;
  }

  async getGenerationJob(jobId: string) {
    const { data, error } = await supabase
      .from('ai_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching generation job:', error);
    }
    return data;
  }

  async getUserGenerationJobs(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('ai_generation_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user generation jobs:', error);
      return [];
    }
    return data || [];
  }

  async updateGenerationJob(jobId: string, updates: Partial<GenerationJob>) {
    const { data, error } = await supabase
      .from('ai_generation_jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error updating generation job:', error);
      throw error;
    }
    return data;
  }

  // Generated Content
  async createGeneratedContent(userId: string, content: Partial<GeneratedContent>) {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .insert({
        user_id: userId,
        ...content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating generated content:', error);
      throw error;
    }
    return data;
  }

  async getGeneratedContent(contentId: string) {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .select('*')
      .eq('id', contentId)
      .eq('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching generated content:', error);
    }
    return data;
  }

  async getUserGeneratedContent(userId: string, filters?: { type?: string; is_favorite?: boolean; is_archived?: boolean }, limit = 50) {
    let query = supabase
      .from('ai_generated_content')
      .select('*')
      .eq('user_id', userId)
      .eq('deleted_at', null);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.is_favorite !== undefined) {
      query = query.eq('is_favorite', filters.is_favorite);
    }
    if (filters?.is_archived !== undefined) {
      query = query.eq('is_archived', filters.is_archived);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user generated content:', error);
      return [];
    }
    return data || [];
  }

  async updateGeneratedContent(contentId: string, updates: Partial<GeneratedContent>) {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .update(updates)
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating generated content:', error);
      throw error;
    }
    return data;
  }

  async deleteGeneratedContent(contentId: string) {
    const { data, error } = await supabase
      .from('ai_generated_content')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      console.error('Error deleting generated content:', error);
      throw error;
    }
    return data;
  }

  async toggleFavorite(contentId: string, isFavorite: boolean) {
    return this.updateGeneratedContent(contentId, { is_favorite: isFavorite });
  }

  async toggleArchive(contentId: string, isArchived: boolean) {
    return this.updateGeneratedContent(contentId, { is_archived: isArchived });
  }

  async recordContentUsage(userId: string, contentId: string, usageType: 'post' | 'product' | 'story' | 'profile' | 'ad' | 'other', linkedId?: string) {
    let updateData: any = { usage_count: (await this.getGeneratedContent(contentId))?.usage_count || 0 + 1 };
    
    if (usageType === 'post' && linkedId) {
      updateData.post_id = linkedId;
    } else if (usageType === 'product' && linkedId) {
      updateData.product_id = linkedId;
    } else if (usageType === 'story' && linkedId) {
      updateData.story_id = linkedId;
    }

    const { data, error } = await supabase
      .from('ai_content_usage')
      .insert({
        user_id: userId,
        generated_content_id: contentId,
        usage_type: usageType,
        ...updateData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording content usage:', error);
    }
    return data;
  }

  async getContentUsageStats(contentId: string) {
    const { data, error } = await supabase
      .from('ai_content_usage')
      .select('usage_type, count(*)')
      .eq('generated_content_id', contentId);

    if (error) {
      console.error('Error fetching content usage stats:', error);
      return {};
    }
    return data || [];
  }

  // Templates
  async createTemplate(userId: string, template: Partial<GenerationTemplate>) {
    const { data, error } = await supabase
      .from('ai_generation_templates')
      .insert({
        user_id: userId,
        ...template,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw error;
    }
    return data;
  }

  async getUserTemplates(userId: string, type?: string) {
    let query = supabase
      .from('ai_generation_templates')
      .select('*')
      .eq('user_id', userId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user templates:', error);
      return [];
    }
    return data || [];
  }

  async updateTemplate(templateId: string, updates: Partial<GenerationTemplate>) {
    const { data, error } = await supabase
      .from('ai_generation_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      throw error;
    }
    return data;
  }

  async deleteTemplate(templateId: string) {
    const { error } = await supabase
      .from('ai_generation_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  async getPublicTemplates(limit = 20) {
    const { data, error } = await supabase
      .from('ai_generation_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching public templates:', error);
      return [];
    }
    return data || [];
  }
}

export const aiGenerationHistoryService = new AIGenerationHistoryService();
