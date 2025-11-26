import { supabase } from "@/integrations/supabase/client";

// Type definitions
export interface ActivityTransaction {
  id: string;
  user_id: string;
  activity_type: string;
  category: string;
  description: string | null;
  amount_eloits: number | null;
  amount_currency: number | null;
  currency_code: string;
  status: string;
  source_id: string | null;
  source_type: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityFilter {
  type?: string;
  category?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ActivitySummary {
  totalCount: number;
  totalEarnings: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  thisMonth: number;
  today: number;
}

// Activity type constants
export const ACTIVITY_TYPES = {
  POST_CREATION: "post_creation",
  ENGAGEMENT: "engagement",
  CHALLENGE_COMPLETE: "challenge_complete",
  BATTLE_VOTE: "battle_vote",
  BATTLE_LOSS: "battle_loss",
  GIFT_RECEIVED: "gift_received",
  TIP_RECEIVED: "tip_received",
  REFERRAL_SIGNUP: "referral_signup",
  REFERRAL_ACTIVITY: "referral_activity",
  MARKETPLACE_SALE: "marketplace_sale",
  FREELANCE_WORK: "freelance_work",
  P2P_TRADING: "p2p_trading",
} as const;

export const ACTIVITY_CATEGORIES = {
  CONTENT: "Content",
  ENGAGEMENT: "Engagement",
  CHALLENGES: "Challenges",
  BATTLES: "Battles",
  GIFTS: "Gifts",
  REFERRALS: "Referrals",
  MARKETPLACE: "Marketplace",
  FREELANCE: "Freelance",
  CRYPTO: "Crypto",
} as const;

class ActivityTransactionService {
  /**
   * Log a new activity transaction
   */
  async logActivity(
    userId: string,
    type: string,
    category: string,
    amount: number,
    options?: {
      description?: string;
      amountCurrency?: number;
      currencyCode?: string;
      sourceId?: string;
      sourceType?: string;
      metadata?: Record<string, any>;
      status?: string;
    }
  ): Promise<ActivityTransaction | null> {
    try {
      const { data, error } = await supabase
        .from("activity_transactions")
        .insert([
          {
            user_id: userId,
            activity_type: type,
            category: category,
            amount_eloits: amount,
            amount_currency: options?.amountCurrency || 0,
            currency_code: options?.currencyCode || "USD",
            description: options?.description || null,
            source_id: options?.sourceId || null,
            source_type: options?.sourceType || null,
            metadata: options?.metadata || {},
            status: options?.status || "completed",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error logging activity:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Exception logging activity:", err);
      return null;
    }
  }

  /**
   * Get user's activity feed with pagination
   */
  async getActivityFeed(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    filters?: ActivityFilter
  ): Promise<ActivityTransaction[]> {
    try {
      let query = supabase
        .from("activity_transactions")
        .select("*")
        .eq("user_id", userId);

      // Apply filters
      if (filters) {
        if (filters.type) {
          query = query.eq("activity_type", filters.type);
        }
        if (filters.category) {
          query = query.eq("category", filters.category);
        }
        if (filters.status) {
          query = query.eq("status", filters.status);
        }
        if (filters.startDate) {
          query = query.gte(
            "created_at",
            filters.startDate.toISOString()
          );
        }
        if (filters.endDate) {
          query = query.lte(
            "created_at",
            filters.endDate.toISOString()
          );
        }
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching activity feed:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Exception fetching activity feed:", err);
      return [];
    }
  }

  /**
   * Get total count of activities for a user
   */
  async getActivityCount(userId: string, filter?: ActivityFilter): Promise<number> {
    try {
      let query = supabase
        .from("activity_transactions")
        .select("id", { count: "exact" })
        .eq("user_id", userId);

      if (filter?.type) {
        query = query.eq("activity_type", filter.type);
      }
      if (filter?.category) {
        query = query.eq("category", filter.category);
      }
      if (filter?.status) {
        query = query.eq("status", filter.status);
      }

      const { count, error } = await query;

      if (error) {
        console.error("Error counting activities:", error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error("Exception counting activities:", err);
      return 0;
    }
  }

  /**
   * Get activities by specific type
   */
  async getActivitiesByType(
    userId: string,
    type: string,
    limit: number = 20
  ): Promise<ActivityTransaction[]> {
    return this.getActivityFeed(userId, limit, 0, { type });
  }

  /**
   * Get activities by date range
   */
  async getActivitiesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 100
  ): Promise<ActivityTransaction[]> {
    return this.getActivityFeed(userId, limit, 0, { startDate, endDate });
  }

  /**
   * Get today's activities
   */
  async getTodayActivities(userId: string): Promise<ActivityTransaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getActivitiesByDateRange(userId, today, tomorrow);
  }

  /**
   * Get this month's activities
   */
  async getThisMonthActivities(userId: string): Promise<ActivityTransaction[]> {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.getActivitiesByDateRange(userId, firstDay, lastDay, 1000);
  }

  /**
   * Calculate activity summary statistics
   */
  async getActivitySummary(userId: string): Promise<ActivitySummary> {
    try {
      const allActivities = await this.getActivityFeed(userId, 1000, 0);
      const todayActivities = await this.getTodayActivities(userId);
      const monthActivities = await this.getThisMonthActivities(userId);

      const summary: ActivitySummary = {
        totalCount: allActivities.length,
        totalEarnings: 0,
        byCategory: {},
        byType: {},
        thisMonth: monthActivities.length,
        today: todayActivities.length,
      };

      // Calculate totals and breakdowns
      allActivities.forEach((activity) => {
        if (activity.amount_currency) {
          summary.totalEarnings += activity.amount_currency;
        }

        // By category
        if (!summary.byCategory[activity.category]) {
          summary.byCategory[activity.category] = 0;
        }
        if (activity.amount_currency) {
          summary.byCategory[activity.category] += activity.amount_currency;
        }

        // By type
        if (!summary.byType[activity.activity_type]) {
          summary.byType[activity.activity_type] = 0;
        }
        if (activity.amount_currency) {
          summary.byType[activity.activity_type] += activity.amount_currency;
        }
      });

      return summary;
    } catch (err) {
      console.error("Error calculating activity summary:", err);
      return {
        totalCount: 0,
        totalEarnings: 0,
        byCategory: {},
        byType: {},
        thisMonth: 0,
        today: 0,
      };
    }
  }

  /**
   * Search activities by description
   */
  async searchActivities(
    userId: string,
    query: string,
    limit: number = 50
  ): Promise<ActivityTransaction[]> {
    try {
      const { data, error } = await supabase
        .from("activity_transactions")
        .select("*")
        .eq("user_id", userId)
        .ilike("description", `%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error searching activities:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Exception searching activities:", err);
      return [];
    }
  }

  /**
   * Get earning breakdown by category
   */
  async getEarningsByCategory(userId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from("activity_transactions")
        .select("category, amount_currency")
        .eq("user_id", userId)
        .eq("status", "completed");

      if (error) {
        console.error("Error getting earnings by category:", error);
        return {};
      }

      const breakdown: Record<string, number> = {};

      data?.forEach((item) => {
        if (!breakdown[item.category]) {
          breakdown[item.category] = 0;
        }
        if (item.amount_currency) {
          breakdown[item.category] += item.amount_currency;
        }
      });

      return breakdown;
    } catch (err) {
      console.error("Exception getting earnings breakdown:", err);
      return {};
    }
  }

  /**
   * Get recent activities with pagination
   */
  async getRecentActivities(
    userId: string,
    days: number = 7,
    limit: number = 50
  ): Promise<ActivityTransaction[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getActivitiesByDateRange(userId, startDate, new Date(), limit);
  }

  /**
   * Subscribe to real-time activity updates
   */
  subscribeToActivities(
    userId: string,
    onUpdate: (activity: ActivityTransaction) => void,
    onError?: (error: any) => void
  ) {
    const subscription = supabase
      .from(`activity_transactions:user_id=eq.${userId}`)
      .on("INSERT", (payload) => {
        onUpdate(payload.new);
      })
      .on("UPDATE", (payload) => {
        onUpdate(payload.new);
      })
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to activity updates");
        } else if (status === "CLOSED") {
          console.log("Unsubscribed from activity updates");
        }
        if (err && onError) {
          onError(err);
        }
      });

    return subscription;
  }

  /**
   * Mark activity as refunded
   */
  async refundActivity(activityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("activity_transactions")
        .update({ status: "refunded" })
        .eq("id", activityId);

      if (error) {
        console.error("Error refunding activity:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Exception refunding activity:", err);
      return false;
    }
  }

  /**
   * Batch log multiple activities (for bulk operations)
   */
  async logMultipleActivities(
    userId: string,
    activities: Array<{
      type: string;
      category: string;
      amount: number;
      description?: string;
      sourceId?: string;
      sourceType?: string;
    }>
  ): Promise<ActivityTransaction[]> {
    try {
      const records = activities.map((activity) => ({
        user_id: userId,
        activity_type: activity.type,
        category: activity.category,
        amount_eloits: activity.amount,
        amount_currency: activity.amount,
        currency_code: "USD",
        description: activity.description || null,
        source_id: activity.sourceId || null,
        source_type: activity.sourceType || null,
        metadata: {},
        status: "completed",
      }));

      const { data, error } = await supabase
        .from("activity_transactions")
        .insert(records)
        .select();

      if (error) {
        console.error("Error logging multiple activities:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Exception logging multiple activities:", err);
      return [];
    }
  }
}

// Export singleton instance
export const activityTransactionService = new ActivityTransactionService();
