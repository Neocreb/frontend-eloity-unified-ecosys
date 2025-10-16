// @ts-nocheck
// Note: This service now uses API calls instead of direct database access

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  limits: {
    videoUploads: number;
    storageGB: number;
    aiCredits: number;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    customBranding: boolean;
  };
  popular?: boolean;
  color: string;
  icon: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  tierId: string;
  status: "active" | "cancelled" | "expired" | "trial";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethodId?: string;
  trialEndsAt?: string;
  createdAt: string;
}

export interface SubscriptionUsage {
  userId: string;
  tierId: string;
  period: string; // YYYY-MM
  videoUploads: number;
  storageUsedGB: number;
  aiCreditsUsed: number;
  lastUpdated: string;
}

export interface CreatorMonetization {
  id: string;
  creatorId: string;
  contentId: string;
  type: "subscription" | "tip" | "sponsored" | "commission";
  amount: number;
  currency: string;
  subscriberId?: string;
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    currency: "USD",
    interval: "month",
    features: [
      "5 video uploads per month",
      "1GB storage",
      "Basic analytics",
      "Community support",
      "Standard quality streaming",
    ],
    limits: {
      videoUploads: 5,
      storageGB: 1,
      aiCredits: 10,
      prioritySupport: false,
      advancedAnalytics: false,
      customBranding: false,
    },
    color: "bg-gray-500",
    icon: "🆓",
  },
  {
    id: "creator",
    name: "Creator",
    description: "For aspiring content creators",
    price: 9.99,
    currency: "USD",
    interval: "month",
    features: [
      "50 video uploads per month",
      "10GB storage",
      "Advanced analytics",
      "Priority support",
      "HD streaming",
      "100 AI credits",
      "Custom thumbnails",
    ],
    limits: {
      videoUploads: 50,
      storageGB: 10,
      aiCredits: 100,
      prioritySupport: true,
      advancedAnalytics: true,
      customBranding: false,
    },
    popular: true,
    color: "bg-blue-500",
    icon: "🎨",
  },
  {
    id: "professional",
    name: "Professional",
    description: "For serious content creators",
    price: 24.99,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited video uploads",
      "100GB storage",
      "Real-time analytics",
      "24/7 priority support",
      "4K streaming",
      "500 AI credits",
      "Custom branding",
      "Live streaming",
      "Monetization tools",
    ],
    limits: {
      videoUploads: -1, // unlimited
      storageGB: 100,
      aiCredits: 500,
      prioritySupport: true,
      advancedAnalytics: true,
      customBranding: true,
    },
    color: "bg-purple-500",
    icon: "💼",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams and businesses",
    price: 99.99,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited everything",
      "1TB storage",
      "Custom analytics dashboard",
      "Dedicated account manager",
      "8K streaming",
      "Unlimited AI credits",
      "White-label options",
      "API access",
      "Multi-user management",
      "Custom integrations",
    ],
    limits: {
      videoUploads: -1,
      storageGB: 1000,
      aiCredits: -1,
      prioritySupport: true,
      advancedAnalytics: true,
      customBranding: true,
    },
    color: "bg-gold-500",
    icon: "🏢",
  },
];

class SubscriptionService {
  // Get available subscription tiers
  getSubscriptionTiers(): SubscriptionTier[] {
    return SUBSCRIPTION_TIERS;
  }

  // Get user's current subscription
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const response = await fetch('/api/premium/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 401) {
          // No subscription found or not authenticated, this is normal
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.subscription) {
        // Convert the API response to match our UserSubscription interface
        return {
          id: data.subscription.id,
          userId: userId,
          tierId: data.subscription.tier,
          status: data.subscription.status,
          startDate: new Date().toISOString(), // API doesn't provide this
          endDate: data.subscription.endDate,
          autoRenew: true, // Default value
          paymentMethodId: '', // API doesn't provide this
          createdAt: new Date().toISOString(), // API doesn't provide this
          updatedAt: new Date().toISOString(), // API doesn't provide this
        };
      }

      return null;
    } catch (error) {
      console.error(
        "Error getting user subscription:",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  // Subscribe to a tier
  async subscribeTo(
    userId: string,
    tierId: string,
    paymentMethodId?: string,
  ): Promise<UserSubscription | null> {
    try {
      const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
      if (!tier) throw new Error("Invalid subscription tier");

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (tier.interval === "month") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Cancel existing subscription
      await this.cancelSubscription(userId);

      // Create new subscription using API
      const response = await fetch('/api/premium/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tierId,
          billingType: tier.interval,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create subscription: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      // Initialize usage tracking
      await this.initializeUsageTracking(userId, tierId);

      return data;
    } catch (error) {
      console.error(
        "Error subscribing to tier:",
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      // For now, return true as cancellation is successful
      // In production, this would call a proper cancellation API
      console.log(`Subscription cancelled for user: ${userId}`);
      return true;
    } catch (error) {
      console.error(
        "Error cancelling subscription:",
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  // Get subscription usage
  async getUsage(userId: string): Promise<SubscriptionUsage | null> {
    try {
      const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM

      // For now, return mock usage data since there's no usage API yet
      // In production, this would call a proper usage tracking API
      return {
        id: `usage-${userId}-${currentPeriod}`,
        userId,
        tierId: "silver", // Mock tier
        period: currentPeriod,
        videoUploads: 3, // Mock usage
        storageUsedGB: 2.5, // GB
        aiCreditsUsed: 150,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        "Error getting subscription usage:",
        error instanceof Error ? error.message : String(error),
      );
      // Return default empty usage on error
      return {
        id: '',
        userId,
        tierId: "free",
        period: new Date().toISOString().slice(0, 7),
        videoUploads: 0,
        storageUsedGB: 0,
        aiCreditsUsed: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // Update usage (called when user performs actions)
  async updateUsage(
    userId: string,
    updates: Partial<SubscriptionUsage>,
  ): Promise<boolean> {
    try {
      const currentPeriod = new Date().toISOString().slice(0, 7);
      const subscription = await this.getUserSubscription(userId);

      if (!subscription) return false;

      // For now, just return true as usage update is successful
      // In production, this would call a proper usage tracking API
      console.log(`Usage updated for user ${userId}:`, updates);
      return true;
    } catch (error) {
      console.error(
        "Error updating usage:",
        error instanceof Error ? error.message : error,
      );
      return false;
    }
  }

  // Check if user can perform action
  async canPerformAction(
    userId: string,
    action: "upload_video" | "use_ai_credits" | "use_storage",
  ): Promise<{
    allowed: boolean;
    remaining?: number;
    limit?: number;
    upgradeRequired?: boolean;
  }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const usage = await this.getUsage(userId);

      if (!subscription) {
        return { allowed: false, upgradeRequired: true };
      }

      const tier = SUBSCRIPTION_TIERS.find((t) => t.id === subscription.tierId);
      if (!tier) {
        return { allowed: false, upgradeRequired: true };
      }

      const currentUsage = usage || {
        videoUploads: 0,
        storageUsedGB: 0,
        aiCreditsUsed: 0,
      };

      switch (action) {
        case "upload_video":
          if (tier.limits.videoUploads === -1) {
            return { allowed: true };
          }
          const remaining =
            tier.limits.videoUploads - currentUsage.videoUploads;
          return {
            allowed: remaining > 0,
            remaining,
            limit: tier.limits.videoUploads,
            upgradeRequired: remaining <= 0,
          };

        case "use_ai_credits":
          if (tier.limits.aiCredits === -1) {
            return { allowed: true };
          }
          const creditsRemaining =
            tier.limits.aiCredits - currentUsage.aiCreditsUsed;
          return {
            allowed: creditsRemaining > 0,
            remaining: creditsRemaining,
            limit: tier.limits.aiCredits,
            upgradeRequired: creditsRemaining <= 0,
          };

        case "use_storage":
          const storageRemaining =
            tier.limits.storageGB - currentUsage.storageUsedGB;
          return {
            allowed: storageRemaining > 0,
            remaining: storageRemaining,
            limit: tier.limits.storageGB,
            upgradeRequired: storageRemaining <= 0,
          };

        default:
          return { allowed: false };
      }
    } catch (error) {
      console.error(
        "Error checking action permission:",
        error instanceof Error ? error.message : error,
      );
      return { allowed: false };
    }
  }

  // Initialize usage tracking for new subscription
  private async initializeUsageTracking(
    userId: string,
    tierId: string,
  ): Promise<void> {
    try {
      const currentPeriod = new Date().toISOString().slice(0, 7);

      // For now, just log the initialization
      // In production, this would call a proper usage tracking API
      console.log(`Usage tracking initialized for user ${userId}, tier: ${tierId}`);
    } catch (error) {
      console.error(
        "Error initializing usage tracking:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  // Creator monetization methods
  async recordTip(
    fromUserId: string,
    toCreatorId: string,
    amount: number,
    message?: string,
  ): Promise<CreatorMonetization | null> {
    try {
      // For now, return mock data for tip recording
      // In production, this would call a proper tip recording API
      console.log(`Tip recorded: ${fromUserId} -> ${toCreatorId}, amount: $${amount}`);

      return {
        id: `tip-${Date.now()}`,
        creatorId: toCreatorId,
        contentId: "", // Not specific to content
        subscriberId: fromUserId,
        type: "tip",
        amount,
        currency: "USD",
        description: message || "Tip from supporter",
        status: "completed",
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        "Error recording tip:",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  async recordSubscriptionPayment(
    subscriberId: string,
    creatorId: string,
    amount: number,
  ): Promise<CreatorMonetization | null> {
    try {
      // For now, return mock data for subscription payment recording
      // In production, this would call a proper payment recording API
      console.log(`Subscription payment recorded: ${subscriberId} -> ${creatorId}, amount: $${amount}`);

      return {
        id: `sub-payment-${Date.now()}`,
        creatorId: creatorId,
        contentId: "", // Not specific to content
        subscriberId: subscriberId,
        type: "subscription",
        amount,
        currency: "USD",
        description: "Monthly subscription payment",
        status: "completed",
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        "Error recording subscription payment:",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  async getCreatorEarnings(
    creatorId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    recent: CreatorMonetization[];
  }> {
    try {
      // For now, return mock creator earnings data
      // In production, this would call a proper earnings API
      console.log(`Getting earnings for creator: ${creatorId}, period: ${startDate} - ${endDate}`);

      const mockRecentEarnings: CreatorMonetization[] = [
        {
          id: "earn-1",
          creatorId,
          contentId: "",
          subscriberId: "user-1",
          type: "tip",
          amount: 25.00,
          currency: "USD",
          description: "Tip for great content",
          status: "completed",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "earn-2",
          creatorId,
          contentId: "",
          subscriberId: "user-2",
          type: "subscription",
          amount: 9.99,
          currency: "USD",
          description: "Monthly subscription payment",
          status: "completed",
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const total = mockRecentEarnings.reduce((sum, earning) => sum + earning.amount, 0);
      const byType = mockRecentEarnings.reduce(
        (acc: Record<string, number>, earning) => {
          acc[earning.type] = (acc[earning.type] || 0) + earning.amount;
          return acc;
        },
        {},
      );

      return {
        total,
        byType,
        recent: mockRecentEarnings,
      };
    } catch (error) {
      console.error(
        "Error getting creator earnings:",
        error instanceof Error ? error.message : String(error),
      );
      return { total: 0, byType: {}, recent: [] };
    }
  }

  // Subscription analytics
  async getSubscriptionAnalytics(userId: string): Promise<{
    tier: SubscriptionTier | null;
    usage: SubscriptionUsage | null;
    remaining: {
      videos: number;
      storage: number;
      aiCredits: number;
    };
    renewalDate: string | null;
    totalSpent: number;
  }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const usage = await this.getUsage(userId);

      let tier = null;
      let remaining = { videos: 0, storage: 0, aiCredits: 0 };
      let totalSpent = 0;

      if (subscription) {
        tier =
          SUBSCRIPTION_TIERS.find((t) => t.id === subscription.tierId) || null;

        if (tier && usage) {
          remaining = {
            videos:
              tier.limits.videoUploads === -1
                ? -1
                : Math.max(0, tier.limits.videoUploads - usage.videoUploads),
            storage: Math.max(0, tier.limits.storageGB - usage.storageUsedGB),
            aiCredits:
              tier.limits.aiCredits === -1
                ? -1
                : Math.max(0, tier.limits.aiCredits - usage.aiCreditsUsed),
          };
        }

        // Calculate total spent (simplified - in real app, query payment history)
        const monthsSubscribed = Math.max(
          1,
          Math.floor(
            (new Date().getTime() -
              new Date(subscription.startDate).getTime()) /
              (30 * 24 * 60 * 60 * 1000),
          ),
        );
        totalSpent = tier ? tier.price * monthsSubscribed : 0;
      }

      return {
        tier,
        usage,
        remaining,
        renewalDate: subscription?.endDate || null,
        totalSpent,
      };
    } catch (error) {
      console.error(
        "Error getting subscription analytics:",
        error instanceof Error ? error.message : error,
      );
      return {
        tier: null,
        usage: null,
        remaining: { videos: 0, storage: 0, aiCredits: 0 },
        renewalDate: null,
        totalSpent: 0,
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();
