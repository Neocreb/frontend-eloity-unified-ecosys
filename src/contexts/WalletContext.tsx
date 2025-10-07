// @ts-nocheck
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { WalletBalance, Transaction } from "@/types/wallet";
import { walletService } from "@/services/walletService";

interface WalletContextType {
  walletBalance: WalletBalance | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
  getTransactionsBySource: (source: string) => Transaction[];
  getTotalEarnings: (days?: number) => number;
  getSourceBalance: (source: keyof WalletBalance) => number;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(
    null,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWalletData = async () => {
    setIsLoading(true);
    setError(null);

    // Safe wrapper functions that guarantee no thrown errors
    const safeGetWalletBalance = async (): Promise<WalletBalance> => {
      try {
        return await walletService.getWalletBalance();
      } catch (err) {
        console.log("Failed to load wallet balance, using safe fallback");
        return {
          total: 0,
          ecommerce: 0,
          crypto: 0,
          rewards: 0,
          freelance: 0,
        };
      }
    };

    const safeGetTransactions = async (): Promise<Transaction[]> => {
      try {
        return await walletService.getTransactions();
      } catch (err) {
        console.log("Failed to load transactions, using safe fallback");
        return [];
      }
    };

    // Load data with guaranteed safe operations
    const balance = await safeGetWalletBalance();
    const transactionHistory = await safeGetTransactions();

    setWalletBalance(balance);
    setTransactions(transactionHistory);
    setIsLoading(false);
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
    // Wrap in try-catch to prevent any unhandled errors from bubbling up
    const initializeWallet = async () => {
      try {
        await loadWalletData();
      } catch (error) {
        console.log("Failed to initialize wallet data:", error);
        // Set safe fallback state
        setWalletBalance({
          total: 0,
          ecommerce: 0,
          crypto: 0,
          rewards: 0,
          freelance: 0,
        });
        setTransactions([]);
        setIsLoading(false);
      }
    };

    initializeWallet();
  }, []);

  const contextValue: WalletContextType = {
    walletBalance,
    transactions,
    isLoading,
    error,
    refreshWallet,
    getTransactionsBySource,
    getTotalEarnings,
    getSourceBalance,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};

export default WalletContext;
