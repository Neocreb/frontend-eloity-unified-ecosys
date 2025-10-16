import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  project?: {
    title: string;
  };
}

export interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  related_id: string | null;
  related_type: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export const taskService = {
  async getUserTasks(userId?: string): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (
          title
        )
      `)
      .eq('user_id', targetUserId)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return (data || []) as Task[];
  },

  async getUrgentTasks(userId?: string): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (
          title
        )
      `)
      .eq('user_id', targetUserId)
      .in('priority', ['high', 'urgent'])
      .in('status', ['pending', 'in_progress'])
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(5);

    if (error) throw error;
    return (data || []) as Task[];
  },

  async createTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }
};

export const activityService = {
  async getUserActivities(userId?: string, limit: number = 10): Promise<Activity[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(activity => ({
      ...activity,
      metadata: activity.metadata as Record<string, any> || {}
    }));
  },

  async createActivity(activity: {
    activity_type: string;
    title: string;
    description?: string;
    related_id?: string;
    related_type?: string;
    metadata?: Record<string, any>;
  }): Promise<Activity> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('activities')
      .insert({
        ...activity,
        user_id: user.id,
        metadata: activity.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      metadata: data.metadata as Record<string, any> || {}
    };
  }
};
