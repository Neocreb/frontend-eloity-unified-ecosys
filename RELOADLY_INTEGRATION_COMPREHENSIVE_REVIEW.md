# RELOADLY Integration: Comprehensive Review & Enhancement Plan

## Current State Analysis

### ✅ What's Working
1. **Basic API Integration**
   - Direct RELOADLY API connectivity via OAuth tokens
   - Endpoints for airtime, data, bills, and gift cards
   - Transaction tracking with reference IDs
   - Balance management

2. **Frontend Integration**
   - Components for Airtime, Data, Electricity, Gift Cards purchases
   - Operator fetching from RELOADLY
   - User authentication gating

### ❌ Critical Issues

#### 1. **No Revenue/Commission System**
- **Problem**: Frontend shows hardcoded prices directly from RELOADLY
- **Impact**: No way to mark up prices or earn margins
- **Evidence**: 
  - `src/pages/wallet/Airtime.tsx` has hardcoded amounts: ₦500, ₦1000, ₦2000, etc.
  - No commission calculation between RELOADLY prices and user prices
  - No way for platform to profit from transactions

#### 2. **Direct Price Pass-Through**
- **Problem**: Frontend directly passes user's amount to RELOADLY
- **Impact**: 
  - No pricing flexibility
  - No volume discounts application
  - Can't implement tiered pricing
  - Cannot apply operator-specific markups

#### 3. **No Backend Price Control**
- **Problem**: All pricing logic is frontend-based
- **Impact**:
  - Users can see and manipulate prices (client-side only validation)
  - Cannot enforce pricing rules from backend
  - No audit trail of commission earnings

#### 4. **Missing Commission Infrastructure**
- **Problem**: No commission.ts, no commission service, no database schema
- **Impact**:
  - Cannot track earnings
  - No admin controls for pricing
  - No transaction history for commissions

#### 5. **Transaction Recording Issues**
- **Problem**: Transactions are sent to RELOADLY but not recorded in platform DB
- **Impact**:
  - No way to track user transaction history
  - Cannot dispute transactions
  - No reconciliation mechanism
  - Users can't see their purchase history

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User (Frontend)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Wallet Components          │
        │ - Airtime.tsx                │
        │ - Data.tsx                   │
        │ - Electricity.tsx            │
        │ - GiftCards.tsx              │
        └──────────────┬───────────────┘
                       │
         ┌─────────────┴──────────────┐
         ▼                            ▼
    ┌────────────────────┐   ┌────────────────────┐
    │  /api/reloadly/*   │   │ /api/commission/*  │
    │  (fetch operators) │   │ (calculate prices) │
    └────────────────────┘   └────────────────────┘
         │                            │
         └─────────────┬──────────────┘
                       ▼
        ┌──────────────────────────────┐
        │   Backend Service Layer      │
        │ - reloadlyService            │
        │ - commissionService          │
        │ - transactionService         │
        └──────────────┬───────────────┘
                       │
         ┌─────────────┴──────────────┐
         ▼                            ▼
    ┌────────────────────┐   ┌────────────────────┐
    │  RELOADLY API      │   │   Platform DB      │
    │  - Topups          │   │ - Transactions     │
    │  - Gift Cards      │   │ - Commissions      │
    │  - Operators       │   │ - Commission Rules │
    └────────────────────┘   └────────────────────┘
```

## Implementation Plan

### Phase 1: Database Schema (Priority 1 - Critical)

**Tables to Create:**

1. **reloadly_commission_settings** - Store commission rules
   - service_type: enum (airtime, data, utilities, gift_cards)
   - operator_id: nullable (null = global, number = operator-specific)
   - commission_type: enum (percentage, fixed_amount, none)
   - commission_value: decimal
   - min_amount: decimal (optional)
   - max_amount: decimal (optional)
   - is_active: boolean
   - created_at, updated_at

2. **reloadly_transactions** - Audit trail for all transactions
   - user_id: UUID
   - service_type: string
   - operator_id: number
   - operator_name: string
   - recipient: string (phone/email)
   - amount: decimal (user pays this)
   - reloadly_amount: decimal (platform sends to RELOADLY)
   - commission_earned: decimal
   - commission_rate: decimal
   - status: enum (pending, success, failed)
   - reloadly_transaction_id: string
   - reloadly_reference_id: string
   - metadata: jsonb (any extra data)
   - created_at, updated_at

3. **reloadly_operator_cache** - Cache operator data locally
   - operator_id: number (primary)
   - operator_name: string
   - country_code: string
   - supports_bundles: boolean
   - supports_data: boolean
   - supports_pin: boolean
   - default_commission_rate: decimal
   - senderCurrency: string
   - destinationCurrency: string
   - fx_rate: decimal
   - logo_urls: jsonb
   - last_synced: timestamp

### Phase 2: Backend Services (Priority 1 - Critical)

**1. Commission Service** (`server/services/commissionService.ts`)
- Get commission for service/operator/amount
- Validate commission settings
- Apply commission calculations
- Track commission transactions
- Generate commission reports

**2. Enhanced Reloadly Service** (Extend `reloadlyService.ts`)
- Add transaction recording
- Add commission calculation hook
- Add price adjustment layer
- Cache operators locally

**3. Transaction Service** (New - `server/services/reloadlyTransactionService.ts`)
- Record transactions
- Update transaction status
- Generate transaction history
- Reconcile with RELOADLY

### Phase 3: Backend Routes (Priority 2 - High)

**1. Commission Routes** (`server/routes/commission.ts`)
```
Admin Endpoints:
POST   /api/commission/settings - Create commission rule
GET    /api/commission/settings - Get all rules
GET    /api/commission/settings/:serviceType - Get rules for service
PUT    /api/commission/settings/:settingId - Update rule
DELETE /api/commission/settings/:settingId - Delete rule
GET    /api/commission/operator/:serviceType/:operatorId - Operator-specific rule
POST   /api/commission/sync-operators - Sync operators from RELOADLY

User Endpoints:
POST   /api/commission/calculate - Calculate price for transaction
GET    /api/commission/transactions - Get user's transaction history
GET    /api/commission/transactions/:id - Get transaction details
```

**2. Reloadly Routes Enhancement** (Extend `server/routes/reloadly.ts`)
```
POST /api/reloadly/airtime/topup-with-commission
POST /api/reloadly/data/bundle-with-commission
POST /api/reloadly/bills/pay-with-commission
POST /api/reloadly/gift-cards/purchase-with-commission
```

### Phase 4: Frontend Updates (Priority 2 - High)

1. **Pricing Component** - Fetch prices from `/api/commission/calculate`
2. **Price Display** - Show commission breakdown
3. **Transaction History** - Display from `/api/commission/transactions`
4. **Admin Dashboard** - Manage commission settings

### Phase 5: Admin Features (Priority 3 - Medium)

1. Commission Settings Management UI
2. Transaction Audit Dashboard
3. Operator Sync Controls
4. Revenue Reports
5. Commission Analytics

## Business Model Implementation

### Earning Mechanisms

**Scenario 1: Percentage Commission**
```
User wants to buy ₦1,000 airtime
RELOADLY rate for that operator: 2% commission
Your markup: 5%

Price shown to user: ₦1,050 (₦1,000 × 1.05)
RELOADLY receives: ₦1,000
Commission earned: ₦50
```

**Scenario 2: Fixed Amount Commission**
```
User wants to buy ₦5,000 data
RELOADLY rate: Standard rate
Your markup: ₦50 fixed per transaction

Price shown to user: ₦5,050
RELOADLY receives: ₦5,000
Commission earned: ₦50
```

**Scenario 3: Operator-Specific Rates**
```
Airtel (high volume): 2% commission
MTN (premium): 3% commission
9mobile (slow mover): 1% commission
```

## Production Readiness Checklist

### Database
- [ ] Create migration for reloadly_commission_settings
- [ ] Create migration for reloadly_transactions
- [ ] Create migration for reloadly_operator_cache
- [ ] Set up RLS policies for transaction tables
- [ ] Set up indexes on frequently queried columns

### Backend
- [ ] Implement commissionService.ts
- [ ] Implement reloadlyTransactionService.ts
- [ ] Create commission.ts routes
- [ ] Enhance reloadly.ts routes
- [ ] Add error handling and validation
- [ ] Add transaction logging
- [ ] Add reconciliation mechanism

### Frontend
- [ ] Update Airtime.tsx to use commission API
- [ ] Update Data.tsx to use commission API
- [ ] Update Electricity.tsx to use commission API
- [ ] Update GiftCards.tsx to use commission API
- [ ] Add transaction history views
- [ ] Add error boundary for pricing failures
- [ ] Add loading states

### Admin
- [ ] Create commission settings management page
- [ ] Create transaction audit dashboard
- [ ] Create revenue reports page
- [ ] Add operator sync controls
- [ ] Add analytics dashboard

### Testing
- [ ] Unit tests for commission calculations
- [ ] Integration tests with RELOADLY API
- [ ] E2E tests for purchase flow
- [ ] Load testing for concurrent transactions
- [ ] Reconciliation testing

### Security & Compliance
- [ ] Ensure commission changes are audited
- [ ] Implement transaction verification
- [ ] Add fraud detection for unusual transactions
- [ ] GDPR compliance for transaction data
- [ ] PCI compliance for payment data

## Risk Mitigation

### Issue: RELOADLY API Failures
**Solution**: 
- Cache operator data locally with fallback
- Queue failed transactions for retry
- Notify admin of API outages

### Issue: Commission Calculation Errors
**Solution**:
- Log all calculations for audit
- Reconcile daily with RELOADLY balance
- Manual verification process

### Issue: Race Conditions on Stock
**Solution**:
- Check operator availability before processing
- Queue transactions if stock low
- Auto-refund if transaction fails

## Success Metrics

1. **Revenue Growth**: Track commission earnings
2. **Transaction Volume**: Monitor adoption
3. **Error Rate**: Keep failures < 0.5%
4. **System Uptime**: Maintain > 99.9%
5. **User Satisfaction**: Monitor support tickets
6. **Reconciliation Accuracy**: 100% match with RELOADLY

## Next Steps

1. **Immediate (This Sprint)**:
   - Create database migrations
   - Implement commission service
   - Implement commission routes
   - Add admin endpoints

2. **Near-term (Next Sprint)**:
   - Frontend updates
   - Transaction history view
   - Basic admin dashboard

3. **Medium-term (1-2 Months)**:
   - Advanced pricing rules
   - Subscription-based pricing
   - Geographic pricing
   - Seasonal promotions

4. **Long-term (3+ Months)**:
   - ML-based pricing optimization
   - Competitor price monitoring
   - Dynamic pricing based on demand
   - Volume-based discounts
