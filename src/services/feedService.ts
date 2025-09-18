// src/services/feedService.ts
export interface MediaUpload {
  type: "image" | "video";
  file: File;
  preview?: string;
}

export interface PostCreationData {
  content: string;
  media?: MediaUpload[];
  feeling?: {
    emoji: string;
    text: string;
  };
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  privacy: "public" | "friends" | "private";
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

// Feelings/Activities data
export const FEELINGS = [
  { emoji: "😊", text: "happy" },
  { emoji: "😢", text: "sad" },
  { emoji: "😍", text: "in love" },
  { emoji: "😴", text: "sleepy" },
  { emoji: "🤯", text: "mind blown" },
  { emoji: "🥳", text: "celebrating" },
  { emoji: "😤", text: "frustrated" },
  { emoji: "🤔", text: "thoughtful" },
  { emoji: "😎", text: "cool" },
  { emoji: "🥰", text: "grateful" },
  { emoji: "💪", text: "motivated" },
  { emoji: "🌟", text: "amazing" },
];

export const ACTIVITIES = [
  { emoji: "🍕", text: "eating" },
  { emoji: "✈️", text: "traveling" },
  { emoji: "🏋️", text: "working out" },
  { emoji: "📚", text: "reading" },
  { emoji: "🎵", text: "listening to music" },
  { emoji: "📺", text: "watching" },
  { emoji: "💼", text: "working" },
  { emoji: "🎮", text: "gaming" },
  { emoji: "🍳", text: "cooking" },
  { emoji: "🛍️", text: "shopping" },
];

// Location suggestions (in real app, this would come from a maps API)
export const LOCATION_SUGGESTIONS = [
  { name: "New York, NY", coordinates: { lat: 40.7128, lng: -74.006 } },
  { name: "Los Angeles, CA", coordinates: { lat: 34.0522, lng: -118.2437 } },
  { name: "Chicago, IL", coordinates: { lat: 41.8781, lng: -87.6298 } },
  { name: "Miami, FL", coordinates: { lat: 25.7617, lng: -80.1918 } },
  { name: "San Francisco, CA", coordinates: { lat: 37.7749, lng: -122.4194 } },
  { name: "Seattle, WA", coordinates: { lat: 47.6062, lng: -122.3321 } },
  { name: "Austin, TX", coordinates: { lat: 30.2672, lng: -97.7431 } },
  { name: "Denver, CO", coordinates: { lat: 39.7392, lng: -104.9903 } },
];

import { supabase } from '@/integrations/supabase/client';

class FeedService {
  // Helper method for delays with abort support
  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new Error("Request was aborted"));
        return;
      }

      const timeout = setTimeout(() => {
        resolve();
      }, ms);

      signal?.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new Error("Request was aborted"));
      });
    });
  }

  // Media upload functionality: upload files to Supabase storage 'posts' bucket
  async uploadMedia(
    files: File[],
    userId?: string,
    signal?: AbortSignal,
  ): Promise<{ type: string; url: string }[]> {
    const uploads: { type: string; url: string }[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) {
        throw new Error("Only image and video files are supported");
      }

      const ext = file.name.split('.').pop();
      const filePath = `posts/${userId || 'anon'}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('posts').upload(filePath, file, { cacheControl: '604800', upsert: false });
      if (uploadError) throw uploadError;
      const { publicURL } = supabase.storage.from('posts').getPublicUrl(filePath);
      uploads.push({ type: isVideo ? 'video' : 'image', url: publicURL });
    }

    return uploads;
  }

  // Create a new post (persist to Supabase)
  async createPost(
    postData: PostCreationData,
    userId?: string,
    signal?: AbortSignal,
  ): Promise<any> {
    // If media files present in postData.media, upload them first
    let mediaRecords: any[] | null = null;
    if (postData.media && postData.media.length > 0) {
      const files = postData.media.map(m => m.file);
      const uploaded = await this.uploadMedia(files as File[], userId, signal);
      mediaRecords = uploaded.map(u => ({ type: u.type, url: u.url }));
    }

    // Insert into posts table
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId || null,
        content_text: postData.content,
        media: mediaRecords,
        location: postData.location?.name || null,
        privacy: postData.privacy || 'public',
      })
      .select('*')
      .single();

    if (error) throw error;

    return data;
  }

  // Like/unlike a post (uses post_likes table)
  async toggleLike(
    postId: string,
    userId: string,
    currentlyLiked: boolean,
    signal?: AbortSignal,
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    if (!userId) throw new Error('Not authenticated');

    if (currentlyLiked) {
      // Delete like
      const { error: delError } = await supabase
        .from('post_likes')
        .delete()
        .match({ post_id: postId, user_id: userId });
      if (delError) throw delError;
    } else {
      // Insert like
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId });
      if (insertError) throw insertError;
    }

    // Get updated count
    const { count, error: countError } = await supabase
      .from('post_likes')
      .select('id', { count: 'exact', head: false })
      .eq('post_id', postId);
    if (countError) throw countError;

    const likesCount = (count as number) || 0;
    return { isLiked: !currentlyLiked, likesCount };
  }

  // Save/unsave a post
  async toggleSave(
    postId: string,
    currentlySaved: boolean,
    signal?: AbortSignal,
  ): Promise<{ isSaved: boolean }> {
    // Simulate API call with abort support
    await this.delay(300, signal);

    return {
      isSaved: !currentlySaved,
    };
  }

  // Share a post
  async sharePost(
    postId: string,
    signal?: AbortSignal,
  ): Promise<{ success: boolean; shareCount: number }> {
    // Simulate API call with abort support
    await this.delay(500, signal);

    return {
      success: true,
      shareCount: 1, // This would be updated count from API
    };
  }

  // Get comments for a post
  async getComments(postId: string, signal?: AbortSignal): Promise<Comment[]> {
    // Simulate API call with abort support
    await this.delay(300, signal);

    // In a real implementation, this would fetch from API
    // For now, return empty array to enable real-time comment functionality
    return [];
  }

  // Add a comment (persist to Supabase)
  async addComment(
    postId: string,
    content: string,
    userId?: string,
    signal?: AbortSignal,
  ): Promise<Comment> {
    if (!userId) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: userId, content })
      .select('*')
      .single();
    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name || 'User',
      userAvatar: data.user_avatar || '/placeholder.svg',
      content: data.content,
      timestamp: data.created_at,
      likes: 0,
      isLiked: false,
    };
  }

  // Search locations
  async searchLocations(
    query: string,
    signal?: AbortSignal,
  ): Promise<typeof LOCATION_SUGGESTIONS> {
    // Simulate API call with abort support
    await this.delay(300, signal);

    return LOCATION_SUGGESTIONS.filter((location) =>
      location.name.toLowerCase().includes(query.toLowerCase()),
    );
  }

  // Get current location
  async getCurrentLocation(): Promise<{
    name: string;
    coordinates: { lat: number; lng: number };
  } | null> {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        },
      );

      // In a real app, you'd reverse geocode these coordinates
      return {
        name: "Current Location",
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  }
}

export const feedService = new FeedService();
