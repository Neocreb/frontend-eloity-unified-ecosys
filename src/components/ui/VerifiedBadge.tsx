import React from "react";
import { cn } from "@/lib/utils";
import { Verified, Crown, Shield } from "lucide-react";

export interface VerifiedBadgeProps {
  isVerified?: boolean;
  isPremium?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "crown" | "shield";
  showTooltip?: boolean;
  className?: string;
}

/**
 * VerifiedBadge component - displays verification status consistently across the platform
 * Only shows when user is both premium and verified (KYC level 2+)
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  isVerified = false,
  isPremium = false,
  size = "sm",
  variant = "default",
  showTooltip = true,
  className,
}) => {
  // Only show badge if user is both premium and verified
  const shouldShow = isVerified && isPremium;

  if (!shouldShow) {
    return null;
  }

  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const getIcon = () => {
    switch (variant) {
      case "crown":
        return <Crown className={cn("text-yellow-500", sizeClasses[size])} />;
      case "shield":
        return <Shield className={cn("text-blue-500", sizeClasses[size])} />;
      case "minimal":
        return <Verified className={cn("text-blue-500", sizeClasses[size])} />;
      default:
        return <Verified className={cn("text-blue-500", sizeClasses[size])} />;
    }
  };

  const tooltipText = "Verified Premium User";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center",
        showTooltip && "group relative",
        className
      )}
      title={showTooltip ? tooltipText : undefined}
    >
      {getIcon()}
      {showTooltip && (
        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap z-50">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default VerifiedBadge;