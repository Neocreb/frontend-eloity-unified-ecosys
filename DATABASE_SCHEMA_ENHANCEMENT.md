# Database Schema Enhancement Plan

This document outlines the necessary database schema enhancements to support production-ready cryptocurrency trading functionality.

## 1. Current Schema Review

The current schema includes:
- `crypto_profiles` - User cryptocurrency profiles
- `crypto_wallets` - User cryptocurrency wallets
- `crypto_transactions` - Cryptocurrency transactions
- `crypto_trades` - Cryptocurrency trades
- `crypto_prices` - Cryptocurrency prices

## 2. Missing Tables

### 2.1 P2P Orders Table

Create a new table to store P2P trading orders:

```sql
CREATE TABLE p2p_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL, -- 'buy' or 'sell'
  cryptocurrency TEXT NOT NULL,
  fiat_currency TEXT NOT NULL,
  amount NUMERIC(20, 8) NOT NULL,
  price NUMERIC(15, 8) NOT NULL,
  min_order_amount NUMERIC(20, 8),
  max_order_amount NUMERIC(20, 8),
  payment_methods JSONB,
  time_limit INTEGER, -- minutes
  auto_reply TEXT,
  terms TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  completed_trades INTEGER DEFAULT 0,
  reputation NUMERIC(3, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_p2p_orders_user_id ON p2p_orders(user_id);
CREATE INDEX idx_p2p_orders_type ON p2p_orders(type);
CREATE INDEX idx_p2p_orders_cryptocurrency ON p2p_orders(cryptocurrency);
CREATE INDEX idx_p2p_orders_fiat_currency ON p2p_orders(fiat_currency);
CREATE INDEX idx_p2p_orders_status ON p2p_orders(status);
CREATE INDEX idx_p2p_orders_created_at ON p2p_orders(created_at);
```

### 2.2 P2P Trades Table

Create a new table to store P2P trades:

```sql
CREATE TABLE p2p_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES p2p_orders(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(20, 8) NOT NULL,
  price NUMERIC(15, 8) NOT NULL,
  cryptocurrency TEXT NOT NULL,
  fiat_currency TEXT NOT NULL,
  fiat_amount NUMERIC(15, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled', 'disputed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_p2p_trades_order_id ON p2p_trades(order_id);
CREATE INDEX idx_p2p_trades_buyer_id ON p2p_trades(buyer_id);
CREATE INDEX idx_p2p_trades_seller_id ON p2p_trades(seller_id);
CREATE INDEX idx_p2p_trades_status ON p2p_trades(status);
CREATE INDEX idx_p2p_trades_created_at ON p2p_trades(created_at);
```

### 2.3 Escrow Transactions Table

Create a new table to store escrow transactions:

```sql
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES p2p_trades(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  cryptocurrency TEXT NOT NULL,
  amount NUMERIC(20, 8) NOT NULL,
  fiat_amount NUMERIC(15, 2) NOT NULL,
  fiat_currency TEXT NOT NULL,
  time_limit INTEGER, -- minutes
  status TEXT DEFAULT 'pending_payment', -- 'pending_payment', 'payment_confirmed', 'completed', 'disputed', 'refunded'
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  completed_at TIMESTAMP,
  transaction_hash TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_escrow_transactions_trade_id ON escrow_transactions(trade_id);
CREATE INDEX idx_escrow_transactions_buyer_id ON escrow_transactions(buyer_id);
CREATE INDEX idx_escrow_transactions_seller_id ON escrow_transactions(seller_id);
CREATE INDEX idx_escrow_transactions_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_transactions_created_at ON escrow_transactions(created_at);
```

### 2.4 Disputes Table

Create a new table to store disputes:

```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES escrow_transactions(id),
  raised_by UUID NOT NULL REFERENCES users(id),
  against_user_id UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB,
  priority TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
  status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'rejected'
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_disputes_escrow_id ON disputes(escrow_id);
CREATE INDEX idx_disputes_raised_by ON disputes(raised_by);
CREATE INDEX idx_disputes_against_user_id ON disputes(against_user_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_priority ON disputes(priority);
CREATE INDEX idx_disputes_created_at ON disputes(created_at);
```

## 3. Schema Enhancements

### 3.1 Enhance crypto_wallets Table

Add additional fields to support multi-currency wallets:

```sql
-- Add currency-specific balances
ALTER TABLE crypto_wallets ADD COLUMN balances JSONB;

-- Add wallet type
ALTER TABLE crypto_wallets ADD COLUMN wallet_type TEXT DEFAULT 'spot';

-- Add locked balance for orders/escrow
ALTER TABLE crypto_wallets ADD COLUMN locked_balance NUMERIC(20, 8) DEFAULT 0;
```

### 3.2 Enhance crypto_transactions Table

Add additional fields for better transaction tracking:

```sql
-- Add reference to related trade
ALTER TABLE crypto_transactions ADD COLUMN trade_id UUID REFERENCES crypto_trades(id);

-- Add reference to related escrow transaction
ALTER TABLE crypto_transactions ADD COLUMN escrow_id UUID REFERENCES escrow_transactions(id);

-- Add transaction memo
ALTER TABLE crypto_transactions ADD COLUMN memo TEXT;

-- Add reference ID for external systems
ALTER TABLE crypto_transactions ADD COLUMN reference_id TEXT;
```

### 3.3 Enhance crypto_profiles Table

Add additional fields for trading features:

```sql
-- Add trading limits
ALTER TABLE crypto_profiles ADD COLUMN daily_limit NUMERIC(15, 2);
ALTER TABLE crypto_profiles ADD COLUMN monthly_limit NUMERIC(15, 2);

-- Add verification status
ALTER TABLE crypto_profiles ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE crypto_profiles ADD COLUMN id_document_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE crypto_profiles ADD COLUMN address_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE crypto_profiles ADD COLUMN biometric_verified BOOLEAN DEFAULT FALSE;

-- Add trading statistics
ALTER TABLE crypto_profiles ADD COLUMN total_volume NUMERIC(20, 2) DEFAULT 0;
ALTER TABLE crypto_profiles ADD COLUMN success_rate NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE crypto_profiles ADD COLUMN dispute_rate NUMERIC(5, 2) DEFAULT 0;
```

## 4. Drizzle Schema Definitions

Update the Drizzle schema definitions in `shared/crypto-schema.ts`:

```typescript
// Add these new table definitions
export const p2p_orders = pgTable('p2p_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'buy' or 'sell'
  cryptocurrency: text('cryptocurrency').notNull(),
  fiat_currency: text('fiat_currency').notNull(),
  amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
  price: numeric('price', { precision: 15, scale: 8 }).notNull(),
  min_order_amount: numeric('min_order_amount', { precision: 20, scale: 8 }),
  max_order_amount: numeric('max_order_amount', { precision: 20, scale: 8 }),
  payment_methods: jsonb('payment_methods'),
  time_limit: integer('time_limit'), // minutes
  auto_reply: text('auto_reply'),
  terms: text('terms'),
  status: text('status').default('active'), // 'active', 'completed', 'cancelled'
  completed_trades: integer('completed_trades').default(0),
  reputation: numeric('reputation', { precision: 3, scale: 2 }).default('0'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const p2p_trades = pgTable('p2p_trades', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').notNull().references(() => p2p_orders.id),
  buyer_id: uuid('buyer_id').notNull().references(() => users.id),
  seller_id: uuid('seller_id').notNull().references(() => users.id),
  amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
  price: numeric('price', { precision: 15, scale: 8 }).notNull(),
  cryptocurrency: text('cryptocurrency').notNull(),
  fiat_currency: text('fiat_currency').notNull(),
  fiat_amount: numeric('fiat_amount', { precision: 15, scale: 2 }).notNull(),
  status: text('status').default('pending'), // 'pending', 'completed', 'cancelled', 'disputed'
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const escrow_transactions = pgTable('escrow_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  trade_id: uuid('trade_id').notNull().references(() => p2p_trades.id),
  buyer_id: uuid('buyer_id').notNull().references(() => users.id),
  seller_id: uuid('seller_id').notNull().references(() => users.id),
  cryptocurrency: text('cryptocurrency').notNull(),
  amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
  fiat_amount: numeric('fiat_amount', { precision: 15, scale: 2 }).notNull(),
  fiat_currency: text('fiat_currency').notNull(),
  time_limit: integer('time_limit'), // minutes
  status: text('status').default('pending_payment'), // 'pending_payment', 'payment_confirmed', 'completed', 'disputed', 'refunded'
  created_at: timestamp('created_at').defaultNow(),
  expires_at: timestamp('expires_at'),
  completed_at: timestamp('completed_at'),
  transaction_hash: text('transaction_hash'),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const disputes = pgTable('disputes', {
  id: uuid('id').primaryKey().defaultRandom(),
  escrow_id: uuid('escrow_id').notNull().references(() => escrow_transactions.id),
  raised_by: uuid('raised_by').notNull().references(() => users.id),
  against_user_id: uuid('against_user_id').notNull().references(() => users.id),
  reason: text('reason').notNull(),
  description: text('description').notNull(),
  evidence: jsonb('evidence'),
  priority: text('priority').default('low'), // 'low', 'medium', 'high'
  status: text('status').default('pending'), // 'pending', 'resolved', 'rejected'
  resolution: text('resolution'),
  resolved_by: uuid('resolved_by').references(() => users.id),
  resolved_at: timestamp('resolved_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Update existing table definitions with new fields
// ... (add the enhanced fields to existing tables)
```

## 5. Migration Script

Create a migration script to apply these changes:

```typescript
// migrations/002-enhance-crypto-schema.ts
import { sql } from 'drizzle-orm';
import { db } from '../server/utils/db';

async function up() {
  // Create new tables
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS p2p_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      cryptocurrency TEXT NOT NULL,
      fiat_currency TEXT NOT NULL,
      amount NUMERIC(20, 8) NOT NULL,
      price NUMERIC(15, 8) NOT NULL,
      min_order_amount NUMERIC(20, 8),
      max_order_amount NUMERIC(20, 8),
      payment_methods JSONB,
      time_limit INTEGER,
      auto_reply TEXT,
      terms TEXT,
      status TEXT DEFAULT 'active',
      completed_trades INTEGER DEFAULT 0,
      reputation NUMERIC(3, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  
  // Add indexes
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_p2p_orders_user_id ON p2p_orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_p2p_orders_type ON p2p_orders(type);
    CREATE INDEX IF NOT EXISTS idx_p2p_orders_cryptocurrency ON p2p_orders(cryptocurrency);
    CREATE INDEX IF NOT EXISTS idx_p2p_orders_fiat_currency ON p2p_orders(fiat_currency);
    CREATE INDEX IF NOT EXISTS idx_p2p_orders_status ON p2p_orders(status);
    CREATE INDEX IF NOT EXISTS idx_p2p_orders_created_at ON p2p_orders(created_at);
  `);
  
  // Repeat for other tables...
  
  console.log('Database schema enhancement completed');
}

async function down() {
  // Drop tables in reverse order
  await db.execute(sql`DROP TABLE IF EXISTS disputes;`);
  await db.execute(sql`DROP TABLE IF EXISTS escrow_transactions;`);
  await db.execute(sql`DROP TABLE IF EXISTS p2p_trades;`);
  await db.execute(sql`DROP TABLE IF EXISTS p2p_orders;`);
  
  console.log('Database schema enhancement rolled back');
}

export { up, down };
```

## 6. Testing the Schema

After implementing the schema changes:

1. Run the migration script
2. Verify all tables are created correctly
3. Test CRUD operations on all new tables
4. Verify foreign key relationships
5. Test indexing performance

## 7. Security Considerations

1. Ensure all foreign key constraints are properly defined
2. Add appropriate indexes for performance
3. Implement row-level security where needed
4. Regularly backup the database
5. Monitor for suspicious activities

This enhancement plan provides a comprehensive approach to upgrading the database schema for production-ready cryptocurrency trading functionality.