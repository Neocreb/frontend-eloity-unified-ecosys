import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WalletData {
  id: string;
  user_id: string;
  softpoints_balance: number;
  usdt_balance: number;
  btc_balance: number;
  eth_balance: number;
  sol_balance: number;
  kyc_verified: boolean;
  kyc_level: number;
  created_at: string;
  updated_at: string;
}

export interface CryptoTransaction {
  id: string;
  user_id: string;
  recipient_id?: string;
  transaction_type: 'send' | 'receive' | 'buy' | 'sell' | 'reward' | 'trade';
  crypto_type: string;
  amount: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export const useRealtimeWallet = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch wallet data
  const fetchWallet = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Wallet doesn't exist, create one
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert({
              user_id: user.id,
              softpoints_balance: 0,
              usdt_balance: 0,
              btc_balance: 0,
              eth_balance: 0,
              sol_balance: 0,
              kyc_verified: false,
              kyc_level: 0,
            })
            .select()
            .single();

          if (createError) throw createError;
          setWallet(newWallet);
        } else {
          throw error;
        }
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('crypto_transactions')
        .select('*')
        .or(`user_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [user?.id]);

  // Update wallet balance
  const updateBalance = useCallback(async (
    type: 'softpoints' | 'usdt' | 'btc' | 'eth' | 'sol',
    amount: number,
    operation: 'add' | 'subtract' = 'add'
  ) => {
    if (!user?.id || !wallet) return false;

    try {
      setTransactionLoading(true);
      const balanceField = `${type}_balance`;
      const currentBalance = wallet[balanceField as keyof WalletData] as number;
      const newBalance = operation === 'add' 
        ? currentBalance + amount 
        : currentBalance - amount;

      if (newBalance < 0) {
        toast({
          title: "Insufficient Balance",
          description: `Not enough ${type.toUpperCase()} in your wallet`,
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('wallets')
        .update({ [balanceField]: newBalance })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setWallet(prev => prev ? { ...prev, [balanceField]: newBalance } : null);
      
      return true;
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: "Error",
        description: "Failed to update wallet balance",
        variant: "destructive",
      });
      return false;
    } finally {
      setTransactionLoading(false);
    }
  }, [user?.id, wallet, toast]);

  // Send crypto
  const sendCrypto = useCallback(async (
    recipientId: string,
    cryptoType: string,
    amount: number,
    notes?: string
  ) => {
    if (!user?.id) return false;

    try {
      setTransactionLoading(true);

      // Check balance
      const balanceField = `${cryptoType}_balance` as keyof WalletData;
      const currentBalance = wallet?.[balanceField] as number || 0;
      
      if (currentBalance < amount) {
        toast({
          title: "Insufficient Balance",
          description: `Not enough ${cryptoType.toUpperCase()} in your wallet`,
          variant: "destructive",
        });
        return false;
      }

      // Calculate fee (1% for demo)
      const fee = amount * 0.01;
      const totalDeduction = amount + fee;

      // Create transaction record
      const { error: txError } = await supabase
        .from('crypto_transactions')
        .insert({
          user_id: user.id,
          recipient_id: recipientId,
          transaction_type: 'send',
          crypto_type: cryptoType,
          amount,
          fee,
          status: 'completed',
          notes,
        });

      if (txError) throw txError;

      // Update sender balance
      await updateBalance(cryptoType as any, totalDeduction, 'subtract');

      // Update recipient balance
      const { error: recipientError } = await supabase
        .from('wallets')
        .update({ [balanceField]: supabase.sql`${balanceField} + ${amount}` })
        .eq('user_id', recipientId);

      if (recipientError) throw recipientError;

      toast({
        title: "Transfer Successful",
        description: `Sent ${amount} ${cryptoType.toUpperCase()} successfully`,
      });

      fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error sending crypto:', error);
      toast({
        title: "Transfer Failed",
        description: "Failed to send cryptocurrency",
        variant: "destructive",
      });
      return false;
    } finally {
      setTransactionLoading(false);
    }
  }, [user?.id, wallet, updateBalance, fetchTransactions, toast]);

  // Reward user with softpoints
  const rewardSoftpoints = useCallback(async (
    amount: number,
    action: string,
    relatedId?: string
  ) => {
    if (!user?.id) return false;

    try {
      // Record transaction
      const { error } = await supabase
        .from('crypto_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'reward',
          crypto_type: 'softpoints',
          amount,
          fee: 0,
          status: 'completed',
          notes: `Reward for ${action}`,
        });

      if (error) throw error;

      // Update balance
      const success = await updateBalance('softpoints', amount, 'add');
      
      if (success) {
        toast({
          title: "Reward Earned!",
          description: `+${amount} SoftPoints for ${action}`,
        });
      }

      return success;
    } catch (error) {
      console.error('Error rewarding softpoints:', error);
      return false;
    }
  }, [user?.id, updateBalance, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const walletChannel = supabase
      .channel('wallet_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Wallet updated:', payload);
          setWallet(payload.new as WalletData);
          
          toast({
            title: "Wallet Updated",
            description: "Your wallet balance has been updated",
          });
        }
      )
      .subscribe();

    const transactionChannel = supabase
      .channel('transaction_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crypto_transactions',
        },
        (payload) => {
          const transaction = payload.new as CryptoTransaction;
          if (transaction.user_id === user.id || transaction.recipient_id === user.id) {
            console.log('New transaction:', transaction);
            fetchTransactions();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(transactionChannel);
    };
  }, [user?.id, fetchTransactions, toast]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchWallet();
      fetchTransactions();
    }
  }, [user?.id, fetchWallet, fetchTransactions]);

  return {
    wallet,
    transactions,
    loading,
    transactionLoading,
    updateBalance,
    sendCrypto,
    rewardSoftpoints,
    refetch: fetchWallet,
  };
};