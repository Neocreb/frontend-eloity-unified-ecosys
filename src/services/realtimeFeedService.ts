// @ts-nocheck
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
        .from('posts')
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

      // First get the posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        return [];
      }

      // Get unique user IDs from posts
      const userIds = [...new Set(posts.map(post => post.user_id))];

      // Get profiles for all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url, is_verified')
        .in('user_id', userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return [];
      }

      // Create a map of user_id to profile for quick lookup
      const profileMap = new Map(profiles.map(profile => [profile.user_id, profile]));

      return posts.map(post => {
        const userProfile = profileMap.get(post.user_id);
        return {
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
            name: userProfile?.full_name || 'User',
            username: userProfile?.username || 'user',
            avatar: userProfile?.avatar_url || '/placeholder.svg',
            verified: !!userProfile?.is_verified,
          },
          likes: post.likes_count,
          comments: post.comments_count,
          shares: post.shares_count,
        };
      }) as RealtimePost[];
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
        .from('post_likes')
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
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) {
          console.error("Error unliking post:", deleteError);
          return null;
        }

        // Decrement likes count
        const { data: updatedPost, error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: supabase.rpc('posts.likes_count - 1') })
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
          .from('post_likes')
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
          .from('posts')
          .update({ likes_count: supabase.rpc('posts.likes_count + 1') })
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
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: content,
          likes_count: 0,
          is_edited: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        return null;
      }

      // Get the user's profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url, is_verified')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
      }

      // Increment comments count on post
      await supabase
        .from('posts')
        .update({ comments_count: supabase.rpc('posts.comments_count + 1') })
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
          name: userProfile?.full_name || 'User',
          username: userProfile?.username || 'user',
          avatar: userProfile?.avatar_url || '/placeholder.svg',
          is_verified: !!userProfile?.is_verified,
        }
      } as RealtimeComment;
    } catch (error) {
      console.error("Error in addComment:", error);
      return null;
    }
  }

  // Like/unlike a comment
  async toggleCommentLike(commentId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number } | null> {
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking comment like status:", checkError);
        return null;
      }

      let likesCount = 0;

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) {
          console.error("Error unliking comment:", deleteError);
          return null;
        }

        // Decrement likes count
        const { data: updatedComment, error: updateError } = await supabase
          .from('post_comments')
          .update({ likes_count: supabase.rpc('post_comments.likes_count - 1') })
          .eq('id', commentId)
          .select('likes_count')
          .single();

        if (updateError) {
          console.error("Error updating comment likes count:", updateError);
        } else {
          likesCount = updatedComment.likes_count;
        }

        return { isLiked: false, likesCount: Math.max(0, likesCount) };
      } else {
        // Like
        const { data: newLike, error: insertError } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: userId,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error liking comment:", insertError);
          return null;
        }

        // Increment likes count
        const { data: updatedComment, error: updateError } = await supabase
          .from('post_comments')
          .update({ likes_count: supabase.rpc('post_comments.likes_count + 1') })
          .eq('id', commentId)
          .select('likes_count')
          .single();

        if (updateError) {
          console.error("Error updating comment likes count:", updateError);
        } else {
          likesCount = updatedComment.likes_count;
        }

        return { isLiked: true, likesCount };
      }
    } catch (error) {
      console.error("Error in toggleCommentLike:", error);
      return null;
    }
  }

  // Delete a post
  async deletePost(postId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) {
        console.error("Error deleting post:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deletePost:", error);
      return false;
    }
  }

  // Edit a post
  async editPost(postId: string, userId: string, content: string): Promise<RealtimePost | null> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error("Error editing post:", error);
        return null;
      }

      return data as RealtimePost;
    } catch (error) {
      console.error("Error in editPost:", error);
      return null;
    }
  }

  // Get comments for a post
  async getComments(postId: string, page: number = 1, limit: number = 10): Promise<RealtimeComment[]> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: comments, error: commentsError } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .range(from, to);

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
        return [];
      }

      // Get unique user IDs from comments
      const userIds = [...new Set(comments.map(comment => comment.user_id))];

      // Get profiles for all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url, is_verified')
        .in('user_id', userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return [];
      }

      // Create a map of user_id to profile for quick lookup
      const profileMap = new Map(profiles.map(profile => [profile.user_id, profile]));

      return comments.map(comment => {
        const userProfile = profileMap.get(comment.user_id);
        return {
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
            name: userProfile?.full_name || 'User',
            username: userProfile?.username || 'user',
            avatar: userProfile?.avatar_url || '/placeholder.svg',
            is_verified: !!userProfile?.is_verified,
          }
        };
      }) as RealtimeComment[];
    } catch (error) {
      console.error("Error in getComments:", error);
      return [];
    }
  }

  // Delete a comment
  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) {
        console.error("Error deleting comment:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteComment:", error);
      return false;
    }
  }

  // Edit a comment
  async editComment(commentId: string, userId: string, content: string): Promise<RealtimeComment | null> {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .update({
          content,
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error("Error editing comment:", error);
        return null;
      }

      return data as RealtimeComment;
    } catch (error) {
      console.error("Error in editComment:", error);
      return null;
    }
  }

  // Follow a user
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: followerId,
          following_id: followingId,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error following user:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in followUser:", error);
      return false;
    }
  }

  // Unfollow a user
  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) {
        console.error("Error unfollowing user:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in unfollowUser:", error);
      return false;
    }
  }

  // Get user's followers
  async getUserFollowers(userId: string): Promise<UserFollow[]> {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('following_id', userId);

      if (error) {
        console.error("Error fetching user followers:", error);
        return [];
      }

      return data as UserFollow[];
    } catch (error) {
      console.error("Error in getUserFollowers:", error);
      return [];
    }
  }

  // Get user's following
  async getUserFollowing(userId: string): Promise<UserFollow[]> {
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', userId);

      if (error) {
        console.error("Error fetching user following:", error);
        return [];
      }

      return data as UserFollow[];
    } catch (error) {
      console.error("Error in getUserFollowing:", error);
      return [];
    }
  }
}

export const realtimeFeedService = new RealtimeFeedService();