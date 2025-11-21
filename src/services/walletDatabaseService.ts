import { supabase } from "@/integrations/supabase/client";

export interface BankAccountData {
  id?: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountHolderName: string;
  accountHolderPhone?: string;
  countryCode: string;
  currency: string;
  isDefault?: boolean;
  isVerified?: boolean;
}

export interface TransactionData {
  id?: string;
  userId: string;
  transactionType: "deposit" | "withdrawal" | "transfer" | "earned";
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  depositMethod?: "card" | "bank" | "crypto" | "mobile" | "ewallet";
  withdrawalMethod?: "bank" | "username" | "email" | "mobile";
  feeAmount?: number;
  netAmount?: number;
  bankAccountId?: string;
  recipientUsername?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  description?: string;
  referenceId?: string;
  processorResponse?: any;
  metadata?: any;
}

export interface WithdrawalMethodData {
  id?: string;
  userId: string;
  methodType: "bank_account" | "username" | "email" | "mobile_money";
  displayName?: string;
  bankAccountId?: string;
  username?: string;
  email?: string;
  mobilePhone?: string;
  mobileProvider?: string;
  isDefault?: boolean;
  isActive?: boolean;
  lastUsedAt?: string;
}

class WalletDatabaseService {
  // ========== BANK ACCOUNTS ==========

  /**
   * Create a new bank account
   */
  async createBankAccount(userId: string, data: BankAccountData): Promise<BankAccountData> {
    try {
      const { data: result, error } = await supabase
        .from("bank_accounts")
        .insert({
          user_id: userId,
          account_name: data.accountName,
          account_number: data.accountNumber,
          bank_name: data.bankName,
          account_holder_name: data.accountHolderName,
          account_holder_phone: data.accountHolderPhone,
          country_code: data.countryCode,
          currency: data.currency,
          is_default: data.isDefault || false,
          is_verified: data.isVerified || false,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: result.id,
        accountName: result.account_name,
        accountNumber: result.account_number,
        bankName: result.bank_name,
        accountHolderName: result.account_holder_name,
        accountHolderPhone: result.account_holder_phone,
        countryCode: result.country_code,
        currency: result.currency,
        isDefault: result.is_default,
        isVerified: result.is_verified,
      };
    } catch (err: any) {
      console.error("Error creating bank account:", err);
      throw err;
    }
  }

  /**
   * Get all bank accounts for a user
   */
  async getBankAccounts(userId: string, countryCode?: string): Promise<BankAccountData[]> {
    try {
      let query = supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });

      if (countryCode) {
        query = query.eq("country_code", countryCode);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        accountName: row.account_name,
        accountNumber: row.account_number,
        bankName: row.bank_name,
        accountHolderName: row.account_holder_name,
        accountHolderPhone: row.account_holder_phone,
        countryCode: row.country_code,
        currency: row.currency,
        isDefault: row.is_default,
        isVerified: row.is_verified,
      }));
    } catch (err: any) {
      console.error("Error fetching bank accounts:", err);
      return [];
    }
  }

  /**
   * Get a single bank account by ID
   */
  async getBankAccount(id: string, userId: string): Promise<BankAccountData | null> {
    try {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return {
        id: data.id,
        accountName: data.account_name,
        accountNumber: data.account_number,
        bankName: data.bank_name,
        accountHolderName: data.account_holder_name,
        accountHolderPhone: data.account_holder_phone,
        countryCode: data.country_code,
        currency: data.currency,
        isDefault: data.is_default,
        isVerified: data.is_verified,
      };
    } catch (err: any) {
      console.error("Error fetching bank account:", err);
      return null;
    }
  }

  /**
   * Update a bank account
   */
  async updateBankAccount(id: string, userId: string, data: Partial<BankAccountData>): Promise<BankAccountData | null> {
    try {
      const updateData: any = {};
      if (data.accountName) updateData.account_name = data.accountName;
      if (data.accountHolderPhone) updateData.account_holder_phone = data.accountHolderPhone;
      if (data.isDefault !== undefined) updateData.is_default = data.isDefault;
      if (data.isVerified !== undefined) updateData.is_verified = data.isVerified;

      const { data: result, error } = await supabase
        .from("bank_accounts")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: result.id,
        accountName: result.account_name,
        accountNumber: result.account_number,
        bankName: result.bank_name,
        accountHolderName: result.account_holder_name,
        accountHolderPhone: result.account_holder_phone,
        countryCode: result.country_code,
        currency: result.currency,
        isDefault: result.is_default,
        isVerified: result.is_verified,
      };
    } catch (err: any) {
      console.error("Error updating bank account:", err);
      return null;
    }
  }

  /**
   * Delete a bank account
   */
  async deleteBankAccount(id: string, userId: string): Promise<boolean> {
    try {
      // Check if this is the default account
      const account = await this.getBankAccount(id, userId);
      if (!account) return false;

      if (account.isDefault) {
        // Get other accounts for this user
        const accounts = await this.getBankAccounts(userId);
        const otherAccounts = accounts.filter((a) => a.id !== id);

        if (otherAccounts.length > 0) {
          // Make the first other account the default
          await this.updateBankAccount(otherAccounts[0].id!, userId, { isDefault: true });
        }
      }

      const { error } = await supabase
        .from("bank_accounts")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      return true;
    } catch (err: any) {
      console.error("Error deleting bank account:", err);
      return false;
    }
  }

  /**
   * Set a bank account as default
   */
  async setDefaultBankAccount(id: string, userId: string): Promise<boolean> {
    try {
      // Remove default from all accounts
      await supabase
        .from("bank_accounts")
        .update({ is_default: false })
        .eq("user_id", userId);

      // Set this account as default
      const { error } = await supabase
        .from("bank_accounts")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;

      return true;
    } catch (err: any) {
      console.error("Error setting default bank account:", err);
      return false;
    }
  }

  // ========== TRANSACTIONS ==========

  /**
   * Create a new transaction
   */
  async createTransaction(data: TransactionData): Promise<TransactionData> {
    try {
      const { data: result, error } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: data.userId,
          transaction_type: data.transactionType,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          deposit_method: data.depositMethod,
          withdrawal_method: data.withdrawalMethod,
          fee_amount: data.feeAmount,
          net_amount: data.netAmount,
          bank_account_id: data.bankAccountId,
          recipient_username: data.recipientUsername,
          recipient_email: data.recipientEmail,
          recipient_phone: data.recipientPhone,
          description: data.description,
          reference_id: data.referenceId,
          processor_response: data.processorResponse,
          metadata: data.metadata,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: result.id,
        userId: result.user_id,
        transactionType: result.transaction_type,
        amount: result.amount,
        currency: result.currency,
        status: result.status,
        depositMethod: result.deposit_method,
        withdrawalMethod: result.withdrawal_method,
        feeAmount: result.fee_amount,
        netAmount: result.net_amount,
        bankAccountId: result.bank_account_id,
        recipientUsername: result.recipient_username,
        recipientEmail: result.recipient_email,
        recipientPhone: result.recipient_phone,
        description: result.description,
        referenceId: result.reference_id,
        processorResponse: result.processor_response,
        metadata: result.metadata,
      };
    } catch (err: any) {
      console.error("Error creating transaction:", err);
      throw err;
    }
  }

  /**
   * Get transactions for a user
   */
  async getTransactions(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: string;
      type?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{ transactions: TransactionData[]; total: number }> {
    try {
      let query = supabase
        .from("wallet_transactions")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (options?.status) {
        query = query.eq("status", options.status);
      }
      if (options?.type) {
        query = query.eq("transaction_type", options.type);
      }
      if (options?.dateFrom) {
        query = query.gte("created_at", options.dateFrom);
      }
      if (options?.dateTo) {
        query = query.lte("created_at", options.dateTo);
      }

      const limit = Math.min(options?.limit || 50, 100);
      const offset = options?.offset || 0;

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        transactions: (data || []).map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          transactionType: row.transaction_type,
          amount: row.amount,
          currency: row.currency,
          status: row.status,
          depositMethod: row.deposit_method,
          withdrawalMethod: row.withdrawal_method,
          feeAmount: row.fee_amount,
          netAmount: row.net_amount,
          bankAccountId: row.bank_account_id,
          recipientUsername: row.recipient_username,
          recipientEmail: row.recipient_email,
          recipientPhone: row.recipient_phone,
          description: row.description,
          referenceId: row.reference_id,
          processorResponse: row.processor_response,
          metadata: row.metadata,
        })),
        total: count || 0,
      };
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      return { transactions: [], total: 0 };
    }
  }

  /**
   * Get a single transaction
   */
  async getTransaction(id: string, userId: string): Promise<TransactionData | null> {
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id,
        transactionType: data.transaction_type,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        depositMethod: data.deposit_method,
        withdrawalMethod: data.withdrawal_method,
        feeAmount: data.fee_amount,
        netAmount: data.net_amount,
        bankAccountId: data.bank_account_id,
        recipientUsername: data.recipient_username,
        recipientEmail: data.recipient_email,
        recipientPhone: data.recipient_phone,
        description: data.description,
        referenceId: data.reference_id,
        processorResponse: data.processor_response,
        metadata: data.metadata,
      };
    } catch (err: any) {
      console.error("Error fetching transaction:", err);
      return null;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    id: string,
    userId: string,
    status: string,
    metadata?: any
  ): Promise<TransactionData | null> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      if (metadata) {
        updateData.metadata = metadata;
      }

      const { data: result, error } = await supabase
        .from("wallet_transactions")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: result.id,
        userId: result.user_id,
        transactionType: result.transaction_type,
        amount: result.amount,
        currency: result.currency,
        status: result.status,
        depositMethod: result.deposit_method,
        withdrawalMethod: result.withdrawal_method,
        feeAmount: result.fee_amount,
        netAmount: result.net_amount,
        bankAccountId: result.bank_account_id,
        recipientUsername: result.recipient_username,
        recipientEmail: result.recipient_email,
        recipientPhone: result.recipient_phone,
        description: result.description,
        referenceId: result.reference_id,
        processorResponse: result.processor_response,
        metadata: result.metadata,
      };
    } catch (err: any) {
      console.error("Error updating transaction status:", err);
      return null;
    }
  }

  // ========== WITHDRAWAL METHODS ==========

  /**
   * Create a withdrawal method preference
   */
  async createWithdrawalMethod(userId: string, data: WithdrawalMethodData): Promise<WithdrawalMethodData> {
    try {
      const { data: result, error } = await supabase
        .from("withdrawal_methods")
        .insert({
          user_id: userId,
          method_type: data.methodType,
          display_name: data.displayName,
          bank_account_id: data.bankAccountId,
          username: data.username,
          email: data.email,
          mobile_phone: data.mobilePhone,
          mobile_provider: data.mobileProvider,
          is_default: data.isDefault || false,
          is_active: data.isActive !== false,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: result.id,
        userId: result.user_id,
        methodType: result.method_type,
        displayName: result.display_name,
        bankAccountId: result.bank_account_id,
        username: result.username,
        email: result.email,
        mobilePhone: result.mobile_phone,
        mobileProvider: result.mobile_provider,
        isDefault: result.is_default,
        isActive: result.is_active,
      };
    } catch (err: any) {
      console.error("Error creating withdrawal method:", err);
      throw err;
    }
  }

  /**
   * Get withdrawal methods for a user
   */
  async getWithdrawalMethods(userId: string): Promise<WithdrawalMethodData[]> {
    try {
      const { data, error } = await supabase
        .from("withdrawal_methods")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("is_default", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        methodType: row.method_type,
        displayName: row.display_name,
        bankAccountId: row.bank_account_id,
        username: row.username,
        email: row.email,
        mobilePhone: row.mobile_phone,
        mobileProvider: row.mobile_provider,
        isDefault: row.is_default,
        isActive: row.is_active,
        lastUsedAt: row.last_used_at,
      }));
    } catch (err: any) {
      console.error("Error fetching withdrawal methods:", err);
      return [];
    }
  }

  /**
   * Get daily transaction summary
   */
  async getDailyTransactionSummary(userId: string, date: string): Promise<{ deposited: number; withdrawn: number }> {
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("transaction_type, amount, status")
        .eq("user_id", userId)
        .gte("created_at", `${date}T00:00:00Z`)
        .lt("created_at", `${date}T23:59:59Z`)
        .eq("status", "completed");

      if (error) throw error;

      const summary = {
        deposited: 0,
        withdrawn: 0,
      };

      (data || []).forEach((tx: any) => {
        if (tx.transaction_type === "deposit") {
          summary.deposited += tx.amount;
        } else if (tx.transaction_type === "withdrawal") {
          summary.withdrawn += tx.amount;
        }
      });

      return summary;
    } catch (err: any) {
      console.error("Error fetching daily summary:", err);
      return { deposited: 0, withdrawn: 0 };
    }
  }
}

export const walletDatabaseService = new WalletDatabaseService();
