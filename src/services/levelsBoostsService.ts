export interface UserLevel {
  id: string;
  name: string;
  level: number;
  minPoints: number;
  maxPoints: number;
  rewardMultiplier: number;
  dailyCap: number;
  benefits: string[];
  badge: string;
  color: string;
}

export interface UserProgress {
  currentLevel: UserLevel;
  nextLevel: UserLevel | null;
  currentPoints: number;
  pointsToNext: number;
  progressPercentage: number;
  totalPointsEarned: number;
  streakDays: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
  reward: {
    eloityPoints: number;
    badge?: string;
    multiplier?: number;
  };
}

export interface BoostItem {
  id: string;
  name: string;
  description: string;
  type: "multiplier" | "reach" | "visibility" | "speed" | "special";
  category: "content" | "profile" | "earnings" | "social";
  effect: {
    multiplier?: number;
    duration?: number; // in hours
    reach?: number;
    special?: string;
  };
  cost: {
    eloityPoints: number;
    walletCost?: number;
    currency?: string;
  };
  rarity: "common" | "rare" | "epic" | "legendary";
  requiredLevel: number;
  maxUses?: number;
  cooldown?: number; // in hours
  icon: string;
  color: string;
}

export interface ActiveBoost {
  id: string;
  boostItem: BoostItem;
  activatedAt: string;
  expiresAt: string;
  usesRemaining?: number;
  isActive: boolean;
}

export class LevelsBoostsService {
  private static apiBase = "/api";

  // Get user's current level and progress
  static async getUserProgress(): Promise<UserProgress | null> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch(`${this.apiBase}/levels/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Return demo progress if API fails
        return this.getDemoProgress();
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching user progress:", error);
      return this.getDemoProgress();
    }
  }

  // Get all available levels
  static async getLevels(): Promise<UserLevel[]> {
    try {
      const response = await fetch(`${this.apiBase}/levels/all`);

      if (!response.ok) {
        return this.getDefaultLevels();
      }

      const result = await response.json();
      return result.data || this.getDefaultLevels();
    } catch (error) {
      console.error("Error fetching levels:", error);
      return this.getDefaultLevels();
    }
  }

  // Get available boost items
  static async getBoostItems(category?: string): Promise<BoostItem[]> {
    try {
      const url = category
        ? `${this.apiBase}/boosts/items?category=${category}`
        : `${this.apiBase}/boosts/items`;

      const response = await fetch(url);

      if (!response.ok) {
        return this.getDefaultBoostItems().filter(
          (item) => !category || item.category === category,
        );
      }

      const result = await response.json();
      return result.data || this.getDefaultBoostItems();
    } catch (error) {
      console.error("Error fetching boost items:", error);
      return this.getDefaultBoostItems();
    }
  }

  // Get user's active boosts
  static async getActiveBoosts(): Promise<ActiveBoost[]> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];

      const response = await fetch(`${this.apiBase}/boosts/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching active boosts:", error);
      return [];
    }
  }

  // Purchase and activate a boost
  static async purchaseBoost(boostId: string): Promise<{
    success: boolean;
    message: string;
    boost?: ActiveBoost;
  }> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${this.apiBase}/boosts/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ boostId }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, message: result.message || "Purchase failed" };
      }

      return result;
    } catch (error) {
      console.error("Error purchasing boost:", error);
      return { success: false, message: "An error occurred" };
    }
  }

  // Get achievements
  static async getAchievements(): Promise<Achievement[]> {
    try {
      const token = localStorage.getItem("token");
      if (!token) return this.getDefaultAchievements();

      const response = await fetch(`${this.apiBase}/achievements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return this.getDefaultAchievements();
      }

      const result = await response.json();
      return result.data || this.getDefaultAchievements();
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return this.getDefaultAchievements();
    }
  }

  // Claim achievement reward
  static async claimAchievement(achievementId: string): Promise<{
    success: boolean;
    message: string;
    reward?: any;
  }> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const response = await fetch(`${this.apiBase}/achievements/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ achievementId }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error claiming achievement:", error);
      return { success: false, message: "An error occurred" };
    }
  }

  // Helper methods for demo data
  private static getDefaultLevels(): UserLevel[] {
    return [
      {
        id: "bronze",
        name: "Bronze Explorer",
        level: 1,
        minPoints: 0,
        maxPoints: 100,
        rewardMultiplier: 1.0,
        dailyCap: 50,
        benefits: ["Basic rewards", "Standard support"],
        badge: "🥉",
        color: "#CD7F32",
      },
      {
        id: "silver",
        name: "Silver Creator",
        level: 2,
        minPoints: 100,
        maxPoints: 500,
        rewardMultiplier: 1.2,
        dailyCap: 75,
        benefits: ["20% bonus rewards", "Priority support", "Basic boosts"],
        badge: "🥈",
        color: "#C0C0C0",
      },
      {
        id: "gold",
        name: "Gold Influencer",
        level: 3,
        minPoints: 500,
        maxPoints: 2000,
        rewardMultiplier: 1.5,
        dailyCap: 100,
        benefits: [
          "50% bonus rewards",
          "Premium support",
          "Advanced boosts",
          "Custom profile badge",
        ],
        badge: "🥇",
        color: "#FFD700",
      },
      {
        id: "platinum",
        name: "Platinum Elite",
        level: 4,
        minPoints: 2000,
        maxPoints: 10000,
        rewardMultiplier: 2.0,
        dailyCap: 150,
        benefits: [
          "100% bonus rewards",
          "VIP support",
          "All boosts",
          "Featured content",
          "Revenue sharing",
        ],
        badge: "💎",
        color: "#E5E4E2",
      },
      {
        id: "diamond",
        name: "Diamond Legend",
        level: 5,
        minPoints: 10000,
        maxPoints: 999999,
        rewardMultiplier: 3.0,
        dailyCap: 250,
        benefits: [
          "200% bonus rewards",
          "Dedicated manager",
          "Unlimited boosts",
          "Co-marketing",
          "Custom features",
        ],
        badge: "👑",
        color: "#B9F2FF",
      },
    ];
  }

  private static getDefaultBoostItems(): BoostItem[] {
    return [
      {
        id: "content_reach_2x",
        name: "2x Content Reach",
        description: "Double the reach of your next 5 posts",
        type: "reach",
        category: "content",
        effect: { reach: 2, duration: 24 },
        cost: { eloityPoints: 50 },
        rarity: "common",
        requiredLevel: 1,
        maxUses: 5,
        icon: "📢",
        color: "#3B82F6",
      },
      {
        id: "earning_multiplier_1_5x",
        name: "1.5x Earning Boost",
        description: "Increase all earnings by 50% for 12 hours",
        type: "multiplier",
        category: "earnings",
        effect: { multiplier: 1.5, duration: 12 },
        cost: { eloityPoints: 100 },
        rarity: "rare",
        requiredLevel: 2,
        cooldown: 24,
        icon: "💰",
        color: "#10B981",
      },
      {
        id: "profile_highlight",
        name: "Profile Spotlight",
        description: "Feature your profile in discovery for 24 hours",
        type: "visibility",
        category: "profile",
        effect: { duration: 24, special: "featured_profile" },
        cost: { eloityPoints: 200 },
        rarity: "epic",
        requiredLevel: 3,
        cooldown: 72,
        icon: "⭐",
        color: "#8B5CF6",
      },
      {
        id: "speed_boost",
        name: "Lightning Speed",
        description: "Reduce all cooldowns by 50% for 6 hours",
        type: "speed",
        category: "social",
        effect: { multiplier: 0.5, duration: 6, special: "cooldown_reduction" },
        cost: { eloityPoints: 75 },
        rarity: "rare",
        requiredLevel: 2,
        icon: "⚡",
        color: "#F59E0B",
      },
      {
        id: "mega_multiplier",
        name: "Mega Multiplier",
        description: "Triple all rewards for the next 10 activities",
        type: "multiplier",
        category: "earnings",
        effect: { multiplier: 3.0, special: "activity_limited" },
        cost: { eloityPoints: 500, walletCost: 5, currency: "USDT" },
        rarity: "legendary",
        requiredLevel: 4,
        maxUses: 10,
        cooldown: 168, // 1 week
        icon: "🚀",
        color: "#EF4444",
      },
    ];
  }

  private static getDefaultAchievements(): Achievement[] {
    return [
      {
        id: "first_post",
        name: "First Steps",
        description: "Create your first post",
        icon: "📝",
        progress: 1,
        target: 1,
        reward: { eloityPoints: 10, badge: "first_post" },
      },
      {
        id: "social_butterfly",
        name: "Social Butterfly",
        description: "Like 100 posts",
        icon: "🦋",
        progress: 0,
        target: 100,
        reward: { eloityPoints: 50, multiplier: 1.1 },
      },
      {
        id: "content_creator",
        name: "Content Creator",
        description: "Create 50 posts",
        icon: "🎨",
        progress: 0,
        target: 50,
        reward: { eloityPoints: 200, badge: "creator" },
      },
      {
        id: "earning_master",
        name: "Earning Master",
        description: "Earn $100 through the platform",
        icon: "💎",
        progress: 0,
        target: 100,
        reward: { eloityPoints: 500, badge: "earning_master" },
      },
      {
        id: "referral_champion",
        name: "Referral Champion",
        description: "Refer 25 friends",
        icon: "👥",
        progress: 0,
        target: 25,
        reward: { eloityPoints: 1000, multiplier: 1.2 },
      },
    ];
  }

  private static getDemoProgress(): UserProgress {
    const levels = this.getDefaultLevels();
    const currentLevel = levels[1]; // Silver level
    const nextLevel = levels[2]; // Gold level
    const currentPoints = 250;

    return {
      currentLevel,
      nextLevel,
      currentPoints,
      pointsToNext: nextLevel.minPoints - currentPoints,
      progressPercentage:
        ((currentPoints - currentLevel.minPoints) /
          (nextLevel.minPoints - currentLevel.minPoints)) *
        100,
      totalPointsEarned: 250,
      streakDays: 7,
      achievements: this.getDefaultAchievements(),
    };
  }

  // Utility methods
  static getRarityColor(rarity: string): string {
    switch (rarity) {
      case "common":
        return "#6B7280";
      case "rare":
        return "#3B82F6";
      case "epic":
        return "#8B5CF6";
      case "legendary":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  }

  static formatDuration(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  }

  static isBoostAffordable(
    boost: BoostItem,
    userPoints: number,
    userLevel: number,
  ): boolean {
    return (
      userPoints >= boost.cost.eloityPoints && userLevel >= boost.requiredLevel
    );
  }
}
