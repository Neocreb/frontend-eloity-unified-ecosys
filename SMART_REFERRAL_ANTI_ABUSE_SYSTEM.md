# Smart Referral Anti-Abuse System

## Overview
This system prevents referral abuse while encouraging genuine user growth without hard limits on referrals.

## Anti-Abuse Mechanisms

### 1. **Decay System**
- **Base Reward**: 20 eloits per referral
- **Decay Start**: After 3rd referral in 24 hours
- **Decay Rate**: 25% reduction per additional referral
- **Minimum Reward**: 10% of base (2 eloits minimum)

**Example:**
- 1st-3rd referral: 20 SP each
- 4th referral: 15 SP (25% reduction)
- 5th referral: 11 SP (50% reduction)
- 6th referral: 8 SP (60% reduction)
- 7th+ referral: 2 SP (minimum)

### 2. **Cooldown System**
- **Cooldown Period**: 2 hours between referrals
- **Purpose**: Prevents rapid-fire fake account creation
- **User Experience**: Clear feedback on wait time

### 3. **Progressive Trust Requirements**
- **Base Requirement**: 15 trust score
- **Scaling**: +5 trust score per 5 referrals
- **Example**: 
  - 1-5 referrals: 15 trust needed
  - 6-10 referrals: 20 trust needed
  - 11-15 referrals: 25 trust needed

### 4. **Activity Validation (7-Day)**
- **Pending Rewards**: All referral rewards are pending for 7 days
- **Validation Criteria**: 
  - Referee must log in within 3 days of validation check
  - Referee must show minimal activity (posts or earned >35 SP)
- **Auto-Processing**: Background job validates and credits rewards

### 5. **Balanced Incentives**
- **Referrer**: 20 SP (pending validation)
- **Referee**: 35 SP (immediate welcome bonus)
- **Logic**: New users get more to discourage fake accounts

## Benefits

### ✅ **Prevents Abuse**
- Decay makes mass fake referrals unprofitable
- Cooldown prevents automated abuse
- Activity validation ensures real users
- Progressive trust requirements limit low-quality referrers

### ✅ **Encourages Growth**
- No hard limits on referrals
- Legitimate users can refer unlimited friends
- Higher rewards for quality referrers (high trust score)
- Immediate welcome bonus for new users

### ✅ **Fair & Transparent**
- Clear feedback on cooldowns and requirements
- Visible decay calculations
- Audit trail of all decisions

## Implementation Files

### Core Configuration
- `scripts/setup-reward-rules.ts` - Decay parameters and base rewards
- `shared/enhanced-schema.ts` - Database defaults

### Server Logic
- `server/routes/referral.ts` - Smart anti-abuse processing
- `/process-validated-rewards` endpoint for background validation

### Frontend
- Demo data updated to reflect new system
- Clear messaging about pending validation

## Future Enhancements

1. **Geographic Validation**: Prevent multiple referrals from same IP/location
2. **Device Fingerprinting**: Detect fake accounts from same device
3. **Social Graph Analysis**: Validate genuine social connections
4. **ML-Based Scoring**: Use AI to detect suspicious referral patterns
5. **Reputation Multipliers**: Bonus rewards for high-reputation referrers

## Monitoring & Metrics

Track these metrics to optimize the system:
- Referral completion rate (signup → active user)
- Decay trigger frequency
- Trust score distribution of referrers
- False positive/negative rates in validation
- User feedback on cooldown experience

This system balances growth needs with abuse prevention, creating a sustainable referral economy.
