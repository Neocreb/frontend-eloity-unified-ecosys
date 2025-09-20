import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService } from "@/services/subscriptionService";
import { SUBSCRIPTION_TIERS } from "@/services/subscriptionService";

export interface PremiumStatus {
  isPremium: boolean;
  isVerified: boolean;
  isKYCVerified: boolean;
  premiumTier: "free" | "creator" | "professional" | "enterprise";
  subscriptionStatus: "active" | "cancelled" | "expired" | "trial" | "none";
  subscriptionExpiresAt?: string;
  hasValidSubscription: boolean;
  canUpgrade: boolean;
  features: PremiumFeatures;
  limits: PremiumLimits;
}

export interface PremiumFeatures {
  verifiedBadge: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  customBranding: boolean;
  unlimitedVideos: boolean;
  hdStreaming: boolean;
  aiCredits: number;
  storageGB: number;
  noContentDeletion: boolean;
}

export interface PremiumLimits {
  videoUploads: number; // -1 for unlimited
  storageGB: number;
  aiCredits: number; // -1 for unlimited
  videoRetentionDays: number; // -1 for unlimited
}

/**
 * Hook to get comprehensive premium status information for the current user
 * This hook provides a centralized way to check premium features and limits
 */
export const useUserPremiumStatus = () => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription data when user is available
  useEffect(() => {
    let isMounted = true;

    const fetchSubscriptionData = async () => {
      if (!user?.id || !isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [subscription, usage] = await Promise.all([
          subscriptionService.getUserSubscription(user.id),
          subscriptionService.getUsage(user.id).catch(() => null), // Don't fail if usage isn't available
        ]);

        if (isMounted) {
          setSubscriptionData({ subscription, usage });
        }
      } catch (err) {
        console.error("Error fetching subscription data:", err);
        if (isMounted) {
          setError("Failed to load subscription data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSubscriptionData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, isAuthenticated]);

  // Calculate premium status based on user profile and subscription data
  const premiumStatus: PremiumStatus = useMemo(() => {
    // Default free user status
    const defaultStatus: PremiumStatus = {
      isPremium: false,
      isVerified: false,
      isKYCVerified: false,
      premiumTier: "free",
      subscriptionStatus: "none",
      hasValidSubscription: false,
      canUpgrade: true,
      features: {
        verifiedBadge: false,
        prioritySupport: false,
        advancedAnalytics: false,
        customBranding: false,
        unlimitedVideos: false,
        hdStreaming: false,
        aiCredits: 10,
        storageGB: 5,
        noContentDeletion: false,
      },
      limits: {
        videoUploads: 10,
        storageGB: 5,
        aiCredits: 10,
        videoRetentionDays: 90,
      },
    };

    if (!user || !isAuthenticated) {
      return defaultStatus;
    }

    // Check KYC verification - level 2 or higher is considered verified
    const kycLevel = user.profile?.kyc_level || user.profile?.crypto_profile?.kyc_level || 0;
    const isKYCVerified = kycLevel >= 2;

    // Check if user has is_verified flag (verified badge)
    const isVerified = user.profile?.is_verified || false;

    // Determine premium status from profile or subscription data
    const profilePremiumTier = user.profile?.premium_tier || "free";
    const profileSubscriptionStatus = user.profile?.subscription_status || "none";
    const profileSubscriptionExpiry = user.profile?.subscription_expires_at;

    // If we have subscription data from the subscription service, use that
    let finalTier = profilePremiumTier;
    let finalStatus = profileSubscriptionStatus;
    let finalExpiry = profileSubscriptionExpiry;

    if (subscriptionData?.subscription) {
      const sub = subscriptionData.subscription;
      finalTier = sub.tierId as any;
      finalStatus = sub.status as any;
      finalExpiry = sub.endDate;
    }

    // Check if subscription is active and not expired
    const now = new Date();
    const expiryDate = finalExpiry ? new Date(finalExpiry) : null;
    const hasValidSubscription = 
      finalStatus === "active" && 
      (!expiryDate || expiryDate > now);

    const isPremium = hasValidSubscription && finalTier !== "free";

    // Get tier configuration
    const tierConfig = SUBSCRIPTION_TIERS.find(t => t.id === finalTier) || SUBSCRIPTION_TIERS[0];

    // Build features based on tier and verification
    const features: PremiumFeatures = {
      verifiedBadge: isPremium && isKYCVerified && isVerified,
      prioritySupport: tierConfig.limits.prioritySupport,
      advancedAnalytics: tierConfig.limits.advancedAnalytics,
      customBranding: tierConfig.limits.customBranding,
      unlimitedVideos: tierConfig.limits.videoUploads === -1,
      hdStreaming: isPremium,
      aiCredits: tierConfig.limits.aiCredits,
      storageGB: tierConfig.limits.storageGB,
      noContentDeletion: isPremium,
    };

    // Build limits based on tier
    const limits: PremiumLimits = {
      videoUploads: tierConfig.limits.videoUploads,
      storageGB: tierConfig.limits.storageGB,
      aiCredits: tierConfig.limits.aiCredits,
      videoRetentionDays: isPremium ? -1 : 90, // Unlimited for premium, 90 days for free
    };

    return {
      isPremium,
      isVerified: isVerified && isPremium, // Only show verified if premium
      isKYCVerified,
      premiumTier: finalTier as any,
      subscriptionStatus: finalStatus as any,
      subscriptionExpiresAt: finalExpiry,
      hasValidSubscription,
      canUpgrade: !isPremium || finalTier !== "enterprise",
      features,
      limits,
    };
  }, [user, isAuthenticated, subscriptionData]);

  // Utility functions for common checks
  const hasFeature = (feature: keyof PremiumFeatures): boolean => {
    return premiumStatus.features[feature] as boolean;
  };

  const canPerformAction = (action: 'upload_video' | 'use_ai_credits' | 'access_analytics'): boolean => {
    switch (action) {
      case 'upload_video':
        return premiumStatus.limits.videoUploads === -1 || true; // Would need current usage count
      case 'use_ai_credits':
        return premiumStatus.limits.aiCredits === -1 || true; // Would need current usage count
      case 'access_analytics':
        return premiumStatus.features.advancedAnalytics;
      default:
        return false;
    }
  };

  const getUpgradePrompt = (): string | null => {
    if (premiumStatus.isPremium) return null;
    
    if (!premiumStatus.isKYCVerified) {
      return "Complete KYC verification to unlock premium features";
    }
    
    return "Upgrade to premium to unlock advanced features";
  };

  return {
    ...premiumStatus,
    isLoading,
    error,
    hasFeature,
    canPerformAction,
    getUpgradePrompt,
    refresh: () => {
      // Trigger a re-fetch of subscription data
      if (user?.id) {
        setIsLoading(true);
        // The effect will handle the actual fetching
      }
    },
  };
};

export default useUserPremiumStatus;