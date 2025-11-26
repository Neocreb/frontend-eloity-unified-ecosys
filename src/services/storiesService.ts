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
  expires_in_hours?: number; // Default: 24 hours
}

class StoriesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  // Get all active stories for users that the current user follows
  async getActiveStories(currentUserId: string): Promise<UserStory[]> {
    try {
      // First get the users that the current user follows
      const { data: following, error: followingError } = await this.supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

      if (followingError) throw followingError;

      const followingIds = following?.map(f => f.following_id) || [];
      // Include the current user's own stories
      followingIds.push(currentUserId);

      // Get active stories from followed users
      const { data, error } = await this.supabase
        .from('stories')
        .select('*')
        .in('user_id', followingIds)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active stories:', error);
      throw error;
    }
  }

  // Get stories for a specific user
  async getUserStories(userId: string): Promise<UserStory[]> {
    try {
      const { data, error } = await this.supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw error;
    }
  }

  // Create a new story
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
        likes_count: 0,
      };

      const { data, error } = await this.supabase
        .from('user_stories')
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

  // Delete a story
  async deleteStory(storyId: string, userId: string): Promise<void> {
    try {
      // Check if user is the owner
      const { data: story, error: fetchError } = await this.supabase
        .from('user_stories')
        .select('user_id')
        .eq('id', storyId)
        .single();

      if (fetchError) throw fetchError;
      if (!story || story.user_id !== userId) {
        throw new Error('Unauthorized: Only story owners can delete stories');
      }

      const { error } = await this.supabase
        .from('user_stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }

  // Mark a story as viewed
  async viewStory(storyId: string, userId: string): Promise<StoryView> {
    try {
      // Check if already viewed
      const { data: existingView, error: viewError } = await this.supabase
        .from('story_views')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', userId)
        .single();

      if (existingView) {
        // Already viewed, return existing view
        return {
          id: existingView.id,
          story_id: storyId,
          user_id: userId,
          viewed_at: new Date().toISOString()
        };
      }

      // Insert new view
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

      // Update view count using read-modify-write
      const { data: story } = await this.supabase
        .from('user_stories')
        .select('views_count')
        .eq('id', storyId)
        .single();

      if (story) {
        await this.supabase
          .from('user_stories')
          .update({ views_count: story.views_count + 1 })
          .eq('id', storyId);
      }

      return data;
    } catch (error) {
      console.error('Error viewing story:', error);
      throw error;
    }
  }

  // Get viewers for a story
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

  // Like a story
  async likeStory(storyId: string, userId: string): Promise<void> {
    try {
      // Get current likes count
      const { data: story } = await this.supabase
        .from('user_stories')
        .select('likes_count')
        .eq('id', storyId)
        .single();

      if (story) {
        const { error } = await this.supabase
          .from('user_stories')
          .update({ likes_count: story.likes_count + 1 })
          .eq('id', storyId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error liking story:', error);
      throw error;
    }
  }

  // Unlike a story
  async unlikeStory(storyId: string, userId: string): Promise<void> {
    try {
      // Get current likes count
      const { data: story } = await this.supabase
        .from('user_stories')
        .select('likes_count')
        .eq('id', storyId)
        .single();

      if (story && story.likes_count > 0) {
        const { error } = await this.supabase
          .from('user_stories')
          .update({ likes_count: story.likes_count - 1 })
          .eq('id', storyId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error unliking story:', error);
      throw error;
    }
  }
}

export const storiesService = new StoriesService();
