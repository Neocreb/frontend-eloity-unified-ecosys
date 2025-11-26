import { supabase } from "@/integrations/supabase/client";
import { activityTransactionService } from "./activityTransactionService";

export interface UserRewardsSummary {
  user_id: string;
  total_earned: number;
  available_balance: number;
  total_withdrawn: number;
  current_streak: number;
  longest_streak: number;
  trust_score: number;
  level: number;
  next_level_threshold: number;
  currency_code: string;
  total_activities: number;
  activities_this_month: number;
  last_activity_at: string | null;
  updated_at: string;
}

export interface RewardLevel {
  level: number;
  threshold: number;
  title: string;
  benefits: string[];
  color: string;
}

// Reward level definitions
const REWARD_LEVELS: RewardLevel[] = [
  {
    level: 1,
    threshold: 0,
    title: "Starter",
    benefits: ["Basic rewards", "Community access"],
    color: "#6B7280",
  },
  {
    level: 2,
    threshold: 100,
    title: "Bronze",
    benefits: ["Verified badge", "1.1x multiplier"],
    color: "#92400E",
  },
  {
    level: 3,
    threshold: 500,
    title: "Silver",
    benefits: ["1.2x multiplier", "Early access"],
    color: "#C0C7D0",
  },
  {
    level: 4,
    threshold: 1500,
    title: "Gold",
    benefits: ["1.3x multiplier", "Premium support"],
    color: "#D97706",
  },
  {
    level: 5,
    threshold: 3000,
    title: "Platinum",
    benefits: ["1.5x multiplier", "VIP access"],
    color: "#3B82F6",
  },
  {
    level: 6,
    threshold: 6000,
    title: "Diamond",
    benefits: ["2.0x multiplier", "Exclusive events"],
    color: "#8B5CF6",
  },
];

class UserRewardsSummaryService {
  /**
   * Get user's reward summary (dashboard data)
   */
  async getSummary(userId: string): Promise<UserRewardsSummary | null> {
    try {
      const { data, error } = await supabase
        .from("user_rewards_summary")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found, which is expected for new users
        console.error("Error fetching reward summary:", error);
        return null;
      }

      // Return default for new users
      if (!data) {
        return this.getDefaultSummary(userId);
      }

      return data;
    } catch (err) {
      console.error("Exception fetching reward summary:", err);
      return null;
    }
  }

  /**
   * Get default summary for new users
   */
  private getDefaultSummary(userId: string): UserRewardsSummary {
    return {
      user_id: userId,
      total_earned: 0,
      available_balance: 0,
      total_withdrawn: 0,
      current_streak: 0,
      longest_streak: 0,
      trust_score: 50,
      level: 1,
      next_level_threshold: 100,
      currency_code: "USD",
      total_activities: 0,
      activities_this_month: 0,
      last_activity_at: null,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Initialize summary for a new user
   */
  async initializeSummary(userId: string, currencyCode: string = "USD"): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_rewards_summary")
        .insert([
          {
            user_id: userId,
            currency_code: currencyCode,
            trust_score: 50,
            level: 1,
            next_level_threshold: 100,
          },
        ]);

      if (error && error.code !== "23505") {
        // 23505 = unique violation (already exists)
        console.error("Error initializing summary:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Exception initializing summary:", err);
      return false;
    }
  }

  /**
   * Update summary after activity logging
   */
  async updateSummaryOnActivity(userId: string): Promise<boolean> {
    try {
      // Get fresh activity data
      const summary = await this.getSummary(userId);
      if (!summary) return false;

      // Recalculate totals
      const { data: activities, error } = await supabase
        .from("activity_transactions")
        .select("amount_currency, created_at, status")
        .eq("user_id", userId)
        .eq("status", "completed");

      if (error) {
        console.error("Error fetching activities for summary update:", error);
        return false;
      }

      // Calculate new totals
      let totalEarned = 0;
      let activitiesThisMonth = 0;
      let lastActivityAt: string | null = null;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      activities?.forEach((activity) => {
        if (activity.amount_currency) {
          totalEarned += activity.amount_currency;
        }

        const activityDate = new Date(activity.created_at);
        if (activityDate >= monthStart) {
          activitiesThisMonth++;
        }

        if (!lastActivityAt || activityDate > new Date(lastActivityAt)) {
          lastActivityAt = activity.created_at;
        }
      });

      // Calculate new level and streak
      const newLevel = this.calculateLevel(totalEarned);
      const newStreak = await this.calculateStreak(userId);
      const nextLevelThreshold =
        REWARD_LEVELS.find((l) => l.level === newLevel + 1)?.threshold ||
        REWARD_LEVELS[REWARD_LEVELS.length - 1].threshold * 2;

      // Update summary
      const { error: updateError } = await supabase
        .from("user_rewards_summary")
        .update({
          total_earned: totalEarned,
          available_balance: Math.max(totalEarned - summary.total_withdrawn, 0),
          level: newLevel,
          next_level_threshold: nextLevelThreshold,
          current_streak: newStreak,
          total_activities: activities?.length || 0,
          activities_this_month: activitiesThisMonth,
          last_activity_at: lastActivityAt,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating reward summary:", updateError);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Exception updating summary:", err);
      return false;
    }
  }

  /**
   * Calculate level based on earnings
   */
  private calculateLevel(totalEarned: number): number {
    let level = 1;

    for (const rewardLevel of REWARD_LEVELS) {
      if (totalEarned >= rewardLevel.threshold) {
        level = rewardLevel.level;
      } else {
        break;
      }
    }

    return Math.min(level, REWARD_LEVELS.length);
  }

  /**
   * Calculate current streak
   */
  private async calculateStreak(userId: string): Promise<number> {
    try {
      // Get daily stats
      const { data: stats, error } = await supabase
        .from("user_daily_stats")
        .select("stats_date")
        .eq("user_id", userId)
        .order("stats_date", { ascending: false })
        .limit(100);

      if (error || !stats || stats.length === 0) {
        return 0;
      }

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < stats.length; i++) {
        const statsDate = new Date(stats[i].stats_date);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);

        if (statsDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (err) {
      console.error("Exception calculating streak:", err);
      return 0;
    }
  }

  /**
   * Get level information
   */
  getLevel(level: number): RewardLevel | undefined {
    return REWARD_LEVELS.find((l) => l.level === level);
  }

  /**
   * Get all levels
   */
  getAllLevels(): RewardLevel[] {
    return REWARD_LEVELS;
  }

  /**
   * Calculate trust score based on various factors
   */
  async calculateTrustScore(userId: string): Promise<number> {
    try {
      const summary = await this.getSummary(userId);
      if (!summary) return 50;

      let score = 50;

      // Activity level bonus
      if (summary.total_activities > 100) score += 10;
      if (summary.total_activities > 50) score += 5;

      // Streak bonus
      if (summary.current_streak > 30) score += 15;
      if (summary.current_streak > 7) score += 10;
      if (summary.current_streak > 0) score += 5;

      // Level bonus
      if (summary.level >= 5) score += 20;
      if (summary.level >= 3) score += 10;

      // Negative factors
      const { data: failedActivities } = await supabase
        .from("activity_transactions")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "failed");

      if (failedActivities && failedActivities.length > 5) {
        score -= Math.min(failedActivities.length * 2, 20);
      }

      // Cap between 0 and 100
      return Math.max(0, Math.min(100, score));
    } catch (err) {
      console.error("Exception calculating trust score:", err);
      return 50;
    }
  }

  /**
   * Update trust score
   */
  async updateTrustScore(userId: string): Promise<boolean> {
    try {
      const newScore = await this.calculateTrustScore(userId);

      const { error } = await supabase
        .from("user_rewards_summary")
        .update({ trust_score: newScore })
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating trust score:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Exception updating trust score:", err);
      return false;
    }
  }

  /**
   * Withdraw funds
   */
  async withdrawFunds(
    userId: string,
    amount: number,
    method: string
  ): Promise<boolean> {
    try {
      const summary = await this.getSummary(userId);
      if (!summary || summary.available_balance < amount) {
        console.error("Insufficient balance for withdrawal");
        return false;
      }

      const newBalance = summary.available_balance - amount;

      const { error } = await supabase
        .from("user_rewards_summary")
        .update({
          available_balance: newBalance,
          total_withdrawn: summary.total_withdrawn + amount,
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error processing withdrawal:", error);
        return false;
      }

      // Log the withdrawal as activity
      await activityTransactionService.logActivity(
        userId,
        "withdrawal",
        "Withdrawal",
        -amount,
        {
          description: `Withdrawal via ${method}`,
          sourceType: "withdrawal",
          status: "completed",
        }
      );

      return true;
    } catch (err) {
      console.error("Exception processing withdrawal:", err);
      return false;
    }
  }

  /**
   * Subscribe to real-time summary updates
   */
  subscribeToSummary(
    userId: string,
    onUpdate: (summary: UserRewardsSummary) => void,
    onError?: (error: any) => void
  ) {
    const subscription = supabase
      .from(`user_rewards_summary:user_id=eq.${userId}`)
      .on("UPDATE", (payload) => {
        onUpdate(payload.new);
      })
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to summary updates");
        } else if (status === "CLOSED") {
          console.log("Unsubscribed from summary updates");
        }
        if (err && onError) {
          onError(err);
        }
      });

    return subscription;
  }

  /**
   * Get summary with cache option
   */
  private cache: Map<string, { summary: UserRewardsSummary; timestamp: number }> = new Map();
  private cacheExpiry = 30000; // 30 seconds

  async getSummaryWithCache(userId: string): Promise<UserRewardsSummary | null> {
    const cached = this.cache.get(userId);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheExpiry) {
      return cached.summary;
    }

    const summary = await this.getSummary(userId);

    if (summary) {
      this.cache.set(userId, { summary, timestamp: now });
    }

    return summary;
  }

  /**
   * Clear cache for user
   */
  clearCache(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const userRewardsSummaryService = new UserRewardsSummaryService();
