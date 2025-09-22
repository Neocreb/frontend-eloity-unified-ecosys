import { pgTable, uuid, text, timestamp, boolean, jsonb, numeric, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

// Freelance projects table
export const freelance_projects = pgTable('freelance_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  client_id: uuid('client_id').notNull(),
  freelancer_id: uuid('freelancer_id'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  budget_type: text('budget_type').notNull(), // 'fixed' or 'hourly'
  budget_min: numeric('budget_min', { precision: 10, scale: 2 }),
  budget_max: numeric('budget_max', { precision: 10, scale: 2 }),
  hourly_rate: numeric('hourly_rate', { precision: 8, scale: 2 }),
  project_duration: text('project_duration'),
  experience_level: text('experience_level').notNull(),
  skills_required: text('skills_required').array(),
  attachments: jsonb('attachments'),
  location_requirement: text('location_requirement').default('remote'),
  location: text('location'),
  status: text('status').default('open'),
  visibility: text('visibility').default('public'),
  featured: boolean('featured').default(false),
  urgent: boolean('urgent').default(false),
  applications_count: integer('applications_count').default(0),
  views_count: integer('views_count').default(0),
  deadline: timestamp('deadline'),
  start_date: timestamp('start_date'),
  completion_date: timestamp('completion_date'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Freelance proposals table
export const freelance_proposals = pgTable('freelance_proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').notNull(),
  freelancer_id: uuid('freelancer_id').notNull(),
  cover_letter: text('cover_letter').notNull(),
  proposed_budget: numeric('proposed_budget', { precision: 10, scale: 2 }),
  proposed_hourly_rate: numeric('proposed_hourly_rate', { precision: 8, scale: 2 }),
  estimated_duration: text('estimated_duration'),
  portfolio_samples: jsonb('portfolio_samples'),
  attachments: jsonb('attachments'),
  questions_answers: jsonb('questions_answers'),
  status: text('status').default('pending'),
  client_feedback: text('client_feedback'),
  interview_scheduled: boolean('interview_scheduled').default(false),
  interview_datetime: timestamp('interview_datetime'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Freelance contracts table
export const freelance_contracts = pgTable('freelance_contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').notNull(),
  proposal_id: uuid('proposal_id').notNull(),
  client_id: uuid('client_id').notNull(),
  freelancer_id: uuid('freelancer_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  terms: text('terms'),
  budget: numeric('budget', { precision: 10, scale: 2 }).notNull(),
  hourly_rate: numeric('hourly_rate', { precision: 8, scale: 2 }),
  payment_terms: text('payment_terms'),
  milestones: jsonb('milestones'),
  deliverables: jsonb('deliverables'),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  status: text('status').default('active'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Freelance work submissions table
export const freelance_work_submissions = pgTable('freelance_work_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  contract_id: uuid('contract_id').notNull(),
  milestone_id: text('milestone_id'),
  freelancer_id: uuid('freelancer_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  attachments: jsonb('attachments'),
  work_hours: numeric('work_hours', { precision: 5, scale: 2 }),
  status: text('status').default('submitted'),
  client_feedback: text('client_feedback'),
  revision_notes: text('revision_notes'),
  approved_at: timestamp('approved_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Freelance payments table
export const freelance_payments = pgTable('freelance_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  contract_id: uuid('contract_id').notNull(),
  submission_id: uuid('submission_id'),
  payer_id: uuid('payer_id').notNull(),
  payee_id: uuid('payee_id').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  payment_method: text('payment_method'),
  transaction_id: text('transaction_id'),
  status: text('status').default('pending'),
  payment_date: timestamp('payment_date'),
  fee_amount: numeric('fee_amount', { precision: 10, scale: 2 }).default('0'),
  net_amount: numeric('net_amount', { precision: 10, scale: 2 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Freelance reviews table
export const freelance_reviews = pgTable('freelance_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  contract_id: uuid('contract_id').notNull(),
  reviewer_id: uuid('reviewer_id').notNull(),
  reviewee_id: uuid('reviewee_id').notNull(),
  rating: integer('rating').notNull(),
  review_type: text('review_type').notNull(), // 'client_to_freelancer' or 'freelancer_to_client'
  title: text('title'),
  content: text('content'),
  skills_rating: jsonb('skills_rating'),
  communication_rating: integer('communication_rating'),
  quality_rating: integer('quality_rating'),
  deadline_rating: integer('deadline_rating'),
  is_public: boolean('is_public').default(true),
  is_featured: boolean('is_featured').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Freelance disputes table
export const freelance_disputes = pgTable('freelance_disputes', {
  id: uuid('id').primaryKey().defaultRandom(),
  contract_id: uuid('contract_id').notNull(),
  raised_by: uuid('raised_by').notNull(),
  against_user_id: uuid('against_user_id').notNull(),
  reason: text('reason').notNull(),
  description: text('description').notNull(),
  evidence: jsonb('evidence'),
  amount_disputed: numeric('amount_disputed', { precision: 10, scale: 2 }),
  status: text('status').default('open'),
  admin_notes: text('admin_notes'),
  resolution: text('resolution'),
  resolved_by: uuid('resolved_by'),
  resolved_at: timestamp('resolved_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Freelance skills table
export const freelance_skills = pgTable('freelance_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(),
  category: text('category').notNull(),
  description: text('description'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
});

// Freelance user skills table
export const freelance_user_skills = pgTable('freelance_user_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  skill_id: uuid('skill_id').notNull(),
  proficiency_level: text('proficiency_level').notNull(), // 'beginner', 'intermediate', 'expert'
  years_experience: integer('years_experience'),
  is_verified: boolean('is_verified').default(false),
  verified_at: timestamp('verified_at'),
  created_at: timestamp('created_at').defaultNow(),
});

// Freelance profiles table
export const freelance_profiles = pgTable('freelance_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  professional_title: text('professional_title'),
  overview: text('overview'),
  hourly_rate: numeric('hourly_rate', { precision: 8, scale: 2 }),
  availability: text('availability').default('available'),
  experience_level: text('experience_level').default('intermediate'),
  portfolio_url: text('portfolio_url'),
  resume_url: text('resume_url'),
  languages: jsonb('languages'),
  education: jsonb('education'),
  certifications: jsonb('certifications'),
  work_history: jsonb('work_history'),
  services_offered: jsonb('services_offered'),
  preferred_project_size: text('preferred_project_size'),
  response_time: text('response_time'),
  success_rate: numeric('success_rate', { precision: 5, scale: 2 }).default('0'),
  total_earnings: numeric('total_earnings', { precision: 12, scale: 2 }).default('0'),
  completed_projects: integer('completed_projects').default(0),
  repeat_clients: integer('repeat_clients').default(0),
  profile_completion: integer('profile_completion').default(0),
  is_available: boolean('is_available').default(true),
  is_featured: boolean('is_featured').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Relations
export const freelanceProjectsRelations = relations(freelance_projects, ({ one, many }) => ({
  client: one(users, {
    fields: [freelance_projects.client_id],
    references: [users.id],
    relationName: 'clientProjects',
  }),
  freelancer: one(users, {
    fields: [freelance_projects.freelancer_id],
    references: [users.id],
    relationName: 'freelancerProjects',
  }),
  proposals: many(freelance_proposals),
  contracts: many(freelance_contracts),
}));

export const freelanceProposalsRelations = relations(freelance_proposals, ({ one, many }) => ({
  project: one(freelance_projects, {
    fields: [freelance_proposals.project_id],
    references: [freelance_projects.id],
  }),
  freelancer: one(users, {
    fields: [freelance_proposals.freelancer_id],
    references: [users.id],
  }),
  contracts: many(freelance_contracts),
}));

export const freelanceContractsRelations = relations(freelance_contracts, ({ one, many }) => ({
  project: one(freelance_projects, {
    fields: [freelance_contracts.project_id],
    references: [freelance_projects.id],
  }),
  proposal: one(freelance_proposals, {
    fields: [freelance_contracts.proposal_id],
    references: [freelance_proposals.id],
  }),
  client: one(users, {
    fields: [freelance_contracts.client_id],
    references: [users.id],
    relationName: 'clientContracts',
  }),
  freelancer: one(users, {
    fields: [freelance_contracts.freelancer_id],
    references: [users.id],
    relationName: 'freelancerContracts',
  }),
  submissions: many(freelance_work_submissions),
  payments: many(freelance_payments),
  reviews: many(freelance_reviews),
  disputes: many(freelance_disputes),
}));

export const freelanceWorkSubmissionsRelations = relations(freelance_work_submissions, ({ one }) => ({
  contract: one(freelance_contracts, {
    fields: [freelance_work_submissions.contract_id],
    references: [freelance_contracts.id],
  }),
  freelancer: one(users, {
    fields: [freelance_work_submissions.freelancer_id],
    references: [users.id],
  }),
}));

export const freelancePaymentsRelations = relations(freelance_payments, ({ one }) => ({
  contract: one(freelance_contracts, {
    fields: [freelance_payments.contract_id],
    references: [freelance_contracts.id],
  }),
  submission: one(freelance_work_submissions, {
    fields: [freelance_payments.submission_id],
    references: [freelance_work_submissions.id],
  }),
  payer: one(users, {
    fields: [freelance_payments.payer_id],
    references: [users.id],
    relationName: 'payerPayments',
  }),
  payee: one(users, {
    fields: [freelance_payments.payee_id],
    references: [users.id],
    relationName: 'payeePayments',
  }),
}));

export const freelanceReviewsRelations = relations(freelance_reviews, ({ one }) => ({
  contract: one(freelance_contracts, {
    fields: [freelance_reviews.contract_id],
    references: [freelance_contracts.id],
  }),
  reviewer: one(users, {
    fields: [freelance_reviews.reviewer_id],
    references: [users.id],
    relationName: 'reviewerReviews',
  }),
  reviewee: one(users, {
    fields: [freelance_reviews.reviewee_id],
    references: [users.id],
    relationName: 'revieweeReviews',
  }),
}));

export const freelanceDisputesRelations = relations(freelance_disputes, ({ one }) => ({
  contract: one(freelance_contracts, {
    fields: [freelance_disputes.contract_id],
    references: [freelance_contracts.id],
  }),
  raisedBy: one(users, {
    fields: [freelance_disputes.raised_by],
    references: [users.id],
    relationName: 'disputesRaised',
  }),
  againstUser: one(users, {
    fields: [freelance_disputes.against_user_id],
    references: [users.id],
    relationName: 'disputesAgainst',
  }),
  resolvedBy: one(users, {
    fields: [freelance_disputes.resolved_by],
    references: [users.id],
    relationName: 'disputesResolved',
  }),
}));

export const freelanceUserSkillsRelations = relations(freelance_user_skills, ({ one }) => ({
  user: one(users, {
    fields: [freelance_user_skills.user_id],
    references: [users.id],
  }),
  skill: one(freelance_skills, {
    fields: [freelance_user_skills.skill_id],
    references: [freelance_skills.id],
  }),
}));

export const freelanceSkillsRelations = relations(freelance_skills, ({ many }) => ({
  userSkills: many(freelance_user_skills),
}));

export const freelanceProfilesRelations = relations(freelance_profiles, ({ one }) => ({
  user: one(users, {
    fields: [freelance_profiles.user_id],
    references: [users.id],
  }),
}));
