import { supabase } from "@/integrations/supabase/client";
import { Post, PostComment } from "@/types/post";
import { MediaUpload, PostCreationData } from "./feedService";

export interface RealtimePost extends Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  media_types?: string[];
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
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_boosted?: boolean;
  boost_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RealtimeComment extends PostComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  likes_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface RealtimeReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string; // 'like', 'love', 'haha', 'wow', 'sad', 'angry'
  created_at: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

class RealtimeFeedService {
  // Create a new post
  async createPost(postData: PostCreationData, userId: string): Promise<RealtimePost | null> {
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          user_id: userId,
          content: postData.content,
          media_urls: postData.media?.map(m => m.preview || ""),
          media_types: postData.media?.map(m => m.type),
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
        .select()
        .single();

      if (error) {
        console.error("Error creating post:", error);
        return null;
      }

      return data as RealtimePost;
    } catch (error) {
      console.error("Error in createPost:", error);
      return null;
    }
  }

  // Get posts with pagination
  async getPosts(userId: string, page: number = 1, limit: number = 10): Promise<RealtimePost[]> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url,
            is_verified
          )
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching posts:", error);
        return [];
      }

      return data.map(post => ({
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        media_urls: post.media_urls,
        media_types: post.media_types,
        feeling: post.feeling,
        location: post.location,
        privacy: post.privacy,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        shares_count: post.shares_count,
        is_boosted: post.is_boosted,
        boost_expires_at: post.boost_expires_at,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: {
          name: post.profiles?.full_name || 'User',
          username: post.profiles?.username || 'user',
          avatar: post.profiles?.avatar_url || '/placeholder.svg',
          verified: !!post.profiles?.is_verified,
        },
        likes: post.likes_count,
        comments: post.comments_count,
        shares: post.shares_count,
      })) as RealtimePost[];
    } catch (error) {
      console.error("Error in getPosts:", error);
      return [];
    }
  }

  // Like/unlike a post
  async toggleLike(postId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number } | null> {
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('feed_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking like status:", checkError);
        return null;
      }

      let likesCount = 0;

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('feed_post_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) {
          console.error("Error unliking post:", deleteError);
          return null;
        }

        // Decrement likes count
        const { data: updatedPost, error: updateError } = await supabase
          .from('feed_posts')
          .update({ likes_count: supabase.rpc('feed_posts.likes_count - 1') })
          .eq('id', postId)
          .select('likes_count')
          .single();

        if (updateError) {
          console.error("Error updating likes count:", updateError);
        } else {
          likesCount = updatedPost.likes_count;
        }

        return { isLiked: false, likesCount: Math.max(0, likesCount) };
      } else {
        // Like
        const { data: newLike, error: insertError } = await supabase
          .from('feed_post_likes')
          .insert({
            post_id: postId,
            user_id: userId,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error liking post:", insertError);
          return null;
        }

        // Increment likes count
        const { data: updatedPost, error: updateError } = await supabase
          .from('feed_posts')
          .update({ likes_count: supabase.rpc('feed_posts.likes_count + 1') })
          .eq('id', postId)
          .select('likes_count')
          .single();

        if (updateError) {
          console.error("Error updating likes count:", updateError);
        } else {
          likesCount = updatedPost.likes_count;
        }

        return { isLiked: true, likesCount };
      }
    } catch (error) {
      console.error("Error in toggleLike:", error);
      return null;
    }
  }

  // Add a comment
  async addComment(postId: string, userId: string, content: string): Promise<RealtimeComment | null> {
    try {
      const { data, error } = await supabase
        .from('feed_post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: content,
          likes_count: 0,
          is_edited: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url,
            is_verified
          )
        `)
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        return null;
      }

      // Increment comments count on post
      await supabase
        .from('feed_posts')
        .update({ comments_count: supabase.rpc('feed_posts.comments_count + 1') })
        .eq('id', postId);

      return {
        id: data.id,
        post_id: data.post_id,
        user_id: data.user_id,
        parent_id: data.parent_id,
        content: data.content,
        likes_count: data.likes_count,
        is_edited: data.is_edited,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user: {
          name: data.profiles?.full_name || 'User',
          username: data.profiles?.username || 'user',
          avatar: data.profiles?.avatar_url || '/placeholder.svg',
          is_verified: !!data.profiles?.is_verified,
        }
      } as RealtimeComment;
    } catch (error) {
      console.error("Error in addComment:", error);
      return null;
    }
  }

  // Get comments for a post
  async getComments(postId: string): Promise<RealtimeComment[]> {
    try {
      const { data, error } = await supabase
        .from('feed_post_comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            username,
            avatar_url,
            is_verified
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        return [];
      }

      return data.map(comment => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        content: comment.content,
        likes_count: comment.likes_count,
        is_edited: comment.is_edited,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user: {
          name: comment.profiles?.full_name || 'User',
          username: comment.profiles?.username || 'user',
          avatar: comment.profiles?.avatar_url || '/placeholder.svg',
          is_verified: !!comment.profiles?.is_verified,
        }
      })) as RealtimeComment[];
    } catch (error) {
      console.error("Error in getComments:", error);
      return [];
    }
  }

  // Follow/unfollow a user
  async toggleFollow(followerId: string, followingId: string): Promise<{ isFollowing: boolean } | null> {
    try {
      // Check if already following
      const { data: existingFollow, error: checkError } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking follow status:", checkError);
        return null;
      }

      if (existingFollow) {
        // Unfollow
        const { error: deleteError } = await supabase
          .from('user_follows')
          .delete()
          .eq('id', existingFollow.id);

        if (deleteError) {
          console.error("Error unfollowing user:", deleteError);
          return null;
        }

        return { isFollowing: false };
      } else {
        // Follow
        const { error: insertError } = await supabase
          .from('user_follows')
          .insert({
            follower_id: followerId,
            following_id: followingId,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("Error following user:", insertError);
          return null;
        }

        return { isFollowing: true };
      }
    } catch (error) {
      console.error("Error in toggleFollow:", error);
      return null;
    }
  }

  // Get user's followers
  async getFollowers(userId: string): Promise<UserFollow[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('following_id', userId);

      if (error) {
        console.error("Error fetching followers:", error);
        return [];
      }

      return data as UserFollow[];
    } catch (error) {
      console.error("Error in getFollowers:", error);
      return [];
    }
  }

  // Get user's following
  async getFollowing(userId: string): Promise<UserFollow[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', userId);

      if (error) {
        console.error("Error fetching following:", error);
        return [];
      }

      return data as UserFollow[];
    } catch (error) {
      console.error("Error in getFollowing:", error);
      return [];
    }
  }

  // Save/unsave a post
  async toggleSave(postId: string, userId: string): Promise<{ isSaved: boolean } | null> {
    try {
      // Check if already saved
      const { data: existingSave, error: checkError } = await supabase
        .from('user_saved_posts')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking save status:", checkError);
        return null;
      }

      if (existingSave) {
        // Unsave
        const { error: deleteError } = await supabase
          .from('user_saved_posts')
          .delete()
          .eq('id', existingSave.id);

        if (deleteError) {
          console.error("Error unsaving post:", deleteError);
          return null;
        }

        return { isSaved: false };
      } else {
        // Save
        const { error: insertError } = await supabase
          .from('user_saved_posts')
          .insert({
            user_id: userId,
            post_id: postId,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("Error saving post:", insertError);
          return null;
        }

        return { isSaved: true };
      }
    } catch (error) {
      console.error("Error in toggleSave:", error);
      return null;
    }
  }

  // Share a post
  async sharePost(postId: string, userId: string, sharedTo: string = 'public'): Promise<{ success: boolean; shareCount: number } | null> {
    try {
      // Add share record
      const { error: insertError } = await supabase
        .from('user_post_shares')
        .insert({
          user_id: userId,
          post_id: postId,
          shared_to: sharedTo,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error sharing post:", insertError);
        return null;
      }

      // Increment shares count on post
      const { data: updatedPost, error: updateError } = await supabase
        .from('feed_posts')
        .update({ shares_count: supabase.rpc('feed_posts.shares_count + 1') })
        .eq('id', postId)
        .select('shares_count')
        .single();

      if (updateError) {
        console.error("Error updating shares count:", updateError);
        return { success: true, shareCount: 0 };
      }

      return { success: true, shareCount: updatedPost.shares_count };
    } catch (error) {
      console.error("Error in sharePost:", error);
      return null;
    }
  }

  // Add reaction to a post
  async addReaction(postId: string, userId: string, reactionType: string): Promise<RealtimeReaction | null> {
    try {
      // Remove any existing reaction from this user on this post
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      // Add new reaction
      const { data, error } = await supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          user_id: userId,
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding reaction:", error);
        return null;
      }

      return data as RealtimeReaction;
    } catch (error) {
      console.error("Error in addReaction:", error);
      return null;
    }
  }

  // Get reactions for a post
  async getReactions(postId: string): Promise<RealtimeReaction[]> {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId);

      if (error) {
        console.error("Error fetching reactions:", error);
        return [];
      }

      return data as RealtimeReaction[];
    } catch (error) {
      console.error("Error in getReactions:", error);
      return [];
    }
  }
}

export const realtimeFeedService = new RealtimeFeedService();