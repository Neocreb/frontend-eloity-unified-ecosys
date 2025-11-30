// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { PostComment } from "@/types/user";

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

  // Media upload functionality (in a real app, this would upload to a storage service)
  async uploadMedia(
    files: File[],
    signal?: AbortSignal,
  ): Promise<MediaUpload[]> {
    const uploads: MediaUpload[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isVideo && !isImage) {
        throw new Error("Only image and video files are supported");
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);

      uploads.push({
        type: isVideo ? "video" : "image",
        file,
        preview,
      });
    }

    return uploads;
  }

  // Create a new post
  async createPost(
    postData: PostCreationData,
    userId: string,
    signal?: AbortSignal,
  ): Promise<any> {
    try {
      // In a real implementation, we would upload media to a storage service first
      const mediaUrls = postData.media?.map(m => m.preview || "") || [];
      const mediaTypes = postData.media?.map(m => m.type) || [];

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content: postData.content,
          media_urls: mediaUrls,
          media_types: mediaTypes,
          feeling: postData.feeling,
          location: postData.location,
          privacy: postData.privacy,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          is_boosted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        user: {
          id: data.user_id,
          name: 'User',
          username: 'user',
          avatar: '/placeholder.svg',
          isVerified: false,
        },
        content: data.content,
        media: data.media_urls?.map((url: string, index: number) => ({
          type: data.media_types?.[index] || 'image',
          url: url,
          alt: `${data.media_types?.[index] || 'image'} post`,
        })) || [],
        timestamp: new Date(data.created_at).toLocaleString(),
        likes: data.likes_count,
        comments: data.comments_count,
        shares: data.shares_count,
        isLiked: false,
        isSaved: false,
        location: data.location?.name,
        privacy: data.privacy,
        feeling: data.feeling,
      };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  // Like/unlike a post
  async toggleLike(
    postId: string,
    userId: string,
    currentlyLiked: boolean,
    signal?: AbortSignal,
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    try {
      if (currentlyLiked) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        // Decrement likes count
        const { data: updatedPost, error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: supabase.rpc('posts.likes_count - 1') })
          .eq('id', postId)
          .select('likes_count')
          .single();

        if (updateError) throw updateError;

        return {
          isLiked: false,
          likesCount: Math.max(0, updatedPost.likes_count),
        };
      } else {
        // Like
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: userId,
            created_at: new Date().toISOString()
          });

        if (insertError) throw insertError;

        // Increment likes count
        const { data: updatedPost, error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: supabase.rpc('posts.likes_count + 1') })
          .eq('id', postId)
          .select('likes_count')
          .single();

        if (updateError) throw updateError;

        return {
          isLiked: true,
          likesCount: updatedPost.likes_count,
        };
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  }

  // Save/unsave a post
  async toggleSave(
    postId: string,
    userId: string,
    currentlySaved: boolean,
    signal?: AbortSignal,
  ): Promise<{ isSaved: boolean }> {
    try {
      if (currentlySaved) {
        // Unsave
        const { error: deleteError } = await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        if (deleteError) throw deleteError;

        return { isSaved: false };
      } else {
        // Save
        const { error: insertError } = await supabase
          .from('saved_posts')
          .insert({
            user_id: userId,
            post_id: postId,
            created_at: new Date().toISOString()
          });

        if (insertError) throw insertError;

        return { isSaved: true };
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      throw error;
    }
  }

  // Share a post
  async sharePost(
    postId: string,
    userId: string,
    signal?: AbortSignal,
  ): Promise<{ success: boolean; shareCount: number }> {
    try {
      // Add share record
      const { error: insertError } = await supabase
        .from('post_shares')
        .insert({
          user_id: userId,
          post_id: postId,
          shared_to: 'public',
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Increment shares count on post
      const { data: updatedPost, error: updateError } = await supabase
        .from('posts')
        .update({ shares_count: supabase.rpc('posts.shares_count + 1') })
        .eq('id', postId)
        .select('shares_count')
        .single();

      if (updateError) throw updateError;

      return {
        success: true,
        shareCount: updatedPost.shares_count,
      };
    } catch (error) {
      console.error("Error sharing post:", error);
      throw error;
    }
  }

  // Get comments for a post
  async getComments(postId: string, signal?: AbortSignal): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(comment => ({
        id: comment.id,
        userId: comment.user_id,
        userName: 'User',
        userAvatar: '/placeholder.svg',
        content: comment.content,
        timestamp: new Date(comment.created_at).toLocaleString(),
        likes: comment.likes_count,
        isLiked: false, // Would need to check if current user liked this comment
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  }

  // Add a comment
  async addComment(
    postId: string,
    userId: string,
    content: string,
    signal?: AbortSignal,
  ): Promise<Comment> {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) throw error;

      // Increment comments count on post
      await supabase
        .from('posts')
        .update({ comments_count: supabase.rpc('posts.comments_count + 1') })
        .eq('id', postId);

      return {
        id: data.id,
        userId: data.user_id,
        userName: 'User',
        userAvatar: '/placeholder.svg',
        content: data.content,
        timestamp: new Date(data.created_at).toLocaleString(),
        likes: 0,
        isLiked: false,
      };
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  // Search locations
  async searchLocations(
    query: string,
    signal?: AbortSignal,
  ): Promise<typeof LOCATION_SUGGESTIONS> {
    // In a real app, this would call a maps API
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
