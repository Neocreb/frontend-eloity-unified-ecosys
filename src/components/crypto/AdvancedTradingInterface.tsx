import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  DollarSign,
  Shield,
  AlertTriangle,
  Settings,
  Bookmark,
  Eye,
  Bell,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CryptoDepositModal from "./CryptoDepositModal";
import CryptoWithdrawModal from "./CryptoWithdrawModal";
import CryptoKYCModal from "./CryptoKYCModal";

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface Trade {
  id: string;
  price: number;
  amount: number;
  time: string;
  type: "buy" | "sell";
}

interface Order {
  id: string;
  type: "market" | "limit" | "stop-loss" | "take-profit";
  side: "buy" | "sell";
  amount: number;
  price?: number;
  stopPrice?: number;
  status: "pending" | "filled" | "cancelled";
  filled: number;
  timestamp: string;
}

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface AdvancedTradingInterfaceProps {
  selectedPair?: string;
}

const AdvancedTradingInterface: React.FC<AdvancedTradingInterfaceProps> = ({
  selectedPair = "ETH/USDT"
}) => {
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop-loss">(
    "limit",
  );
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [orderBook, setOrderBook] = useState<{
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
  }>({
    asks: [],
    bids: [],
  });
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [volume24h, setVolume24h] = useState(0);
  const [chartTimeframe, setChartTimeframe] = useState("1h");
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(true); // Mock verified status
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();


  const [orderBookData, setOrderBookData] = useState([
    { price: 43200, amount: 0.5, type: "buy" },
    { price: 43250, amount: 0.3, type: "sell" },
    { price: 43180, amount: 0.7, type: "buy" },
    { price: 43270, amount: 0.4, type: "sell" },
  ]);

  useEffect(() => {
    initializeChart();

    const fetchAll = async () => {
      await Promise.all([fetchMarketPrice(), fetchOrderBook()]);
    };

    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  const fetchMarketPrice = async () => {
    try {
      const base = selectedPair.split('/')[0].toUpperCase();
      const idMap: Record<string, string> = {
        BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'binancecoin', SOL: 'solana', ADA: 'cardano', LINK: 'chainlink', MATIC: 'polygon', AVAX: 'avalanche', DOT: 'polkadot', DOGE: 'dogecoin'
      };
      const id = idMap[base] || 'bitcoin';
      const r = await fetch(`/api/crypto/prices?symbols=${encodeURIComponent(id)}`);
      const j = await r.json();
      const p = j?.prices?.[id];
      if (p) {
        const prev = Number(p.usd) / (1 + Number(p.usd_24h_change || 0) / 100);
        setPriceChange(Number(p.usd) - prev);
        setPriceChangePercent(Number(p.usd_24h_change || 0));
        setCurrentPrice(Number(p.usd));
        setVolume24h(Number(p.usd_24h_vol || 0));
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchOrderBook = async () => {
    try {
      const symbol = selectedPair.replace('/', '');
      const u = `https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${encodeURIComponent(symbol)}&limit=25`;
      const r = await fetch(u);
      const j = await r.json();
      const rows = j?.result?.list || [];
      const asks: OrderBookEntry[] = [];
      const bids: OrderBookEntry[] = [];
      for (const row of rows) {
        const [priceStr, qtyStr, side] = Array.isArray(row) ? row : [row.price, row.size, row.side];
        const price = parseFloat(priceStr);
        const qty = parseFloat(qtyStr);
        const item = { price, amount: qty, total: price * qty } as OrderBookEntry;
        if ((row.side || side) === 'Sell') asks.push(item); else bids.push(item);
      }
      setOrderBook({ asks, bids });
    } catch (e) {
      // ignore if CORS
    }
  };

  const updateMarketData = () => {};

  const initializeChart = () => {
    // In a real implementation, this would initialize TradingView or Chart.js
    if (chartRef.current) {
      chartRef.current.innerHTML = `
        <div class="flex items-center justify-center h-full bg-gray-50 rounded border border-gray-200">
          <div class="text-center text-gray-600">
            <BarChart3 class="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p class="text-gray-700 font-medium">Advanced Trading Chart</p>
            <p class="text-sm text-gray-500">TradingView Integration</p>
          </div>
        </div>
      `;
    }
  };

  const handlePlaceOrder = async () => {
    if (!amount || (orderType !== "market" && !price)) {
      toast({
        title: "Invalid Order",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const symbol = selectedPair.replace('/', '');
      const body: any = {
        category: 'spot',
        symbol,
        side: orderSide === 'buy' ? 'Buy' : 'Sell',
        orderType: orderType === 'market' ? 'Market' : 'Limit',
        qty: amount,
      };
      if (orderType !== 'market') body.price = price;

      const r = await fetch('/api/crypto/user/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Order failed');

      toast({ title: 'Order Placed', description: `${orderSide.toUpperCase()} ${amount} ${selectedPair.split('/')[0]} submitted` });

      setAmount('');
      setPrice('');
      setStopPrice('');
    } catch (e: any) {
      toast({ title: 'Order Failed', description: e?.message || 'Failed to place order', variant: 'destructive' });
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setOpenOrders((prev) => prev.filter((order) => order.id !== orderId));
    toast({
      title: "Order Cancelled",
      description: "Your order has been cancelled successfully",
    });
  };

  const handleDepositClick = () => {
    setDepositModalOpen(true);
  };

  const handleWithdrawClick = () => {
    if (!isVerified) {
      toast({
        title: "Verification Required",
        description: "You need to complete KYC verification before withdrawing funds.",
        variant: "destructive",
      });
      return;
    }
    setWithdrawModalOpen(true);
  };

  const handleKYCSubmit = async (data: any) => {
    // Mock KYC submission
    return new Promise<{success: boolean}>((resolve) => {
      setTimeout(() => {
        setIsVerified(true);
        resolve({ success: true });
      }, 1500);
    });
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toString();
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-2 md:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-4 min-h-screen">
        {/* Main Trading Area */}
        <div className="lg:col-span-8 space-y-2 md:space-y-4">
          {/* Price Header */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-2 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
                <div className="flex items-center gap-2 md:gap-4">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                    {selectedPair}
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsWatchlisted(!isWatchlisted)}
                    className={`h-6 w-6 md:h-8 md:w-8 ${isWatchlisted ? "text-yellow-500" : "text-gray-400"}`}
                  >
                    <Bookmark className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="min-w-0">
                    <div className="text-lg md:text-2xl font-bold text-gray-900">
                      ${formatNumber(currentPrice)}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm md:text-base ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {priceChange >= 0 ? (
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      ) : (
                        <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                      <span
                        className={`text-xs md:text-sm whitespace-nowrap ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {priceChange >= 0 ? "+" : ""}
                        {formatNumber(priceChange)} (
                        {priceChangePercent >= 0 ? "+" : ""}
                        {formatNumber(priceChangePercent, 3)}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right min-w-0">
                    <div className="text-xs md:text-sm text-gray-600">
                      24h Volume
                    </div>
                    <div className="font-medium text-sm md:text-base text-gray-900">
                      {formatVolume(volume24h)} USDT
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-2 md:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm md:text-lg text-gray-900">
                  Price Chart
                </CardTitle>
                <div className="flex items-center gap-1 md:gap-2">
                  <Select
                    value={chartTimeframe}
                    onValueChange={setChartTimeframe}
                  >
                    <SelectTrigger className="w-12 md:w-20 bg-white border-gray-300 text-gray-900 text-xs md:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="1m" className="text-gray-900">
                        1m
                      </SelectItem>
                      <SelectItem value="5m" className="text-gray-900">
                        5m
                      </SelectItem>
                      <SelectItem value="15m" className="text-gray-900">
                        15m
                      </SelectItem>
                      <SelectItem value="1h" className="text-gray-900">
                        1h
                      </SelectItem>
                      <SelectItem value="4h" className="text-gray-900">
                        4h
                      </SelectItem>
                      <SelectItem value="1d" className="text-gray-900">
                        1d
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 md:h-8 md:w-8 text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={chartRef}
                className="h-48 md:h-96 bg-gray-50 rounded border border-gray-200"
              ></div>
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900">
                Recent Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-4 text-xs text-gray-600 pb-2 border-b border-gray-200 font-medium">
                  <span>Price</span>
                  <span>Amount</span>
                  <span>Total</span>
                  <span>Time</span>
                </div>
                {recentTrades.map((trade, index) => (
                  <div
                    key={`${trade.id}-${index}-adv`}
                    className="grid grid-cols-4 text-sm py-1 hover:bg-gray-50 rounded px-1"
                  >
                    <span
                      className={
                        trade.type === "buy"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      ${formatNumber(trade.price)}
                    </span>
                    <span className="text-gray-700">
                      {formatNumber(trade.amount, 4)}
                    </span>
                    <span className="text-gray-700">
                      ${formatNumber(trade.price * trade.amount)}
                    </span>
                    <span className="text-gray-500">{trade.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Book & Trading Panel */}
        <div className="lg:col-span-4 space-y-2 md:space-y-4">
          {/* Order Book */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900">
                Order Book
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Asks */}
                <div className="space-y-1">
                  <div className="grid grid-cols-3 text-xs text-gray-600 pb-1 font-medium">
                    <span>Price</span>
                    <span>Amount</span>
                    <span>Total</span>
                  </div>
                  {orderBook.asks
                    .slice(0, 8)
                    .reverse()
                    .map((ask, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 text-xs py-0.5 hover:bg-red-50 cursor-pointer rounded px-1"
                      >
                        <span className="text-red-600 font-medium">
                          ${formatNumber(ask.price)}
                        </span>
                        <span className="text-gray-700">
                          {formatNumber(ask.amount, 4)}
                        </span>
                        <span className="text-gray-700">
                          {formatNumber(ask.total)}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Spread */}
                <div className="py-2 text-center border-y border-gray-200 bg-gray-50">
                  <span className="text-lg font-bold text-gray-900">
                    ${formatNumber(currentPrice)}
                  </span>
                  <div className="text-xs text-gray-600">
                    Spread: $
                    {formatNumber(
                      orderBook.asks[0]?.price - orderBook.bids[0]?.price || 0,
                    )}
                  </div>
                </div>

                {/* Bids */}
                <div className="space-y-1">
                  {orderBook.bids.slice(0, 8).map((bid, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-3 text-xs py-0.5 hover:bg-green-50 cursor-pointer rounded px-1"
                    >
                      <span className="text-green-600 font-medium">
                        ${formatNumber(bid.price)}
                      </span>
                      <span className="text-gray-700">
                        {formatNumber(bid.amount, 4)}
                      </span>
                      <span className="text-gray-700">
                        {formatNumber(bid.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trading Panel */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900">
                Place Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Type */}
              <Tabs
                value={orderType}
                onValueChange={(value) => setOrderType(value as any)}
              >
                <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                  <TabsTrigger
                    value="limit"
                    className="text-xs text-gray-600 data-[state=active]:text-gray-900"
                  >
                    Limit
                  </TabsTrigger>
                  <TabsTrigger
                    value="market"
                    className="text-xs text-gray-600 data-[state=active]:text-gray-900"
                  >
                    Market
                  </TabsTrigger>
                  <TabsTrigger
                    value="stop-loss"
                    className="text-xs text-gray-600 data-[state=active]:text-gray-900"
                  >
                    Stop
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Buy/Sell Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={orderSide === "buy" ? "default" : "outline"}
                  onClick={() => setOrderSide("buy")}
                  className={
                    orderSide === "buy" ? "bg-green-600 hover:bg-green-700" : ""
                  }
                >
                  Buy
                </Button>
                <Button
                  variant={orderSide === "sell" ? "default" : "outline"}
                  onClick={() => setOrderSide("sell")}
                  className={
                    orderSide === "sell" ? "bg-red-600 hover:bg-red-700" : ""
                  }
                >
                  Sell
                </Button>
              </div>

              {/* Order Inputs */}
              <div className="space-y-3">
                {orderType !== "market" && (
                  <div>
                    <label className="text-sm text-gray-700 font-medium block mb-1">
                      Price (USDT)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                )}

                {orderType === "stop-loss" && (
                  <div>
                    <label className="text-sm text-gray-700 font-medium block mb-1">
                      Stop Price (USDT)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={stopPrice}
                      onChange={(e) => setStopPrice(e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-700 font-medium block mb-1">
                    Amount ({selectedPair.split("/")[0]})
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                {/* Percentage Buttons */}
                <div className="grid grid-cols-4 gap-1">
                  {[25, 50, 75, 100].map((percent) => (
                    <Button
                      key={percent}
                      variant="outline"
                      size="sm"
                      className="text-xs text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => {
                        // Calculate amount based on percentage of available balance
                        const mockBalance = 1.5; // Mock balance
                        setAmount(((mockBalance * percent) / 100).toFixed(4));
                      }}
                    >
                      {percent}%
                    </Button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">Total:</span>
                  <span className="text-gray-900 font-medium">
                    {amount && price
                      ? `${formatNumber(parseFloat(amount) * parseFloat(price))} USDT`
                      : "0.00 USDT"}
                  </span>
                </div>
              </div>

              {/* Wallet Actions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDepositClick}
                  className="text-xs"
                >
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWithdrawClick}
                  className="text-xs"
                  disabled={!isVerified}
                >
                  Withdraw
                </Button>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                className={`w-full ${
                  orderSide === "buy"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {orderSide === "buy" ? "Buy" : "Sell"}{" "}
                {selectedPair.split("/")[0]}
              </Button>
            </CardContent>
          </Card>

          {/* Open Orders */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900">
                Open Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {openOrders.length > 0 ? (
                  openOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-2 bg-gray-50 rounded text-xs border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <Badge
                          variant={
                            order.side === "buy" ? "default" : "destructive"
                          }
                          className="text-white"
                        >
                          {order.side.toUpperCase()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm py-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="text-gray-900 font-medium">
                            {order.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="text-gray-900 font-medium">
                            {formatNumber(order.amount, 4)}
                          </span>
                        </div>
                        {order.price && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="text-gray-900 font-medium">
                              ${formatNumber(order.price)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-600 py-4">
                    <p>No open orders</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CryptoDepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        onKYCSubmit={handleKYCSubmit}
      />

      <CryptoWithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onKYCSubmit={handleKYCSubmit}
      />

      <CryptoKYCModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        onSubmit={handleKYCSubmit}
      />
    </div>
  );
};

export default AdvancedTradingInterface;
