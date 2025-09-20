import React from "react";
import { useUserPremiumStatus } from "@/hooks/useUserPremiumStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Lock, Shield, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface PremiumGateProps {
  children: React.ReactNode;
  feature: "verified_badge" | "unlimited_videos" | "priority_support" | "advanced_analytics" | "custom_branding" | "hd_streaming" | "ai_credits" | "no_content_deletion";
  fallback?: "upgrade" | "kyc" | "custom" | "hide";
  customFallback?: React.ReactNode;
  className?: string;
  showUpgradePrompt?: boolean;
}

const featureDetails = {
  verified_badge: {
    name: "Verified Badge",
    description: "Blue checkmark that appears across the platform",
    icon: Shield,
    requiresKYC: true,
  },
  unlimited_videos: {
    name: "Unlimited Video Uploads",
    description: "Upload unlimited videos without monthly limits",
    icon: Crown,
    requiresKYC: false,
  },
  priority_support: {
    name: "Priority Support",
    description: "Get faster response times and dedicated support",
    icon: Crown,
    requiresKYC: false,
  },
  advanced_analytics: {
    name: "Advanced Analytics",
    description: "Detailed insights and performance metrics",
    icon: Crown,
    requiresKYC: false,
  },
  custom_branding: {
    name: "Custom Branding",
    description: "Customize your profile and content with premium themes",
    icon: Crown,
    requiresKYC: false,
  },
  hd_streaming: {
    name: "HD Streaming",
    description: "Stream and upload in high definition quality",
    icon: Crown,
    requiresKYC: false,
  },
  ai_credits: {
    name: "AI Credits",
    description: "Use AI-powered tools for content creation",
    icon: Crown,
    requiresKYC: false,
  },
  no_content_deletion: {
    name: "Permanent Content Storage",
    description: "Your content is never automatically deleted",
    icon: Crown,
    requiresKYC: false,
  },
};

/**
 * PremiumGate component - controls access to premium features
 * Automatically checks user's premium status and feature access
 */
export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  feature,
  fallback = "upgrade",
  customFallback,
  className,
  showUpgradePrompt = true,
}) => {
  const {
    isPremium,
    isKYCVerified,
    hasFeature,
    getUpgradePrompt,
    isLoading,
  } = useUserPremiumStatus();
  
  const navigate = useNavigate();
  const featureDetail = featureDetails[feature];

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Check if user has access to the feature
  const hasAccess = hasFeature(feature as any);

  // For features that require KYC, check both premium and KYC status
  if (featureDetail.requiresKYC && !isKYCVerified) {
    if (fallback === "kyc") {
      return (
        <Card className={cn("border-blue-200 bg-blue-50", className)}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-blue-800">
              <Shield className="h-5 w-5" />
              KYC Verification Required
            </CardTitle>
            <CardDescription className="text-blue-600">
              Complete identity verification to access {featureDetail.name.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => navigate("/app/kyc")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Verification
            </Button>
          </CardContent>
        </Card>
      );
    }
  }

  // If user has access, show the children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Handle different fallback types
  if (fallback === "hide") {
    return null;
  }

  if (fallback === "custom" && customFallback) {
    return <>{customFallback}</>;
  }

  // Default upgrade prompt
  return (
    <Card className={cn("border-yellow-200 bg-yellow-50", className)}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-yellow-800">
          <featureDetail.icon className="h-5 w-5" />
          Premium Feature
        </CardTitle>
        <CardDescription className="text-yellow-700">
          {featureDetail.description}
        </CardDescription>
      </CardHeader>
      {showUpgradePrompt && (
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-yellow-600">
            {getUpgradePrompt() || "Upgrade to premium to unlock this feature"}
          </p>
          <div className="flex gap-2 justify-center">
            {!isKYCVerified && featureDetail.requiresKYC && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/app/kyc")}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Verify Identity
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => navigate("/app/premium")}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Hook to check if a feature is available without rendering
 */
export const usePremiumFeature = (feature: PremiumGateProps["feature"]) => {
  const { hasFeature, isPremium, isKYCVerified } = useUserPremiumStatus();
  const featureDetail = featureDetails[feature];
  
  const hasAccess = hasFeature(feature as any);
  const needsKYC = featureDetail.requiresKYC && !isKYCVerified;
  const needsPremium = !isPremium;

  return {
    hasAccess,
    needsKYC,
    needsPremium,
    canAccess: hasAccess,
  };
};

export default PremiumGate;