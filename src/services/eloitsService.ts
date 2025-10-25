// @ts-nocheck
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

// Eloits Activity Types
export type ActivityType =
  | "social"
  | "trading"
  | "marketplace"
  | "referral"
  | "daily"
  | "special"
  | "creator"
  | "engagement"
  | "community";

export type RewardType =
  | "cash"
  | "discount"
  | "product"
  | "service"
  | "premium"
  | "exclusive"
  | "marketplace_credit"
  | "trading_bonus";

export interface EloitsActivity {
  id: string;
  type: ActivityType;
  name: string;
  description: string;
  points: number;
  icon: string;
  color: string;
  frequency: "once" | "daily" | "unlimited" | "weekly" | "monthly";
  category: string;
  requirements?: string[];
  multiplier?: number;
  timeLimit?: number; // in hours
  completed?: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface EloitsReward {
  id: string;
  type: RewardType;
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

export interface UserEloitsData {
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  level: string;
  levelProgress: number;
  nextLevelPoints: number;
  streakDays: number;
  rank: number;
  totalUsers: number;
  lastActivity: string;
  achievements: string[];
  referralCount: number;
  creatorBonus: number;
}

export interface EloitsTransaction {
  id: string;
  type: "earned" | "spent" | "converted" | "bonus" | "penalty";
  amount: number;
  description: string;
  timestamp: string;
  category: string;
  status: "completed" | "pending" | "failed" | "cancelled";
  reference?: string;
  metadata?: Record<string, any>;
}

// Configuration for Eloits activities
const activityConfig: Record<string, EloitsActivity> = {
  // Daily Activities
  daily_login: {
    id: "daily_login",
    type: "daily",
    name: "Daily Login",
    description: "Login to your account daily to earn points",
    points: 50,
    icon: "calendar",
    color: "bg-blue-500",
    frequency: "daily",
    category: "Daily",
    multiplier: 1,
  },
  daily_visit: {
    id: "daily_visit",
    type: "daily",
    name: "Daily Visit",
    description: "Visit the platform for at least 5 minutes",
    points: 25,
    icon: "clock",
    color: "bg-green-500",
    frequency: "daily",
    category: "Daily",
    timeLimit: 24,
  },

  // Social Activities
  create_post: {
    id: "create_post",
    type: "social",
    name: "Create Post",
    description: "Share content with the community",
    points: 100,
    icon: "message-square",
    color: "bg-purple-500",
    frequency: "unlimited",
    category: "Social",
    multiplier: 1,
  },
  like_post: {
    id: "like_post",
    type: "social",
    name: "Like Posts",
    description: "Engage with community content by liking posts",
    points: 10,
    icon: "heart",
    color: "bg-pink-500",
    frequency: "unlimited",
    category: "Social",
  },
  comment_post: {
    id: "comment_post",
    type: "social",
    name: "Comment on Posts",
    description: "Leave meaningful comments on posts",
    points: 20,
    icon: "message-circle",
    color: "bg-blue-500",
    frequency: "unlimited",
    category: "Social",
  },
  share_post: {
    id: "share_post",
    type: "social",
    name: "Share Posts",
    description: "Share posts with your network",
    points: 15,
    icon: "share-2",
    color: "bg-green-500",
    frequency: "unlimited",
    category: "Social",
  },

  // Creator Activities
  create_video: {
    id: "create_video",
    type: "creator",
    name: "Create Video",
    description: "Upload original video content",
    points: 500,
    icon: "video",
    color: "bg-red-500",
    frequency: "unlimited",
    category: "Creator",
    multiplier: 2,
  },
  video_views: {
    id: "video_views",
    type: "creator",
    name: "Video Views",
    description: "Earn points for every 100 views on your videos",
    points: 50,
    icon: "eye",
    color: "bg-orange-500",
    frequency: "unlimited",
    category: "Creator",
  },
  get_followers: {
    id: "get_followers",
    type: "creator",
    name: "Gain Followers",
    description: "Earn points for each new follower",
    points: 25,
    icon: "user-plus",
    color: "bg-indigo-500",
    frequency: "unlimited",
    category: "Creator",
  },

  // Trading Activities
  crypto_trade: {
    id: "crypto_trade",
    type: "trading",
    name: "Crypto Trading",
    description: "Execute cryptocurrency trades",
    points: 200,
    icon: "trending-up",
    color: "bg-orange-500",
    frequency: "unlimited",
    category: "Trading",
  },
  successful_trade: {
    id: "successful_trade",
    type: "trading",
    name: "Profitable Trade",
    description: "Complete a profitable trade",
    points: 300,
    icon: "target",
    color: "bg-green-500",
    frequency: "unlimited",
    category: "Trading",
    multiplier: 1.5,
  },
  staking_reward: {
    id: "staking_reward",
    type: "trading",
    name: "Staking Rewards",
    description: "Earn from staking cryptocurrencies",
    points: 150,
    icon: "coins",
    color: "bg-yellow-500",
    frequency: "daily",
    category: "Trading",
  },

  // Marketplace Activities
  marketplace_purchase: {
    id: "marketplace_purchase",
    type: "marketplace",
    name: "Marketplace Purchase",
    description: "Buy products from the marketplace",
    points: 500,
    icon: "shopping-cart",
    color: "bg-purple-500",
    frequency: "unlimited",
    category: "Marketplace",
  },
  list_product: {
    id: "list_product",
    type: "marketplace",
    name: "List Product",
    description: "List a product for sale in the marketplace",
    points: 200,
    icon: "package",
    color: "bg-blue-500",
    frequency: "unlimited",
    category: "Marketplace",
  },
  product_sold: {
    id: "product_sold",
    type: "marketplace",
    name: "Product Sold",
    description: "Successfully sell a product",
    points: 750,
    icon: "check-circle",
    color: "bg-green-500",
    frequency: "unlimited",
    category: "Marketplace",
    multiplier: 2,
  },
  leave_review: {
    id: "leave_review",
    type: "marketplace",
    name: "Leave Review",
    description: "Write a product or seller review",
    points: 30,
    icon: "star",
    color: "bg-yellow-500",
    frequency: "unlimited",
    category: "Marketplace",
  },

  // Referral Activities
  refer_friend: {
    id: "refer_friend",
    type: "referral",
    name: "Refer Friends",
    description: "Invite friends to join Eloity",
    points: 1000,
    icon: "users",
    color: "bg-indigo-500",
    frequency: "unlimited",
    category: "Referral",
    multiplier: 3,
  },
  referral_signup: {
    id: "referral_signup",
    type: "referral",
    name: "Referral Signs Up",
    description: "Bonus when your referral completes registration",
    points: 500,
    icon: "user-check",
    color: "bg-green-500",
    frequency: "unlimited",
    category: "Referral",
  },
  referral_first_purchase: {
    id: "referral_first_purchase",
    type: "referral",
    name: "Referral First Purchase",
    description: "Bonus when your referral makes their first purchase",
    points: 1500,
    icon: "gift",
    color: "bg-purple-500",
    frequency: "unlimited",
    category: "Referral",
    multiplier: 2,
  },

  // Special Activities
  complete_profile: {
    id: "complete_profile",
    type: "special",
    name: "Complete Profile",
    description: "Fill out all profile information",
    points: 300,
    icon: "user",
    color: "bg-blue-500",
    frequency: "once",
    category: "Special",
  },
  verify_email: {
    id: "verify_email",
    type: "special",
    name: "Verify Email",
    description: "Verify your email address",
    points: 100,
    icon: "mail",
    color: "bg-green-500",
    frequency: "once",
    category: "Special",
  },
  enable_2fa: {
    id: "enable_2fa",
    type: "special",
    name: "Enable 2FA",
    description: "Secure your account with two-factor authentication",
    points: 200,
    icon: "shield",
    color: "bg-red-500",
    frequency: "once",
    category: "Special",
  },
  monthly_challenge: {
    id: "monthly_challenge",
    type: "special",
    name: "Monthly Challenge",
    description: "Complete monthly community challenges",
    points: 2000,
    icon: "trophy",
    color: "bg-gold-500",
    frequency: "monthly",
    category: "Special",
    multiplier: 5,
  },
};

// Level configuration
const levelConfig = {
  Bronze: { min: 0, max: 5000, multiplier: 1, color: "bg-orange-600" },
  Silver: { min: 5000, max: 15000, multiplier: 1.2, color: "bg-gray-400" },
  Gold: { min: 15000, max: 50000, multiplier: 1.5, color: "bg-yellow-500" },
  Platinum: { min: 50000, max: 150000, multiplier: 2, color: "bg-purple-600" },
  Diamond: { min: 150000, max: Infinity, multiplier: 3, color: "bg-blue-600" },
};

// Reward catalog
const rewardCatalog: Record<string, EloitsReward> = {
  // Cash Conversions
  cash_5: {
    id: "cash_5",
    type: "cash",
    name: "$5 Cash",
    description: "Convert Eloits to real money via bank transfer",
    pointsRequired: 500,
    value: "$5.00",
    category: "Money",
    availability: 999,
  },
  cash_25: {
    id: "cash_25",
    type: "cash",
    name: "$25 Cash",
    description: "Convert Eloits to real money via bank transfer",
    pointsRequired: 2500,
    value: "$25.00",
    category: "Money",
    availability: 999,
    featured: true,
  },
  cash_100: {
    id: "cash_100",
    type: "cash",
    name: "$100 Cash",
    description: "Convert Eloits to real money via bank transfer",
    pointsRequired: 10000,
    value: "$100.00",
    category: "Money",
    availability: 999,
    featured: true,
  },

  // Premium Services
  premium_week: {
    id: "premium_week",
    type: "premium",
    name: "1 Week Premium",
    description: "Access to premium features for 7 days",
    pointsRequired: 1500,
    value: "7 days",
    category: "Premium",
    availability: 100,
  },
  premium_month: {
    id: "premium_month",
    type: "premium",
    name: "1 Month Premium",
    description: "Access to premium features for 30 days",
    pointsRequired: 5000,
    value: "30 days",
    category: "Premium",
    availability: 100,
    discount: 20,
  },

  // Marketplace Credits
  marketplace_10: {
    id: "marketplace_10",
    type: "marketplace_credit",
    name: "$10 Marketplace Credit",
    description: "Credit to use in the Eloity marketplace",
    pointsRequired: 900,
    value: "$10.00",
    category: "Shopping",
    availability: 200,
  },
  marketplace_50: {
    id: "marketplace_50",
    type: "marketplace_credit",
    name: "$50 Marketplace Credit",
    description: "Credit to use in the Eloity marketplace",
    pointsRequired: 4500,
    value: "$50.00",
    category: "Shopping",
    availability: 50,
    discount: 10,
  },

  // Trading Bonuses
  trading_fee_waiver: {
    id: "trading_fee_waiver",
    type: "trading_bonus",
    name: "Free Trading Week",
    description: "0% trading fees for 7 days",
    pointsRequired: 1200,
    value: "7 days",
    category: "Trading",
    availability: 75,
  },
  crypto_bonus: {
    id: "crypto_bonus",
    type: "trading_bonus",
    name: "$25 Trading Bonus",
    description: "$25 bonus added to your trading account",
    pointsRequired: 2200,
    value: "$25.00",
    category: "Trading",
    availability: 30,
  },

  // Exclusive Items
  exclusive_nft: {
    id: "exclusive_nft",
    type: "exclusive",
    name: "Eloity NFT",
    description: "Limited edition Eloity commemorative NFT",
    pointsRequired: 15000,
    value: "Unique",
    category: "Collectibles",
    availability: 100,
    featured: true,
    minLevel: "Gold",
  },
  vip_support: {
    id: "vip_support",
    type: "service",
    name: "VIP Support",
    description: "Priority customer support for 3 months",
    pointsRequired: 7500,
    value: "90 days",
    category: "Service",
    availability: 25,
    minLevel: "Platinum",
  },
};

class EloitsService {
  // Calculate user level based on points
  calculateLevel(points: number): string {
    const levels = Object.entries(levelConfig);
    for (const [level, config] of levels.reverse()) {
      if (points >= config.min) {
        return level;
      }
    }
    return "Bronze";
  }

  // Get level progress and next level info
  getLevelProgress(points: number) {
    const currentLevel = this.calculateLevel(points);
    const levelInfo = levelConfig[currentLevel as keyof typeof levelConfig];

    if (currentLevel === "Diamond") {
      return {
        currentLevel,
        nextLevel: null,
        progress: 100,
        pointsToNext: 0,
      };
    }

    const levels = Object.keys(levelConfig);
    const currentIndex = levels.indexOf(currentLevel);
    const nextLevel = levels[currentIndex + 1];
    const nextLevelInfo = levelConfig[nextLevel as keyof typeof levelConfig];

    const pointsAboveCurrentThreshold = points - levelInfo.min;
    const pointsNeededForNextLevel = nextLevelInfo.min - levelInfo.min;
    const progress = Math.min(
      (pointsAboveCurrentThreshold / pointsNeededForNextLevel) * 100,
      100,
    );
    const pointsToNext = nextLevelInfo.min - points;

    return {
      currentLevel,
      nextLevel,
      progress: Math.round(progress),
      pointsToNext: Math.max(0, pointsToNext),
    };
  }

  // Award points for an activity
  async awardPoints(
    activityId: string,
    userId: string,
    multiplier: number = 1,
  ): Promise<number> {
    const activity = activityConfig[activityId];
    if (!activity) return 0;

    // Check if user can complete this activity
    const canComplete = await this.canCompleteActivity(activityId, userId);
    if (!canComplete) return 0;

    const basePoints = activity.points;
    const levelMultiplier = await this.getLevelMultiplier(userId);
    const totalPoints = Math.round(
      basePoints * multiplier * levelMultiplier * (activity.multiplier || 1),
    );

    // Get user's current ELO data
    try {
      const { data: userEloData, error: fetchError } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update user's ELO balance
      const newBalance = (userEloData.current_balance || 0) + totalPoints;
      const newTotalEarned = (userEloData.total_earned || 0) + totalPoints;
      
      const { error: updateError } = await supabase
        .from('user_rewards')
        .update({
          current_balance: newBalance,
          total_earned: newTotalEarned,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;

      // Record transaction
      await this.recordTransaction({
        id: `txn_${Date.now()}_${userId}`,
        type: "earned",
        amount: totalPoints,
        description: activity.description,
        timestamp: new Date().toISOString(),
        category: activity.category,
        status: "completed",
        metadata: { 
          activityId, 
          multiplier,
          userId,
          actionType: activityId,
          balanceAfter: newBalance,
          trustScoreImpact: 0.1
        },
      });

      return totalPoints;
    } catch (error) {
      console.error('Error awarding points:', error);
      return 0;
    }
  }

  // Get level multiplier for bonus points
  async getLevelMultiplier(userId: string): Promise<number> {
    try {
      // Get user's current ELO data to determine their level
      const { data: userEloData, error } = await supabase
        .from('user_rewards')
        .select('trust_level')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      const userLevel = userEloData.trust_level || "bronze";
      return levelConfig[userLevel as keyof typeof levelConfig]?.multiplier || 1;
    } catch (error) {
      console.error('Error fetching user level:', error);
      return 1;
    }
  }

  // Calculate cash conversion rate
  calculateCashValue(points: number): number {
    return points / 100; // 100 ELO = $1.00
  }

  // Get available activities
  getAvailableActivities(userLevel: string = "Bronze"): EloitsActivity[] {
    return Object.values(activityConfig);
  }

  // Get available rewards based on user level and points
  getAvailableRewards(
    userLevel: string = "Bronze",
    userPoints: number = 0,
  ): EloitsReward[] {
    return Object.values(rewardCatalog).filter((reward) => {
      if (reward.minLevel) {
        const levels = Object.keys(levelConfig);
        const userLevelIndex = levels.indexOf(userLevel);
        const minLevelIndex = levels.indexOf(reward.minLevel);
        return userLevelIndex >= minLevelIndex;
      }
      return true;
    });
  }

  // Record a transaction
  async recordTransaction(transaction: EloitsTransaction): Promise<void> {
    try {
      const transactionData = {
        id: transaction.id,
        user_id: transaction.metadata?.userId || '',
        action_type: transaction.metadata?.actionType || 'general_transaction',
        amount: transaction.amount,
        balance_after: transaction.metadata?.balanceAfter || 0,
        description: transaction.description,
        metadata: transaction.metadata || {},
        trust_score_impact: transaction.metadata?.trustScoreImpact || 0,
        multiplier_applied: transaction.metadata?.multiplierApplied || 1.0,
        decay_factor: transaction.metadata?.decayFactor || 1.0,
        status: transaction.status,
        reference_id: transaction.metadata?.referenceId || null,
        created_at: transaction.timestamp,
      };
      
      const { error } = await supabase
        .from('reward_transactions')
        .insert(transactionData);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }

  // Get user's transaction history
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
  ): Promise<EloitsTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('reward_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(transaction => ({
        id: transaction.id,
        type: transaction.action_type === 'redemption' ? 'spent' : 
              transaction.action_type.includes('purchase') ? 'spent' : 'earned',
        amount: transaction.amount,
        description: transaction.description,
        timestamp: transaction.created_at,
        category: transaction.metadata?.category || 'General',
        status: transaction.status || 'completed',
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      // Fallback to mock data if database fetch fails
      return [
        {
          id: "1",
          type: "earned",
          amount: 0,
          description: "No transactions found",
          timestamp: new Date().toISOString(),
          category: "General",
          status: "completed",
        }
      ];
    }
  }

  // Check if user has completed an activity
  async hasCompletedActivity(activityId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('reward_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('action_type', activityId)
        .limit(1);
      
      if (error) throw error;
      return data.length > 0;
    } catch (error) {
      console.error('Error checking activity completion:', error);
      return false;
    }
  }

  // Check if user has completed an activity today
  async hasCompletedActivityToday(activityId: string, userId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('reward_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('action_type', activityId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .limit(1);
      
      if (error) throw error;
      return data.length > 0;
    } catch (error) {
      console.error('Error checking today\'s activity completion:', error);
      return false;
    }
  }

  // Check if user can complete activity
  async canCompleteActivity(activityId: string, userId: string): Promise<boolean> {
    const activity = activityConfig[activityId];
    if (!activity) return false;

    // Check frequency restrictions
    if (activity.frequency === "once") {
      // Check if already completed
      return !(await this.hasCompletedActivity(activityId, userId));
    }

    if (activity.frequency === "daily") {
      // Check if completed today
      return !(await this.hasCompletedActivityToday(activityId, userId));
    }

    // For 'unlimited' activities, always allow
    return true;
  }

  // Get user's Eloits statistics
  async getUserStats(userId: string): Promise<UserEloitsData> {
    try {
      // Fetch user's ELO data from the user_rewards table
      const { data: userEloData, error } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      // Calculate level based on points
      const currentLevel = this.calculateLevel(userEloData.total_earned);
      const levelProgress = this.getLevelProgress(userEloData.total_earned);
      
      // Get transaction history to calculate additional stats
      const { data: transactions, error: transactionError } = await supabase
        .from('reward_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (transactionError) throw transactionError;
      
      // Calculate streak days (simplified implementation)
      const streakDays = userEloData.streak_days || 0;
      
      // Get achievements (simplified implementation)
      const achievements: string[] = [];
      if (userEloData.trust_score >= 90) achievements.push("diamond_trust");
      else if (userEloData.trust_score >= 75) achievements.push("platinum_trust");
      else if (userEloData.trust_score >= 60) achievements.push("gold_trust");
      
      // Add activity-based achievements
      const activityTypes = transactions.map(t => t.action_type);
      if (activityTypes.includes("post_content")) achievements.push("content_creator");
      if (activityTypes.includes("refer_user")) achievements.push("referral_master");
      if (activityTypes.includes("purchase_product")) achievements.push("shopper");
      
      return {
        totalEarned: userEloData.total_earned || 0,
        totalSpent: userEloData.total_spent || 0,
        currentBalance: userEloData.current_balance || 0,
        level: currentLevel,
        levelProgress: levelProgress.progress,
        nextLevelPoints: levelProgress.pointsToNext,
        streakDays: streakDays,
        rank: 0, // This would require a more complex query to calculate
        totalUsers: 0, // This would require a count query
        lastActivity: userEloData.updated_at || new Date().toISOString(),
        achievements: achievements,
        referralCount: userEloData.referral_count || 0,
        creatorBonus: 0, // This would need to be calculated from creator activities
      };
    } catch (error) {
      console.error('Error fetching user ELO stats:', error);
      // Fallback to mock data if database fetch fails
      return {
        totalEarned: 0,
        totalSpent: 0,
        currentBalance: 0,
        level: "Bronze",
        levelProgress: 0,
        nextLevelPoints: 5000,
        streakDays: 0,
        rank: 0,
        totalUsers: 0,
        lastActivity: new Date().toISOString(),
        achievements: [],
        referralCount: 0,
        creatorBonus: 0,
      };
    }
  }

  // Process cash conversion
  async convertToCash(
    userId: string,
    points: number,
    paymentMethod: string,
  ): Promise<boolean> {
    if (points < 500) throw new Error("Minimum conversion is 500 ELO");

    try {
      // Get user's current ELO data
      const { data: userEloData, error: fetchError } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Check if user has enough points
      if ((userEloData.current_balance || 0) < points) {
        throw new Error("Insufficient ELO balance");
      }
      
      // Deduct points from user's balance
      const newBalance = (userEloData.current_balance || 0) - points;
      const newTotalSpent = (userEloData.total_spent || 0) + points;
      
      const { error: updateError } = await supabase
        .from('user_rewards')
        .update({
          current_balance: newBalance,
          total_spent: newTotalSpent,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;

      // Record conversion transaction
      await this.recordTransaction({
        id: `conversion_${Date.now()}_${userId}`,
        type: "converted",
        amount: points,
        description: `Converted to ${this.calculateCashValue(points)} USD`,
        timestamp: new Date().toISOString(),
        category: "Cash Conversion",
        status: "pending",
        metadata: { 
          paymentMethod, 
          cashValue: this.calculateCashValue(points),
          userId,
          actionType: 'redemption',
          balanceAfter: newBalance,
          referenceId: `redemption_${Date.now()}_${userId}`
        },
      });

      // In real app, integrate with payment processor
      return true;
    } catch (error) {
      console.error('Error converting to cash:', error);
      return false;
    }
  }
}

export const eloitsService = new EloitsService();
export { levelConfig, activityConfig, rewardCatalog };
