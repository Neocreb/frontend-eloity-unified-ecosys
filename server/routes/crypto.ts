import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getCryptoPrices,
  getOrderBook,
  executeTrade,
  createWallet,
  getWalletBalances,
  processDeposit,
  processWithdrawal,
  verifyKYCLevel,
  calculateTradingFees,
  getRiskAssessment,
  createP2POrder,
  matchP2POrders,
  createEscrowTransaction,
  releaseEscrowFunds,
  disputeEscrowTransaction,
  getWalletFromDatabase
} from '../services/cryptoService.js';
import { logger } from '../utils/logger.js';
import {
  getDetailedPriceData,
  getEstimatedMatches,
  getP2POrders,
  getUserP2POrders,
  getP2POrderById,
  initiatePeerToPeerTrade,
  getEscrowTransaction,
  confirmEscrowPayment,
  getUserTradingHistory,
  getTradingStatistics
} from '../services/cryptoDbService.js';

const router = express.Router();

// =============================================================================
// CRYPTOCURRENCY PRICE DATA
// =============================================================================

// Get current cryptocurrency prices
router.get('/prices', async (req, res) => {
  try {
    const { symbols, vs_currency = 'usd' } = req.query;
    // Handle array or string query parameters
    // Handle array or string query parameters
    const symbolList: string[] = [];
    
    if (typeof symbols === 'string') {
      symbolList.push(...symbols.split(','));
    } else if (Array.isArray(symbols)) {
      // Convert array elements to strings
      symbolList.push(...symbols.map(s => String(s)));
    }
    
    // Default symbols if none provided
    if (symbolList.length === 0) {
      symbolList.push('bitcoin', 'ethereum', 'tether', 'binancecoin');
    }
    
    const prices = await getCryptoPrices(symbolList, vs_currency as string);
    
    res.json({
      prices,
      timestamp: new Date().toISOString(),
      vs_currency
    });
  } catch (error) {
    logger.error('Crypto prices fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cryptocurrency prices' });
  }
});

// Get detailed price information for a specific cryptocurrency
router.get('/prices/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { vs_currency = 'usd', timeframe = '24h' } = req.query;
    
    const priceData = await getDetailedPriceData(symbol, vs_currency as string, timeframe as string);
    
    if (!priceData) {
      return res.status(404).json({ error: 'Cryptocurrency not found' });
    }
    
    res.json({
      symbol,
      priceData,
      timeframe,
      vs_currency
    });
  } catch (error) {
    logger.error('Detailed price fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch price data' });
  }
});

// Get market orderbook for trading pairs
router.get('/orderbook/:pair', async (req, res) => {
  try {
    const { pair } = req.params;
    const { depth = '20' } = req.query;
    
    const orderbook = await getOrderBook(pair, parseInt(depth as string));
    
    res.json({
      pair,
      orderbook,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Orderbook fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch orderbook' });
  }
});

// =============================================================================
// CRYPTO WALLET MANAGEMENT
// =============================================================================

// Create cryptocurrency wallet for user
router.post('/wallet/create', authenticateToken, async (req, res) => {
  try {
    const { currencies = ['BTC', 'ETH', 'USDT'] } = req.body;
    const userId = req.userId;
    
    const wallet = await createWallet(userId as string, currencies);
    
    if (wallet.success) {
      logger.info('Crypto wallet created', { userId, currencies });
      res.status(201).json({
        success: true,
        walletId: wallet.walletId,
        addresses: wallet.addresses,
        supportedCurrencies: currencies
      });
    } else {
      res.status(400).json({ 
        error: 'Wallet creation failed', 
        details: wallet.error 
      });
    }
  } catch (error) {
    logger.error('Wallet creation error:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// Get wallet balance and addresses
router.get('/wallet/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // First get the user's wallet
    const wallet = await getWalletFromDatabase(userId as string);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Then get the balances for that wallet
    const balance = await getWalletBalances(wallet.id);
    
    if (balance.success) {
      res.json({
        userId,
        balances: balance.balances,
        totalValueUSD: balance.totalValueUSD,
        addresses: wallet.addresses,
        lastUpdated: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        error: 'Failed to fetch wallet balance', 
        details: balance.error 
      });
    }
  } catch (error) {
    logger.error('Wallet balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
});

// Process cryptocurrency deposit
router.post('/wallet/deposit', authenticateToken, async (req, res) => {
  try {
    const { currency, amount, txHash } = req.body;
    const userId = req.userId;
    
    if (!currency || !amount || !txHash) {
      return res.status(400).json({ 
        error: 'Currency, amount, and transaction hash are required' 
      });
    }
    
    const deposit = await processDeposit(userId as string, currency, parseFloat(amount), txHash);
    
    if (deposit.success) {
      logger.info('Crypto deposit processed', { userId, currency, amount, txHash });
      res.json({
        success: true,
        depositId: deposit.depositId,
        status: deposit.status,
        confirmationsRequired: deposit.confirmationsRequired,
        currentConfirmations: deposit.currentConfirmations
      });
    } else {
      res.status(400).json({ 
        error: 'Deposit processing failed', 
        details: deposit.error 
      });
    }
  } catch (error) {
    logger.error('Crypto deposit error:', error);
    res.status(500).json({ error: 'Failed to process deposit' });
  }
});

// Process cryptocurrency withdrawal
router.post('/wallet/withdraw', authenticateToken, async (req, res) => {
  try {
    const { currency, amount, address, memo } = req.body;
    const userId = req.userId;
    
    if (!currency || !amount || !address) {
      return res.status(400).json({ 
        error: 'Currency, amount, and address are required' 
      });
    }
    
    const withdrawal = await processWithdrawal(userId as string, currency, parseFloat(amount), address, memo);
    
    if (withdrawal.success) {
      logger.info('Crypto withdrawal processed', { userId, currency, amount, address });
      res.json({
        success: true,
        withdrawalId: withdrawal.withdrawalId,
        status: withdrawal.status,
        fee: withdrawal.fee,
        netAmount: withdrawal.netAmount,
        estimatedArrival: withdrawal.estimatedArrival
      });
    } else {
      res.status(400).json({ 
        error: 'Withdrawal processing failed', 
        details: withdrawal.error 
      });
    }
  } catch (error) {
    logger.error('Crypto withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// =============================================================================
// KYC & RISK ASSESSMENT
// =============================================================================

// Get user's KYC level and trading limits
router.get('/user/kyc-level', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const kycLevel = await verifyKYCLevel(userId as string);
    const withdrawalLimits = getWithdrawalLimits(kycLevel);
    const tradingLimits = getTradingLimits(kycLevel);
    
    res.json({
      userId,
      kycLevel,
      withdrawalLimits,
      tradingLimits
    });
  } catch (error) {
    logger.error('KYC level fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch KYC level' });
  }
});

// Get user's risk assessment
router.get('/user/risk-assessment', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const riskAssessment = await getRiskAssessment(userId as string);
    
    res.json({
      userId,
      riskAssessment
    });
  } catch (error) {
    logger.error('Risk assessment fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessment' });
  }
});

// =============================================================================
// P2P TRADING
// =============================================================================

// Create P2P trading order
router.post('/p2p/orders', authenticateToken, async (req, res) => {
  try {
    const orderData = req.body;
    const userId = req.userId;
    
    // Add user ID to order data
    const fullOrderData = {
      ...orderData,
      userId: userId as string
    };
    
    const order = await createP2POrder(fullOrderData);
    
    if (order.success) {
      logger.info('P2P order created', { orderId: order.orderId, userId });
      res.status(201).json({
        success: true,
        orderId: order.orderId,
        order: order.order
      });
    } else {
      res.status(400).json({ 
        error: 'Order creation failed', 
        details: order.error 
      });
    }
  } catch (error) {
    logger.error('P2P order creation error:', error);
    res.status(500).json({ error: 'Failed to create P2P order' });
  }
});

// Get P2P orders with filtering
router.get('/p2p/orders', async (req, res) => {
  try {
    const { 
      cryptocurrency, 
      fiatCurrency, 
      type, 
      minAmount, 
      maxAmount, 
      page = '1', 
      limit = '20' 
    } = req.query;
    
    const filters = {
      cryptocurrency: cryptocurrency ? (cryptocurrency as string).toUpperCase() : undefined,
      fiatCurrency: fiatCurrency ? (fiatCurrency as string).toUpperCase() : undefined,
      type: type as string,
      minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined
    };
    
    const orders = await getP2POrders(filters, parseInt(page as string), parseInt(limit as string));
    
    res.json({
      orders: orders.orders,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: orders.total,
        pages: Math.ceil(orders.total / parseInt(limit as string))
      }
    });
  } catch (error) {
    logger.error('P2P orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch P2P orders' });
  }
});

// Get user's P2P orders
router.get('/p2p/orders/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = '1', limit = '20' } = req.query;
    
    const orders = await getUserP2POrders(userId as string, {
      status: status as string
    });
    
    res.json({
      orders: orders.orders,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: orders.total
      }
    });
  } catch (error) {
    logger.error('User P2P orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user P2P orders' });
  }
});

// Initiate P2P trade
router.post('/p2p/orders/:id/trade', authenticateToken, async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { amount } = req.body;
    const userId = req.userId;
    
    const tradeData = {
      orderId,
      userId: userId as string,
      amount: parseFloat(amount)
    };
    
    const trade = await initiatePeerToPeerTrade(tradeData);
    
    if (trade.success) {
      res.json({
        success: true,
        tradeId: trade.tradeId,
        escrowId: trade.escrowId,
        instructions: trade.instructions
      });
    } else {
      res.status(400).json({ 
        error: 'Trade initiation failed', 
        details: trade.error 
      });
    }
  } catch (error) {
    logger.error('P2P trade initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate P2P trade' });
  }
});

// =============================================================================
// ESCROW SYSTEM
// =============================================================================

// Get escrow transaction details
router.get('/escrow/:id', authenticateToken, async (req, res) => {
  try {
    const { id: escrowId } = req.params;
    
    const escrow = await getEscrowTransaction(escrowId);
    
    if (escrow) {
      res.json({
        escrow
      });
    } else {
      res.status(404).json({ error: 'Escrow transaction not found' });
    }
  } catch (error) {
    logger.error('Escrow transaction fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch escrow transaction' });
  }
});

// Confirm escrow payment
router.post('/escrow/:id/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { id: escrowId } = req.params;
    const paymentData = req.body;
    
    const result = await confirmEscrowPayment(escrowId, paymentData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Payment confirmed successfully'
      });
    } else {
      res.status(400).json({ 
        error: 'Payment confirmation failed', 
        details: result.error 
      });
    }
  } catch (error) {
    logger.error('Escrow payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm escrow payment' });
  }
});

// Release escrow funds
router.post('/escrow/:id/release', authenticateToken, async (req, res) => {
  try {
    const { id: escrowId } = req.params;
    const { sellerId } = req.body;
    
    const result = await releaseEscrowFunds(escrowId, sellerId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Funds released successfully'
      });
    } else {
      res.status(400).json({ 
        error: 'Fund release failed', 
        details: result.error 
      });
    }
  } catch (error) {
    logger.error('Escrow fund release error:', error);
    res.status(500).json({ error: 'Failed to release escrow funds' });
  }
});

// =============================================================================
// TRADING HISTORY & STATISTICS
// =============================================================================

// Get user's trading history
router.get('/user/trading-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { page = '1', limit = '20' } = req.query;
    
    const history = await getUserTradingHistory(userId as string, {}, parseInt(page as string), parseInt(limit as string));
    
    res.json({
      trades: history.trades,
      summary: history.summary,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: history.total
      }
    });
  } catch (error) {
    logger.error('Trading history fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trading history' });
  }
});

// Get user's trading statistics
router.get('/user/trading-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { timeframe = '30d' } = req.query;
    
    const stats = await getTradingStatistics(userId as string, timeframe as string);
    
    res.json({
      userId,
      stats,
      timeframe
    });
  } catch (error) {
    logger.error('Trading statistics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trading statistics' });
  }
});

// Helper functions for KYC limits
function getWithdrawalLimits(kycLevel: number) {
  const limits: Record<number, { daily: number; monthly: number }> = {
    0: { daily: 100, monthly: 500 },
    1: { daily: 1000, monthly: 5000 },
    2: { daily: 10000, monthly: 50000 },
    3: { daily: 50000, monthly: 250000 }
  };
  return limits[kycLevel] || limits[0];
}

function getTradingLimits(kycLevel: number) {
  const limits: Record<number, { maxOrder: number; daily: number }> = {
    0: { maxOrder: 100, daily: 500 },
    1: { maxOrder: 1000, daily: 5000 },
    2: { maxOrder: 10000, daily: 50000 },
    3: { maxOrder: 50000, daily: 250000 }
  };
  return limits[kycLevel] || limits[0];
}



export default router;