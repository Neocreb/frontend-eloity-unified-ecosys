import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireTier2, triggerKYCIfNeeded } from '../middleware/tierAccessControl.js';
import {
  createP2POrder,
  matchP2POrders,
  createEscrowTransaction,
  releaseEscrowFunds,
  disputeEscrowTransaction,
  getCryptoPrices,
  getOrderBook,
  executeTrade,
  createWallet,
  getWalletBalance,
  processDeposit,
  processWithdrawal,
  verifyKYCLevel,
  calculateTradingFees,
  getRiskAssessment
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
    const symbolList = symbols ? symbols.split(',') : ['bitcoin', 'ethereum', 'tether', 'binancecoin'];
    
    const prices = await getCryptoPrices(symbolList, vs_currency);
    
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
    
    const priceData = await getDetailedPriceData(symbol, vs_currency, timeframe);
    
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
    const { depth = 20 } = req.query;
    
    const orderbook = await getOrderBook(pair, parseInt(depth));
    
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
    
    const wallet = await createWallet(userId, currencies);
    
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
    
    const balance = await getWalletBalance(userId);
    
    if (balance.success) {
      res.json({
        userId,
        balances: balance.balances,
        totalValueUSD: balance.totalValueUSD,
        addresses: balance.addresses,
        lastUpdated: balance.lastUpdated
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
    
    const deposit = await processDeposit(userId, currency, amount, txHash);
    
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
// Requires Tier 2 verification
router.post('/wallet/withdraw', requireTier2(), async (req, res) => {
  try {
    const { currency, amount, address, memo } = req.body;
    const userId = req.userId;
    
    if (!currency || !amount || !address) {
      return res.status(400).json({ 
        error: 'Currency, amount, and address are required' 
      });
    }
    
    // Verify KYC level for large withdrawals
    const kycLevel = await verifyKYCLevel(userId);
    const withdrawalLimits = getWithdrawalLimits(kycLevel);
    
    if (amount > withdrawalLimits.daily) {
      return res.status(403).json({ 
        error: 'Withdrawal amount exceeds daily limit',
        limit: withdrawalLimits.daily,
        kycLevel,
        upgradeRequired: true
      });
    }
    
    const withdrawal = await processWithdrawal(userId, currency, amount, address, memo);
    
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
// P2P TRADING SYSTEM
// =============================================================================

// Create P2P trading order
router.post('/p2p/orders', authenticateToken, async (req, res) => {
  try {
    const { 
      type, 
      cryptocurrency, 
      fiatCurrency, 
      amount, 
      price, 
      paymentMethods, 
      timeLimit, 
      minOrderAmount,
      maxOrderAmount,
      autoReply,
      terms 
    } = req.body;
    const userId = req.userId;
    
    if (!type || !cryptocurrency || !fiatCurrency || !amount || !price) {
      return res.status(400).json({ 
        error: 'Type, cryptocurrency, fiat currency, amount, and price are required' 
      });
    }
    
    // Verify user has sufficient balance for sell orders
    if (type === 'sell') {
      const balance = await getWalletBalance(userId);
      const cryptoBalance = balance.balances[cryptocurrency.toUpperCase()] || 0;
      
      if (cryptoBalance < amount) {
        return res.status(400).json({ 
          error: 'Insufficient cryptocurrency balance',
          required: amount,
          available: cryptoBalance
        });
      }
    }
    
    const orderData = {
      userId,
      type, // 'buy' or 'sell'
      cryptocurrency: cryptocurrency.toUpperCase(),
      fiatCurrency: fiatCurrency.toUpperCase(),
      amount: parseFloat(amount),
      price: parseFloat(price),
      paymentMethods: paymentMethods || [],
      timeLimit: timeLimit || 30, // minutes
      minOrderAmount: minOrderAmount || amount * 0.1,
      maxOrderAmount: maxOrderAmount || amount,
      autoReply: autoReply || '',
      terms: terms || '',
      status: 'active'
    };
    
    const order = await createP2POrder(orderData);
    
    if (order.success) {
      logger.info('P2P order created', { userId, orderId: order.orderId, type, amount });
      res.status(201).json({
        success: true,
        orderId: order.orderId,
        order: order.order,
        estimatedMatches: await getEstimatedMatches(orderData)
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

// Get P2P orders (marketplace)
router.get('/p2p/orders', async (req, res) => {
  try {
    const { 
      type, 
      cryptocurrency, 
      fiatCurrency, 
      paymentMethod,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20
    } = req.query;
    
    const filters = {
      type,
      cryptocurrency: cryptocurrency?.toUpperCase(),
      fiatCurrency: fiatCurrency?.toUpperCase(),
      paymentMethod,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      status: 'active'
    };
    
    const orders = await getP2POrders(filters, parseInt(page), parseInt(limit));
    
    res.json({
      orders: orders.orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.total,
        pages: Math.ceil(orders.total / parseInt(limit))
      },
      filters
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
    const { status, type, page = 1, limit = 20 } = req.query;
    
    const orders = await getUserP2POrders(userId, {
      status,
      type,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json({
      orders: orders.orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.total
      }
    });
  } catch (error) {
    logger.error('User P2P orders fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// Initiate P2P trade (respond to order)
router.post('/p2p/orders/:orderId/trade', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, message } = req.body;
    const buyerId = req.userId;
    
    if (!amount) {
      return res.status(400).json({ error: 'Trade amount is required' });
    }
    
    // Get order details
    const order = await getP2POrderById(orderId);
    if (!order || order.status !== 'active') {
      return res.status(404).json({ error: 'Order not found or inactive' });
    }
    
    if (order.userId === buyerId) {
      return res.status(400).json({ error: 'Cannot trade with your own order' });
    }
    
    // Verify trade amount is within order limits
    if (amount < order.minOrderAmount || amount > order.maxOrderAmount) {
      return res.status(400).json({ 
        error: 'Trade amount outside order limits',
        minAmount: order.minOrderAmount,
        maxAmount: order.maxOrderAmount
      });
    }
    
    const tradeData = {
      orderId,
      buyerId,
      sellerId: order.userId,
      amount: parseFloat(amount),
      price: order.price,
      cryptocurrency: order.cryptocurrency,
      fiatCurrency: order.fiatCurrency,
      paymentMethods: order.paymentMethods,
      timeLimit: order.timeLimit,
      message: message || ''
    };
    
    const trade = await initiatePeerToPeerTrade(tradeData);
    
    if (trade.success) {
      logger.info('P2P trade initiated', { 
        orderId, 
        tradeId: trade.tradeId, 
        buyerId, 
        amount 
      });
      
      res.status(201).json({
        success: true,
        tradeId: trade.tradeId,
        escrowId: trade.escrowId,
        trade: trade.trade,
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
    res.status(500).json({ error: 'Failed to initiate trade' });
  }
});

// =============================================================================
// ESCROW SYSTEM
// =============================================================================

// Get escrow transaction details
router.get('/escrow/:escrowId', authenticateToken, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const userId = req.userId;
    
    const escrow = await getEscrowTransaction(escrowId);
    
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }
    
    // Check if user is involved in this escrow
    if (escrow.buyerId !== userId && escrow.sellerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      escrowId,
      escrow,
      userRole: escrow.buyerId === userId ? 'buyer' : 'seller',
      allowedActions: getAllowedEscrowActions(escrow, userId)
    });
  } catch (error) {
    logger.error('Escrow fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch escrow details' });
  }
});

// Confirm payment (buyer action)
router.post('/escrow/:escrowId/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { paymentProof, transactionId } = req.body;
    const userId = req.userId;
    
    const escrow = await getEscrowTransaction(escrowId);
    
    if (!escrow || escrow.buyerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (escrow.status !== 'pending_payment') {
      return res.status(400).json({ 
        error: 'Invalid escrow status for payment confirmation',
        currentStatus: escrow.status
      });
    }
    
    const confirmation = await confirmEscrowPayment(escrowId, {
      paymentProof,
      transactionId,
      confirmedBy: userId,
      confirmedAt: new Date()
    });
    
    if (confirmation.success) {
      logger.info('Escrow payment confirmed', { escrowId, userId });
      res.json({
        success: true,
        message: 'Payment confirmed, waiting for seller to release funds',
        status: 'payment_confirmed'
      });
    } else {
      res.status(400).json({ 
        error: 'Payment confirmation failed', 
        details: confirmation.error 
      });
    }
  } catch (error) {
    logger.error('Escrow payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Release funds (seller action)
router.post('/escrow/:escrowId/release', authenticateToken, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const userId = req.userId;
    
    const escrow = await getEscrowTransaction(escrowId);
    
    if (!escrow || escrow.sellerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (escrow.status !== 'payment_confirmed') {
      return res.status(400).json({ 
        error: 'Invalid escrow status for fund release',
        currentStatus: escrow.status
      });
    }
    
    const release = await releaseEscrowFunds(escrowId, userId);
    
    if (release.success) {
      logger.info('Escrow funds released', { escrowId, userId });
      res.json({
        success: true,
        message: 'Funds released successfully',
        transactionHash: release.transactionHash,
        completedAt: release.completedAt
      });
    } else {
      res.status(400).json({ 
        error: 'Fund release failed', 
        details: release.error 
      });
    }
  } catch (error) {
    logger.error('Escrow fund release error:', error);
    res.status(500).json({ error: 'Failed to release funds' });
  }
});

// Initiate dispute
router.post('/escrow/:escrowId/dispute', authenticateToken, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { reason, description, evidence } = req.body;
    const userId = req.userId;
    
    if (!reason || !description) {
      return res.status(400).json({ 
        error: 'Dispute reason and description are required' 
      });
    }
    
    const escrow = await getEscrowTransaction(escrowId);
    
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }
    
    if (escrow.buyerId !== userId && escrow.sellerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!['payment_confirmed', 'pending_release'].includes(escrow.status)) {
      return res.status(400).json({ 
        error: 'Dispute cannot be initiated at this stage',
        currentStatus: escrow.status
      });
    }
    
    const disputeData = {
      escrowId,
      raisedBy: userId,
      againstUserId: escrow.buyerId === userId ? escrow.sellerId : escrow.buyerId,
      reason,
      description,
      evidence: evidence || [],
      priority: calculateDisputePriority(escrow, reason)
    };
    
    const dispute = await disputeEscrowTransaction(disputeData);
    
    if (dispute.success) {
      logger.info('Escrow dispute initiated', { 
        escrowId, 
        disputeId: dispute.disputeId, 
        raisedBy: userId 
      });
      
      res.status(201).json({
        success: true,
        disputeId: dispute.disputeId,
        status: 'dispute_pending',
        message: 'Dispute initiated, waiting for admin review',
        estimatedResolutionTime: '24-48 hours'
      });
    } else {
      res.status(400).json({ 
        error: 'Dispute initiation failed', 
        details: dispute.error 
      });
    }
  } catch (error) {
    logger.error('Escrow dispute error:', error);
    res.status(500).json({ error: 'Failed to initiate dispute' });
  }
});

// =============================================================================
// TRADING ANALYTICS AND HISTORY
// =============================================================================

// Get user's trading history
router.get('/trades/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      type, 
      cryptocurrency, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const filters = {
      type,
      cryptocurrency: cryptocurrency?.toUpperCase(),
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    };
    
    const history = await getUserTradingHistory(userId, filters, parseInt(page), parseInt(limit));
    
    res.json({
      trades: history.trades,
      summary: history.summary,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: history.total
      }
    });
  } catch (error) {
    logger.error('Trading history fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trading history' });
  }
});

// Get trading statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { timeframe = '30d' } = req.query;
    
    const stats = await getTradingStatistics(userId, timeframe);
    
    res.json({
      userId,
      timeframe,
      statistics: {
        totalTrades: stats.totalTrades,
        successfulTrades: stats.successfulTrades,
        successRate: stats.successRate,
        totalVolume: stats.totalVolume,
        averageTradeSize: stats.averageTradeSize,
        tradingPairs: stats.tradingPairs,
        profitLoss: stats.profitLoss,
        reputation: stats.reputation,
        responseTime: stats.averageResponseTime,
        completionTime: stats.averageCompletionTime
      }
    });
  } catch (error) {
    logger.error('Trading statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch trading statistics' });
  }
});

// =============================================================================
// RISK MANAGEMENT
// =============================================================================

// Get risk assessment for user
router.get('/risk-assessment', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const assessment = await getRiskAssessment(userId);
    
    res.json({
      userId,
      riskLevel: assessment.riskLevel,
      riskScore: assessment.riskScore,
      factors: assessment.factors,
      recommendations: assessment.recommendations,
      limits: assessment.limits,
      lastAssessed: assessment.lastAssessed
    });
  } catch (error) {
    logger.error('Risk assessment error:', error);
    res.status(500).json({ error: 'Failed to fetch risk assessment' });
  }
});

// Calculate trading fees
router.post('/fees/calculate', authenticateToken, async (req, res) => {
  try {
    const { tradeType, amount, cryptocurrency, fiatCurrency } = req.body;
    const userId = req.userId;
    
    if (!tradeType || !amount || !cryptocurrency) {
      return res.status(400).json({ 
        error: 'Trade type, amount, and cryptocurrency are required' 
      });
    }
    
    const fees = await calculateTradingFees(userId, {
      tradeType,
      amount: parseFloat(amount),
      cryptocurrency: cryptocurrency.toUpperCase(),
      fiatCurrency: fiatCurrency?.toUpperCase()
    });
    
    res.json({
      tradeType,
      amount: parseFloat(amount),
      cryptocurrency: cryptocurrency.toUpperCase(),
      fees: {
        tradingFee: fees.tradingFee,
        networkFee: fees.networkFee,
        totalFee: fees.totalFee,
        feePercentage: fees.feePercentage
      },
      netAmount: fees.netAmount
    });
  } catch (error) {
    logger.error('Fee calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate fees' });
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getWithdrawalLimits(kycLevel: number) {
  const limits = {
    0: { daily: 100, monthly: 1000 },      // No KYC
    1: { daily: 1000, monthly: 10000 },    // Basic KYC
    2: { daily: 10000, monthly: 100000 },  // Enhanced KYC
    3: { daily: 50000, monthly: 500000 }   // Premium KYC
  };
  
  return limits[kycLevel] || limits[0];
}

function calculateDisputePriority(escrow: any, reason: string) {
  // High priority for large amounts or serious violations
  if (escrow.amount > 10000 || reason.includes('fraud')) {
    return 'high';
  } else if (escrow.amount > 1000 || reason.includes('scam')) {
    return 'medium';
  }
  return 'low';
}

// Update the getAllowedEscrowActions function to fix TypeScript error
function getAllowedEscrowActions(escrow: any, userId: string) {
  const actions: string[] = [];
  
  if (escrow.status === 'pending_payment' && escrow.buyerId === userId) {
    actions.push('confirm_payment');
  }
  
  if (escrow.status === 'payment_confirmed' && escrow.sellerId === userId) {
    actions.push('release_funds');
  }
  
  if (['payment_confirmed', 'pending_release'].includes(escrow.status)) {
    actions.push('initiate_dispute');
  }
  
  return actions;
}

// Mock database functions have been moved to cryptoDbService.ts

export default router;
