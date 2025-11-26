import { supabase } from "@/integrations/supabase/client";
import { activityTransactionService } from "./activityTransactionService";

export interface ReferralRecord {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referral_code: string;
  status: string;
  referral_date: string;
  first_purchase_date: string | null;
  earnings_total: number;
  earnings_this_month: number;
  tier: string;
  auto_share_total: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  earningsThisMonth: number;
  totalAutoShared: number;
  autoSharedThisMonth: number;
  averageEarningsPerReferral: number;
  conversionRate: number;
  tier: string;
  nextTierThreshold: number;
  benefitMultiplier: number;
}

export interface ReferralTierInfo {
  tier: string;
  minReferrals: number;
  maxReferrals: number;
  pointsPerReferral: number;
  revenueShare: number;
  benefitMultiplier: number;
  benefits: string[];
}

// Referral tier definitions
const REFERRAL_TIERS: Record<string, ReferralTierInfo> = {
  bronze: {
    tier: "bronze",
    minReferrals: 0,
    maxReferrals: 4,
    pointsPerReferral: 10,
    revenueShare: 0.05, // 5%
    benefitMultiplier: 1.0,
    benefits: ["10 Eloity Points per referral", "5% revenue share"],
  },
  silver: {
    tier: "silver",
    minReferrals: 5,
    maxReferrals: 24,
    pointsPerReferral: 25,
    revenueShare: 0.075, // 7.5%
    benefitMultiplier: 1.1,
    benefits: ["25 Eloity Points per referral", "7.5% revenue share", "1.1x earnings multiplier"],
  },
  gold: {
    tier: "gold",
    minReferrals: 25,
    maxReferrals: 99,
    pointsPerReferral: 50,
    revenueShare: 0.1, // 10%
    benefitMultiplier: 1.25,
    benefits: ["50 Eloity Points per referral", "10% revenue share", "1.25x earnings multiplier", "Priority support"],
  },
  platinum: {
    tier: "platinum",
    minReferrals: 100,
    maxReferrals: Infinity,
    pointsPerReferral: 100,
    revenueShare: 0.15, // 15%
    benefitMultiplier: 1.5,
    benefits: ["100 Eloity Points per referral", "15% revenue share", "1.5x earnings multiplier", "VIP support", "Exclusive events"],
  },
};

class ReferralTrackingService {
  /**
   * Create a new referral record
   */
  async trackReferral(
    referrerId: string,
    referredUserId: string,
    referralCode: string
  ): Promise<ReferralRecord | null> {
    try {
      const { data, error } = await supabase
        .from("referral_tracking")
        .insert([
          {
            referrer_id: referrerId,
            referred_user_id: referredUserId,
            referral_code: referralCode,
            status: "pending",
            tier: "bronze",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error tracking referral:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Exception tracking referral:", err);
      return null;
    }
  }

  /**
   * Activate a referral when referred user completes first action
   */
  async activateReferral(
    referrerId: string,
    referredUserId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("referral_tracking")
        .update({
          status: "active",
          first_purchase_date: new Date().toISOString(),
        })
        .eq("referrer_id", referrerId)
        .eq("referred_user_id", referredUserId)
        .eq("status", "pending");

      if (error) {
        console.error("Error activating referral:", error);
        return false;
      }

      // Log the referral bonus
      const tierInfo = REFERRAL_TIERS.bronze; // New referrals get bronze tier bonus
      await activityTransactionService.logActivity(
        referrerId,
        "referral_signup",
        "Referrals",
        tierInfo.pointsPerReferral,
        {
          description: `New referral signup bonus`,
          sourceId: referredUserId,
          sourceType: "referral",
          amountCurrency: tierInfo.pointsPerReferral * 0.1, // Rough conversion
        }
      );

      return true;
    } catch (err) {
      console.error("Exception activating referral:", err);
      return false;
    }
  }

  /**
   * Get referral statistics for a user
   */
  async getReferralStats(userId: string): Promise<ReferralStats> {
    try {
      const { data: referrals, error } = await supabase
        .from("referral_tracking")
        .select("*")
        .eq("referrer_id", userId);

      if (error) {
        console.error("Error fetching referrals:", error);
        return this.getDefaultStats();
      }

      const totalReferrals = referrals?.length || 0;
      const activeReferrals = referrals?.filter((r) => r.status === "active").length || 0;
      const totalEarnings = referrals?.reduce((sum, r) => sum + (r.earnings_total || 0), 0) || 0;
      const earningsThisMonth =
        referrals?.reduce((sum, r) => sum + (r.earnings_this_month || 0), 0) || 0;
      const totalAutoShared =
        referrals?.reduce((sum, r) => sum + (r.auto_share_total || 0), 0) || 0;

      // Calculate tier
      const tier = this.calculateTier(activeReferrals);
      const tierInfo = REFERRAL_TIERS[tier];

      return {
        totalReferrals,
        activeReferrals,
        totalEarnings,
        earningsThisMonth,
        totalAutoShared,
        autoSharedThisMonth: earningsThisMonth * 0.005, // 0.5% of earnings
        averageEarningsPerReferral:
          activeReferrals > 0 ? totalEarnings / activeReferrals : 0,
        conversionRate: totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0,
        tier: tier,
        nextTierThreshold:
          tier === "platinum" ? Infinity : REFERRAL_TIERS[this.getNextTier(tier)].minReferrals,
        benefitMultiplier: tierInfo.benefitMultiplier,
      };
    } catch (err) {
      console.error("Exception fetching referral stats:", err);
      return this.getDefaultStats();
    }
  }

  /**
   * Get default stats
   */
  private getDefaultStats(): ReferralStats {
    return {
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarnings: 0,
      earningsThisMonth: 0,
      totalAutoShared: 0,
      autoSharedThisMonth: 0,
      averageEarningsPerReferral: 0,
      conversionRate: 0,
      tier: "bronze",
      nextTierThreshold: 5,
      benefitMultiplier: 1.0,
    };
  }

  /**
   * Get user's referrals list
   */
  async getReferralsList(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ReferralRecord[]> {
    try {
      const { data, error } = await supabase
        .from("referral_tracking")
        .select("*")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching referrals list:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Exception fetching referrals list:", err);
      return [];
    }
  }

  /**
   * Calculate tier based on active referrals
   */
  private calculateTier(activeReferrals: number): string {
    if (activeReferrals >= 100) return "platinum";
    if (activeReferrals >= 25) return "gold";
    if (activeReferrals >= 5) return "silver";
    return "bronze";
  }

  /**
   * Get next tier
   */
  private getNextTier(currentTier: string): string {
    const tierOrder = ["bronze", "silver", "gold", "platinum"];
    const currentIndex = tierOrder.indexOf(currentTier);
    return tierOrder[Math.min(currentIndex + 1, tierOrder.length - 1)];
  }

  /**
   * Get tier information
   */
  getTierInfo(tier: string): ReferralTierInfo {
    return REFERRAL_TIERS[tier] || REFERRAL_TIERS.bronze;
  }

  /**
   * Get all tiers
   */
  getAllTiers(): ReferralTierInfo[] {
    return Object.values(REFERRAL_TIERS);
  }

  /**
   * Record referral earnings
   */
  async recordReferralEarning(
    referrerId: string,
    referredUserId: string,
    amount: number
  ): Promise<boolean> {
    try {
      // Get the referral record
      const { data: referral, error: fetchError } = await supabase
        .from("referral_tracking")
        .select("*")
        .eq("referrer_id", referrerId)
        .eq("referred_user_id", referredUserId)
        .single();

      if (fetchError || !referral) {
        console.error("Error fetching referral record:", fetchError);
        return false;
      }

      // Calculate earnings with tier multiplier
      const tier = this.calculateTier(1); // Placeholder
      const tierInfo = REFERRAL_TIERS[tier];
      const referralEarning = amount * tierInfo.revenueShare;

      // Update referral with new earnings
      const { error } = await supabase
        .from("referral_tracking")
        .update({
          earnings_total: (referral.earnings_total || 0) + referralEarning,
          earnings_this_month: (referral.earnings_this_month || 0) + referralEarning,
        })
        .eq("id", referral.id);

      if (error) {
        console.error("Error recording referral earning:", error);
        return false;
      }

      // Log as activity
      await activityTransactionService.logActivity(
        referrerId,
        "referral_activity",
        "Referrals",
        referralEarning,
        {
          description: `Earnings from referral activity`,
          sourceId: referredUserId,
          sourceType: "referral",
        }
      );

      return true;
    } catch (err) {
      console.error("Exception recording referral earning:", err);
      return false;
    }
  }

  /**
   * Process automatic sharing (0.5% of earnings to referrals)
   */
  async processAutoSharing(
    referrerId: string,
    referredUserId: string,
    userEarnings: number
  ): Promise<boolean> {
    try {
      const shareAmount = userEarnings * 0.005; // 0.5%

      if (shareAmount <= 0) return true;

      // Get the referral record
      const { data: referral, error: fetchError } = await supabase
        .from("referral_tracking")
        .select("*")
        .eq("referrer_id", referrerId)
        .eq("referred_user_id", referredUserId)
        .single();

      if (fetchError || !referral) {
        return false;
      }

      // Update auto_share_total
      const { error } = await supabase
        .from("referral_tracking")
        .update({
          auto_share_total: (referral.auto_share_total || 0) + shareAmount,
        })
        .eq("id", referral.id);

      if (error) {
        console.error("Error processing auto sharing:", error);
        return false;
      }

      // Log the shared amount as activity
      await activityTransactionService.logActivity(
        referrerId,
        "referral_activity",
        "Referrals",
        shareAmount,
        {
          description: `Automatic sharing from referral (0.5%)`,
          sourceId: referredUserId,
          sourceType: "auto_share",
        }
      );

      return true;
    } catch (err) {
      console.error("Exception processing auto sharing:", err);
      return false;
    }
  }

  /**
   * Verify referral code
   */
  async verifyReferralCode(referralCode: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("referral_tracking")
        .select("referrer_id")
        .eq("referral_code", referralCode)
        .eq("status", "active")
        .single();

      if (error || !data) {
        return null;
      }

      return data.referrer_id;
    } catch (err) {
      console.error("Exception verifying referral code:", err);
      return null;
    }
  }

  /**
   * Generate unique referral code
   */
  generateReferralCode(userId: string): string {
    const timestamp = Date.now().toString(36);
    const userPart = userId.substring(0, 6).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${userPart}${random}`;
  }

  /**
   * Subscribe to referral updates
   */
  subscribeToReferrals(
    userId: string,
    onUpdate: (referral: ReferralRecord) => void,
    onError?: (error: any) => void
  ) {
    const subscription = supabase
      .from(`referral_tracking:referrer_id=eq.${userId}`)
      .on("INSERT", (payload) => {
        onUpdate(payload.new);
      })
      .on("UPDATE", (payload) => {
        onUpdate(payload.new);
      })
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to referral updates");
        } else if (status === "CLOSED") {
          console.log("Unsubscribed from referral updates");
        }
        if (err && onError) {
          onError(err);
        }
      });

    return subscription;
  }
}

// Export singleton instance
export const referralTrackingService = new ReferralTrackingService();
