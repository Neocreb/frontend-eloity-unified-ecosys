// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export interface ServiceRewardConfig {
  serviceId: string;
  pointsPerTransaction: number;
  bonusMultiplier?: number;
  bonusThreshold?: number; // Number of transactions to trigger bonus
  badge?: string;
  badgeDescription?: string;
}

export interface UserServiceRewards {
  serviceId: string;
  totalPoints: number;
  totalTransactions: number;
  lastTransactionDate?: string;
  badges: string[];
  nextMilestone?: {
    transactions: number;
    points: number;
    badge?: string;
  };
}

export interface ServiceRewardTransaction {
  id: string;
  userId: string;
  serviceId: string;
  transactionId: string;
  pointsAwarded: number;
  multiplier: number;
  bonusApplied: boolean;
  createdAt: string;
}

// Service-to-Reward Configuration
export const SERVICE_REWARD_CONFIG: Record<string, ServiceRewardConfig> = {
  'send-money': {
    serviceId: 'send-money',
    pointsPerTransaction: 15,
    bonusMultiplier: 1.5,
    bonusThreshold: 5,
    badge: 'MONEY_MOVER',
    badgeDescription: 'Sent 10+ money transfers',
  },
  'airtime': {
    serviceId: 'airtime',
    pointsPerTransaction: 5,
    bonusMultiplier: 1.2,
    bonusThreshold: 10,
    badge: 'AIRTIME_PRO',
    badgeDescription: 'Purchased 10+ airtime',
  },
  'electricity': {
    serviceId: 'electricity',
    pointsPerTransaction: 10,
    bonusMultiplier: 1.3,
    bonusThreshold: 8,
    badge: 'BILL_PAYER',
    badgeDescription: 'Paid 8+ electricity bills',
  },
  'freelance': {
    serviceId: 'freelance',
    pointsPerTransaction: 50,
    bonusMultiplier: 2,
    bonusThreshold: 5,
    badge: 'HUSTLER',
    badgeDescription: 'Completed 5+ freelance gigs',
  },
  'marketplace': {
    serviceId: 'marketplace',
    pointsPerTransaction: 20,
    bonusMultiplier: 1.5,
    bonusThreshold: 10,
    badge: 'SHOPPER',
    badgeDescription: 'Made 10+ marketplace purchases',
  },
  'buy-gift-cards': {
    serviceId: 'buy-gift-cards',
    pointsPerTransaction: 8,
    bonusMultiplier: 1.25,
    bonusThreshold: 15,
    badge: 'GIFT_GIVER',
    badgeDescription: 'Purchased 15+ gift cards',
  },
  'data': {
    serviceId: 'data',
    pointsPerTransaction: 5,
    bonusMultiplier: 1.2,
    bonusThreshold: 10,
    badge: 'DATA_KING',
    badgeDescription: 'Purchased 10+ data plans',
  },
  'transfer': {
    serviceId: 'transfer',
    pointsPerTransaction: 12,
    bonusMultiplier: 1.4,
    bonusThreshold: 7,
  },
  'crypto': {
    serviceId: 'crypto',
    pointsPerTransaction: 30,
    bonusMultiplier: 1.8,
    bonusThreshold: 5,
    badge: 'CRYPTO_TRADER',
    badgeDescription: 'Made 5+ crypto trades',
  },
  'investments': {
    serviceId: 'investments',
    pointsPerTransaction: 40,
    bonusMultiplier: 2,
    bonusThreshold: 3,
    badge: 'INVESTOR',
    badgeDescription: 'Made 3+ investments',
  },
};

class ServiceRewardsService {
  /**
   * Get reward config for a service
   */
  getRewardConfig(serviceId: string): ServiceRewardConfig | null {
    return SERVICE_REWARD_CONFIG[serviceId] || null;
  }

  /**
   * Calculate points for a transaction
   */
  calculatePoints(serviceId: string, transactionCount: number): {
    points: number;
    multiplier: number;
    bonusApplied: boolean;
  } {
    const config = this.getRewardConfig(serviceId);
    if (!config) {
      return { points: 0, multiplier: 1, bonusApplied: false };
    }

    let points = config.pointsPerTransaction;
    let multiplier = 1;
    let bonusApplied = false;

    // Check if bonus should be applied
    if (
      config.bonusThreshold &&
      config.bonusMultiplier &&
      transactionCount % config.bonusThreshold === 0
    ) {
      multiplier = config.bonusMultiplier;
      points = Math.floor(points * multiplier);
      bonusApplied = true;
    }

    return { points, multiplier, bonusApplied };
  }

  /**
   * Get user rewards for a service
   */
  async getUserServiceRewards(userId: string, serviceId: string): Promise<UserServiceRewards> {
    try {
      const { data, error } = await supabase
        .from("user_service_rewards")
        .select("*")
        .eq("user_id", userId)
        .eq("service_id", serviceId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (!data) {
        return {
          serviceId,
          totalPoints: 0,
          totalTransactions: 0,
          badges: [],
        };
      }

      return {
        serviceId: data.service_id,
        totalPoints: data.total_points,
        totalTransactions: data.total_transactions,
        lastTransactionDate: data.last_transaction_date,
        badges: data.badges || [],
        nextMilestone: this.calculateNextMilestone(serviceId, data.total_transactions),
      };
    } catch (error) {
      console.error("Error fetching user service rewards:", error);
      return {
        serviceId,
        totalPoints: 0,
        totalTransactions: 0,
        badges: [],
      };
    }
  }

  /**
   * Get all service rewards for a user
   */
  async getUserAllServiceRewards(userId: string): Promise<UserServiceRewards[]> {
    try {
      const { data, error } = await supabase
        .from("user_service_rewards")
        .select("*")
        .eq("user_id", userId)
        .order("total_points", { ascending: false });

      if (error) throw error;

      return (data || []).map(d => ({
        serviceId: d.service_id,
        totalPoints: d.total_points,
        totalTransactions: d.total_transactions,
        lastTransactionDate: d.last_transaction_date,
        badges: d.badges || [],
        nextMilestone: this.calculateNextMilestone(d.service_id, d.total_transactions),
      }));
    } catch (error) {
      console.error("Error fetching user service rewards:", error);
      return [];
    }
  }

  /**
   * Award points for a transaction
   */
  async awardPoints(
    userId: string,
    serviceId: string,
    transactionId: string
  ): Promise<ServiceRewardTransaction | null> {
    try {
      // Get current rewards
      const rewards = await this.getUserServiceRewards(userId, serviceId);
      const newTransactionCount = rewards.totalTransactions + 1;

      // Calculate points
      const { points, multiplier, bonusApplied } = this.calculatePoints(
        serviceId,
        newTransactionCount
      );

      // Check if badge should be awarded
      const config = this.getRewardConfig(serviceId);
      let badgesToAdd: string[] = [...(rewards.badges || [])];

      if (config?.badge && config.bonusThreshold && newTransactionCount % config.bonusThreshold === 0) {
        if (!badgesToAdd.includes(config.badge)) {
          badgesToAdd.push(config.badge);
        }
      }

      // Update or create reward record
      const { data, error } = await supabase
        .from("user_service_rewards")
        .upsert({
          user_id: userId,
          service_id: serviceId,
          total_points: (rewards.totalPoints || 0) + points,
          total_transactions: newTransactionCount,
          badges: badgesToAdd,
          last_transaction_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Log the transaction
      const { data: logData, error: logError } = await supabase
        .from("service_reward_transactions")
        .insert({
          user_id: userId,
          service_id: serviceId,
          transaction_id: transactionId,
          points_awarded: points,
          multiplier,
          bonus_applied: bonusApplied,
        })
        .select()
        .single();

      if (logError) throw logError;

      return {
        id: logData.id,
        userId: logData.user_id,
        serviceId: logData.service_id,
        transactionId: logData.transaction_id,
        pointsAwarded: logData.points_awarded,
        multiplier: logData.multiplier,
        bonusApplied: logData.bonus_applied,
        createdAt: logData.created_at,
      };
    } catch (error) {
      console.error("Error awarding points:", error);
      return null;
    }
  }

  /**
   * Calculate next milestone for a service
   */
  private calculateNextMilestone(
    serviceId: string,
    currentTransactionCount: number
  ): UserServiceRewards['nextMilestone'] {
    const config = this.getRewardConfig(serviceId);
    if (!config || !config.bonusThreshold) {
      return undefined;
    }

    const nextMilestoneCount = Math.ceil(
      (currentTransactionCount + 1) / config.bonusThreshold
    ) * config.bonusThreshold;

    const transactionsRemaining = nextMilestoneCount - currentTransactionCount;
    const bonusPoints = Math.floor(config.pointsPerTransaction * (config.bonusMultiplier || 1));

    return {
      transactions: nextMilestoneCount,
      points: bonusPoints,
      badge: config.badge,
    };
  }

  /**
   * Get all available badges
   */
  getAllAvailableBadges(): Array<{ id: string; name: string; description: string }> {
    return Object.values(SERVICE_REWARD_CONFIG)
      .filter(config => config.badge)
      .map(config => ({
        id: config.badge!,
        name: config.badge!,
        description: config.badgeDescription || '',
      }));
  }

  /**
   * Get leaderboard by service
   */
  async getServiceLeaderboard(
    serviceId: string,
    limit = 10
  ): Promise<Array<{ userId: string; totalPoints: number; totalTransactions: number }>> {
    try {
      const { data, error } = await supabase
        .from("user_service_rewards")
        .select("user_id, total_points, total_transactions")
        .eq("service_id", serviceId)
        .order("total_points", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  }

  /**
   * Get overall leaderboard
   */
  async getOverallLeaderboard(limit = 10): Promise<Array<{ userId: string; totalPoints: number }>> {
    try {
      const { data, error } = await supabase
        .rpc("get_overall_leaderboard", { limit });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching overall leaderboard:", error);
      return [];
    }
  }
}

export const serviceRewardsService = new ServiceRewardsService();
