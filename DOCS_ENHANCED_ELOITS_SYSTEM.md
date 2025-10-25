# Enhanced Eloits Reward Token System (ELO)

## Overview

The Enhanced Eloits Reward Token System is a comprehensive, modular reward system that combines a flexible reward engine, a transparent trust score mechanism, and a tiered redemption system. It's designed to encourage quality engagement, limit abuse through trust decay and anti-spam logic, and enable tiered, manageable payouts for early users.

## Core Components

### 1. Core Token Structure

- **ELOITS (ELO)**: Virtual currency stored in users' reward wallets
- **Off-chain & Admin-mintable**: Balance tracking in database
- **Configurable Conversion Rate**: Default 1000 ELO = $1.00
- **Payout Modes**: Manual or Automated
- **Tier-based System**: Bronze, Silver, Gold, Platinum, Diamond

### 2. Reward Rule Engine

The system stores reward activities in a database table with the following structure:

```sql
CREATE TABLE reward_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    base_eloits NUMERIC(10,2) NOT NULL,
    base_wallet_bonus NUMERIC(20,8) DEFAULT '0',
    currency TEXT DEFAULT 'USDT',
    daily_limit INTEGER,
    weekly_limit INTEGER,
    monthly_limit INTEGER,
    minimum_trust_score NUMERIC(5,2) DEFAULT '0',
    minimum_value NUMERIC(15,2),
    decay_enabled BOOLEAN DEFAULT true,
    decay_start INTEGER DEFAULT 1,
    decay_rate NUMERIC(5,4) DEFAULT '0.1',
    min_multiplier NUMERIC(3,2) DEFAULT '0.1',
    requires_moderation BOOLEAN DEFAULT false,
    quality_threshold NUMERIC(3,2) DEFAULT '0',
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    active_from TIMESTAMP WITH TIME ZONE,
    active_to TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    last_modified_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Trust Score Mechanism

Trust Score ranges from 0-100 and is updated dynamically based on:

- Engagement quality (likes/comments received on posts)
- Average watch/read time
- Report count (negative impact)
- Spam flag triggers (negative impact)
- Referral legitimacy (positive or negative)
- Profile completeness (positive)
- Login consistency (positive)
- Peer validation or verified transactions (positive)

#### Formula Example:
```
trust_score = (quality_engagements * 0.4) + (consistency * 0.2) + (peer_validations * 0.2) - (spam_flags * 0.2)
```

#### Decay Rate:
- Daily decay of 1-3 points if user inactivity exceeds 7 days
- Rapid decay (up to 10 points) for repeated spam or low-quality posts
- Decay is reversible through consistent quality activity

### 4. Tiered Redemption System

| Tier         | Eloits Range    | Monthly Withdrawal Limit | Exclusive Rewards                    |
| ------------ | --------------- | ------------------------ | ------------------------------------ |
| **Bronze**   | 0–5,000         | $5 or equivalent         | Access to basic ads                  |
| **Silver**   | 5,001–20,000    | $10                      | Early creator tools                  |
| **Gold**     | 20,001–100,000  | $25                      | Premium analytics                    |
| **Platinum** | 100,001–500,000 | $50                      | NFT access or priority ad share      |
| **Diamond**  | 500,001+        | $100+                    | Lifetime premium status, brand deals |

### 5. Marketplace Rewards

#### Purchase Reward:
- 10 ELO + (1% of purchase amount in ELO)
- Example: ₦10,000 purchase = 10 + 100 ELO bonus
- Maximum daily bonus = 200 ELO

#### Product Sold Reward:
- Flat 750 ELO plus tier multiplier

### 6. Referral & Multi-Level Structure

#### Verification:
Reward is credited only after:
- Referred user completes their profile
- Performs at least one verified action (purchase, post, or login streak of 3 days)

#### Rewards:
| Referral Action                          | Reward        |
| ---------------------------------------- | ------------- |
| **Refer Friend**                         | 1000 ELO      |
| **Referral Signup (verified)**           | 500 ELO       |
| **Referral's First Purchase**            | 1500 ELO      |
| **Tier 2 Referral (friend of referral)** | 100 ELO bonus |
| **Tier 3 Referral**                      | 50 ELO bonus  |

#### Multi-Level Limiter:
- Max of 3 levels of referral depth
- Rewards only propagate if all upstream referrals are verified users

### 7. Decay & Anti-Spam Logic

#### Decay Factor:
- `decay_factor` (0.7–0.95) reduces reward multiplier for repetitive or low-engagement actions
- Example: After 10 low-quality posts, reward effectiveness = `base_reward * decay_factor`

#### Anti-Spam Triggers:
- IP repetition: >5 accounts from same IP
- Post frequency: >30 posts/day with low engagement
- Engagement pattern: >90% likes/comments from same users

#### Flag Consequences:
- Temporary freeze on rewards
- Trust score reduction
- Warning notification to user

## Implementation Details

### Database Tables

| Table           | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `users`         | Contains eloits_balance, trust_score, tier, referral_code |
| `reward_rules`  | Defines all activity rewards                              |
| `user_rewards`  | Stores earned reward logs                                 |
| `referrals`     | Tracks referral hierarchy and status                      |
| `redemptions`   | Logs withdrawal requests and approvals                    |
| `trust_history` | Tracks trust score changes over time                      |
| `system_config` | Stores configurable system parameters                     |

### API Endpoints

#### User Endpoints:
- `GET /api/enhanced-rewards/user/:userId` - Get user's reward data
- `GET /api/enhanced-rewards/user/:userId/transactions` - Get transaction history
- `GET /api/enhanced-rewards/user/:userId/trust-history` - Get trust history
- `GET /api/enhanced-rewards/user/:userId/referrals` - Get referrals
- `GET /api/enhanced-rewards/user/:userId/redemptions` - Get redemptions
- `POST /api/enhanced-rewards/award-points` - Award points for activity
- `POST /api/enhanced-rewards/update-trust-score` - Update trust score
- `POST /api/enhanced-rewards/request-redemption` - Request redemption
- `POST /api/enhanced-rewards/process-referral` - Process referral

#### Admin Endpoints:
- `GET /api/enhanced-rewards/admin/config` - Get system configuration
- `POST /api/enhanced-rewards/admin/config` - Update system configuration
- `GET /api/enhanced-rewards/admin/reward-rules` - Get reward rules
- `GET /api/enhanced-rewards/admin/redemptions` - Get all redemptions
- `PATCH /api/enhanced-rewards/admin/redemptions/:redemptionId` - Update redemption status

### Frontend Integration

#### React Hook Usage:
```typescript
import { useEnhancedEloits } from '@/hooks/useEnhancedEloits';

const MyComponent = () => {
  const { 
    userEloitsData, 
    transactions, 
    trustHistory, 
    loading, 
    error,
    awardPoints,
    updateTrustScore,
    requestRedemption
  } = useEnhancedEloits('user-123');

  // Award points for creating a post
  const handleCreatePost = async () => {
    const result = await awardPoints('post_content', {
      postId: 'post-456',
      content: 'Hello world!'
    });
    
    if (result?.success) {
      console.log(`Earned ${result.amount} ELO points!`);
    }
  };

  // Request redemption
  const handleRedemption = async () => {
    const result = await requestRedemption(1000, 'bank_transfer', {
      accountNumber: '1234567890',
      bankName: 'Example Bank'
    });
    
    if (result.success) {
      console.log('Redemption request submitted successfully');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>ELO Balance: {userEloitsData?.current_balance}</h2>
      <h3>Trust Score: {userEloitsData?.trust_score}</h3>
      <h3>Tier: {userEloitsData?.tier}</h3>
      {/* Render other data */}
    </div>
  );
};
```

### Service Usage:
```typescript
import { enhancedEloitsService } from '@/services/enhancedEloitsService';

// Award points
const result = await enhancedEloitsService.awardPoints('user-123', 'post_content', {
  postId: 'post-456'
});

// Update trust score
const success = await enhancedEloitsService.updateTrustScore('user-123', 5, 'Good engagement');

// Handle marketplace purchase
const purchaseResult = await enhancedEloitsService.handleMarketplacePurchaseReward(
  'user-123', 
  10000, // Purchase amount
  'product-789'
);

// Process multi-level referral
const referralResult = await enhancedEloitsService.processMultiLevelReferral(
  'referrer-123',
  'referee-456',
  'REF789'
);
```

## Configuration

### System Configuration Options:
- `conversion_rate`: ELO to USD conversion rate (default: 1000)
- `payout_mode`: Payout mode (manual or automated)
- `minimum_redeemable_balance`: Minimum ELO balance required for redemption (default: 500)
- `max_monthly_redemption_per_tier`: Maximum USD redemption per month per tier (default: 10000)
- `bonus_multipliers`: JSON object with bonus multipliers for trust levels and badges

### Default Reward Rules:
- `post_content`: 3.0 ELO
- `like_post`: 0.5 ELO
- `comment_post`: 1.5 ELO
- `share_content`: 2.0 ELO
- `daily_login`: 5.0 ELO
- `purchase_product`: 10.0 ELO + 1% of purchase amount
- `product_sold`: 750.0 ELO
- `complete_profile`: 25.0 ELO
- `refer_user`: 1000.0 ELO
- `multi_level_referral`: 100.0 ELO

## Future Automation Path

The system is designed to transition from manual to automated payout when:
1. Platform reaches X active users and Y monthly ad revenue
2. Smart contract module (ELO token) deployed for on-chain transparency
3. Integration with Creator Wallet API for automated USDT/crypto payouts
4. Fraud detection AI model trained on first 3-6 months of platform data

## Admin Controls

The admin dashboard supports:
- Adjusting conversion rate, thresholds, and payout modes
- Viewing and editing trust scores (with audit trail)
- Monitoring flagged/spam accounts
- Exporting transaction history for accounting or investor reports

## Testing

Comprehensive tests are included for all components:
- Unit tests for service functions
- Integration tests for API endpoints
- Mock data for isolated testing
- Test coverage for edge cases and error conditions

To run tests:
```bash
npm test
```

## Migration

The system includes database migrations for:
1. Creating all necessary tables
2. Adding indexes for performance
3. Setting up Row Level Security (RLS)
4. Inserting default data and configurations

To apply migrations:
```bash
npm run migrate
```