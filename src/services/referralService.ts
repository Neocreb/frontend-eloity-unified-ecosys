// @ts-nocheck
import { ActivityRewardService } from "./activityRewardService";
import { enhancedEloitsService } from "./enhancedEloitsService";

export interface ReferralLink {
  id: string;
  referralCode: string;
  referralUrl: string;
  type: "general" | "partner" | "campaign";
  campaignId?: string;
  clickCount: number;
  signupCount: number;
  conversionCount: number;
  referrerReward: number;
  refereeReward: number;
  revenueSharePercentage: number;
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
  expiresAt?: string;
  description?: string;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  conversionRate: number;
  activeReferrals: number;
  lifetimeCommissions: number;
  thisMonthEarnings: number;
  pendingRewards: number;
}

export interface PartnershipTier {
  id: string;
  name: string;
  minimumReferrals: number;
  commissionRate: number;
  bonusRewards: number;
  exclusiveFeatures: string[];
  requirements: string[];
}

export class ReferralService {
  private static apiBase = "/api";

  // Generate referral link
  static async generateReferralLink(
    params: {
      type?: "general" | "partner" | "campaign";
      campaignId?: string;
      customCode?: string;
      description?: string;
      expiresAt?: string;
      maxUses?: number;
    } = {},
  ): Promise<ReferralLink | null> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No auth token found");
        return null;
      }

      const response = await fetch(`${this.apiBase}/referral/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate referral link: ${response.statusText}`,
        );
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error generating referral link:", error);
      return null;
    }
  }

  // Get user's referral links
  static async getReferralLinks(): Promise<ReferralLink[]> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];

      const response = await fetch(`${this.apiBase}/referral/links`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch referral links");
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching referral links:", error);
      return [];
    }
  }

  // Get referral statistics
  static async getReferralStats(): Promise<ReferralStats | null> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch(`${this.apiBase}/referral/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch referral stats");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      return null;
    }
  }

  // Track referral click
  static async trackReferralClick(referralCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/referral/track-click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ referralCode }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error tracking referral click:", error);
      return false;
    }
  }

  // Process referral signup
  static async processReferralSignup(params: {
    referralCode: string;
    newUserId: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/referral/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const result = await response.json();

        // Process multi-level referral with enhanced Eloits system
        const referralResult = await enhancedEloitsService.processMultiLevelReferral(
          result.referrerId,
          params.newUserId,
          params.referralCode
        );

        if (referralResult.success) {
          console.log("Multi-level referral processed:", referralResult.message);
          
          // Log rewards for each level
          for (const reward of referralResult.rewards) {
            // Log activity reward for each level
            await ActivityRewardService.logActivity({
              userId: reward.userId,
              actionType: "refer_user",
              targetId: params.newUserId,
              targetType: "user",
              value: reward.amount,
              metadata: {
                referralCode: params.referralCode,
                refereeId: params.newUserId,
                level: reward.level,
                amount: reward.amount
              },
            });
          }
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error processing referral signup:", error);
      return false;
    }
  }

  // Get partnership tiers
  static async getPartnershipTiers(): Promise<PartnershipTier[]> {
    try {
      const response = await fetch(`${this.apiBase}/partnership/tiers`);

      if (!response.ok) {
        // Return default tiers if API fails
        return this.getDefaultPartnershipTiers();
      }

      const result = await response.json();
      return result.data || this.getDefaultPartnershipTiers();
    } catch (error) {
      console.error("Error fetching partnership tiers:", error);
      return this.getDefaultPartnershipTiers();
    }
  }

  // Apply for partnership program
  static async applyForPartnership(params: {
    tier: string;
    reason: string;
    experience: string;
    socialLinks: string[];
  }): Promise<boolean> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const response = await fetch(`${this.apiBase}/partnership/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });

      return response.ok;
    } catch (error) {
      console.error("Error applying for partnership:", error);
      return false;
    }
  }

  // Get user's partnership status
  static async getPartnershipStatus(): Promise<{
    isPartner: boolean;
    tier?: string;
    commissionRate?: number;
    features?: string[];
    applicationStatus?: "pending" | "approved" | "rejected";
  } | null> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch(`${this.apiBase}/partnership/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { isPartner: false };
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching partnership status:", error);
      return { isPartner: false };
    }
  }

  // Claim referral rewards
  static async claimReferralRewards(): Promise<{
    success: boolean;
    amount: number;
    message: string;
  }> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          success: false,
          amount: 0,
          message: "Authentication required",
        };
      }

      const response = await fetch(`${this.apiBase}/referral/claim-rewards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          amount: 0,
          message: "Failed to claim rewards",
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error claiming referral rewards:", error);
      return { success: false, amount: 0, message: "An error occurred" };
    }
  }

  // Utility methods
  static generateReferralCode(userId: string): string {
    return `SC${userId.substring(0, 6).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  static buildReferralUrl(code: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join?ref=${code}`;
  }

  static copyToClipboard(text: string): Promise<boolean> {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  }

  // Default partnership tiers (fallback data)
  private static getDefaultPartnershipTiers(): PartnershipTier[] {
    return [
      {
        id: "bronze",
        name: "Bronze Partner",
        minimumReferrals: 5,
        commissionRate: 5,
        bonusRewards: 10,
        exclusiveFeatures: [
          "Partner badge",
          "Priority support",
          "Monthly analytics",
        ],
        requirements: [
          "5+ successful referrals",
          "Active account for 30+ days",
          "Good standing in community",
        ],
      },
      {
        id: "silver",
        name: "Silver Partner",
        minimumReferrals: 25,
        commissionRate: 10,
        bonusRewards: 25,
        exclusiveFeatures: [
          "All Bronze features",
          "Custom referral codes",
          "Advanced analytics",
          "Marketing materials",
        ],
        requirements: [
          "25+ successful referrals",
          "Active account for 90+ days",
          "Consistent engagement",
        ],
      },
      {
        id: "gold",
        name: "Gold Partner",
        minimumReferrals: 100,
        commissionRate: 15,
        bonusRewards: 50,
        exclusiveFeatures: [
          "All Silver features",
          "Dedicated account manager",
          "Early access to features",
          "Higher commission rates",
        ],
        requirements: [
          "100+ successful referrals",
          "Active account for 180+ days",
          "Proven track record",
        ],
      },
      {
        id: "platinum",
        name: "Platinum Partner",
        minimumReferrals: 500,
        commissionRate: 20,
        bonusRewards: 100,
        exclusiveFeatures: [
          "All Gold features",
          "Custom partnership terms",
          "Co-marketing opportunities",
          "Revenue sharing programs",
        ],
        requirements: [
          "500+ successful referrals",
          "Active account for 365+ days",
          "Exceptional performance",
        ],
      },
    ];
  }
}