import { useState, useEffect, useCallback } from 'react';
import cryptoapisClient from '@/lib/cryptoapis-client';

export interface CryptoTransaction {
  id: string;
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'SEND' | 'RECEIVE';
  asset: string;
  amount: number;
  price: number;
  value: number;
  fee: number;
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  transactionHash?: string;
  fromAddress?: string;
  toAddress?: string;
  blockNumber?: number;
}

export interface UseCryptoTransactionsReturn {
  transactions: CryptoTransaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useCryptoTransactions(
  walletAddress?: string,
  blockchain: string = 'ethereum',
  network: string = 'mainnet',
  limit: number = 50
): UseCryptoTransactionsReturn {
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!walletAddress) {
      setError('Wallet address is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await cryptoapisClient.getAddressHistory(
        blockchain,
        network,
        walletAddress
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch transactions');
      }

      const parsedTransactions = parseTransactions(response.data || [], walletAddress);
      setTransactions(parsedTransactions.slice(0, limit));
      setHasMore(parsedTransactions.length > limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, blockchain, network, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const loadMore = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const response = await cryptoapisClient.getAddressHistory(
        blockchain,
        network,
        walletAddress
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch more transactions');
      }

      const parsedTransactions = parseTransactions(response.data || [], walletAddress);
      const offset = transactions.length;
      const nextBatch = parsedTransactions.slice(offset, offset + limit);

      setTransactions([...transactions, ...nextBatch]);
      setHasMore(parsedTransactions.length > offset + limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, blockchain, network, limit, transactions.length]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    hasMore,
    loadMore,
  };
}

function parseTransactions(data: any, walletAddress: string): CryptoTransaction[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((tx: any, index: number) => {
    const isIncoming = tx.recipientAddress?.toLowerCase() === walletAddress.toLowerCase();
    const txType = isIncoming ? 'RECEIVE' : 'SEND';

    return {
      id: tx.transactionId || `tx_${index}`,
      type: txType as any,
      asset: tx.tokenSymbol || 'ETH',
      amount: parseFloat(tx.amount) || 0,
      price: parseFloat(tx.gasPrice) || 0,
      value: parseFloat(tx.value) || 0,
      fee: parseFloat(tx.gasUsed) || 0,
      timestamp: tx.transactionTimestamp || new Date().toISOString(),
      status: tx.status === 'confirmed' ? 'COMPLETED' : 'PENDING',
      transactionHash: tx.transactionId,
      fromAddress: tx.senderAddress,
      toAddress: tx.recipientAddress,
      blockNumber: parseInt(tx.blockNumber) || 0,
    };
  });
}
