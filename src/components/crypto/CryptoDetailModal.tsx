import React from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogScrollArea,
} from "@/components/ui/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Star,
  BarChart3,
  DollarSign,
  Activity,
  Globe,
  Calendar,
  Users,
  Coins,
} from "lucide-react";
import { Cryptocurrency } from "@/types/crypto";

interface CryptoDetailModalProps {
  crypto: Cryptocurrency | null;
  isOpen: boolean;
  onClose: () => void;
}

const CryptoDetailModal: React.FC<CryptoDetailModalProps> = ({
  crypto,
  isOpen,
  onClose,
}) => {
  if (!crypto) return null;

  const formatCurrency = (value: number) => {
    if (typeof value !== "number" || isNaN(value)) return "$0.00";

    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (typeof value !== "number" || isNaN(value)) return "0";

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    if (typeof value !== "number" || isNaN(value)) return "0.00%";

    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const isPositive = (value: number) => value >= 0;

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent
        size="xl"
        mobileFullScreen={true}
        className="p-0 gap-0"
      >
        {/* Header */}
        <ResponsiveDialogHeader className="p-4 sm:p-6 pb-0">
          <div className="flex items-center gap-3">
            <img
              src={crypto.image}
              alt={crypto.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <ResponsiveDialogTitle className="text-lg sm:text-xl font-bold text-left">
                {crypto.name}
              </ResponsiveDialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {crypto.symbol}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Rank #{crypto.market_cap_rank}
                </Badge>
              </div>
            </div>
          </div>
        </ResponsiveDialogHeader>

        <ResponsiveDialogScrollArea className="flex-1 p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Price Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Current Price
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold">
                      {formatCurrency(crypto.current_price)}
                    </span>
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        isPositive(crypto.price_change_percentage_24h)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {isPositive(crypto.price_change_percentage_24h) ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatPercentage(crypto.price_change_percentage_24h)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">24h Change:</span>
                      <div
                        className={`font-medium ${
                          isPositive(crypto.price_change_24h)
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(Math.abs(crypto.price_change_24h))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">24h Volume:</span>
                      <div className="font-medium">
                        {formatCurrency(crypto.total_volume)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Market Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Cap:</span>
                      <span className="font-medium text-right">
                        {formatCurrency(crypto.market_cap)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h High:</span>
                      <span className="font-medium text-right">
                        {formatCurrency(crypto.high_24h)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h Low:</span>
                      <span className="font-medium text-right">
                        {formatCurrency(crypto.low_24h)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        All-Time High:
                      </span>
                      <span className="font-medium text-right">
                        {formatCurrency(crypto.ath)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ATH Change:</span>
                      <span className="font-medium text-right text-red-600">
                        {formatPercentage(crypto.ath_change_percentage)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ATH Date:</span>
                      <span className="font-medium text-right text-xs">
                        {new Date(crypto.ath_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supply Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Supply Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Circulating Supply:
                    </span>
                    <span className="font-medium text-right">
                      {formatNumber(crypto.circulating_supply)} {crypto.symbol}
                    </span>
                  </div>

                  {crypto.total_supply && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Supply:
                      </span>
                      <span className="font-medium text-right">
                        {formatNumber(crypto.total_supply)} {crypto.symbol}
                      </span>
                    </div>
                  )}

                  {crypto.max_supply && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Supply:</span>
                      <span className="font-medium text-right">
                        {formatNumber(crypto.max_supply)} {crypto.symbol}
                      </span>
                    </div>
                  )}

                  {crypto.max_supply && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Circulation Progress
                        </span>
                        <span>
                          {(
                            (crypto.circulating_supply / crypto.max_supply) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(crypto.circulating_supply / crypto.max_supply) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium">24 Hours</div>
                    <div
                      className={`text-lg font-bold ${
                        isPositive(crypto.price_change_percentage_24h)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPercentage(crypto.price_change_percentage_24h)}
                    </div>
                  </div>

                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium">7 Days</div>
                    <div
                      className={`text-lg font-bold ${
                        isPositive(
                          crypto.price_change_percentage_7d,
                        )
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPercentage(
                        crypto.price_change_percentage_7d,
                      )}
                    </div>
                  </div>

                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium">30 Days</div>
                    <div
                      className={`text-lg font-bold ${
                        isPositive(
                          crypto.price_change_percentage_30d,
                        )
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPercentage(
                        crypto.price_change_percentage_30d,
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button className="w-full mobile-button-size" size="lg">
                <Star className="h-4 w-4 mr-2" />
                Add to Watchlist
              </Button>
              <Button
                variant="outline"
                className="w-full mobile-button-size"
                size="lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Chart
              </Button>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              <Calendar className="h-3 w-3 inline mr-1" />
              Last updated: {new Date(crypto.last_updated).toLocaleString()}
            </div>
          </div>
        </ResponsiveDialogScrollArea>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default CryptoDetailModal;
