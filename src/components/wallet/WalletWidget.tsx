// @ts-nocheck
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWalletContext } from "@/contexts/WalletContext";
import { Wallet as WalletIcon, Send, History, CreditCard } from "lucide-react";

export function WalletWidget() {
  const { walletBalance, isLoading } = useWalletContext();
  const loading = isLoading;
  const error: string | null = null;

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

  if (error || !walletBalance) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error || "Wallet unavailable"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balances = [
    { label: "Crypto", amount: walletBalance.crypto },
    { label: "Marketplace", amount: walletBalance.ecommerce },
    { label: "Freelance", amount: walletBalance.freelance },
    { label: "Rewards", amount: walletBalance.rewards },
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
          {balances.map(({ label, amount }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{label}</span>
              </div>
              <span className="font-mono text-sm">{amount.toLocaleString()}</span>
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
