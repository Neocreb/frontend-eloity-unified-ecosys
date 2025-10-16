import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useSocketEvent } from '../../hooks/use-realtime';
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatTime } from '../../utils/formatters';

interface EscrowTransaction {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  price: number;
  status: 'pending' | 'locked' | 'confirmed' | 'disputed' | 'completed' | 'cancelled';
  escrowAddress?: string;
  timeoutAt: string;
  confirmations: {
    buyer: boolean;
    seller: boolean;
  };
  disputeReason?: string;
  createdAt: string;
}

interface P2PEscrowManagerProps {
  transactionId: string;
  userRole: 'buyer' | 'seller' | 'mediator';
}

export function P2PEscrowManager({ transactionId, userRole }: P2PEscrowManagerProps) {
  const [transaction, setTransaction] = useState<EscrowTransaction | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for real-time transaction updates
  useSocketEvent('escrow_update', (data) => {
    if (data.transactionId === transactionId) {
      setTransaction(data.transaction);
    }
  }, [transactionId]);

  useSocketEvent('escrow_timeout_warning', (data) => {
    if (data.transactionId === transactionId) {
      // Show warning notification
      console.log('Escrow timeout warning:', data.timeRemaining);
    }
  }, [transactionId]);

  // Fetch initial transaction data
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/crypto/p2p/escrow/${transactionId}`);
        const data = await response.json();
        setTransaction(data.transaction);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch transaction:', error);
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  // Update countdown timer
  useEffect(() => {
    if (!transaction) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const timeoutTime = new Date(transaction.timeoutAt).getTime();
      const remaining = Math.max(0, timeoutTime - now);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [transaction]);

  const handleConfirmPayment = async () => {
    try {
      await fetch(`/api/crypto/p2p/escrow/${transactionId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole })
      });
    } catch (error) {
      console.error('Failed to confirm payment:', error);
    }
  };

  const handleDispute = async (reason: string) => {
    try {
      await fetch(`/api/crypto/p2p/escrow/${transactionId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, userRole })
      });
    } catch (error) {
      console.error('Failed to initiate dispute:', error);
    }
  };

  const handleReleaseFunds = async () => {
    try {
      await fetch(`/api/crypto/p2p/escrow/${transactionId}/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Failed to release funds:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'locked': return 'blue';
      case 'confirmed': return 'green';
      case 'disputed': return 'red';
      case 'completed': return 'green';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'locked': return <Shield className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!transaction) return 0;
    
    const totalTime = 24 * 60 * 60 * 1000; // 24 hours in ms
    const elapsed = totalTime - timeRemaining;
    return Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading escrow details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p>Transaction not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transaction Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>P2P Escrow Transaction</span>
            <Badge 
              variant="secondary" 
              className={`bg-${getStatusColor(transaction.status)}-100 text-${getStatusColor(transaction.status)}-800`}
            >
              {getStatusIcon(transaction.status)}
              <span className="ml-1 capitalize">{transaction.status}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Transaction Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Amount:</span> {transaction.amount} {transaction.currency}</p>
                <p><span className="font-medium">Price:</span> {formatCurrency(transaction.price)}</p>
                <p><span className="font-medium">Total Value:</span> {formatCurrency(transaction.amount * transaction.price)}</p>
                <p><span className="font-medium">Created:</span> {new Date(transaction.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Escrow Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Time Remaining:</span>
                  <span className={`font-mono ${timeRemaining < 3600000 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
                {transaction.escrowAddress && (
                  <p className="text-xs text-muted-foreground">
                    Escrow Address: {transaction.escrowAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Confirmation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Buyer Confirmation</span>
              {transaction.confirmations.buyer ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Seller Confirmation</span>
              {transaction.confirmations.seller ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userRole === 'buyer' && transaction.status === 'locked' && !transaction.confirmations.buyer && (
              <Button onClick={handleConfirmPayment} className="w-full bg-green-600 hover:bg-green-700">
                Confirm Payment Sent
              </Button>
            )}

            {userRole === 'seller' && transaction.status === 'locked' && !transaction.confirmations.seller && (
              <Button onClick={handleConfirmPayment} className="w-full bg-blue-600 hover:bg-blue-700">
                Confirm Payment Received
              </Button>
            )}

            {transaction.status === 'confirmed' && userRole === 'seller' && (
              <Button onClick={handleReleaseFunds} className="w-full bg-green-600 hover:bg-green-700">
                Release Cryptocurrency
              </Button>
            )}

            {(transaction.status === 'locked' || transaction.status === 'confirmed') && (
              <Button 
                onClick={() => handleDispute('Payment issue')} 
                variant="destructive" 
                className="w-full"
              >
                Initiate Dispute
              </Button>
            )}

            {transaction.status === 'disputed' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  This transaction is under dispute. A mediator will review the case.
                  {transaction.disputeReason && (
                    <>
                      <br />
                      <strong>Dispute Reason:</strong> {transaction.disputeReason}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm">Transaction Created - {new Date(transaction.createdAt).toLocaleString()}</span>
            </div>
            
            {transaction.status !== 'pending' && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm">Funds Locked in Escrow</span>
              </div>
            )}
            
            {transaction.confirmations.buyer && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Buyer Confirmed Payment</span>
              </div>
            )}
            
            {transaction.confirmations.seller && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Seller Confirmed Receipt</span>
              </div>
            )}
            
            {transaction.status === 'completed' && (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Transaction Completed</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
