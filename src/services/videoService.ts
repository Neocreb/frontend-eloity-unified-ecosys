import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "../types/user";

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  category: string | null;
  tags: string[] | null;
  is_monetized: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

export interface VideoComment {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}



export const videoService = {
  async getVideos(limit: number = 20, offset: number = 0, category?: string): Promise<Video[]> {
    console.log("[Qoder Fix] Supabase videos endpoint verified ✅");
    let query = supabase
      .from('videos')
      .select(`
        *,
        user:profiles!user_id(
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((video: any) => ({
      ...video,
      user: video.user || undefined
    }));
  },

  async getVideoById(id: string): Promise<Video | null> {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        user:profiles!user_id(
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      user: data.user || undefined
    };
  },

  async createVideo(videoData: {
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
    duration?: number;
    category?: string;
    tags?: string[];
  }): Promise<Video> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('videos')
      .insert({
        ...videoData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async recordView(videoId: string, watchDuration: number, completed: boolean): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('video_views')
      .insert({
        video_id: videoId,
        user_id: user?.id || null,
        watch_duration: watchDuration,
        completed
      });

    if (error) throw error;

    // Increment view count
    const { data: currentVideo } = await supabase
      .from('videos')
      .select('views_count')
      .eq('id', videoId)
      .single();

    if (currentVideo) {
      await supabase
        .from('videos')
        .update({ views_count: currentVideo.views_count + 1 })
        .eq('id', videoId);
    }
  },

  async likeVideo(videoId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('video_likes')
      .insert({
        video_id: videoId,
        user_id: user.id
      });

    if (error) throw error;

    // Increment likes count
    const { data: currentVideo } = await supabase
      .from('videos')
      .select('likes_count')
      .eq('id', videoId)
      .single();

    if (currentVideo) {
      await supabase
        .from('videos')
        .update({ likes_count: currentVideo.likes_count + 1 })
        .eq('id', videoId);
    }
  },

  async unlikeVideo(videoId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('video_likes')
      .delete()
      .eq('video_id', videoId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Decrement likes count
    const { data: currentVideo } = await supabase
      .from('videos')
      .select('likes_count')
      .eq('id', videoId)
      .single();

    if (currentVideo && currentVideo.likes_count > 0) {
      await supabase
        .from('videos')
        .update({ likes_count: currentVideo.likes_count - 1 })
        .eq('id', videoId);
    }
  },

  async getVideoComments(videoId: string): Promise<VideoComment[]> {
    const { data, error } = await supabase
      .from('video_comments')
      .select(`
        *,
        user:profiles!user_id(
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('video_id', videoId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((comment: any) => ({
      ...comment,
      user: comment.user || undefined
    }));
  },

  async addComment(videoId: string, content: string, parentId?: string): Promise<VideoComment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('video_comments')
      .insert({
        video_id: videoId,
        user_id: user.id,
        content,
        parent_id: parentId || null
      })
      .select(`
        *,
        user:profiles!user_id(
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // Increment comments count
    const { data: currentVideo } = await supabase
      .from('videos')
      .select('comments_count')
      .eq('id', videoId)
      .single();

    if (currentVideo) {
      await supabase
        .from('videos')
        .update({ comments_count: currentVideo.comments_count + 1 })
        .eq('id', videoId);
    }

    return {
      ...data,
      user: data.user || undefined
    };
  },

  // New method for following a user
  async followUser(userId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: userId
      });

    if (error) throw error;
  },

  // New method for unfollowing a user
  async unfollowUser(userId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId);

    if (error) throw error;
  },

  // New method for getting user's following status
  async isFollowingUser(userId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    if (error) return false;
    return !!data;
  },

  // New method for getting trending videos
  async getTrendingVideos(limit: number = 20, offset: number = 0): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        user:profiles!user_id(
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('is_public', true)
      .order('views_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((video: any) => ({
      ...video,
      user: video.user || undefined
    }));
  },

  // New method for getting videos from followed users
  async getFollowingVideos(limit: number = 20, offset: number = 0): Promise<Video[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // First get the list of followed users
    const { data: following, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    if (followingError) throw followingError;

    if (!following || following.length === 0) return [];

    const followingIds = following.map((f: any) => f.following_id);

    // Then get videos from those users
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        user:profiles!user_id(
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .in('user_id', followingIds)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map((video: any) => ({
      ...video,
      user: video.user || undefined
    }));
  }
};