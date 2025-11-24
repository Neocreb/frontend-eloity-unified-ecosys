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
  const assetMap = new Map<string, { amount: number; price: number }>();

  // Parse transaction history to calculate balances
  const transactions = Array.isArray(historyData) ? historyData : historyData?.data || [];

  transactions.forEach((tx: any) => {
    const isIncoming = tx.recipientAddress?.toLowerCase() === walletAddress.toLowerCase();
    const symbol = tx.tokenSymbol || 'ETH';
    const amount = parseFloat(tx.amount) || 0;

    if (amount > 0) {
      const existing = assetMap.get(symbol) || { amount: 0, price: 0 };
      const newAmount = isIncoming ? existing.amount + amount : existing.amount - amount;

      assetMap.set(symbol, {
        amount: Math.max(0, newAmount),
        price: existing.price || parseFloat(tx.gasPrice) || 1,
      });
    }
  });

  // Parse latest activity data
  if (activityData && typeof activityData === 'object') {
    const addresses = activityData.addresses || [];
    addresses.forEach((addr: any) => {
      const symbol = addr.tokenSymbol || 'ETH';
      const amount = parseFloat(addr.balance) || 0;

      if (amount > 0) {
        const existing = assetMap.get(symbol) || { amount: 0, price: 0 };
        assetMap.set(symbol, {
          amount,
          price: existing.price || 1,
        });
      }
    });
  }

  // If no assets found from blockchain data, return empty portfolio
  if (assetMap.size === 0) {
    return [];
  }

  // Convert to PortfolioAsset format
  const portfolioAssets = Array.from(assetMap.entries()).map(([symbol, { amount, price }]) => {
    const id = symbol.toLowerCase();
    const value = amount * price;

    return {
      id,
      symbol,
      name: getAssetName(symbol),
      amount,
      value,
      avgBuyPrice: price,
      currentPrice: price,
      pnl: 0,
      pnlPercent: 0,
      allocation: 0,
      color: ASSET_COLORS[symbol] || '#888888',
      lastUpdated: new Date().toISOString(),
    };
  });

  // Calculate total value and allocations
  const total = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0);

  return portfolioAssets.map((asset) => ({
    ...asset,
    allocation: total > 0 ? (asset.value / total) * 100 : 0,
  }));
}

function getAssetName(symbol: string): string {
  const assetNames: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Tether',
    USDC: 'USD Coin',
    SOL: 'Solana',
    ADA: 'Cardano',
    XRP: 'XRP',
    DOGE: 'Dogecoin',
    MATIC: 'Polygon',
    LINK: 'Chainlink',
  };
  return assetNames[symbol] || symbol;
}
