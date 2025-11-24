import { useState, useEffect, useCallback } from 'react';
import cryptoapisClient from '@/lib/cryptoapis-client';

export interface ExchangeRateData {
  baseAsset: string;
  quoteAsset: string;
  rate: number;
  timestamp: string;
}

export interface UseCryptoExchangeRatesReturn {
  rates: Record<string, number>;
  loading: boolean;
  error: string | null;
  getRate: (baseAsset: string, quoteAsset: string) => number | null;
  refetch: () => Promise<void>;
}

export function useCryptoExchangeRates(
  baseAssets: string[] = ['BTC', 'ETH'],
  quoteAsset: string = 'USD'
): UseCryptoExchangeRatesReturn {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const ratesMap: Record<string, number> = {};

      const requests = baseAssets.map((base) =>
        cryptoapisClient.getExchangeRates(base, quoteAsset)
      );

      const responses = await Promise.all(requests);

      responses.forEach((response, index) => {
        if (response.success && response.data) {
          const rate = parseFloat(response.data.rate || response.data.rateFormatted || '0');
          ratesMap[`${baseAssets[index]}_${quoteAsset}`] = rate;
        }
      });

      setRates(ratesMap);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setRates({});
    } finally {
      setLoading(false);
    }
  }, [baseAssets, quoteAsset]);

  useEffect(() => {
    fetchRates();

    const interval = setInterval(fetchRates, 60000);

    return () => clearInterval(interval);
  }, [fetchRates]);

  const getRate = useCallback(
    (baseAsset: string, quote: string = quoteAsset): number | null => {
      const key = `${baseAsset}_${quote}`;
      return rates[key] || null;
    },
    [rates, quoteAsset]
  );

  return {
    rates,
    loading,
    error,
    getRate,
    refetch: fetchRates,
  };
}
