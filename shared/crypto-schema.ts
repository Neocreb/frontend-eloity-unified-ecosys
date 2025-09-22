import { pgTable, uuid, text, timestamp, boolean, jsonb, numeric, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

// Crypto profiles table
export const crypto_profiles = pgTable('crypto_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  wallet_address: text('wallet_address').unique(),
  wallet_provider: text('wallet_provider'),
  kyc_status: text('kyc_status').default('pending'),
  kyc_verified_at: timestamp('kyc_verified_at'),
  trading_volume: numeric('trading_volume', { precision: 15, scale: 2 }).default('0'),
  total_trades: integer('total_trades').default(0),
  average_rating: numeric('average_rating', { precision: 3, scale: 2 }).default('0'),
  is_verified_trader: boolean('is_verified_trader').default(false),
  preferred_currencies: text('preferred_currencies').array(),
  trading_pairs: jsonb('trading_pairs'),
  risk_tolerance: text('risk_tolerance').default('medium'),
  investment_strategy: text('investment_strategy'),
  notification_preferences: jsonb('notification_preferences'),
  security_settings: jsonb('security_settings'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Crypto wallets table
export const crypto_wallets = pgTable('crypto_wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  wallet_address: text('wallet_address').notNull(),
  wallet_provider: text('wallet_provider').notNull(),
  chain_type: text('chain_type').notNull(), // 'ethereum', 'bitcoin', 'solana', etc.
  balance: numeric('balance', { precision: 20, scale: 8 }).default('0'),
  currency: text('currency').default('USD'),
  is_primary: boolean('is_primary').default(false),
  is_connected: boolean('is_connected').default(true),
  last_synced_at: timestamp('last_synced_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Crypto transactions table
export const crypto_transactions = pgTable('crypto_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  wallet_id: uuid('wallet_id').notNull(),
  transaction_hash: text('transaction_hash').unique(),
  from_address: text('from_address').notNull(),
  to_address: text('to_address').notNull(),
  amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
  currency: text('currency').notNull(),
  transaction_fee: numeric('transaction_fee', { precision: 15, scale: 8 }),
  status: text('status').default('pending'), // 'pending', 'confirmed', 'failed'
  transaction_type: text('transaction_type').notNull(), // 'send', 'receive', 'swap', 'stake'
  timestamp: timestamp('timestamp').notNull(),
  confirmations: integer('confirmations').default(0),
  block_number: integer('block_number'),
  gas_price: numeric('gas_price', { precision: 15, scale: 8 }),
  gas_limit: numeric('gas_limit', { precision: 15, scale: 8 }),
  gas_used: numeric('gas_used', { precision: 15, scale: 8 }),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Crypto trades table
export const crypto_trades = pgTable('crypto_trades', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  transaction_id: uuid('transaction_id'),
  pair: text('pair').notNull(), // 'BTC/USD', 'ETH/BTC', etc.
  side: text('side').notNull(), // 'buy', 'sell'
  price: numeric('price', { precision: 15, scale: 8 }).notNull(),
  amount: numeric('amount', { precision: 20, scale: 8 }).notNull(),
  total_value: numeric('total_value', { precision: 15, scale: 2 }).notNull(),
  fee: numeric('fee', { precision: 15, scale: 8 }),
  fee_currency: text('fee_currency'),
  status: text('status').default('completed'), // 'pending', 'completed', 'cancelled'
  order_type: text('order_type').default('market'), // 'market', 'limit', 'stop'
  timestamp: timestamp('timestamp').notNull(),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Crypto prices table
export const crypto_prices = pgTable('crypto_prices', {
  id: uuid('id').primaryKey().defaultRandom(),
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  price_usd: numeric('price_usd', { precision: 15, scale: 8 }).notNull(),
  price_change_24h: numeric('price_change_24h', { precision: 8, scale: 2 }),
  volume_24h: numeric('volume_24h', { precision: 20, scale: 2 }),
  market_cap: numeric('market_cap', { precision: 25, scale: 2 }),
  market_cap_rank: integer('market_cap_rank'),
  high_24h: numeric('high_24h', { precision: 15, scale: 8 }),
  low_24h: numeric('low_24h', { precision: 15, scale: 8 }),
  circulating_supply: numeric('circulating_supply', { precision: 25, scale: 8 }),
  total_supply: numeric('total_supply', { precision: 25, scale: 8 }),
  max_supply: numeric('max_supply', { precision: 25, scale: 8 }),
  last_updated: timestamp('last_updated').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// Relations
export const cryptoProfilesRelations = relations(crypto_profiles, ({ one }) => ({
  user: one(users, {
    fields: [crypto_profiles.user_id],
    references: [users.id],
  }),
}));

export const cryptoWalletsRelations = relations(crypto_wallets, ({ one }) => ({
  user: one(users, {
    fields: [crypto_wallets.user_id],
    references: [users.id],
  }),
}));

export const cryptoTransactionsRelations = relations(crypto_transactions, ({ one }) => ({
  user: one(users, {
    fields: [crypto_transactions.user_id],
    references: [users.id],
  }),
  wallet: one(crypto_wallets, {
    fields: [crypto_transactions.wallet_id],
    references: [crypto_wallets.id],
  }),
}));

export const cryptoTradesRelations = relations(crypto_trades, ({ one }) => ({
  user: one(users, {
    fields: [crypto_trades.user_id],
    references: [users.id],
  }),
  transaction: one(crypto_transactions, {
    fields: [crypto_trades.transaction_id],
    references: [crypto_transactions.id],
  }),
}));

export const cryptoPricesRelations = relations(crypto_prices, ({ one }) => ({
  // No relations for prices as it's a standalone table
}));