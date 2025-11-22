# Wallet Services Database Migration Guide

## Overview
This guide outlines the database tables and RLS policies required for the updated wallet services system optimized for African markets (Nigeria, Ghana, South Africa, etc.).

## New Tables Required

### 1. wallet_transactions
Tracks all wallet transactions across all services.

```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- 'deposit', 'withdraw', 'send', 'receive', 'airtime', 'data', 'electricity', 'tv', 'safebox'
  amount DECIMAL(15, 4) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  payment_method VARCHAR(50), -- 'card', 'bank', 'mobile_money', 'crypto'
  recipient_id UUID REFERENCES auth.users(id),
  recipient_type VARCHAR(50), -- 'user', 'bank', 'mobile_money', 'merchant'
  recipient_details JSONB,
  metadata JSONB, -- service-specific data (provider, plan, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### 2. wallet_deposit_methods
Stores available deposit methods for each region.

```sql
CREATE TABLE wallet_deposit_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'card', 'bank_transfer', 'mobile_money', 'crypto'
  currency VARCHAR(3),
  min_amount DECIMAL(15, 4),
  max_amount DECIMAL(15, 4),
  fee_percentage DECIMAL(5, 2),
  processing_time_minutes INT,
  is_active BOOLEAN DEFAULT true,
  region_codes TEXT[], -- ['NG', 'GH', 'ZA', 'KE']
  provider_config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_active (is_active),
  INDEX idx_type (type)
);
```

### 3. wallet_service_providers
Stores third-party service providers (airtime, data, electricity, TV, etc).

```sql
CREATE TABLE wallet_service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type VARCHAR(50) NOT NULL, -- 'airtime', 'data', 'electricity', 'tv'
  provider_name VARCHAR(100) NOT NULL,
  provider_code VARCHAR(50),
  country_code VARCHAR(2),
  is_active BOOLEAN DEFAULT true,
  fee_percentage DECIMAL(5, 2),
  api_key_encrypted TEXT,
  webhook_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_service_country (service_type, country_code),
  INDEX idx_active (is_active)
);
```

### 4. wallet_service_plans
Stores available plans for services like data, airtime, TV subscriptions.

```sql
CREATE TABLE wallet_service_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES wallet_service_providers(id),
  plan_name VARCHAR(100) NOT NULL,
  plan_code VARCHAR(50),
  amount DECIMAL(15, 4),
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  validity_days INT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_provider_id (provider_id),
  INDEX idx_active (is_active)
);
```

### 5. wallet_safebox_accounts
Stores safebox savings accounts with interest.

```sql
CREATE TABLE wallet_safebox_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(15, 4) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  interest_rate DECIMAL(5, 3),
  interest_paid_to_date DECIMAL(15, 4) DEFAULT 0,
  last_interest_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id),
  INDEX idx_user_id (user_id)
);
```

### 6. wallet_bank_accounts
Stores user's linked bank accounts for withdrawals/transfers.

```sql
CREATE TABLE wallet_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number VARCHAR(50) NOT NULL,
  bank_code VARCHAR(20),
  bank_name VARCHAR(100),
  account_holder_name VARCHAR(100),
  country_code VARCHAR(2),
  currency VARCHAR(3),
  is_verified BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_verified (is_verified)
);
```

## RLS Policies

```sql
-- wallet_transactions RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON wallet_transactions
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert their own transactions"
  ON wallet_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending transactions"
  ON wallet_transactions
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- wallet_safebox_accounts RLS
ALTER TABLE wallet_safebox_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own safebox account"
  ON wallet_safebox_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own safebox account"
  ON wallet_safebox_accounts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- wallet_bank_accounts RLS
ALTER TABLE wallet_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bank accounts"
  ON wallet_bank_accounts
  FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can manage their own bank accounts"
  ON wallet_bank_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts"
  ON wallet_bank_accounts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service providers are read-only for users
ALTER TABLE wallet_service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active service providers"
  ON wallet_service_providers
  FOR SELECT
  USING (is_active = true);

-- Service plans are read-only for users
ALTER TABLE wallet_service_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active service plans"
  ON wallet_service_plans
  FOR SELECT
  USING (is_active = true);

-- Deposit methods are read-only for users
ALTER TABLE wallet_deposit_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active deposit methods"
  ON wallet_deposit_methods
  FOR SELECT
  USING (is_active = true);
```

## Migration Steps

1. **Run on Supabase**: Copy the SQL from the sections above and run in Supabase SQL Editor
2. **Verify Tables**: Check that all tables are created successfully
3. **Check RLS Policies**: Ensure all RLS policies are applied
4. **Test Permissions**: Verify that:
   - Users can only see their own transactions
   - Users can only manage their own bank accounts and safebox
   - Service providers and plans are visible to everyone

## Notes for African Markets

The schema is optimized for:
- **Nigeria**: OPay, Flutterwave, Monnify payment methods
- **Ghana**: MTN Mobile Money, AirtelTigo Money
- **South Africa**: FNB, ABSA, Standard Bank integrations
- **Multi-currency**: Support for NGN, GHS, ZAR, KES, UGX

## Service Types Supported

- **Airtime**: Mobile phone credit (MTN, Vodafone, Airtel, etc.)
- **Data**: Internet bundles and data plans
- **Electricity**: Utility bill payments (NEPA/EKEDC in Nigeria, etc.)
- **TV**: Cable subscriptions (DStv, GOtv, Startimes, etc.)
- **Transfers**: To Eloity users and bank transfers
- **Deposits**: Multiple payment methods
- **Withdrawals**: Bank transfers and mobile money
- **Safebox**: Interest-bearing savings accounts
