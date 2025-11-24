# Eloity Addons: Two-Tier System Implementation Guide

**Platform**: Eloity (Facebook/Twitter/TikTok/Binance/Amazon hybrid)  
**Strategy**: Freemium Social-First with Progressive Gate  
**Start Date**: 2024  
**Status**: 🚀 In Progress

---

## 📋 Executive Summary

This document outlines the implementation of Eloity's two-tier monetization and access control system. The strategy removes barriers to entry while gating high-risk financial features, enabling explosive user growth and sustainable revenue.

### Key Metrics (Target)
- **Day 1 DAU**: 10x higher than KYC-first approach
- **KYC Conversion**: 35-50% (users verify after earning)
- **Revenue per User**: Tier 1: $1-3, Tier 2: $15-50/year
- **Pioneer Badge**: First 100 users → auto-grant 1-year premium

---

## 🎯 System Architecture

### Tier Definitions

#### **TIER 1 (Unverified) → "Experience Everything"**
```
✅ Access:
   - Full social features (post, create, engage)
   - Marketplace: browse & buy only
   - Crypto: view prices, learn, NO trading
   - Freelance: browse & apply
   - Earn tokens from engagement

❌ Blocked:
   - Withdrawals (earnings held until KYC)
   - Selling on marketplace
   - Crypto trading & P2P
   - Creator monetization payouts
   - Freelancer income collection
```

#### **TIER 2 (KYC Verified) → "Unlock Monetization"**
```
✅ Access:
   - All TIER 1 features
   - Seller dashboard & product listing
   - Crypto trading & P2P transactions
   - Creator withdrawal system
   - Freelancer income payouts
   - Verification badges (optional paid add-ons)

💳 Monetization:
   - Marketplace withdrawal (1-3% fee)
   - Crypto trading (0.1-0.5% fee)
   - Creator payouts (2-5% fee)
   - Premium subscription ($4.99-9.99/mo)
```

### Revenue Model

#### **TIER 1 Revenue** (Before KYC)
| Source | Margin | Priority |
|--------|--------|----------|
| Ad revenue (feed/marketplace) | 100% | 🔴 High |
| Cosmetic purchases (themes, boosts) | 80% | 🟡 Medium |
| Tip tokens (collected at T2 withdrawal) | 0-20% | 🟡 Medium |
| Pioneer badge premium bonus | 100% | 🟢 Low |

#### **TIER 2 Revenue** (After KYC)
| Source | Margin | Priority |
|--------|--------|----------|
| Withdrawal fees (0.5-2%) | 100% | 🔴 High |
| Seller fees (1-3%) | 100% | 🔴 High |
| Trading fees (0.1-0.5%) | 100% | 🔴 High |
| Premium subscription | 70-80% | 🟡 Medium |
| Badge bundles (3x badge discount) | 60-70% | 🟢 Low |

---

## 📊 Implementation Roadmap

### Phase 1: MVP Core Infrastructure (Current)
**Status**: 🚀 In Progress  
**Timeline**: Week 1-2  
**Goal**: Enable tier-based access control for all features

#### 1.1 Database Schema Updates
**Status**: ⏳ Pending

**New Tables/Columns**:
```sql
-- Add to profiles table
ALTER TABLE profiles ADD COLUMN tier_level TEXT DEFAULT 'tier_1';
ALTER TABLE profiles ADD COLUMN kyc_trigger_reason TEXT;

-- New feature_gates table
CREATE TABLE feature_gates (
  id UUID PRIMARY KEY,
  feature_name TEXT NOT NULL,
  tier_1_access BOOLEAN,
  tier_2_access BOOLEAN,
  requires_kyc BOOLEAN,
  created_at TIMESTAMP
);

-- New tier_access_history table (audit)
CREATE TABLE tier_access_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id),
  from_tier TEXT,
  to_tier TEXT,
  kyc_verified_at TIMESTAMP,
  action_type TEXT,
  created_at TIMESTAMP
);
```

**Feature Gates Configuration**:
```json
{
  "features": {
    "social_posting": {"tier_1": true, "tier_2": true, "requires_kyc": false},
    "marketplace_sell": {"tier_1": false, "tier_2": true, "requires_kyc": true},
    "crypto_trade": {"tier_1": false, "tier_2": true, "requires_kyc": true},
    "crypto_view": {"tier_1": true, "tier_2": true, "requires_kyc": false},
    "freelance_apply": {"tier_1": true, "tier_2": true, "requires_kyc": false},
    "freelance_offer": {"tier_1": false, "tier_2": true, "requires_kyc": true},
    "withdraw_earnings": {"tier_1": false, "tier_2": true, "requires_kyc": true},
    "creator_fund": {"tier_1": false, "tier_2": true, "requires_kyc": true}
  }
}
```

#### 1.2 Access Control Middleware
**Status**: ⏳ Pending

**Implementation Location**: `server/middleware/tierAccessControl.ts`

**Features**:
- Check user tier before feature access
- Enforce KYC requirements
- Log access attempts for audit
- Return helpful error messages to direct users to KYC

#### 1.3 Feature Gates Implementation
**Status**: ⏳ Pending

**Routes to Gate**:
- POST `/api/crypto/trade` → Tier 2 only
- POST `/api/marketplace/products` → Tier 2 only
- GET `/api/freelance/offers` → Tier 2 only
- POST `/api/withdraw` → Tier 2 only
- POST `/api/creator/payout` → Tier 2 only

#### 1.4 Pioneer Badge System Update
**Status**: ⏳ Pending

**Changes**:
- Reduce slots from 500 → 100
- Auto-grant 1-year premium to first 100 claimants
- Create exclusive "Pioneers" group
- Update database schema to track `pioneer_premium_expiry`
- Add claim deadline (optional: 30 days from signup)

#### 1.5 KYC Trigger Modal
**Status**: ⏳ Pending

**Component**: `src/components/modals/KYCTriggerModal.tsx`

**Trigger Points**:
- User tries to sell a product → "Enable seller features"
- User tries to trade crypto → "Unlock crypto trading"
- User tries to withdraw earnings → "Verify to withdraw"
- User clicks freelancer dashboard → "Complete verification"

---

### Phase 2: Monetization Features (Week 3-4)
**Status**: ⏳ Pending

#### 2.1 Premium Subscription UI
- Subscription management dashboard
- Plan selection (Creator, Professional, Enterprise tiers)
- Billing portal integration

#### 2.2 Badge Marketplace
- Buy individual badges (Freelance, E-commerce, Crypto)
- Bundle discounts (3x badges = 20% off)
- Auto-enable features based on badge purchase

#### 2.3 Withdrawal Fee Enforcement
- Automatic fee deduction at payout
- Display fee breakdown to users
- Track fee revenue by category

---

### Phase 3: Growth & Engagement (Ongoing)
**Status**: ⏳ Pending

#### 3.1 Referral Bonus System
- Referred users get early KYC opportunity
- Bonus tokens for both referrer & referee
- Unlock premium features early with referral bonus

#### 3.2 Creator Fund Boost
- Tier 2 creators get 1.5x earnings multiplier for first month
- Seasonal promotions (free badge trials, discounts)

---

## 🔧 Technical Specifications

### Database Schema Changes

**File**: `shared/enhanced-schema.ts`

```typescript
// Tier definitions enum
export const TIER_LEVELS = {
  TIER_1_UNVERIFIED: 'tier_1',
  TIER_2_KYC_VERIFIED: 'tier_2'
};

// Add to profiles table
profiles.tier_level: text default 'tier_1'
profiles.kyc_trigger_reason: text // (e.g., 'sell_product', 'trade_crypto')
profiles.tier_upgraded_at: timestamp // When user completed KYC

// Add to pioneer_badges table
pioneer_badges.premium_granted: boolean default true
pioneer_badges.premium_expiry: timestamp // 1 year from claim
```

### Middleware Implementation

**File**: `server/middleware/tierAccessControl.ts`

```typescript
export async function checkTierAccess(
  req: Express.Request,
  feature: string
): Promise<boolean> {
  const userId = req.user?.id;
  const userProfile = await getProfile(userId);
  
  // Check if feature requires KYC
  if (featureRequiresKYC(feature) && userProfile.tier_level === 'tier_1') {
    throw new KYCRequiredError(
      `${feature} is only available for verified users`
    );
  }
  
  return true;
}
```

---

## 🚨 Compliance & Security

### KYC Verification Levels
- **Tier 1**: Email only
- **Tier 2**: 
  - Government ID (crypto/seller requires)
  - Proof of address
  - Biometrics (optional)

### Regulatory Considerations
- **Crypto Trading**: KYC mandatory before first trade
- **Marketplace Selling**: Lighter KYC (ID + address)
- **Freelance Gigs**: Profile verification only (no KYC)
- **Withdrawal**: All withdrawals require full KYC

### Data Privacy
- Tier access changes logged in `tier_access_history`
- KYC data stored separately in secure vault
- Compliance audit trail maintained for 7 years

---

## 📈 Success Metrics (Post-Launch)

| Metric | Target | Timeline |
|--------|--------|----------|
| Tier 1 users | 100k | Month 1 |
| KYC conversion | 35% (35k T2 users) | Month 3 |
| Pioneer badge claims | 100/100 | Week 1 |
| Premium subscription rate | 10% of T2 | Month 3 |
| Monthly revenue (T1) | $50k (ads) | Month 3 |
| Monthly revenue (T2) | $100k (fees + subs) | Month 3 |

---

## 📝 Implementation Checklist

### Phase 1 (Current)
- [ ] Update database schema (tier_level, feature_gates, tier_access_history)
- [ ] Implement tierAccessControl middleware
- [ ] Gate crypto trading endpoints
- [ ] Gate marketplace seller features
- [ ] Gate withdrawal/payout endpoints
- [ ] Update pioneer badge (500 → 100, auto-grant premium)
- [ ] Build KYC trigger modal
- [ ] Create feature gates configuration service
- [ ] Add unit tests for tier validation

### Phase 2
- [ ] Build premium subscription UI
- [ ] Integrate Stripe/payment processor
- [ ] Implement badge marketplace
- [ ] Add withdrawal fee logic
- [ ] Create subscription management dashboard

### Phase 3
- [ ] Referral system API
- [ ] Creator fund multiplier logic
- [ ] Analytics & reporting for tiers
- [ ] A/B testing framework

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `shared/enhanced-schema.ts` | Database schema definitions |
| `server/middleware/auth.ts` | Authentication middleware |
| `server/middleware/tierAccessControl.ts` | NEW - Tier validation |
| `src/contexts/AuthContext.tsx` | User state management |
| `src/components/kyc/EnhancedKYCVerification.tsx` | KYC component |
| `src/services/premiumService.ts` | Premium features logic |
| `src/services/pioneerBadgeService.ts` | Pioneer badge logic |

---

## 📞 Contact & Questions

- **Product Owner**: @elopaxxtasa
- **Implementation Lead**: Fusion AI
- **Last Updated**: [AUTO-UPDATED AFTER EACH PHASE]

---

**🚀 STATUS: Phase 1.1 Database Schema - Starting Implementation**
