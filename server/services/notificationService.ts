import fetch from 'node-fetch';
import { logger } from '../utils/logger.js';

const SUPABASE_EDGE_BASE = process.env.SUPABASE_EDGE_BASE || process.env.SUPABASE_FUNCTIONS_URL || '';

export async function sendNotification(payload: { channel: 'sms'|'email', to: string | string[], subject?: string, text?: string, html?: string, from?: string }) {
  try {
    if (!SUPABASE_EDGE_BASE) throw new Error('Edge functions base URL not configured');

    const url = `${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/notify`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();
    try {
      return { ok: resp.ok, status: resp.status, data: JSON.parse(text) };
    } catch (e) {
      return { ok: resp.ok, status: resp.status, data: text };
    }
  } catch (error) {
    logger.error('Failed to send notification via edge function:', error);
    return { ok: false, error: error.message };
  }
}
