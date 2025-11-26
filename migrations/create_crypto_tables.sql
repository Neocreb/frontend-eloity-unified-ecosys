-- Create crypto_user_wallets table for storing user wallet addresses
CREATE TABLE IF NOT EXISTS crypto_user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blockchain VARCHAR(50) NOT NULL,
  network VARCHAR(50) NOT NULL DEFAULT 'mainnet',
  wallet_address VARCHAR(255) NOT NULL,
  wallet_label VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, wallet_address, blockchain),
  INDEX idx_user_id (user_id),
  INDEX idx_blockchain_address (blockchain, wallet_address)
);

-- Create crypto_portfolio_cache table for caching portfolio data
CREATE TABLE IF NOT EXISTS crypto_portfolio_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) NOT NULL,
  blockchain VARCHAR(50) NOT NULL,
  network VARCHAR(50) NOT NULL,
  asset_symbol VARCHAR(10) NOT NULL,
  asset_name VARCHAR(100),
  amount NUMERIC(20, 8) NOT NULL,
  current_price NUMERIC(20, 8) NOT NULL,
  total_value NUMERIC(20, 2) NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_wallet_address (wallet_address),
  INDEX idx_cached_at (cached_at)
);

-- Create crypto_transactions_cache table for caching transaction history
CREATE TABLE IF NOT EXISTS crypto_transactions_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) NOT NULL,
  blockchain VARCHAR(50) NOT NULL,
  network VARCHAR(50) NOT NULL,
  transaction_hash VARCHAR(255) NOT NULL UNIQUE,
  transaction_type VARCHAR(20),
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  amount NUMERIC(20, 8),
  asset_symbol VARCHAR(10),
  gas_used NUMERIC(20, 8),
  gas_price NUMERIC(20, 8),
  fee NUMERIC(20, 8),
  status VARCHAR(50),
  block_number BIGINT,
  transaction_timestamp TIMESTAMP WITH TIME ZONE,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_wallet_address (wallet_address),
  INDEX idx_transaction_hash (transaction_hash),
  INDEX idx_timestamp (transaction_timestamp)
);

-- Create crypto_exchange_rates_cache table for caching exchange rates
CREATE TABLE IF NOT EXISTS crypto_exchange_rates_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_asset_id VARCHAR(50) NOT NULL,
  quote_asset_id VARCHAR(50) NOT NULL,
  rate NUMERIC(20, 8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(base_asset_id, quote_asset_id, timestamp),
  INDEX idx_base_quote (base_asset_id, quote_asset_id),
  INDEX idx_cached_at (cached_at)
);

-- Create crypto_fee_estimates_cache table for caching fee data
CREATE TABLE IF NOT EXISTS crypto_fee_estimates_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blockchain VARCHAR(50) NOT NULL,
  network VARCHAR(50) NOT NULL,
  slow_fee NUMERIC(20, 8),
  standard_fee NUMERIC(20, 8),
  fast_fee NUMERIC(20, 8),
  base_fee NUMERIC(20, 8),
  timestamp TIMESTAMP WITH TIME ZONE,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blockchain, network, timestamp),
  INDEX idx_blockchain_network (blockchain, network),
  INDEX idx_cached_at (cached_at)
);

-- Create crypto_webhooks table for storing webhook configurations
CREATE TABLE IF NOT EXISTS crypto_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(255) NOT NULL,
  blockchain VARCHAR(50) NOT NULL,
  network VARCHAR(50) NOT NULL,
  webhook_url VARCHAR(500) NOT NULL,
  event_types TEXT ARRAY,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_wallet_address (wallet_address)
);

-- Add RLS policies for crypto_user_wallets
ALTER TABLE crypto_user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY crypto_user_wallets_select ON crypto_user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY crypto_user_wallets_insert ON crypto_user_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY crypto_user_wallets_update ON crypto_user_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY crypto_user_wallets_delete ON crypto_user_wallets FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for crypto_portfolio_cache
ALTER TABLE crypto_portfolio_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY crypto_portfolio_cache_select ON crypto_portfolio_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY crypto_portfolio_cache_insert ON crypto_portfolio_cache FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY crypto_portfolio_cache_update ON crypto_portfolio_cache FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for crypto_transactions_cache
ALTER TABLE crypto_transactions_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY crypto_transactions_cache_select ON crypto_transactions_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY crypto_transactions_cache_insert ON crypto_transactions_cache FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for crypto_webhooks
ALTER TABLE crypto_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY crypto_webhooks_select ON crypto_webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY crypto_webhooks_insert ON crypto_webhooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY crypto_webhooks_update ON crypto_webhooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY crypto_webhooks_delete ON crypto_webhooks FOR DELETE USING (auth.uid() = user_id);
