// @ts-nocheck
import { websocketService } from './websocketService';
import { enhancedEloitsService } from './enhancedEloitsService';

export interface RewardAction {
  type: 'like' | 'comment' | 'share' | 'upload' | 'watch' | 'ad_view' | 'trade' | 'referral' | 'daily_login' | 'milestone' | 'purchase_product' | 'product_sold' | 'refer_user';
  amount: number;
  description: string;
  metadata?: any;
}

export interface RewardRule {
  id: string;
  action: string;
  baseReward: number;
  multiplier?: number;
  conditions?: {
    dailyLimit?: number;
    requiredWatchTime?: number;
    minimumValue?: number;
  };
  isActive: boolean;
}

export interface UserRewardData {
  totalEarned: number;
  todayEarned: number;
  streak: number;
  level: number;
  nextLevelRequirement: number;
  availableBalance: number;
  pendingRewards: number;
  // Enhanced Eloits data
  currentBalance: number;
  trustScore: number;
  trustLevel: string;
  tier: string;
  referralCount: number;
}

class RewardService {
  private rewardRules: Map<string, RewardRule> = new Map();
  private userRewardData: UserRewardData | null = null;
  private dailyActionCounts: Map<string, number> = new Map();

  constructor() {
    this.initializeRewardRules();
    this.setupWebSocketListeners();
  }

  private initializeRewardRules() {
    const defaultRules: RewardRule[] = [
      {
        id: 'like_post',
        action: 'like',
        baseReward: 0.01,
        conditions: { dailyLimit: 100 },
        isActive: true
      },
      {
        id: 'comment_post',
        action: 'comment',
        baseReward: 0.05,
        conditions: { dailyLimit: 50 },
        isActive: true
      },
      {
        id: 'share_post',
        action: 'share',
        baseReward: 0.10,
        conditions: { dailyLimit: 20 },
        isActive: true
      },
      {
        id: 'upload_video',
        action: 'upload',
        baseReward: 1.00,
        conditions: { dailyLimit: 10 },
        isActive: true
      },
      {
        id: 'watch_video',
        action: 'watch',
        baseReward: 0.02,
        multiplier: 1.5, // Multiplier for longer watch times
        conditions: { requiredWatchTime: 30 }, // 30 seconds minimum
        isActive: true
      },
      {
        id: 'ad_view',
        action: 'ad_view',
        baseReward: 0.25,
        conditions: { dailyLimit: 200 },
        isActive: true
      },
      {
        id: 'crypto_trade',
        action: 'trade',
        baseReward: 0.50,
        multiplier: 0.001, // 0.1% of trade value
        conditions: { minimumValue: 10 },
        isActive: true
      },
      {
        id: 'referral_signup',
        action: 'referral',
        baseReward: 5.00,
        isActive: true
      },
      {
        id: 'daily_login',
        action: 'daily_login',
        baseReward: 0.50,
        multiplier: 1.1, // Increases with streak
        isActive: true
      },
      // Enhanced Eloits rules
      {
        id: 'purchase_product',
        action: 'purchase_product',
        baseReward: 10.0,
        conditions: { dailyLimit: 50 },
        isActive: true
      },
      {
        id: 'product_sold',
        action: 'product_sold',
        baseReward: 750.0,
        isActive: true
      },
      {
        id: 'refer_user',
        action: 'refer_user',
        baseReward: 1000.0,
        isActive: true
      }
    ];

    defaultRules.forEach(rule => {
      this.rewardRules.set(rule.action, rule);
    });
  }

  private setupWebSocketListeners() {
    websocketService.on('reward_earned', (data) => {
      this.handleRewardEarned(data);
    });

    websocketService.on('reward_rules_updated', (data) => {
      this.updateRewardRules(data.rules);
    });

    websocketService.on('user_reward_data_updated', (data) => {
      this.userRewardData = {
        ...this.userRewardData,
        ...data.userData
      };
    });
  }

  private handleRewardEarned(data: any) {
    if (this.userRewardData) {
      this.userRewardData.totalEarned += data.amount;
      this.userRewardData.todayEarned += data.amount;
      this.userRewardData.availableBalance += data.amount;
      // Update enhanced Eloits data if available
      if (data.enhancedData) {
        this.userRewardData.currentBalance = data.enhancedData.currentBalance;
        this.userRewardData.trustScore = data.enhancedData.trustScore;
        this.userRewardData.trustLevel = data.enhancedData.trustLevel;
        this.userRewardData.tier = data.enhancedData.tier;
        this.userRewardData.referralCount = data.enhancedData.referralCount;
      }
    }

    // Emit custom event for UI updates
    window.dispatchEvent(new CustomEvent('rewardEarned', {
      detail: { reward: data.amount, action: data.action, description: data.description }
    }));
  }

  private updateRewardRules(rules: RewardRule[]) {
    this.rewardRules.clear();
    rules.forEach(rule => {
      this.rewardRules.set(rule.action, rule);
    });
  }

  async initializeUserData(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/rewards/user/${userId}`);
      const data = await response.json();
      this.userRewardData = data.userData;
      this.dailyActionCounts = new Map(Object.entries(data.dailyActionCounts || {}));
      
      // Also initialize enhanced Eloits data
      const enhancedData = await enhancedEloitsService.getUserEloitsData(userId);
      if (enhancedData && this.userRewardData) {
        this.userRewardData.currentBalance = enhancedData.current_balance;
        this.userRewardData.trustScore = enhancedData.trust_score;
        this.userRewardData.trustLevel = enhancedData.trust_level;
        this.userRewardData.tier = enhancedData.tier;
        this.userRewardData.referralCount = enhancedData.referral_count;
      }
    } catch (error) {
      console.error('Failed to initialize user reward data:', error);
    }
  }

  async triggerReward(action: string, metadata: any = {}): Promise<RewardAction | null> {
    const rule = this.rewardRules.get(action);
    if (!rule || !rule.isActive) {
      console.warn(`No active reward rule found for action: ${action}`);
      return null;
    }

    // Check daily limits
    const todayCount = this.dailyActionCounts.get(action) || 0;
    if (rule.conditions?.dailyLimit && todayCount >= rule.conditions.dailyLimit) {
      console.warn(`Daily limit reached for action: ${action}`);
      return null;
    }

    // Calculate reward amount
    let rewardAmount = rule.baseReward;
    
    // Apply multipliers
    if (rule.multiplier) {
      switch (action) {
        case 'watch':
          const watchTime = metadata.watchTime || 0;
          if (rule.conditions?.requiredWatchTime && watchTime >= rule.conditions.requiredWatchTime) {
            rewardAmount *= Math.min(rule.multiplier * (watchTime / 60), 5); // Max 5x multiplier
          } else {
            return null; // Didn't meet minimum watch time
          }
          break;
        
        case 'trade':
          const tradeValue = metadata.tradeValue || 0;
          if (rule.conditions?.minimumValue && tradeValue >= rule.conditions.minimumValue) {
            rewardAmount = tradeValue * rule.multiplier;
          } else {
            return null; // Trade value too low
          }
          break;
        
        case 'daily_login':
          const streak = this.userRewardData?.streak || 1;
          rewardAmount *= Math.pow(rule.multiplier, Math.min(streak, 30)); // Max 30 day streak bonus
          break;
          
        // Enhanced Eloits multipliers
        case 'purchase_product':
          // 10 ELO + (1% of purchase amount in ELO), max 200 ELO daily
          const purchaseAmount = metadata.purchaseAmount || 0;
          rewardAmount = 10 + (purchaseAmount * 0.01);
          // Cap at 200 ELO per day for purchases
          if (todayCount > 0 && (todayCount * rewardAmount) >= 200) {
            rewardAmount = 0; // Already reached daily cap
          } else if ((todayCount * rule.baseReward) + rewardAmount > 200) {
            rewardAmount = 200 - (todayCount * rule.baseReward); // Adjust to fit under cap
          }
          break;
          
        case 'product_sold':
          // Flat 750 ELO plus tier multiplier
          if (this.userRewardData) {
            const tierConfig = await enhancedEloitsService.getTierConfig(this.userRewardData.tier);
            rewardAmount = 750 * (tierConfig?.multiplier || 1.0);
          }
          break;
      }
    }

    // Create reward action
    const rewardAction: RewardAction = {
      type: action as any,
      amount: rewardAmount,
      description: this.getRewardDescription(action, metadata),
      metadata
    };

    try {
      // Send to backend
      const response = await fetch('/api/rewards/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          amount: rewardAmount,
          metadata
        })
      });

      if (response.ok) {
        // Update local counts
        this.dailyActionCounts.set(action, todayCount + 1);
        
        // Emit WebSocket event for real-time updates
        websocketService.emit('reward_triggered', {
          action,
          amount: rewardAmount,
          metadata
        });

        return rewardAction;
      } else {
        throw new Error('Failed to process reward');
      }
    } catch (error) {
      console.error('Failed to trigger reward:', error);
      return null;
    }
  }

  private getRewardDescription(action: string, metadata: any): string {
    switch (action) {
      case 'like':
        return 'Liked a post';
      case 'comment':
        return 'Left a comment';
      case 'share':
        return 'Shared content';
      case 'upload':
        return 'Uploaded a video';
      case 'watch':
        const minutes = Math.floor((metadata.watchTime || 0) / 60);
        return `Watched video for ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      case 'ad_view':
        return 'Watched an advertisement';
      case 'trade':
        return `Completed crypto trade worth ${metadata.tradeValue || 0}`;
      case 'referral':
        return 'Referred a new user';
      case 'daily_login':
        return `Daily login streak: ${this.userRewardData?.streak || 1} days`;
      case 'milestone':
        return metadata.description || 'Reached milestone';
      case 'purchase_product':
        return `Purchased product worth ${metadata.purchaseAmount || 0}`;
      case 'product_sold':
        return 'Sold a product in the marketplace';
      case 'refer_user':
        return 'Referred a friend to the platform';
      default:
        return 'Earned reward';
    }
  }

  // Convenience methods for common actions
  async likePost(postId: string): Promise<RewardAction | null> {
    return this.triggerReward('like', { postId });
  }

  async commentPost(postId: string, commentId: string): Promise<RewardAction | null> {
    return this.triggerReward('comment', { postId, commentId });
  }

  async sharePost(postId: string): Promise<RewardAction | null> {
    return this.triggerReward('share', { postId });
  }

  async uploadVideo(videoId: string): Promise<RewardAction | null> {
    return this.triggerReward('upload', { videoId });
  }

  async watchVideo(videoId: string, watchTime: number): Promise<RewardAction | null> {
    return this.triggerReward('watch', { videoId, watchTime });
  }

  async viewAd(adId: string, videoId?: string): Promise<RewardAction | null> {
    return this.triggerReward('ad_view', { adId, videoId });
  }

  async completeTrade(tradeId: string, tradeValue: number): Promise<RewardAction | null> {
    return this.triggerReward('trade', { tradeId, tradeValue });
  }

  async referralSignup(referralCode: string, newUserId: string): Promise<RewardAction | null> {
    return this.triggerReward('referral', { referralCode, newUserId });
  }

  async dailyLogin(): Promise<RewardAction | null> {
    return this.triggerReward('daily_login', { timestamp: new Date().toISOString() });
  }

  async milestone(milestoneType: string, description: string, customAmount?: number): Promise<RewardAction | null> {
    return this.triggerReward('milestone', { 
      milestoneType, 
      description, 
      customAmount 
    });
  }

  // Enhanced Eloits methods
  async purchaseProduct(productId: string, purchaseAmount: number): Promise<RewardAction | null> {
    return this.triggerReward('purchase_product', { productId, purchaseAmount });
  }

  async productSold(productId: string): Promise<RewardAction | null> {
    return this.triggerReward('product_sold', { productId });
  }

  async referUser(referralCode: string, newUserId: string): Promise<RewardAction | null> {
    return this.triggerReward('refer_user', { referralCode, newUserId });
  }

  // Getters
  getUserRewardData(): UserRewardData | null {
    return this.userRewardData;
  }

  getRewardRule(action: string): RewardRule | undefined {
    return this.rewardRules.get(action);
  }

  getDailyActionCount(action: string): number {
    return this.dailyActionCounts.get(action) || 0;
  }

  getRemainingDailyActions(action: string): number {
    const rule = this.rewardRules.get(action);
    const currentCount = this.getDailyActionCount(action);
    return rule?.conditions?.dailyLimit ? Math.max(0, rule.conditions.dailyLimit - currentCount) : Infinity;
  }

  // Admin methods (if user has admin privileges)
  async updateRewardRule(action: string, updates: Partial<RewardRule>): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/rewards/rules/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const existingRule = this.rewardRules.get(action);
        if (existingRule) {
          this.rewardRules.set(action, { ...existingRule, ...updates });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update reward rule:', error);
      return false;
    }
  }

  async getRewardAnalytics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<any> {
    try {
      const response = await fetch(`/api/rewards/analytics?timeframe=${timeframe}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch reward analytics:', error);
      return null;
    }
  }
}

// Singleton instance
export const rewardService = new RewardService();

// React hook for using reward service
export function useRewardService() {
  return {
    triggerReward: rewardService.triggerReward.bind(rewardService),
    likePost: rewardService.likePost.bind(rewardService),
    commentPost: rewardService.commentPost.bind(rewardService),
    sharePost: rewardService.sharePost.bind(rewardService),
    uploadVideo: rewardService.uploadVideo.bind(rewardService),
    watchVideo: rewardService.watchVideo.bind(rewardService),
    viewAd: rewardService.viewAd.bind(rewardService),
    completeTrade: rewardService.completeTrade.bind(rewardService),
    referralSignup: rewardService.referralSignup.bind(rewardService),
    dailyLogin: rewardService.dailyLogin.bind(rewardService),
    milestone: rewardService.milestone.bind(rewardService),
    purchaseProduct: rewardService.purchaseProduct.bind(rewardService),
    productSold: rewardService.productSold.bind(rewardService),
    referUser: rewardService.referUser.bind(rewardService),
    getUserRewardData: rewardService.getUserRewardData.bind(rewardService),
    getRemainingDailyActions: rewardService.getRemainingDailyActions.bind(rewardService)
  };
}