// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  walletService,
  WalletService,
  type Wallet,
} from "@/services/walletService";
import { Wallet as WalletIcon, Send, History, CreditCard } from "lucide-react";

export function WalletWidget() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const walletData = await walletService.getWallet();
      setWallet(walletData);
      setError(null);
    } catch (err) {
      console.error("Wallet error:", err);
      // Use demo wallet data when API fails
      setWallet({
        usdtBalance: 1247.5,
        ethBalance: 0.5432,
        btcBalance: 0.0089,
        eloityPointsBalance: 8420,
      });
      setError("Demo data - API not available");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !wallet) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={loadWallet} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balances = [
    { currency: "USDT", amount: wallet.usdtBalance },
    { currency: "ETH", amount: wallet.ethBalance },
    { currency: "BTC", amount: wallet.btcBalance },
    { currency: "ELOITY_POINTS", amount: wallet.eloityPointsBalance },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <WalletIcon className="h-4 w-4" />
          My Wallet
        </CardTitle>
        {wallet.isFrozen && <Badge variant="destructive">Frozen</Badge>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {balances.map(({ currency, amount }) => (
            <div key={currency} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {WalletService.getCurrencyIcon(currency)}
                </span>
                <span className="text-sm font-medium">{currency}</span>
              </div>
              <span className="font-mono text-sm">
                {WalletService.formatBalance(amount, currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1">
            <Send className="h-3 w-3 mr-1" />
            Send
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <History className="h-3 w-3 mr-1" />
            History
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <CreditCard className="h-3 w-3 mr-1" />
            Top Up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}