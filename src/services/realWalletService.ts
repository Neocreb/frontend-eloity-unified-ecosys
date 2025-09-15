import { supabase } from "@/integrations/supabase/client";
import { WalletBalance, Transaction } from "@/types/wallet";

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'spent' | 'withdrawal' | 'deposit' | 'transfer';
  amount: number;
  source: 'crypto' | 'ecommerce' | 'freelance' | 'rewards' | 'social' | 'referral';
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

class RealWalletService {
  async getWalletBalance(userId?: string): Promise<WalletBalance> {
    const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) throw new Error("User not authenticated");

    // Get wallet record or create if doesn't exist
    let { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', currentUserId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Wallet doesn't exist, create it
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: currentUserId,
          crypto_balance: 0,
          ecommerce_balance: 0,
          freelance_balance: 0,
          rewards_balance: 0,
          total_balance: 0
        })
        .select('*')
        .single();

      if (createError) throw createError;
      wallet = newWallet;
    } else if (error) {
      throw error;
    }

    return {
      total: wallet.total_balance || 0,
      crypto: wallet.crypto_balance || 0,
      ecommerce: wallet.ecommerce_balance || 0,
      freelance: wallet.freelance_balance || 0,
      rewards: wallet.rewards_balance || 0
    };
  }

  async getTransactions(userId?: string, filters?: {
    source?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<Transaction[]> {
    const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) throw new Error("User not authenticated");

    let query = supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', currentUserId);

    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(filters?.limit || 50)
      .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 50) - 1);

    if (error) throw error;

    return data?.map(this.mapDatabaseToTransaction) || [];
  }

  async addTransaction(transaction: {
    type: 'earned' | 'spent' | 'withdrawal' | 'deposit' | 'transfer';
    amount: number;
    source: 'crypto' | 'ecommerce' | 'freelance' | 'rewards' | 'social' | 'referral';
    description: string;
    metadata?: Record<string, any>;
    userId?: string;
  }): Promise<WalletTransaction> {
    const currentUserId = transaction.userId || (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) throw new Error("User not authenticated");

    const transactionData = {
      user_id: currentUserId,
      type: transaction.type,
      amount: transaction.amount,
      source: transaction.source,
      description: transaction.description,
      status: 'completed',
      metadata: transaction.metadata || {}
    };

    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert(transactionData)
      .select('*')
      .single();

    if (error) throw error;

    // Update wallet balance
    await this.updateWalletBalance(currentUserId, transaction.source, transaction.amount, transaction.type);

    return this.mapDatabaseToWalletTransaction(data);
  }

  async transferFunds(fromSource: string, toSource: string, amount: number, description?: string): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    // Check if user has sufficient balance
    const balance = await this.getWalletBalance(userId);
    const sourceBalance = balance[fromSource as keyof WalletBalance] || 0;
    
    if (sourceBalance < amount) {
      throw new Error("Insufficient balance");
    }

    // Create transfer out transaction
    await this.addTransaction({
      type: 'transfer',
      amount: -amount,
      source: fromSource as any,
      description: description || `Transfer to ${toSource}`,
      userId
    });

    // Create transfer in transaction
    await this.addTransaction({
      type: 'transfer',
      amount: amount,
      source: toSource as any,
      description: description || `Transfer from ${fromSource}`,
      userId
    });

    return true;
  }

  async withdrawal(amount: number, bankDetails: any): Promise<WalletTransaction> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const balance = await this.getWalletBalance(userId);
    if (balance.total < amount) {
      throw new Error("Insufficient balance");
    }

    return await this.addTransaction({
      type: 'withdrawal',
      amount: -amount,
      source: 'ecommerce', // Default to ecommerce for withdrawals
      description: `Withdrawal to ${bankDetails.bankName} ****${bankDetails.accountNumber.slice(-4)}`,
      metadata: { bankDetails },
      userId
    });
  }

  private async updateWalletBalance(
    userId: string, 
    source: string, 
    amount: number, 
    type: 'earned' | 'spent' | 'withdrawal' | 'deposit' | 'transfer'
  ): Promise<void> {
    const multiplier = ['earned', 'deposit'].includes(type) ? 1 : -1;
    const adjustedAmount = amount * multiplier;

    const sourceField = `${source}_balance`;
    
    // Update source balance and total balance
    const { error } = await supabase.rpc('update_wallet_balance', {
      user_id: userId,
      source_field: sourceField,
      amount_change: adjustedAmount
    });

    if (error) {
      console.error('Error updating wallet balance:', error);
      // Fallback to manual update if RPC function doesn't exist
      const { data: currentWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (currentWallet) {
        const updateData: any = {};
        updateData[sourceField] = (currentWallet[sourceField] || 0) + adjustedAmount;
        updateData.total_balance = (currentWallet.total_balance || 0) + adjustedAmount;

        await supabase
          .from('wallets')
          .update(updateData)
          .eq('user_id', userId);
      }
    }
  }

  // Earnings tracking for different sources
  async recordEcommerceEarning(amount: number, orderId: string, description: string): Promise<void> {
    await this.addTransaction({
      type: 'earned',
      amount,
      source: 'ecommerce',
      description,
      metadata: { orderId }
    });
  }

  async recordFreelanceEarning(amount: number, projectId: string, description: string): Promise<void> {
    await this.addTransaction({
      type: 'earned',
      amount,
      source: 'freelance', 
      description,
      metadata: { projectId }
    });
  }

  async recordRewardEarning(amount: number, activityType: string, description: string): Promise<void> {
    await this.addTransaction({
      type: 'earned',
      amount,
      source: 'rewards',
      description,
      metadata: { activityType }
    });
  }

  async recordCryptoEarning(amount: number, transactionHash: string, description: string): Promise<void> {
    await this.addTransaction({
      type: 'earned',
      amount,
      source: 'crypto',
      description,
      metadata: { transactionHash }
    });
  }

  // Helper mapping functions
  private mapDatabaseToTransaction(data: any): Transaction {
    return {
      id: data.id,
      type: data.type,
      currency: 'USD', // Default currency
      amount: data.amount.toString(),
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
      source: data.source,
      timestamp: data.created_at
    };
  }

  private mapDatabaseToWalletTransaction(data: any): WalletTransaction {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: data.amount,
      source: data.source,
      description: data.description,
      status: data.status,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const realWalletService = new RealWalletService();