# Fix Guide: CRYPTOAPI and RELOADLY API Integration

## Overview
Both CRYPTOAPI and RELOADLY require environment variables to function. Without them, the services fall back to mock data or disabled features.

---

## Issue #3: CRYPTOAPI Not Working

### Symptoms
- Crypto page shows "Failed to load cryptocurrency data"
- Deposit/withdrawal features not working
- Price feeds not updating

### Root Cause
`CRYPTOAPIS_API_KEY` environment variable not set.

### Solution

#### Step 1: Get CRYPTOAPI Key

1. Go to https://cryptoapis.io
2. Sign up or log in
3. Go to Dashboard → API Keys
4. Copy your API key
5. Keep it secure (never commit to git)

#### Step 2: Set Environment Variable

**For Development:**

Use DevServerControl to set the variable securely:

```
CRYPTOAPIS_API_KEY=your_actual_api_key_here
```

**For Production (Netlify):**

1. Go to Netlify Dashboard → Site settings → Environment
2. Add new variable:
   - Name: `CRYPTOAPIS_API_KEY`
   - Value: `your_actual_api_key`
3. Redeploy

**For Production (Vercel):**

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add new variable:
   - Name: `CRYPTOAPIS_API_KEY`
   - Value: `your_actual_api_key`
3. Redeploy

#### Step 3: Verify

In server logs, you should NOT see:
```
⚠️ CRYPTOAPIS_API_KEY is not set. Crypto features will not work.
```

Test API endpoint:
```bash
curl https://your-app.com/api/crypto/prices
```

Should return JSON with crypto prices, not an error.

#### Step 4: Test Features

1. Go to Crypto page
2. Should show real prices (from CoinGecko or CRYPTOAPI)
3. Deposit page should work
4. Price charts should update

### Verification Checklist

- [ ] API key obtained from cryptoapis.io
- [ ] Environment variable set via DevServerControl
- [ ] Server logs show no "API key not set" warning
- [ ] `/api/crypto/prices` endpoint returns data
- [ ] Crypto page displays prices
- [ ] Deposit features work

---

## Issue #4: RELOADLY Not Working

### Symptoms
- Airtime/Data/Bills pages show "Using demo service providers"
- Wallet features use mock prices
- Admin UIs show mock transactions and operators
- Transactions don't process

### Root Cause
`RELOADLY_API_KEY` and `RELOADLY_API_SECRET` environment variables not set.

### Solution

#### Step 1: Get RELOADLY Credentials

1. Go to https://www.reloadly.com
2. Sign up or log in
3. Go to Dashboard → API Settings or Credentials
4. Copy:
   - `Client ID` (use as RELOADLY_API_KEY)
   - `Client Secret` (use as RELOADLY_API_SECRET)
5. Keep both secure (never commit to git)

#### Step 2: Set Environment Variables

**For Development:**

Use DevServerControl to set both variables securely:

```
RELOADLY_API_KEY=your_client_id_here
RELOADLY_API_SECRET=your_client_secret_here
```

**For Production (Netlify):**

1. Go to Netlify Dashboard → Site settings → Environment
2. Add two variables:
   - Name: `RELOADLY_API_KEY`, Value: `your_client_id`
   - Name: `RELOADLY_API_SECRET`, Value: `your_client_secret`
3. Redeploy

**For Production (Vercel):**

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add two variables:
   - Name: `RELOADLY_API_KEY`, Value: `your_client_id`
   - Name: `RELOADLY_API_SECRET`, Value: `your_client_secret`
3. Redeploy

#### Step 3: Verify API Authentication

Test the authentication endpoint:

```bash
curl -X POST https://auth.reloadly.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your_client_id",
    "client_secret": "your_client_secret",
    "grant_type": "client_credentials",
    "audience": "https://topups.reloadly.com"
  }'
```

Should return an `access_token`, not an error.

#### Step 4: Test Features

**Wallet Features:**

1. Go to Wallet → Airtime
2. Select country (Nigeria)
3. Should fetch real operators (not demo)
4. Select operator and amount
5. Process transaction

**Admin Features:**

1. Go to Admin → Airtime Management
2. Should see real operators list
3. Click "Sync Operators" button
4. Should fetch and display operators from RELOADLY
5. Go to Transactions tab
6. Should show real transaction history

**Available Services:**

- Airtime: `/api/reloadly/airtime/topup`
- Data: `/api/reloadly/data/bundle`
- Bills: `/api/reloadly/bills/pay`
- Gift Cards: `/api/reloadly/gift-cards/purchase`
- Balance: `/api/reloadly/balance`

### Verification Checklist

- [ ] Credentials obtained from reloadly.com
- [ ] Both environment variables set via DevServerControl
- [ ] OAuth token authentication succeeds
- [ ] Wallet pages fetch real operators
- [ ] Admin pages show real data
- [ ] Transactions can be created
- [ ] Commission calculation works

---

## Admin UI Updates

The admin pages have been updated to use real APIs instead of mocks:

**Updated Pages:**
- `src/pages/admin/AdminAirtimeManagement.tsx`
- `src/pages/admin/AdminDataManagement.tsx`
- `src/pages/admin/AdminUtilitiesManagement.tsx`
- `src/pages/admin/AdminGiftCardsManagement.tsx`

**Features:**
- Fetch real operators from RELOADLY
- Fetch real transaction history
- Sync operators button calls API
- Support for multiple countries
- Real commission rates

**How to Use:**

1. Set `RELOADLY_API_KEY` and `RELOADLY_API_SECRET`
2. Go to Admin → Airtime (or Data/Utilities/Gift Cards)
3. Select country
4. Click "Sync Operators"
5. Real operators from RELOADLY will load
6. View transaction history

---

## Implementation Details

### CRYPTOAPI Integration

**Server-side:**
- `server/services/cryptoapisService.ts` - Main client
- `server/services/cryptoService.ts` - Price aggregation
- `server/routes/cryptoapis.ts` - API endpoints
- `server/enhanced-index.ts` - Data sync startup

**Frontend-side:**
- `src/lib/cryptoapis-client.ts` - Client wrapper
- `src/pages/ProfessionalCrypto.tsx` - Main page
- `src/components/crypto/*.tsx` - Components

**Environment Check:**
```javascript
if (!process.env.CRYPTOAPIS_API_KEY) {
  logger.warn('⚠️ CRYPTOAPIS_API_KEY is not set. Crypto features will not work.');
}
```

### RELOADLY Integration

**Server-side:**
- `server/services/reloadlyService.ts` - Main client
- `server/services/reloadlyEnhancedService.ts` - Commission wrapper
- `server/routes/reloadly.ts` - User endpoints
- `server/routes/adminReloadly.ts` - Admin endpoints
- `server/routes/commission.ts` - Commission endpoints

**Frontend-side:**
- `src/pages/wallet/Airtime.tsx` - Airtime page
- `src/pages/wallet/Data.tsx` - Data page
- `src/pages/wallet/Electricity.tsx` - Bills page
- `src/pages/wallet/GiftCards.tsx` - Gift cards page
- Admin management pages (updated)

**Authentication:**
```typescript
body: JSON.stringify({
  client_id: process.env.RELOADLY_API_KEY,
  client_secret: process.env.RELOADLY_API_SECRET,
  grant_type: 'client_credentials',
  audience: 'https://topups.reloadly.com'
})
```

---

## Troubleshooting

### CRYPTOAPI Issues

**Problem:** Crypto page still shows error
- Check server logs for "API key is not set" message
- Verify environment variable is set: `echo $CRYPTOAPIS_API_KEY`
- Restart dev server after setting variable
- Test API key directly at cryptoapis.io

**Problem:** Some crypto features work, others don't
- CRYPTOAPI may have rate limits
- Check Supabase logs for API errors
- Verify API key has permissions for all features

**Problem:** Prices not updating
- Enable `startCryptoDataSync` in `server/enhanced-index.ts`
- Check data sync logs
- Verify CoinGecko is accessible (fallback)

### RELOADLY Issues

**Problem:** Wallet pages still show "Using demo service providers"
- Check server logs for authentication errors
- Verify both `RELOADLY_API_KEY` and `RELOADLY_API_SECRET` are set
- Restart dev server after setting variables
- Test credentials directly: `curl -X POST ...` (see Step 3 above)

**Problem:** Admin sync button doesn't work
- May need to update `adminReloadlyService.syncOperatorsFromReloadly()`
- Ensure `/api/admin/reloadly/operators/sync` endpoint exists
- Check admin auth middleware is working

**Problem:** Transaction processing fails
- Verify user wallet has sufficient balance
- Check commission calculation
- Look for RELOADLY API errors in server logs
- Verify operator ID is correct

### General Troubleshooting

1. **Check environment variables:**
   ```bash
   node -e "console.log('CRYPTOAPIS_API_KEY:', process.env.CRYPTOAPIS_API_KEY ? '✓ SET' : '✗ NOT SET')"
   node -e "console.log('RELOADLY_API_KEY:', process.env.RELOADLY_API_KEY ? '✓ SET' : '✗ NOT SET')"
   ```

2. **Check server logs:**
   - Supabase Dashboard → Logs → Edge Function
   - Dev server console output
   - Browser console (DevTools)

3. **Test API endpoints:**
   ```bash
   curl https://your-app.com/api/crypto/prices
   curl https://your-app.com/api/reloadly/balance -H "Authorization: Bearer token"
   ```

4. **Monitor requests:**
   - Browser DevTools → Network tab
   - Check API request/response details
   - Look for 401/403 errors (auth issues)

---

## Production Deployment Checklist

- [ ] CRYPTOAPIS_API_KEY set in deployment environment
- [ ] RELOADLY_API_KEY set in deployment environment
- [ ] RELOADLY_API_SECRET set in deployment environment
- [ ] All environment variables are secrets (not in code)
- [ ] Test crypto features in staging
- [ ] Test wallet features in staging
- [ ] Test admin features in staging
- [ ] Monitor logs for API errors after deployment
- [ ] Set up alerts for API failures
