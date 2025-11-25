import { fetchWithAuth } from '@/lib/api';

export interface ReferralCode {
  code: string;
  referrerId: string;
  referrerName: string;
  createdAt: string;
  expiresAt?: string;
  usageCount: number;
  maxUses?: number;
  isActive: boolean;
}

export interface ReferralBonus {
  id: string;
  referrerId: string;
  refereeId: string;
  referralCode: string;
  bonusAmount: number;
  bonusType: 'tokens' | 'premium_days' | 'badge';
  bonusValue: string; // e.g., "50" for tokens, "30" for days, "freelance_badge"
  status: 'pending' | 'credited' | 'expired';
  claimedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalBonusEarned: number;
  pendingBonuses: number;
  recentReferrals: ReferralBonus[];
}

export class ReferralBonusService {
  private static apiBase = '/api';

  /**
   * Generate a new referral code for user
   */
  static async generateReferralCode(): Promise<ReferralCode | null> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/referral/generate-code`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to generate referral code');
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error generating referral code:', error);
      return null;
    }
  }

  /**
   * Get user's referral code
   */
  static async getReferralCode(): Promise<ReferralCode | null> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/referral/code`);

      if (!response.ok) {
        if (response.status === 404) {
          // No code exists yet, generate one
          return this.generateReferralCode();
        }
        throw new Error('Failed to fetch referral code');
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching referral code:', error);
      return null;
    }
  }

  /**
   * Get referral statistics for current user
   */
  static async getReferralStats(): Promise<ReferralStats | null> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/referral/stats`);

      if (!response.ok) {
        throw new Error('Failed to fetch referral stats');
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      return null;
    }
  }

  /**
   * Apply referral code to current user
   */
  static async applyReferralCode(code: string): Promise<boolean> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/referral/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to apply referral code');
      }

      return true;
    } catch (error) {
      console.error('Error applying referral code:', error);
      return false;
    }
  }

  /**
   * Get all bonuses for user
   */
  static async getBonuses(): Promise<ReferralBonus[]> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/referral/bonuses`);

      if (!response.ok) {
        throw new Error('Failed to fetch bonuses');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      return [];
    }
  }

  /**
   * Claim a referral bonus
   */
  static async claimBonus(bonusId: string): Promise<boolean> {
    try {
      const response = await fetchWithAuth(`${this.apiBase}/referral/bonuses/${bonusId}/claim`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to claim bonus');
      }

      return true;
    } catch (error) {
      console.error('Error claiming bonus:', error);
      return false;
    }
  }

  /**
   * Get shareable referral URL
   */
  static generateShareUrl(referralCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${referralCode}`;
  }

  /**
   * Share referral code via various channels
   */
  static shareReferralCode(referralCode: string, platform: 'twitter' | 'whatsapp' | 'email' | 'copy') {
    const shareUrl = this.generateShareUrl(referralCode);
    const message = `Join Eloity and get instant rewards! Use my referral code: ${referralCode}\n${shareUrl}`;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
          '_blank'
        );
        break;
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(message)}`,
          '_blank'
        );
        break;
      case 'email':
        window.location.href = `mailto:?subject=Join Eloity&body=${encodeURIComponent(message)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        break;
    }
  }

  /**
   * Get bonus details for display
   */
  static getBonusDisplay(bonus: ReferralBonus): string {
    switch (bonus.bonusType) {
      case 'tokens':
        return `${bonus.bonusValue} Eloity Tokens`;
      case 'premium_days':
        return `${bonus.bonusValue} Days Premium Access`;
      case 'badge':
        return `${bonus.bonusValue.replace('_', ' ')} Badge`;
      default:
        return bonus.bonusValue;
    }
  }

  /**
   * Calculate referral bonus amounts based on tier
   */
  static calculateBonuses(userTier: 'tier_1' | 'tier_2') {
    const baseBonus = 50; // Base tokens for both tiers
    
    return {
      tier1: {
        referrerBonus: baseBonus, // 50 tokens
        refereeBonus: baseBonus * 0.5, // 25 tokens
        description: 'Earn tokens for each referral'
      },
      tier2: {
        referrerBonus: baseBonus * 2, // 100 tokens
        refereeBonus: baseBonus, // 50 tokens + 7 days premium
        premiumDays: 7,
        description: 'Earn double rewards + premium access for referee'
      }
    };
  }

  /**
   * Format referral code for display
   */
  static formatCode(code: string): string {
    return code.toUpperCase().slice(0, 8);
  }

  /**
   * Check if referral code is valid
   */
  static async validateCode(code: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBase}/referral/validate/${code}`);
      return response.ok;
    } catch (error) {
      console.error('Error validating code:', error);
      return false;
    }
  }

  /**
   * Get leaderboard of top referrers
   */
  static async getTopReferrers(limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBase}/referral/leaderboard?limit=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
}
