import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

// Admin permissions table
export const admin_permissions = pgTable('admin_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  role: text('role').notNull(), // 'super_admin', 'admin', 'moderator'
  permissions: jsonb('permissions').notNull(),
  is_active: boolean('is_active').default(true),
  granted_by: uuid('granted_by').notNull(),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Admin sessions table
export const admin_sessions = pgTable('admin_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  admin_id: uuid('admin_id').notNull(),
  session_token: text('session_token').unique().notNull(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  is_active: boolean('is_active').default(true),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// Admin activity logs table
export const admin_activity_logs = pgTable('admin_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  admin_id: uuid('admin_id').notNull(),
  action: text('action').notNull(),
  resource: text('resource'),
  resource_id: text('resource_id'),
  details: jsonb('details'),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  status: text('status').default('success'),
  created_at: timestamp('created_at').defaultNow(),
});

// Content moderation queue table
export const content_moderation_queue = pgTable('content_moderation_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  content_type: text('content_type').notNull(), // 'post', 'comment', 'message', 'product', 'profile'
  content_id: uuid('content_id').notNull(),
  reported_by: uuid('reported_by'),
  reason: text('reason').notNull(),
  description: text('description'),
  priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
  status: text('status').default('pending'), // 'pending', 'reviewing', 'approved', 'rejected'
  assigned_to: uuid('assigned_to'),
  reviewed_by: uuid('reviewed_by'),
  review_notes: text('review_notes'),
  auto_detected: boolean('auto_detected').default(false),
  confidence: text('confidence'), // AI confidence score
  reviewed_at: timestamp('reviewed_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// System settings table
export const system_settings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  description: text('description'),
  is_public: boolean('is_public').default(false),
  updated_by: uuid('updated_by').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// User reports table
export const user_reports = pgTable('user_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporter_id: uuid('reporter_id').notNull(),
  reported_user_id: uuid('reported_user_id').notNull(),
  reason: text('reason').notNull(),
  description: text('description'),
  evidence: jsonb('evidence'),
  status: text('status').default('pending'),
  priority: text('priority').default('medium'),
  assigned_to: uuid('assigned_to'),
  reviewed_by: uuid('reviewed_by'),
  review_notes: text('review_notes'),
  action_taken: text('action_taken'),
  resolved_at: timestamp('resolved_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// User sanctions table
export const user_sanctions = pgTable('user_sanctions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  type: text('type').notNull(), // 'warning', 'suspension', 'ban', 'restriction'
  reason: text('reason').notNull(),
  description: text('description'),
  severity: text('severity').notNull(), // 'minor', 'major', 'severe'
  duration: integer('duration'), // in hours, null for permanent
  restrictions: jsonb('restrictions'),
  applied_by: uuid('applied_by').notNull(),
  appeal_deadline: timestamp('appeal_deadline'),
  is_active: boolean('is_active').default(true),
  appeal_status: text('appeal_status'),
  appeal_notes: text('appeal_notes'),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Platform analytics table
export const platform_analytics = pgTable('platform_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  metric_name: text('metric_name').notNull(),
  metric_value: jsonb('metric_value').notNull(),
  date: timestamp('date').notNull(),
  category: text('category'),
  subcategory: text('subcategory'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow(),
});

// Announcement table
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').default('info'), // 'info', 'warning', 'success', 'error'
  target_audience: text('target_audience').default('all'), // 'all', 'users', 'sellers', 'freelancers'
  is_active: boolean('is_active').default(true),
  is_urgent: boolean('is_urgent').default(false),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  created_by: uuid('created_by').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Commission settings table
export const commission_settings = pgTable('commission_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  service_type: text('service_type').notNull(), // 'airtime', 'data', 'utilities', 'gift_cards', 'all'
  operator_id: integer('operator_id'), // optional: specific operator commission override
  commission_type: text('commission_type').notNull(), // 'percentage', 'fixed_amount', 'none'
  percentage_value: text('percentage_value'), // for percentage-based commission
  fixed_amount: text('fixed_amount'), // for fixed amount commission
  currency_code: text('currency_code').default('USD'), // currency for fixed amounts
  is_active: boolean('is_active').default(true),
  applied_by: uuid('applied_by').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Commission transactions table for tracking
export const commission_transactions = pgTable('commission_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  transaction_id: text('transaction_id').notNull().unique(),
  user_id: uuid('user_id').notNull(),
  service_type: text('service_type').notNull(), // 'airtime', 'data', 'utilities', 'gift_cards'
  operator_id: integer('operator_id'),
  base_amount: text('base_amount').notNull(), // base amount from RELOADLY
  commission_type: text('commission_type').notNull(), // commission strategy applied
  commission_amount: text('commission_amount').notNull(), // actual commission earned
  total_charged: text('total_charged').notNull(), // base_amount + commission_amount
  currency_code: text('currency_code').notNull(),
  status: text('status').default('completed'), // 'completed', 'pending', 'failed'
  created_at: timestamp('created_at').defaultNow(),
});

// Relations
export const adminPermissionsRelations = relations(admin_permissions, ({ one }) => ({
  user: one(users, {
    fields: [admin_permissions.user_id],
    references: [users.id],
  }),
  grantedBy: one(users, {
    fields: [admin_permissions.granted_by],
    references: [users.id],
    relationName: 'permissionsGranted',
  }),
}));

export const adminSessionsRelations = relations(admin_sessions, ({ one }) => ({
  admin: one(users, {
    fields: [admin_sessions.admin_id],
    references: [users.id],
  }),
}));

export const adminActivityLogsRelations = relations(admin_activity_logs, ({ one }) => ({
  admin: one(users, {
    fields: [admin_activity_logs.admin_id],
    references: [users.id],
  }),
}));

export const contentModerationQueueRelations = relations(content_moderation_queue, ({ one }) => ({
  reportedBy: one(users, {
    fields: [content_moderation_queue.reported_by],
    references: [users.id],
    relationName: 'reportsSubmitted',
  }),
  assignedTo: one(users, {
    fields: [content_moderation_queue.assigned_to],
    references: [users.id],
    relationName: 'moderationAssigned',
  }),
  reviewedBy: one(users, {
    fields: [content_moderation_queue.reviewed_by],
    references: [users.id],
    relationName: 'moderationReviewed',
  }),
}));

export const systemSettingsRelations = relations(system_settings, ({ one }) => ({
  updatedBy: one(users, {
    fields: [system_settings.updated_by],
    references: [users.id],
  }),
}));

export const userReportsRelations = relations(user_reports, ({ one }) => ({
  reporter: one(users, {
    fields: [user_reports.reporter_id],
    references: [users.id],
    relationName: 'reportsSubmitted',
  }),
  reportedUser: one(users, {
    fields: [user_reports.reported_user_id],
    references: [users.id],
    relationName: 'reportsReceived',
  }),
  assignedTo: one(users, {
    fields: [user_reports.assigned_to],
    references: [users.id],
    relationName: 'reportsAssigned',
  }),
  reviewedBy: one(users, {
    fields: [user_reports.reviewed_by],
    references: [users.id],
    relationName: 'reportsReviewed',
  }),
}));

export const userSanctionsRelations = relations(user_sanctions, ({ one }) => ({
  user: one(users, {
    fields: [user_sanctions.user_id],
    references: [users.id],
  }),
  appliedBy: one(users, {
    fields: [user_sanctions.applied_by],
    references: [users.id],
    relationName: 'sanctionsApplied',
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdBy: one(users, {
    fields: [announcements.created_by],
    references: [users.id],
  }),
}));
