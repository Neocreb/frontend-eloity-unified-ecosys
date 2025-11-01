import { supabase } from "@/integrations/supabase/client";

interface Reward {
  id: string;
  user_id: string;
  action_type: string;
  amount: number;
  description: string;
  metadata: Record<string, any> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface RewardRule {
  id: string;
  action: string;
  base_reward: number;
  multiplier: number | null;
  conditions: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserReward {
  id: string;
  user_id: string;
  total_earned: number;
  today_earned: number;
  streak: number;
  level: number;
  next_level_requirement: number;
  available_balance: number;
  pending_rewards: number;
  created_at: string;
  updated_at: string;
}

interface DailyActionCount {
  id: string;
  user_id: string;
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
  id: string;
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
  userRewards: UserReward | null;
  recentRewards: Reward[];
  rewardRules: RewardRule[];
  dailyActions: DailyActionCount[];
  virtualGifts: VirtualGift[];
  giftTransactions: GiftTransaction[];
  tipTransactions: TipTransaction[];
  giftInventory: UserGiftInventory[];
  tipSettings: CreatorTipSetting | null;
}

export const rewardsService = {
  // Fetch user rewards summary
  async getUserRewards(userId: string): Promise<UserReward | null> {
    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user rewards:', error);
      return null;
    }

    return data;
  },

  // Fetch recent rewards for user
  async getRecentRewards(userId: string, limit: number = 10): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
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
      .order('action');

    if (error) {
      console.error('Error fetching reward rules:', error);
      return [];
    }

    return data || [];
  },

  // Fetch daily action counts for user
  async getDailyActions(userId: string, days: number = 7): Promise<DailyActionCount[]> {
    const { data, error } = await supabase
      .from('daily_action_counts')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching daily actions:', error);
      return [];
    }

    return data || [];
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
      userRewards,
      recentRewards,
      rewardRules,
      dailyActions,
      virtualGifts,
      giftTransactions,
      tipTransactions,
      giftInventory,
      tipSettings
    ] = await Promise.all([
      this.getUserRewards(userId),
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
      userRewards,
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