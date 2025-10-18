# Bybit Integration Guide

This document provides guidance on setting up and configuring Bybit API keys for the Eloity Unified Ecosystem platform.

## Overview

The Eloity platform integrates with Bybit to provide cryptocurrency trading capabilities. To enable this integration, you need to configure Bybit API keys with specific permissions.

## Required API Key Permissions

When creating your Bybit API keys, ensure they have the following permissions enabled:

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

## Environment Variables

The following environment variables are used in the application:

```
BYBIT_PUBLIC_API=your_bybit_public_key
BYBIT_SECRET_API=your_bybit_secret_key
```

These keys are securely managed through Supabase Edge Functions and should never be hardcoded or committed to version control.

## Security Best Practices

1. **Limited Permissions**: Only grant the minimum required permissions for the application to function
2. **Regular Rotation**: Rotate API keys periodically (recommended every 90 days)
3. **IP Whitelisting**: Restrict API key usage to specific IP addresses if possible
4. **Monitoring**: Regularly monitor API key usage and set up alerts for unusual activity
5. **Separation of Concerns**: Use separate API keys for different environments (development, staging, production)

## Setup Instructions

1. Log in to your Bybit account
2. Navigate to API Management section
3. Create a new API key with the permissions listed above
4. Store the API key securely in your Supabase Edge Function environment variables:
   - `BYBIT_PUBLIC_API` - Your Bybit API Key
   - `BYBIT_SECRET_API` - Your Bybit Secret Key
5. Deploy the Edge Function to apply the changes

## Troubleshooting

If you encounter permission errors:

1. Verify all required permissions are enabled for your API key
2. Check that the API key has not expired
3. Confirm the IP whitelist settings (if applicable)
4. Ensure the API key is correctly stored in Supabase Edge Functions

For more information about Bybit API permissions, refer to the official Bybit API documentation.