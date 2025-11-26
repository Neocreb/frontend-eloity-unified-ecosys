-- ============================================================================
-- Eloity Rewards System - Database Migration
-- Creates tables for activity tracking, rewards summary, and referrals
-- ============================================================================

-- ============================================================================
-- 1. ACTIVITY_TRANSACTIONS TABLE
-- Core table for logging all earning activities
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Activity classification
  activity_type VARCHAR(50) NOT NULL,  -- 'post_creation', 'engagement', 'challenge_complete', etc.
  category VARCHAR(50) NOT NULL,  -- 'Content', 'Engagement', 'Challenges', 'Battles', 'Gifts', 'Referrals', 'Marketplace', 'Freelance'
  description TEXT,
  
  -- Amount tracking
  amount_eloits NUMERIC(15,2),  -- Earnings in Eloits
  amount_currency NUMERIC(15,2),  -- Earnings in user's currency
  currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',  -- ISO 4217 code
  
  -- Status and source tracking
  status VARCHAR(20) NOT NULL DEFAULT 'completed',  -- 'pending', 'completed', 'failed', 'refunded'
  source_id VARCHAR(100),  -- ID of the source (post_id, challenge_id, etc.)
  source_type VARCHAR(50),  -- Type of source ('post', 'challenge', 'battle', 'gift', etc.)
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',  -- Flexible data storage
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_activity_type CHECK (activity_type IN (
    'post_creation', 'engagement', 'challenge_complete', 'battle_vote', 'battle_loss',
    'gift_received', 'tip_received', 'referral_signup', 'referral_activity',
    'marketplace_sale', 'freelance_work', 'p2p_trading', 'other'
  )),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- Create indexes for performance
CREATE INDEX idx_activity_user_date ON activity_transactions(user_id, created_at DESC);
CREATE INDEX idx_activity_type ON activity_transactions(activity_type);
CREATE INDEX idx_activity_category ON activity_transactions(category);
CREATE INDEX idx_activity_status ON activity_transactions(status);
CREATE INDEX idx_activity_source ON activity_transactions(source_type, source_id);

-- ============================================================================
-- 2. USER_REWARDS_SUMMARY TABLE
-- Denormalized table for quick dashboard queries
-- Updated via triggers when activities are logged
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_rewards_summary (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Total amounts
  total_earned NUMERIC(15,2) NOT NULL DEFAULT 0,  -- All-time earnings
  available_balance NUMERIC(15,2) NOT NULL DEFAULT 0,  -- Can be withdrawn
  total_withdrawn NUMERIC(15,2) NOT NULL DEFAULT 0,  -- Already withdrawn
  
  -- Streaks and levels
  current_streak INT NOT NULL DEFAULT 0,  -- Current active streak in days
  longest_streak INT NOT NULL DEFAULT 0,  -- Longest ever streak
  
  -- Gamification
  trust_score INT NOT NULL DEFAULT 50,  -- 0-100 (affects earning multipliers)
  level INT NOT NULL DEFAULT 1,  -- 1-10+ (achievement levels)
  next_level_threshold NUMERIC(15,2),  -- Earnings needed for next level
  
  -- User preferences
  currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- Activity metrics
  total_activities INT NOT NULL DEFAULT 0,  -- Total activity count
  activities_this_month INT NOT NULL DEFAULT 0,  -- This month's activities
  
  -- Tracking
  last_activity_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_summary_level ON user_rewards_summary(level);
CREATE INDEX idx_summary_trust_score ON user_rewards_summary(trust_score);
CREATE INDEX idx_summary_updated ON user_rewards_summary(updated_at DESC);

-- ============================================================================
-- 3. USER_CHALLENGES TABLE
-- Tracks individual user progress on challenges
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  
  -- Progress tracking
  progress INT NOT NULL DEFAULT 0,
  target_value INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active', 'completed', 'expired', 'abandoned'
  
  -- Completion details
  completion_date TIMESTAMP WITH TIME ZONE,
  reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  claim_date TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one progress record per user per challenge
  UNIQUE(user_id, challenge_id),
  
  -- Constraints
  CONSTRAINT valid_progress CHECK (progress >= 0),
  CONSTRAINT valid_target CHECK (target_value > 0),
  CONSTRAINT progress_lte_target CHECK (progress <= target_value)
);

CREATE INDEX idx_user_challenges_user ON user_challenges(user_id, status);
CREATE INDEX idx_user_challenges_status ON user_challenges(status);
CREATE INDEX idx_user_challenges_completion ON user_challenges(completion_date DESC);

-- ============================================================================
-- 4. REFERRAL_TRACKING TABLE
-- Enhanced referral system with tier tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS referral_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Referral details
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'active', 'inactive'
  
  -- Timeline
  referral_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  first_purchase_date TIMESTAMP WITH TIME ZONE,
  
  -- Earnings
  earnings_total NUMERIC(15,2) NOT NULL DEFAULT 0,
  earnings_this_month NUMERIC(15,2) NOT NULL DEFAULT 0,
  
  -- Tier and sharing
  tier VARCHAR(20) NOT NULL DEFAULT 'bronze',  -- 'bronze', 'silver', 'gold', 'platinum'
  auto_share_total NUMERIC(15,2) NOT NULL DEFAULT 0,  -- Total shared from 0.5%
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(referrer_id, referred_user_id),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'inactive')),
  CONSTRAINT valid_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'))
);

CREATE INDEX idx_referral_referrer ON referral_tracking(referrer_id, status);
CREATE INDEX idx_referral_referred ON referral_tracking(referred_user_id);
CREATE INDEX idx_referral_code ON referral_tracking(referral_code);
CREATE INDEX idx_referral_tier ON referral_tracking(tier);

-- ============================================================================
-- 5. USER_DAILY_STATS TABLE
-- Aggregated daily statistics for analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_daily_stats (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stats_date DATE NOT NULL,
  
  -- Daily metrics
  activities_count INT NOT NULL DEFAULT 0,
  earnings_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  earnings_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- Best performing activity
  best_activity_type VARCHAR(50),
  best_activity_amount NUMERIC(15,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Primary key
  PRIMARY KEY (user_id, stats_date),
  
  -- Constraints
  CONSTRAINT positive_activities CHECK (activities_count >= 0),
  CONSTRAINT positive_earnings CHECK (earnings_amount >= 0)
);

CREATE INDEX idx_daily_stats_user ON user_daily_stats(user_id, stats_date DESC);
CREATE INDEX idx_daily_stats_date ON user_daily_stats(stats_date);

-- ============================================================================
-- 6. ENUM TYPES (Optional - for stricter typing)
-- ============================================================================

-- Activity type enum
CREATE TYPE activity_type_enum AS ENUM (
  'post_creation',
  'engagement',
  'challenge_complete',
  'battle_vote',
  'battle_loss',
  'gift_received',
  'tip_received',
  'referral_signup',
  'referral_activity',
  'marketplace_sale',
  'freelance_work',
  'p2p_trading',
  'other'
);

-- Activity category enum
CREATE TYPE activity_category_enum AS ENUM (
  'Content',
  'Engagement',
  'Challenges',
  'Battles',
  'Gifts',
  'Referrals',
  'Marketplace',
  'Freelance',
  'Crypto'
);

-- ============================================================================
-- 7. TRIGGER FUNCTIONS (Auto-update timestamps)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER activity_transactions_updated_at
  BEFORE UPDATE ON activity_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER user_challenges_updated_at
  BEFORE UPDATE ON user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER referral_tracking_updated_at
  BEFORE UPDATE ON referral_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER user_daily_stats_updated_at
  BEFORE UPDATE ON user_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- 8. COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE activity_transactions IS 'Core table storing all user earning activities with real-time tracking';
COMMENT ON COLUMN activity_transactions.amount_eloits IS 'Amount earned in Eloits (platform currency)';
COMMENT ON COLUMN activity_transactions.amount_currency IS 'Amount earned in user''s selected currency';
COMMENT ON COLUMN activity_transactions.metadata IS 'JSON data for extensibility (e.g., multipliers, bonuses)';

COMMENT ON TABLE user_rewards_summary IS 'Denormalized summary for fast dashboard queries; updated via triggers';
COMMENT ON COLUMN user_rewards_summary.trust_score IS 'Score from 0-100 affecting earning multipliers and withdrawal limits';
COMMENT ON COLUMN user_rewards_summary.level IS 'Achievement level, increases with total earnings';

COMMENT ON TABLE user_challenges IS 'Tracks individual challenge progress and completion per user';
COMMENT ON TABLE referral_tracking IS 'Manages referral relationships and earnings with tier progression';
COMMENT ON TABLE user_daily_stats IS 'Daily aggregated stats for analytics and trend analysis';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- This migration creates the foundation for the Eloity rewards system.
-- All tables include proper:
-- - Primary keys and foreign keys
-- - Check constraints and validations
-- - Indexes for common queries
-- - Timestamps for auditing
-- - RLS will be applied in separate migration
-- ============================================================================
