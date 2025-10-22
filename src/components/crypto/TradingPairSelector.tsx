import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Search, Star, TrendingUp, TrendingDown } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import useCrypto from "@/hooks/use-crypto";

interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  volume: number;
  isFavorite?: boolean;
  isHot?: boolean;
}

interface TradingPairSelectorProps {
  currentPair: string;
  onPairSelect: (pair: string) => void;
  className?: string;
}

const TradingPairSelector: React.FC<TradingPairSelectorProps> = ({
  currentPair,
  onPairSelect,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuote, setActiveQuote] = useState("USDT");

  // Prefer real trading pairs from central hook; fall back to local mock if unavailable
  const crypto = useCrypto();
  const tradingPairs: TradingPair[] = (crypto?.tradingPairs && crypto.tradingPairs.length > 0)
    ? crypto.tradingPairs
    : [
      {
        symbol: "ETHUSDT",
        baseAsset: "ETH",
        quoteAsset: "USDT",
        price: 4485.56,
        change24h: 4.41,
        volume: 1250000000,
        isHot: true,
      },
      {
        symbol: "BTCUSDT",
        baseAsset: "BTC",
        quoteAsset: "USDT",
        price: 119697.3,
        change24h: -0.02,
        volume: 960490000,
        isFavorite: true,
      },
    ];

  const quoteAssets = ["USDT", "USDC", "BTC", "ETH"];

  const formatPrice = (price: number) => {
    if (price < 1) {
      return price.toFixed(4);
    } else if (price < 100) {
      return price.toFixed(2);
    } else {
      return price.toFixed(1);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(2)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else {
      return `${(volume / 1000).toFixed(2)}K`;
    }
  };

  const formatChange = (change: number) => {
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  const filteredPairs = tradingPairs
    .filter((pair) => pair.quoteAsset === activeQuote)
    .filter((pair) =>
      searchQuery === "" ||
      pair.baseAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handlePairSelect = (pair: TradingPair) => {
    onPairSelect(pair.symbol);
    setIsOpen(false);
  };

  const currentPairData = tradingPairs.find(p => p.symbol === currentPair);
  
  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className={cn(
          "h-auto p-2 flex items-center gap-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold">
            {currentPairData?.baseAsset || "ETH"}/{currentPairData?.quoteAsset || "USDT"}
          </div>
          {currentPairData?.change24h && (
            <div className={cn(
              "text-sm font-medium",
              currentPairData.change24h >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {formatChange(currentPairData.change24h)}
            </div>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Trading Pair</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pairs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quote Asset Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {quoteAssets.map((quote) => (
                <Button
                  key={quote}
                  variant={activeQuote === quote ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveQuote(quote)}
                  className="flex-1"
                >
                  {quote}
                </Button>
              ))}
            </div>

            {/* Filter Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="favorites">
                  <Star className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="hot">🔥 Hot</TabsTrigger>
                <TabsTrigger value="gainers">
                  <TrendingUp className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="losers">
                  <TrendingDown className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-gray-500 font-medium">
                    <div className="col-span-4">Trading Pairs</div>
                    <div className="col-span-3 text-right">Price</div>
                    <div className="col-span-3 text-right">24H Change</div>
                    <div className="col-span-2 text-right">Volume</div>
                  </div>

                  {/* Pairs List */}
                  {filteredPairs.map((pair) => (
                    <div
                      key={pair.symbol}
                      onClick={() => handlePairSelect(pair)}
                      className="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded-md transition-colors"
                    >
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="font-medium">{pair.baseAsset}</div>
                        <div className="text-gray-400">/{pair.quoteAsset}</div>
                        {pair.isHot && (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                            🔥
                          </Badge>
                        )}
                        {pair.isFavorite && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="col-span-3 text-right font-mono">
                        {formatPrice(pair.price)}
                      </div>
                      <div className={cn(
                        "col-span-3 text-right font-medium",
                        pair.change24h >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {formatChange(pair.change24h)}
                      </div>
                      <div className="col-span-2 text-right text-sm text-gray-500">
                        {formatVolume(pair.volume)}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="favorites" className="mt-4">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredPairs.filter(p => p.isFavorite).length > 0 ? (
                    filteredPairs.filter(p => p.isFavorite).map((pair) => (
                      <div
                        key={pair.symbol}
                        onClick={() => handlePairSelect(pair)}
                        className="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded-md transition-colors"
                      >
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="font-medium">{pair.baseAsset}</div>
                          <div className="text-gray-400">/{pair.quoteAsset}</div>
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        </div>
                        <div className="col-span-3 text-right font-mono">
                          {formatPrice(pair.price)}
                        </div>
                        <div className={cn(
                          "col-span-3 text-right font-medium",
                          pair.change24h >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {formatChange(pair.change24h)}
                        </div>
                        <div className="col-span-2 text-right text-sm text-gray-500">
                          {formatVolume(pair.volume)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No favorite pairs yet
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="hot" className="mt-4">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredPairs.filter(p => p.isHot).map((pair) => (
                    <div
                      key={pair.symbol}
                      onClick={() => handlePairSelect(pair)}
                      className="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded-md transition-colors"
                    >
                      <div className="col-span-4 flex items-center gap-2">
                        <div className="font-medium">{pair.baseAsset}</div>
                        <div className="text-gray-400">/{pair.quoteAsset}</div>
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                          🔥
                        </Badge>
                      </div>
                      <div className="col-span-3 text-right font-mono">
                        {formatPrice(pair.price)}
                      </div>
                      <div className={cn(
                        "col-span-3 text-right font-medium",
                        pair.change24h >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {formatChange(pair.change24h)}
                      </div>
                      <div className="col-span-2 text-right text-sm text-gray-500">
                        {formatVolume(pair.volume)}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gainers" className="mt-4">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredPairs
                    .filter(p => p.change24h > 0)
                    .sort((a, b) => b.change24h - a.change24h)
                    .map((pair) => (
                      <div
                        key={pair.symbol}
                        onClick={() => handlePairSelect(pair)}
                        className="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded-md transition-colors"
                      >
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="font-medium">{pair.baseAsset}</div>
                          <div className="text-gray-400">/{pair.quoteAsset}</div>
                        </div>
                        <div className="col-span-3 text-right font-mono">
                          {formatPrice(pair.price)}
                        </div>
                        <div className="col-span-3 text-right font-medium text-green-500">
                          {formatChange(pair.change24h)}
                        </div>
                        <div className="col-span-2 text-right text-sm text-gray-500">
                          {formatVolume(pair.volume)}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="losers" className="mt-4">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredPairs
                    .filter(p => p.change24h < 0)
                    .sort((a, b) => a.change24h - b.change24h)
                    .map((pair) => (
                      <div
                        key={pair.symbol}
                        onClick={() => handlePairSelect(pair)}
                        className="grid grid-cols-12 gap-2 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded-md transition-colors"
                      >
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="font-medium">{pair.baseAsset}</div>
                          <div className="text-gray-400">/{pair.quoteAsset}</div>
                        </div>
                        <div className="col-span-3 text-right font-mono">
                          {formatPrice(pair.price)}
                        </div>
                        <div className="col-span-3 text-right font-medium text-red-500">
                          {formatChange(pair.change24h)}
                        </div>
                        <div className="col-span-2 text-right text-sm text-gray-500">
                          {formatVolume(pair.volume)}
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TradingPairSelector;
