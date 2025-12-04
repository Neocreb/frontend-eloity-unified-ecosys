import { logger } from '../utils/logger.js';
import { db } from '../utils/db.js';
import { crypto_exchange_rates, crypto_balances_cache, crypto_wallet_addresses } from '../../shared/crypto-schema.js';
import axios from 'axios';

const CRYPTOAPIS_BASE_URL = 'https://rest.cryptoapis.io';
const API_KEY = process.env.CRYPTOAPIS_API_KEY;

interface ExchangeRatePair {
  base: string;
  quote: string;
}

export async function syncExchangeRates(pairs: ExchangeRatePair[] = []) {
  if (!API_KEY) {
    logger.warn('CRYPTOAPIS_API_KEY not set, skipping exchange rate sync');
    return;
  }

  const defaultPairs: ExchangeRatePair[] = [
    { base: 'BTC', quote: 'USD' },
    { base: 'ETH', quote: 'USD' },
    { base: 'SOL', quote: 'USD' },
    { base: 'ADA', quote: 'USD' },
    { base: 'LINK', quote: 'USD' },
    { base: 'MATIC', quote: 'USD' },
    { base: 'XRP', quote: 'USD' },
    { base: 'DOT', quote: 'USD' },
  ];

  const pairsToSync = pairs.length > 0 ? pairs : defaultPairs;

  for (const { base, quote } of pairsToSync) {
    try {
      const response = await axios.get(
        `${CRYPTOAPIS_BASE_URL}/market-data/exchange-rates/realtime/${base}/${quote}`,
        {
          timeout: 10000,
          headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      const rate = response.data?.data?.rate;
      if (rate) {
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes TTL
        const timestamp = new Date();

        await db
          .insert(crypto_exchange_rates)
          .values({
            base_asset: base,
            quote_asset: quote,
            rate: parseFloat(rate),
            source: 'cryptoapis',
            expires_at: expiresAt,
            timestamp,
          })
          .onConflictDoUpdate({
            target: [crypto_exchange_rates.base_asset, crypto_exchange_rates.quote_asset],
            set: {
              rate: parseFloat(rate),
              timestamp,
              expires_at: expiresAt,
              updated_at: new Date(),
            },
          });

        logger.info(`Synced exchange rate ${base}/${quote}: $${rate}`);
      }
    } catch (error) {
      logger.error(`Failed to sync exchange rate ${base}/${quote}:`, error instanceof Error ? error.message : error);
    }
  }
}

export async function syncWalletBalances() {
  if (!API_KEY) {
    logger.warn('CRYPTOAPIS_API_KEY not set, skipping balance sync');
    return;
  }

  try {
    // Get all tracked wallet addresses
    const addresses: any[] = await db.select().from(crypto_wallet_addresses).execute();

    for (const walletAddr of addresses) {
      try {
        const response = await axios.get(
          `${CRYPTOAPIS_BASE_URL}/blockchain-data/${walletAddr.blockchain}/${walletAddr.network}/addresses/${walletAddr.address}`,
          {
            timeout: 10000,
            headers: {
              'X-API-Key': API_KEY,
              'Content-Type': 'application/json',
            },
          }
        );

        const addressData = response.data?.data;
        if (addressData) {
          // Update wallet address balance
          const balanceUsd = addressData.totalReceivedAmount
            ? parseFloat(addressData.totalReceivedAmount) * (parseFloat(addressData.balanceAmount) || 1)
            : 0;

          await db
            .update(crypto_wallet_addresses)
            .set({
              balance: parseFloat(addressData.balanceAmount || '0'),
              balance_usd: balanceUsd,
              last_synced_at: new Date(),
              updated_at: new Date(),
            })
            .where({ id: walletAddr.id });

          logger.info(`Updated balance for address ${walletAddr.address}`);
        }
      } catch (error) {
        logger.error(
          `Failed to sync balance for address ${walletAddr.address}:`,
          error instanceof Error ? error.message : error
        );
      }
    }
  } catch (error) {
    logger.error('Failed to sync wallet balances:', error instanceof Error ? error.message : error);
  }
}

export async function cleanupExpiredRates() {
  try {
    // Delete expired exchange rates
    const result = await db
      .delete(crypto_exchange_rates)
      .where({ expires_at: { lt: new Date() } });

    logger.info('Cleaned up expired exchange rates');
  } catch (error) {
    logger.error('Failed to cleanup expired rates:', error instanceof Error ? error.message : error);
  }
}

export default function startCryptoDataSync(intervalMs: number = 5 * 60 * 1000) {
  if (!API_KEY) {
    logger.warn('CRYPTOAPIS_API_KEY not configured, crypto data sync disabled');
    return () => {};
  }

  logger.info('Starting CryptoAPIs data sync service...');

  // Run sync immediately on startup
  (async () => {
    try {
      logger.info('Running initial CryptoAPIs sync...');
      await syncExchangeRates();
      await cleanupExpiredRates();
    } catch (error) {
      logger.error('Initial sync failed:', error instanceof Error ? error.message : error);
    }
  })();

  // Schedule recurring sync
  const syncInterval = setInterval(async () => {
    try {
      logger.info('Running scheduled CryptoAPIs sync...');
      await syncExchangeRates();
      await cleanupExpiredRates();

      // Sync balances every 15 minutes (every 3rd sync cycle)
      const now = Date.now();
      if (now % (intervalMs * 3) < intervalMs) {
        await syncWalletBalances();
      }
    } catch (error) {
      logger.error('Scheduled sync failed:', error instanceof Error ? error.message : error);
    }
  }, intervalMs);

  logger.info(`CryptoAPIs data sync started (interval: ${intervalMs}ms)`);

  // Return cleanup function
  return () => clearInterval(syncInterval);
}
