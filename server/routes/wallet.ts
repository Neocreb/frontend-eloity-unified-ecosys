import express, { Request, Response } from 'express';
import { eq, sum, desc, and, gte } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import {
  crypto_wallets,
  crypto_transactions,
  crypto_prices
} from '../../shared/crypto-schema.js';
import {
  orders,
  order_items,
  user_rewards,
  freelance_payments,
  referral_events,
  reward_sharing_transactions
} from '../../shared/enhanced-schema.js';
import { users } from '../../shared/schema.js';
import type { Database } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { db as globalDb } from '../enhanced-index.js';
import bankAccountsRouter from './wallet-bankaccounts.js';
import walletTransactionsRouter from './wallet-transactions.js';

const router = express.Router();

router.use('/bank-accounts', bankAccountsRouter);
router.use('/transactions', walletTransactionsRouter);

// Use req.db when available, otherwise fall back to the global db
const getDb = (req: Request) => (req.db as PostgresJsDatabase<any>) || (globalDb as PostgresJsDatabase<any>);

// Extend request to include db and userId
declare global {
  namespace Express {
    interface Request {
      db?: PostgresJsDatabase<any>;
      userId?: string;
    }
  }
}

/**
 * GET /api/wallet/balance
 * Returns unified wallet balance across all sources
 * Sources: crypto, marketplace orders, freelance payments, rewards, referral earnings
 */
router.get('/balance', async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const balances = {
      crypto: 0,
      marketplace: 0,
      freelance: 0,
      rewards: 0,
      referral: 0,
      total: 0
    };

    // Get crypto balance
    try {
      const cryptoWallets = await db
        .select({
          balance: crypto_wallets.balance,
          currency: crypto_wallets.currency
        })
        .from(crypto_wallets)
        .where(eq(crypto_wallets.user_id, userId));

      for (const wallet of cryptoWallets) {
        balances.crypto += parseFloat(wallet.balance.toString()) || 0;
      }
    } catch (err) {
      logger.warn('Failed to fetch crypto balance:', err);
    }

    // Get marketplace (orders) balance
    try {
      const orderResult = await db
        .select({
          total: sum(orders.total_amount)
        })
        .from(orders)
        .where(
          and(
            eq(orders.seller_id, userId),
            eq(orders.status, 'completed')
          )
        );

      balances.marketplace = parseFloat(orderResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch marketplace balance:', err);
    }

    // Get freelance balance
    try {
      const freelanceResult = await db
        .select({
          total: sum(freelance_payments.amount)
        })
        .from(freelance_payments)
        .where(
          and(
            eq(freelance_payments.payee_id, userId),
            eq(freelance_payments.status, 'completed')
          )
        );

      balances.freelance = parseFloat(freelanceResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch freelance balance:', err);
    }

    // Get rewards balance
    try {
      const rewardsResult = await db
        .select({
          total: sum(user_rewards.amount)
        })
        .from(user_rewards)
        .where(eq(user_rewards.user_id, userId));

      balances.rewards = parseFloat(rewardsResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch rewards balance:', err);
    }

    // Get referral earnings
    try {
      const referralResult = await db
        .select({
          total: sum(referral_events.reward_amount)
        })
        .from(referral_events)
        .where(eq(referral_events.referrer_id, userId));

      balances.referral = parseFloat(referralResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch referral balance:', err);
    }

    // Calculate total
    balances.total = 
      balances.crypto + 
      balances.marketplace + 
      balances.freelance + 
      balances.rewards + 
      balances.referral;

    res.json({
      success: true,
      data: {
        balances,
        userId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching wallet balance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/wallet/transactions
 * Returns paginated transaction history across all sources
 */
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const transactions: any[] = [];

    // Get crypto transactions
    try {
      const cryptoTxs = await db
        .select({
          id: crypto_transactions.id,
          type: crypto_transactions.type,
          amount: crypto_transactions.amount,
          currency: crypto_transactions.currency,
          status: crypto_transactions.status,
          created_at: crypto_transactions.created_at,
          source: 'crypto'
        })
        .from(crypto_transactions)
        .where(
          eq(crypto_transactions.user_id, userId)
        )
        .orderBy(desc(crypto_transactions.created_at))
        .limit(limit)
        .offset(offset);

      transactions.push(...cryptoTxs);
    } catch (err) {
      logger.warn('Failed to fetch crypto transactions:', err);
    }

    // Get marketplace transactions
    try {
      const marketplaceTxs = await db
        .select({
          id: orders.id,
          type: 'marketplace_order',
          amount: orders.total_amount,
          currency: orders.currency,
          status: orders.status,
          created_at: orders.created_at,
          source: 'marketplace'
        })
        .from(orders)
        .where(eq(orders.seller_id, userId))
        .orderBy(desc(orders.created_at))
        .limit(limit)
        .offset(offset);

      transactions.push(...marketplaceTxs);
    } catch (err) {
      logger.warn('Failed to fetch marketplace transactions:', err);
    }

    // Get freelance transactions
    try {
      const freelanceTxs = await db
        .select({
          id: freelance_payments.id,
          type: 'freelance_payment',
          amount: freelance_payments.amount,
          currency: freelance_payments.currency,
          status: freelance_payments.status,
          created_at: freelance_payments.created_at,
          source: 'freelance'
        })
        .from(freelance_payments)
        .where(eq(freelance_payments.payee_id, userId))
        .orderBy(desc(freelance_payments.created_at))
        .limit(limit)
        .offset(offset);

      transactions.push(...freelanceTxs);
    } catch (err) {
      logger.warn('Failed to fetch freelance transactions:', err);
    }

    // Get reward transactions
    try {
      const rewardTxs = await db
        .select({
          id: user_rewards.id,
          type: user_rewards.type,
          amount: user_rewards.amount,
          currency: 'ELOIT',
          status: user_rewards.status,
          created_at: user_rewards.created_at,
          source: 'rewards'
        })
        .from(user_rewards)
        .where(eq(user_rewards.user_id, userId))
        .orderBy(desc(user_rewards.created_at))
        .limit(limit)
        .offset(offset);

      transactions.push(...rewardTxs);
    } catch (err) {
      logger.warn('Failed to fetch reward transactions:', err);
    }

    // Sort all transactions by created_at descending
    transactions.sort((a, b) => {
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      return bDate - aDate;
    });

    // Apply pagination after sorting
    const paginatedTransactions = transactions.slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total: transactions.length,
        limit,
        offset,
        userId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching wallet transactions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/wallet/summary
 * Returns a summary of wallet data including totals and recent activity
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    // Get balances (reuse logic from /balance endpoint)
    const balancesResponse = await fetch(
      `http://localhost:${process.env.PORT || 5002}/api/wallet/balance?userId=${userId}`,
      {
        headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
      }
    );
    const balancesData = await balancesResponse.json();

    // Get recent transactions
    const recentTransactions = await db
      .select({
        id: crypto_transactions.id,
        type: crypto_transactions.type,
        amount: crypto_transactions.amount,
        status: crypto_transactions.status,
        created_at: crypto_transactions.created_at,
        source: 'crypto'
      })
      .from(crypto_transactions)
      .where(eq(crypto_transactions.user_id, userId))
      .orderBy(desc(crypto_transactions.created_at))
      .limit(5);

    res.json({
      success: true,
      data: {
        balances: balancesData.data?.balances,
        recentTransactions,
        userId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching wallet summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/wallet/sources
 * Returns breakdown of earnings by source
 */
router.get('/sources', async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const db = getDb(req);
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const sources = {
      crypto: { label: 'Cryptocurrency', amount: 0, percentage: 0 },
      marketplace: { label: 'Marketplace Sales', amount: 0, percentage: 0 },
      freelance: { label: 'Freelance Work', amount: 0, percentage: 0 },
      rewards: { label: 'Rewards & Activity', amount: 0, percentage: 0 },
      referral: { label: 'Referral Earnings', amount: 0, percentage: 0 }
    };

    // Fetch amounts from each source
    try {
      const cryptoWallets = await db
        .select({ balance: crypto_wallets.balance })
        .from(crypto_wallets)
        .where(eq(crypto_wallets.user_id, userId));
      sources.crypto.amount = cryptoWallets.reduce((sum, w) => sum + parseFloat(w.balance.toString() || '0'), 0);
    } catch (err) {
      logger.warn('Failed to fetch crypto sources:', err);
    }

    try {
      const orderResult = await db
        .select({ total: sum(orders.total_amount) })
        .from(orders)
        .where(and(eq(orders.seller_id, userId), eq(orders.status, 'completed')));
      sources.marketplace.amount = parseFloat(orderResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch marketplace sources:', err);
    }

    try {
      const freelanceResult = await db
        .select({ total: sum(freelance_payments.amount) })
        .from(freelance_payments)
        .where(and(eq(freelance_payments.payee_id, userId), eq(freelance_payments.status, 'completed')));
      sources.freelance.amount = parseFloat(freelanceResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch freelance sources:', err);
    }

    try {
      const rewardsResult = await db
        .select({ total: sum(user_rewards.amount) })
        .from(user_rewards)
        .where(eq(user_rewards.user_id, userId));
      sources.rewards.amount = parseFloat(rewardsResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch rewards sources:', err);
    }

    try {
      const referralResult = await db
        .select({ total: sum(referral_events.reward_amount) })
        .from(referral_events)
        .where(eq(referral_events.referrer_id, userId));
      sources.referral.amount = parseFloat(referralResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch referral sources:', err);
    }

    // Calculate total and percentages
    const total = Object.values(sources).reduce((sum, source) => sum + source.amount, 0);
    if (total > 0) {
      Object.values(sources).forEach(source => {
        source.percentage = (source.amount / total) * 100;
      });
    }

    res.json({
      success: true,
      data: {
        sources,
        total,
        userId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching wallet sources:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet sources',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Root endpoint – return a canonical wallet snapshot for current user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.userId || (req.query.userId as string));
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const db = getDb(req);

    // Aggregate balances by specific currencies for widget compatibility
    let usdt = 0, eth = 0, btc = 0, eloits = 0;

    try {
      const wallets = await db
        .select({ balance: crypto_wallets.balance, currency: crypto_wallets.currency })
        .from(crypto_wallets)
        .where(eq(crypto_wallets.user_id, userId));

      for (const w of wallets) {
        const amt = parseFloat(w.balance?.toString() || '0');
        if (w.currency?.toUpperCase() === 'USDT') usdt += amt;
        else if (w.currency?.toUpperCase() === 'ETH') eth += amt;
        else if (w.currency?.toUpperCase() === 'BTC') btc += amt;
      }
    } catch (err) {
      logger.warn('Failed to fetch crypto currency balances for /api/wallet:', err);
    }

    try {
      const rewardsSum = await db
        .select({ total: sum(user_rewards.amount) })
        .from(user_rewards)
        .where(eq(user_rewards.user_id, userId));
      eloits = parseFloat(rewardsSum[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch rewards total for /api/wallet:', err);
    }

    const wallet = {
      id: `wallet-${userId}`,
      userId,
      usdtBalance: usdt,
      ethBalance: eth,
      btcBalance: btc,
      eloitsBalance: eloits,
      eloityPointsBalance: eloits,
      isFrozen: false,
      createdAt: new Date().toISOString(),
    };

    res.json({ success: true, wallet });
  } catch (error) {
    logger.error('Error in GET /api/wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Parameterized balance route used by realtime hook
router.get('/:userId/balance', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    // Reuse the aggregation from /balance
    const fakeReq = { ...req, query: { userId } } as Request;
    const db = getDb(req);

    const balances = {
      crypto: 0,
      marketplace: 0,
      freelance: 0,
      rewards: 0,
      referral: 0,
      total: 0,
    } as any;

    try {
      const cryptoWallets = await db
        .select({ balance: crypto_wallets.balance, currency: crypto_wallets.currency })
        .from(crypto_wallets)
        .where(eq(crypto_wallets.user_id, userId));
      for (const w of cryptoWallets) balances.crypto += parseFloat(w.balance?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch crypto balance (param route):', err);
    }

    try {
      const orderResult = await db
        .select({ total: sum(orders.total_amount) })
        .from(orders)
        .where(and(eq(orders.seller_id, userId), eq(orders.status, 'completed')));
      balances.marketplace = parseFloat(orderResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch marketplace balance (param route):', err);
    }

    try {
      const freelanceResult = await db
        .select({ total: sum(freelance_payments.amount) })
        .from(freelance_payments)
        .where(and(eq(freelance_payments.payee_id, userId), eq(freelance_payments.status, 'completed')));
      balances.freelance = parseFloat(freelanceResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch freelance balance (param route):', err);
    }

    try {
      const rewardsResult = await db
        .select({ total: sum(user_rewards.amount) })
        .from(user_rewards)
        .where(eq(user_rewards.user_id, userId));
      balances.rewards = parseFloat(rewardsResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch rewards balance (param route):', err);
    }

    try {
      const referralResult = await db
        .select({ total: sum(referral_events.reward_amount) })
        .from(referral_events)
        .where(eq(referral_events.referrer_id, userId));
      balances.referral = parseFloat(referralResult[0]?.total?.toString() || '0');
    } catch (err) {
      logger.warn('Failed to fetch referral balance (param route):', err);
    }

    balances.total = balances.crypto + balances.marketplace + balances.freelance + balances.rewards + balances.referral;

    // Match use-realtime expectation: { balance: ... }
    res.json({ success: true, balance: balances, userId, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Error in GET /api/wallet/:userId/balance:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
});

// Send money between users (server-side ledger recording)
router.post('/send', async (req: Request, res: Response) => {
  try {
    const senderId = req.userId || (req.body.senderId as string);
    const { recipientId, amount, currency, description } = req.body || {};

    if (!senderId || !recipientId || !amount || !currency) {
      return res.status(400).json({ error: 'senderId, recipientId, amount, and currency are required' });
    }

    const amt = parseFloat(amount.toString());
    if (!isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const transactionId = `send-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    // Record in application ledger (no direct wallet table mutation here)
    logger.info('Wallet transfer recorded', { transactionId, senderId, recipientId, amount: amt, currency, description });

    try {
      const base = `http://localhost:${process.env.PORT || 5002}`;
      // Sender debit
      await fetch(`${base}/api/ledger/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: senderId,
          type: 'transfer',
          source: 'crypto',
          amount: -Math.abs(amt),
          currency,
          description: description || `Transfer to ${recipientId}`,
          status: 'completed'
        })
      });
      // Recipient credit
      await fetch(`${base}/api/ledger/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: recipientId,
          type: 'transfer',
          source: 'crypto',
          amount: Math.abs(amt),
          currency,
          description: description || `Transfer from ${senderId}`,
          status: 'completed'
        })
      });
    } catch (err) {
      logger.warn('Failed to record transfer in ledger API:', err);
    }

    res.json({ success: true, transactionId });
  } catch (error) {
    logger.error('Error in POST /api/wallet/send:', error);
    res.status(500).json({ error: 'Failed to send money' });
  }
});

// Update crypto balance for a specific currency (delta adjustment)
router.post('/update-crypto-balance', async (req: Request, res: Response) => {
  try {
    const userId = req.userId || (req.body.userId as string);
    const { currency, amount } = req.body || {};

    if (!userId || !currency || amount === undefined) {
      return res.status(400).json({ error: 'userId, currency, and amount are required' });
    }

    const db = getDb(req);
    const delta = parseFloat(amount.toString());

    // Find existing wallet row for this currency
    const rows = await db
      .select({ id: crypto_wallets.id, balance: crypto_wallets.balance })
      .from(crypto_wallets)
      .where(and(eq(crypto_wallets.user_id, userId), eq(crypto_wallets.currency, currency)));

    if (!rows.length) {
      return res.status(404).json({ error: `Wallet not found for currency ${currency}` });
    }

    const current = parseFloat(rows[0].balance?.toString() || '0');
    const next = current + delta;

    await db
      .update(crypto_wallets)
      .set({ balance: next.toString(), updated_at: new Date() })
      .where(eq(crypto_wallets.id, rows[0].id));

    logger.info('Crypto balance updated', { userId, currency, delta, next });

    // Record ledger entry for this balance adjustment
    try {
      const base = `http://localhost:${process.env.PORT || 5002}`;
      await fetch(`${base}/api/ledger/record-crypto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: Math.abs(delta), currency, type: delta >= 0 ? 'credit' : 'debit', status: 'completed' })
      });
    } catch (err) {
      logger.warn('Failed to record crypto balance update in ledger API:', err);
    }

    res.json({ success: true, userId, currency, newBalance: next });
  } catch (error) {
    logger.error('Error in POST /api/wallet/update-crypto-balance:', error);
    res.status(500).json({ error: 'Failed to update crypto balance' });
  }
});

export default router;
