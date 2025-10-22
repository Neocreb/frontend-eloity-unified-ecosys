import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Base URL for Supabase Edge Functions (set this env in server runtime)
const SUPABASE_EDGE_BASE = process.env.SUPABASE_EDGE_BASE || process.env.SUPABASE_FUNCTIONS_URL || '';
const BYBIT_PUBLIC_API = process.env.BYBIT_PUBLIC_API || '';
const BYBIT_SECRET_API = process.env.BYBIT_SECRET_API || '';

if (!SUPABASE_EDGE_BASE && (!BYBIT_PUBLIC_API || !BYBIT_SECRET_API)) {
  logger.warn('Neither SUPABASE_EDGE_BASE nor BYBIT API keys configured. Some Bybit features will be limited.');
}

// Helper: HMAC-SHA256 signature for Bybit API
import crypto from 'crypto';

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

async function proxyToEdge(req: Request, res: Response, action: string) {
  try {
    // If SUPABASE_EDGE_BASE is configured, use it
    if (SUPABASE_EDGE_BASE) {
      const url = new URL(`${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/${action}`);
      Object.entries(req.query || {}).forEach(([k, v]) => url.searchParams.set(k, String(v)));

      // Get Supabase credentials from environment variables
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

      const init: any = {
        method: req.method,
        headers: { 'Content-Type': 'application/json' }
      };

      // Add Supabase authentication headers if available
      if (supabaseAnonKey) {
        init.headers['Authorization'] = `Bearer ${supabaseAnonKey}`;
        init.headers['apikey'] = supabaseAnonKey;
      }

      if (req.method !== 'GET') {
        init.body = JSON.stringify(req.body || {});
      }

      const r = await fetch(url.toString(), init as any);
      const text = await r.text();

      // If we get 401 and don't have auth key, fall back to direct Bybit API
      if (r.status === 401 && !supabaseAnonKey) {
        logger.info('Supabase Edge Function requires auth; falling back to direct Bybit API');
        // Continue to direct Bybit API fallback below
      } else {
        try {
          const json = JSON.parse(text);
          res.status(r.status).json(json);
        } catch (e) {
          res.status(r.status).send(text);
        }
        return;
      }
    }

    // Fallback to direct Bybit API if SUPABASE_EDGE_BASE is not configured
    if (!BYBIT_PUBLIC_API || !BYBIT_SECRET_API) {
      return res.status(503).json({
        error: 'Bybit integration not configured',
        details: 'Please configure SUPABASE_EDGE_BASE or BYBIT API keys',
        hint: 'Connect to Supabase for edge functions or set BYBIT_PUBLIC_API and BYBIT_SECRET_API'
      });
    }

    // Handle specific actions
    let path = '';
    let query = '';

    switch (action) {
      case 'deposit-address': {
        path = '/v5/asset/deposit/query-address';
        query = new URLSearchParams(req.query as any).toString();
        const result = await callBybitDirect('GET', path, query);
        return res.status(200).json(result);
      }
      case 'withdraw': {
        path = '/v5/asset/withdraw';
        const result = await callBybitDirect('POST', path, '', req.body);
        return res.status(200).json(result);
      }
      case 'balances': {
        path = '/v5/account/wallet-balance';
        const ccy = req.query.ccy ? `ccy=${encodeURIComponent(String(req.query.ccy))}` : '';
        const result = await callBybitDirect('GET', path, ccy);
        return res.status(200).json(result);
      }
      case 'positions': {
        path = '/v5/position/list';
        const symbol = req.query.symbol ? `symbol=${encodeURIComponent(String(req.query.symbol))}` : '';
        const result = await callBybitDirect('GET', path, symbol);
        return res.status(200).json(result);
      }
      case 'orders': {
        path = '/v5/order/list';
        const symbol = req.query.symbol ? `symbol=${encodeURIComponent(String(req.query.symbol))}` : '';
        const result = await callBybitDirect('GET', path, symbol);
        return res.status(200).json(result);
      }
      case 'place-order': {
        path = '/v5/order/create';
        const result = await callBybitDirect('POST', path, '', req.body);
        return res.status(200).json(result);
      }
      case 'order-history': {
        path = '/v5/exchange-trade/closed-pnl/list';
        const result = await callBybitDirect('GET', path);
        return res.status(200).json(result);
      }
      case 'transfer': {
        path = '/v5/asset/transfer';
        const result = await callBybitDirect('POST', path, '', req.body);
        return res.status(200).json(result);
      }
      case 'convert': {
        path = '/v5/asset/convert';
        const result = await callBybitDirect('POST', path, '', req.body);
        return res.status(200).json(result);
      }
      default:
        return res.status(404).json({ error: 'Unsupported action' });
    }
  } catch (error) {
    logger.error(`Error handling Bybit ${action}:`, error);
    res.status(500).json({ error: `Failed to process Bybit ${action}`, details: error instanceof Error ? error.message : String(error) });
  }
}

// Public endpoint for deposit addresses (no auth required for address generation)
router.get('/deposit-address', async (req, res) => proxyToEdge(req, res, 'deposit-address'));

// Authenticated endpoints
router.get('/balances', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'balances'));
router.get('/positions', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'positions'));
router.get('/orders', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'orders'));
router.post('/place-order', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'place-order'));
router.get('/order-history', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'order-history'));
router.post('/transfer', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'transfer'));
router.post('/convert', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'convert'));
router.post('/withdraw', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'withdraw'));

export default router;
