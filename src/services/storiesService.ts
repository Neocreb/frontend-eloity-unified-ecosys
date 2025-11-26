import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserStory {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string | null;
  expires_at: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface StoryView {
  id: string;
  story_id: string;
  user_id: string;
  viewed_at: string;
}

export interface CreateStoryData {
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  expires_in_hours?: number;
}

class StoriesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  async getActiveStories(currentUserId: string): Promise<UserStory[]> {
    try {
      const { data: following, error: followingError } = await this.supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

      if (followingError) throw followingError;

      const followingIds = (following?.map(f => f.following_id) || []).concat(currentUserId);

      const { data, error } = await this.supabase
        .from('user_stories')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .in('user_id', followingIds)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(story => ({
        ...story,
        username: story.profiles?.username,
        full_name: story.profiles?.full_name,
        avatar_url: story.profiles?.avatar_url
      }));
    } catch (error) {
      console.error('Error fetching active stories:', error);
      throw error;
    }
  }

  async getUserStories(userId: string): Promise<UserStory[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_stories')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(story => ({
        ...story,
        username: story.profiles?.username,
        full_name: story.profiles?.full_name,
        avatar_url: story.profiles?.avatar_url
      }));
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw error;
    }
  }

  async createStory(storyData: CreateStoryData, userId: string): Promise<UserStory> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (storyData.expires_in_hours || 24));

      const newStory = {
        user_id: userId,
        media_url: storyData.media_url,
        media_type: storyData.media_type,
        caption: storyData.caption || null,
        expires_at: expiresAt.toISOString(),
        views_count: 0,
        likes_count: 0
      };

      const { data, error } = await this.supabase
        .from('stories')
        .insert(newStory)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  async deleteStory(storyId: string, userId: string): Promise<void> {
    try {
      const { data: story, error: fetchError } = await this.supabase
        .from('stories')
        .select('user_id')
        .eq('id', storyId)
        .single();

      if (fetchError) throw fetchError;
      if (!story || story.user_id !== userId) {
        throw new Error('Unauthorized: Only story owners can delete stories');
      }

      const { error } = await this.supabase
        .from('stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  async viewStory(storyId: string, userId: string): Promise<StoryView> {
    try {
      const { data: existingView } = await this.supabase
        .from('story_views')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', userId)
        .single();

      if (existingView) {
        return {
          id: existingView.id,
          story_id: storyId,
          user_id: userId,
          viewed_at: new Date().toISOString()
        };
      }

      const { data, error } = await this.supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          user_id: userId,
          viewed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await this.supabase.rpc('increment_story_view', { story_id: storyId });

      return data;
    } catch (error) {
      console.error('Error viewing story:', error);
      throw error;
    }
  }

  async getStoryViewers(storyId: string): Promise<StoryView[]> {
    try {
      const { data, error } = await this.supabase
        .from('story_views')
        .select('*')
        .eq('story_id', storyId)
        .order('viewed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching story viewers:', error);
      throw error;
    }
  }

  async likeStory(storyId: string, userId: string): Promise<void> {
    try {
      await this.supabase.rpc('increment_story_like', { story_id: storyId });
    } catch (error) {
      console.error('Error liking story:', error);
      throw error;
    }
  }

  async unlikeStory(storyId: string, userId: string): Promise<void> {
    try {
      await this.supabase.rpc('decrement_story_like', { story_id: storyId });
    } catch (error) {
      console.error('Error unliking story:', error);
      throw error;
    }
  }
}

export const storiesService = new StoriesService();
