import fetch from 'node-fetch';
import { db } from '../server/enhanced-index.js';
import { crypto_wallets } from '../shared/crypto-schema.js';
import { sum } from 'drizzle-orm';
import { logger } from '../server/utils/logger.js';

const SUPABASE_EDGE_BASE = process.env.SUPABASE_EDGE_BASE || process.env.SUPABASE_FUNCTIONS_URL || '';
const RECONCILE_INTERVAL = parseInt(process.env.RECONCILE_INTERVAL_SECONDS || '300', 10) * 1000; // default 5m

export default function startReconciliation() {
  if (!SUPABASE_EDGE_BASE) {
    logger.warn('Reconciliation disabled: SUPABASE_EDGE_BASE not set');
    return;
  }

  const run = async () => {
    try {
      logger.info('Reconciliation job started');
      // Fetch platform-bybit balances via edge function
      const url = `${SUPABASE_EDGE_BASE.replace(/\/+$/, '')}/bybit/balances`;
      const r = await fetch(url, { method: 'GET' });
      if (!r.ok) {
        logger.warn('Failed to fetch Bybit balances for reconciliation', { status: r.status });
        return;
      }
      const data = await r.json();
      // data may have balances per currency; attempt to sum DB balances for comparison
      const currencies = Object.keys(data?.result?.list?.reduce ? data.result.list.reduce((acc, it) => { acc[it.coin] = true; return acc; }, {}) : (data || {}));

      // Simpler: query aggregated DB totals for all currencies
      const rows = await db.select({ total: sum(crypto_wallets.balance), currency: crypto_wallets.currency }).from(crypto_wallets).execute();
      const dbTotals = {};
      for (const rrow of rows) {
        dbTotals[rrow.currency] = parseFloat(rrow.total?.toString() || '0');
      }

      // Compare with Bybit data
      const discrepancies = [];
      if (data && data.result && data.result.list) {
        for (const item of data.result.list) {
          const coin = item.coin || item.currency || item.ccy || item.symbol;
          const byAmount = parseFloat(item.available || item.balance || item.total || item.available_balance || 0);
          const dbAmount = dbTotals[coin] || 0;
          const diff = byAmount - dbAmount;
          if (Math.abs(diff) > 0.0001) {
            discrepancies.push({ coin, bybit: byAmount, db: dbAmount, diff });
          }
        }
      }

      if (discrepancies.length) {
        logger.warn('Reconciliation discrepancies found', { discrepancies });
      } else {
        logger.info('Reconciliation OK - no significant discrepancies');
      }
    } catch (err) {
      logger.error('Reconciliation job error', { err: err?.message || err });
    }
  };

  // Initial run and schedule
  run();
  setInterval(run, RECONCILE_INTERVAL);
}
