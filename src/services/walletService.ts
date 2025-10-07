// @ts-nocheck
import { apiCall } from "@/lib/api";

export interface Wallet {
  id: string;
  userId: string;
  usdtBalance: string;
  ethBalance: string;
  btcBalance: string;
  eloitsBalance: string;
  isFrozen: boolean;
  createdAt: string;
}

export interface WalletBalance {
  total: number;
  ecommerce: number;
  crypto: number;
  rewards: number;
  freelance: number;
}

export interface Transaction {
  id: string;
  type: string;
  currency: string;
  amount: string;
  description: string;
  status: string;
  createdAt: string;
  source?: string;
  timestamp?: string;
}

export interface SendMoneyRequest {
  recipientId: string;
  amount: string;
  currency: string;
  description?: string;
}

// Centralized balance data - single source of truth
const CENTRALIZED_BALANCE_DATA = {
  crypto: 125670.45, // Matches cryptoService.ts mockPortfolio totalValue
  ecommerce: 8947.32,
  rewards: 3245.18,
  freelance: 12890.67,
};

// Calculate total from individual sources
const TOTAL_BALANCE =
  CENTRALIZED_BALANCE_DATA.crypto +
  CENTRALIZED_BALANCE_DATA.ecommerce +
  CENTRALIZED_BALANCE_DATA.rewards +
  CENTRALIZED_BALANCE_DATA.freelance;

class WalletServiceClass {
  async getWallet(): Promise<Wallet> {
    const response = await apiCall("/api/wallet");
    return response.wallet;
  }

  async getWalletBalance(): Promise<WalletBalance> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      total: TOTAL_BALANCE,
      crypto: CENTRALIZED_BALANCE_DATA.crypto,
      ecommerce: CENTRALIZED_BALANCE_DATA.ecommerce,
      rewards: CENTRALIZED_BALANCE_DATA.rewards,
      freelance: CENTRALIZED_BALANCE_DATA.freelance,
    };
  }

  async getTransactions(): Promise<Transaction[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    return [
      {
        id: "1",
        type: "earned",
        amount: 2450.00,
        source: "crypto",
        description: "Bitcoin trading profit",
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: "completed",
      },
      {
        id: "2",
        type: "earned",
        amount: 850.50,
        source: "freelance",
        description: "Project completion payment",
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: "completed",
      },
      {
        id: "3",
        type: "earned",
        amount: 125.75,
        source: "rewards",
        description: "Daily activity bonus",
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        status: "completed",
      },
      {
        id: "4",
        type: "earned",
        amount: 1200.00,
        source: "ecommerce",
        description: "Product sales revenue",
        timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        status: "completed",
      },
      {
        id: "5",
        type: "withdrawal",
        amount: -500.00,
        source: "bank",
        description: "ATM withdrawal",
        timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        status: "completed",
      },
    ];
  }

  async sendMoney(
    data: SendMoneyRequest,
  ): Promise<{ success: boolean; transactionId: string }> {
    const response = await apiCall("/api/wallet/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  }

  async getTransactionHistory(params?: {
    limit?: number;
    offset?: number;
    type?: string;
    currency?: string;
  }): Promise<Transaction[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.currency) queryParams.append("currency", params.currency);

    const response = await apiCall(
      `/api/wallet/history?${queryParams.toString()}`,
    );
    return response.transactions;
  }

  static formatBalance(balance: string, currency: string): string {
    const amount = parseFloat(balance);

    switch (currency) {
      case "USDT":
        return `$${amount.toLocaleString()}`;
      case "ETH":
        return `${amount.toFixed(4)} ETH`;
      case "BTC":
        return `${amount.toFixed(6)} BTC`;
      case "ELOITS":
        return `${amount.toLocaleString()} ELO`;
      default:
        return `${amount} ${currency}`;
    }
  }

  static getCurrencyIcon(currency: string): string {
    switch (currency) {
      case "USDT":
        return "💵";
      case "ETH":
        return "💎";
      case "BTC":
        return "₿";
      case "ELOITS":
        return "⭐";
      default:
        return "💰";
    }
  }
}

// Export both class and instance to support existing and new code
export const WalletService = WalletServiceClass;
export const walletService = new WalletServiceClass();
