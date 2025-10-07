// @ts-nocheck
import { User } from "@/types/user";

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
  awardPoints(
    activityId: string,
    userId: string,
    multiplier: number = 1,
  ): number {
    const activity = activityConfig[activityId];
    if (!activity) return 0;

    const basePoints = activity.points;
    const levelMultiplier = this.getLevelMultiplier(userId);
    const totalPoints = Math.round(
      basePoints * multiplier * levelMultiplier * (activity.multiplier || 1),
    );

    // Record transaction
    this.recordTransaction({
      id: `txn_${Date.now()}_${userId}`,
      type: "earned",
      amount: totalPoints,
      description: activity.description,
      timestamp: new Date().toISOString(),
      category: activity.category,
      status: "completed",
      metadata: { activityId, multiplier },
    });

    return totalPoints;
  }

  // Get level multiplier for bonus points
  getLevelMultiplier(userId: string): number {
    // Mock user level - in real app, fetch from user data
    const userLevel = "Gold"; // This would come from user data
    return levelConfig[userLevel as keyof typeof levelConfig]?.multiplier || 1;
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
  recordTransaction(transaction: EloitsTransaction): void {
    // In a real app, this would save to database
    console.log("Recording transaction:", transaction);
  }

  // Get user's transaction history
  getTransactionHistory(
    userId: string,
    limit: number = 50,
  ): EloitsTransaction[] {
    // Mock data - in real app, fetch from database
    return [
      {
        id: "1",
        type: "earned",
        amount: 1000,
        description: "Referred a friend",
        timestamp: new Date().toISOString(),
        category: "Referral",
        status: "completed",
      },
      {
        id: "2",
        type: "spent",
        amount: 500,
        description: "Redeemed $5 cash",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        category: "Cash Conversion",
        status: "completed",
      },
    ];
  }

  // Check if user can complete activity
  canCompleteActivity(activityId: string, userId: string): boolean {
    const activity = activityConfig[activityId];
    if (!activity) return false;

    // Check frequency restrictions
    if (activity.frequency === "once") {
      // Check if already completed
      return !this.hasCompletedActivity(activityId, userId);
    }

    if (activity.frequency === "daily") {
      // Check if completed today
      return !this.hasCompletedActivityToday(activityId, userId);
    }

    // For 'unlimited' activities, always allow
    return true;
  }

  // Mock methods for activity tracking
  private hasCompletedActivity(activityId: string, userId: string): boolean {
    // Mock - in real app, check database
    return false;
  }

  private hasCompletedActivityToday(
    activityId: string,
    userId: string,
  ): boolean {
    // Mock - in real app, check database for today's completion
    return false;
  }

  // Get user's Eloits statistics
  getUserStats(userId: string): UserEloitsData {
    // Mock data - in real app, fetch from database
    return {
      totalEarned: 12450,
      totalSpent: 3200,
      currentBalance: 9250,
      level: "Gold",
      levelProgress: 65,
      nextLevelPoints: 2750,
      streakDays: 7,
      rank: 234,
      totalUsers: 10000,
      lastActivity: new Date().toISOString(),
      achievements: ["first_post", "verified_user", "crypto_trader"],
      referralCount: 5,
      creatorBonus: 2500,
    };
  }

  // Process cash conversion
  async convertToCash(
    userId: string,
    points: number,
    paymentMethod: string,
  ): Promise<boolean> {
    if (points < 500) throw new Error("Minimum conversion is 500 ELO");

    // Record conversion transaction
    this.recordTransaction({
      id: `conversion_${Date.now()}_${userId}`,
      type: "converted",
      amount: points,
      description: `Converted to ${this.calculateCashValue(points)} USD`,
      timestamp: new Date().toISOString(),
      category: "Cash Conversion",
      status: "pending",
      metadata: { paymentMethod, cashValue: this.calculateCashValue(points) },
    });

    // In real app, integrate with payment processor
    return true;
  }
}

export const eloitsService = new EloitsService();
export { levelConfig, activityConfig, rewardCatalog };
