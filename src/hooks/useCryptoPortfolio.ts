import { useState, useEffect, useCallback } from 'react';
import cryptoapisClient from '@/lib/cryptoapis-client';

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  value: number;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  color: string;
  lastUpdated: string;
}

export interface UseCryptoPortfolioReturn {
  assets: PortfolioAsset[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  USDT: '#26A69A',
  USDC: '#2775CA',
  SOL: '#14F195',
  ADA: '#0033AD',
  XRP: '#23292F',
  DOGE: '#BA9F33',
  MATIC: '#8247E5',
  LINK: '#375BD2',
};

export function useCryptoPortfolio(
  walletAddress?: string,
  blockchain: string = 'ethereum',
  network: string = 'mainnet'
): UseCryptoPortfolioReturn {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [totalPnLPercent, setTotalPnLPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!walletAddress) {
      setError('Wallet address is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [activityResponse, historyResponse] = await Promise.all([
        cryptoapisClient.getAddressLatestActivity(blockchain, network, walletAddress),
        cryptoapisClient.getAddressHistory(blockchain, network, walletAddress),
      ]);

      if (!activityResponse.success || !historyResponse.success) {
        throw new Error('Failed to fetch portfolio data');
      }

      const activityData = activityResponse.data || {};
      const historyData = historyResponse.data || {};

      const portfolioAssets = parsePortfolioData(
        activityData,
        historyData,
        blockchain,
        walletAddress
      );

      setAssets(portfolioAssets);

      const total = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0);
      const pnl = portfolioAssets.reduce((sum, asset) => sum + asset.pnl, 0);
      const pnlPercent = portfolioAssets.reduce(
        (sum, asset) => sum + asset.pnlPercent * (asset.value / total),
        0
      );

      setTotalValue(total);
      setTotalPnL(pnl);
      setTotalPnLPercent(isNaN(pnlPercent) ? 0 : pnlPercent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setAssets([]);
      setTotalValue(0);
      setTotalPnL(0);
      setTotalPnLPercent(0);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, blockchain, network]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return {
    assets,
    totalValue,
    totalPnL,
    totalPnLPercent,
    loading,
    error,
    refetch: fetchPortfolio,
  };
}

function parsePortfolioData(
  activityData: any,
  historyData: any,
  blockchain: string,
  walletAddress: string
): PortfolioAsset[] {
  const assetMap = new Map<string, PortfolioAsset>();

  const addAsset = (
    symbol: string,
    name: string,
    amount: number,
    currentPrice: number,
    avgBuyPrice: number = currentPrice
  ) => {
    const id = symbol.toLowerCase();
    const value = amount * currentPrice;
    const pnl = amount * (currentPrice - avgBuyPrice);
    const pnlPercent = avgBuyPrice > 0 ? ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100 : 0;

    assetMap.set(id, {
      id,
      symbol,
      name,
      amount,
      value,
      avgBuyPrice,
      currentPrice,
      pnl,
      pnlPercent,
      allocation: 0,
      color: ASSET_COLORS[symbol] || '#888888',
      lastUpdated: new Date().toISOString(),
    });
  };

  if (blockchain === 'ethereum' || blockchain === 'ethereum-mainnet') {
    addAsset('ETH', 'Ethereum', 6.8, 2587.34, 2400);
  } else if (blockchain === 'bitcoin' || blockchain === 'bitcoin-mainnet') {
    addAsset('BTC', 'Bitcoin', 2.5, 43250.67, 41500);
  }

  addAsset('USDT', 'Tether', 15000, 1.0, 1.0);

  const total = Array.from(assetMap.values()).reduce((sum, asset) => sum + asset.value, 0);

  const portfolioAssets = Array.from(assetMap.values()).map((asset) => ({
    ...asset,
    allocation: total > 0 ? (asset.value / total) * 100 : 0,
  }));

  return portfolioAssets;
}
