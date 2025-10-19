// @ts-nocheck
import { apiCall } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { CryptoService } from "./cryptoService";

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

class WalletServiceClass {
  async getWallet(): Promise<Wallet> {
    const response = await apiCall("/api/wallet");
    return response.wallet;
  }

  async getWalletBalance(): Promise<WalletBalance> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          total: 0,
          crypto: 0,
          ecommerce: 0,
          rewards: 0,
          freelance: 0,
        };
      }

      // Call unified wallet API endpoint instead of making multiple Supabase queries
      const response = await apiCall(`/api/wallet/balance?userId=${user.id}`);

      if (response?.data?.balances) {
        return {
          total: response.data.balances.total || 0,
          crypto: response.data.balances.crypto || 0,
          ecommerce: response.data.balances.marketplace || 0,
          rewards: response.data.balances.rewards || 0,
          freelance: response.data.balances.freelance || 0,
        };
      }

      // Fallback to zero balances if API fails
      return {
        total: 0,
        crypto: 0,
        ecommerce: 0,
        rewards: 0,
        freelance: 0,
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return {
        total: 0,
        crypto: 0,
        ecommerce: 0,
        rewards: 0,
        freelance: 0,
      };
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Call unified wallet transactions endpoint
      const response = await apiCall(`/api/wallet/transactions?userId=${user.id}&limit=50`);

      if (response?.data?.transactions && Array.isArray(response.data.transactions)) {
        // Format transactions from server response
        return response.data.transactions.map((tx: any) => ({
          id: tx.id,
          type: tx.type || 'transfer',
          amount: parseFloat(tx.amount.toString()),
          currency: tx.currency || 'USD',
          source: tx.source || 'unknown',
          description: `${tx.type} - ${tx.source}`,
          status: tx.status || 'completed',
          timestamp: tx.created_at,
          createdAt: tx.created_at,
        })).slice(0, 20);
      }

      return [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const limit = params?.limit || 20;
      const offset = params?.offset || 0;

      let query = supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (params?.type) {
        query = query.eq('transaction_type', params.type);
      }

      if (params?.currency) {
        query = query.eq('crypto_type', params.currency);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(tx => ({
        id: tx.id,
        type: tx.transaction_type === 'deposit' ? 'earned' : 'withdrawal',
        amount: tx.amount.toString(),
        currency: tx.crypto_type,
        source: 'crypto',
        description: `${tx.transaction_type} - ${tx.crypto_type}`,
        status: tx.status,
        timestamp: tx.created_at,
        createdAt: tx.created_at,
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
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
