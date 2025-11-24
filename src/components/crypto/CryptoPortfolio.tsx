import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";
import { useCryptoPortfolio } from "@/hooks/useCryptoPortfolio";
import { useCryptoTransactions } from "@/hooks/useCryptoTransactions";

const CRYPTO_IMAGES: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  USDT: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  USDC: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  ADA: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
};

interface CryptoPortfolioProps {
  walletAddress?: string;
  blockchain?: string;
  network?: string;
}

const CryptoPortfolio = ({
  walletAddress = "0x1234567890123456789012345678901234567890",
  blockchain = "ethereum",
  network = "mainnet",
}: CryptoPortfolioProps) => {
  const { assets, totalValue, totalPnLPercent, loading, error } = useCryptoPortfolio(
    walletAddress,
    blockchain,
    network
  );

  const { transactions } = useCryptoTransactions(
    walletAddress,
    blockchain,
    network,
    5
  );

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 3).map((tx) => ({
      description: `${tx.type === "RECEIVE" ? "Received" : "Sent"} ${tx.amount.toFixed(4)} ${tx.asset}`,
      time: formatTimeAgo(new Date(tx.timestamp)),
    }));
  }, [transactions]);

  if (error) {
    return (
      <Card className="h-full crypto-card-premium border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg crypto-text-premium">Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">Error loading portfolio: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full crypto-card-premium border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg crypto-text-premium">Your Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-sm crypto-text-muted-premium">Total Balance</div>
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold crypto-text-premium">
                  ${totalValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </div>
                <div
                  className={cn(
                    "text-sm font-medium",
                    totalPnLPercent > 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {totalPnLPercent > 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : assets.length > 0 ? (
            assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={CRYPTO_IMAGES[asset.symbol] || "https://via.placeholder.com/32"}
                    alt={asset.name}
                    className="h-8 w-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/32";
                    }}
                  />
                  <div>
                    <div className="font-medium crypto-text-premium">{asset.name}</div>
                    <div className="text-xs crypto-text-muted-premium">
                      {asset.amount.toFixed(4)} {asset.symbol}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="crypto-text-premium font-semibold">
                    ${asset.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </div>
                  <div
                    className={cn(
                      "text-xs flex items-center justify-end",
                      asset.pnlPercent > 0 ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {asset.pnlPercent > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(asset.pnlPercent).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm crypto-text-muted-premium">No assets found</div>
          )}
        </div>

        <div className="mt-4 p-3 crypto-gradient-bg crypto-border-premium border rounded-md text-sm">
          <div className="font-medium mb-1 crypto-text-premium">Recent Transactions</div>
          <div className="space-y-2 text-xs">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, idx) => (
                <div key={idx} className="flex justify-between crypto-text-secondary-premium">
                  <span>{tx.description}</span>
                  <span>{tx.time}</span>
                </div>
              ))
            ) : (
              <div className="crypto-text-secondary-premium">No transactions yet</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export default CryptoPortfolio;
