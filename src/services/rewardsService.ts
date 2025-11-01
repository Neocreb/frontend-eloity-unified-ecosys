import { supabase } from "@/integrations/supabase/client";

// Define interfaces based on the actual database schema
interface RewardTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string | null;
  source_type: string | null;
  source_id: string | null;
  base_amount: number | null;
  multiplier: number | null;
  bonus_reason: string | null;
  status: string | null;
  processed_at: string | null;
  created_at: string;
}

interface RewardRule {
  id: string;
  action_type: string;
  display_name: string;
  description: string | null;
  base_soft_points: number;
  base_wallet_bonus: number;
  currency: string;
  daily_limit: number | null;
  weekly_limit: number | null;
  monthly_limit: number | null;
  minimum_trust_score: number;
  minimum_value: number | null;
  decay_enabled: boolean;
  decay_start: number;
  decay_rate: number;
  min_multiplier: number;
  requires_moderation: boolean;
  quality_threshold: number;
  conditions: Record<string, any> | null;
  is_active: boolean;
  active_from: string | null;
  active_to: string | null;
  created_by: string | null;
  last_modified_by: string | null;
  created_at: string;
  updated_at: string;
}

// Since there's no user_rewards table, we'll need to calculate user rewards from transactions
interface CalculatedUserRewards {
  total_earned: number;
  available_balance: number;
  level: number;
  streak: number;
  next_level_requirement: number;
}

interface DailyActionCount {
  action: string;
  count: number;
  date: string;
}

interface VirtualGift {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  price: number;
  currency: string;
  category: string;
  rarity: string;
  animation: string | null;
  sound: string | null;
  effects: Record<string, any> | null;
  available: boolean;
  seasonal_start: string | null;
  seasonal_end: string | null;
  created_at: string;
  updated_at: string;
}

interface GiftTransaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  gift_id: string;
  quantity: number;
  total_amount: number;
  message: string | null;
  is_anonymous: boolean;
  status: string;
  content_id: string | null;
  created_at: string;
  updated_at: string;
}

interface TipTransaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: string;
  message: string | null;
  content_id: string | null;
  is_anonymous: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserGiftInventory {
  user_id: string;
  gift_id: string;
  quantity: number;
  acquired_at: string;
}

interface CreatorTipSetting {
  id: string;
  user_id: string;
  is_enabled: boolean;
  min_tip_amount: number;
  max_tip_amount: number;
  suggested_amounts: Record<string, any> | null;
  thank_you_message: string | null;
  allow_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface RewardsData {
  calculatedUserRewards: CalculatedUserRewards | null;
  recentRewards: RewardTransaction[];
  rewardRules: RewardRule[];
  dailyActions: DailyActionCount[];
  virtualGifts: VirtualGift[];
  giftTransactions: GiftTransaction[];
  tipTransactions: TipTransaction[];
  giftInventory: UserGiftInventory[];
  tipSettings: CreatorTipSetting | null;
}

export const rewardsService = {
  // Calculate user rewards from transactions
  async calculateUserRewards(userId: string): Promise<CalculatedUserRewards | null> {
    try {
      // Get all reward transactions for the user
      const { data: transactions, error } = await supabase
        .from('reward_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching reward transactions:', error);
        return null;
      }

      // Calculate total earned
      const totalEarned = transactions?.reduce((sum: number, transaction: { amount: number }) => sum + transaction.amount, 0) || 0;
      
      // For now, we'll assume all earned is available (in a real system, some might be pending)
      const availableBalance = totalEarned;
      
      // Simple level calculation (in a real system, this would be more complex)
      const level = Math.floor(totalEarned / 100) + 1;
      
      // Simple streak (in a real system, this would come from a separate table)
      const streak = 0;
      
      // Next level requirement
      const nextLevelRequirement = level * 100;
      
      return {
        total_earned: totalEarned,
        available_balance: availableBalance,
        level: level,
        streak: streak,
        next_level_requirement: nextLevelRequirement
      };
    } catch (err) {
      console.error('Error calculating user rewards:', err);
      return null;
    }
  },

  // Fetch recent rewards for user
  async getRecentRewards(userId: string, limit: number = 10): Promise<RewardTransaction[]> {
    const { data, error } = await supabase
      .from('reward_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent rewards:', error);
      return [];
    }

    return data || [];
  },

  // Fetch reward rules
  async getRewardRules(): Promise<RewardRule[]> {
    const { data, error } = await supabase
      .from('reward_rules')
      .select('*')
      .eq('is_active', true)
      .order('action_type');

    if (error) {
      console.error('Error fetching reward rules:', error);
      return [];
    }

    return data || [];
  },

  // Fetch daily action counts would need to come from a different source since there's no daily_action_counts table
  async getDailyActions(userId: string, days: number = 7): Promise<DailyActionCount[]> {
    // Since there's no daily_action_counts table, we'll return an empty array
    // In a real implementation, this would come from an analytics or activity table
    return [];
  },

  // Fetch virtual gifts
  async getVirtualGifts(): Promise<VirtualGift[]> {
    const { data, error } = await supabase
      .from('virtual_gifts')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true })
      .order('rarity', { ascending: true });

    if (error) {
      console.error('Error fetching virtual gifts:', error);
      return [];
    }

    return data || [];
  },

  // Fetch gift transactions for user
  async getGiftTransactions(userId: string, limit: number = 20): Promise<GiftTransaction[]> {
    const { data, error } = await supabase
      .from('gift_transactions')
      .select(`
        *,
        gift:virtual_gifts(name, emoji)
      `)
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching gift transactions:', error);
      return [];
    }

    return data || [];
  },

  // Fetch tip transactions for user
  async getTipTransactions(userId: string, limit: number = 20): Promise<TipTransaction[]> {
    const { data, error } = await supabase
      .from('tip_transactions')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching tip transactions:', error);
      return [];
    }

    return data || [];
  },

  // Fetch user's gift inventory
  async getGiftInventory(userId: string): Promise<UserGiftInventory[]> {
    const { data, error } = await supabase
      .from('user_gift_inventory')
      .select(`
        *,
        gift:virtual_gifts(name, emoji, price)
      `)
      .eq('user_id', userId)
      .gt('quantity', 0);

    if (error) {
      console.error('Error fetching gift inventory:', error);
      return [];
    }

    return data || [];
  },

  // Fetch creator tip settings
  async getTipSettings(userId: string): Promise<CreatorTipSetting | null> {
    const { data, error } = await supabase
      .from('creator_tip_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching tip settings:', error);
      return null;
    }

    return data;
  },

  // Fetch all rewards data for a user
  async getAllRewardsData(userId: string): Promise<RewardsData> {
    const [
      calculatedUserRewards,
      recentRewards,
      rewardRules,
      dailyActions,
      virtualGifts,
      giftTransactions,
      tipTransactions,
      giftInventory,
      tipSettings
    ] = await Promise.all([
      this.calculateUserRewards(userId),
      this.getRecentRewards(userId),
      this.getRewardRules(),
      this.getDailyActions(userId),
      this.getVirtualGifts(),
      this.getGiftTransactions(userId),
      this.getTipTransactions(userId),
      this.getGiftInventory(userId),
      this.getTipSettings(userId)
    ]);

    return {
      calculatedUserRewards,
      recentRewards,
      rewardRules,
      dailyActions,
      virtualGifts,
      giftTransactions,
      tipTransactions,
      giftInventory,
      tipSettings
    };
  }
};