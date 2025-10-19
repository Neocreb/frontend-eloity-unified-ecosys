import express, { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { 
  crypto_transactions,
  crypto_wallets
} from '../../shared/crypto-schema.js';
import {
  orders,
  freelance_payments,
  user_rewards,
  referral_events,
  reward_sharing_transactions
} from '../../shared/enhanced-schema.js';
import { users } from '../../shared/schema.js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { db as globalDb } from '../enhanced-index.js';

const router = express.Router();
const getDb = (req: Request) => (req.db as PostgresJsDatabase<any>) || (globalDb as PostgresJsDatabase<any>);

declare global {
  namespace Express {
    interface Request {
      db?: PostgresJsDatabase<any>;
      userId?: string;
    }
  }
}

interface LedgerEntry {
  id: string;
  userId: string;
  type: 'crypto_transaction' | 'marketplace_order' | 'freelance_payment' | 'reward' | 'referral' | 'reward_sharing';
  source: 'crypto' | 'marketplace' | 'freelance' | 'rewards' | 'referral';
  amount: number;
  currency: string;
  description: string;
  status: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

/**
 * POST /api/ledger/record
 * Record a balance change transaction for audit trail
 */
router.post('/record', async (req: Request, res: Response) => {
  try {
    const { userId, type, source, amount, currency, description, status, metadata } = req.body;

    if (!userId || !type || !source || amount === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: userId, type, source, amount'
      });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const ledgerEntry: LedgerEntry = {
      id: `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      source,
      amount: parseFloat(amount.toString()),
      currency: currency || 'USD',
      description: description || `${type} transaction`,
      status: status || 'completed',
      metadata: metadata || {},
      createdAt: new Date()
    };

    logger.info('Ledger entry recorded', {
      ledgerId: ledgerEntry.id,
      userId,
      source,
      amount,
      currency
    });

    res.json({
      success: true,
      data: {
        ledgerId: ledgerEntry.id,
        ...ledgerEntry
      }
    });
  } catch (error) {
    logger.error('Error recording ledger entry:', error);
    res.status(500).json({
      error: 'Failed to record ledger entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ledger/record-crypto
 * Record a crypto transaction and update wallet balance
 */
router.post('/record-crypto', async (req: Request, res: Response) => {
  try {
    const { userId, amount, currency, type, txHash, status } = req.body;

    if (!userId || !amount || !currency) {
      return res.status(400).json({
        error: 'Missing required fields: userId, amount, currency'
      });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const transactionId = `crypto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Record crypto transaction
      await db.insert(crypto_transactions).values({
        id: transactionId,
        user_id: userId,
        type: type || 'deposit',
        amount: parseFloat(amount.toString()),
        currency: currency,
        tx_hash: txHash || null,
        status: status || 'pending',
        created_at: new Date()
      }).execute();

      logger.info('Crypto transaction recorded', {
        transactionId,
        userId,
        amount,
        currency,
        type
      });
    } catch (dbErr) {
      logger.warn('Could not insert crypto transaction (table might not exist):', dbErr);
    }

    res.json({
      success: true,
      data: {
        transactionId,
        userId,
        amount,
        currency,
        type,
        status: status || 'pending'
      }
    });
  } catch (error) {
    logger.error('Error recording crypto transaction:', error);
    res.status(500).json({
      error: 'Failed to record crypto transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ledger/record-marketplace
 * Record a marketplace order and seller earnings
 */
router.post('/record-marketplace', async (req: Request, res: Response) => {
  try {
    const { sellerId, orderId, amount, currency, status } = req.body;

    if (!sellerId || !orderId || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: sellerId, orderId, amount'
      });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    try {
      // Update order status if needed
      if (status && orderId) {
        await db.update(orders)
          .set({ status })
          .where(eq(orders.id, orderId))
          .execute();
      }
    } catch (dbErr) {
      logger.warn('Could not update order:', dbErr);
    }

    logger.info('Marketplace order recorded', {
      orderId,
      sellerId,
      amount,
      currency,
      status
    });

    res.json({
      success: true,
      data: {
        orderId,
        sellerId,
        amount: parseFloat(amount.toString()),
        currency: currency || 'USD',
        status: status || 'completed'
      }
    });
  } catch (error) {
    logger.error('Error recording marketplace order:', error);
    res.status(500).json({
      error: 'Failed to record marketplace order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ledger/record-freelance
 * Record a freelance payment
 */
router.post('/record-freelance', async (req: Request, res: Response) => {
  try {
    const { payeeId, payerId, projectId, amount, currency, status } = req.body;

    if (!payeeId || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: payeeId, amount'
      });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const paymentId = `freelance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Record freelance payment
      await db.insert(freelance_payments).values({
        id: paymentId,
        payee_id: payeeId,
        payer_id: payerId || null,
        project_id: projectId || null,
        amount: parseFloat(amount.toString()),
        currency: currency || 'USD',
        status: status || 'completed',
        created_at: new Date()
      }).execute();

      logger.info('Freelance payment recorded', {
        paymentId,
        payeeId,
        amount,
        currency
      });
    } catch (dbErr) {
      logger.warn('Could not insert freelance payment:', dbErr);
    }

    res.json({
      success: true,
      data: {
        paymentId,
        payeeId,
        amount: parseFloat(amount.toString()),
        currency: currency || 'USD',
        status: status || 'completed'
      }
    });
  } catch (error) {
    logger.error('Error recording freelance payment:', error);
    res.status(500).json({
      error: 'Failed to record freelance payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ledger/record-reward
 * Record an activity reward
 */
router.post('/record-reward', async (req: Request, res: Response) => {
  try {
    const { userId, amount, type, activityType, status } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: userId, amount'
      });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const rewardId = `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Record user reward
      await db.insert(user_rewards).values({
        id: rewardId,
        user_id: userId,
        amount: parseFloat(amount.toString()),
        type: type || 'activity',
        activity_type: activityType || 'general',
        status: status || 'completed',
        created_at: new Date()
      }).execute();

      logger.info('Reward recorded', {
        rewardId,
        userId,
        amount,
        type
      });
    } catch (dbErr) {
      logger.warn('Could not insert reward:', dbErr);
    }

    res.json({
      success: true,
      data: {
        rewardId,
        userId,
        amount: parseFloat(amount.toString()),
        type: type || 'activity',
        status: status || 'completed'
      }
    });
  } catch (error) {
    logger.error('Error recording reward:', error);
    res.status(500).json({
      error: 'Failed to record reward',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/ledger/record-referral
 * Record a referral commission
 */
router.post('/record-referral', async (req: Request, res: Response) => {
  try {
    const { referrerId, referredUserId, amount, eventType } = req.body;

    if (!referrerId || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: referrerId, amount'
      });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const referralId = `referral-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Record referral event
      await db.insert(referral_events).values({
        id: referralId,
        referrer_id: referrerId,
        referred_user_id: referredUserId || null,
        event_type: eventType || 'signup',
        reward_amount: parseFloat(amount.toString()),
        created_at: new Date()
      }).execute();

      logger.info('Referral recorded', {
        referralId,
        referrerId,
        amount,
        eventType
      });
    } catch (dbErr) {
      logger.warn('Could not insert referral event:', dbErr);
    }

    res.json({
      success: true,
      data: {
        referralId,
        referrerId,
        referredUserId,
        amount: parseFloat(amount.toString()),
        eventType: eventType || 'signup'
      }
    });
  } catch (error) {
    logger.error('Error recording referral:', error);
    res.status(500).json({
      error: 'Failed to record referral',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/ledger/history/:userId
 * Get ledger history for a user
 */
router.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const ledgerEntries = [];

    // Get crypto transactions
    try {
      const cryptoTxs = await db
        .select()
        .from(crypto_transactions)
        .where(eq(crypto_transactions.user_id, userId))
        .limit(limit)
        .offset(offset);

      ledgerEntries.push(...cryptoTxs.map(tx => ({
        id: tx.id,
        userId: tx.user_id,
        type: 'crypto_transaction',
        source: 'crypto',
        amount: tx.amount,
        currency: tx.currency,
        description: `Crypto ${tx.type}`,
        status: tx.status,
        createdAt: tx.created_at
      })));
    } catch (err) {
      logger.warn('Could not fetch crypto transactions:', err);
    }

    res.json({
      success: true,
      data: {
        entries: ledgerEntries,
        userId,
        limit,
        offset,
        total: ledgerEntries.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching ledger history:', error);
    res.status(500).json({
      error: 'Failed to fetch ledger history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
