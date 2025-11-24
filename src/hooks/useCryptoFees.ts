import { useState, useEffect, useCallback } from 'react';
import cryptoapisClient from '@/lib/cryptoapis-client';

export interface FeeEstimate {
  slow: number;
  standard: number;
  fast: number;
  baseFee?: number;
  priorityFee?: number;
  timestamp?: string;
}

export interface UseCryptoFeesReturn {
  fees: FeeEstimate | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCryptoFees(
  blockchain: string = 'ethereum',
  network: string = 'mainnet'
): UseCryptoFeesReturn {
  const [fees, setFees] = useState<FeeEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await cryptoapisClient.estimateTransactionFees(blockchain, network);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch fees');
      }

      const feeData = response.data || {};
      const feeEstimate: FeeEstimate = {
        slow: parseFloat(feeData.slowFee || '0'),
        standard: parseFloat(feeData.standardFee || '0'),
        fast: parseFloat(feeData.fastFee || '0'),
        baseFee: feeData.baseFee ? parseFloat(feeData.baseFee) : undefined,
        priorityFee: feeData.priorityFee ? parseFloat(feeData.priorityFee) : undefined,
        timestamp: feeData.timestamp || new Date().toISOString(),
      };

      setFees(feeEstimate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setFees(null);
    } finally {
      setLoading(false);
    }
  }, [blockchain, network]);

  useEffect(() => {
    fetchFees();

    const interval = setInterval(fetchFees, 30000);

    return () => clearInterval(interval);
  }, [fetchFees]);

  return {
    fees,
    loading,
    error,
    refetch: fetchFees,
  };
}
