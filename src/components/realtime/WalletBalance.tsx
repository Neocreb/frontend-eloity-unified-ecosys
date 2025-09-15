import React, { useState } from 'react';
import { Wallet, Eye, EyeOff, TrendingUp, Send, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeWallet } from '@/hooks/useRealtimeWallet';
import { formatDistanceToNow } from 'date-fns';

interface WalletBalanceProps {
  showTransactions?: boolean;
  compact?: boolean;
  className?: string;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({
  showTransactions = false,
  compact = false,
  className = '',
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const { wallet, transactions, loading } = useRealtimeWallet();

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'softpoints') {
      return `${amount.toLocaleString()} SP`;
    }
    return `${amount.toFixed(4)} ${currency.toUpperCase()}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return '📤';
      case 'receive':
        return '📥';
      case 'reward':
        return '🎁';
      case 'trade':
        return '💱';
      case 'buy':
        return '🛒';
      case 'sell':
        return '💰';
      default:
        return '💳';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-8 bg-muted rounded w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Wallet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No wallet found</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Wallet className="h-4 w-4" />
        <span className="font-medium">
          {showBalance 
            ? formatCurrency(wallet.softpoints_balance, 'softpoints')
            : '••••'
          }
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBalance(!showBalance)}
          className="h-auto p-1"
        >
          {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="h-auto p-1"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* SoftPoints Balance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">SoftPoints</span>
                <span className="text-2xl font-bold">
                  {showBalance 
                    ? formatCurrency(wallet.softpoints_balance, 'softpoints')
                    : '••••••'
                  }
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Plus className="h-4 w-4 mr-1" />
                  Earn
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>

            {/* Crypto Balances */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">USDT</span>
                <div className="font-medium">
                  {showBalance 
                    ? formatCurrency(wallet.usdt_balance, 'usdt')
                    : '••••'
                  }
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">BTC</span>
                <div className="font-medium">
                  {showBalance 
                    ? formatCurrency(wallet.btc_balance, 'btc')
                    : '••••'
                  }
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">ETH</span>
                <div className="font-medium">
                  {showBalance 
                    ? formatCurrency(wallet.eth_balance, 'eth')
                    : '••••'
                  }
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">SOL</span>
                <div className="font-medium">
                  {showBalance 
                    ? formatCurrency(wallet.sol_balance, 'sol')
                    : '••••'
                  }
                </div>
              </div>
            </div>

            {/* KYC Status */}
            {wallet.kyc_verified && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">KYC Status</span>
                <Badge variant="success">
                  Verified (Level {wallet.kyc_level})
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      {showTransactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {getTransactionIcon(transaction.transaction_type)}
                    </span>
                    <div>
                      <p className="font-medium text-sm capitalize">
                        {transaction.transaction_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {transaction.transaction_type === 'send' ? '-' : '+'}
                      {formatCurrency(transaction.amount, transaction.crypto_type)}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletBalance;