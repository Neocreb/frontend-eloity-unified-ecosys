import { fetchWithAuth } from '@/lib/api';

export interface CreatorBoost {
  id: string;
  userId: string;
  boostType: 'new_tier_2' | 'seasonal' | 'achievement' | 'promotional';
  multiplier: number;
  baseBenefit: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalBoosted: number;
  appliedEarnings: number;
  appliedAt?: string;
}

export interface CreatorFundStats {
  totalEarnings: number;
  boostedEarnings: number;
  standardEarnings: number;
  activeBoosters: CreatorBoost[];
  activeSeason?: SeasonalPromotion;
  nextBoostOpportunity?: string;
  tier2UpgradeDate?: string;
  daysInBoostPeriod?: number;
}

export interface SeasonalPromotion {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  badgeTrialDays?: number;
  startDate: string;
  endDate: string;
  eligibility: string[];
  maxParticipants?: number;
  currentParticipants: number;
  isActive: boolean;
}

export interface BoostOpportunity {
  type: 'seasonal' | 'achievement' | 'tier_upgrade' | 'challenge';
  title: string;
  description: string;
  multiplier: number;
  duration: number;
  requirements: string[];
  reward: string;
  claimUrl?: string;
}

export class CreatorFundBoostService {
  private static apiBase = '/api';

  /**
   * Get creator fund stats including active boosts
   */
  static async getCreatorFundStats(): Promise<CreatorFundStats | null> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/creator-fund/stats`);

      if (!response.ok) {
        throw new Error('Failed to fetch creator fund stats');
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching creator fund stats:', error);
      return null;
    }
  }

  /**
   * Get active boosts for current creator
   */
  static async getActiveBoosts(): Promise<CreatorBoost[]> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/creator-fund/boosts/active`);

      if (!response.ok) {
        throw new Error('Failed to fetch active boosts');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching active boosts:', error);
      return [];
    }
  }

  /**
   * Get boost history for creator
   */
  static async getBoostHistory(limit: number = 10): Promise<CreatorBoost[]> {
    try {
      const response = await fetchWithAuth(
        `${this.apiBase}/creator-fund/boosts/history?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch boost history');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching boost history:', error);
      return [];
    }
  }

  /**
   * Apply Tier 2 new creator boost
   */
  static async applyTier2CreatorBoost(): Promise<boolean> {
    try {
      const response = await fetchWithAuth(
        `${this.apiBase}/creator-fund/boosts/apply-tier2`,
        {
          method: 'POST'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to apply Tier 2 creator boost');
      }

      return true;
    } catch (error) {
      console.error('Error applying Tier 2 boost:', error);
      return false;
    }
  }

  /**
   * Get seasonal promotions
   */
  static async getSeasonalPromotions(): Promise<SeasonalPromotion[]> {
    try {
      const response = await fetch(`${this.apiBase}/creator-fund/seasonal-promotions`);

      if (!response.ok) {
        throw new Error('Failed to fetch seasonal promotions');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching seasonal promotions:', error);
      return [];
    }
  }

  /**
   * Claim seasonal promotion boost
   */
  static async claimSeasonalPromotion(promotionId: string): Promise<boolean> {
    try {
      const response = await fetchWithAuth(
        `${this.apiBase}/creator-fund/seasonal-promotions/${promotionId}/claim`,
        {
          method: 'POST'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to claim seasonal promotion');
      }

      return true;
    } catch (error) {
      console.error('Error claiming seasonal promotion:', error);
      return false;
    }
  }

  /**
   * Get available boost opportunities
   */
  static async getBoostOpportunities(): Promise<BoostOpportunity[]> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/creator-fund/boost-opportunities`);

      if (!response.ok) {
        throw new Error('Failed to fetch boost opportunities');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching boost opportunities:', error);
      return [];
    }
  }

  /**
   * Calculate boosted earnings
   */
  static calculateBoostedEarnings(
    baseEarnings: number,
    boosts: CreatorBoost[]
  ): {
    totalEarnings: number;
    boostedAmount: number;
    breakdown: Array<{ boost: string; amount: number; multiplier: number }>;
  } {
    let totalBoostedAmount = 0;
    const breakdown: Array<{ boost: string; amount: number; multiplier: number }> = [];

    for (const boost of boosts) {
      const boostedAmount = baseEarnings * (boost.multiplier - 1);
      totalBoostedAmount += boostedAmount;
      breakdown.push({
        boost: boost.boostType,
        amount: boostedAmount,
        multiplier: boost.multiplier
      });
    }

    return {
      totalEarnings: baseEarnings + totalBoostedAmount,
      boostedAmount: totalBoostedAmount,
      breakdown
    };
  }

  /**
   * Check if creator is eligible for Tier 2 new account boost
   */
  static async checkTier2EligibilityForBoost(): Promise<{
    eligible: boolean;
    reason?: string;
    daysRemaining?: number;
  }> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/creator-fund/check-tier2-eligibility`);

      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }

      const data = await response.json();
      return data.data || { eligible: false, reason: 'Unknown error' };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return { eligible: false, reason: 'Unable to check eligibility' };
    }
  }

  /**
   * Get boost timeline
   */
  static getBoostTimeline(boost: CreatorBoost): {
    daysRemaining: number;
    percentComplete: number;
    startDate: string;
    endDate: string;
  } {
    const now = new Date();
    const start = new Date(boost.startDate);
    const end = new Date(boost.endDate);

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);
    const percentComplete = Math.min(100, (daysElapsed / totalDays) * 100);

    return {
      daysRemaining,
      percentComplete,
      startDate: start.toLocaleDateString(),
      endDate: end.toLocaleDateString()
    };
  }

  /**
   * Format boost display
   */
  static getBoostDisplay(boost: CreatorBoost): string {
    switch (boost.boostType) {
      case 'new_tier_2':
        return 'New Tier 2 Creator Boost';
      case 'seasonal':
        return 'Seasonal Promotion';
      case 'achievement':
        return 'Achievement Bonus';
      case 'promotional':
        return 'Limited Time Promotion';
      default:
        return 'Creator Boost';
    }
  }

  /**
   * Get boost icon
   */
  static getBoostIcon(boostType: string): string {
    switch (boostType) {
      case 'new_tier_2':
        return '🚀';
      case 'seasonal':
        return '🎉';
      case 'achievement':
        return '🏆';
      case 'promotional':
        return '⭐';
      default:
        return '✨';
    }
  }

  /**
   * Check if boost is about to expire
   */
  static isBoostExpiringSoon(boost: CreatorBoost, daysThreshold: number = 3): boolean {
    const timeline = this.getBoostTimeline(boost);
    return timeline.daysRemaining <= daysThreshold && timeline.daysRemaining > 0;
  }

  /**
   * Get estimated earnings with all active boosts
   */
  static async getEstimatedBoostedEarnings(baseEarnings: number): Promise<{
    baseEarnings: number;
    boostedAmount: number;
    totalEarnings: number;
    activeBoosts: number;
  }> {
    try {
      const boosts = await this.getActiveBoosts();
      const calculated = this.calculateBoostedEarnings(baseEarnings, boosts);

      return {
        baseEarnings,
        boostedAmount: calculated.boostedAmount,
        totalEarnings: calculated.totalEarnings,
        activeBoosts: boosts.length
      };
    } catch (error) {
      console.error('Error calculating estimated earnings:', error);
      return {
        baseEarnings,
        boostedAmount: 0,
        totalEarnings: baseEarnings,
        activeBoosts: 0
      };
    }
  }

  /**
   * Format promotion for display
   */
  static formatPromotion(promo: SeasonalPromotion): {
    title: string;
    description: string;
    multiplier: string;
    duration: string;
    participationRate: number;
  } {
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return {
      title: promo.name,
      description: promo.description,
      multiplier: `${(promo.multiplier * 100).toFixed(0)}% boost`,
      duration: `${durationDays} days`,
      participationRate: promo.maxParticipants
        ? (promo.currentParticipants / promo.maxParticipants) * 100
        : 0
    };
  }
}
