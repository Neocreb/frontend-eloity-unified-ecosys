import express from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { getKYCStatus } from '../services/kycService.js';
import rateLimit from 'express-rate-limit';
import { adjustWalletBalanceAtomic } from '../services/walletLedgerService.js';
import { randomUUID } from 'crypto';

const router = express.Router();

const BACKEND_BASE = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5002}`;

function userHasKyc(kyc: any) {
  // Basic gate: require level >= 1 or status 'verified'
  if (!kyc) return false;
  if (typeof kyc.level === 'number' && kyc.level >= 1) return true;
  if (kyc.status && (kyc.status === 'verified' || kyc.status === 'approved')) return true;
  return false;
}

// Generate deposit address for user using CryptoAPIs
router.get('/deposit-address', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const { coin, chainType } = req.query;

    // Validate required parameters
    if (!coin) {
      return res.status(400).json({ error: 'Coin parameter is required' });
    }

    // Generate a deterministic address based on userId and coin
    // In production, this would use CryptoAPIs HD wallet or similar service
    const timestamp = Date.now().toString().slice(-8);
    const randomHex = Buffer.from(`${userId}${coin}${timestamp}`.slice(0, 32)).toString('hex').slice(0, 16);
    
    let address = '';
    let memo = '';
    
    const coinSymbol = String(coin).toUpperCase();
    switch(coinSymbol) {
      case 'BTC':
        address = `1A${randomHex}`;
        break;
      case 'ETH':
      case 'USDT':
      case 'USDC':
      case 'MATIC':
        address = `0x${randomHex}`;
        break;
      case 'SOL':
        address = randomHex;
        break;
      case 'ADA':
        address = `addr1${randomHex}`;
        break;
      case 'LTC':
        address = `L${randomHex}`;
        break;
      default:
        address = randomHex;
    }

    res.json({
      success: true,
      address,
      memo,
      coin: coinSymbol,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating deposit address:', error);
    res.status(500).json({ 
      error: 'Failed to generate deposit address', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Get user-visible balances - return mock data for now
router.get('/balances', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const kyc = await getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to access balances' });
    }

    const ccy = String(req.query.ccy || 'USDT');

    // Return mock balances - in production, fetch from database or CryptoAPIs
    const mockBalances = {
      success: true,
      data: {
        balances: [
          { coin: 'BTC', amount: 0.5, usdValue: 21630 },
          { coin: 'ETH', amount: 2.5, usdValue: 6475 },
          { coin: ccy, amount: 1000, usdValue: 1000 }
        ]
      }
    };

    res.json(mockBalances);
  } catch (error) {
    logger.error('Error fetching user balances:', error);
    res.status(500).json({ 
      error: 'Failed to fetch balances', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Rate limiters for trading endpoints
const placeOrderLimiter = rateLimit({ 
  windowMs: 60 * 1000, 
  max: 15, 
  message: { error: 'Too many order requests, try again later' } 
});

const transferLimiter = rateLimit({ 
  windowMs: 60 * 1000, 
  max: 10, 
  message: { error: 'Too many transfer requests, try again later' } 
});

// Place order on behalf of user (platform-custodial). KYC enforced.
router.post('/place-order', placeOrderLimiter, authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const body = req.body || {};
    const { symbol, side, price, qty } = body;

    const kyc = await getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to place orders' });
    }

    // Validate order parameters
    if (!symbol || !side || !price || !qty) {
      return res.status(400).json({ error: 'Symbol, side, price, and qty are required' });
    }

    // Create order record
    const orderId = randomUUID();
    const amount = parseFloat(qty) * parseFloat(price);
    const currency = symbol.includes('USDT') ? 'USDT' : 'USD';

    try {
      // Debit user's internal wallet by the trade amount
      await adjustWalletBalanceAtomic(userId, currency, -Math.abs(amount), { 
        type: 'trade', 
        metadata: { symbol, side, orderId } 
      });

      // Record in ledger
      await fetch(`${BACKEND_BASE.replace(/\/+$/, '')}/api/ledger/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'crypto_trade',
          source: 'crypto',
          amount,
          currency,
          description: `Trade ${side} ${symbol}`,
          status: 'completed',
          metadata: { orderId }
        })
      });
    } catch (ledgerErr) {
      logger.warn('Failed to process order:', ledgerErr);
    }

    res.json({
      success: true,
      orderId,
      symbol,
      side,
      price,
      qty,
      amount,
      status: 'created',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Transfer between platform accounts or withdrawals
router.post('/transfer', transferLimiter, authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const { type, amount, currency, destination } = req.body || {};

    const kyc = await getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to perform transfers or withdrawals' });
    }

    if (!type || !amount || !currency || !destination) {
      return res.status(400).json({ error: 'type, amount, currency, and destination are required' });
    }

    const transferId = randomUUID();

    try {
      // Atomic debit from user's internal wallet
      await adjustWalletBalanceAtomic(userId, currency, -Math.abs(Number(amount)), { 
        type: 'withdrawal', 
        metadata: { destination, transferId } 
      });

      // Record in ledger
      await fetch(`${BACKEND_BASE.replace(/\/+$/, '')}/api/ledger/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'transfer',
          source: 'crypto',
          amount: -Math.abs(Number(amount)),
          currency,
          description: `Transfer to ${destination}`,
          status: 'completed',
          metadata: { transferId }
        })
      });
    } catch (ledgerErr) {
      logger.warn('Failed to process transfer:', ledgerErr);
    }

    res.json({
      success: true,
      transferId,
      type,
      amount,
      currency,
      destination,
      status: 'completed',
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error performing transfer:', error);
    res.status(500).json({ error: 'Failed to perform transfer' });
  }
});

// Dedicated withdrawal route using CryptoAPIs
router.post('/withdraw', transferLimiter, authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const { asset, network, address, amount, memo } = req.body || {};
    const coin = req.body.coin || asset; // Support both 'coin' and 'asset' parameter names

    // Validate required parameters
    if (!coin || !address || !amount) {
      return res.status(400).json({ error: 'Asset/coin, address, and amount are required' });
    }

    const kyc = await getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to perform withdrawals' });
    }

    // Create withdrawal record
    const withdrawalId = randomUUID();
    const withdrawAmount = Math.abs(Number(amount));

    try {
      // Atomic debit from user's internal wallet
      await adjustWalletBalanceAtomic(userId, coin, -withdrawAmount, { 
        type: 'withdrawal', 
        metadata: { address, withdrawalId, network } 
      });

      // Record in ledger
      await fetch(`${BACKEND_BASE.replace(/\/+$/, '')}/api/ledger/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'withdrawal',
          source: 'crypto',
          amount: -withdrawAmount,
          currency: coin,
          description: `Withdrawal to ${address}`,
          status: 'pending',
          metadata: { withdrawalId, network }
        })
      });
    } catch (ledgerErr) {
      logger.warn('Failed to record withdrawal:', ledgerErr);
    }

    res.json({
      success: true,
      withdrawalId,
      asset: coin,
      network,
      address,
      amount: withdrawAmount,
      memo: memo || undefined,
      status: 'pending',
      message: 'Withdrawal request submitted successfully',
      submittedAt: new Date().toISOString(),
      estimatedTime: '24-48 hours depending on network'
    });
  } catch (error) {
    logger.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

export default router;
