// @ts-nocheck
import { fetchWithAuth } from '@/lib/fetch-utils';

export interface RewardSharingTransaction {
  id: string;
  sharer_id: string;
  recipient_id: string;
  original_reward_amount: number;
  shared_amount: number;
  sharing_percentage: number;
  transaction_type: string;
  source_activity: string;
  activity_id?: string;
  status: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface RewardSharingStats {
  totalShared: number;
  totalReceived: number;
  sharingTransactionsCount: number;
  receivingTransactionsCount: number;
  thisMonthShared: number;
  thisMonthReceived: number;
}

export class AutomaticRewardSharingService {
  private static apiBase = "/api";

  /**
   * Process automatic reward sharing for a user's reward earnings
   * This should be called whenever a user earns rewards from creator economy activities
   */
  static async processRewardSharing(params: {
    userId: string;
    rewardAmount: number;
    sourceActivity: string; // 'content_creation', 'ad_revenue', 'engagement', etc.
    activityId?: string;
    excludePersonalEarnings?: boolean; // Exclude freelance, marketplace, crypto
  }): Promise<{ success: boolean; sharedAmount?: number; recipients?: number; error?: string }> {
    try {
      // Only process sharing for creator economy rewards, not personal earnings
      const rewardEconomyActivities = [
        'content_creation',
        'ad_revenue', 
        'engagement',
        'challenges',
        'battle_voting',
        'battle_rewards',
        'gifts_tips',
        'creator_program'
      ];

      if (params.excludePersonalEarnings !== false && !rewardEconomyActivities.includes(params.sourceActivity)) {
        return { success: true, sharedAmount: 0, recipients: 0 };
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No auth token found for reward sharing");
        return { success: false, error: "No authentication token" };
      }

      const response = await fetchWithAuth("/api/rewards/process-sharing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: params.userId,
          rewardAmount: params.rewardAmount,
          sourceActivity: params.sourceActivity,
          activityId: params.activityId,
          sharingPercentage: 0.5, // 0.5% automatic sharing
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error("Failed to process reward sharing:", errorData);
        return { success: false, error: errorData.error || response.statusText };
      }

      const result = await response.json();
      
      if (result.success && result.sharedAmount > 0) {
        console.log(`💝 Automatic sharing: ${result.sharedAmount} shared with ${result.recipients} referrals`);
      }

      return result;
    } catch (error) {
      console.error("Error processing reward sharing:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  /**
   * Get user's reward sharing statistics
   */
  static async getSharingStats(period: string = "all"): Promise<RewardSharingStats | null> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetchWithAuth(`/api/rewards/sharing-stats?period=${period}`);

      if (!response.ok) {
        throw new Error("Failed to fetch sharing stats");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching sharing stats:", error);
      return null;
    }
  }

  /**
   * Get reward sharing transaction history
   */
  static async getSharingHistory(params: {
    page?: number;
    limit?: number;
    type?: 'shared' | 'received' | 'all';
  } = {}): Promise<{ transactions: RewardSharingTransaction[]; total: number; hasMore: boolean } | null> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.limit || 20).toString(),
        type: params.type || 'all',
      });

      const response = await fetchWithAuth(`/api/rewards/sharing-history?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch sharing history");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching sharing history:", error);
      return null;
    }
  }

  /**
   * Get user's automatic sharing settings
   */
  static async getSharingSettings(): Promise<{ 
    automaticSharingEnabled: boolean; 
    sharingPercentage: number;
    eligibleReferrals: number;
  } | null> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetchWithAuth("/api/rewards/sharing-settings");

      if (!response.ok) {
        throw new Error("Failed to fetch sharing settings");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching sharing settings:", error);
      return null;
    }
  }

  /**
   * Check if reward sharing should be applied for this activity
   */
  static shouldApplySharing(sourceActivity: string): boolean {
    const rewardEconomyActivities = [
      'content_creation',
      'ad_revenue',
      'engagement', 
      'challenges',
      'battle_voting',
      'battle_rewards',
      'gifts_tips',
      'creator_program',
      'daily_login',
      'social_interactions'
    ];

    return rewardEconomyActivities.includes(sourceActivity);
  }

  /**
   * Calculate sharing amount based on activity and percentage
   */
  static calculateSharingAmount(rewardAmount: number, sharingPercentage: number = 0.5): number {
    return Math.round((rewardAmount * sharingPercentage / 100) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Format sharing notification message
   */
  static formatSharingNotification(
    sharedAmount: number, 
    recipients: number, 
    isReceiver: boolean = false
  ): string {
    if (isReceiver) {
      return `🎁 You received ${sharedAmount.toFixed(2)} Eloits from automatic reward sharing!`;
    } else {
      return `💝 Shared ${sharedAmount.toFixed(2)} Eloits with ${recipients} referral${recipients !== 1 ? 's' : ''} (0.5% automatic sharing)`;
    }
  }
}

// Integration helper to be used with existing ActivityRewardService
export async function integrateRewardSharing(
  userId: string,
  rewardAmount: number,
  sourceActivity: string,
  activityId?: string
): Promise<void> {
  if (AutomaticRewardSharingService.shouldApplySharing(sourceActivity)) {
    const result = await AutomaticRewardSharingService.processRewardSharing({
      userId,
      rewardAmount,
      sourceActivity,
      activityId,
    });

    if (result.success && result.sharedAmount && result.sharedAmount > 0) {
      // You can integrate with your notification system here
      console.log(AutomaticRewardSharingService.formatSharingNotification(
        result.sharedAmount, 
        result.recipients || 0
      ));
    }
  }
}
