import { logger } from '../utils/logger.js';
import { db } from '../enhanced-index.js';
import { crypto_wallets, crypto_transactions } from '../../shared/crypto-schema.js';
import { eq } from 'drizzle-orm';

// Perform atomic update: adjust crypto_wallets balance and insert crypto_transactions entry
export async function adjustWalletBalanceAtomic(userId, currency, delta, opts = {}) {
  try {
    const applyTx = typeof db.transaction === 'function';

    const worker = async (txDb) => {
      // Find or create wallet row
      const rows = await txDb
        .select({ id: crypto_wallets.id, balance: crypto_wallets.balance })
        .from(crypto_wallets)
        .where(eq(crypto_wallets.user_id, userId))
        .where(eq(crypto_wallets.currency, currency))
        .execute();

      let walletId;
      let current = 0;
      if (rows && rows.length) {
        walletId = rows[0].id;
        current = parseFloat(rows[0].balance?.toString() || '0');
        const next = current + delta;
        await txDb.update(crypto_wallets)
          .set({ balance: next.toString(), updated_at: new Date() })
          .where(eq(crypto_wallets.id, walletId))
          .execute();
      } else {
        // insert new wallet row
        walletId = `wallet-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        const init = (delta || 0).toString();
        await txDb.insert(crypto_wallets).values({
          id: walletId,
          user_id: userId,
          wallet_address: '',
          wallet_provider: 'platform',
          chain_type: 'multi',
          balance: init,
          currency,
          is_primary: false,
          is_connected: true,
          created_at: new Date(),
          updated_at: new Date()
        }).execute();
      }

      // Insert transaction record for audit
      const txId = `tx-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      try {
        await txDb.insert(crypto_transactions).values({
          id: txId,
          user_id: userId,
          wallet_id: walletId,
          transaction_hash: opts.txHash || null,
          from_address: opts.from || null,
          to_address: opts.to || null,
          amount: Math.abs(delta),
          currency,
          transaction_fee: opts.fee || 0,
          status: opts.status || 'completed',
          transaction_type: opts.type || (delta >=0 ? 'credit' : 'debit'),
          timestamp: new Date(),
          confirmations: opts.confirmations || 0,
          metadata: opts.metadata || {},
          created_at: new Date(),
          updated_at: new Date()
        }).execute();
      } catch (e) {
        logger.warn('Failed to insert crypto_transactions within atomic op:', e);
        throw e;
      }

      return { walletId, txId };
    };

    if (applyTx) {
      return await db.transaction(async (tx) => await worker(tx));
    }

    // Fallback: run sequentially
    return await worker(db);
  } catch (error) {
    logger.error('adjustWalletBalanceAtomic error:', error);
    throw error;
  }
}
