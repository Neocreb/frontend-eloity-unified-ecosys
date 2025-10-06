import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { UserService, UserWithProfile } from "./userService";

type Follower = Database["public"]["Tables"]["followers"]["Row"];

export class FollowService {
  // Follow a user
  static async followUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      // Check if already following
      const isFollowing = await this.isFollowing(followerId, followingId);
      if (isFollowing) {
        return true; // Already following
      }

      const { error } = await supabase
        .from("followers")
        .insert({
          follower_id: followerId,
          following_id: followingId,
        });

      if (error) {
        console.error("Error following user:", error);
        return false;
      }

      // Update followers count for the user being followed
      await this.updateFollowersCount(followingId, 1);
      
      // Update following count for the follower
      await this.updateFollowingCount(followerId, 1);

      return true;
    } catch (error) {
      console.error("Error in followUser:", error);
      return false;
    }
  }

  // Unfollow a user
  static async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("followers")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);

      if (error) {
        console.error("Error unfollowing user:", error);
        return false;
      }

      // Update followers count for the user being unfollowed
      await this.updateFollowersCount(followingId, -1);
      
      // Update following count for the follower
      await this.updateFollowingCount(followerId, -1);

      return true;
    } catch (error) {
      console.error("Error in unfollowUser:", error);
      return false;
    }
  }

  // Check if user is following another user
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .maybeSingle();

      if (error) {
        console.error("Error checking follow status:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error in isFollowing:", error);
      return false;
    }
  }

  // Get followers count
  static async getFollowersCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("following_id", userId);

      if (error) {
        console.error("Error fetching followers count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getFollowersCount:", error);
      return 0;
    }
  }

  // Get following count
  static async getFollowingCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("follower_id", userId);

      if (error) {
        console.error("Error fetching following count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getFollowingCount:", error);
      return 0;
    }
  }

  // Update followers count in user profile
  static async updateFollowersCount(userId: string, delta: number): Promise<void> {
    try {
      // Get current followers count
      const currentCount = await this.getFollowersCount(userId);
      const newCount = Math.max(0, currentCount + delta);

      // Update user profile
      await supabase
        .from("users")
        .update({ followers_count: newCount })
        .eq("id", userId);
    } catch (error) {
      console.error("Error updating followers count:", error);
    }
  }

  // Update following count in user profile
  static async updateFollowingCount(userId: string, delta: number): Promise<void> {
    try {
      // Get current following count
      const currentCount = await this.getFollowingCount(userId);
      const newCount = Math.max(0, currentCount + delta);

      // Update user profile
      await supabase
        .from("users")
        .update({ following_count: newCount })
        .eq("id", userId);
    } catch (error) {
      console.error("Error updating following count:", error);
    }
  }

  // Get user's followers
  static async getUserFollowers(userId: string, limit = 20, offset = 0): Promise<UserWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from("followers")
        .select(`
          follower:users!followers_follower_id_fkey (
            *,
            profiles (*)
          )
        `)
        .eq("following_id", userId)
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching user followers:", error);
        return [];
      }

      return data.map((item: any) => item.follower) as UserWithProfile[];
    } catch (error) {
      console.error("Error in getUserFollowers:", error);
      return [];
    }
  }

  // Get user's following
  static async getUserFollowing(userId: string, limit = 20, offset = 0): Promise<UserWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from("followers")
        .select(`
          following:users!followers_following_id_fkey (
            *,
            profiles (*)
          )
        `)
        .eq("follower_id", userId)
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching user following:", error);
        return [];
      }

      return data.map((item: any) => item.following) as UserWithProfile[];
    } catch (error) {
      console.error("Error in getUserFollowing:", error);
      return [];
    }
  }

  // Get mutual followers between two users
  static async getMutualFollowers(userId1: string, userId2: string, limit = 20): Promise<UserWithProfile[]> {
    try {
      // Get followers of both users and find intersection
      const { data, error } = await supabase
        .from("followers")
        .select(`
          follower:users!followers_follower_id_fkey (
            *,
            profiles (*)
          )
        `)
        .eq("following_id", userId1)
        .in("follower_id", 
          supabase
            .from("followers")
            .select("follower_id")
            .eq("following_id", userId2)
        );

      if (error) {
        console.error("Error fetching mutual followers:", error);
        return [];
      }

      return data.map((item: any) => item.follower) as UserWithProfile[];
    } catch (error) {
      console.error("Error in getMutualFollowers:", error);
      return [];
    }
  }

  // Get suggested users to follow
  static async getSuggestedUsers(userId: string, limit = 10): Promise<UserWithProfile[]> {
    try {
      // Get users that the current user is not following and are not the user themselves
      // This is a simplified approach - in a real app, you'd want more sophisticated suggestions
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          profiles (*)
        `)
        .neq("id", userId)
        .limit(limit * 2); // Get more to filter out already followed users

      if (error) {
        console.error("Error fetching suggested users:", error);
        return [];
      }

      // Filter out users that are already being followed
      const suggestions = [];
      for (const user of data) {
        const isFollowing = await this.isFollowing(userId, user.id);
        if (!isFollowing) {
          suggestions.push(user);
        }
        if (suggestions.length >= limit) break;
      }

      return suggestions as UserWithProfile[];
    } catch (error) {
      console.error("Error in getSuggestedUsers:", error);
      return [];
    }
  }

  // Get follow statistics for a user
  static async getFollowStats(userId: string): Promise<{
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
  }> {
    try {
      const followersCount = await this.getFollowersCount(userId);
      const followingCount = await this.getFollowingCount(userId);
      
      return {
        followersCount,
        followingCount,
        isFollowing: false // This would be set based on current user context
      };
    } catch (error) {
      console.error("Error in getFollowStats:", error);
      return {
        followersCount: 0,
        followingCount: 0,
        isFollowing: false
      };
    }
  }
}