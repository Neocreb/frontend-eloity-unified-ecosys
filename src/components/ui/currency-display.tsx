import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Info,
  Eye,
  EyeOff
} from "lucide-react";
import { useCurrency, useCurrencyConversion } from "@/contexts/CurrencyContext";
import { type ConversionOptions } from "@/services/currencyService";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  originalCurrency?: string; // If different from display currency, show conversion info
  className?: string;
  variant?: "default" | "large" | "compact" | "inline";
  showSymbol?: boolean;
  showCode?: boolean;
  showConversion?: boolean;
  showTrend?: boolean;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  precision?: number;
  animate?: boolean;
  onClick?: () => void;
  isEditable?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  originalCurrency,
  className,
  variant = "default",
  showSymbol = true,
  showCode = false,
  showConversion = false,
  showTrend = false,
  trend = "stable",
  trendValue,
  precision,
  animate = false,
  onClick,
  isEditable = false
}) => {
  const { userCurrency, formatAmount, convertToUserCurrency } = useCurrencyConversion();

  const displayCurrency = currency || userCurrency?.code;
  const needsConversion = originalCurrency && originalCurrency !== displayCurrency;
  
  // Convert if needed
  const displayAmount = needsConversion 
    ? convertToUserCurrency(amount, originalCurrency).amount
    : amount;

  const formattedAmount = formatAmount(displayAmount, displayCurrency, {
    decimals: precision,
    showSymbol,
    showCode
  });

  const conversionInfo = needsConversion 
    ? convertToUserCurrency(amount, originalCurrency!)
    : null;

  const getTrendIcon = () => {
    switch (trend) {
      case "up": return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "down": return <TrendingDown className="w-3 h-3 text-red-500" />;
      default: return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up": return "text-green-600 dark:text-green-400";
      case "down": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const baseClasses = cn(
    "font-medium transition-colors",
    animate && "transition-all duration-300 ease-in-out",
    onClick && "cursor-pointer hover:text-primary",
    className
  );

  const sizeClasses = {
    compact: "text-sm",
    default: "text-base",
    large: "text-lg",
    inline: "text-inherit"
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1", baseClasses)} onClick={onClick}>
        <span className={sizeClasses[variant]}>{formattedAmount}</span>
        {showTrend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            {trendValue && (
              <span className={cn("text-xs", getTrendColor())}>
                {trendValue > 0 ? "+" : ""}{trendValue.toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className={cn(baseClasses, sizeClasses[variant])} onClick={onClick}>
        {formattedAmount}
        {showConversion && conversionInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="inline w-3 h-3 ml-1 opacity-60" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <div>Original: {formatAmount(amount, originalCurrency!)}</div>
                  <div>Rate: 1 {originalCurrency} = {conversionInfo.rate.toFixed(4)} {displayCurrency}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", baseClasses)} onClick={onClick}>
      <div className="flex flex-col">
        <div className={cn("flex items-center gap-2", sizeClasses[variant])}>
          <span>{formattedAmount}</span>
          
          {isEditable && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Eye className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        {showConversion && conversionInfo && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatAmount(amount, originalCurrency!)} at {conversionInfo.rate.toFixed(4)}
          </div>
        )}
      </div>

      {showTrend && (
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          {trendValue && (
            <Badge variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"} className="text-xs">
              {trendValue > 0 ? "+" : ""}{trendValue.toFixed(2)}%
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized components for common use cases
export const Price: React.FC<Omit<CurrencyDisplayProps, 'variant'> & { size?: 'sm' | 'md' | 'lg' }> = ({ 
  size = 'md', 
  ...props 
}) => {
  const variantMap = { sm: 'compact', md: 'default', lg: 'large' } as const;
  return <CurrencyDisplay {...props} variant={variantMap[size]} showSymbol={true} />;
};

export const Balance: React.FC<CurrencyDisplayProps> = (props) => (
  <CurrencyDisplay 
    {...props} 
    variant="large" 
    showSymbol={true} 
    showTrend={true}
    animate={true}
  />
);

export const InlinePrice: React.FC<CurrencyDisplayProps> = (props) => (
  <CurrencyDisplay {...props} variant="inline" showSymbol={true} />
);

export const ConvertedPrice: React.FC<CurrencyDisplayProps & { fromCurrency: string }> = ({ 
  fromCurrency, 
  ...props 
}) => (
  <CurrencyDisplay 
    {...props} 
    originalCurrency={fromCurrency} 
    showConversion={true}
  />
);

export default CurrencyDisplay;
