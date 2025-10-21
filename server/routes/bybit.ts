import express, { Request, Response } from 'express';
import express from 'express';
import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Base URL for Supabase Edge Functions (set this env in server runtime)
const SUPABASE_EDGE_BASE = process.env.SUPABASE_EDGE_BASE || process.env.SUPABASE_FUNCTIONS_URL || '';
if (!SUPABASE_EDGE_BASE) {
  logger.warn('SUPABASE_EDGE_BASE not configured; bybit proxy routes will fail until set.');
}

async function proxyToEdge(req: Request, res: Response, action: string) {
  try {
    if (!SUPABASE_EDGE_BASE) return res.status(500).json({ error: 'Edge functions base URL not configured' });

    const url = new URL(`${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/bybit/${action}`);
    // forward query params
    Object.entries(req.query || {}).forEach(([k,v]) => url.searchParams.set(k, String(v)));

    const init: any = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (req.method !== 'GET') {
      init.body = JSON.stringify(req.body || {});
    }

    const r = await fetch(url.toString(), init as any);
    const text = await r.text();
    try {
      const json = JSON.parse(text);
      res.status(r.status).json(json);
    } catch (e) {
      res.status(r.status).send(text);
    }
  } catch (error) {
    logger.error('Error proxying to Bybit edge function:', error);
    res.status(500).json({ error: 'Failed to proxy to Bybit edge function' });
  }
}

router.get('/balances', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'balances'));
router.get('/positions', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'positions'));
router.get('/orders', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'orders'));
router.post('/place-order', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'place-order'));
router.get('/order-history', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'order-history'));
router.post('/transfer', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'transfer'));
router.post('/convert', authenticateAdmin, async (req, res) => proxyToEdge(req, res, 'convert'));

export default router;
