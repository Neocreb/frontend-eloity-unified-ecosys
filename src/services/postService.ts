// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { UserService, UserWithProfile } from "./userService";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostLike = Database["public"]["Tables"]["post_likes"]["Row"];
type PostComment = Database["public"]["Tables"]["post_comments"]["Row"];

export interface PostWithAuthor extends Post {
  author: UserWithProfile | null;
  likes_count: number;
  comments_count: number;
  liked_by_user: boolean;
}

export interface CommentWithAuthor extends PostComment {
  author: UserWithProfile | null;
  likes_count: number;
  replies_count: number;
}

export class PostService {
  // Create a new post
  static async createPost(postData: PostInsert): Promise<Post | null> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error("Error creating post:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in createPost:", error);
      return null;
    }
  }

  // Get post by ID
  static async getPostById(postId: string, currentUserId?: string): Promise<PostWithAuthor | null> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          users (
            *,
            profiles (*)
          )
        `)
        .eq("id", postId)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
        return null;
      }

      if (!data) return null;

      // Get likes count
      const likesCount = await this.getPostLikesCount(postId);
      
      // Get comments count
      const commentsCount = await this.getPostCommentsCount(postId);
      
      // Check if current user liked the post
      const likedByUser = currentUserId ? await this.isPostLikedByUser(postId, currentUserId) : false;

      return {
        ...data,
        author: data.users as UserWithProfile,
        likes_count: likesCount,
        comments_count: commentsCount,
        liked_by_user: likedByUser
      };
    } catch (error) {
      console.error("Error in getPostById:", error);
      return null;
    }
  }

  // Get posts for feed (with pagination)
  static async getFeedPosts(userId: string, limit = 10, offset = 0): Promise<PostWithAuthor[]> {
    try {
      // Get posts from users that the current user is following + their own posts
      const { data: followingIds, error: followingError } = await supabase
        .from("followers")
        .select("following_id")
        .eq("follower_id", userId);

      if (followingError) {
        console.error("Error fetching following IDs:", followingError);
        return [];
      }

      const followingUserIds = followingIds.map((f: any) => f.following_id);
      followingUserIds.push(userId); // Include own posts

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          users (
            *,
            profiles (*)
          )
        `)
        .in("user_id", followingUserIds)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching feed posts:", error);
        return [];
      }

      // Enhance posts with additional data
      const enhancedPosts = await Promise.all(
        data.map(async (post: any) => {
          const likesCount = await this.getPostLikesCount(post.id);
          const commentsCount = await this.getPostCommentsCount(post.id);
          const likedByUser = await this.isPostLikedByUser(post.id, userId);

          return {
            ...post,
            author: post.users as UserWithProfile,
            likes_count: likesCount,
            comments_count: commentsCount,
            liked_by_user: likedByUser
          };
        })
      );

      return enhancedPosts as PostWithAuthor[];
    } catch (error) {
      console.error("Error in getFeedPosts:", error);
      return [];
    }
  }

  // Get user's posts
  static async getUserPosts(userId: string, limit = 10, offset = 0): Promise<PostWithAuthor[]> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          users (
            *,
            profiles (*)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching user posts:", error);
        return [];
      }

      // Enhance posts with additional data
      const enhancedPosts = await Promise.all(
        data.map(async (post: any) => {
          const likesCount = await this.getPostLikesCount(post.id);
          const commentsCount = await this.getPostCommentsCount(post.id);
          // We don't check if user liked their own post, but we could if needed

          return {
            ...post,
            author: post.users as UserWithProfile,
            likes_count: likesCount,
            comments_count: commentsCount,
            liked_by_user: false
          };
        })
      );

      return enhancedPosts as PostWithAuthor[];
    } catch (error) {
      console.error("Error in getUserPosts:", error);
      return [];
    }
  }

  // Delete a post
  static async deletePost(postId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", userId);

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

  // Like a post
  static async likePost(postId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: userId
        });

      if (error) {
        console.error("Error liking post:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in likePost:", error);
      return false;
    }
  }

  // Unlike a post
  static async unlikePost(postId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error unliking post:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in unlikePost:", error);
      return false;
    }
  }

  // Check if post is liked by user
  static async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking if post is liked:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error in isPostLikedByUser:", error);
      return false;
    }
  }

  // Get post likes count
  static async getPostLikesCount(postId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("post_likes")
        .select("*", { count: "exact" })
        .eq("post_id", postId);

      if (error) {
        console.error("Error fetching post likes count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getPostLikesCount:", error);
      return 0;
    }
  }

  // Get post comments count
  static async getPostCommentsCount(postId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("post_comments")
        .select("*", { count: "exact" })
        .eq("post_id", postId);

      if (error) {
        console.error("Error fetching post comments count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getPostCommentsCount:", error);
      return 0;
    }
  }

  // Add comment to post
  static async addComment(postId: string, userId: string, content: string): Promise<CommentWithAuthor | null> {
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: userId,
          content: content
        })
        .select(`
          *,
          users (
            *,
            profiles (*)
          )
        `)
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        return null;
      }

      if (!data) return null;

      // Get author profile
      const author = await UserService.getUserById(data.user_id);

      return {
        ...data,
        author: author,
        likes_count: 0,
        replies_count: 0
      };
    } catch (error) {
      console.error("Error in addComment:", error);
      return null;
    }
  }

  // Get post comments
  static async getPostComments(postId: string, limit = 10, offset = 0): Promise<CommentWithAuthor[]> {
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select(`
          *,
          users (
            *,
            profiles (*)
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching post comments:", error);
        return [];
      }

      // Enhance comments with additional data
      const enhancedComments = await Promise.all(
        data.map(async (comment: any) => {
          // Get author profile
          const author = await UserService.getUserById(comment.user_id);
          
          // Get likes count
          const likesCount = await this.getCommentLikesCount(comment.id);
          
          // Get replies count
          const repliesCount = await this.getCommentRepliesCount(comment.id);

          return {
            ...comment,
            author: author,
            likes_count: likesCount,
            replies_count: repliesCount
          };
        })
      );

      return enhancedComments as CommentWithAuthor[];
    } catch (error) {
      console.error("Error in getPostComments:", error);
      return [];
    }
  }

  // Get comment likes count
  static async getCommentLikesCount(commentId: string): Promise<number> {
    try {
      // Assuming there's a comment_likes table (not in schema, so we'll skip for now)
      return 0;
    } catch (error) {
      console.error("Error in getCommentLikesCount:", error);
      return 0;
    }
  }

  // Get comment replies count
  static async getCommentRepliesCount(commentId: string): Promise<number> {
    try {
      // Assuming there's a parent_id in comments for replies (not in schema, so we'll skip for now)
      return 0;
    } catch (error) {
      console.error("Error in getCommentRepliesCount:", error);
      return 0;
    }
  }

  // Search posts
  static async searchPosts(query: string, limit = 10): Promise<PostWithAuthor[]> {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          users (
            *,
            profiles (*)
          )
        `)
        .ilike("content", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error searching posts:", error);
        return [];
      }

      // Enhance posts with additional data
      const enhancedPosts = await Promise.all(
        data.map(async (post: any) => {
          const likesCount = await this.getPostLikesCount(post.id);
          const commentsCount = await this.getPostCommentsCount(post.id);
          // We don't check if user liked the post in search, but we could if needed

          return {
            ...post,
            author: post.users as UserWithProfile,
            likes_count: likesCount,
            comments_count: commentsCount,
            liked_by_user: false
          };
        })
      );

      return enhancedPosts as PostWithAuthor[];
    } catch (error) {
      console.error("Error in searchPosts:", error);
      return [];
    }
  }
}