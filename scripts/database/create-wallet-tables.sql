-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'earned')),
  amount DECIMAL(18, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  source_wallet VARCHAR(50) NOT NULL CHECK (source_wallet IN ('ecommerce', 'crypto', 'rewards', 'freelance')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  description TEXT,
  reference_id VARCHAR(100) UNIQUE,
  
  -- Deposit specific fields
  deposit_method VARCHAR(50) CHECK (deposit_method IN ('card', 'bank', 'crypto', 'mobile', 'ewallet', null)),
  deposit_provider VARCHAR(100),
  
  -- Withdrawal specific fields
  withdrawal_method VARCHAR(50) CHECK (withdrawal_method IN ('bank', 'username', 'email', 'mobile', null)),
  recipient_type VARCHAR(50) CHECK (recipient_type IN ('bank_account', 'username', 'email', 'mobile_money', null)),
  recipient_identifier VARCHAR(255),
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  
  -- Fee information
  fee_amount DECIMAL(18, 2) DEFAULT 0,
  fee_percentage DECIMAL(5, 3) DEFAULT 0,
  net_amount DECIMAL(18, 2),
  
  -- Processing information
  processor_name VARCHAR(100),
  processor_transaction_id VARCHAR(255),
  processor_response JSONB,
  
  -- Regional info
  region VARCHAR(100),
  country_code VARCHAR(2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  
  CONSTRAINT amount_positive CHECK (amount > 0),
  INDEX wallet_transactions_user_id_idx (user_id),
  INDEX wallet_transactions_status_idx (status),
  INDEX wallet_transactions_created_at_idx (created_at DESC),
  INDEX wallet_transactions_reference_idx (reference_id)
);

-- Bank Accounts Table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_type VARCHAR(50) CHECK (account_type IN ('checking', 'savings', 'mobile_money')),
  
  bank_name VARCHAR(255) NOT NULL,
  bank_code VARCHAR(20),
  branch_code VARCHAR(20),
  swift_code VARCHAR(20),
  routing_number VARCHAR(20),
  iban VARCHAR(50),
  
  account_holder_name VARCHAR(255) NOT NULL,
  account_holder_phone VARCHAR(20),
  account_holder_email VARCHAR(255),
  
  country_code VARCHAR(2),
  currency VARCHAR(10) DEFAULT 'USD',
  region VARCHAR(100),
  
  is_default BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  
  max_daily_withdrawal DECIMAL(18, 2),
  max_transaction_amount DECIMAL(18, 2),
  
  additional_info JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, account_number, bank_code, country_code),
  INDEX bank_accounts_user_id_idx (user_id),
  INDEX bank_accounts_is_default_idx (user_id, is_default),
  INDEX bank_accounts_is_verified_idx (is_verified)
);

-- Withdrawal Methods Table (stores user's preferred withdrawal methods)
CREATE TABLE IF NOT EXISTS withdrawal_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  method_type VARCHAR(50) NOT NULL CHECK (method_type IN ('bank_account', 'username', 'email', 'mobile_money')),
  display_name VARCHAR(255),
  
  -- Recipient info (polymorphic - different fields per method_type)
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  username VARCHAR(100),
  email VARCHAR(255),
  mobile_phone VARCHAR(20),
  mobile_provider VARCHAR(100),
  
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  last_used_at TIMESTAMP WITH TIME ZONE,
  failed_attempts INT DEFAULT 0,
  last_failed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX withdrawal_methods_user_id_idx (user_id),
  INDEX withdrawal_methods_method_type_idx (user_id, method_type),
  INDEX withdrawal_methods_is_default_idx (user_id, is_default)
);

-- Payment Methods Configuration Table (stores available payment methods per region)
CREATE TABLE IF NOT EXISTS payment_methods_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  region VARCHAR(100) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  
  method_type VARCHAR(50) NOT NULL,
  provider_name VARCHAR(255),
  provider_code VARCHAR(100),
  
  is_deposit_enabled BOOLEAN DEFAULT TRUE,
  is_withdrawal_enabled BOOLEAN DEFAULT TRUE,
  
  min_amount DECIMAL(18, 2),
  max_amount DECIMAL(18, 2),
  
  deposit_fee_percentage DECIMAL(5, 3),
  deposit_flat_fee DECIMAL(18, 2),
  withdrawal_fee_percentage DECIMAL(5, 3),
  withdrawal_flat_fee DECIMAL(18, 2),
  
  processing_time_minutes INT,
  currency VARCHAR(10),
  
  api_endpoint VARCHAR(500),
  api_key_required BOOLEAN DEFAULT FALSE,
  
  config JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (region, country_code, method_type, provider_code),
  INDEX payment_methods_region_idx (region),
  INDEX payment_methods_country_idx (country_code)
);

-- Enable Row Level Security
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallet_transactions
CREATE POLICY "Users can view their own transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON wallet_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for bank_accounts
CREATE POLICY "Users can view their own bank accounts" ON bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank accounts" ON bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts" ON bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts" ON bank_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for withdrawal_methods
CREATE POLICY "Users can view their own withdrawal methods" ON withdrawal_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawal methods" ON withdrawal_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own withdrawal methods" ON withdrawal_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own withdrawal methods" ON withdrawal_methods
  FOR DELETE USING (auth.uid() = user_id);

-- Payment methods config is read-only for users
CREATE POLICY "Users can read payment methods config" ON payment_methods_config
  FOR SELECT USING (TRUE);
