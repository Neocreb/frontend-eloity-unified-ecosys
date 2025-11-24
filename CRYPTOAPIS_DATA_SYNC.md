# Real Data Synchronization Guide for CryptoAPIs

## Overview

After running the database migration, you'll need to populate it with real data from CryptoAPIs. This guide provides methods to sync blockchain data efficiently.

## Prerequisites

✅ Database migration completed (`migrations/001_cryptoapis_integration.sql`)  
✅ `CRYPTOAPIS_API_KEY` configured in environment  
✅ CryptoAPIs account with active API key  

## Data Sync Strategies

### Strategy 1: Fetch Price Data (Recommended First Step)

#### Update crypto_prices Table

```sql
-- Update prices for all major cryptocurrencies
-- This should be done every 5-60 minutes depending on your needs

UPDATE crypto_prices 
SET 
  price_usd = 42500.00,
  last_updated = NOW(),
  updated_at = NOW()
WHERE symbol = 'BTC';

UPDATE crypto_prices 
SET 
  price_usd = 2260.00,
  last_updated = NOW(),
  updated_at = NOW()
WHERE symbol = 'ETH';
```

#### Using Your Backend API

```bash
# Call your existing price endpoint
curl -X GET 'http://localhost:5002/api/crypto/prices?symbols=bitcoin,ethereum,solana' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# This uses your backend service which calls CoinGecko/CryptoAPIs
# The service already handles the API calls, you just need to store results
```

### Strategy 2: Sync User Wallet Addresses

#### Add Wallet Addresses for Users

```sql
-- Insert a wallet address for a user
INSERT INTO crypto_wallet_addresses 
(user_id, blockchain, network, address, label)
VALUES 
(
  'user-uuid-here',
  'ethereum',
  'mainnet',
  '0x1234567890123456789012345678901234567890',
  'My Ethereum Wallet'
)
ON CONFLICT (user_id, blockchain, network, address) 
DO UPDATE SET 
  label = EXCLUDED.label,
  updated_at = NOW();
```

#### Get Balance Data from CryptoAPIs

```bash
# Call your CryptoAPIs endpoint
curl -X GET \
  'http://localhost:5002/api/cryptoapis/address/latest/ethereum/mainnet/0x1234567890123456789012345678901234567890' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Response contains balance and transaction data
```

### Strategy 3: Sync Exchange Rates (Cache)

#### Populate Exchange Rates Table

```sql
-- Insert or update exchange rates
INSERT INTO crypto_exchange_rates 
(base_asset, quote_asset, rate, source, expires_at, timestamp)
VALUES 
('BTC', 'USD', 42500.00, 'cryptoapis', NOW() + INTERVAL '5 minutes', NOW()),
('ETH', 'USD', 2260.00, 'cryptoapis', NOW() + INTERVAL '5 minutes', NOW()),
('BTC', 'ETH', 18.83, 'cryptoapis', NOW() + INTERVAL '5 minutes', NOW())
ON CONFLICT (base_asset, quote_asset, blockchain, network) 
DO UPDATE SET 
  rate = EXCLUDED.rate,
  timestamp = NOW(),
  expires_at = NOW() + INTERVAL '5 minutes';
```

#### Automated Sync via Backend Job

```typescript
// In server/tasks/ - Create a price sync job

import { db } from '../utils/db.js';
import { crypto_exchange_rates } from '../../shared/crypto-schema.js';
import axios from 'axios';

export async function syncExchangeRates() {
  try {
    const pairs = [
      { base: 'BTC', quote: 'USD' },
      { base: 'ETH', quote: 'USD' },
      { base: 'SOL', quote: 'USD' },
      // Add more pairs
    ];

    const cryptoapisKey = process.env.CRYPTOAPIS_API_KEY;

    for (const { base, quote } of pairs) {
      try {
        const response = await axios.get(
          `https://rest.cryptoapis.io/v2/market-data/exchange-rates/realtime/${base}/${quote}`,
          {
            headers: { 'X-API-Key': cryptoapisKey }
          }
        );

        const rate = response.data.data.rate;

        await db.insert(crypto_exchange_rates).values({
          base_asset: base,
          quote_asset: quote,
          rate: parseFloat(rate),
          source: 'cryptoapis',
          expires_at: new Date(Date.now() + 5 * 60 * 1000),
          timestamp: new Date()
        }).onConflictDoUpdate({
          target: [crypto_exchange_rates.base_asset, crypto_exchange_rates.quote_asset],
          set: {
            rate: parseFloat(rate),
            timestamp: new Date(),
            expires_at: new Date(Date.now() + 5 * 60 * 1000)
          }
        });
      } catch (error) {
        console.error(`Error fetching rate for ${base}/${quote}:`, error);
      }
    }
  } catch (error) {
    console.error('Exchange rate sync failed:', error);
  }
}

// Schedule this to run every 5 minutes
setInterval(syncExchangeRates, 5 * 60 * 1000);
```

### Strategy 4: Sync Blockchain Transactions

#### Fetch and Store Transactions

```bash
# Get transaction history for a user's address
curl -X GET \
  'http://localhost:5002/api/cryptoapis/address/history/ethereum/mainnet/0xADDRESS' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# This returns transaction history that can be stored
```

#### Insert Transactions into Database

```typescript
// Backend handler to store transactions

import { crypto_transactions } from '../../shared/crypto-schema.js';
import { db } from '../utils/db.js';

async function storeTransactions(userId: string, address: string, transactions: any[]) {
  for (const tx of transactions) {
    await db.insert(crypto_transactions).values({
      user_id: userId,
      wallet_id: walletId,
      transaction_hash: tx.transactionId,
      blockchain: 'ethereum',
      network: 'mainnet',
      from_address: tx.sender,
      to_address: tx.recipient,
      amount: tx.amount,
      currency: tx.unit,
      transaction_type: tx.direction === 'incoming' ? 'receive' : 'send',
      status: tx.confirmations > 0 ? 'confirmed' : 'pending',
      timestamp: new Date(tx.timestamp),
      confirmations: tx.confirmations,
      block_number: tx.blockNumber,
      transaction_fee: tx.fee
    }).onConflictDoNothing();
  }
}
```

### Strategy 5: Update Balance Cache

#### Sync Cached Balances

```sql
-- Clear old cache entries
DELETE FROM crypto_balances_cache 
WHERE cache_expires_at < NOW();

-- Insert new balance data from CryptoAPIs
INSERT INTO crypto_balances_cache 
(user_id, wallet_id, address, blockchain, network, asset_symbol, balance, balance_usd, cache_expires_at)
VALUES 
(
  'user-uuid',
  'wallet-uuid',
  '0xADDRESS',
  'ethereum',
  'mainnet',
  'ETH',
  2.5,
  5650.00,
  NOW() + INTERVAL '5 minutes'
)
ON CONFLICT (user_id, address, blockchain, network, asset_symbol)
DO UPDATE SET 
  balance = EXCLUDED.balance,
  balance_usd = EXCLUDED.balance_usd,
  cache_expires_at = EXCLUDED.cache_expires_at,
  last_synced_at = NOW();
```

## Scheduled Sync Jobs

### Option 1: Use Supabase Edge Functions

Create a scheduled edge function:

```typescript
// supabase/functions/sync-crypto-prices/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const cryptoapisKey = Deno.env.get("CRYPTOAPIS_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const symbols = ["BTC", "ETH", "SOL", "ADA", "LINK"];

    for (const symbol of symbols) {
      const response = await fetch(
        `https://rest.cryptoapis.io/v2/market-data/exchange-rates/realtime/${symbol}/USD`,
        {
          headers: { "X-API-Key": cryptoapisKey }
        }
      );

      const data = await response.json();
      const rate = data.data?.rate;

      if (rate) {
        await supabase
          .from("crypto_exchange_rates")
          .upsert({
            base_asset: symbol,
            quote_asset: "USD",
            rate: parseFloat(rate),
            source: "cryptoapis",
            timestamp: new Date().toISOString(),
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
          });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

Deploy:
```bash
supabase functions deploy sync-crypto-prices
```

### Option 2: Use Node.js Backend Jobs

```typescript
// server/tasks/syncCryptoData.ts

import { logger } from '../utils/logger.js';
import { db } from '../utils/db.js';
import { crypto_exchange_rates } from '../../shared/crypto-schema.js';
import axios from 'axios';

export async function startCryptoDataSync() {
  const syncInterval = 5 * 60 * 1000; // 5 minutes
  const cryptoapisKey = process.env.CRYPTOAPIS_API_KEY;

  if (!cryptoapisKey) {
    logger.warn('CRYPTOAPIS_API_KEY not set, skipping crypto data sync');
    return;
  }

  setInterval(async () => {
    try {
      logger.info('Starting crypto data sync...');

      const pairs = [
        ['BTC', 'USD'],
        ['ETH', 'USD'],
        ['SOL', 'USD'],
        ['ADA', 'USD'],
        ['LINK', 'USD'],
        ['MATIC', 'USD'],
      ];

      for (const [base, quote] of pairs) {
        try {
          const response = await axios.get(
            `https://rest.cryptoapis.io/v2/market-data/exchange-rates/realtime/${base}/${quote}`,
            {
              timeout: 10000,
              headers: { 'X-API-Key': cryptoapisKey }
            }
          );

          const rate = response.data?.data?.rate;
          if (rate) {
            await db.insert(crypto_exchange_rates).values({
              base_asset: base,
              quote_asset: quote,
              rate: parseFloat(rate),
              source: 'cryptoapis',
              expires_at: new Date(Date.now() + syncInterval),
              timestamp: new Date()
            });
          }
        } catch (error) {
          logger.error(`Failed to sync ${base}/${quote}:`, error);
        }
      }

      logger.info('Crypto data sync completed');
    } catch (error) {
      logger.error('Crypto data sync error:', error);
    }
  }, syncInterval);
}
```

Add to `server/enhanced-index.ts`:
```typescript
import { startCryptoDataSync } from './tasks/syncCryptoData.js';

// Initialize after database connection
startCryptoDataSync();
```

## Manual Data Import

### Import CSV Data

```sql
-- If you have exported transaction data from CryptoAPIs
COPY crypto_transactions (
  user_id, wallet_id, transaction_hash, from_address, to_address, 
  amount, currency, status, transaction_type, timestamp
)
FROM '/tmp/transactions.csv' WITH (FORMAT csv, HEADER true);
```

## Monitoring Data Sync

### Check Cached Data Freshness

```sql
-- See how recent your cache is
SELECT 
  base_asset, 
  quote_asset,
  rate,
  NOW() - timestamp AS age,
  CASE WHEN expires_at < NOW() THEN 'EXPIRED' ELSE 'VALID' END as status
FROM crypto_exchange_rates
ORDER BY timestamp DESC;
```

### Monitor Transaction Count

```sql
-- Count transactions by user
SELECT 
  user_id,
  COUNT(*) as transaction_count,
  MAX(timestamp) as latest_transaction,
  SUM(amount) as total_volume
FROM crypto_transactions
GROUP BY user_id;
```

### Check Balance Cache Coverage

```sql
-- See which users have cached balance data
SELECT 
  user_id,
  address,
  blockchain,
  asset_symbol,
  balance,
  cache_expires_at,
  CASE WHEN cache_expires_at < NOW() THEN 'EXPIRED' ELSE 'VALID' END as status
FROM crypto_balances_cache
ORDER BY user_id, cache_expires_at DESC;
```

## Performance Optimization

### Archiving Old Transactions

```sql
-- Archive transactions older than 90 days to a separate table
CREATE TABLE crypto_transactions_archive AS
SELECT * FROM crypto_transactions
WHERE timestamp < NOW() - INTERVAL '90 days';

DELETE FROM crypto_transactions
WHERE timestamp < NOW() - INTERVAL '90 days';
```

### Vacuum and Analyze

```sql
-- Optimize table performance
VACUUM ANALYZE crypto_transactions;
VACUUM ANALYZE crypto_exchange_rates;
VACUUM ANALYZE crypto_balances_cache;
```

## Troubleshooting

### Data Not Syncing

Check:
1. ✅ `CRYPTOAPIS_API_KEY` is set and valid
2. ✅ Network connectivity to `https://rest.cryptoapis.io`
3. ✅ API rate limits not exceeded
4. ✅ Database permissions allow inserts

### Cache Expiring Too Fast

Adjust TTL:
```sql
-- Increase cache duration to 10 minutes
UPDATE crypto_exchange_rates 
SET expires_at = NOW() + INTERVAL '10 minutes'
WHERE expires_at < NOW() + INTERVAL '15 minutes';
```

### Performance Issues

Check indexes:
```sql
-- Verify indexes exist
SELECT * FROM pg_indexes 
WHERE tablename LIKE 'crypto_%'
ORDER BY tablename;
```

## Next Steps

1. ✅ Run database migration
2. ✅ Set up scheduled sync jobs
3. ⏳ Monitor sync completion
4. ⏳ Populate historical data
5. ⏳ Set up webhooks for real-time updates
6. ⏳ Create dashboard to view synced data

---

**Status**: Ready to implement  
**Last Updated**: 2024-12-19
