// @ts-nocheck
import { useState, useEffect } from "react";
import { WalletBalance, Transaction } from "@/types/wallet";
import { walletService } from "@/services/walletService";

export const useWallet = () => {
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(
    null,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [balance, transactionHistory] = await Promise.all([
        walletService.getWalletBalance(),
        walletService.getTransactions(),
      ]);

      setWalletBalance(balance);
      setTransactions(transactionHistory);
    } catch (err) {
      setError("Failed to load wallet data");
      console.error("Wallet data loading error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWallet = async () => {
    await loadWalletData();
  };

  const getTransactionsBySource = (source: string) => {
    return transactions.filter((t) => t.source === source);
  };

  const getTotalEarnings = (days: number = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return transactions
      .filter((t) => new Date(t.timestamp) >= cutoffDate && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getSourceBalance = (source: keyof WalletBalance) => {
    return walletBalance?.[source] || 0;
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  return {
    walletBalance,
    transactions,
    isLoading,
    error,
    refreshWallet,
    getTransactionsBySource,
    getTotalEarnings,
    getSourceBalance,
    loadWalletData,
  };
};

export default useWallet;
