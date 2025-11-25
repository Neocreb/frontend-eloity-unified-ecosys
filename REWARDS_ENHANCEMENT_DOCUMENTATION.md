# 🎯 Eloity Rewards Page - Enhancement & Real Data Integration

**Status**: 🔄 IN PROGRESS  
**Last Updated**: 2024-01-20  
**Owner**: Admin  
**Target Completion**: Phase completion tracking below

---

## 📋 Executive Summary

The `/app/rewards` page is being transformed from a **mock-heavy UI** to a **fully data-driven, real-time dashboard** that rivals production platforms like Twitch Creator Dashboard and Patreon. This document tracks the complete enhancement lifecycle.

### Key Objectives
✅ Replace mock data with real Supabase queries  
✅ Implement multi-currency support  
✅ Add real-time streaming with Supabase subscriptions  
✅ Maintain consistent UX with existing Wallet design  
✅ Ensure proper RLS policies for data security  

---

## 🏗️ Architecture Overview

### Current State (Before)
```
Rewards Page
├── Dashboard Tab (100% Mock)
├── Activities Tab (90% Mock)
├── Challenges Tab (60% Real)
├── Battles Tab (70% Real)
├── Gifts & Tips Tab (50% Real)
└── Referrals Tab (10% Real)
```

### Target State (After)
```
Rewards Page (Real-time)
├── Dashboard Tab (Real data + subscriptions)
├── Activities Tab (Live feed + filters)
├── Challenges Tab (Persistent tracking)
├── Battles Tab (Real balances)
├── Gifts & Tips Tab (Complete history)
└── Referrals Tab (Real analytics)
```

---

## 🗄️ Database Schema

### New Tables to Create

#### 1. `activity_transactions` - Core earning events
```sql
CREATE TABLE activity_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  amount_eloits NUMERIC(15,2),
  amount_currency NUMERIC(15,2),
  currency_code VARCHAR(3),
  status VARCHAR(20) DEFAULT 'completed',
  source_id VARCHAR(100),
  source_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX (user_id, created_at DESC),
  INDEX (activity_type)
);
```

**Supported Activity Types:**
- `post_creation` - Content creation earnings
- `engagement` - Views, likes, comments
- `challenge_complete` - Challenge rewards
- `battle_vote` - Battle voting winnings
- `battle_loss` - Battle voting losses
- `gift_received` - Virtual gift value
- `tip_received` - Tips from other users
- `referral_signup` - New referral signup bonus
- `referral_activity` - Activity from referral
- `marketplace_sale` - Marketplace transaction
- `freelance_work` - Freelance completion
- `p2p_trading` - Crypto P2P commission

---

#### 2. `user_rewards_summary` - Denormalized user stats
```sql
CREATE TABLE user_rewards_summary (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_earned NUMERIC(15,2) DEFAULT 0,
  available_balance NUMERIC(15,2) DEFAULT 0,
  total_withdrawn NUMERIC(15,2) DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  trust_score INT DEFAULT 50,
  level INT DEFAULT 1,
  next_level_threshold NUMERIC(15,2),
  currency_code VARCHAR(3) DEFAULT 'USD',
  total_activities INT DEFAULT 0,
  activities_this_month INT DEFAULT 0,
  last_activity_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Performance optimization - denormalized data for quick dashboard loads

---

#### 3. `user_challenges` - Challenge progress tracking
```sql
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  progress INT DEFAULT 0,
  target_value INT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  completion_date TIMESTAMP,
  reward_claimed BOOLEAN DEFAULT FALSE,
  claim_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, challenge_id)
);
```

---

#### 4. `referral_tracking` - Enhanced referral analytics
```sql
CREATE TABLE referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  referral_date TIMESTAMP DEFAULT NOW(),
  first_purchase_date TIMESTAMP,
  earnings_total NUMERIC(15,2) DEFAULT 0,
  earnings_this_month NUMERIC(15,2) DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze',
  auto_share_total NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (referrer_id, referred_user_id)
);
```

---

#### 5. `user_daily_stats` - Daily aggregated statistics
```sql
CREATE TABLE user_daily_stats (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stats_date DATE NOT NULL,
  activities_count INT DEFAULT 0,
  earnings_amount NUMERIC(15,2) DEFAULT 0,
  best_activity_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, stats_date)
);
```

---

## 🔐 Row Level Security (RLS) Policies

All tables require RLS policies to ensure users only see their own data:

```sql
-- activity_transactions
ALTER TABLE activity_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activities" 
  ON activity_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- user_rewards_summary
ALTER TABLE user_rewards_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own summary"
  ON user_rewards_summary FOR SELECT
  USING (auth.uid() = user_id);

-- (Similar policies for other tables)
```

---

## 📦 Service Layer Architecture

### New Services to Create/Update

1. **`activityTransactionService.ts`** - NEW
   - `logActivity(userId, type, amount, metadata)`
   - `getActivityFeed(userId, limit, offset)`
   - `getActivitiesByType(userId, type)`
   - `getActivitiesByDateRange(userId, startDate, endDate)`

2. **`userRewardsSummaryService.ts`** - NEW
   - `getSummary(userId)`
   - `updateSummaryOnActivity(userId)`
   - `calculateTrustScore(userId)`
   - `calculateLevel(userId)`

3. **`rewardsService.ts`** - ENHANCED
   - Refactor to use real tables
   - Aggregate data correctly
   - Cache management

4. **`referralTrackingService.ts`** - NEW
   - `trackReferral(referrerId, referredUserId)`
   - `getReferralStats(userId)`
   - `calculateTierBenefits(userId)`
   - `processAutoShare(referrerId)`

---

## 🎣 React Hooks (Real-time)

### New Hooks to Create

1. **`useActivityFeed(userId, limit)`**
   - Real-time subscription to activity_transactions
   - Automatic updates on new activities
   - Filtering and sorting

2. **`useRewardsSummary(userId)`**
   - Real-time subscription to user_rewards_summary
   - Automatic balance updates
   - Trust score changes

3. **`useReferralStats(userId)`**
   - Real-time referral tracking
   - Earnings updates
   - Tier progression

---

## 🎨 UI/UX Enhancements

### Color Scheme (By Category)
| Category | Color | Hex |
|----------|-------|-----|
| Activities & Engagement | Blue | #3B82F6 |
| Challenges | Purple | #A855F7 |
| Battles | Red | #EF4444 |
| Gifts & Tips | Pink | #EC4899 |
| Referrals | Green | #10B981 |
| Marketplace | Amber | #F59E0B |
| Freelance | Indigo | #6366F1 |

### Design Patterns
- ✅ Skeleton loaders during data fetch
- ✅ Toast notifications for earnings
- ✅ Animated counter updates
- ✅ Empty state illustrations
- ✅ Confetti on milestone achievements
- ✅ Real-time balance updates with animations

---

## 📊 Implementation Phases

### Phase 1: Database Setup ⏳ PENDING
- [ ] Create migration scripts
- [ ] Apply to Supabase
- [ ] Verify table structure
- [ ] Set up RLS policies
- [ ] Create indexes for performance

**Timeline**: 1-2 hours  
**Deliverables**: SQL scripts, migration confirmation

---

### Phase 2: Service Layer ⏳ PENDING
- [ ] Create `activityTransactionService.ts`
- [ ] Create `userRewardsSummaryService.ts`
- [ ] Create `referralTrackingService.ts`
- [ ] Update `rewardsService.ts`
- [ ] Create real-time hooks
- [ ] Add error handling & caching

**Timeline**: 3-4 hours  
**Deliverables**: Service files with full implementation

---

### Phase 3: Component Updates ⏳ PENDING
- [ ] Dashboard - Real balance & stats
- [ ] Activities - Live feed + filters
- [ ] Challenges - Database persistence
- [ ] Battles - Real user balance
- [ ] Gifts & Tips - Verification & enhancement
- [ ] Referrals - Real analytics

**Timeline**: 4-5 hours  
**Deliverables**: Updated component files

---

### Phase 4: Real-time Features ⏳ PENDING
- [ ] Supabase subscriptions setup
- [ ] Toast notifications system
- [ ] Live balance updates
- [ ] Animated transitions
- [ ] Error handling

**Timeline**: 2-3 hours  
**Deliverables**: Working real-time features

---

### Phase 5: Testing & Polish ⏳ PENDING
- [ ] Unit tests for services
- [ ] Component integration tests
- [ ] Real-time sync validation
- [ ] Performance optimization
- [ ] Edge case handling
- [ ] Documentation update

**Timeline**: 2-3 hours  
**Deliverables**: Tested, production-ready code

---

## 📝 Tab-by-Tab Enhancement Details

### Dashboard Tab

**Current Issues:**
- All values hardcoded as props
- No real user data
- No balance tracking

**Implementation:**
```typescript
// Will use: useRewardsSummary(userId)
// Query: user_rewards_summary table
// Real-time: Supabase subscription to balance changes
// Display: Total earned, available balance, trust score, level, activity count
```

**Progress**: ⏳ Pending

---

### Activities Tab

**Current Issues:**
- `enhancedActivities` array is hardcoded
- No database queries
- Filtering is on mock data

**Implementation:**
```typescript
// Will use: useActivityFeed(userId)
// Query: activity_transactions table
// Real-time: Subscribe to new activities
// Features: Search, filter by type, date range, sorting
```

**Progress**: ⏳ Pending

---

### Challenges Tab

**Current State:**
- Service exists (`rewardsChallengesService`)
- Needs database persistence

**Implementation:**
```typescript
// Create: user_challenges table
// Track: progress, completion date, reward_claimed
// Validate: Server-side verification before reward claim
```

**Progress**: ⏳ Pending

---

### Battles Tab

**Current State:**
- 70% real (uses service)
- Issue: Balance hardcoded to 2500

**Implementation:**
```typescript
// Fix: Query real user balance from wallet
// Use: Active user's current Eloits balance
// Real-time: Subscribe to balance changes
```

**Progress**: ⏳ Pending

---

### Gifts & Tips Tab

**Current State:**
- 50% real
- Depends on `virtualGiftsService`

**Implementation:**
```typescript
// Verify: virtualGiftsService queries real data
// Enhance: Complete transaction history
// Add: Recipient filtering, amount ranges
```

**Progress**: ⏳ Pending

---

### Referrals Tab

**Current Issues:**
- 100% hardcoded data
- All activity is fake

**Implementation:**
```typescript
// Create: referral_tracking table
// Track: Referral conversions, earnings, tier progression
// Real-time: Auto-share calculations
// Display: Real referral links with unique codes
```

**Progress**: ⏳ Pending

---

## 💾 Database Migration Scripts

### Script 1: Create Core Tables
**File**: `scripts/database/create-rewards-tables.sql`  
**Status**: 📝 To be generated  
**Includes**:
- activity_transactions table
- user_rewards_summary table
- user_challenges table
- referral_tracking table
- user_daily_stats table
- All indexes and constraints

---

### Script 2: Set up RLS Policies
**File**: `scripts/database/setup-rewards-rls.sql`  
**Status**: 📝 To be generated  
**Includes**:
- Enable RLS on all tables
- Create view policies
- Insert/update policies (service role only)

---

### Script 3: Add Triggers (Optional)
**File**: `scripts/database/setup-rewards-triggers.sql`  
**Status**: 📝 To be generated  
**Includes**:
- Auto-update `updated_at` timestamps
- Cascade updates to `user_rewards_summary`
- Aggregate daily stats

---

## 🔄 Real-time Subscription Strategy

### Supabase Realtime Setup

1. **Dashboard Balance Updates**
   ```typescript
   // Subscribe to user_rewards_summary changes
   // Update displayed balance instantly
   // Show toast notification on change
   ```

2. **Activity Feed**
   ```typescript
   // Subscribe to activity_transactions for user_id
   // New activities appear at top of feed
   // Real-time counter updates
   ```

3. **Challenge Progress**
   ```typescript
   // Subscribe to user_challenges
   // Progress bars update in real-time
   // Celebrate completion with animation
   ```

---

## 📋 File Manifest

### New Files to Create

| File | Purpose | Status |
|------|---------|--------|
| `scripts/database/create-rewards-tables.sql` | Database schema | 📝 Pending |
| `scripts/database/setup-rewards-rls.sql` | RLS policies | 📝 Pending |
| `src/services/activityTransactionService.ts` | Activity logging & queries | 📝 Pending |
| `src/services/userRewardsSummaryService.ts` | Summary calculations | 📝 Pending |
| `src/services/referralTrackingService.ts` | Referral management | 📝 Pending |
| `src/hooks/useActivityFeed.ts` | Real-time activities | 📝 Pending |
| `src/hooks/useRewardsSummary.ts` | Real-time balance | 📝 Pending |
| `src/hooks/useReferralStats.ts` | Real-time referrals | 📝 Pending |

### Files to Modify

| File | Changes | Status |
|------|---------|--------|
| `src/pages/Rewards.tsx` | Main container updates | 📝 Pending |
| `src/components/rewards/RewardsHeader.tsx` | Real data binding | 📝 Pending |
| `src/components/rewards/EarningsOverview.tsx` | Dashboard real data | 📝 Pending |
| `src/components/rewards/RewardsActivitiesTab.tsx` | Live feed integration | 📝 Pending |
| `src/components/rewards/RewardsChallengesTab.tsx` | DB persistence | 📝 Pending |
| `src/components/rewards/RewardsBattleTab.tsx` | Real balance | 📝 Pending |
| `src/components/rewards/GiftsTipsAnalytics.tsx` | Verification & enhance | 📝 Pending |
| `src/components/rewards/SafeReferralComponent.tsx` | Real analytics | 📝 Pending |
| `src/services/rewardsService.ts` | Refactor for real data | 📝 Pending |

---

## 🚀 Getting Started Checklist

- [ ] Review this documentation
- [ ] Approve database schema
- [ ] Confirm currency strategy (Multi-currency selected ✅)
- [ ] Confirm real-time streaming (Selected ✅)
- [ ] Run Phase 1 (Database setup)
- [ ] Run Phase 2 (Services)
- [ ] Run Phase 3 (Components)
- [ ] Run Phase 4 (Real-time)
- [ ] Run Phase 5 (Testing)
- [ ] Deploy to production

---

## 🔗 Related Documents

- Design System: `/design-system-docs/` (if available)
- Wallet Implementation: `src/pages/wallet/` (reference for UI patterns)
- Supabase Docs: https://supabase.com/docs
- Database Schema: See above sections

---

## 📞 Support & Questions

For implementation questions or issues, refer to:
1. Supabase documentation for RLS policies
2. React hooks documentation for subscription patterns
3. Existing reward services for integration patterns
4. Design system for component styling

---

## 🎯 Success Criteria

✅ All mock data replaced with real Supabase queries  
✅ Real-time updates working without page refresh  
✅ Multi-currency support functional  
✅ All 6 tabs showing real data  
✅ RLS policies preventing data leaks  
✅ Performance optimized (< 2s page load)  
✅ No console errors or warnings  
✅ Responsive design on mobile & desktop  

---

**Last Updated**: 2024-01-20  
**Next Review**: After Phase 1 completion
