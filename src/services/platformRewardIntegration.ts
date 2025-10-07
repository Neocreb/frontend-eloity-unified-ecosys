// @ts-nocheck
import { ActivityRewardService } from "./activityRewardService";
import { ReferralService } from "./referralService";

export class PlatformRewardIntegration {
  // =============================================================================
  // MARKETPLACE INTEGRATION
  // =============================================================================

  static async trackMarketplacePurchase(params: {
    userId: string;
    productId: string;
    sellerId: string;
    amount: number;
    category: string;
  }) {
    try {
      // Track purchase reward for buyer
      const buyerReward = await ActivityRewardService.logActivity({
        userId: params.userId,
        actionType: "purchase_product",
        targetId: params.productId,
        targetType: "product",
        value: params.amount,
        metadata: {
          sellerId: params.sellerId,
          category: params.category,
          purchaseAmount: params.amount,
        },
      });

      // Track sale reward for seller
      const sellerReward = await ActivityRewardService.logActivity({
        userId: params.sellerId,
        actionType: "sell_product",
        targetId: params.productId,
        targetType: "product",
        value: params.amount,
        metadata: {
          buyerId: params.userId,
          category: params.category,
          saleAmount: params.amount,
        },
      });

      return { buyerReward, sellerReward };
    } catch (error) {
      console.error("Error tracking marketplace purchase:", error);
      return null;
    }
  }

  static async trackProductListing(params: {
    userId: string;
    productId: string;
    category: string;
    price: number;
  }) {
    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: "list_product",
      targetId: params.productId,
      targetType: "product",
      value: params.price,
      metadata: {
        category: params.category,
        listingPrice: params.price,
      },
    });
  }

  // =============================================================================
  // FREELANCE INTEGRATION
  // =============================================================================

  static async trackJobPosting(params: {
    userId: string;
    jobId: string;
    budget: number;
    category: string;
  }) {
    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: "post_job",
      targetId: params.jobId,
      targetType: "job",
      value: params.budget,
      metadata: {
        category: params.category,
        budget: params.budget,
      },
    });
  }

  static async trackJobBid(params: {
    userId: string;
    jobId: string;
    bidAmount: number;
    clientId: string;
  }) {
    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: "bid_job",
      targetId: params.jobId,
      targetType: "job",
      value: params.bidAmount,
      metadata: {
        clientId: params.clientId,
        bidAmount: params.bidAmount,
      },
    });
  }

  static async trackJobCompletion(params: {
    freelancerId: string;
    clientId: string;
    jobId: string;
    paymentAmount: number;
    rating: number;
  }) {
    try {
      // Reward freelancer for completion
      const freelancerReward = await ActivityRewardService.logActivity({
        userId: params.freelancerId,
        actionType: "complete_freelance_job",
        targetId: params.jobId,
        targetType: "job",
        value: params.paymentAmount,
        metadata: {
          clientId: params.clientId,
          paymentAmount: params.paymentAmount,
          rating: params.rating,
        },
      });

      // Reward client for providing work
      const clientReward = await ActivityRewardService.logActivity({
        userId: params.clientId,
        actionType: "hire_freelancer",
        targetId: params.jobId,
        targetType: "job",
        value: params.paymentAmount,
        metadata: {
          freelancerId: params.freelancerId,
          paymentAmount: params.paymentAmount,
          rating: params.rating,
        },
      });

      return { freelancerReward, clientReward };
    } catch (error) {
      console.error("Error tracking job completion:", error);
      return null;
    }
  }

  // =============================================================================
  // CRYPTO TRADING INTEGRATION
  // =============================================================================

  static async trackCryptoTrade(params: {
    userId: string;
    tradeId: string;
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    tradeType: "buy" | "sell" | "convert";
  }) {
    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: "crypto_trade",
      targetId: params.tradeId,
      targetType: "trade",
      value: params.amount,
      metadata: {
        fromCurrency: params.fromCurrency,
        toCurrency: params.toCurrency,
        tradeType: params.tradeType,
        tradeAmount: params.amount,
      },
    });
  }

  static async trackP2PTrade(params: {
    buyerId: string;
    sellerId: string;
    tradeId: string;
    currency: string;
    amount: number;
  }) {
    try {
      const buyerReward = await ActivityRewardService.logActivity({
        userId: params.buyerId,
        actionType: "p2p_trade",
        targetId: params.tradeId,
        targetType: "p2p_trade",
        value: params.amount,
        metadata: {
          role: "buyer",
          sellerId: params.sellerId,
          currency: params.currency,
          amount: params.amount,
        },
      });

      const sellerReward = await ActivityRewardService.logActivity({
        userId: params.sellerId,
        actionType: "p2p_trade",
        targetId: params.tradeId,
        targetType: "p2p_trade",
        value: params.amount,
        metadata: {
          role: "seller",
          buyerId: params.buyerId,
          currency: params.currency,
          amount: params.amount,
        },
      });

      return { buyerReward, sellerReward };
    } catch (error) {
      console.error("Error tracking P2P trade:", error);
      return null;
    }
  }

  // =============================================================================
  // VIDEO/CONTENT INTEGRATION
  // =============================================================================

  static async trackVideoCreation(params: {
    userId: string;
    videoId: string;
    duration: number;
    category: string;
    isLive?: boolean;
  }) {
    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: params.isLive ? "create_livestream" : "create_video",
      targetId: params.videoId,
      targetType: "video",
      metadata: {
        duration: params.duration,
        category: params.category,
        contentType: params.isLive ? "livestream" : "video",
      },
    });
  }

  static async trackVideoView(params: {
    viewerId: string;
    creatorId: string;
    videoId: string;
    watchTime: number;
    totalDuration: number;
  }) {
    const watchPercentage = (params.watchTime / params.totalDuration) * 100;

    try {
      // Reward viewer for watching (if significant watch time)
      let viewerReward = null;
      if (watchPercentage > 50) {
        viewerReward = await ActivityRewardService.logActivity({
          userId: params.viewerId,
          actionType: "watch_video",
          targetId: params.videoId,
          targetType: "video",
          metadata: {
            creatorId: params.creatorId,
            watchTime: params.watchTime,
            watchPercentage: watchPercentage,
          },
        });
      }

      // Reward creator for receiving view
      const creatorReward = await ActivityRewardService.logActivity({
        userId: params.creatorId,
        actionType: "receive_view",
        targetId: params.videoId,
        targetType: "video",
        value: watchPercentage,
        metadata: {
          viewerId: params.viewerId,
          watchTime: params.watchTime,
          watchPercentage: watchPercentage,
        },
      });

      return { viewerReward, creatorReward };
    } catch (error) {
      console.error("Error tracking video view:", error);
      return null;
    }
  }

  // =============================================================================
  // SOCIAL FEATURES INTEGRATION
  // =============================================================================

  static async trackSubscription(params: {
    subscriberId: string;
    creatorId: string;
    subscriptionType: "free" | "paid";
    amount?: number;
  }) {
    try {
      // Reward subscriber for subscribing
      const subscriberReward = await ActivityRewardService.logActivity({
        userId: params.subscriberId,
        actionType: "subscribe_creator",
        targetId: params.creatorId,
        targetType: "user",
        value: params.amount || 0,
        metadata: {
          subscriptionType: params.subscriptionType,
          creatorId: params.creatorId,
          amount: params.amount,
        },
      });

      // Reward creator for gaining subscriber
      const creatorReward = await ActivityRewardService.logActivity({
        userId: params.creatorId,
        actionType: "gain_subscriber",
        targetId: params.subscriberId,
        targetType: "user",
        value: params.amount || 0,
        metadata: {
          subscriptionType: params.subscriptionType,
          subscriberId: params.subscriberId,
          amount: params.amount,
        },
      });

      return { subscriberReward, creatorReward };
    } catch (error) {
      console.error("Error tracking subscription:", error);
      return null;
    }
  }

  static async trackTip(params: {
    tipperId: string;
    recipientId: string;
    targetId: string;
    targetType: string;
    amount: number;
    currency: string;
  }) {
    try {
      // Reward tipper for being generous
      const tipperReward = await ActivityRewardService.logActivity({
        userId: params.tipperId,
        actionType: "give_tip",
        targetId: params.targetId,
        targetType: params.targetType,
        value: params.amount,
        metadata: {
          recipientId: params.recipientId,
          amount: params.amount,
          currency: params.currency,
        },
      });

      // Reward recipient for receiving tip
      const recipientReward = await ActivityRewardService.logActivity({
        userId: params.recipientId,
        actionType: "receive_tip",
        targetId: params.targetId,
        targetType: params.targetType,
        value: params.amount,
        metadata: {
          tipperId: params.tipperId,
          amount: params.amount,
          currency: params.currency,
        },
      });

      return { tipperReward, recipientReward };
    } catch (error) {
      console.error("Error tracking tip:", error);
      return null;
    }
  }

  // =============================================================================
  // COMMUNITY FEATURES INTEGRATION
  // =============================================================================

  static async trackCommunityJoin(params: {
    userId: string;
    communityId: string;
    communityType: string;
  }) {
    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: "join_community",
      targetId: params.communityId,
      targetType: "community",
      metadata: {
        communityType: params.communityType,
      },
    });
  }

  static async trackEventParticipation(params: {
    userId: string;
    eventId: string;
    eventType: string;
    duration?: number;
  }) {
    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: "participate_event",
      targetId: params.eventId,
      targetType: "event",
      metadata: {
        eventType: params.eventType,
        duration: params.duration,
      },
    });
  }

  // =============================================================================
  // ONBOARDING & PROFILE INTEGRATION
  // =============================================================================

  static async trackProfileCompletion(params: {
    userId: string;
    completionPercentage: number;
    sectionsCompleted: string[];
  }) {
    if (params.completionPercentage >= 100) {
      return ActivityRewardService.logActivity({
        userId: params.userId,
        actionType: "complete_profile",
        metadata: {
          completionPercentage: params.completionPercentage,
          sectionsCompleted: params.sectionsCompleted,
        },
      });
    }
    return null;
  }

  static async trackDailyLogin(userId: string) {
    return ActivityRewardService.logDailyLogin(userId);
  }

  // =============================================================================
  // BATCH TRACKING FOR PERFORMANCE
  // =============================================================================

  static async trackBatchActivities(
    activities: Array<{
      userId: string;
      actionType: string;
      targetId?: string;
      targetType?: string;
      value?: number;
      metadata?: any;
    }>,
  ) {
    try {
      const results = await Promise.all(
        activities.map((activity) =>
          ActivityRewardService.logActivity(activity),
        ),
      );
      return results;
    } catch (error) {
      console.error("Error tracking batch activities:", error);
      return [];
    }
  }

  // =============================================================================
  // EDUCATIONAL CONTENT INTEGRATION
  // =============================================================================

  static async trackEducationalProgress(params: {
    userId: string;
    contentId: string;
    contentType: "course" | "lesson" | "article" | "article_quiz" | "course_quiz";
    actionType: "reading_completion" | "quiz_completion" | "perfect_score" | "course_completion" | "lesson_completion";
    pointsEarned: number;
    metadata?: any;
  }) {
    const actionTypeMap = {
      reading_completion: "complete_lesson",
      quiz_completion: "complete_lesson",
      perfect_score: "achieve_milestone",
      course_completion: "complete_course",
      lesson_completion: "complete_lesson"
    };

    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: actionTypeMap[params.actionType] || "complete_lesson",
      targetId: params.contentId,
      targetType: params.contentType,
      value: params.pointsEarned,
      metadata: {
        educationalAction: params.actionType,
        pointsEarned: params.pointsEarned,
        contentType: params.contentType,
        ...params.metadata,
      },
    });
  }

  static async trackCourseEnrollment(params: {
    userId: string;
    courseId: string;
    courseName: string;
    difficulty: string;
  }) {
    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: "enroll_course",
      targetId: params.courseId,
      targetType: "course",
      metadata: {
        courseName: params.courseName,
        difficulty: params.difficulty,
        enrollmentDate: new Date().toISOString(),
      },
    });
  }

  static async trackLessonProgress(params: {
    userId: string;
    courseId: string;
    lessonId: string;
    lessonType: "video" | "text" | "quiz" | "interactive";
    timeSpent: number;
    completed: boolean;
    pointsEarned?: number;
  }) {
    if (params.completed) {
      return ActivityRewardService.logActivity({
        userId: params.userId,
        actionType: "complete_lesson",
        targetId: params.lessonId,
        targetType: "lesson",
        value: params.pointsEarned || 0,
        metadata: {
          courseId: params.courseId,
          lessonType: params.lessonType,
          timeSpent: params.timeSpent,
          pointsEarned: params.pointsEarned || 0,
        },
      });
    }
    return null;
  }

  static async trackQuizAttempt(params: {
    userId: string;
    contentId: string;
    contentType: "course" | "article";
    score: number;
    passingScore: number;
    timeSpent: number;
    pointsEarned?: number;
  }) {
    const passed = params.score >= params.passingScore;
    const isPerfectScore = params.score === 100;

    const results = [];

    if (passed) {
      // Quiz completion reward
      results.push(
        ActivityRewardService.logActivity({
          userId: params.userId,
          actionType: "complete_lesson",
          targetId: params.contentId,
          targetType: `${params.contentType}_quiz`,
          value: params.pointsEarned || 0,
          metadata: {
            quizScore: params.score,
            passingScore: params.passingScore,
            timeSpent: params.timeSpent,
            passed: true,
            pointsEarned: params.pointsEarned || 0,
          },
        })
      );

      // Perfect score bonus
      if (isPerfectScore) {
        results.push(
          ActivityRewardService.logActivity({
            userId: params.userId,
            actionType: "achieve_milestone",
            targetId: params.contentId,
            targetType: `${params.contentType}_quiz`,
            metadata: {
              milestone: "perfect_quiz_score",
              quizScore: params.score,
              contentType: params.contentType,
            },
          })
        );
      }
    }

    return Promise.all(results);
  }

  static async trackLearningStreak(params: {
    userId: string;
    streakDays: number;
    streakType: "daily_learning" | "quiz_streak" | "course_completion_streak";
  }) {
    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: "achieve_milestone",
      targetType: "learning_streak",
      metadata: {
        milestone: params.streakType,
        streakDays: params.streakDays,
        description: `${params.streakDays} day ${params.streakType.replace('_', ' ')} streak`,
      },
    });
  }

  static async trackCertificateEarned(params: {
    userId: string;
    courseId: string;
    courseName: string;
    difficulty: string;
    finalScore?: number;
  }) {
    return ActivityRewardService.logActivity({
      userId: params.userId,
      actionType: "achieve_milestone",
      targetId: params.courseId,
      targetType: "course_certificate",
      metadata: {
        milestone: "course_certificate",
        courseName: params.courseName,
        difficulty: params.difficulty,
        finalScore: params.finalScore,
        certificateDate: new Date().toISOString(),
      },
    });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  static async getModuleEarnings(
    userId: string,
    module: string,
    timeRange: string = "7d",
  ) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch(
        `/api/creator/module-earnings?module=${module}&period=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) return null;

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching module earnings:", error);
      return null;
    }
  }

  static async getUserActivitySummary(userId: string) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await fetch(`/api/creator/activity-summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching activity summary:", error);
      return null;
    }
  }

  // Integration helpers for specific components
  static createMarketplaceHooks() {
    return {
      onPurchase: this.trackMarketplacePurchase.bind(this),
      onListing: this.trackProductListing.bind(this),
    };
  }

  static createFreelanceHooks() {
    return {
      onJobPost: this.trackJobPosting.bind(this),
      onJobBid: this.trackJobBid.bind(this),
      onJobComplete: this.trackJobCompletion.bind(this),
    };
  }

  static createCryptoHooks() {
    return {
      onTrade: this.trackCryptoTrade.bind(this),
      onP2PTrade: this.trackP2PTrade.bind(this),
    };
  }

  static createVideoHooks() {
    return {
      onCreate: this.trackVideoCreation.bind(this),
      onView: this.trackVideoView.bind(this),
    };
  }

  static createSocialHooks() {
    return {
      onSubscribe: this.trackSubscription.bind(this),
      onTip: this.trackTip.bind(this),
    };
  }
}
