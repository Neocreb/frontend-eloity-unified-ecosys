import { supabase } from "@/integrations/supabase/client";

export interface DuetData {
  id: string;
  original_video_id: string;
  duet_video_id: string;
  user_id: string;
  duet_type: 'side-by-side' | 'react-respond' | 'picture-in-picture';
  created_at: string;
}

export const duetService = {
  async createDuet(
    originalVideoId: string,
    duetVideoId: string,
    duetType: 'side-by-side' | 'react-respond' | 'picture-in-picture'
  ): Promise<DuetData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('video_duets')
      .insert({
        original_video_id: originalVideoId,
        duet_video_id: duetVideoId,
        user_id: user.id,
        duet_type: duetType
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDuetById(id: string): Promise<DuetData | null> {
    const { data, error } = await supabase
      .from('video_duets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getDuetsForVideo(videoId: string): Promise<DuetData[]> {
    const { data, error } = await supabase
      .from('video_duets')
      .select('*')
      .or(`original_video_id.eq.${videoId},duet_video_id.eq.${videoId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDuetCountForVideo(videoId: string): Promise<number> {
    const { count, error } = await supabase
      .from('video_duets')
      .select('*', { count: 'exact', head: true })
      .or(`original_video_id.eq.${videoId},duet_video_id.eq.${videoId}`);

    if (error) throw error;
    return count || 0;
  }
};