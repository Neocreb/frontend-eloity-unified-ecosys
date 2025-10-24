import express from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { getKYCStatus } from '../services/kycService.js';
import rateLimit from 'express-rate-limit';
import { adjustWalletBalanceAtomic } from '../services/walletLedgerService.js';
import crypto from 'crypto';

const router = express.Router();

const SUPABASE_EDGE_BASE = process.env.SUPABASE_EDGE_BASE || process.env.SUPABASE_FUNCTIONS_URL || '';
const BYBIT_PUBLIC_API = process.env.BYBIT_PUBLIC_API || '';
const BYBIT_SECRET_API = process.env.BYBIT_SECRET_API || '';
const BACKEND_BASE = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5002}`;

if (!SUPABASE_EDGE_BASE && (!BYBIT_PUBLIC_API || !BYBIT_SECRET_API)) {
  logger.warn('SUPABASE_EDGE_BASE or BYBIT API keys not configured; some crypto user routes will have limited functionality');
}

// Helper: HMAC-SHA256 signature for Bybit API
async function signBybit(secret: string, timestamp: string, method: string, path: string, body: string = '') {
  const payload = `${timestamp}${method.toUpperCase()}${path}${body}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

async function callBybitDirect(method: string, path: string, query: string = '', body: any = null): Promise<any> {
  try {
    if (!BYBIT_PUBLIC_API || !BYBIT_SECRET_API) {
      throw new Error('Bybit API keys not configured');
    }

    const timestamp = Date.now().toString();
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = await signBybit(BYBIT_SECRET_API, timestamp, method, path, bodyString);

    const fullUrl = `https://api.bybit.com${path}${query ? `?${query}` : ''}`;
    const headers: any = {
      'Content-Type': 'application/json',
      'X-BAPI-API-KEY': BYBIT_PUBLIC_API,
      'X-BAPI-SIGN': signature,
      'X-BAPI-TIMESTAMP': timestamp,
      'X-BAPI-RECV-WINDOW': '5000'
    };

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: bodyString || undefined
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { error: text, status: response.status };
    }
  } catch (error) {
    logger.error('Direct Bybit API call error:', error);
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

// Get user-visible balances from Bybit (via edge function or direct API) — requires KYC
router.get('/balances', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId as string;
    const kyc = await getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to access balances' });
    }

    const ccy = String(req.query.ccy || '');

    // Try Supabase edge function first if configured
    if (SUPABASE_EDGE_BASE) {
      const url = `${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/balances${ccy ? `?ccy=${encodeURIComponent(ccy)}` : ''}`;

      // Get Supabase credentials from environment variables
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
      const headers: any = { 'Content-Type': 'application/json' };

      if (supabaseAnonKey) {
        headers['Authorization'] = `Bearer ${supabaseAnonKey}`;
        headers['apikey'] = supabaseAnonKey;
      }

      const r = await fetch(url, { method: 'GET', headers });
      const text = await r.text();

      // If we get 401 and don't have auth key, fall back to direct Bybit API
      if (r.status === 401 && !supabaseAnonKey) {
        logger.info('Supabase Edge Function requires auth; falling back to direct Bybit API for balances');
        // Continue to direct Bybit API fallback below
      } else {
        try {
          const json = JSON.parse(text);
          return res.status(r.status).json(json);
        } catch (e) {
          return res.status(r.status).send(text);
        }
      }
    }

    // Fallback to direct Bybit API
    if (!BYBIT_PUBLIC_API || !BYBIT_SECRET_API) {
      return res.status(503).json({
        error: 'Bybit integration not configured',
        details: 'Please configure SUPABASE_EDGE_BASE or BYBIT API keys'
      });
    }

    const path = '/v5/account/wallet-balance';
    const query = ccy ? `ccy=${encodeURIComponent(ccy)}` : '';
    const result = await callBybitDirect('GET', path, query);
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

    const kyc = await getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to place orders' });
    }

    // Forward to Supabase edge function which signs with platform key
    const url = `${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/bybit/place-order`;
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

    const kyc = await getKYCStatus(userId);
    if (!userHasKyc(kyc)) {
      return res.status(403).json({ error: 'KYC required to perform transfers or withdrawals' });
    }

    const url = `${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/bybit/transfer`;
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

export default router;
