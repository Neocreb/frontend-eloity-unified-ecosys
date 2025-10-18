# 🔌 External Services Integration

This document provides guidance on configuring and integrating external services with the Eloity platform.

## 📋 Overview

The Eloity platform integrates with various external services to provide a comprehensive ecosystem. This guide covers the setup and configuration of these services.

## 💰 Cryptocurrency Services

### Bybit API Integration

The Eloity platform integrates with Bybit to provide cryptocurrency trading capabilities. To enable this integration, you need to configure Bybit API keys with specific permissions.

#### Required API Key Permissions

When creating your Bybit API keys, ensure they have the following permissions enabled:

1. **Contracts - Orders & Positions**
   - Permission to place orders on derivatives contracts
   - Permission to manage positions (open/close/modify)
   - Access to position history and profit/loss data

2. **USDC Contracts - Trade**
   - Permission to trade USDC settled derivatives
   - Access to order placement and management for USDC contracts

3. **Unified Trading - Trade**
   - Full trading permissions for unified account trading
   - Ability to place spot, margin, and futures orders
   - Access to unified wallet balances and positions

4. **SPOT - Trade**
   - Permission to trade spot markets
   - Ability to place buy/sell orders for all supported cryptocurrencies
   - Access to order book and trade history

5. **Wallet - Account Transfer & Subaccount Transfer**
   - Permission to transfer funds between different account types
   - Ability to transfer funds to/from subaccounts
   - Access to wallet balance information
   - Permission to withdraw funds (if needed)

6. **Exchange - Convert & Exchange History**
   - Permission to use the convert feature for instant currency swaps
   - Access to exchange history for reporting and analytics
   - View transaction history and fees

#### Environment Variables

The following environment variables are used for Bybit integration:

```
BYBIT_PUBLIC_API=your_bybit_public_key
BYBIT_SECRET_API=your_bybit_secret_key
```

These keys are securely managed through Supabase Edge Functions and should never be hardcoded or committed to version control.

#### Security Best Practices

1. **Limited Permissions**: Only grant the minimum required permissions for the application to function
2. **Regular Rotation**: Rotate API keys periodically (recommended every 90 days)
3. **IP Whitelisting**: Restrict API key usage to specific IP addresses if possible
4. **Monitoring**: Regularly monitor API key usage and set up alerts for unusual activity
5. **Separation of Concerns**: Use separate API keys for different environments (development, staging, production)

#### Setup Instructions

1. Log in to your Bybit account
2. Navigate to API Management section
3. Create a new API key with the permissions listed above
4. Store the API key securely in your Supabase Edge Function environment variables:
   - `BYBIT_PUBLIC_API` - Your Bybit API Key
   - `BYBIT_SECRET_API` - Your Bybit Secret Key
5. Deploy the Edge Function to apply the changes

#### Troubleshooting

If you encounter permission errors:

1. Verify all required permissions are enabled for your API key
2. Check that the API key has not expired
3. Confirm the IP whitelist settings (if applicable)
4. Ensure the API key is correctly stored in Supabase Edge Functions

For more information about Bybit API permissions, refer to the official Bybit API documentation.

### CoinGecko API

The platform uses CoinGecko API for cryptocurrency price data and market information.

#### Environment Variables

```
COINGECKO_API_KEY=your_coingecko_api_key
COINGECKO_API=your_coingecko_api_endpoint
```

## 💬 Communication Services

### Twilio API

Twilio is used for SMS notifications and two-factor authentication.

#### Environment Variables

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_API_SECRET_KEY=your_twilio_api_secret_key
TWILIO_SID_KEY=your_twilio_sid_key
```

### Resend API

Resend is used for transactional email delivery.

#### Environment Variables

```
RESEND_API=your_resend_api_key
```

## 🛒 Payment Services

### Paystack

Paystack is used for payment processing in African markets.

#### Environment Variables

```
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_API=your_paystack_public_api
PAYSTACK_API_KEY=your_paystack_api_key
```

### Flutterwave

Flutterwave is used for payment processing in various African and international markets.

#### Environment Variables

```
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
```

### Stripe

Stripe is used for international payment processing.

#### Environment Variables

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 📱 Social Media Integration

### Google Authentication

Google OAuth is used for social login and authentication.

#### Environment Variables

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Facebook Authentication

Facebook OAuth is used for social login and authentication.

#### Environment Variables

```
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Twitter Authentication

Twitter OAuth is used for social login and authentication.

#### Environment Variables

```
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
```

## 📧 Email Services

### SMTP Configuration

SMTP is used for general email delivery.

#### Environment Variables

```
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

## ☁️ Cloud Storage

### AWS S3

AWS S3 is used for file storage and content delivery.

#### Environment Variables

```
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

## 🔥 Firebase Services

Firebase is used for push notifications and real-time features.

#### Environment Variables

```
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## 📊 Analytics & Monitoring

### Google Analytics

Google Analytics is used for website and application analytics.

#### Environment Variables

```
GA_TRACKING_ID=your_ga_tracking_id
```

### Mixpanel

Mixpanel is used for advanced user behavior analytics.

#### Environment Variables

```
MIXPANEL_TOKEN=your_mixpanel_token
```

### Sentry

Sentry is used for error tracking and monitoring.

#### Environment Variables

```
SENTRY_DSN=your_sentry_dsn
```

## 🤖 AI Services

### OpenAI

OpenAI is used for AI-powered features and content generation.

#### Environment Variables

```
OPENAI_API_KEY=your_openai_api_key
```

## 🔐 Security Services

### JWT Configuration

JWT is used for authentication and authorization.

#### Environment Variables

```
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

## 📞 Support

For issues with external service integration, please check:

1. Verify all environment variables are correctly set
2. Check the Supabase Edge Function configuration
3. Review the service provider's API documentation
4. Contact the service provider for API-specific issues

## 📝 Additional Resources

- [Bybit Integration Guide](../BYBIT_INTEGRATION.md) - Detailed Bybit setup instructions
- [Supabase Integration Guide](../setup/environment.md) - Supabase configuration
- [API Reference](../api/api-reference.md) - Platform API documentation