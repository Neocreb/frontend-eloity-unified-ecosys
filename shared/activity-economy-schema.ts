import { pgTable, uuid, text, timestamp, boolean, jsonb, numeric, integer, primaryKey, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

// Reward rules table - defines how rewards are calculated for different activities
export const rewardRules = pgTable('reward_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  actionType: text('action_type').notNull().unique(),
  displayName: text('display_name').notNull(),
  description: text('description'),
  baseEloits: numeric('base_eloits', { precision: 10, scale: 2 }).notNull(),
  baseWalletBonus: numeric('base_wallet_bonus', { precision: 20, scale: 8 }).default('0'),
  currency: text('currency').default('USDT'),
  dailyLimit: integer('daily_limit'),
  weeklyLimit: integer('weekly_limit'),
  monthlyLimit: integer('monthly_limit'),
  minimumTrustScore: numeric('minimum_trust_score', { precision: 5, scale: 2 }).default('0'),
  minimumValue: numeric('minimum_value', { precision: 15, scale: 2 }),
  decayEnabled: boolean('decay_enabled').default(true),
  decayStart: integer('decay_start').default(1),
  decayRate: numeric('decay_rate', { precision: 5, 4 }).default('0.1'),
  minMultiplier: numeric('min_multiplier', { precision: 3, 2 }).default('0.1'),
  requiresModeration: boolean('requires_moderation').default(false),
  qualityThreshold: numeric('quality_threshold', { precision: 3, 2 }).default('0'),
  conditions: jsonb('conditions'),
  isActive: boolean('is_active').default(true),
  activeFrom: timestamp('active_from'),
  activeTo: timestamp('active_to'),
  createdBy: uuid('created_by'),
  lastModifiedBy: uuid('last_modified_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User rewards table - tracks user's ELO balance and statistics
export const userRewards = pgTable('user_rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  currentBalance: numeric('current_balance', { precision: 15, scale: 2 }).default('0'),
  totalEarned: numeric('total_earned', { precision: 15, scale: 2 }).default('0'),
  totalSpent: numeric('total_spent', { precision: 15, scale: 2 }).default('0'),
  trustScore: numeric('trust_score', { precision: 5, scale: 2 }).default('50'),
  trustLevel: text('trust_level').default('bronze'),
  rewardMultiplier: numeric('reward_multiplier', { precision: 3, 2 }).default('1.0'),
  dailyCap: integer('daily_cap').default(1000),
  streakDays: integer('streak_days').default(0),
  lastActivityDate: timestamp('last_activity_date'),
  tier: text('tier').default('bronze'),
  referralCount: integer('referral_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Reward transactions table - logs all reward transactions
export const rewardTransactions = pgTable('reward_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  actionType: text('action_type').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 15, scale: 2 }).notNull(),
  description: text('description'),
  metadata: jsonb('metadata'),
  trustScoreImpact: numeric('trust_score_impact', { precision: 5, scale: 2 }).default('0'),
  multiplierApplied: numeric('multiplier_applied', { precision: 3, 2 }).default('1.0'),
  decayFactor: numeric('decay_factor', { precision: 3, 2 }).default('1.0'),
  status: text('status').default('completed'),
  referenceId: uuid('reference_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Trust score history table - tracks trust score changes over time
export const trustHistory = pgTable('trust_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  previousScore: numeric('previous_score', { precision: 5, scale: 2 }),
  newScore: numeric('new_score', { precision: 5, scale: 2 }).notNull(),
  changeReason: text('change_reason'),
  activityType: text('activity_type'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Redemption requests table - tracks user redemption requests
export const redemptions = pgTable('redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  payoutMethod: text('payout_method').notNull(),
  payoutDetails: jsonb('payout_details'),
  status: text('status').default('pending'),
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at'),
  processedAt: timestamp('processed_at'),
  rejectionReason: text('rejection_reason'),
  batchId: text('batch_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Referrals table - tracks referral relationships
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id').notNull(),
  refereeId: uuid('referee_id'),
  referralCode: text('referral_code').notNull().unique(),
  status: text('status').default('pending'), // pending, verified, completed
  depth: integer('depth').default(1),
  rewardEarned: numeric('reward_earned', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  verifiedAt: timestamp('verified_at'),
});

// System configuration table - stores configurable system parameters
export const systemConfig = pgTable('system_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  dataType: text('data_type').default('string'),
  category: text('category').default('general'),
  isEditable: boolean('is_editable').default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const rewardRulesRelations = relations(rewardRules, ({ one }) => ({
  creator: one(users, {
    fields: [rewardRules.createdBy],
    references: [users.id],
    relationName: 'createdRules',
  }),
  modifier: one(users, {
    fields: [rewardRules.lastModifiedBy],
    references: [users.id],
    relationName: 'modifiedRules',
  }),
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(users, {
    fields: [userRewards.userId],
    references: [users.id],
  }),
}));

export const rewardTransactionsRelations = relations(rewardTransactions, ({ one }) => ({
  user: one(users, {
    fields: [rewardTransactions.userId],
    references: [users.id],
  }),
}));

export const trustHistoryRelations = relations(trustHistory, ({ one }) => ({
  user: one(users, {
    fields: [trustHistory.userId],
    references: [users.id],
  }),
}));

export const redemptionsRelations = relations(redemptions, ({ one }) => ({
  user: one(users, {
    fields: [redemptions.userId],
    references: [users.id],
    relationName: 'userRedemptions',
  }),
  approver: one(users, {
    fields: [redemptions.approvedBy],
    references: [users.id],
    relationName: 'approvedRedemptions',
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: 'referrerReferrals',
  }),
  referee: one(users, {
    fields: [referrals.refereeId],
    references: [users.id],
    relationName: 'refereeReferrals',
  }),
}));