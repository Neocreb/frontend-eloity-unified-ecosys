// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";

// Types
export interface EnhancedEloitsActivity {
  id: string;
  type: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  color: string;
  frequency: "once" | "daily" | "unlimited" | "weekly" | "monthly";
  category: string;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  multiplier?: number;
  timeLimit?: number; // in hours
  completed?: boolean;
  progress?: number;
  maxProgress?: number;
  minimumTrustScore?: number;
  qualityThreshold?: number;
  decayEnabled?: boolean;
  decayFactor?: number;
}

export interface EnhancedEloitsReward {
  id: string;
  type: string;
  name: string;
  description: string;
  pointsRequired: number;
  value: string;
  category: string;
  availability: number;
  featured?: boolean;
  discount?: number;
  validUntil?: string;
  minLevel?: string;
  terms?: string[];
}

export interface EnhancedUserEloitsData {
  id: string;
  userId: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  trustScore: number;
  trustLevel: string;
  rewardMultiplier: number;
  dailyCap: number;
  streakDays: number;
  tier: string;
  referralCount: number;
  lastActivityDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnhancedEloitsTransaction {
  id: string;
  userId: string;
  actionType: string;
  amount: number;
  balanceAfter: number;
  description: string;
  metadata?: Record<string, any>;
  trustScoreImpact: number;
  multiplierApplied: number;
  decayFactor: number;
  status: string;
  referenceId?: string;
  createdAt: string;
}

export interface EnhancedTrustHistory {
  id: string;
  userId: string;
  previousScore: number;
  newScore: number;
  changeReason: string;
  activityType: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface EnhancedRedemption {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  payoutMethod: string;
  payoutDetails?: Record<string, any>;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  processedAt?: string;
  rejectionReason?: string;
  batchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnhancedReferral {
  id: string;
  referrerId: string;
  refereeId?: string;
  referralCode: string;
  status: string;
  depth: number;
  rewardEarned: number;
  createdAt: string;
  verifiedAt?: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  dataType: string;
  category: string;
  isEditable: boolean;
  updatedAt: string;
}

// Tier definitions
export const TIER_CONFIG = {
  bronze: {
    name: "Bronze",
    minPoints: 0,
    maxPoints: 5000,
    multiplier: 1.0,
    monthlyWithdrawalLimit: 5,
    exclusiveRewards: ["basic_ads"],
    color: "bg-orange-600"
  },
  silver: {
    name: "Silver",
    minPoints: 5001,
    maxPoints: 20000,
    multiplier: 1.2,
    monthlyWithdrawalLimit: 10,
    exclusiveRewards: ["early_creator_tools"],
    color: "bg-gray-400"
  },
  gold: {
    name: "Gold",
    minPoints: 20001,
    maxPoints: 100000,
    multiplier: 1.5,
    monthlyWithdrawalLimit: 25,
    exclusiveRewards: ["premium_analytics"],
    color: "bg-yellow-500"
  },
  platinum: {
    name: "Platinum",
    minPoints: 100001,
    maxPoints: 500000,
    multiplier: 2.0,
    monthlyWithdrawalLimit: 50,
    exclusiveRewards: ["nft_access"],
    color: "bg-purple-600"
  },
  diamond: {
    name: "Diamond",
    minPoints: 500001,
    maxPoints: Infinity,
    multiplier: 3.0,
    monthlyWithdrawalLimit: 100,
    exclusiveRewards: ["lifetime_premium", "brand_deals"],
    color: "bg-blue-600"
  }
};

// Default system configuration
const DEFAULT_CONFIG = {
  conversion_rate: "1000", // 1000 ELO = $1.00
  payout_mode: "manual", // manual | automated
  minimum_redeemable_balance: "500", // 500 ELO minimum
  max_monthly_redemption_per_tier: "10000", // $100 max per month
  bonus_multipliers: JSON.stringify({
    trust_bronze: 1.0,
    trust_silver: 1.2,
    trust_gold: 1.5,
    trust_platinum: 2.0,
    trust_diamond: 3.0,
    badge_verified: 1.1,
    badge_pioneer: 1.3
  })
};

class EnhancedEloitsService {
  // Get system configuration
  async getSystemConfig(): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*');
      
      if (error) throw error;
      
      const config: Record<string, any> = { ...DEFAULT_CONFIG };
      
      if (data) {
        data.forEach(item => {
          config[item.key] = item.value;
        });
      }
      
      return config;
    } catch (error) {
      console.error('Error fetching system config:', error);
      return DEFAULT_CONFIG;
    }
  }

  // Update system configuration
  async updateSystemConfig(config: Record<string, string>): Promise<boolean> {
    try {
      const updates = Object.entries(config).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));
      
      const { error } = await supabase
        .from('system_config')
        .upsert(updates, { onConflict: 'key' });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating system config:', error);
      return false;
    }
  }

  // Get user's ELO data
  async getUserEloitsData(userId: string): Promise<EnhancedUserEloitsData | null> {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user ELO data:', error);
      return null;
    }
  }

  // Create or update user's ELO data
  async initializeUserEloitsData(userId: string): Promise<EnhancedUserEloitsData | null> {
    try {
      const userData = {
        user_id: userId,
        current_balance: 0,
        total_earned: 0,
        total_spent: 0,
        trust_score: 50,
        trust_level: "bronze",
        reward_multiplier: 1.0,
        daily_cap: 1000,
        streak_days: 0,
        tier: "bronze",
        referral_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_rewards')
        .upsert(userData, { onConflict: 'user_id' });
      
      if (error) throw error;
      return data ? data[0] : null;
    } catch (error) {
      console.error('Error initializing user ELO data:', error);
      return null;
    }
  }

  // Get reward rules
  async getRewardRules(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('reward_rules')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reward rules:', error);
      return [];
    }
  }

  // Get reward rule by action type
  async getRewardRuleByAction(actionType: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('reward_rules')
        .select('*')
        .eq('action_type', actionType)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching reward rule:', error);
      return null;
    }
  }

  // Award points for an activity
  async awardPoints(
    userId: string,
    actionType: string,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; amount: number; message: string } | null> {
    try {
      // Get user data
      let userEloData = await this.getUserEloitsData(userId);
      if (!userEloData) {
        userEloData = await this.initializeUserEloitsData(userId);
        if (!userEloData) {
          throw new Error('Failed to initialize user ELO data');
        }
      }

      // Get reward rule
      const rule = await this.getRewardRuleByAction(actionType);
      if (!rule) {
        return { success: false, amount: 0, message: 'No reward rule found for this action' };
      }

      // Check trust score requirement
      if (userEloData.trust_score < rule.minimum_trust_score) {
        return { 
          success: false, 
          amount: 0, 
          message: `Trust score too low. Required: ${rule.minimum_trust_score}, Current: ${userEloData.trust_score}` 
        };
      }

      // Check limits
      const canComplete = await this.canCompleteActivity(userId, actionType, rule);
      if (!canComplete) {
        return { success: false, amount: 0, message: 'Activity limit reached' };
      }

      // Calculate reward amount with multipliers
      let rewardAmount = parseFloat(rule.base_eloits);
      
      // Apply trust multiplier
      const trustMultiplier = this.getTrustMultiplier(userEloData.trust_level);
      rewardAmount *= trustMultiplier;
      
      // Apply user's reward multiplier
      rewardAmount *= userEloData.reward_multiplier;
      
      // Apply decay factor if enabled
      let decayFactor = 1.0;
      if (rule.decay_enabled) {
        decayFactor = await this.calculateDecayFactor(userId, actionType, rule);
        rewardAmount *= decayFactor;
      }
      
      // Round to 2 decimal places
      rewardAmount = Math.round(rewardAmount * 100) / 100;

      // Update user's ELO balance
      const newBalance = userEloData.current_balance + rewardAmount;
      const newTotalEarned = userEloData.total_earned + rewardAmount;
      
      const { error: updateError } = await supabase
        .from('user_rewards')
        .update({
          current_balance: newBalance,
          total_earned: newTotalEarned,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;

      // Log transaction
      const transactionData = {
        user_id: userId,
        action_type: actionType,
        amount: rewardAmount,
        balance_after: newBalance,
        description: rule.description,
        metadata: metadata,
        trust_score_impact: 0,
        multiplier_applied: trustMultiplier * userEloData.reward_multiplier,
        decay_factor: decayFactor,
        status: 'completed',
        created_at: new Date().toISOString()
      };
      
      const { error: transactionError } = await supabase
        .from('reward_transactions')
        .insert(transactionData);
      
      if (transactionError) throw transactionError;

      // Update activity count
      await this.updateActivityCount(userId, actionType);

      return { 
        success: true, 
        amount: rewardAmount, 
        message: `Successfully earned ${rewardAmount} ELO points!` 
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      return { success: false, amount: 0, message: 'Failed to award points' };
    }
  }

  // Check if user can complete an activity
  async canCompleteActivity(userId: string, actionType: string, rule: any): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split('T')[0];

      // Check daily limit
      if (rule.daily_limit) {
        const { count: dailyCount, error: dailyError } = await supabase
          .from('reward_transactions')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .eq('action_type', actionType)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`);
        
        if (dailyError) throw dailyError;
        if (dailyCount && dailyCount >= rule.daily_limit) return false;
      }

      // Check weekly limit
      if (rule.weekly_limit) {
        const { count: weeklyCount, error: weeklyError } = await supabase
          .from('reward_transactions')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .eq('action_type', actionType)
          .gte('created_at', `${weekStartStr}T00:00:00`);
        
        if (weeklyError) throw weeklyError;
        if (weeklyCount && weeklyCount >= rule.weekly_limit) return false;
      }

      // Check monthly limit
      if (rule.monthly_limit) {
        const { count: monthlyCount, error: monthlyError } = await supabase
          .from('reward_transactions')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .eq('action_type', actionType)
          .gte('created_at', `${monthStartStr}T00:00:00`);
        
        if (monthlyError) throw monthlyError;
        if (monthlyCount && monthlyCount >= rule.monthly_limit) return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking activity limits:', error);
      return false;
    }
  }

  // Update activity count
  async updateActivityCount(userId: string, actionType: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if record exists
      const { data, error } = await supabase
        .from('daily_action_counts')
        .select('count')
        .eq('user_id', userId)
        .eq('action', actionType)
        .eq('date', today)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw error;
      }
      
      if (data) {
        // Update existing record
        await supabase
          .from('daily_action_counts')
          .update({ count: data.count + 1 })
          .eq('user_id', userId)
          .eq('action', actionType)
          .eq('date', today);
      } else {
        // Insert new record
        await supabase
          .from('daily_action_counts')
          .insert({
            user_id: userId,
            action: actionType,
            count: 1,
            date: today
          });
      }
    } catch (error) {
      console.error('Error updating activity count:', error);
    }
  }

  // Calculate decay factor for repetitive activities
  async calculateDecayFactor(userId: string, actionType: string, rule: any): Promise<number> {
    try {
      if (!rule.decay_enabled) return 1.0;
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's activity count
      const { data, error } = await supabase
        .from('daily_action_counts')
        .select('count')
        .eq('user_id', userId)
        .eq('action', actionType)
        .eq('date', today)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      const count = data ? data.count : 0;
      
      // Apply decay if count exceeds decay_start
      if (count > rule.decay_start) {
        const excess = count - rule.decay_start;
        const decayFactor = Math.pow(parseFloat(rule.decay_rate), excess);
        return Math.max(decayFactor, parseFloat(rule.min_multiplier));
      }
      
      return 1.0;
    } catch (error) {
      console.error('Error calculating decay factor:', error);
      return 1.0;
    }
  }

  // Get trust multiplier based on trust level
  getTrustMultiplier(trustLevel: string): number {
    const config = TIER_CONFIG[trustLevel.toLowerCase() as keyof typeof TIER_CONFIG];
    return config ? config.multiplier : 1.0;
  }

  // Update trust score
  async updateTrustScore(
    userId: string, 
    scoreChange: number, 
    reason: string, 
    activityType?: string
  ): Promise<boolean> {
    try {
      // Get current trust data
      const userEloData = await this.getUserEloitsData(userId);
      if (!userEloData) return false;

      // Calculate new score
      const newScore = Math.max(0, Math.min(100, userEloData.trust_score + scoreChange));
      
      // Determine new trust level
      const newLevel = this.getTrustLevel(newScore);
      
      // Update user's trust data
      const { error } = await supabase
        .from('user_rewards')
        .update({
          trust_score: newScore,
          trust_level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) throw error;

      // Log trust history
      const trustHistoryData = {
        user_id: userId,
        previous_score: userEloData.trust_score,
        new_score: newScore,
        change_reason: reason,
        activity_type: activityType,
        created_at: new Date().toISOString()
      };
      
      await supabase
        .from('trust_history')
        .insert(trustHistoryData);

      return true;
    } catch (error) {
      console.error('Error updating trust score:', error);
      return false;
    }
  }

  // Get trust level based on score
  getTrustLevel(score: number): string {
    if (score >= 90) return 'diamond';
    if (score >= 75) return 'platinum';
    if (score >= 60) return 'gold';
    if (score >= 40) return 'silver';
    return 'bronze';
  }

  // Get user's transaction history
  async getTransactionHistory(
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<EnhancedEloitsTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('reward_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Get user's trust history
  async getTrustHistory(userId: string, limit: number = 20): Promise<EnhancedTrustHistory[]> {
    try {
      const { data, error } = await supabase
        .from('trust_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trust history:', error);
      return [];
    }
  }

  // Get user's tier based on points
  getUserTier(points: number): string {
    for (const [tier, config] of Object.entries(TIER_CONFIG)) {
      if (points >= config.minPoints && points <= config.maxPoints) {
        return tier;
      }
    }
    return 'bronze';
  }

  // Get tier configuration
  getTierConfig(tier: string): any {
    return TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
  }

  // Calculate cash value from ELO points
  async calculateCashValue(points: number): Promise<number> {
    const config = await this.getSystemConfig();
    const conversionRate = parseFloat(config.conversion_rate || "1000");
    return points / conversionRate;
  }

  // Request redemption
  async requestRedemption(
    userId: string,
    amount: number,
    payoutMethod: string,
    payoutDetails: Record<string, any>
  ): Promise<{ success: boolean; redemptionId?: string; message: string }> {
    try {
      // Get user data
      const userEloData = await this.getUserEloitsData(userId);
      if (!userEloData) {
        return { success: false, message: 'User data not found' };
      }

      // Get system config
      const config = await this.getSystemConfig();
      const minBalance = parseFloat(config.minimum_redeemable_balance || "500");
      
      // Check minimum balance
      if (userEloData.current_balance < minBalance) {
        return { 
          success: false, 
          message: `Minimum balance of ${minBalance} ELO required for redemption` 
        };
      }
      
      // Check sufficient balance
      if (userEloData.current_balance < amount) {
        return { 
          success: false, 
          message: `Insufficient balance. Available: ${userEloData.current_balance} ELO` 
        };
      }

      // Check tier withdrawal limit
      const tierConfig = TIER_CONFIG[userEloData.tier as keyof typeof TIER_CONFIG];
      const maxMonthly = parseFloat(config.max_monthly_redemption_per_tier || "10000");
      const maxForTier = Math.min(
        tierConfig.monthlyWithdrawalLimit, 
        maxMonthly / (parseFloat(config.conversion_rate || "1000"))
      );
      
      if (amount > maxForTier) {
        return { 
          success: false, 
          message: `Maximum redemption for your tier is ${maxForTier} ELO` 
        };
      }

      // Create redemption request
      const redemptionData = {
        user_id: userId,
        amount: amount,
        currency: "USD",
        payout_method: payoutMethod,
        payout_details: payoutDetails,
        status: config.payout_mode === 'automated' ? 'processing' : 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('redemptions')
        .insert(redemptionData)
        .select()
        .single();
      
      if (error) throw error;

      // If automated mode and approved, deduct balance immediately
      if (config.payout_mode === 'automated') {
        const newBalance = userEloData.current_balance - amount;
        await supabase
          .from('user_rewards')
          .update({
            current_balance: newBalance,
            total_spent: userEloData.total_spent + amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        // Log transaction
        await supabase
          .from('reward_transactions')
          .insert({
            user_id: userId,
            action_type: 'redemption',
            amount: -amount,
            balance_after: newBalance,
            description: `Redemption request for $${await this.calculateCashValue(amount)}`,
            status: 'completed',
            reference_id: data.id,
            created_at: new Date().toISOString()
          });
      }

      return { 
        success: true, 
        redemptionId: data.id, 
        message: 'Redemption request submitted successfully' 
      };
    } catch (error) {
      console.error('Error requesting redemption:', error);
      return { success: false, message: 'Failed to submit redemption request' };
    }
  }

  // Get redemption requests
  async getRedemptions(userId: string, status?: string): Promise<EnhancedRedemption[]> {
    try {
      let query = supabase
        .from('redemptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      return [];
    }
  }

  // Process referral
  async processReferral(
    referrerId: string,
    refereeId: string,
    referralCode: string
  ): Promise<{ success: boolean; message: string; reward?: number }> {
    try {
      // Verify referral code
      const { data: referralLink, error: linkError } = await supabase
        .from('referral_links')
        .select('*')
        .eq('referral_code', referralCode)
        .single();
      
      if (linkError || !referralLink) {
        return { success: false, message: 'Invalid referral code' };
      }

      // Check if referee already has a referral
      const { data: existingReferral, error: existingError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referee_id', refereeId)
        .single();
      
      if (existingError && existingError.code !== 'PGRST116') throw existingError;
      if (existingReferral) {
        return { success: false, message: 'User already referred' };
      }

      // Create referral record
      const referralData = {
        referrer_id: referrerId,
        referee_id: refereeId,
        referral_code: referralCode,
        status: 'pending',
        depth: 1,
        reward_earned: 0,
        created_at: new Date().toISOString()
      };
      
      const { error: referralError } = await supabase
        .from('referrals')
        .insert(referralData);
      
      if (referralError) throw referralError;

      // Award referral reward to referrer
      const result = await this.awardPoints(referrerId, 'refer_user', {
        refereeId,
        referralCode
      });
      
      if (result && result.success) {
        // Update referral record with reward
        await supabase
          .from('referrals')
          .update({ 
            reward_earned: result.amount,
            status: 'completed'
          })
          .eq('referrer_id', referrerId)
          .eq('referee_id', refereeId);
        
        // Update referrer's referral count
        const userEloData = await this.getUserEloitsData(referrerId);
        if (userEloData) {
          await supabase
            .from('user_rewards')
            .update({ 
              referral_count: userEloData.referral_count + 1,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', referrerId);
        }
        
        return { 
          success: true, 
          message: `Referral successful! Earned ${result.amount} ELO`,
          reward: result.amount
        };
      }
      
      return { success: false, message: 'Failed to award referral reward' };
    } catch (error) {
      console.error('Error processing referral:', error);
      return { success: false, message: 'Failed to process referral' };
    }
  }

  // Get user's referrals
  async getUserReferrals(userId: string): Promise<EnhancedReferral[]> {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      return [];
    }
  }

  // Anti-spam check
  async checkForSpam(userId: string, actionType: string): Promise<{ isSpam: boolean; reason?: string }> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Check for excessive activity in the last hour
      const { count, error } = await supabase
        .from('reward_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('action_type', actionType)
        .gte('created_at', oneHourAgo.toISOString());
      
      if (error) throw error;
      
      // Define spam thresholds based on action type
      const thresholds: Record<string, number> = {
        'like_post': 30,
        'comment_post': 20,
        'share_content': 10,
        'post_content': 5
      };
      
      const threshold = thresholds[actionType] || 10;
      
      if (count && count > threshold) {
        // Log spam detection
        await supabase
          .from('spam_detection')
          .insert({
            user_id: userId,
            action_type: actionType,
            ip_address: null, // Would be captured from request context
            user_agent: navigator.userAgent,
            is_spam: true,
            spam_reason: `Excessive ${actionType} activity (${count} in the last hour)`,
            detected_by: 'system',
            created_at: new Date().toISOString()
          });
        
        // Apply trust score penalty
        await this.updateTrustScore(userId, -2, `Spam detection: Excessive ${actionType} activity`, actionType);
        
        return { 
          isSpam: true, 
          reason: `Excessive ${actionType} activity (${count} in the last hour)` 
        };
      }
      
      return { isSpam: false };
    } catch (error) {
      console.error('Error checking for spam:', error);
      return { isSpam: false };
    }
  }

  // Apply trust score decay for inactivity
  async applyInactivityDecay(userId: string): Promise<boolean> {
    try {
      // Get user's last activity date
      const userEloData = await this.getUserEloitsData(userId);
      if (!userEloData || !userEloData.last_activity_date) return false;
      
      const lastActivity = new Date(userEloData.last_activity_date);
      const now = new Date();
      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      // Apply decay if inactivity exceeds 7 days
      if (daysSinceActivity > 7) {
        // Calculate decay points (1-3 points per day after 7 days)
        const daysOverThreshold = daysSinceActivity - 7;
        const decayPoints = Math.min(daysOverThreshold * 2, 10); // Max 10 points decay
        
        // Apply decay
        const success = await this.updateTrustScore(
          userId, 
          -decayPoints, 
          `Inactivity decay: ${daysSinceActivity} days since last activity`, 
          'inactivity_decay'
        );
        
        if (success) {
          // Log decay
          await supabase
            .from('trust_decay_log')
            .insert({
              user_id: userId,
              previous_score: userEloData.trust_score,
              new_score: Math.max(0, userEloData.trust_score - decayPoints),
              decay_reason: 'inactivity',
              decay_amount: decayPoints,
              activity_type: 'inactivity_decay',
              created_at: new Date().toISOString()
            });
        }
        
        return success;
      }
      
      return true;
    } catch (error) {
      console.error('Error applying inactivity decay:', error);
      return false;
    }
  }

  // Apply trust score decay for spam/low-quality content
  async applySpamDecay(userId: string, reason: string, activityType?: string): Promise<boolean> {
    try {
      // Get current trust score
      const userEloData = await this.getUserEloitsData(userId);
      if (!userEloData) return false;
      
      // Apply rapid decay (up to 10 points)
      const decayPoints = 5; // Fixed decay for spam
      
      // Apply decay
      const success = await this.updateTrustScore(
        userId, 
        -decayPoints, 
        `Spam decay: ${reason}`, 
        activityType
      );
      
      if (success) {
        // Log decay
        await supabase
          .from('trust_decay_log')
          .insert({
            user_id: userId,
            previous_score: userEloData.trust_score,
            new_score: Math.max(0, userEloData.trust_score - decayPoints),
            decay_reason: 'spam',
            decay_amount: decayPoints,
            activity_type: activityType,
            metadata: { reason },
            created_at: new Date().toISOString()
          });
      }
      
      return success;
    } catch (error) {
      console.error('Error applying spam decay:', error);
      return false;
    }
  }

  // Get spam detection records for a user
  async getUserSpamRecords(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('spam_detection')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching spam records:', error);
      return [];
    }
  }

  // Get trust decay history for a user
  async getTrustDecayHistory(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('trust_decay_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trust decay history:', error);
      return [];
    }
  }

  // Handle marketplace purchase reward
  async handleMarketplacePurchaseReward(userId: string, purchaseAmount: number, productId: string): Promise<{ success: boolean; amount: number; message: string }> {
    try {
      // Calculate reward: 10 ELO + (1% of purchase amount in ELO)
      let rewardAmount = 10 + (purchaseAmount * 0.01);
      
      // Maximum daily bonus = 200 ELO
      rewardAmount = Math.min(rewardAmount, 200);
      
      // Award points for purchase
      const result = await this.awardPoints(userId, 'purchase_product', {
        purchaseAmount,
        productId,
        calculatedReward: rewardAmount
      });
      
      if (result && result.success) {
        // Log reward transaction specifically for marketplace
        await supabase
          .from('reward_transactions')
          .insert({
            user_id: userId,
            action_type: 'marketplace_purchase',
            amount: result.amount,
            balance_after: (await this.getUserEloitsData(userId))?.current_balance || 0,
            description: `Marketplace purchase reward for $${purchaseAmount}`,
            metadata: {
              productId,
              purchaseAmount,
              rewardType: 'purchase'
            },
            trust_score_impact: 0.1, // Small positive impact for marketplace activity
            multiplier_applied: 1.0,
            decay_factor: 1.0,
            status: 'completed',
            created_at: new Date().toISOString()
          });
          
        return {
          success: true,
          amount: result.amount,
          message: `Successfully earned ${result.amount} ELO for marketplace purchase!`
        };
      }
      
      return {
        success: false,
        amount: 0,
        message: result?.message || 'Failed to award marketplace purchase reward'
      };
    } catch (error) {
      console.error('Error handling marketplace purchase reward:', error);
      return {
        success: false,
        amount: 0,
        message: 'Failed to process marketplace purchase reward'
      };
    }
  }

  // Handle product sold reward
  async handleProductSoldReward(userId: string, productId: string): Promise<{ success: boolean; amount: number; message: string }> {
    try {
      // Get user's tier for multiplier
      const userEloData = await this.getUserEloitsData(userId);
      if (!userEloData) {
        return {
          success: false,
          amount: 0,
          message: 'User data not found'
        };
      }
      
      // Calculate reward: Flat 750 ELO plus tier multiplier
      const tierConfig = this.getTierConfig(userEloData.tier);
      const rewardAmount = 750 * (tierConfig?.multiplier || 1.0);
      
      // Award points for product sold
      const result = await this.awardPoints(userId, 'product_sold', {
        productId,
        baseReward: 750,
        tierMultiplier: tierConfig?.multiplier || 1.0,
        calculatedReward: rewardAmount
      });
      
      if (result && result.success) {
        // Log reward transaction specifically for product sold
        await supabase
          .from('reward_transactions')
          .insert({
            user_id: userId,
            action_type: 'product_sold',
            amount: result.amount,
            balance_after: (await this.getUserEloitsData(userId))?.current_balance || 0,
            description: `Product sold reward`,
            metadata: {
              productId,
              rewardType: 'product_sold',
              baseReward: 750,
              tierMultiplier: tierConfig?.multiplier || 1.0
            },
            trust_score_impact: 0.5, // Positive impact for selling products
            multiplier_applied: tierConfig?.multiplier || 1.0,
            decay_factor: 1.0,
            status: 'completed',
            created_at: new Date().toISOString()
          });
          
        return {
          success: true,
          amount: result.amount,
          message: `Successfully earned ${result.amount} ELO for selling product!`
        };
      }
      
      return {
        success: false,
        amount: 0,
        message: result?.message || 'Failed to award product sold reward'
      };
    } catch (error) {
      console.error('Error handling product sold reward:', error);
      return {
        success: false,
        amount: 0,
        message: 'Failed to process product sold reward'
      };
    }
  }

  // Process multi-level referral rewards
  async processMultiLevelReferral(
    referrerId: string,
    refereeId: string,
    referralCode: string,
    depth: number = 1
  ): Promise<{ success: boolean; message: string; rewards: Array<{ level: number; amount: number; userId: string }> }> {
    try {
      const rewards: Array<{ level: number; amount: number; userId: string }> = [];
      
      // Process direct referral (level 1)
      const directReferralResult = await this.processReferral(referrerId, refereeId, referralCode);
      if (directReferralResult.success && directReferralResult.reward) {
        rewards.push({
          level: 1,
          amount: directReferralResult.reward,
          userId: referrerId
        });
      }
      
      // Process multi-level referrals (up to 3 levels)
      if (depth < 3) {
        // Find the referrer's referrer
        const { data: upstreamReferral, error } = await supabase
          .from('referrals')
          .select('referrer_id')
          .eq('referee_id', referrerId)
          .single();
        
        if (!error && upstreamReferral) {
          // Calculate reward for this level
          let rewardAmount = 0;
          switch (depth + 1) {
            case 2: // Tier 2 Referral
              rewardAmount = 100; // 100 ELO bonus
              break;
            case 3: // Tier 3 Referral
              rewardAmount = 50; // 50 ELO bonus
              break;
            default:
              rewardAmount = 0;
          }
          
          if (rewardAmount > 0) {
            // Award points to upstream referrer
            const result = await this.awardPoints(upstreamReferral.referrer_id, 'multi_level_referral', {
              refereeId,
              referralCode,
              level: depth + 1,
              baseReward: rewardAmount
            });
            
            if (result && result.success) {
              rewards.push({
                level: depth + 1,
                amount: result.amount,
                userId: upstreamReferral.referrer_id
              });
              
              // Continue up the chain if needed
              const upstreamResult = await this.processMultiLevelReferral(
                upstreamReferral.referrer_id,
                refereeId,
                referralCode,
                depth + 1
              );
              
              rewards.push(...upstreamResult.rewards);
            }
          }
        }
      }
      
      return {
        success: true,
        message: 'Multi-level referral processed successfully',
        rewards
      };
    } catch (error) {
      console.error('Error processing multi-level referral:', error);
      return {
        success: false,
        message: 'Failed to process multi-level referral',
        rewards: []
      };
    }
  }
}

export const enhancedEloitsService = new EnhancedEloitsService();