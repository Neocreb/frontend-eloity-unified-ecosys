import { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Copy,
  QrCode,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ArrowDownLeft,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CryptoCurrency {
  symbol: string;
  name: string;
  network: string;
  chainType?: string;
  icon: string;
  minDeposit: number;
  confirmations: number;
  address?: string;
  memo?: string;
  fees: string;
  color: string;
}

const supportedCryptos: CryptoCurrency[] = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", chainType: "BTC", icon: "₿", minDeposit: 0.0001, confirmations: 3, fees: "Network fee varies", color: "text-orange-500" },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum (ERC-20)", chainType: "ETH", icon: "Ξ", minDeposit: 0.001, confirmations: 12, fees: "Gas fees apply", color: "text-blue-500" },
  { symbol: "USDT", name: "Tether USD", network: "Ethereum (ERC-20)", chainType: "ERC20", icon: "₮", minDeposit: 1, confirmations: 12, fees: "Gas fees apply", color: "text-green-500" },
  { symbol: "USDC", name: "USD Coin", network: "Ethereum (ERC-20)", chainType: "ERC20", icon: "$", minDeposit: 1, confirmations: 12, fees: "Gas fees apply", color: "text-blue-600" },
  { symbol: "SOL", name: "Solana", network: "Solana", chainType: "SOL", icon: "◎", minDeposit: 0.01, confirmations: 1, fees: "0.000005 SOL", color: "text-purple-500" },
  { symbol: "ADA", name: "Cardano", network: "Cardano", chainType: "ADA", icon: "₳", minDeposit: 1, confirmations: 15, fees: "~0.17 ADA", color: "text-indigo-500" },
  { symbol: "MATIC", name: "Polygon", network: "Polygon", chainType: "MATIC", icon: "⬟", minDeposit: 1, confirmations: 128, fees: "~0.01 MATIC", color: "text-purple-600" },
  { symbol: "LTC", name: "Litecoin", network: "Litecoin", chainType: "LTC", icon: "Ł", minDeposit: 0.001, confirmations: 6, fees: "~0.001 LTC", color: "text-gray-500" },
];

export default function CryptoDeposit() {
  const navigate = useNavigate();
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency | null>(
    supportedCryptos[0]
  );
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAddress = async () => {
      if (!selectedCrypto) return;
      try {
        setIsLoading(true);
        const params = new URLSearchParams({ coin: selectedCrypto.symbol });
        if (selectedCrypto.chainType) params.set('chainType', selectedCrypto.chainType);
        const r = await fetch(`/api/bybit/deposit-address?${params.toString()}`);
        const j = await r.json();
        const addr = j?.result?.address || j?.result?.chains?.[0]?.address || j?.address;
        const memo = j?.result?.tag || j?.result?.memo || j?.memo;
        setSelectedCrypto((prev) => prev ? { ...prev, address: addr || prev.address, memo: memo || prev.memo } : prev);
      } catch (e) {
        // keep existing
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddress();
  }, [selectedCrypto?.symbol]);

  const handleCopyAddress = async () => {
    if (!selectedCrypto) return;
    
    try {
      await navigator.clipboard.writeText(selectedCrypto.address || "");
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
    try {
      toast({
        title: "Deposit Address Ready",
        description: selectedCrypto?.address ? `${selectedCrypto?.symbol} address generated` : `Address unavailable. Try again later.`,
      });
      navigate(-1);
    } finally {
      setIsLoading(false);
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
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Deposit Cryptocurrency</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-4 sm:space-y-6">
          {/* Crypto Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Cryptocurrency</Label>
            <Select
              value={selectedCrypto?.symbol}
              onValueChange={(symbol) => {
                const crypto = supportedCryptos.find(c => c.symbol === symbol);
                setSelectedCrypto(crypto || null);
              }}
            >
              <SelectTrigger className="h-12">
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
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-900/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
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
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                          <div className="text-muted-foreground text-xs mb-1">Min Deposit</div>
                          <div className="font-semibold">
                            {selectedCrypto.minDeposit} {selectedCrypto.symbol}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                          <div className="text-muted-foreground text-xs mb-1">Confirmations</div>
                          <div className="font-semibold">{selectedCrypto.confirmations}</div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {selectedCrypto.fees}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Deposit Address */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Deposit Address</Label>
                <Card className="dark:bg-gray-900/50">
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                      <span className="text-sm font-medium">
                        {selectedCrypto.network} Address
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowQR(!showQR)}
                          className="h-9 px-3"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopyAddress}
                          className="h-9 px-3"
                        >
                          {copiedAddress ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-xs sm:text-sm break-all border border-gray-200 dark:border-gray-700">
                      {selectedCrypto.address || "Loading..."}
                    </div>

                    {showQR && (
                      <div className="flex justify-center p-4 bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <QrCode className="h-24 w-24 text-gray-400" />
                          <span className="sr-only">QR Code for {selectedCrypto.address}</span>
                        </div>
                      </div>
                    )}

                    {selectedCrypto.memo && (
                      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
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
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm border border-gray-200 dark:border-gray-700">
                          {selectedCrypto.memo}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Important Warnings */}
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900/50">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                <AlertDescription className="text-sm space-y-2 text-yellow-800 dark:text-yellow-100">
                  <div className="font-semibold">Important Security Notes:</div>
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
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-900/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Processing Time</div>
                      <div className="font-semibold text-base">
                        {selectedCrypto.confirmations === 1 ? 
                          "~30 seconds" : 
                          `${selectedCrypto.confirmations * 10}-${selectedCrypto.confirmations * 15} minutes`
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Network Fee</div>
                      <div className="font-semibold text-base">{selectedCrypto.fees}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
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
            onClick={handleComplete}
            disabled={!selectedCrypto || isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                <span>I've Sent the Funds</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
