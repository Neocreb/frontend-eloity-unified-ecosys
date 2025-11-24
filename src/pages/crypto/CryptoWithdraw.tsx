import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cryptoNotificationService } from "@/services/cryptoNotificationService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Loader2,
  AlertTriangle,
  ArrowUpRight,
  ChevronLeft,
  Wallet,
  Calculator,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CryptoBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  icon: string;
  color: string;
  network: string;
  minWithdraw: number;
  maxWithdraw: number;
  fee: number;
  feeSymbol: string;
  processingTime: string;
}

const mockBalances: CryptoBalance[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: 2.5,
    usdValue: 108126.68,
    icon: "₿",
    color: "text-orange-500",
    network: "Bitcoin",
    minWithdraw: 0.001,
    maxWithdraw: 2.0,
    fee: 0.0005,
    feeSymbol: "BTC",
    processingTime: "30-60 minutes",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 6.8,
    usdValue: 17593.51,
    icon: "Ξ",
    color: "text-blue-500",
    network: "Ethereum",
    minWithdraw: 0.01,
    maxWithdraw: 10.0,
    fee: 0.005,
    feeSymbol: "ETH",
    processingTime: "5-15 minutes",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    balance: 1543.67,
    usdValue: 1543.67,
    icon: "₮",
    color: "text-green-500",
    network: "Ethereum (ERC-20)",
    minWithdraw: 10,
    maxWithdraw: 10000,
    fee: 25,
    feeSymbol: "USDT",
    processingTime: "5-15 minutes",
  },
  {
    symbol: "SOL",
    name: "Solana",
    balance: 67.89,
    usdValue: 6789.12,
    icon: "◎",
    color: "text-purple-500",
    network: "Solana",
    minWithdraw: 0.1,
    maxWithdraw: 100,
    fee: 0.000005,
    feeSymbol: "SOL",
    processingTime: "1-3 minutes",
  },
];

export default function CryptoWithdraw() {
  const navigate = useNavigate();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoBalance | null>(
    mockBalances[0]
  );
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const calculateReceiveAmount = () => {
    if (!selectedCrypto || !amount) return 0;
    const withdrawAmount = parseFloat(amount);
    return Math.max(0, withdrawAmount - selectedCrypto.fee);
  };

  const calculateUsdValue = () => {
    if (!selectedCrypto || !amount) return 0;
    const withdrawAmount = parseFloat(amount);
    const pricePerToken = selectedCrypto.usdValue / selectedCrypto.balance;
    return withdrawAmount * pricePerToken;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCrypto) return;

    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount < selectedCrypto.minWithdraw) {
      toast({
        title: "Amount Too Small",
        description: `Minimum withdrawal is ${selectedCrypto.minWithdraw} ${selectedCrypto.symbol}`,
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > selectedCrypto.maxWithdraw) {
      toast({
        title: "Amount Too Large",
        description: `Maximum withdrawal is ${selectedCrypto.maxWithdraw} ${selectedCrypto.symbol}`,
        variant: "destructive",
      });
      return;
    }

    if (withdrawAmount > selectedCrypto.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${selectedCrypto.balance} ${selectedCrypto.symbol} available`,
        variant: "destructive",
      });
      return;
    }

    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a valid withdrawal address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const body: any = {
        asset: selectedCrypto.symbol,
        network: selectedCrypto.network,
        address,
        amount: withdrawAmount,
        memo: memo || undefined,
      };
      const r = await fetch('/api/crypto/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Withdraw failed');

      toast({
        title: "Withdrawal Initiated",
        description: `Your ${selectedCrypto.name} withdrawal has been submitted for processing.`,
      });

      if (user?.id) {
        await cryptoNotificationService.notifyWithdrawal(
          user.id,
          selectedCrypto.symbol,
          withdrawAmount,
          "initiated"
        );
      }

      navigate(-1);
      resetForm();
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setAddress("");
    setMemo("");
  };

  const setMaxAmount = () => {
    if (selectedCrypto) {
      const maxAvailable = Math.min(
        selectedCrypto.balance,
        selectedCrypto.maxWithdraw
      );
      setAmount(maxAvailable.toString());
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Withdraw Cryptocurrency</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-4 sm:space-y-6">
          {/* Crypto Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Cryptocurrency</Label>
            <Select
              value={selectedCrypto?.symbol}
              onValueChange={(symbol) => {
                const crypto = mockBalances.find(c => c.symbol === symbol);
                setSelectedCrypto(crypto || null);
                setAmount("");
              }}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Choose a cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {mockBalances.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    <div className="flex items-center justify-between w-full gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className={cn("text-base sm:text-lg font-bold", crypto.color)}>
                          {crypto.icon}
                        </span>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{crypto.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {crypto.network}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-xs sm:text-sm">{crypto.balance} {crypto.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          ${crypto.usdValue.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCrypto && (
              <Card className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20 border-gray-200 dark:border-gray-800">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={cn("text-2xl font-bold", selectedCrypto.color)}>
                        {selectedCrypto.icon}
                      </span>
                      <div>
                        <div className="font-semibold text-lg">{selectedCrypto.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedCrypto.network}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
                        {selectedCrypto.balance} {selectedCrypto.symbol}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-2">
                        ≈ ${selectedCrypto.usdValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {selectedCrypto && (
            <>
              {/* Amount Input */}
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-base font-semibold">Withdrawal Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.00000001"
                    min={selectedCrypto.minWithdraw}
                    max={Math.min(selectedCrypto.balance, selectedCrypto.maxWithdraw)}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pr-24 h-12 text-lg"
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {selectedCrypto.symbol}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={setMaxAmount}
                      className="h-7 px-2 text-xs"
                    >
                      MAX
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  <span>
                    Min: {selectedCrypto.minWithdraw} {selectedCrypto.symbol}
                  </span>
                  <span>
                    Max: {Math.min(selectedCrypto.balance, selectedCrypto.maxWithdraw)} {selectedCrypto.symbol}
                  </span>
                </div>

                {amount && (
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    ≈ ${calculateUsdValue().toFixed(2)} USD
                  </div>
                )}
              </div>

              {/* Withdrawal Address */}
              <div className="space-y-3">
                <Label htmlFor="address" className="text-base font-semibold">Withdrawal Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={`Enter ${selectedCrypto.name} address`}
                  className="font-mono text-sm h-12"
                  required
                />
                <p className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  Make sure this is a valid {selectedCrypto.network} address. Transactions cannot be reversed.
                </p>
              </div>

              {/* Memo/Tag (for certain currencies) */}
              {["XRP", "XLM", "BNB"].includes(selectedCrypto.symbol) && (
                <div className="space-y-3">
                  <Label htmlFor="memo" className="text-base font-semibold">Memo/Tag (Optional)</Label>
                  <Input
                    id="memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Enter memo or tag if required"
                    className="h-12"
                  />
                </div>
              )}

              {/* Transaction Summary */}
              {amount && (
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-900/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">Transaction Summary</span>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-muted-foreground">Withdrawal Amount:</span>
                          <span className="font-semibold">{amount} {selectedCrypto.symbol}</span>
                        </div>
                        <div className="flex justify-between bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                          <span className="text-muted-foreground">Network Fee:</span>
                          <span className="font-semibold">
                            {selectedCrypto.fee} {selectedCrypto.feeSymbol}
                          </span>
                        </div>
                        <div className="border-t-2 border-blue-200 dark:border-blue-900/50 pt-3 flex justify-between bg-white dark:bg-gray-900/50 p-3 rounded-lg font-semibold text-green-600 dark:text-green-400">
                          <span>You Will Receive:</span>
                          <span>
                            {calculateReceiveAmount()} {selectedCrypto.symbol}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Processing Time:</span>
                          </div>
                          <span className="font-medium">{selectedCrypto.processingTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Warnings */}
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500" />
                <AlertDescription className="text-sm space-y-2 text-red-800 dark:text-red-100">
                  <div className="font-semibold">Security Reminders:</div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Double-check the withdrawal address - transactions cannot be reversed</li>
                    <li>Ensure the address supports {selectedCrypto.network} network</li>
                    <li>Withdrawals are processed within {selectedCrypto.processingTime}</li>
                    <li>Network fees are automatically deducted from your withdrawal</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </>
          )}
        </form>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-4 px-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCrypto || !amount || !address || isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                <span>Confirm Withdrawal</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
