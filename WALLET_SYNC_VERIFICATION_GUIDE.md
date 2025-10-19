# Wallet Data Synchronization Verification Guide

## Quick Start: Test the Unified Wallet Endpoint

### 1. Test Balance Aggregation

```bash
# Get a user ID (from your app or database)
USER_ID="your-user-id-here"

# Test the unified balance endpoint
curl -X GET "http://localhost:5002/api/wallet/balance?userId=$USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "data": {
    "balances": {
      "crypto": 1250.50,
      "marketplace": 340.00,
      "freelance": 890.25,
      "rewards": 150.75,
      "referral": 45.00,
      "total": 2676.50
    },
    "userId": "user-id",
    "timestamp": "2024-10-19T12:34:56.789Z"
  }
}
```

### 2. Test Transaction History

```bash
curl -X GET "http://localhost:5002/api/wallet/transactions?userId=$USER_ID&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: Array of transactions from all sources (crypto, marketplace, freelance, rewards)
```

### 3. Test Sources Breakdown

```bash
curl -X GET "http://localhost:5002/api/wallet/sources?userId=$USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response showing percentage breakdown of earnings by source
{
  "success": true,
  "data": {
    "sources": {
      "crypto": { "label": "Cryptocurrency", "amount": 1250.50, "percentage": 46.7 },
      "marketplace": { "label": "Marketplace Sales", "amount": 340.00, "percentage": 12.7 },
      "freelance": { "label": "Freelance Work", "amount": 890.25, "percentage": 33.3 },
      "rewards": { "label": "Rewards & Activity", "amount": 150.75, "percentage": 5.6 },
      "referral": { "label": "Referral Earnings", "amount": 45.00, "percentage": 1.7 }
    },
    "total": 2676.50,
    "userId": "user-id",
    "timestamp": "2024-10-19T12:34:56.789Z"
  }
}
```

---

## Verification Checklist

### Frontend Services
- [ ] `src/services/walletService.ts`
  - ✅ `getWalletBalance()` calls `/api/wallet/balance`
  - ✅ `getTransactions()` calls `/api/wallet/transactions`
  - ✅ `getTransactionHistory()` calls `/api/wallet/transactions`
  - [ ] `recordTransaction()` needs to be implemented or removed
  - [ ] `sendMoney()` needs server endpoint verification

- [ ] `src/services/cryptoService.ts`
  - [ ] Verify `getWalletBalance()` is not used outside of walletService
  - [ ] Check if balance verification still needed
  - [ ] Update `processPayment()` to use wallet API

- [ ] `src/services/marketplaceService.ts`
  - [ ] Remove any direct balance queries
  - [ ] Use wallet context for seller balance

- [ ] `src/services/freelanceService.ts`
  - [ ] Remove freelancer earning calculations
  - [ ] Use wallet context for balance display

- [ ] `src/services/eloitsService.ts`
  - [ ] Integrate point balance with wallet context
  - [ ] Use unified endpoint for point totals

### Frontend Context & Hooks
- [ ] `src/contexts/WalletContext.tsx`
  - Verify it initializes with server data
  - Check refresh mechanism

- [ ] `src/hooks/use-wallet.ts`
  - Verify it uses WalletContext

### Components to Update
- [ ] `src/components/wallet/WalletCard.tsx` - Uses WalletContext
- [ ] `src/components/wallet/UnifiedWalletDashboard.tsx` - Uses WalletContext
- [ ] `src/components/wallet/EnhancedUnifiedWalletDashboard.tsx` - Uses WalletContext
- [ ] `src/components/rewards/RewardsCard.tsx` - Uses WalletContext
- [ ] `src/components/rewards/EarningsOverview.tsx` - Uses WalletContext
- [ ] `src/components/marketplace/EnhancedShoppingCart.tsx` - Uses WalletContext for balance
- [ ] `src/components/freelance/EscrowWalletIntegration.tsx` - Uses WalletContext

### Pages to Update
- [ ] `src/pages/Rewards.tsx` - Uses WalletContext
- [ ] `src/pages/EnhancedCrypto.tsx` - Uses WalletContext
- [ ] `src/pages/wallet/WalletDashboard.tsx` - Uses WalletContext
- [ ] `src/pages/marketplace/MarketplaceDashboard.tsx` - Seller balance from WalletContext
- [ ] `src/pages/freelance/FreelanceDashboard.tsx` - Uses WalletContext

### Server Endpoints to Verify/Implement
- [ ] `GET /api/wallet/balance` - ✅ Implemented
- [ ] `GET /api/wallet/transactions` - ✅ Implemented
- [ ] `GET /api/wallet/sources` - ✅ Implemented
- [ ] `GET /api/wallet/summary` - ✅ Implemented
- [ ] `POST /api/wallet/send` - ⚠️ Missing (needs implementation)
- [ ] `POST /api/wallet/update-crypto-balance` - ⚠️ Missing (needs implementation)
- [ ] `POST /api/creator/reward` - ⚠️ Missing (needs implementation)
- [ ] `GET /api/creator/reward-summary` - ⚠️ Missing (needs implementation)

---

## Data Consistency Checks

### Check 1: Crypto Balance
Compare old vs new endpoint:
```bash
# Old way (direct Supabase, client-side)
supabase.from('wallets').select('*').eq('user_id', userId)

# New way (server aggregation)
curl -X GET "http://localhost:5002/api/wallet/balance?userId=$USER_ID"
# Extract: data.balances.crypto
```

**Expected:** Both return the same total USD value

### Check 2: Marketplace Earnings
Compare old vs new:
```bash
# Old way (client-side)
supabase.from('marketplace_orders')
  .select('total_amount')
  .eq('seller_id', userId)
  .eq('status', 'completed')
  .then(sum all amounts)

# New way
curl -X GET "http://localhost:5002/api/wallet/sources?userId=$USER_ID"
# Extract: data.sources.marketplace.amount
```

**Expected:** Both return the same total

### Check 3: Freelance Earnings
Compare old vs new:
```bash
# Old way (client-side)
supabase.from('freelance_projects')
  .select('budget')
  .eq('freelancer_id', userId)
  .eq('status', 'completed')
  .then(sum all amounts)

# New way
curl -X GET "http://localhost:5002/api/wallet/balance?userId=$USER_ID"
# Extract: data.balances.freelance
```

**Expected:** Both return the same total

### Check 4: Reward Points
Compare old vs new:
```bash
# Old way (client-side)
supabase.from('user_rewards')
  .select('amount')
  .eq('user_id', userId)
  .then(sum all amounts)

# New way
curl -X GET "http://localhost:5002/api/wallet/balance?userId=$USER_ID"
# Extract: data.balances.rewards
```

**Expected:** Both return the same total

### Check 5: Referral Earnings
Compare old vs new:
```bash
# Old way (if it exists)
supabase.from('referral_events')
  .select('reward_amount')
  .eq('referrer_id', userId)
  .then(sum all amounts)

# New way
curl -X GET "http://localhost:5002/api/wallet/balance?userId=$USER_ID"
# Extract: data.balances.referral
```

**Expected:** Both return the same total

---

## Step-by-Step Verification Process

### Phase 1: API Functionality (Do This First)
1. [ ] Start the dev server: `npm run dev`
2. [ ] Verify server logs show wallet router is mounted
3. [ ] Test `/api/wallet/balance` endpoint with a valid userId
4. [ ] Verify the response structure matches the schema above
5. [ ] Test `/api/wallet/transactions` with pagination
6. [ ] Test `/api/wallet/sources` breakdown
7. [ ] Test `/api/wallet/summary` endpoint

### Phase 2: Frontend Integration
1. [ ] Verify `walletService.getWalletBalance()` calls server instead of Supabase
2. [ ] Check `WalletContext` initialization works with new service
3. [ ] Verify `useWallet` hook returns correct balances
4. [ ] Test wallet component displays correct values

### Phase 3: Data Consistency
1. [ ] Get test user with known balances in each module
2. [ ] Run manual checks from "Data Consistency Checks" section above
3. [ ] Verify totals match between old and new approaches
4. [ ] Check transaction history shows all sources
5. [ ] Verify sources breakdown sums to total

### Phase 4: Real-World Testing
1. [ ] Create a test transaction in each module (crypto, marketplace, freelance, rewards)
2. [ ] Verify balance updates immediately in unified endpoint
3. [ ] Check transaction appears in transaction history
4. [ ] Verify UI reflects changes

---

## Common Issues & Troubleshooting

### Issue 1: 404 Error on /api/wallet/balance
**Cause:** Wallet router not mounted
**Fix:** 
- Verify `server/routes/wallet.ts` exists
- Check `server/enhanced-index.ts` imports the wallet router
- Verify `app.use('/api/wallet', walletRouter)` is present
- Restart dev server

### Issue 2: Null or 0 balances returned
**Cause:** Tables not properly referenced or empty data
**Fix:**
- Verify drizzle schema imports in wallet.ts are correct
- Check database tables exist and have data
- Verify userId matches actual users in database
- Check query filters (e.g., status = 'completed') match your data

### Issue 3: Frontend still making Supabase queries
**Cause:** Code changes not applied or cached
**Fix:**
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Verify file changes saved
- Check network tab in DevTools

### Issue 4: Inconsistent balance between modules
**Cause:** Different data sources or calculation methods
**Fix:**
- Run "Data Consistency Checks" for that specific module
- Compare database queries in old vs new approach
- Check for filters like `status = 'completed'` that might differ
- Look for rounding differences in calculations

---

## Performance Metrics

### Before Unification
- Wallet page load: Multiple API calls (~4-5 sequential Supabase queries)
- Balance refresh: Full table scans on client
- Memory usage: Multiple transaction arrays in state

### After Unification
- Wallet page load: Single API call `/api/wallet/balance`
- Balance refresh: Single server query with aggregation
- Memory usage: Single balance object in context

**Target:** 50-70% faster balance updates with unified endpoint

---

## Monitoring & Alerts to Set Up

1. **Balance Query Performance**
   - Alert if `/api/wallet/balance` takes > 500ms
   - Monitor query execution time in database logs

2. **Data Discrepancies**
   - Alert if balance sum doesn't equal component totals
   - Monitor for orphaned transactions (in history but not in balance)

3. **Failed Aggregations**
   - Alert if any source fails during aggregation
   - Log which source(s) failed for debugging

4. **Endpoint Availability**
   - Monitor `/api/wallet/*` endpoint health
   - Alert if endpoints return 500+ errors

---

## Sign-Off Criteria

### ✅ Ready for Production When:
- [ ] All API endpoints responding with correct data
- [ ] All frontend components using unified wallet context
- [ ] Data consistency verified across all modules
- [ ] No direct Supabase queries from walletService
- [ ] Performance meets targets
- [ ] All missing endpoints implemented or removed
- [ ] Edge cases tested (empty balance, large transactions, etc.)
- [ ] Documentation updated

---

## Support Resources

- **Unified Wallet API Spec:** See server/routes/wallet.ts
- **Schema References:** shared/{crypto,freelance,enhanced}-schema.ts
- **Service Implementation:** src/services/walletService.ts
- **Context Usage:** src/contexts/WalletContext.tsx
- **Progress Tracking:** WALLET_UNIFICATION_PROGRESS.md

