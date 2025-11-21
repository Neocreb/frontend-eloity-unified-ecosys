import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChevronLeft,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cryptocurrency } from "@/types/crypto";

const CryptoDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [crypto, setCrypto] = useState<Cryptocurrency | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCryptoDetail = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        // const response = await cryptoService.getCryptoBySy mbol(symbol);
        // setCrypto(response);
        setCrypto(null);
      } catch (error) {
        console.error("Failed to load crypto details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      loadCryptoDetail();
    }
  }, [symbol]);

  if (!crypto && !isLoading) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
        <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b dark:border-slate-700">
          <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="flex-shrink-0"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-lg sm:text-xl font-bold dark:text-white">Crypto Details</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium dark:text-white">Cryptocurrency not found</h2>
            <p className="text-muted-foreground dark:text-slate-400 text-sm mt-2">
              The requested cryptocurrency could not be found
            </p>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b dark:border-slate-700">
        <div className="flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          {!isLoading && crypto && (
            <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold truncate dark:text-white">
                  {crypto.name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs dark:bg-slate-700 dark:text-white">
                    {crypto.symbol}
                  </Badge>
                  {crypto.market_cap_rank && (
                    <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300">
                      Rank #{crypto.market_cap_rank}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground dark:text-slate-400">Loading crypto details...</p>
        </div>
      ) : crypto ? (
        <ScrollArea className="flex-1">
          <div className="px-4 py-4 sm:px-6 max-w-4xl mx-auto">
            <div className="space-y-4 sm:space-y-6">
              {/* Price Section */}
              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2 dark:text-white">
                    <DollarSign className="h-4 w-4" />
                    Current Price
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-bold dark:text-white">
                        {formatCurrency(crypto.current_price)}
                      </span>
                      {crypto.price_change_percentage_24h !== undefined && (
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            isPositive(crypto.price_change_percentage_24h)
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {isPositive(crypto.price_change_percentage_24h) ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatPercentage(crypto.price_change_percentage_24h)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm dark:text-slate-300">
                      <div>
                        <span className="text-muted-foreground dark:text-slate-400">24h Change:</span>
                        <div
                          className={`font-medium ${
                            crypto.price_change_24h && isPositive(crypto.price_change_24h)
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {crypto.price_change_24h ? formatCurrency(Math.abs(crypto.price_change_24h)) : "$0.00"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground dark:text-slate-400">24h Volume:</span>
                        <div className="font-medium dark:text-white">
                          {formatCurrency(crypto.total_volume)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Stats */}
              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2 dark:text-white">
                    <BarChart3 className="h-4 w-4" />
                    Market Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm dark:text-slate-300">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-slate-400">Market Cap:</span>
                        <span className="font-medium text-right dark:text-white">
                          {formatCurrency(crypto.market_cap)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-slate-400">24h High:</span>
                        <span className="font-medium text-right dark:text-white">
                          {formatCurrency(crypto.high_24h)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-slate-400">24h Low:</span>
                        <span className="font-medium text-right dark:text-white">
                          {formatCurrency(crypto.low_24h)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-slate-400">All-Time High:</span>
                        <span className="font-medium text-right dark:text-white">
                          {formatCurrency(crypto.ath)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-slate-400">ATH Change:</span>
                        <span className="font-medium text-right text-red-600 dark:text-red-400">
                          {formatPercentage(crypto.ath_change_percentage)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-slate-400">ATH Date:</span>
                        <span className="font-medium text-right text-xs dark:text-white">
                          {new Date(crypto.ath_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supply Information */}
              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2 dark:text-white">
                    <Coins className="h-4 w-4" />
                    Supply Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground dark:text-slate-400">Circulating Supply:</span>
                      <span className="font-medium text-right dark:text-white">
                        {formatNumber(crypto.circulating_supply)} {crypto.symbol}
                      </span>
                    </div>

                    {crypto.total_supply && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-slate-400">Total Supply:</span>
                        <span className="font-medium text-right dark:text-white">
                          {formatNumber(crypto.total_supply)} {crypto.symbol}
                        </span>
                      </div>
                    )}

                    {crypto.max_supply && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground dark:text-slate-400">Max Supply:</span>
                        <span className="font-medium text-right dark:text-white">
                          {formatNumber(crypto.max_supply)} {crypto.symbol}
                        </span>
                      </div>
                    )}

                    {crypto.max_supply && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground dark:text-slate-400">
                            Circulation Progress
                          </span>
                          <span className="dark:text-white">
                            {(
                              (crypto.circulating_supply / crypto.max_supply) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(crypto.circulating_supply / crypto.max_supply) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Overview */}
              <Card className="dark:bg-slate-900 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2 dark:text-white">
                    <Activity className="h-4 w-4" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="font-medium dark:text-white">24 Hours</div>
                      <div
                        className={`text-lg font-bold ${
                          crypto.price_change_percentage_24h && isPositive(crypto.price_change_percentage_24h)
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatPercentage(crypto.price_change_percentage_24h)}
                      </div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="font-medium dark:text-white">7 Days</div>
                      <div
                        className={`text-lg font-bold ${
                          crypto.price_change_percentage_7d && isPositive(crypto.price_change_percentage_7d)
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatPercentage(crypto.price_change_percentage_7d)}
                      </div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="font-medium dark:text-white">30 Days</div>
                      <div
                        className={`text-lg font-bold ${
                          crypto.price_change_percentage_30d && isPositive(crypto.price_change_percentage_30d)
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatPercentage(crypto.price_change_percentage_30d)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button className="w-full" size="lg">
                  <Star className="h-4 w-4 mr-2" />
                  Add to Watchlist
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Chart
                </Button>
              </div>

              {/* Last Updated */}
              <div className="text-xs text-muted-foreground dark:text-slate-400 text-center pt-4 border-t dark:border-slate-700">
                <Calendar className="h-3 w-3 inline mr-1" />
                Last updated: {new Date(crypto.last_updated).toLocaleString()}
              </div>

              {/* Bottom spacing */}
              <div className="h-4" />
            </div>
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
};

export default CryptoDetail;
