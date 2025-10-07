import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Wallet,
  Calculator,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CryptoWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onKYCSubmit?: (data: any) => Promise<{success: boolean, error?: any}>;
}

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

// Updated to match centralized crypto balance data from cryptoService.ts
const mockBalances: CryptoBalance[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: 2.5, // Match cryptoService.ts mockPortfolio
    usdValue: 108126.68, // Match cryptoService.ts mockPortfolio
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
    balance: 6.8, // Match cryptoService.ts mockPortfolio
    usdValue: 17593.51, // Match cryptoService.ts mockPortfolio
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

export default function CryptoWithdrawModal({
  isOpen,
  onClose,
  onKYCSubmit,
}: CryptoWithdrawModalProps) {
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

    // Validation
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Withdrawal Initiated",
        description: `Your ${selectedCrypto.name} withdrawal has been submitted for processing.`,
      });

      // Send unified notification
      if (user?.id) {
        await cryptoNotificationService.notifyWithdrawal(
          user.id,
          selectedCrypto.symbol,
          withdrawAmount,
          "initiated"
        );
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto crypto-card-premium crypto-border-premium">
        <DialogHeader className="sticky top-0 bg-background/95 backdrop-blur-sm pb-2 border-b crypto-border-premium">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <span className="truncate crypto-text-premium">Withdraw Cryptocurrency</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 px-1">
          {/* Crypto Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm font-medium crypto-text-premium">Select Cryptocurrency</Label>
            <Select
              value={selectedCrypto?.symbol}
              onValueChange={(symbol) => {
                const crypto = mockBalances.find(c => c.symbol === symbol);
                setSelectedCrypto(crypto || null);
                setAmount(""); // Reset amount when changing crypto
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {mockBalances.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span className={cn("text-base sm:text-lg font-bold flex-shrink-0", crypto.color)}>
                          {crypto.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm sm:text-base truncate">{crypto.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {crypto.network}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
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
              <Card className="bg-gray-50 dark:bg-gray-900/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xl font-bold", selectedCrypto.color)}>
                        {selectedCrypto.icon}
                      </span>
                      <div>
                        <div className="font-semibold">{selectedCrypto.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedCrypto.network}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-green-600">
                        {selectedCrypto.balance} {selectedCrypto.symbol}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
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
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="amount" className="text-sm font-medium crypto-text-premium">Withdrawal Amount</Label>
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
                    className="pr-16"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {selectedCrypto.symbol}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={setMaxAmount}
                      className="h-6 px-2 text-xs"
                    >
                      MAX
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Min: {selectedCrypto.minWithdraw} {selectedCrypto.symbol}
                  </span>
                  <span>
                    Max: {Math.min(selectedCrypto.balance, selectedCrypto.maxWithdraw)} {selectedCrypto.symbol}
                  </span>
                </div>

                {amount && (
                  <div className="text-sm text-muted-foreground">
                    ≈ ${calculateUsdValue().toFixed(2)} USD
                  </div>
                )}
              </div>

              {/* Withdrawal Address */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="address" className="text-sm font-medium crypto-text-premium">Withdrawal Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={`Enter ${selectedCrypto.name} address`}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Make sure this is a valid {selectedCrypto.network} address
                </p>
              </div>

              {/* Memo/Tag (for certain currencies) */}
              {["XRP", "XLM", "BNB"].includes(selectedCrypto.symbol) && (
                <div className="space-y-3">
                  <Label htmlFor="memo">Memo/Tag (Optional)</Label>
                  <Input
                    id="memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Enter memo or tag if required"
                  />
                </div>
              )}

              {/* Transaction Summary */}
              {amount && (
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">Transaction Summary</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Withdrawal Amount:</span>
                          <span className="font-medium">{amount} {selectedCrypto.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Network Fee:</span>
                          <span className="font-medium">
                            {selectedCrypto.fee} {selectedCrypto.feeSymbol}
                          </span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>You Will Receive:</span>
                          <span className="text-green-600">
                            {calculateReceiveAmount()} {selectedCrypto.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Processing Time:</span>
                          <span>{selectedCrypto.processingTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Warnings */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm space-y-2">
                  <div className="font-medium">Security Reminders:</div>
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

        <DialogFooter className="sticky bottom-0 bg-background/95 backdrop-blur-sm pt-4 border-t flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCrypto || !amount || !address || isLoading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm sm:text-base">Processing...</span>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">Confirm Withdrawal</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
