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
    let query = supabase
      .from('videos')
      .select(`
        *,
        profiles!videos_user_id_profiles_fkey(
          user_id,
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
      user: video.profiles || undefined
    }));
  },

  async getVideoById(id: string): Promise<Video | null> {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles!videos_user_id_profiles_fkey(
          user_id,
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
      user: data.profiles || undefined
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
      .from('user_follows')
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
      .from('user_follows')
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
      .from('user_follows')
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
        profiles!videos_user_id_profiles_fkey(
          user_id,
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
      user: video.profiles || undefined
    }));
  },

  // New method for getting videos from followed users
  async getFollowingVideos(limit: number = 20, offset: number = 0): Promise<Video[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // First get the list of followed users
    const { data: following, error: followingError } = await supabase
      .from('user_follows')
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
        profiles!videos_user_id_profiles_fkey(
          user_id,
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
      user: video.profiles || undefined
    }));
  },

  // New method for sharing a video
  async shareVideo(videoId: string, platform: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Record the share action
    const { error } = await supabase
      .from('video_shares')
      .insert({
        video_id: videoId,
        user_id: user?.id || null,
        platform: platform,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // Increment shares count
    const { data: currentVideo } = await supabase
      .from('videos')
      .select('shares_count')
      .eq('id', videoId)
      .single();

    if (currentVideo) {
      await supabase
        .from('videos')
        .update({ shares_count: currentVideo.shares_count + 1 })
        .eq('id', videoId);
    }
  },

  // New method for sending a gift to a video creator
  async sendGift(params: {
    toUserId: string;
    giftId: string;
    quantity: number;
    message?: string;
    contentId?: string;
    isAnonymous?: boolean;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get gift details
    const { data: gift, error: giftError } = await supabase
      .from('virtual_gifts')
      .select('*')
      .eq('id', params.giftId)
      .single();

    if (giftError) throw giftError;
    if (!gift) throw new Error('Gift not found');

    const totalAmount = gift.price * params.quantity;

    // Create gift transaction
    const { error: transactionError } = await supabase
      .from('gift_transactions')
      .insert({
        from_user_id: user.id,
        to_user_id: params.toUserId,
        gift_id: params.giftId,
        quantity: params.quantity,
        total_amount: totalAmount,
        message: params.message,
        content_id: params.contentId,
        is_anonymous: params.isAnonymous || false,
        status: 'completed'
      });

    if (transactionError) throw transactionError;

    // Update gift inventory for recipient
    const { data: existingInventory } = await supabase
      .from('user_gift_inventory')
      .select('*')
      .eq('user_id', params.toUserId)
      .eq('gift_id', params.giftId)
      .single();

    if (existingInventory) {
      await supabase
        .from('user_gift_inventory')
        .update({ quantity: existingInventory.quantity + params.quantity })
        .eq('id', existingInventory.id);
    } else {
      await supabase
        .from('user_gift_inventory')
        .insert({
          user_id: params.toUserId,
          gift_id: params.giftId,
          quantity: params.quantity
        });
    }
  },

  // New method for getting available virtual gifts
  async getVirtualGifts(): Promise<any[]> {
    const { data, error } = await supabase
      .from('virtual_gifts')
      .select('*')
      .eq('available', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // New method for getting user's gift inventory
  async getUserGiftInventory(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_gift_inventory')
      .select(`
        *,
        gift:virtual_gifts(*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  },

  // New method for tipping a creator
  async sendTip(params: {
    toUserId: string;
    amount: number;
    message?: string;
    contentId?: string;
    isAnonymous?: boolean;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create tip transaction
    const { error } = await supabase
      .from('tip_transactions')
      .insert({
        from_user_id: user.id,
        to_user_id: params.toUserId,
        amount: params.amount,
        message: params.message,
        content_id: params.contentId,
        is_anonymous: params.isAnonymous || false,
        status: 'completed'
      });

    if (error) throw error;
  },

  // New method for getting creator tip settings
  async getCreatorTipSettings(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('creator_tip_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }
};