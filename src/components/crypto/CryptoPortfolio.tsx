import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/utils/utils";
import { CENTRALIZED_CRYPTO_BALANCE } from "@/services/cryptoService";

type PortfolioCrypto = {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  price: number;
  value: number;
  change: number;
  image: string;
};

// Updated portfolio to match centralized balance data (125,670.45 total)
const mockPortfolio: PortfolioCrypto[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "btc",
    amount: 2.5, // Match cryptoService.ts
    price: 43250.67, // Match cryptoService.ts
    value: 108126.68, // Match cryptoService.ts
    change: 2.54, // Match cryptoService.ts
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "eth",
    amount: 6.8, // Match cryptoService.ts
    price: 2587.34, // Match cryptoService.ts
    value: 17593.51, // Match cryptoService.ts
    change: 2.1, // Match cryptoService.ts
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
  }
];

const CryptoPortfolio = () => {
  const totalBalance = mockPortfolio.reduce((total, crypto) => total + crypto.value, 0);

  // Calculate total change percentage (weighted average)
  const totalChange = mockPortfolio.reduce((total, crypto) => {
    return total + (crypto.change * crypto.value);
  }, 0) / totalBalance;

  return (
    <Card className="h-full crypto-card-premium border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg crypto-text-premium">Your Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-sm crypto-text-muted-premium">Total Balance</div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold crypto-text-premium">${totalBalance.toLocaleString()}</div>
            <div
              className={cn(
                "text-sm font-medium",
                totalChange > 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {totalChange > 0 ? "+" : ""}{totalChange.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {mockPortfolio.map((crypto) => (
            <div key={crypto.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={crypto.image}
                  alt={crypto.name}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <div className="font-medium crypto-text-premium">{crypto.name}</div>
                  <div className="text-xs crypto-text-muted-premium">
                    {crypto.amount} {crypto.symbol.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="crypto-text-premium font-semibold">${crypto.value.toLocaleString()}</div>
                <div
                  className={cn(
                    "text-xs flex items-center justify-end",
                    crypto.change > 0 ? "text-green-500" : "text-red-500"
                  )}
                >
                  {crypto.change > 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(crypto.change).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 crypto-gradient-bg crypto-border-premium border rounded-md text-sm">
          <div className="font-medium mb-1 crypto-text-premium">Transaction History</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between crypto-text-secondary-premium">
              <span>Bought 0.1 BTC</span>
              <span>3 days ago</span>
            </div>
            <div className="flex justify-between crypto-text-secondary-premium">
              <span>Sold 0.5 ETH</span>
              <span>1 week ago</span>
            </div>
            <div className="flex justify-between crypto-text-secondary-premium">
              <span>Bought 10 SOL</span>
              <span>2 weeks ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoPortfolio;
