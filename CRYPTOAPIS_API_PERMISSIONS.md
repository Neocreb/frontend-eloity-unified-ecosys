# CryptoAPIs API Key Guide

This document outlines how to obtain and configure your CryptoAPIs API key for use in the Eloity Unified Ecosystem platform.

## Getting Your API Key

To get your CryptoAPIs API key:

1. Sign up at https://cryptoapis.io
2. Navigate to Dashboard → API Keys
3. Create a new API key
4. Copy your API Key

## Environment Variables

The following environment variable is used in the application:

```
CRYPTOAPIS_API_KEY=your_cryptoapis_api_key
```

This key is securely retrieved from Supabase Edge Functions and should never be hardcoded or committed to version control.

## Security Best Practices

1. **Limited Permissions**: CryptoAPIs uses API keys for authentication. Ensure you're using the minimum required endpoints.
2. **Regular Rotation**: Rotate API keys periodically (recommended every 90 days)
3. **Monitoring**: Regularly monitor API key usage and set up alerts for unusual activity
4. **Separation of Concerns**: Use separate API keys for different environments (development, staging, production)

## Setup Instructions

1. Sign up for a CryptoAPIs account at https://cryptoapis.io
2. Navigate to the API Keys section in your dashboard
3. Generate a new API key
4. Store the API key securely in your Supabase Edge Function environment variables:
   - `CRYPTOAPIS_API_KEY` - Your CryptoAPIs API Key
5. Deploy the Edge Function to apply the changes

## Troubleshooting

If you encounter authentication errors:

1. Verify your API key is correctly formatted and active
2. Check that the API key has not expired
3. Confirm the API key is correctly stored in Supabase Edge Functions
4. Ensure you're using the correct endpoint URLs

For more information about CryptoAPIs API usage, refer to the official CryptoAPIs documentation at https://docs.cryptoapis.io/.