# Immediate Action Plan - Mock Data Removal

## Priority Order for Implementation

Based on the BACKEND_IMPLEMENTATION_GUIDE.md and current codebase analysis, here's the recommended order of implementation to get the platform production-ready:

## 🔴 CRITICAL - Start Immediately (Days 1-3)

### 1. Authentication System (Highest Impact)
**Why Critical**: Users cannot use the platform without real authentication
**Current Issue**: AuthContext returns mock user, no real session management
**Files to Fix**:
- `src/contexts/AuthContext.tsx` - Replace mock user with real API calls
- `server/middleware/auth.ts` - Verify JWT implementation
- `server/routes/auth.ts` - Test all auth endpoints

**Implementation Steps**:
```typescript
// 1. Update AuthContext to call real backend
const login = async (email: string, password: string) => {
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  setUser(data.user);
  return data;
};
```

**Required Environment Variables**:
- `VITE_BACKEND_URL` - Backend API URL
- `JWT_SECRET` - On backend
- `SESSION_SECRET` - On backend

---

### 2. Chat & Messaging (User Retention)
**Why Critical**: Real-time communication is core feature
**Current Issue**: All data stored in memory (mockThreads, mockMessages)
**Files to Fix**:
- `src/services/chatService.ts` - Replace ALL mock arrays
- `src/services/messagingService.ts` - Connect to Supabase
- `server/routes/chat.ts` - Verify WebSocket server

**Database Tables Needed**:
```sql
-- Verify these tables exist in Supabase:
- chat_threads
- chat_messages
- chat_participants
- message_attachments
```

**Implementation Priority**:
1. Connect to Supabase tables
2. Replace mock data queries
3. Setup realtime subscriptions
4. Implement file upload to S3
5. Test WebSocket connections

---

### 3. Feed & Social (Core Platform)
**Why Critical**: Main user interaction area
**Current Issue**: Some queries work, but has fallback to mock
**Files to Fix**:
- `src/services/feedService.ts` - Remove mock fallbacks
- `src/services/realtimeFeedService.ts` - Ensure realtime works
- `src/hooks/use-feed.ts` - Verify all queries

**Required Actions**:
1. Remove all "mock" references
2. Test post creation end-to-end
3. Verify likes/comments work
4. Check realtime updates
5. Test image uploads

---

## 🟡 HIGH PRIORITY - Week 1

### 4. Crypto Prices & Wallet (Revenue)
**Why Important**: Users need real wallet balances and prices
**Current Issue**: Mock prices, mock portfolio
**Files to Fix**:
- `src/services/cryptoService.ts` - CoinGecko integration
- `src/services/walletService.ts` - Real balance queries
- `src/services/realtimeCryptoService.ts` - Live price updates

**Implementation**:
```typescript
// Already has CoinGecko placeholder, just enable it:
async getCryptocurrencies() {
  // Remove mock fallback, use only:
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false'
  );
  return await response.json();
}
```

**Required**:
- CoinGecko API key (free tier available)
- Database wallet tables
- Transaction recording

---

### 5. Marketplace Products (Revenue)
**Why Important**: E-commerce functionality
**Current Issue**: Mock products and orders
**Files to Fix**:
- `src/services/marketplaceService.ts`
- `server/routes/marketplace.ts`
- Verify database tables exist

**Database Schema Required**:
```sql
-- Verify these exist:
- marketplace_products
- marketplace_orders
- marketplace_categories
- product_images
- product_reviews
```

---

### 6. Payment Processing (Critical for Revenue)
**Why Important**: Cannot process real transactions
**Current Issue**: Returns mock responses in development
**Files to Fix**:
- `server/services/paymentService.ts` - Remove NODE_ENV checks
- `server/routes/payments.ts` - Implement webhooks

**Required API Keys**:
- `FLUTTERWAVE_SECRET_KEY`
- `FLUTTERWAVE_SECRET_HASH`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`

**Testing Plan**:
1. Use sandbox credentials first
2. Test webhook callbacks
3. Verify transaction recording
4. Test refund flows
5. Production credentials last

---

## 🟢 MEDIUM PRIORITY - Week 2

### 7. Freelance & Escrow
**Files**: `src/services/freelanceService.ts`, `src/services/escrowService.ts`
**Action**: Create database tables, implement milestone payments

### 8. KYC Integration
**Files**: `server/services/kycService.ts`
**Action**: Integrate Smile Identity, setup webhooks

### 9. Notifications
**Files**: `server/services/notificationService.ts`
**Action**: Configure SMS/email providers

### 10. Video Streaming
**Files**: `src/services/liveStreamingService.ts`
**Action**: Setup S3 storage, RTMP server

---

## 🔵 LOWER PRIORITY - Week 3+

### 11. Stories Feature
### 12. Courses System
### 13. Social Commerce Recommendations
### 14. Global Search (Algolia/Elasticsearch)
### 15. Advanced Analytics

---

## Quick Win Strategy (First 48 Hours)

Start with these for immediate impact:

### Day 1 Morning: Authentication
- [ ] Fix AuthContext to use real API
- [ ] Test login/logout/signup
- [ ] Verify session persistence

### Day 1 Afternoon: Feed
- [ ] Remove feedService mock fallbacks
- [ ] Test post creation
- [ ] Verify realtime updates work

### Day 2 Morning: Chat
- [ ] Connect chatService to database
- [ ] Replace mock arrays
- [ ] Test message sending

### Day 2 Afternoon: Crypto Prices
- [ ] Enable CoinGecko API
- [ ] Remove mock prices
- [ ] Test wallet balances

---

## Environment Setup Checklist

Before starting, ensure these are configured:

### Backend (.env)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=<generate-secure>
SESSION_SECRET=<generate-secure>
BACKEND_URL=https://your-backend.com
FRONTEND_URL=https://your-frontend.com

# Payment Providers (sandbox first)
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
PAYSTACK_SECRET_KEY=sk_test_...

# Notifications
TERMII_API_KEY=...
SENDGRID_API_KEY=...
```

### Frontend (.env.local)
```bash
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_BACKEND_URL=http://localhost:5002
```

---

## Testing Strategy

For each service migration:

1. **Unit Tests**
   ```bash
   npm test -- <service-name>
   ```

2. **Integration Test**
   - Create test data
   - Call service methods
   - Verify database changes
   - Check API responses

3. **Manual QA**
   - Test in UI
   - Check edge cases
   - Verify error handling

4. **Performance Test**
   - Load test critical paths
   - Check query performance
   - Monitor response times

---

## Risk Mitigation

### Feature Flags
Add environment variable to control rollout:
```typescript
const USE_REAL_DATA = import.meta.env.VITE_USE_REAL_DATA === 'true';

if (USE_REAL_DATA) {
  // Use real API
} else {
  // Use mock (for testing)
}
```

### Gradual Rollout
1. Deploy with feature flags OFF
2. Test in staging with real data
3. Enable for small % of users
4. Monitor errors/performance
5. Gradually increase to 100%

### Rollback Plan
- Keep mock code in separate files
- Use git tags for each phase
- Document rollback steps
- Maintain database backups

---

## Success Metrics

Track these to measure migration success:

- [ ] Authentication: 100% real users, 0% mock
- [ ] Chat: All messages in database
- [ ] Feed: Real posts with engagement
- [ ] Payments: Successful test transactions
- [ ] Crypto: Live price updates
- [ ] Performance: <500ms API response times
- [ ] Errors: <1% error rate
- [ ] User Satisfaction: >4.5 rating

---

## Next Steps

**Immediate (TODAY)**:
1. Review this plan with team
2. Setup all environment variables
3. Verify database schema is complete
4. Choose which service to start with

**Recommended Start**: Authentication (AuthContext)
- Most critical
- Affects all other features
- Quick to implement
- High user impact

Would you like me to start implementing the Authentication system first?
