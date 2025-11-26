# CryptoAPIs Database Schema Setup Guide

## Overview

This guide explains how to set up the database schema required for CryptoAPIs integration. The migration script creates all necessary tables, indexes, and security policies to store real blockchain data.

## Files

- **Migration Script**: `migrations/001_cryptoapis_integration.sql`
- **Drizzle Schema**: `shared/crypto-schema.ts`

## What Gets Created

### 1. Core Crypto Tables

#### `crypto_profiles` - User Crypto Preferences
Stores user-specific crypto settings and KYC verification status.

```
Fields: kyc_status, wallet_address, trading_volume, trading_pairs, risk_tolerance
Purpose: Track user crypto preferences and compliance
```

#### `crypto_wallets` - User Wallets
Tracks wallet connections and balances per blockchain.

```
Fields: wallet_address, chain_type, balance, last_synced_at
Purpose: Link users to their blockchain addresses
```

#### `crypto_wallet_addresses` - Multiple Addresses
Allows users to have multiple addresses on different blockchains.

```
Fields: blockchain, network, address, address_type, balance
Purpose: Support multiple addresses per user
```

### 2. Transaction & Trading Tables

#### `crypto_transactions` - Blockchain Transactions
Records all on-chain transactions for user addresses.

```
Fields: transaction_hash, from_address, to_address, amount, status, confirmations
Purpose: Store transaction history from CryptoAPIs
```

#### `crypto_trades` - Trading History
Records all trading activities on the platform.

```
Fields: pair, side, price, amount, fee, order_type, status
Purpose: Track trades and calculate statistics
```

### 3. CryptoAPIs-Specific Tables

#### `crypto_exchange_rates` - Cached Exchange Rates
Caches exchange rate data from CryptoAPIs to reduce API calls.

```
Fields: base_asset, quote_asset, rate, expires_at
Purpose: Fast lookups of exchange rates with TTL
```

#### `crypto_balances_cache` - Cached Balances
Stores balance snapshots from CryptoAPIs with expiration.

```
Fields: address, blockchain, asset_symbol, balance, cache_expires_at
Purpose: Reduce API calls by caching balance data
```

#### `crypto_webhooks` - Webhook Registrations
Tracks CryptoAPIs webhooks for real-time notifications.

```
Fields: webhook_type, blockchain, network, cryptoapis_webhook_id
Purpose: Manage real-time transaction notifications
```

### 4. Market & History Tables

#### `crypto_prices` - Price Cache
Stores cryptocurrency prices from CoinGecko.

```
Fields: symbol, price_usd, market_cap, volume_24h
Purpose: Fast price lookups and historical data
```

#### `crypto_portfolio_history` - Portfolio Snapshots
Records portfolio value over time.

```
Fields: user_id, total_value_usd, asset_breakdown
Purpose: Track portfolio growth and performance
```

#### `crypto_fees_cache` - Fee Estimates
Caches transaction fee estimates.

```
Fields: blockchain, network, fee_type, gas_price
Purpose: Store and reuse fee estimates
```

#### `crypto_market_data` - Broader Market Data
Stores general market metrics.

```
Fields: blockchain, metric_name, metric_value
Purpose: Store blockchain-wide statistics
```

## How to Run the Migration

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy the Migration Script

1. Open `migrations/001_cryptoapis_integration.sql`
2. Copy the entire content

### Step 3: Paste into Supabase

1. Paste the SQL code into the Supabase SQL editor
2. Review the script to ensure it looks correct
3. Click **Run** or press `Ctrl+Enter`

### Step 4: Verify Success

After running, you should see:
- ✅ 8 new tables created
- ✅ 20+ indexes created
- ✅ RLS policies enabled
- ✅ Sample cryptocurrency data inserted

You can verify by:
1. Going to **Table Editor**
2. Checking that all `crypto_*` tables appear in the left sidebar

## Security Features

### Row Level Security (RLS)

All crypto tables have RLS enabled with policies:
- Users can **only see their own data**
- Users cannot access other users' transactions or addresses
- All policies use `auth.uid()` for authentication

### Foreign Keys

All relationships are enforced:
- Wallets linked to users
- Transactions linked to wallets and users
- Balances linked to wallets and addresses
- Webhooks linked to users

### Unique Constraints

Prevents duplicate data:
- One primary wallet per user per chain
- One address per blockchain per user
- One price per cryptocurrency symbol

## Indexes for Performance

Critical indexes created:

```
User-based lookups:
- idx_crypto_wallets_user_id
- idx_crypto_transactions_user_id
- idx_crypto_trades_user_id

Address lookups:
- idx_crypto_wallet_addresses_address
- idx_crypto_transactions_hash

Status filtering:
- idx_crypto_transactions_status
- idx_crypto_trades_status

Cache expiration:
- idx_crypto_exchange_rates_expires
- idx_crypto_fees_cache_expires
```

## Sample Data Loaded

The migration automatically inserts 11 major cryptocurrencies:

| Symbol | Name | Price |
|--------|------|-------|
| BTC | Bitcoin | $42,500 |
| ETH | Ethereum | $2,260 |
| USDT | Tether | $1.00 |
| BNB | Binance Coin | $615 |
| SOL | Solana | $145 |
| ADA | Cardano | $0.95 |
| LINK | Chainlink | $28.50 |
| MATIC | Polygon | $0.85 |
| AVAX | Avalanche | $38.20 |
| DOT | Polkadot | $7.40 |
| DOGE | Dogecoin | $0.38 |

You can update these prices later with real data from CoinGecko/CryptoAPIs.

## After Migration

### Update Initial Prices

Use your CryptoAPIs endpoint to update prices:

```bash
curl -X GET 'http://localhost:5002/api/crypto/prices?symbols=bitcoin,ethereum' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

Then update the `crypto_prices` table with real data.

### Test Wallet Creation

Create a test wallet:

```sql
INSERT INTO crypto_wallets (user_id, wallet_address, wallet_provider, chain_type)
VALUES ('user-uuid-here', '0x1234...', 'metamask', 'ethereum');
```

### Verify RLS Policies

Test that RLS works:

```sql
-- As authenticated user, should only see own wallets
SELECT * FROM crypto_wallets WHERE user_id = auth.uid();
```

## Troubleshooting

### Migration Fails with "Table already exists"

**Solution**: This is normal if you've run it before. The script has `IF NOT EXISTS` checks to prevent errors.

### RLS Policies Error

**Ensure**:
1. You're running the migration as a Supabase admin
2. The `auth` schema is available in your project
3. You have JWT enabled in Supabase settings

### Indexes Not Created

**Check**:
```sql
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename LIKE 'crypto_%';
```

### Need to Reset?

To drop all crypto tables (WARNING - deletes all data):

```sql
DROP TABLE IF EXISTS public.crypto_market_data CASCADE;
DROP TABLE IF EXISTS public.crypto_fees_cache CASCADE;
DROP TABLE IF EXISTS public.crypto_portfolio_history CASCADE;
DROP TABLE IF EXISTS public.crypto_webhooks CASCADE;
DROP TABLE IF EXISTS public.crypto_balances_cache CASCADE;
DROP TABLE IF EXISTS public.crypto_exchange_rates CASCADE;
DROP TABLE IF EXISTS public.crypto_prices CASCADE;
DROP TABLE IF EXISTS public.crypto_trades CASCADE;
DROP TABLE IF EXISTS public.crypto_transactions CASCADE;
DROP TABLE IF EXISTS public.crypto_wallet_addresses CASCADE;
DROP TABLE IF EXISTS public.crypto_wallets CASCADE;
DROP TABLE IF EXISTS public.crypto_profiles CASCADE;
```

Then re-run the migration.

## Using the Schema in Code

The Drizzle ORM schema is defined in `shared/crypto-schema.ts`. The migration creates the actual tables in Supabase.

### Example: Insert Wallet Address

```typescript
import { crypto_wallet_addresses } from '@/shared/crypto-schema';
import { db } from '@/server/utils/db';

await db.insert(crypto_wallet_addresses).values({
  user_id: userId,
  blockchain: 'ethereum',
  network: 'mainnet',
  address: '0x1234...',
  label: 'My ETH Wallet'
});
```

### Example: Query Transactions

```typescript
import { crypto_transactions } from '@/shared/crypto-schema';

const transactions = await db
  .select()
  .from(crypto_transactions)
  .where(eq(crypto_transactions.user_id, userId));
```

## Next Steps

1. ✅ **Run the migration** - Set up the database schema
2. ✅ **Verify tables exist** - Check Supabase table editor
3. ⏳ **Update sample prices** - Replace with real CoinGecko/CryptoAPIs data
4. ⏳ **Test wallet creation** - Add a test address
5. ⏳ **Set up webhooks** - Configure CryptoAPIs webhooks for real-time updates
6. ⏳ **Monitor cache expiration** - Set up jobs to refresh cache

## Support

- **Supabase Docs**: https://supabase.com/docs
- **CryptoAPIs Docs**: https://cryptoapis.io/docs
- **Drizzle ORM Docs**: https://orm.drizzle.team/docs/

---

**Migration Version**: 001  
**Created**: 2024-12-19  
**Status**: Ready to Deploy
