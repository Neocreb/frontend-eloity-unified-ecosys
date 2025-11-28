import express from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { kycService } from '../services/kycService.js';
import rateLimit from 'express-rate-limit';
import { adjustWalletBalanceAtomic } from '../services/walletLedgerService.js';
import crypto from 'crypto';

const router = express.Router();

const SUPABASE_EDGE_BASE = process.env.SUPABASE_EDGE_BASE || process.env.SUPABASE_FUNCTIONS_URL || '';
const CRYPTOAPIS_API_KEY = process.env.CRYPTOAPIS_API_KEY || '';
const BACKEND_BASE = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5002}`;

if (!SUPABASE_EDGE_BASE && !CRYPTOAPIS_API_KEY) {
  logger.warn('SUPABASE_EDGE_BASE or CRYPTOAPIS_API_KEY not configured; some crypto user routes will have limited functionality');
}

// Helper: Call CryptoAPIs directly
async function callCryptoAPIs(path: string, method: string = 'GET', body: any = null): Promise<any> {
  try {
    if (!CRYPTOAPIS_API_KEY) {
      throw new Error('CryptoAPIs API key not configured');
    }

    const fullUrl = `https://rest.cryptoapis.io/v2${path}`;
    const headers: any = {
      'Content-Type': 'application/json',
      'X-API-Key': CRYPTOAPIS_API_KEY
    };

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { error: text, status: response.status };
    }
  } catch (error) {
    logger.error('Direct CryptoAPIs call error:', error);
    throw error;
  }
}

function userHasKyc(kyc: any) {
  // Basic gate: require level >= 1 or status 'verified'
  if (!kyc) return false;
  if (typeof kyc.level === 'number' && kyc.level >= 1) return true;
  if (kyc.status && (kyc.status === 'verified' || kyc.status === 'approved')) return true;
  return false;
}

// Generate deposit address for user
router.get('/deposit-address', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const { coin, chainType } = req.query;

    // Allow-list of supported coins for deposit address generation
    const allowedCoins = ['btc', 'eth', 'usdt', 'ltc', 'bch', 'xrp']; // Extend based on supported coins

    // Validate required parameters
    if (!coin) {
      return res.status(400).json({ error: 'Coin parameter is required' });
    }
    if (typeof coin !== 'string' || !allowedCoins.includes(coin.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid coin parameter' });
    }

    // Try Supabase edge function first if configured
    if (SUPABASE_EDGE_BASE) {
      const url = new URL(`${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/cryptoapis/deposit-address`);
      url.searchParams.set('coin', String(coin));
      if (chainType) url.searchParams.set('chainType', String(chainType));

      // Get Supabase credentials from environment variables
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
      const headers: any = { 'Content-Type': 'application/json' };

      if (supabaseAnonKey) {
        headers['Authorization'] = `Bearer ${supabaseAnonKey}`;
        headers['apikey'] = supabaseAnonKey;
      }

      const r = await fetch(url.toString(), { method: 'GET', headers });
      const text = await r.text();

      // If we get 401 and don't have auth key, fall back to direct CryptoAPIs
      if (r.status === 401 && !supabaseAnonKey) {
        logger.info('Supabase Edge Function requires auth; falling back to direct CryptoAPIs for deposit address');
        // Continue to direct CryptoAPIs fallback below
      } else {
        try {
          const json = JSON.parse(text);
          return res.status(r.status).json(json);
        } catch (e) {
          return res.status(r.status).send(text);
        }
      }
    }

    // Fallback to direct CryptoAPIs
    if (!CRYPTOAPIS_API_KEY) {
      return res.status(503).json({
        error: 'CryptoAPIs integration not configured',
        details: 'Please configure SUPABASE_EDGE_BASE or CRYPTOAPIS_API_KEY'
      });
    }

    // Call CryptoAPIs to generate deposit address (safe since coin validated above)
    const path = `/blockchain-tools/${coin}/mainnet/addresses`;
    const result = await callCryptoAPIs(path, 'POST');
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error generating deposit address:', error);
    res.status(500).json({ error: 'Failed to generate deposit address', details: error instanceof Error ? error.message : String(error) });
  }
});

// Get user-visible balances from CryptoAPIs (via edge function or direct API) — requires KYC
router.get('/balances', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const kyc = await kycService.getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to access balances' });
    }

    // Try Supabase edge function first if configured
    if (SUPABASE_EDGE_BASE) {
      const url = `${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/balances`;

      // Get Supabase credentials from environment variables
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
      const headers: any = { 'Content-Type': 'application/json' };

      if (supabaseAnonKey) {
        headers['Authorization'] = `Bearer ${supabaseAnonKey}`;
        headers['apikey'] = supabaseAnonKey;
      }

      const r = await fetch(url, { method: 'GET', headers });
      const text = await r.text();

      // If we get 401 and don't have auth key, fall back to direct CryptoAPIs
      if (r.status === 401 && !supabaseAnonKey) {
        logger.info('Supabase Edge Function requires auth; falling back to direct CryptoAPIs for balances');
        // Continue to direct CryptoAPIs fallback below
      } else {
        try {
          const json = JSON.parse(text);
          return res.status(r.status).json(json);
        } catch (e) {
          return res.status(r.status).send(text);
        }
      }
    }

    // Fallback to direct CryptoAPIs
    if (!CRYPTOAPIS_API_KEY) {
      return res.status(503).json({
        error: 'CryptoAPIs integration not configured',
        details: 'Please configure SUPABASE_EDGE_BASE or CRYPTOAPIS_API_KEY'
      });
    }

    // Call CryptoAPIs to get wallet balances
    const path = '/wallet/balance';
    const result = await callCryptoAPIs(path);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error fetching user balances:', error);
    res.status(500).json({ error: 'Failed to fetch balances', details: error instanceof Error ? error.message : String(error) });
  }
});

// Rate limiters for trading endpoints
const placeOrderLimiter = rateLimit({ windowMs: 60 * 1000, max: 15, message: { error: 'Too many order requests, try again later' } });
const transferLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'Too many transfer requests, try again later' } });

// Place order on behalf of user (platform-custodial). KYC enforced.
router.post('/place-order', placeOrderLimiter, authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const body = req.body || {};

    const kyc = await kycService.getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to place orders' });
    }

    // Forward to Supabase edge function which signs with platform key
    const url = `${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/cryptoapis/place-order`;
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await r.text();
    let jsonResp: any = null;
    try { jsonResp = JSON.parse(text); } catch (e) { jsonResp = { raw: text }; }

    // If successful, attempt atomic wallet adjustments and ledger entries
    if (r.ok) {
      try {
        const { symbol, side, price, qty, amount, currency } = { ...(body || {}), ...(jsonResp || {}) };
        const amt = Number(amount || (qty ? parseFloat(qty) * (price || 0) : 0));
        const ccy = currency || (symbol ? symbol.replace(/USDT|USD/i, 'USD') : 'USD');

        // Debit user's internal wallet by the trade amount
        await adjustWalletBalanceAtomic(userId, ccy, -Math.abs(amt), { type: 'trade', metadata: { request: body, response: jsonResp } });

        // Also call ledger.record for centralized auditing
        await fetch(`${BACKEND_BASE.replace(/\/+$/, '')}/api/ledger/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'crypto_trade',
            source: 'crypto',
            amount: amt,
            currency: ccy,
            description: `Trade ${side || ''} ${symbol || ''}`,
            status: 'completed',
            metadata: { request: body, response: jsonResp }
          })
        });
      } catch (ledgerErr) {
        logger.warn('Failed to perform atomic wallet adjustment or ledger recording for trade:', ledgerErr);
      }
    }

    // Return the edge function response
    if (r.headers.get('content-type')?.includes('application/json')) {
      return res.status(r.status).json(jsonResp);
    }
    return res.status(r.status).send(text);
  } catch (error) {
    logger.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Transfer between platform accounts or withdrawals (platform-custodial transfer). KYC enforced for withdrawals.
router.post('/transfer', transferLimiter, authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const { type, amount, currency, destination } = req.body || {};

    const kyc = await kycService.getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to perform transfers or withdrawals' });
    }

    const url = `${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/cryptoapis/transfer`;
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body || {}) });
    const text = await r.text();
    let jsonResp: any = null;
    try { jsonResp = JSON.parse(text); } catch (e) { jsonResp = { raw: text }; }

    if (r.ok) {
      try {
        // Atomic debit from user's internal wallet
        await adjustWalletBalanceAtomic(userId, currency || 'USD', -Math.abs(Number(amount || 0)), { type: 'withdrawal', metadata: { destination, response: jsonResp } });

        // Ledger: record debit from user's internal balance
        await fetch(`${BACKEND_BASE.replace(/\/+$/, '')}/api/ledger/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'transfer',
            source: 'crypto',
            amount: -Math.abs(Number(amount || 0)),
            currency: currency || 'USD',
            description: `Transfer to ${destination || 'external'}`,
            status: 'completed',
            metadata: { response: jsonResp }
          })
        });
      } catch (ledgerErr) {
        logger.warn('Failed to perform atomic debit or ledger entry for transfer:', ledgerErr);
      }
    }

    if (r.headers.get('content-type')?.includes('application/json')) {
      return res.status(r.status).json(jsonResp);
    }
    return res.status(r.status).send(text);
  } catch (error) {
    logger.error('Error performing transfer:', error);
    res.status(500).json({ error: 'Failed to perform transfer' });
  }
});

// Dedicated withdrawal route
router.post('/withdraw', transferLimiter, authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const { coin, chain, address, amount, tag } = req.body || {};

    // Validate required parameters
    if (!coin || !address || !amount) {
      return res.status(400).json({ error: 'Coin, address, and amount are required' });
    }

    const kyc = await kycService.getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to perform withdrawals' });
    }

    // Try Supabase edge function first if configured
    if (SUPABASE_EDGE_BASE) {
      const url = `${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/cryptoapis/withdraw`;
      const r = await fetch(url, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(req.body || {}) 
      });
      const text = await r.text();
      let jsonResp: any = null;
      try { jsonResp = JSON.parse(text); } catch (e) { jsonResp = { raw: text }; }

      if (r.ok) {
        try {
          // Atomic debit from user's internal wallet
          await adjustWalletBalanceAtomic(userId, coin, -Math.abs(Number(amount || 0)), { type: 'withdrawal', metadata: { address, response: jsonResp } });

          // Ledger: record debit from user's internal balance
          await fetch(`${BACKEND_BASE.replace(/\/+$/, '')}/api/ledger/record`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              type: 'withdrawal',
              source: 'crypto',
              amount: -Math.abs(Number(amount || 0)),
              currency: coin,
              description: `Withdrawal to ${address}`,
              status: 'pending',
              metadata: { response: jsonResp }
            })
          });
        } catch (ledgerErr) {
          logger.warn('Failed to perform atomic debit or ledger entry for withdrawal:', ledgerErr);
        }
      }

      if (r.headers.get('content-type')?.includes('application/json')) {
        return res.status(r.status).json(jsonResp);
      }
      return res.status(r.status).send(text);
    }

    // Fallback to direct CryptoAPIs
    if (!CRYPTOAPIS_API_KEY) {
      return res.status(503).json({
        error: 'CryptoAPIs integration not configured',
        details: 'Please configure SUPABASE_EDGE_BASE or CRYPTOAPIS_API_KEY'
      });
    }

    // Call CryptoAPIs to initiate withdrawal
    const path = `/wallet/withdrawals`;
    const body = {
      coin,
      chain,
      address,
      amount,
      tag
    };
    
    const result = await callCryptoAPIs(path, 'POST', body);
    
    if (result.success) {
      try {
        // Atomic debit from user's internal wallet
        await adjustWalletBalanceAtomic(userId, coin, -Math.abs(Number(amount || 0)), { type: 'withdrawal', metadata: { address, response: result } });

        // Ledger: record debit from user's internal balance
        await fetch(`${BACKEND_BASE.replace(/\/+$/, '')}/api/ledger/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'withdrawal',
            source: 'crypto',
            amount: -Math.abs(Number(amount || 0)),
            currency: coin,
            description: `Withdrawal to ${address}`,
            status: 'pending',
            metadata: { response: result }
          })
        });
      } catch (ledgerErr) {
        logger.warn('Failed to perform atomic debit or ledger entry for withdrawal:', ledgerErr);
      }
    }
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Failed to process withdrawal', details: error instanceof Error ? error.message : String(error) });
  }
});

export default router;