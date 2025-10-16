# Integration Guide: Supabase Edge Function Secret Keys

## Overview

This guide explains how to integrate secret keys stored in Supabase Edge Functions with the existing services in the platform.

**For detailed instructions on setting up Supabase Edge Functions and retrieving secrets, please see the [Supabase Secret Integration Guide](SUPABASE_SECRET_INTEGRATION_GUIDE.md).**

## Current Implementation Status

### ✅ Already Integrated Services

1. **CoinGecko API**
   - File: [src/services/cryptoService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/src/services/cryptoService.ts)
   - Current key: `CG-ZmDHBa3kaPCNF2a2xg2mA5je` (demo key)
   - Status: Working with mock data fallback

2. **Flutterwave Payment Service**
   - File: [server/services/paymentService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/paymentService.ts)
   - Environment variable: `FLUTTERWAVE_SECRET_KEY`
   - Status: Implemented with production/development switching

3. **Paystack Payment Service**
   - File: [server/services/paymentService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/paymentService.ts)
   - Environment variable: `PAYSTACK_SECRET_KEY`
   - Status: Implemented with production/development switching

4. **Twilio SMS Service**
   - File: [server/services/notificationService.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-2/server/services/notificationService.ts)
   - Environment variables: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
   - Status: Implemented with production/development switching

## How to Access Secret Keys from Supabase Edge Functions

### Option 1: Environment Variables (Recommended)

1. Add the secret keys to your `.env` file:

```env
# Flutterwave
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret-key

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# CoinGecko
COINGECKO_API_KEY=your-coingecko-api-key

# Paystack
PAYSTACK_SECRET_KEY=your-paystack-secret-key
```

2. The existing services will automatically use these keys in production mode.

### Option 2: Supabase Edge Functions

If you want to store and access these keys through Supabase Edge Functions:

1. Create a new Edge Function to retrieve secrets:

```javascript
// supabase/functions/get-secrets/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export default async function handler(req: Request) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Retrieve secrets from Supabase Vault or database
  const { data, error } = await supabase
    .from('secrets')
    .select('key_name, key_value')
    .eq('active', true)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }

  return new Response(
    JSON.stringify({ secrets: data }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
```

2. Update the services to fetch keys from the Edge Function:

```typescript
// Example for crypto service
async function getCoinGeckoApiKey(): Promise<string> {
  if (process.env.NODE_ENV === 'production') {
    // Fetch from Edge Function
    const response = await fetch('/functions/v1/get-secrets');
    const { secrets } = await response.json();
    return secrets.find((s: any) => s.key_name === 'COINGECKO_API_KEY')?.key_value || '';
  } else {
    // Use environment variable for development
    return process.env.COINGECKO_API_KEY || 'demo-key';
  }
}
```

## Integration Steps

### 1. Update Environment Variables

Add the following to your `.env` file:

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

# African SMS Providers
AFRICAS_TALKING_API_KEY=your_actual_africas_talking_api_key
AFRICAS_TALKING_USERNAME=your_actual_africas_talking_username
TERMII_API_KEY=your_actual_termii_api_key
```

### 2. Test the Integration

1. Run the existing test scripts:

```bash
node test-coingecko-integration.ts
```

2. Test payment services through the API endpoints
3. Test SMS services through the notification endpoints

### 3. Verify Production Deployment

Ensure the environment variables are properly set in your production environment (Vercel, Heroku, etc.)

## Security Best Practices

1. **Never commit secret keys** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** for security
4. **Monitor API usage** to detect anomalies
5. **Implement proper error handling** to avoid exposing keys in logs

## Troubleshooting

### Common Issues

1. **Keys not found**: Check that environment variables are properly set
2. **API rate limits**: CoinGecko demo keys have strict rate limits
3. **Provider outages**: Implement fallback mechanisms
4. **Network issues**: Add retry logic with exponential backoff

### Debugging Steps

1. Check environment variables:
   ```bash
   echo $FLUTTERWAVE_SECRET_KEY
   ```

2. Test API connectivity:
   ```bash
   curl -H "Authorization: Bearer $FLUTTERWAVE_SECRET_KEY" \
        https://api.flutterwave.com/v3/payments
   ```

3. Check server logs for error messages

## Next Steps

1. Implement proper error handling and logging
2. Add monitoring and alerting for API usage
3. Implement caching for frequently accessed data
4. Add retry mechanisms with exponential backoff
5. Implement circuit breaker patterns for resilience