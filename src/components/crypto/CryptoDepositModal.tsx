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
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Copy,
  QrCode,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Wallet,
  ArrowDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CryptoDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onKYCSubmit?: (data: any) => Promise<{success: boolean, error?: any}>;
}

interface CryptoCurrency {
  symbol: string;
  name: string;
  network: string;
  icon: string;
  minDeposit: number;
  confirmations: number;
  address: string;
  memo?: string;
  fees: string;
  color: string;
}

const supportedCryptos: CryptoCurrency[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    network: "Bitcoin",
    icon: "₿",
    minDeposit: 0.0001,
    confirmations: 3,
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    fees: "Network fee varies",
    color: "text-orange-500",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    network: "Ethereum (ERC-20)",
    icon: "Ξ",
    minDeposit: 0.001,
    confirmations: 12,
    address: "0x742c4B8b6bFd7bE086a7A47d4d7fe39F9aE8c2A3",
    fees: "Gas fees apply",
    color: "text-blue-500",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    network: "Ethereum (ERC-20)",
    icon: "₮",
    minDeposit: 1,
    confirmations: 12,
    address: "0x742c4B8b6bFd7bE086a7A47d4d7fe39F9aE8c2A3",
    fees: "Gas fees apply",
    color: "text-green-500",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    network: "Ethereum (ERC-20)",
    icon: "$",
    minDeposit: 1,
    confirmations: 12,
    address: "0x742c4B8b6bFd7bE086a7A47d4d7fe39F9aE8c2A3",
    fees: "Gas fees apply",
    color: "text-blue-600",
  },
  {
    symbol: "SOL",
    name: "Solana",
    network: "Solana",
    icon: "◎",
    minDeposit: 0.01,
    confirmations: 1,
    address: "CuieVDEDJLLHoZvEqBP7HY3oG7KYoNvYVpNgHB34K8r4",
    fees: "0.000005 SOL",
    color: "text-purple-500",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    network: "Cardano",
    icon: "₳",
    minDeposit: 1,
    confirmations: 15,
    address: "addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh8c3k6h9",
    fees: "~0.17 ADA",
    color: "text-indigo-500",
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    network: "Polygon",
    icon: "⬟",
    minDeposit: 1,
    confirmations: 128,
    address: "0x742c4B8b6bFd7bE086a7A47d4d7fe39F9aE8c2A3",
    fees: "~0.01 MATIC",
    color: "text-purple-600",
  },
  {
    symbol: "LTC",
    name: "Litecoin",
    network: "Litecoin",
    icon: "Ł",
    minDeposit: 0.001,
    confirmations: 6,
    address: "ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    fees: "~0.001 LTC",
    color: "text-gray-500",
  },
];

export default function CryptoDepositModal({
  isOpen,
  onClose,
  onSuccess,
  onKYCSubmit,
}: CryptoDepositModalProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency | null>(
    supportedCryptos[0]
  );
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  const handleCopyAddress = async () => {
    if (!selectedCrypto) return;
    
    try {
      await navigator.clipboard.writeText(selectedCrypto.address);
      setCopiedAddress(true);
      toast({
        title: "Address Copied",
        description: "Deposit address copied to clipboard",
      });
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopyMemo = async () => {
    if (!selectedCrypto?.memo) return;
    
    try {
      await navigator.clipboard.writeText(selectedCrypto.memo);
      setCopiedMemo(true);
      toast({
        title: "Memo Copied",
        description: "Memo copied to clipboard",
      });
      setTimeout(() => setCopiedMemo(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy memo to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleComplete = () => {
    setIsLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      toast({
        title: "Deposit Instructions Sent",
        description: `Your ${selectedCrypto?.name} deposit address is ready. Funds will appear after ${selectedCrypto?.confirmations} confirmations.`,
      });
      setIsLoading(false);
      onSuccess?.();
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto crypto-card-premium crypto-border-premium">
        <DialogHeader className="sticky top-0 bg-background/95 backdrop-blur-sm pb-2 border-b crypto-border-premium">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <span className="truncate crypto-text-premium">Deposit Cryptocurrency</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-1">
          {/* Crypto Selection */}
          <div className="space-y-3">
            <Label className="crypto-text-premium">Select Cryptocurrency</Label>
            <Select
              value={selectedCrypto?.symbol}
              onValueChange={(symbol) => {
                const crypto = supportedCryptos.find(c => c.symbol === symbol);
                setSelectedCrypto(crypto || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {supportedCryptos.map((crypto) => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-lg font-bold", crypto.color)}>
                        {crypto.icon}
                      </span>
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {crypto.network}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCrypto && (
            <>
              {/* Network Info */}
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
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
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Min Deposit:</span>
                          <div className="font-medium">
                            {selectedCrypto.minDeposit} {selectedCrypto.symbol}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confirmations:</span>
                          <div className="font-medium">{selectedCrypto.confirmations}</div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedCrypto.fees}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Deposit Address */}
              <div className="space-y-3">
                <Label>Deposit Address</Label>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {selectedCrypto.network} Address
                        </span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQR(!showQR)}
                            className="h-8 px-2"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyAddress}
                            className="h-8 px-2"
                          >
                            {copiedAddress ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm break-all">
                        {selectedCrypto.address}
                      </div>

                      {showQR && (
                        <div className="flex justify-center p-4 bg-white rounded-md">
                          <div className="w-40 h-40 bg-gray-200 rounded-md flex items-center justify-center">
                            <QrCode className="h-16 w-16 text-gray-400" />
                            <span className="sr-only">QR Code for {selectedCrypto.address}</span>
                          </div>
                        </div>
                      )}

                      {selectedCrypto.memo && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Memo/Tag</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCopyMemo}
                              className="h-8 px-2"
                            >
                              {copiedMemo ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm">
                            {selectedCrypto.memo}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Important Warnings */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm space-y-2">
                  <div className="font-medium">Important Security Notes:</div>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Only send {selectedCrypto.name} to this address</li>
                    <li>Sending other cryptocurrencies will result in permanent loss</li>
                    <li>Minimum deposit: {selectedCrypto.minDeposit} {selectedCrypto.symbol}</li>
                    <li>Funds will be credited after {selectedCrypto.confirmations} network confirmations</li>
                    {selectedCrypto.memo && (
                      <li>Always include the memo/tag or your deposit may be lost</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Processing Info */}
              <Card className="bg-gray-50 dark:bg-gray-900/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Processing Time</div>
                      <div className="font-medium">
                        {selectedCrypto.confirmations === 1 ? 
                          "~30 seconds" : 
                          `${selectedCrypto.confirmations * 10}-${selectedCrypto.confirmations * 15} minutes`
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Network Fee</div>
                      <div className="font-medium">{selectedCrypto.fees}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

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
            onClick={handleComplete}
            disabled={!selectedCrypto || isLoading}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm sm:text-base">Processing...</span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">I've Sent the Funds</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
