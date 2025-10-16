// @ts-nocheck
import { adSettings } from "../../config/adSettings";

interface AdViewRecord {
  userId: string;
  deviceId: string;
  adId: string;
  adType: 'in_video' | 'interstitial' | 'native' | 'sponsored';
  timestamp: Date;
  rewardEarned: number;
}

interface UserAdStats {
  userId: string;
  dailyAdViews: number;
  totalRewardsEarned: number;
  lastRewardDate: Date;
}

class AdRewardService {
  private adViews: AdViewRecord[] = [];
  private userStats: Map<string, UserAdStats> = new Map();

  // Placeholder – Replace with real database operations
  private async saveAdView(record: AdViewRecord): Promise<void> {
    // In production, this would save to your database
    this.adViews.push(record);
    console.log('Ad view recorded:', record);
  }

  private async getUserStats(userId: string): Promise<UserAdStats> {
    if (!this.userStats.has(userId)) {
      // In production, this would fetch from your database
      this.userStats.set(userId, {
        userId,
        dailyAdViews: 0,
        totalRewardsEarned: 0,
        lastRewardDate: new Date()
      });
    }
    return this.userStats.get(userId)!;
  }

  private async updateUserStats(userId: string, stats: UserAdStats): Promise<void> {
    // In production, this would update your database
    this.userStats.set(userId, stats);
    console.log('User stats updated:', stats);
  }

  private generateDeviceId(): string {
    // In production, use a more robust device fingerprinting solution
    return navigator.userAgent + navigator.platform + screen.width + screen.height;
  }

  private isNewDay(lastDate: Date): boolean {
    const now = new Date();
    const last = new Date(lastDate);
    return now.toDateString() !== last.toDateString();
  }

  private hasExceededDailyLimit(userId: string, currentViews: number): boolean {
    return currentViews >= adSettings.maxDailyAdRewards;
  }

  private isValidAdView(userId: string, deviceId: string, adId: string): boolean {
    // Check if this specific ad has already been viewed by this user/device today
    const today = new Date().toDateString();
    const existingView = this.adViews.find(view => 
      view.userId === userId &&
      view.deviceId === deviceId &&
      view.adId === adId &&
      view.timestamp.toDateString() === today
    );
    
    return !existingView;
  }

  async trackAdView(
    userId: string,
    adId: string,
    adType: 'in_video' | 'interstitial' | 'native' | 'sponsored',
    watchedToCompletion: boolean = false
  ): Promise<{ rewardEarned: number; message: string }> {
    try {
      // Only reward for ads watched to completion
      if (!watchedToCompletion) {
        return {
          rewardEarned: 0,
          message: 'Ad must be watched to completion to earn rewards'
        };
      }

      const deviceId = this.generateDeviceId();
      const userStats = await this.getUserStats(userId);

      // Reset daily counter if it's a new day
      if (this.isNewDay(userStats.lastRewardDate)) {
        userStats.dailyAdViews = 0;
      }

      // Check daily limit
      if (this.hasExceededDailyLimit(userId, userStats.dailyAdViews)) {
        return {
          rewardEarned: 0,
          message: `Daily ad limit reached (${adSettings.maxDailyAdRewards} ads per day)`
        };
      }

      // Check if this specific ad has already been viewed
      if (!this.isValidAdView(userId, deviceId, adId)) {
        return {
          rewardEarned: 0,
          message: 'This ad has already been viewed today'
        };
      }

      // Calculate reward (could vary by ad type in the future)
      const rewardAmount = adSettings.adRewardPoints;

      // Record the ad view
      const adViewRecord: AdViewRecord = {
        userId,
        deviceId,
        adId,
        adType,
        timestamp: new Date(),
        rewardEarned: rewardAmount
      };

      await this.saveAdView(adViewRecord);

      // Update user stats
      userStats.dailyAdViews += 1;
      userStats.totalRewardsEarned += rewardAmount;
      userStats.lastRewardDate = new Date();
      await this.updateUserStats(userId, userStats);

      // Add Eloity Points to user account (placeholder)
      await this.addEloity Points(userId, rewardAmount);

      return {
        rewardEarned: rewardAmount,
        message: `+${rewardAmount} Eloity Points earned!`
      };

    } catch (error) {
      console.error('Error tracking ad view:', error);
      return {
        rewardEarned: 0,
        message: 'Failed to process ad reward'
      };
    }
  }

  private async addEloity Points(userId: string, amount: number): Promise<void> {
    // Placeholder – Replace with real Eloity Points service integration
    try {
      // In production, this would call your Eloity Points service
      console.log(`Adding ${amount} Eloity Points to user ${userId}`);
      
      // Example API call:
      // await fetch('/api/eloits/add', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, amount, source: 'ad_reward' })
      // });
      
    } catch (error) {
      console.error('Failed to add Eloity Points:', error);
      throw error;
    }
  }

  async getUserAdStats(userId: string): Promise<UserAdStats> {
    return await this.getUserStats(userId);
  }

  async getRemainingDailyAds(userId: string): Promise<number> {
    const stats = await this.getUserStats(userId);
    
    // Reset if new day
    if (this.isNewDay(stats.lastRewardDate)) {
      return adSettings.maxDailyAdRewards;
    }
    
    return Math.max(0, adSettings.maxDailyAdRewards - stats.dailyAdViews);
  }

  async getAdHistory(userId: string, limit: number = 50): Promise<AdViewRecord[]> {
    // Placeholder – Replace with real database query
    return this.adViews
      .filter(view => view.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Method to generate unique ad IDs
  generateAdId(adType: string, position?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${adType}_${position || 'default'}_${timestamp}_${random}`;
  }

  // Method to check if ads are enabled
  areAdsEnabled(): boolean {
    return adSettings.enableAds && adSettings.adsEnabled;
  }

  // Method to get ad configuration
  getAdConfig() {
    return {
      rewardPoints: adSettings.adRewardPoints,
      maxDailyRewards: adSettings.maxDailyAdRewards,
      inVideoDelay: adSettings.inVideoAdDelay,
      frequencies: {
        feedAd: adSettings.feedAdFrequency,
        feedSponsored: adSettings.feedSponsoredFrequency,
        videoInterstitial: adSettings.interstitialFrequency,
        storyAd: adSettings.storyAdFrequency,
        freelanceAd: adSettings.freelanceAdFrequency
      }
    };
  }
}

// Export singleton instance
export const adRewardService = new AdRewardService();
export default adRewardService;
