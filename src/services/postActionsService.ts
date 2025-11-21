import { supabase } from "@/integrations/supabase/client";

interface PostReport {
  id?: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  description?: string;
  created_at?: string;
}

interface PostPreference {
  id?: string;
  user_id: string;
  post_id: string;
  interested: boolean | null;
  hidden: boolean | null;
  notifications_enabled: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export class PostActionsService {
  // Report post
  static async reportPost(
    postId: string,
    userId: string,
    reason: string,
    description?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if user already reported this post
      const { data: existingReport } = await supabase
        .from("post_reports")
        .select("id")
        .eq("post_id", postId)
        .eq("reporter_id", userId)
        .single();

      if (existingReport) {
        return {
          success: false,
          error: "You have already reported this post",
        };
      }

      const { error } = await supabase.from("post_reports").insert({
        post_id: postId,
        reporter_id: userId,
        reason,
        description,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error reporting post:", error);
      return {
        success: false,
        error: error.message || "Failed to report post",
      };
    }
  }

  // Hide post
  static async hidePost(
    postId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Note: post_preferences table doesn't exist in the current schema
      // For now, we'll return success without persisting (UI-only hiding)
      console.warn("Post hiding preference not persisted - table not available");
      return { success: true };
    } catch (error: any) {
      console.error("Error hiding post:", error);
      return {
        success: false,
        error: error.message || "Failed to hide post",
      };
    }
  }

  // Mark post as interested
  static async markInterested(
    postId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Note: post_preferences table doesn't exist in the current schema
      console.warn("Post interest preference not persisted - table not available");
      return { success: true };
    } catch (error: any) {
      console.error("Error marking as interested:", error);
      return {
        success: false,
        error: error.message || "Failed to mark as interested",
      };
    }
  }

  // Mark post as not interested
  static async markNotInterested(
    postId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Note: post_preferences table doesn't exist in the current schema
      console.warn("Post disinterest preference not persisted - table not available");
      return { success: true };
    } catch (error: any) {
      console.error("Error marking as not interested:", error);
      return {
        success: false,
        error: error.message || "Failed to mark as not interested",
      };
    }
  }

  // Toggle post notifications
  static async togglePostNotifications(
    postId: string,
    userId: string,
    enabled: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Note: post_preferences table doesn't exist in the current schema
      console.warn("Post notification preference not persisted - table not available");
      return { success: true };
    } catch (error: any) {
      console.error("Error toggling post notifications:", error);
      return {
        success: false,
        error: error.message || "Failed to toggle notifications",
      };
    }
  }

  // Block user
  static async blockUser(
    blockerId: string,
    blockedId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: existing } = await supabase
        .from("user_blocks")
        .select("id")
        .eq("blocker_id", blockerId)
        .eq("blocked_id", blockedId)
        .single();

      if (existing) {
        return {
          success: false,
          error: "You have already blocked this user",
        };
      }

      const { error } = await supabase.from("user_blocks").insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason: reason || "User blocked",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error blocking user:", error);
      return {
        success: false,
        error: error.message || "Failed to block user",
      };
    }
  }

  // Unblock user
  static async unblockUser(
    blockerId: string,
    blockedId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_id", blockerId)
        .eq("blocked_id", blockedId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      return {
        success: false,
        error: error.message || "Failed to unblock user",
      };
    }
  }

  // Check if user is blocked
  static async isUserBlocked(
    userId: string,
    targetUserId: string
  ): Promise<boolean> {
    try {
      const { data } = await supabase
        .from("user_blocks")
        .select("id")
        .eq("blocker_id", userId)
        .eq("blocked_id", targetUserId)
        .single();

      return !!data;
    } catch (error) {
      console.error("Error checking block status:", error);
      return false;
    }
  }

  // Get post preferences
  static async getPostPreferences(
    postId: string,
    userId: string
  ): Promise<PostPreference | null> {
    try {
      const { data, error } = await supabase
        .from("post_preferences")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error("Error fetching post preferences:", error);
      return null;
    }
  }

  // Get post edit history
  static async getPostEditHistory(postId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("post_edit_history")
        .select("*")
        .eq("post_id", postId)
        .order("edited_at", { ascending: false });

      if (error) return [];
      return data || [];
    } catch (error) {
      console.error("Error fetching post edit history:", error);
      return [];
    }
  }

  // Delete post
  static async deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting post:", error);
      return {
        success: false,
        error: error.message || "Failed to delete post",
      };
    }
  }

  // Update post
  static async updatePost(
    postId: string,
    updates: {
      content?: string;
      privacy?: string;
      image_url?: string | null;
      video_url?: string | null;
      location?: string | null;
      tags?: string[];
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("posts")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Error updating post:", error);
      return {
        success: false,
        error: error.message || "Failed to update post",
      };
    }
  }
}

export default PostActionsService;
