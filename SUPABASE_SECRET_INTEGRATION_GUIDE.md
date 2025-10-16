# Supabase Edge Functions Secret Integration Guide

This guide explains how to properly integrate your secret keys stored in Supabase Edge Functions with the Eloity Unified Ecosystem platform.

## Overview

The Eloity platform is designed to work with secret keys stored in Supabase Edge Functions for enhanced security. This approach keeps sensitive credentials away from your application code and provides a secure way to manage API keys.

## Current Implementation Status

✅ **Already Integrated Services**:
1. **CoinGecko API** - Used in [src/services/cryptoService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/src/services/cryptoService.ts)
2. **Flutterwave Payment Service** - Used in [server/services/paymentService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/paymentService.ts)
3. **Paystack Payment Service** - Used in [server/services/paymentService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/paymentService.ts)
4. **Twilio SMS Service** - Used in [server/services/notificationService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/notificationService.ts)

## Required Secret Keys

The following secret keys are required for the platform to function properly:

### Payment Services
- `FLUTTERWAVE_SECRET_KEY` - Secret key for Flutterwave API
- `PAYSTACK_SECRET_KEY` - Secret key for Paystack API

### SMS Services
- `TWILIO_ACCOUNT_SID` - Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Twilio Phone Number

### Crypto Services
- `COINGECKO_API_KEY` - CoinGecko API Key

### African SMS Providers (Optional)
- `AFRICAS_TALKING_API_KEY` - Africa's Talking API Key
- `AFRICAS_TALKING_USERNAME` - Africa's Talking Username
- `TERMII_API_KEY` - Termii API Key

## Integration Steps

### 1. Set Up Supabase Edge Function

1. **Deploy the Edge Function**:
   ```bash
   node scripts/deploy-edge-function.js
   ```

2. **Set Secret Keys in Supabase Dashboard**:
   - Go to your Supabase project
   - Navigate to **Project Settings > API > Edge Functions**
   - Add your secret keys as environment variables:
     ```
     FLUTTERWAVE_SECRET_KEY=your_actual_flutterwave_secret_key
     PAYSTACK_SECRET_KEY=your_actual_paystack_secret_key
     TWILIO_ACCOUNT_SID=your_actual_twilio_account_sid
     TWILIO_AUTH_TOKEN=your_actual_twilio_auth_token
     TWILIO_PHONE_NUMBER=your_actual_twilio_phone_number
     COINGECKO_API_KEY=your_actual_coingecko_api_key
     ```

### 2. Retrieve Secrets from Edge Functions

Use the provided script to retrieve secrets from Supabase Edge Functions:

```bash
node scripts/retrieve-supabase-secrets.js
```

This script will:
- Connect to your Supabase project
- Retrieve the secret keys from Edge Functions
- Update your `.env` file with the retrieved values

### 3. Update Environment Variables

After retrieving your secrets, update your `.env` file with the actual values:

```env
# Payment Services
FLUTTERWAVE_SECRET_KEY=your_actual_flutterwave_secret_key
PAYSTACK_SECRET_KEY=your_actual_paystack_secret_key

# SMS Services
TWILIO_ACCOUNT_SID=your_actual_twilio_account_sid
TWILIO_AUTH_TOKEN=your_actual_twilio_auth_token
TWILIO_PHONE_NUMBER=your_actual_twilio_phone_number

# Crypto Services
COINGECKO_API_KEY=your_actual_coingecko_api_key
```

### 4. Verify Integration

Run the verification script to ensure all secrets are properly configured:

```bash
node scripts/verify-secret-integration.js
```

## How Services Use Secret Keys

### CoinGecko API ([src/services/cryptoService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/src/services/cryptoService.ts))

The CoinGecko service uses the API key for enhanced rate limits:

```javascript
const response = await fetch(
  `${this.COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h,7d,30d`,
  {
    headers: {
      'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
    }
  }
);
```

### Flutterwave Payment Service ([server/services/paymentService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/paymentService.ts))

The Flutterwave service uses the secret key for payment processing:

```javascript
const response = await fetch('https://api.flutterwave.com/v3/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```

### Paystack Payment Service ([server/services/paymentService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/paymentService.ts))

The Paystack service uses the secret key for payment processing:

```javascript
const response = await fetch('https://api.paystack.co/transaction/initialize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```

### Twilio SMS Service ([server/services/notificationService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/notificationService.ts))

The Twilio service uses the account credentials for SMS sending:

```javascript
const credentials = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');

const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    From: process.env.TWILIO_PHONE_NUMBER,
    To: data.phoneNumber,
    Body: data.message
  })
});
```

## Security Best Practices

1. **Never commit secret keys** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** for security
4. **Monitor API usage** to detect anomalies
5. **Implement proper error handling** to avoid exposing keys in logs

## Testing Your Integration

### Test Individual Services

1. **Test CoinGecko Integration**:
   ```bash
   node test-coingecko-integration.ts
   ```

2. **Test Payment Services**:
   ```bash
   # Test through the API endpoints
   curl -X POST "http://localhost:5000/api/payments/flutterwave" \
   -H "Content-Type: application/json" \
   -d '{"amount": 1000, "currency": "NGN"}'
   ```

3. **Test SMS Services**:
   ```bash
   # Test through the notification endpoints
   curl -X POST "http://localhost:5000/api/notifications/sms" \
   -H "Content-Type: application/json" \
   -d '{"phoneNumber": "+1234567890", "message": "Test message"}'
   ```

## Troubleshooting

### Common Issues

1. **Keys not found**: Check that environment variables are properly set
2. **API rate limits**: CoinGecko demo keys have strict rate limits
3. **Provider outages**: Implement fallback mechanisms
4. **Network issues**: Add retry logic with exponential backoff

### Debugging Steps

1. **Check environment variables**:
   ```bash
   node scripts/verify-secret-integration.js
   ```

2. **Check service implementations**:
   - [src/services/cryptoService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/src/services/cryptoService.ts)
   - [server/services/paymentService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/paymentService.ts)
   - [server/services/notificationService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/notificationService.ts)

3. **Check logs**:
   ```bash
   # Check application logs for authentication errors
   ```

## Production Deployment

Ensure the environment variables are properly set in your production environment:
- Vercel Environment Variables
- Heroku Config Vars
- Docker Environment Variables
- Kubernetes Secrets

## Next Steps

1. ✅ Deploy the `get-secret` Edge Function to Supabase
2. ✅ Set your actual secret keys in the Supabase Dashboard
3. ✅ Run the retrieval script to update your `.env` file
4. ✅ Verify the integration with the verification script
5. ✅ Test individual services
6. ✅ Deploy to production with proper environment variables