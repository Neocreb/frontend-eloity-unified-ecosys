# Database Schema Enhancement Plan

This document outlines the necessary enhancements to the existing database schema to support full production functionality for the cryptocurrency trading platform.

## Current Schema Analysis

The current schema includes the following tables:
- `crypto_profiles` - User KYC and trading profile information
- `crypto_wallets` - User wallet information and balances
- `crypto_transactions` - Transaction history
- `crypto_trades` - Trading history and P2P orders
- `crypto_prices` - Cryptocurrency price data

## Required Enhancements

### 1. Enhanced crypto_profiles Table

#### Current Fields
- id, user_id, wallet_address, wallet_provider, kyc_status, kyc_verified_at
- trading_volume, total_trades, average_rating, is_verified_trader
- preferred_currencies, trading_pairs, risk_tolerance, investment_strategy
- notification_preferences, security_settings, created_at, updated_at

#### Proposed Additions
```sql
-- Add payment methods for P2P trading
ALTER TABLE crypto_profiles ADD COLUMN preferred_payment_methods TEXT[];

-- Add trading limits based on KYC level
ALTER TABLE crypto_profiles ADD COLUMN daily_limit NUMERIC(20, 8);
ALTER TABLE crypto_profiles ADD COLUMN monthly_limit NUMERIC(20, 8);
ALTER TABLE crypto_profiles ADD COLUMN current_daily_volume NUMERIC(20, 8) DEFAULT 0;
ALTER TABLE crypto_profiles ADD COLUMN current_monthly_volume NUMERIC(20, 8) DEFAULT 0;

-- Add escrow and dispute statistics
ALTER TABLE crypto_profiles ADD COLUMN successful_escrows INTEGER DEFAULT 0;
ALTER TABLE crypto_profiles ADD COLUMN disputed_trades INTEGER DEFAULT 0;
ALTER TABLE crypto_profiles ADD COLUMN banned_until TIMESTAMP;

-- Add two-factor authentication settings
ALTER TABLE crypto_profiles ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE crypto_profiles ADD COLUMN two_factor_secret TEXT;
```

### 2. Enhanced crypto_wallets Table

#### Current Fields
- id, user_id, wallet_address, wallet_provider, chain_type
- balance, currency, is_primary, is_connected, last_synced_at
- created_at, updated_at

#### Proposed Additions
```sql
-- Add wallet security features
ALTER TABLE crypto_wallets ADD COLUMN encrypted_private_key TEXT;
ALTER TABLE crypto_wallets ADD COLUMN backup_phrase_encrypted TEXT;
ALTER TABLE crypto_wallets ADD COLUMN last_backup TIMESTAMP;

-- Add multi-currency support improvements
ALTER TABLE crypto_wallets ADD COLUMN supported_currencies TEXT[];

-- Add wallet limits and restrictions
ALTER TABLE crypto_wallets ADD COLUMN withdrawal_limit_daily NUMERIC(20, 8);
ALTER TABLE crypto_wallets ADD COLUMN withdrawal_limit_monthly NUMERIC(20, 8);
```

### 3. Enhanced crypto_transactions Table

#### Current Fields
- id, user_id, wallet_id, transaction_hash, from_address, to_address
- amount, currency, transaction_fee, status, transaction_type
- timestamp, confirmations, block_number, gas_price, gas_limit, gas_used
- metadata, created_at, updated_at

#### Proposed Additions
```sql
-- Add reference to related trade for better tracking
ALTER TABLE crypto_transactions ADD COLUMN trade_id UUID REFERENCES crypto_trades(id);

-- Add detailed fee breakdown
ALTER TABLE crypto_transactions ADD COLUMN network_fee NUMERIC(20, 8);
ALTER TABLE crypto_transactions ADD COLUMN platform_fee NUMERIC(20, 8);

-- Add destination details for better UX
ALTER TABLE crypto_transactions ADD COLUMN destination_name TEXT;
ALTER TABLE crypto_transactions ADD COLUMN destination_description TEXT;

-- Add categorization for better reporting
ALTER TABLE crypto_transactions ADD COLUMN category TEXT;

-- Add exchange rate information
ALTER TABLE crypto_transactions ADD COLUMN exchange_rate NUMERIC(20, 8);
ALTER TABLE crypto_transactions ADD COLUMN fiat_value NUMERIC(20, 8);
```

### 4. Enhanced crypto_trades Table

#### Current Fields
- id, user_id, transaction_id, pair, side, price, amount, total_value
- fee, fee_currency, status, order_type, timestamp, metadata
- created_at, updated_at

#### Proposed Additions
```sql
-- Add buyer information for P2P trades
ALTER TABLE crypto_trades ADD COLUMN buyer_id UUID REFERENCES users(id);

-- Add escrow reference
ALTER TABLE crypto_trades ADD COLUMN escrow_id UUID;

-- Add payment method and details
ALTER TABLE crypto_trades ADD COLUMN payment_method TEXT;
ALTER TABLE crypto_trades ADD COLUMN payment_details JSONB;

-- Add timing information
ALTER TABLE crypto_trades ADD COLUMN expires_at TIMESTAMP;
ALTER TABLE crypto_trades ADD COLUMN completed_at TIMESTAMP;
ALTER TABLE crypto_trades ADD COLUMN cancelled_at TIMESTAMP;

-- Add dispute tracking
ALTER TABLE crypto_trades ADD COLUMN dispute_id UUID;
ALTER TABLE crypto_trades ADD COLUMN dispute_reason TEXT;
ALTER TABLE crypto_trades ADD COLUMN dispute_status TEXT;

-- Add rating and feedback
ALTER TABLE crypto_trades ADD COLUMN seller_rating NUMERIC(3, 2);
ALTER TABLE crypto_trades ADD COLUMN buyer_rating NUMERIC(3, 2);
ALTER TABLE crypto_trades ADD COLUMN seller_feedback TEXT;
ALTER TABLE crypto_trades ADD COLUMN buyer_feedback TEXT;

-- Add communication channel
ALTER TABLE crypto_trades ADD COLUMN chat_channel_id UUID;
```

### 5. New escrows Table

```sql
CREATE TABLE crypto_escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES crypto_trades(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(20, 8) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, funded, released, refunded, disputed
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  funded_at TIMESTAMP,
  released_at TIMESTAMP,
  refunded_at TIMESTAMP,
  disputed_at TIMESTAMP,
  expires_at TIMESTAMP,
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_crypto_escrows_trade_id ON crypto_escrows(trade_id);
CREATE INDEX idx_crypto_escrows_seller_id ON crypto_escrows(seller_id);
CREATE INDEX idx_crypto_escrows_buyer_id ON crypto_escrows(buyer_id);
CREATE INDEX idx_crypto_escrows_status ON crypto_escrows(status);
```

### 6. New disputes Table

```sql
CREATE TABLE crypto_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES crypto_trades(id),
  escrow_id UUID REFERENCES crypto_escrows(id),
  raised_by UUID NOT NULL REFERENCES users(id),
  against_user_id UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  description TEXT,
  evidence JSONB,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, resolved, closed
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_crypto_disputes_trade_id ON crypto_disputes(trade_id);
CREATE INDEX idx_crypto_disputes_raised_by ON crypto_disputes(raised_by);
CREATE INDEX idx_crypto_disputes_against_user ON crypto_disputes(against_user_id);
CREATE INDEX idx_crypto_disputes_status ON crypto_disputes(status);
```

### 7. New payment_methods Table

```sql
CREATE TABLE crypto_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL, -- bank_transfer, paypal, credit_card, etc.
  provider TEXT NOT NULL,
  account_details_encrypted TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_status TEXT,
  verified_at TIMESTAMP,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_crypto_payment_methods_user_id ON crypto_payment_methods(user_id);
CREATE INDEX idx_crypto_payment_methods_type ON crypto_payment_methods(type);
CREATE INDEX idx_crypto_payment_methods_is_primary ON crypto_payment_methods(is_primary);
```

### 8. Enhanced crypto_prices Table

#### Current Fields
- id, symbol, name, price_usd, price_change_24h, volume_24h
- market_cap, market_cap_rank, high_24h, low_24h
- circulating_supply, total_supply, max_supply
- last_updated, created_at

#### Proposed Additions
```sql
-- Add more detailed price information
ALTER TABLE crypto_prices ADD COLUMN price_btc NUMERIC(20, 8);
ALTER TABLE crypto_prices ADD COLUMN price_eth NUMERIC(20, 8);
ALTER TABLE crypto_prices ADD COLUMN price_change_1h NUMERIC(8, 2);
ALTER TABLE crypto_prices ADD COLUMN price_change_7d NUMERIC(8, 2);
ALTER TABLE crypto_prices ADD COLUMN price_change_30d NUMERIC(8, 2);

-- Add market metrics
ALTER TABLE crypto_prices ADD COLUMN dominance_percentage NUMERIC(5, 2);
ALTER TABLE crypto_prices ADD COLUMN sentiment_score NUMERIC(5, 2);

-- Add technical indicators
ALTER TABLE crypto_prices ADD COLUMN rsi_14 NUMERIC(8, 2);
ALTER TABLE crypto_prices ADD COLUMN macd NUMERIC(20, 8);
ALTER TABLE crypto_prices ADD COLUMN macd_signal NUMERIC(20, 8);
```

## Indexing Strategy

### Performance Indexes
```sql
-- crypto_profiles indexes
CREATE INDEX idx_crypto_profiles_user_id ON crypto_profiles(user_id);
CREATE INDEX idx_crypto_profiles_kyc_status ON crypto_profiles(kyc_status);
CREATE INDEX idx_crypto_profiles_trading_volume ON crypto_profiles(trading_volume);

-- crypto_wallets indexes
CREATE INDEX idx_crypto_wallets_user_id ON crypto_wallets(user_id);
CREATE INDEX idx_crypto_wallets_currency ON crypto_wallets(currency);
CREATE INDEX idx_crypto_wallets_balance ON crypto_wallets(balance);

-- crypto_transactions indexes
CREATE INDEX idx_crypto_transactions_user_id ON crypto_transactions(user_id);
CREATE INDEX idx_crypto_transactions_wallet_id ON crypto_transactions(wallet_id);
CREATE INDEX idx_crypto_transactions_status ON crypto_transactions(status);
CREATE INDEX idx_crypto_transactions_timestamp ON crypto_transactions(timestamp);
CREATE INDEX idx_crypto_transactions_currency ON crypto_transactions(currency);

-- crypto_trades indexes
CREATE INDEX idx_crypto_trades_user_id ON crypto_trades(user_id);
CREATE INDEX idx_crypto_trades_buyer_id ON crypto_trades(buyer_id);
CREATE INDEX idx_crypto_trades_pair ON crypto_trades(pair);
CREATE INDEX idx_crypto_trades_side ON crypto_trades(side);
CREATE INDEX idx_crypto_trades_status ON crypto_trades(status);
CREATE INDEX idx_crypto_trades_timestamp ON crypto_trades(timestamp);

-- crypto_prices indexes
CREATE INDEX idx_crypto_prices_symbol ON crypto_prices(symbol);
CREATE INDEX idx_crypto_prices_last_updated ON crypto_prices(last_updated);
```

## Security Enhancements

### Data Encryption
- Encrypt sensitive fields like private keys, payment details, and personal information
- Use PostgreSQL's built-in encryption functions or application-level encryption
- Implement key management for encryption keys

### Access Control
- Implement row-level security policies
- Add audit logging for sensitive operations
- Implement time-based access restrictions

### Backup and Recovery
- Set up regular automated backups
- Implement point-in-time recovery
- Test backup restoration procedures

## Migration Strategy

### Phase 1: Schema Changes (Week 1)
1. Add new columns to existing tables
2. Create new tables (escrows, disputes, payment_methods)
3. Add indexes for performance
4. Test schema changes in development environment

### Phase 2: Data Migration (Week 2)
1. Migrate existing data to new schema structure
2. Update application code to use new fields
3. Test data integrity and consistency

### Phase 3: Feature Implementation (Week 3-4)
1. Implement escrow system
2. Implement dispute resolution
3. Implement enhanced payment methods
4. Test all new functionality

### Phase 4: Optimization and Security (Week 5)
1. Implement encryption for sensitive data
2. Add audit logging
3. Implement access controls
4. Performance tuning and optimization

## Testing Plan

### Unit Tests
- Test all new database operations
- Verify data integrity constraints
- Test error handling scenarios

### Integration Tests
- Test end-to-end trading workflows
- Test escrow and dispute processes
- Test payment method management

### Performance Tests
- Test query performance with large datasets
- Test concurrent user scenarios
- Test backup and recovery procedures

### Security Tests
- Test encryption and decryption
- Test access control policies
- Test audit logging functionality

## Rollback Plan

### If Issues Arise
1. Revert schema changes using backup
2. Restore data from previous backup
3. Revert application code changes
4. Communicate issues to stakeholders

### Monitoring During Migration
- Monitor database performance metrics
- Monitor application error rates
- Monitor user experience impact
- Have rollback plan ready for immediate execution

## Success Criteria

1. All schema enhancements are implemented without data loss
2. Database performance meets production requirements
3. Security measures are properly implemented
4. All new functionality is working as expected
5. Comprehensive test coverage is achieved
6. Monitoring and alerting are in place