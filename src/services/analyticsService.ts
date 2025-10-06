import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { UserService } from "./userService";
import { PostService } from "./postService";

type UserScore = Database["public"]["Tables"]["user_scores"]["Row"];
type ContentAnalytics = Database["public"]["Tables"]["content_analytics"]["Row"];

export class AnalyticsService {
  // Get user scores and metrics
  static async getUserScores(userId: string): Promise<UserScore | null> {
    try {
      const { data, error } = await supabase
        .from("user_scores")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user scores:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserScores:", error);
      return null;
    }
  }

  // Get user activity metrics
  static async getUserActivityMetrics(userId: string, days = 30): Promise<{
    postsCount: number;
    likesCount: number;
    commentsCount: number;
    followersGained: number;
    engagementRate: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get posts count
      const { count: postsCount, error: postsError } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString());

      if (postsError) console.error("Error fetching posts count:", postsError);

      // Get likes given
      const { count: likesCount, error: likesError } = await supabase
        .from("post_likes")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString());

      if (likesError) console.error("Error fetching likes count:", likesError);

      // Get comments made
      const { count: commentsCount, error: commentsError } = await supabase
        .from("post_comments")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString());

      if (commentsError) console.error("Error fetching comments count:", commentsError);

      // Get new followers
      const { count: followersGained, error: followersError } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("following_id", userId)
        .gte("created_at", startDate.toISOString());

      if (followersError) console.error("Error fetching followers gained:", followersError);

      // Calculate engagement rate (simplified)
      const totalInteractions = (likesCount || 0) + (commentsCount || 0);
      const engagementRate = postsCount && postsCount > 0 ? 
        (totalInteractions / postsCount) * 100 : 0;

      return {
        postsCount: postsCount || 0,
        likesCount: likesCount || 0,
        commentsCount: commentsCount || 0,
        followersGained: followersGained || 0,
        engagementRate
      };
    } catch (error) {
      console.error("Error in getUserActivityMetrics:", error);
      return {
        postsCount: 0,
        likesCount: 0,
        commentsCount: 0,
        followersGained: 0,
        engagementRate: 0
      };
    }
  }

  // Get platform statistics
  static async getPlatformStats(): Promise<{
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    totalLikes: number;
    activeUsers24h: number;
    activeUsers7d: number;
  }> {
    try {
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from("users")
        .select("*", { count: "exact" });

      if (usersError) console.error("Error fetching total users:", usersError);

      // Get total posts
      const { count: totalPosts, error: postsError } = await supabase
        .from("posts")
        .select("*", { count: "exact" });

      if (postsError) console.error("Error fetching total posts:", postsError);

      // Get total comments
      const { count: totalComments, error: commentsError } = await supabase
        .from("post_comments")
        .select("*", { count: "exact" });

      if (commentsError) console.error("Error fetching total comments:", commentsError);

      // Get total likes
      const { count: totalLikes, error: likesError } = await supabase
        .from("post_likes")
        .select("*", { count: "exact" });

      if (likesError) console.error("Error fetching total likes:", likesError);

      // Get active users (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const { count: activeUsers24h, error: active24hError } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .gte("last_active", twentyFourHoursAgo.toISOString());

      if (active24hError) console.error("Error fetching active users 24h:", active24hError);

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { count: activeUsers7d, error: active7dError } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .gte("last_active", sevenDaysAgo.toISOString());

      if (active7dError) console.error("Error fetching active users 7d:", active7dError);

      return {
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        totalComments: totalComments || 0,
        totalLikes: totalLikes || 0,
        activeUsers24h: activeUsers24h || 0,
        activeUsers7d: activeUsers7d || 0
      };
    } catch (error) {
      console.error("Error in getPlatformStats:", error);
      return {
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        totalLikes: 0,
        activeUsers24h: 0,
        activeUsers7d: 0
      };
    }
  }

  // Get content analytics
  static async getContentAnalytics(postId: string): Promise<ContentAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from("content_analytics")
        .select("*")
        .eq("post_id", postId)
        .single();

      if (error) {
        console.error("Error fetching content analytics:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getContentAnalytics:", error);
      return null;
    }
  }

  // Get user growth data
  static async getUserGrowthData(days = 30): Promise<Array<{ date: string; count: number }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // This is a simplified approach - in a real implementation, you'd want to group by date
      const { data, error } = await supabase
        .from("users")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at");

      if (error) {
        console.error("Error fetching user growth data:", error);
        return [];
      }

      // Group by date and count
      const growthData: Record<string, number> = {};
      data.forEach((user: any) => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        growthData[date] = (growthData[date] || 0) + 1;
      });

      // Convert to array format
      const result = Object.entries(growthData).map(([date, count]) => ({
        date,
        count
      }));

      return result;
    } catch (error) {
      console.error("Error in getUserGrowthData:", error);
      return [];
    }
  }

  // Get engagement metrics
  static async getEngagementMetrics(days = 30): Promise<{
    dailyEngagement: Array<{ date: string; posts: number; likes: number; comments: number }>;
    topPerformingContent: any[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get daily posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

      if (postsError) console.error("Error fetching posts data:", postsError);

      // Get daily likes
      const { data: likesData, error: likesError } = await supabase
        .from("post_likes")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

      if (likesError) console.error("Error fetching likes data:", likesError);

      // Get daily comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("post_comments")
        .select("created_at")
        .gte("created_at", startDate.toISOString());

      if (commentsError) console.error("Error fetching comments data:", commentsError);

      // Group by date
      const dailyData: Record<string, { posts: number; likes: number; comments: number }> = {};

      // Process posts
      postsData?.forEach((post: any) => {
        const date = new Date(post.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { posts: 0, likes: 0, comments: 0 };
        }
        dailyData[date].posts += 1;
      });

      // Process likes
      likesData?.forEach((like: any) => {
        const date = new Date(like.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { posts: 0, likes: 0, comments: 0 };
        }
        dailyData[date].likes += 1;
      });

      // Process comments
      commentsData?.forEach((comment: any) => {
        const date = new Date(comment.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { posts: 0, likes: 0, comments: 0 };
        }
        dailyData[date].comments += 1;
      });

      // Convert to array format
      const dailyEngagement = Object.entries(dailyData).map(([date, counts]) => ({
        date,
        posts: counts.posts,
        likes: counts.likes,
        comments: counts.comments
      }));

      // Get top performing content (simplified)
      const topPerformingContent: any[] = [];

      return {
        dailyEngagement,
        topPerformingContent
      };
    } catch (error) {
      console.error("Error in getEngagementMetrics:", error);
      return {
        dailyEngagement: [],
        topPerformingContent: []
      };
    }
  }

  // Track user activity
  static async trackUserActivity(userId: string, activityType: string, metadata?: any): Promise<boolean> {
    try {
      // Update user's last active timestamp
      const { error } = await supabase
        .from("users")
        .update({ last_active: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user activity:", error);
        return false;
      }

      // In a real implementation, you might want to log this to a separate activity table
      console.log(`User ${userId} performed activity: ${activityType}`, metadata);

      return true;
    } catch (error) {
      console.error("Error in trackUserActivity:", error);
      return false;
    }
  }

  // Get campaign analytics (for marketing campaigns)
  static async getCampaignAnalytics(campaignId: string): Promise<any> {
    try {
      // This would depend on your specific campaign tracking implementation
      // For now, returning mock data
      return {
        campaignId,
        impressions: Math.floor(Math.random() * 10000),
        clicks: Math.floor(Math.random() * 1000),
        conversions: Math.floor(Math.random() * 100),
        ctr: Math.random() * 10, // Click-through rate
        conversionRate: Math.random() * 5, // Conversion rate
        costPerClick: Math.random() * 0.5,
        totalSpend: Math.random() * 1000
      };
    } catch (error) {
      console.error("Error in getCampaignAnalytics:", error);
      return null;
    }
  }
}