# Bybit API Key Permissions Guide (Deprecated)

⚠️ **DEPRECATED**: This documentation is outdated. The platform now uses CryptoAPIs instead of Bybit. Please see [CRYPTOAPIS_API_PERMISSIONS.md](./CRYPTOAPIS_API_PERMISSIONS.md) for the current API key guide.

## Historical Information

This document previously outlined the required permissions for the Bybit API keys used in the Eloity Unified Ecosystem platform.

### Required API Key Permissions (Historical)

When creating or configuring your Bybit API keys, the following permissions were required:

### 1. Contracts - Orders & Positions
- Permission to place orders on derivatives contracts
- Permission to manage positions (open/close/modify)
- Access to position history and profit/loss data

### 2. USDC Contracts - Trade
- Permission to trade USDC settled derivatives
- Access to order placement and management for USDC contracts

### 3. Unified Trading - Trade
- Full trading permissions for unified account trading
- Ability to place spot, margin, and futures orders
- Access to unified wallet balances and positions

### 4. SPOT - Trade
- Permission to trade spot markets
- Ability to place buy/sell orders for all supported cryptocurrencies
- Access to order book and trade history

### 5. Wallet - Account Transfer & Subaccount Transfer
- Permission to transfer funds between different account types
- Ability to transfer funds to/from subaccounts
- Access to wallet balance information
- Permission to withdraw funds (if needed)

### 6. Exchange - Convert & Exchange History
- Permission to use the convert feature for instant currency swaps
- Access to exchange history for reporting and analytics
- View transaction history and fees

## Environment Variables (Historical)

The following environment variables were previously used in the application:

```
BYBIT_PUBLIC_API=your_bybit_public_key
BYBIT_SECRET_API=your_bybit_secret_key
```

These keys were securely retrieved from Supabase Edge Functions and should never be hardcoded or committed to version control.

## Migration to CryptoAPIs

The platform has been migrated from Bybit to CryptoAPIs for the following reasons:

1. **Better Reliability**: CryptoAPIs provides more stable connections
2. **Comprehensive Data**: More extensive cryptocurrency data coverage
3. **Simplified Authentication**: Single API key instead of public/secret key pairs
4. **Better Documentation**: More comprehensive and up-to-date API documentation

## See Also

For current API key information, please refer to:
- [CRYPTOAPIS_API_PERMISSIONS.md](./CRYPTOAPIS_API_PERMISSIONS.md)
- [CRYPTOAPIS_INTEGRATION_SETUP.md](./CRYPTOAPIS_INTEGRATION_SETUP.md)
- [CRYPTO_SETUP_GUIDE.md](./CRYPTO_SETUP_GUIDE.md)