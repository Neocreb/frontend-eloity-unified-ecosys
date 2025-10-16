import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpDown, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface CurrencyLinkProps {
  variant?: "button" | "card" | "minimal" | "inline";
  destination?: "wallet" | "settings" | "demo";
  showRate?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CurrencyLink: React.FC<CurrencyLinkProps> = ({
  variant = "button",
  destination = "demo", 
  showRate = false,
  className,
  size = "md"
}) => {
  const { userCurrency, lastUpdated } = useCurrency();

  const getDestinationPath = () => {
    switch (destination) {
      case "wallet": return "/app/wallet";
      case "settings": return "/app/settings";
      case "demo": return "/app/currency-demo";
      default: return "/app/currency-demo";
    }
  };

  const getDestinationParams = () => {
    switch (destination) {
      case "wallet": return "?tab=currency";
      case "settings": return "?tab=financial";
      default: return "";
    }
  };

  const fullPath = getDestinationPath() + getDestinationParams();

  if (variant === "minimal") {
    return (
      <Link to={fullPath} className={cn("inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors", className)}>
        <ArrowUpDown className="w-3 h-3" />
        <span className="text-sm">Currency</span>
      </Link>
    );
  }

  if (variant === "inline") {
    return (
      <Link to={fullPath} className={cn("inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm", className)}>
        Convert currencies <ExternalLink className="w-3 h-3" />
      </Link>
    );
  }

  if (variant === "card") {
    return (
      <Link to={fullPath} className={cn("block group", className)}>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <ArrowUpDown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Currency Conversion</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time rates and converter
                </p>
                {showRate && lastUpdated && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-gray-500">
                      Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {userCurrency.code}
              </Badge>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default button variant
  return (
    <Button 
      variant="outline" 
      size={size === 'md' ? 'sm' : size}
      asChild
      className={cn("flex items-center gap-2", className)}
    >
      <Link to={fullPath}>
        <ArrowUpDown className="w-4 h-4" />
        <span>Currency Converter</span>
        {showRate && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {userCurrency.code}
          </Badge>
        )}
      </Link>
    </Button>
  );
};

// Specialized variants for common use cases
export const WalletCurrencyLink: React.FC<Omit<CurrencyLinkProps, 'destination'>> = (props) => (
  <CurrencyLink {...props} destination="wallet" />
);

export const SettingsCurrencyLink: React.FC<Omit<CurrencyLinkProps, 'destination'>> = (props) => (
  <CurrencyLink {...props} destination="settings" />
);

export const CurrencyQuickLink: React.FC<{ className?: string }> = ({ className }) => (
  <CurrencyLink variant="minimal" className={className} />
);

export default CurrencyLink;
