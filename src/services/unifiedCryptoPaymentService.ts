// @ts-nocheck
import { walletService } from './walletService';

export interface CryptoPaymentOption {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  icon: string;
  networkFee: number;
  confirmationTime: string;
  exchangeRate: number; // USD exchange rate
}

export interface PaymentRequest {
  amount: number; // USD amount
  purpose: 'marketplace' | 'freelance' | 'tip' | 'subscription' | 'reward' | 'p2p';
  recipientId: string;
  orderId?: string;
  projectId?: string;
  metadata?: Record<string, any>;
}

export interface CryptoPayment {
  id: string;
  amount: number;
  cryptoAmount: number;
  cryptoCurrency: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'failed';
  recipientId: string;
  senderId: string;
  transactionHash?: string;
  networkFee: number;
  createdAt: Date;
  confirmedAt?: Date;
  metadata?: Record<string, any>;
}

class UnifiedCryptoPaymentService {
  private supportedCryptos: CryptoPaymentOption[] = [
    {
      id: 'btc',
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: 0,
      icon: '₿',
      networkFee: 15.00,
      confirmationTime: '10-30 min',
      exchangeRate: 45000,
    },
    {
      id: 'eth',
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 0,
      icon: 'Ξ',
      networkFee: 8.50,
      confirmationTime: '2-5 min',
      exchangeRate: 2800,
    },
    {
      id: 'usdt',
      symbol: 'USDT',
      name: 'Tether USD',
      balance: 0,
      icon: '₮',
      networkFee: 2.00,
      confirmationTime: '1-3 min',
      exchangeRate: 1,
    },
    {
      id: 'sol',
      symbol: 'SOL',
      name: 'Solana',
      balance: 0,
      icon: '◎',
      networkFee: 0.10,
      confirmationTime: '30-60 sec',
      exchangeRate: 120,
    },
  ];

  // Get available crypto payment options with current balances
  async getAvailablePaymentOptions(): Promise<CryptoPaymentOption[]> {
    try {
      // Get user's crypto balances from wallet service
      const walletBalance = await walletService.getWalletBalance();
      
      return this.supportedCryptos.map(crypto => ({
        ...crypto,
        balance: this.getCryptoBalance(crypto.id, walletBalance),
      }));
    } catch (error) {
      console.error('Failed to load crypto payment options:', error);
      return this.supportedCryptos; // Return with 0 balances
    }
  }

  // Calculate crypto amount needed for USD payment
  calculateCryptoAmount(usdAmount: number, cryptoId: string): number {
    const crypto = this.supportedCryptos.find(c => c.id === cryptoId);
    if (!crypto) throw new Error(`Unsupported crypto: ${cryptoId}`);
    
    return usdAmount / crypto.exchangeRate;
  }

  // Calculate total cost including network fees
  calculateTotalCost(usdAmount: number, cryptoId: string): {
    cryptoAmount: number;
    networkFee: number;
    totalCrypto: number;
    totalUSD: number;
  } {
    const crypto = this.supportedCryptos.find(c => c.id === cryptoId);
    if (!crypto) throw new Error(`Unsupported crypto: ${cryptoId}`);
    
    const cryptoAmount = this.calculateCryptoAmount(usdAmount, cryptoId);
    const networkFeeCrypto = crypto.networkFee / crypto.exchangeRate;
    
    return {
      cryptoAmount,
      networkFee: networkFeeCrypto,
      totalCrypto: cryptoAmount + networkFeeCrypto,
      totalUSD: usdAmount + crypto.networkFee,
    };
  }

  // Check if user has sufficient balance for payment
  async canAffordPayment(usdAmount: number, cryptoId: string): Promise<{
    canAfford: boolean;
    balance: number;
    required: number;
    shortfall: number;
  }> {
    const options = await this.getAvailablePaymentOptions();
    const crypto = options.find(c => c.id === cryptoId);
    
    if (!crypto) {
      return { canAfford: false, balance: 0, required: 0, shortfall: 0 };
    }
    
    const { totalCrypto } = this.calculateTotalCost(usdAmount, cryptoId);
    const shortfall = Math.max(0, totalCrypto - crypto.balance);
    
    return {
      canAfford: crypto.balance >= totalCrypto,
      balance: crypto.balance,
      required: totalCrypto,
      shortfall,
    };
  }

  // Process crypto payment
  async processPayment(
    paymentRequest: PaymentRequest,
    cryptoId: string,
    pin?: string
  ): Promise<CryptoPayment> {
    try {
      // Validate payment affordability
      const affordability = await this.canAffordPayment(paymentRequest.amount, cryptoId);
      if (!affordability.canAfford) {
        throw new Error(
          `Insufficient balance. Need ${affordability.required.toFixed(6)} ${cryptoId.toUpperCase()}, have ${affordability.balance.toFixed(6)}`
        );
      }

      // Calculate payment details
      const { cryptoAmount, networkFee, totalCrypto } = this.calculateTotalCost(
        paymentRequest.amount,
        cryptoId
      );

      // Create payment record
      const payment: CryptoPayment = {
        id: this.generatePaymentId(),
        amount: paymentRequest.amount,
        cryptoAmount,
        cryptoCurrency: cryptoId.toUpperCase(),
        purpose: paymentRequest.purpose,
        status: 'pending',
        recipientId: paymentRequest.recipientId,
        senderId: 'current-user-id', // Should come from auth context
        networkFee,
        createdAt: new Date(),
        metadata: paymentRequest.metadata,
      };

      // Process payment through blockchain
      await this.executeBlockchainTransaction(payment, totalCrypto, cryptoId, pin);

      // Update local wallet balance
      await this.updateWalletBalance(cryptoId, -totalCrypto);

      // Record transaction in wallet service
      await this.recordTransaction(payment);

      // Handle purpose-specific post-payment actions
      await this.handlePostPaymentActions(payment, paymentRequest);

      return payment;
    } catch (error) {
      console.error('Crypto payment failed:', error);
      throw error;
    }
  }

  // Get payment history for user
  async getPaymentHistory(purpose?: string): Promise<CryptoPayment[]> {
    try {
      const response = await fetch('/api/crypto/payments/history' + (purpose ? `?purpose=${purpose}` : ''));
      if (!response.ok) throw new Error('Failed to fetch payment history');
      
      const data = await response.json();
      return data.payments || [];
    } catch (error) {
      console.error('Failed to load payment history:', error);
      return [];
    }
  }

  // Cancel pending payment (if possible)
  async cancelPayment(paymentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/crypto/payments/${paymentId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to cancel payment');
      return true;
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      return false;
    }
  }

  // Get real-time payment status
  async getPaymentStatus(paymentId: string): Promise<CryptoPayment | null> {
    try {
      const response = await fetch(`/api/crypto/payments/${paymentId}/status`);
      if (!response.ok) throw new Error('Failed to fetch payment status');
      
      const data = await response.json();
      return data.payment || null;
    } catch (error) {
      console.error('Failed to get payment status:', error);
      return null;
    }
  }

  // Private helper methods
  private getCryptoBalance(cryptoId: string, walletBalance: any): number {
    switch (cryptoId) {
      case 'btc': return walletBalance.btc || 0;
      case 'eth': return walletBalance.eth || 0;
      case 'usdt': return walletBalance.usdt || 0;
      case 'sol': return walletBalance.sol || 0;
      default: return 0;
    }
  }

  private generatePaymentId(): string {
    return 'cp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async executeBlockchainTransaction(
    payment: CryptoPayment,
    amount: number,
    cryptoId: string,
    pin?: string
  ): Promise<void> {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, this would:
    // 1. Validate PIN/password
    // 2. Create blockchain transaction
    // 3. Broadcast to network
    // 4. Wait for confirmation
    
    payment.transactionHash = 'tx_' + Math.random().toString(36).substr(2, 16);
    payment.status = 'confirmed';
    payment.confirmedAt = new Date();
  }

  private async updateWalletBalance(cryptoId: string, amount: number): Promise<void> {
    // Update wallet balance through wallet service
    // This would integrate with the existing wallet context
    try {
      await fetch('/api/wallet/update-crypto-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cryptoId, amount }),
      });
    } catch (error) {
      console.warn('Failed to update wallet balance:', error);
    }
  }

  private async recordTransaction(payment: CryptoPayment): Promise<void> {
    // Record transaction in wallet service for transaction history
    await walletService.recordTransaction({
      id: payment.id,
      amount: payment.amount,
      type: 'debit',
      source: 'crypto',
      description: `${payment.purpose} payment via ${payment.cryptoCurrency}`,
      status: payment.status,
      metadata: {
        cryptoAmount: payment.cryptoAmount,
        cryptoCurrency: payment.cryptoCurrency,
        transactionHash: payment.transactionHash,
        ...payment.metadata,
      },
    });
  }

  private async handlePostPaymentActions(
    payment: CryptoPayment,
    request: PaymentRequest
  ): Promise<void> {
    switch (request.purpose) {
      case 'marketplace':
        await this.handleMarketplacePayment(payment, request);
        break;
      case 'freelance':
        await this.handleFreelancePayment(payment, request);
        break;
      case 'tip':
        await this.handleTipPayment(payment, request);
        break;
      case 'subscription':
        await this.handleSubscriptionPayment(payment, request);
        break;
      case 'reward':
        await this.handleRewardPayment(payment, request);
        break;
      case 'p2p':
        await this.handleP2PPayment(payment, request);
        break;
    }
  }

  private async handleMarketplacePayment(payment: CryptoPayment, request: PaymentRequest): Promise<void> {
    // Integrate with marketplace order system
    if (request.orderId) {
      await fetch(`/api/marketplace/orders/${request.orderId}/crypto-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.id }),
      });
    }
  }

  private async handleFreelancePayment(payment: CryptoPayment, request: PaymentRequest): Promise<void> {
    // Integrate with freelance escrow system
    if (request.projectId) {
      await fetch(`/api/freelance/projects/${request.projectId}/crypto-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.id }),
      });
    }
  }

  private async handleTipPayment(payment: CryptoPayment, request: PaymentRequest): Promise<void> {
    // Handle creator tips
    await fetch('/api/social/tips/crypto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        paymentId: payment.id,
        recipientId: request.recipientId,
        amount: payment.amount,
      }),
    });
  }

  private async handleSubscriptionPayment(payment: CryptoPayment, request: PaymentRequest): Promise<void> {
    // Handle subscription payments
    await fetch('/api/subscriptions/crypto-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: payment.id }),
    });
  }

  private async handleRewardPayment(payment: CryptoPayment, request: PaymentRequest): Promise<void> {
    // Handle reward redemptions
    await fetch('/api/rewards/crypto-redemption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: payment.id }),
    });
  }

  private async handleP2PPayment(payment: CryptoPayment, request: PaymentRequest): Promise<void> {
    // Handle P2P crypto transfers
    await fetch('/api/crypto/p2p/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: payment.id }),
    });
  }
}

export const unifiedCryptoPaymentService = new UnifiedCryptoPaymentService();
export type { PaymentRequest, CryptoPayment, CryptoPaymentOption };
