// @ts-nocheck
import { ActivityRewardService, ActivityRewardResponse } from './activityRewardService';
import { useNotification } from '@/hooks/use-notification';

export interface ActivityContext {
  source?: string;
  timeSpent?: number;
  metadata?: Record<string, any>;
}

export class UnifiedActivityService {
  
  // Social Media Activities
  static async trackLike(userId: string, postId: string, timeSpent?: number): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logPostLiked(userId, postId, timeSpent);
  }

  static async trackComment(userId: string, postId: string, commentLength?: number): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logComment(userId, postId, commentLength);
  }

  static async trackShare(userId: string, postId: string, shareType: string): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logShare(userId, postId, shareType);
  }

  static async trackPost(userId: string, postId: string, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logPostCreated(userId, postId, metadata);
  }

  // Marketplace Activities
  static async trackProductPurchase(userId: string, productId: string, amount: number, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    // Only award if payment is completed or this is a payment completion call
    if (!metadata?.paymentCompleted && !metadata?.paymentStatus) {
      return {
        success: false,
        status: "pending_payment",
        eloits: 0,
        walletBonus: 0,
        newTrustScore: 0,
        riskScore: 0,
        message: "Reward pending payment completion"
      };
    }

    return ActivityRewardService.logPurchase(userId, productId, amount, metadata);
  }

  // New method for payment completion tracking
  static async trackPaymentCompletion(
    userId: string,
    productId: string,
    amount: number,
    paymentMethod: string,
    transactionId: string
  ): Promise<ActivityRewardResponse> {
    return this.trackProductPurchase(userId, productId, amount, {
      paymentCompleted: true,
      paymentStatus: 'completed',
      paymentMethod,
      transactionId,
      timestamp: new Date().toISOString()
    });
  }

  static async trackProductListing(userId: string, productId: string, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'list_product',
      targetId: productId,
      targetType: 'product',
      metadata
    });
  }

  // Freelance Activities
  static async trackJobApplication(userId: string, jobId: string, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    // Enhanced with quality analysis for proposals
    const enhancedMetadata = {
      ...metadata,
      proposalLength: metadata?.coverLetter?.length || 0,
      hasPortfolio: !!metadata?.portfolioItems,
      expectedSalary: metadata?.expectedSalary,
      deliveryTime: metadata?.deliveryTime,
      timeSpent: metadata?.timeSpent || 0
    };

    return ActivityRewardService.logActivity({
      userId,
      actionType: 'bid_job',
      targetId: jobId,
      targetType: 'job',
      metadata: enhancedMetadata
    });
  }

  static async trackFreelancerHire(userId: string, freelancerId: string, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'hire_freelancer',
      targetId: freelancerId,
      targetType: 'freelancer',
      metadata
    });
  }

  static async trackMilestoneComplete(
    userId: string,
    projectId: string,
    milestoneValue: number,
    metadata?: Record<string, any>
  ): Promise<ActivityRewardResponse> {
    // Only award if milestone is paid/approved
    if (!metadata?.milestoneCompleted || !metadata?.paymentReleased) {
      return {
        success: false,
        status: "pending_approval",
        eloits: 0,
        walletBonus: 0,
        newTrustScore: 0,
        riskScore: 0,
        message: "Reward pending milestone approval and payment"
      };
    }

    return ActivityRewardService.logActivity({
      userId,
      actionType: 'complete_freelance_milestone',
      targetId: projectId,
      targetType: 'project',
      value: milestoneValue,
      metadata
    });
  }

  // New enhanced freelance tracking methods
  static async trackMilestoneCompletion(
    userId: string,
    projectId: string,
    milestoneValue: number,
    milestoneDetails: {
      milestoneNumber: number;
      clientApproval: boolean;
      paymentReleased: boolean;
      qualityRating?: number;
      deliveryTime: number;
      originalEstimate: number;
    }
  ): Promise<ActivityRewardResponse> {
    return this.trackMilestoneComplete(userId, projectId, milestoneValue, {
      milestoneCompleted: true,
      paymentReleased: milestoneDetails.paymentReleased,
      clientApproval: milestoneDetails.clientApproval,
      ...milestoneDetails
    });
  }

  static async trackProjectCompletion(
    userId: string,
    projectId: string,
    projectValue: number,
    completionDetails: {
      clientRating: number;
      onTimeDelivery: boolean;
      budgetAdherence: boolean;
      clientTestimonial?: string;
      bonusPayment?: number;
    }
  ): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'freelance_project_completion',
      targetId: projectId,
      targetType: 'project',
      value: projectValue,
      metadata: {
        projectCompleted: true,
        finalPaymentReceived: true,
        ...completionDetails
      }
    });
  }

  // Community Activities
  static async trackEventJoin(userId: string, eventId: string, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'join_community',
      targetId: eventId,
      targetType: 'event',
      metadata
    });
  }

  static async trackVideoWatch(userId: string, videoId: string, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'watch_video',
      targetId: videoId,
      targetType: 'video',
      metadata
    });
  }

  static async trackCreatorSubscribe(userId: string, creatorId: string, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'subscribe_creator',
      targetId: creatorId,
      targetType: 'creator',
      metadata
    });
  }

  static async trackCreatorTip(userId: string, creatorId: string, amount: number, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'tip_creator',
      targetId: creatorId,
      targetType: 'creator',
      value: amount,
      metadata
    });
  }

  // Trading Activities
  static async trackCryptoTrade(
    userId: string,
    tradeId: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<ActivityRewardResponse> {
    // Only award if trade is completed and confirmed
    if (!metadata?.tradeCompleted || !metadata?.paymentConfirmed || !metadata?.cryptoReleased) {
      return {
        success: false,
        status: "pending_completion",
        eloits: 0,
        walletBonus: 0,
        newTrustScore: 0,
        riskScore: 0,
        message: "Reward pending trade completion and confirmation"
      };
    }

    return ActivityRewardService.logActivity({
      userId,
      actionType: 'p2p_trade',
      targetId: tradeId,
      targetType: 'trade',
      value: amount,
      metadata
    });
  }

  // Enhanced P2P trading methods
  static async trackP2PTradeCompletion(
    userId: string,
    tradeId: string,
    tradeAmount: number,
    tradeDetails: {
      cryptoType: string;
      fiatAmount: number;
      exchangeRate: number;
      paymentMethod: string;
      tradeType: 'buy' | 'sell';
      counterpartyId: string;
      completionTime: number;
      disputeResolved?: boolean;
    }
  ): Promise<ActivityRewardResponse> {
    return this.trackCryptoTrade(userId, tradeId, tradeAmount, {
      tradeCompleted: true,
      paymentConfirmed: true,
      cryptoReleased: true,
      ...tradeDetails
    });
  }

  static async trackP2POfferCreation(
    userId: string,
    offerId: string,
    metadata: {
      cryptoType: string;
      amount: number;
      rate: number;
      paymentMethods: string[];
      offerType: 'buy' | 'sell';
      minOrderLimit: number;
      maxOrderLimit: number;
    }
  ): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'p2p_trade_create_offer',
      targetId: offerId,
      targetType: 'offer',
      metadata
    });
  }

  static async trackCryptoConversion(
    userId: string,
    conversionId: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<ActivityRewardResponse> {
    const enhancedMetadata = {
      ...metadata,
      fromCurrency: metadata?.fromCurrency || 'UNKNOWN',
      toCurrency: metadata?.toCurrency || 'UNKNOWN',
      exchangeRate: metadata?.exchangeRate || 0,
      fees: metadata?.fees || 0
    };

    return ActivityRewardService.logActivity({
      userId,
      actionType: 'convert_crypto',
      targetId: conversionId,
      targetType: 'conversion',
      value: amount,
      metadata: enhancedMetadata
    });
  }

  static async trackCryptoDeposit(
    userId: string,
    depositId: string,
    amount: number,
    metadata: {
      cryptoType: string;
      network: string;
      transactionHash: string;
      confirmations: number;
    }
  ): Promise<ActivityRewardResponse> {
    // Only award after sufficient confirmations
    if (!metadata.confirmations || metadata.confirmations < 3) {
      return {
        success: false,
        status: "pending_confirmations",
        eloits: 0,
        walletBonus: 0,
        newTrustScore: 0,
        riskScore: 0,
        message: "Reward pending blockchain confirmations"
      };
    }

    return ActivityRewardService.logActivity({
      userId,
      actionType: 'crypto_deposit',
      targetId: depositId,
      targetType: 'deposit',
      value: amount,
      metadata
    });
  }

  static async trackCryptoWithdrawal(
    userId: string,
    withdrawalId: string,
    amount: number,
    metadata: {
      cryptoType: string;
      network: string;
      destinationAddress: string;
      transactionHash?: string;
      fees: number;
    }
  ): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'crypto_withdrawal',
      targetId: withdrawalId,
      targetType: 'withdrawal',
      value: amount,
      metadata
    });
  }

  // Referral Activities
  static async trackReferral(userId: string, referralId: string, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'refer_user',
      targetId: referralId,
      targetType: 'referral',
      metadata
    });
  }

  // Daily Activities
  static async trackDailyLogin(userId: string): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logDailyLogin(userId);
  }

  static async trackProfileComplete(userId: string, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'complete_profile',
      targetId: userId,
      targetType: 'profile',
      metadata
    });
  }

  // Challenge Activities
  static async trackChallengeParticipation(userId: string, challengeId: string, metadata?: Record<string, any>): Promise<ActivityRewardResponse> {
    return ActivityRewardService.logActivity({
      userId,
      actionType: 'participate_challenge',
      targetId: challengeId,
      targetType: 'challenge',
      metadata
    });
  }

  // Utility method to show reward notifications
  static showRewardNotification(reward: ActivityRewardResponse, customMessage?: string) {
    if (reward.success && reward.eloits > 0) {
      // This would integrate with your notification system
      console.log(`🎉 +${reward.eloits} Eloits earned! ${customMessage || reward.message}`);
      
      // You can integrate with react-hot-toast or your existing notification system
      // notification.success(`🎉 +${reward.eloits} Eloits earned!`, {
      //   description: customMessage || reward.message
      // });
    }
  }

  // Bulk activity tracking for complex actions
  static async trackMultipleActivities(
    activities: Array<{
      userId: string;
      actionType: string;
      targetId?: string;
      targetType?: string;
      value?: number;
      metadata?: Record<string, any>;
    }>
  ): Promise<ActivityRewardResponse[]> {
    const results = await Promise.allSettled(
      activities.map(activity => ActivityRewardService.logActivity(activity))
    );

    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            success: false,
            status: 'error',
            eloits: 0,
            walletBonus: 0,
            newTrustScore: 0,
            riskScore: 0,
            message: 'Failed to track activity'
          }
    );
  }

  // Get activity summary for user
  static async getActivitySummary(userId: string, period: string = '7d') {
    return ActivityRewardService.getRewardSummary(period);
  }

  // Get activity history for user
  static async getActivityHistory(userId: string, page: number = 1, limit: number = 20) {
    return ActivityRewardService.getRewardHistory(page, limit);
  }
}

// Export commonly used functions for backward compatibility
export const {
  trackLike,
  trackComment,
  trackShare,
  trackPost,
  trackProductPurchase,
  trackJobApplication,
  trackFreelancerHire,
  trackEventJoin,
  trackVideoWatch,
  trackDailyLogin,
  showRewardNotification
} = UnifiedActivityService;
