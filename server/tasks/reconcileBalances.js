import fetch from 'node-fetch';
import { db } from '../enhanced-index.js';
import { crypto_wallets } from '../../shared/crypto-schema.js';
import { sum } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

const SUPABASE_EDGE_BASE = process.env.SUPABASE_EDGE_BASE || process.env.SUPABASE_FUNCTIONS_URL || '';
const RECONCILE_INTERVAL = parseInt(process.env.RECONCILE_INTERVAL_SECONDS || '300', 10) * 1000; // default 5m

export default function startReconciliation() {
  const run = async () => {
    try {
      logger.info('Reconciliation job started - comparing database totals');

      // Query aggregated DB totals for all currencies
      const rows = await db.select({ total: sum(crypto_wallets.balance), currency: crypto_wallets.currency }).from(crypto_wallets).execute();
      const dbTotals = {};
      for (const rrow of rows) {
        dbTotals[rrow.currency] = parseFloat(rrow.total?.toString() || '0');
      }

      if (Object.keys(dbTotals).length > 0) {
        logger.info('Database wallet totals', { dbTotals });
      } else {
        logger.info('No wallet data found in database for reconciliation');
      }
    } catch (err) {
      logger.error('Reconciliation job error', { err: err?.message || err });
    }
  };

  // Initial run and schedule
  run();
  setInterval(run, RECONCILE_INTERVAL);
}
