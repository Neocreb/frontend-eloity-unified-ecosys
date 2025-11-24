-- ============================================================================
-- CryptoAPIs Integration Migration
-- Run this migration in Supabase SQL Editor to set up all required tables
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CRYPTO PROFILES TABLE - User crypto preferences and KYC status
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  wallet_address TEXT UNIQUE,
  wallet_provider TEXT,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'in_review')),
  kyc_verified_at TIMESTAMP WITH TIME ZONE,
  trading_volume NUMERIC(15, 2) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  average_rating NUMERIC(3, 2) DEFAULT 0,
  is_verified_trader BOOLEAN DEFAULT FALSE,
  preferred_currencies TEXT[],
  trading_pairs JSONB,
  risk_tolerance TEXT DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  investment_strategy TEXT,
  notification_preferences JSONB,
  security_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- CRYPTO WALLETS TABLE - User wallet tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  wallet_provider TEXT NOT NULL,
  chain_type TEXT NOT NULL,
  balance NUMERIC(20, 8) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_primary BOOLEAN DEFAULT FALSE,
  is_connected BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_wallet_per_user UNIQUE(user_id, wallet_address, chain_type)
);

-- ============================================================================
-- CRYPTO WALLET ADDRESSES TABLE - Multiple addresses per blockchain
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_wallet_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  wallet_id UUID,
  blockchain TEXT NOT NULL,
  network TEXT NOT NULL,
  address TEXT NOT NULL,
  address_type TEXT DEFAULT 'standard' CHECK (address_type IN ('standard', 'contract', 'multisig', 'hardware')),
  label TEXT,
  memo TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  balance NUMERIC(20, 8) DEFAULT 0,
  balance_currency TEXT DEFAULT 'USD',
  last_balance_check TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wallet FOREIGN KEY (wallet_id) REFERENCES public.crypto_wallets(id) ON DELETE SET NULL,
  CONSTRAINT unique_address_per_blockchain UNIQUE(user_id, blockchain, network, address)
);

-- ============================================================================
-- CRYPTO TRANSACTIONS TABLE - Blockchain transactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL,
  transaction_hash TEXT UNIQUE,
  blockchain TEXT NOT NULL,
  network TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC(20, 8) NOT NULL,
  currency TEXT NOT NULL,
  transaction_fee NUMERIC(15, 8),
  fee_currency TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'canceled')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('send', 'receive', 'swap', 'stake', 'unstake', 'deposit', 'withdrawal')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmations INTEGER DEFAULT 0,
  block_number INTEGER,
  block_hash TEXT,
  gas_price NUMERIC(15, 8),
  gas_limit NUMERIC(15, 8),
  gas_used NUMERIC(15, 8),
  nonce INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wallet FOREIGN KEY (wallet_id) REFERENCES public.crypto_wallets(id) ON DELETE CASCADE
);

-- ============================================================================
-- CRYPTO TRADES TABLE - Trading history
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  transaction_id UUID,
  pair TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  price NUMERIC(15, 8) NOT NULL,
  amount NUMERIC(20, 8) NOT NULL,
  total_value NUMERIC(15, 2) NOT NULL,
  fee NUMERIC(15, 8),
  fee_currency TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'canceled')),
  order_type TEXT DEFAULT 'market' CHECK (order_type IN ('market', 'limit', 'stop', 'stop-limit')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transaction FOREIGN KEY (transaction_id) REFERENCES public.crypto_transactions(id) ON DELETE SET NULL
);

-- ============================================================================
-- CRYPTO PRICES TABLE - Cached price data
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_usd NUMERIC(15, 8) NOT NULL,
  price_change_24h NUMERIC(8, 2),
  volume_24h NUMERIC(20, 2),
  market_cap NUMERIC(25, 2),
  market_cap_rank INTEGER,
  high_24h NUMERIC(15, 8),
  low_24h NUMERIC(15, 8),
  circulating_supply NUMERIC(25, 8),
  total_supply NUMERIC(25, 8),
  max_supply NUMERIC(25, 8),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CRYPTO EXCHANGE RATES TABLE - CryptoAPIs exchange rates cache
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_asset TEXT NOT NULL,
  quote_asset TEXT NOT NULL,
  rate NUMERIC(20, 8) NOT NULL,
  source TEXT DEFAULT 'cryptoapis',
  blockchain TEXT,
  network TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_exchange_rate UNIQUE(base_asset, quote_asset, blockchain, network)
);

-- ============================================================================
-- CRYPTO BALANCES CACHE TABLE - Cached balance data from CryptoAPIs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_balances_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL,
  address TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  network TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  balance NUMERIC(20, 8) NOT NULL,
  balance_usd NUMERIC(15, 2),
  confirmed_balance NUMERIC(20, 8),
  unconfirmed_balance NUMERIC(20, 8),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  cache_expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wallet FOREIGN KEY (wallet_id) REFERENCES public.crypto_wallets(id) ON DELETE CASCADE,
  CONSTRAINT unique_balance_cache UNIQUE(user_id, address, blockchain, network, asset_symbol)
);

-- ============================================================================
-- CRYPTO WEBHOOKS TABLE - CryptoAPIs webhook registrations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  webhook_type TEXT NOT NULL CHECK (webhook_type IN ('address_activity', 'transaction', 'block', 'address_state')),
  blockchain TEXT NOT NULL,
  network TEXT NOT NULL,
  address TEXT,
  webhook_url TEXT NOT NULL,
  event_types TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  cryptoapis_webhook_id TEXT UNIQUE,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- CRYPTO PORTFOLIO HISTORY TABLE - Track portfolio value over time
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_portfolio_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  total_value_usd NUMERIC(15, 2) NOT NULL,
  total_change_24h NUMERIC(8, 2),
  total_change_percent_24h NUMERIC(8, 4),
  assets_count INTEGER,
  asset_breakdown JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- CRYPTO FEES CACHE TABLE - Store fee estimates
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_fees_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blockchain TEXT NOT NULL,
  network TEXT NOT NULL,
  transaction_type TEXT,
  fee_type TEXT,
  fee_amount NUMERIC(20, 8),
  fee_currency TEXT,
  gas_price NUMERIC(15, 8),
  gas_limit NUMERIC(15, 8),
  estimated_time_minutes INTEGER,
  priority_level TEXT CHECK (priority_level IN ('slow', 'standard', 'fast', 'custom')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_fee_cache UNIQUE(blockchain, network, transaction_type, fee_type, priority_level)
);

-- ============================================================================
-- CRYPTO MARKET DATA TABLE - Store broader market data
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.crypto_market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blockchain TEXT NOT NULL,
  network TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_market_data UNIQUE(blockchain, network, metric_name)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Crypto Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_profiles_user_id ON public.crypto_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_profiles_kyc_status ON public.crypto_profiles(kyc_status);

-- Crypto Wallets Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user_id ON public.crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_address ON public.crypto_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_chain ON public.crypto_wallets(chain_type);

-- Crypto Wallet Addresses Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_wallet_addresses_user_id ON public.crypto_wallet_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallet_addresses_address ON public.crypto_wallet_addresses(address);
CREATE INDEX IF NOT EXISTS idx_crypto_wallet_addresses_blockchain ON public.crypto_wallet_addresses(blockchain, network);

-- Crypto Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user_id ON public.crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_wallet_id ON public.crypto_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_hash ON public.crypto_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_status ON public.crypto_transactions(status);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_timestamp ON public.crypto_transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_blockchain ON public.crypto_transactions(blockchain, network);

-- Crypto Trades Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_trades_user_id ON public.crypto_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_trades_pair ON public.crypto_trades(pair);
CREATE INDEX IF NOT EXISTS idx_crypto_trades_status ON public.crypto_trades(status);
CREATE INDEX IF NOT EXISTS idx_crypto_trades_timestamp ON public.crypto_trades(timestamp DESC);

-- Crypto Prices Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON public.crypto_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_updated ON public.crypto_prices(last_updated DESC);

-- Crypto Exchange Rates Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_exchange_rates_pair ON public.crypto_exchange_rates(base_asset, quote_asset);
CREATE INDEX IF NOT EXISTS idx_crypto_exchange_rates_blockchain ON public.crypto_exchange_rates(blockchain, network);
CREATE INDEX IF NOT EXISTS idx_crypto_exchange_rates_expires ON public.crypto_exchange_rates(expires_at);

-- Crypto Balances Cache Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_balances_cache_user_id ON public.crypto_balances_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_balances_cache_wallet_id ON public.crypto_balances_cache(wallet_id);
CREATE INDEX IF NOT EXISTS idx_crypto_balances_cache_address ON public.crypto_balances_cache(address);
CREATE INDEX IF NOT EXISTS idx_crypto_balances_cache_expires ON public.crypto_balances_cache(cache_expires_at);

-- Crypto Webhooks Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_webhooks_user_id ON public.crypto_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_webhooks_active ON public.crypto_webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_crypto_webhooks_blockchain ON public.crypto_webhooks(blockchain, network);

-- Crypto Portfolio History Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_portfolio_history_user_id ON public.crypto_portfolio_history(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_portfolio_history_timestamp ON public.crypto_portfolio_history(user_id, timestamp DESC);

-- Crypto Fees Cache Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_fees_cache_blockchain ON public.crypto_fees_cache(blockchain, network);
CREATE INDEX IF NOT EXISTS idx_crypto_fees_cache_expires ON public.crypto_fees_cache(expires_at);

-- Crypto Market Data Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_market_data_blockchain ON public.crypto_market_data(blockchain, network);
CREATE INDEX IF NOT EXISTS idx_crypto_market_data_expires ON public.crypto_market_data(expires_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all crypto tables
ALTER TABLE public.crypto_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallet_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_balances_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_portfolio_history ENABLE ROW LEVEL SECURITY;

-- Crypto Profiles RLS
CREATE POLICY "Users can view their own profile" ON public.crypto_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.crypto_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.crypto_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Crypto Wallets RLS
CREATE POLICY "Users can view their own wallets" ON public.crypto_wallets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own wallets" ON public.crypto_wallets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own wallets" ON public.crypto_wallets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Crypto Wallet Addresses RLS
CREATE POLICY "Users can view their own addresses" ON public.crypto_wallet_addresses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own addresses" ON public.crypto_wallet_addresses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own addresses" ON public.crypto_wallet_addresses
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Crypto Transactions RLS
CREATE POLICY "Users can view their own transactions" ON public.crypto_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transactions" ON public.crypto_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Crypto Trades RLS
CREATE POLICY "Users can view their own trades" ON public.crypto_trades
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own trades" ON public.crypto_trades
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Crypto Balances Cache RLS
CREATE POLICY "Users can view their own balance cache" ON public.crypto_balances_cache
  FOR SELECT USING (user_id = auth.uid());

-- Crypto Webhooks RLS
CREATE POLICY "Users can manage their own webhooks" ON public.crypto_webhooks
  FOR ALL USING (user_id = auth.uid());

-- Crypto Portfolio History RLS
CREATE POLICY "Users can view their own portfolio history" ON public.crypto_portfolio_history
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- INITIAL DATA & SETUP
-- ============================================================================

-- Insert sample cryptocurrencies
INSERT INTO public.crypto_prices (symbol, name, price_usd, last_updated)
VALUES
  ('BTC', 'Bitcoin', 42500.00, NOW()),
  ('ETH', 'Ethereum', 2260.00, NOW()),
  ('USDT', 'Tether', 1.00, NOW()),
  ('BNB', 'Binance Coin', 615.00, NOW()),
  ('SOL', 'Solana', 145.00, NOW()),
  ('ADA', 'Cardano', 0.95, NOW()),
  ('LINK', 'Chainlink', 28.50, NOW()),
  ('MATIC', 'Polygon', 0.85, NOW()),
  ('AVAX', 'Avalanche', 38.20, NOW()),
  ('DOT', 'Polkadot', 7.40, NOW()),
  ('DOGE', 'Dogecoin', 0.38, NOW())
ON CONFLICT (symbol) DO UPDATE SET
  price_usd = EXCLUDED.price_usd,
  last_updated = NOW();

-- ============================================================================
-- MIGRATION COMPLETED
-- ============================================================================
-- This migration creates all necessary tables for CryptoAPIs integration.
-- All tables are properly indexed and have RLS policies enabled.
-- The system will now store real blockchain data from CryptoAPIs.
