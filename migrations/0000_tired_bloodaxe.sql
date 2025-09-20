CREATE TABLE "admin_activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"action" text NOT NULL,
	"resource" text,
	"resource_id" text,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"status" text DEFAULT 'success',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"permissions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"granted_by" uuid NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"session_token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participants" text[] NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"attachments" jsonb,
	"is_edited" boolean DEFAULT false,
	"edited_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"read_by" jsonb,
	"delivered_to" jsonb,
	"reply_to_id" uuid,
	"is_flagged" boolean DEFAULT false,
	"flagged_reason" text,
	"flagged_by" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_moderation_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" text NOT NULL,
	"content_id" uuid NOT NULL,
	"reported_by" uuid,
	"reason" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'pending',
	"assigned_to" uuid,
	"reviewed_by" uuid,
	"review_notes" text,
	"auto_detected" boolean DEFAULT false,
	"confidence" numeric(3, 2),
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "followers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "freelance_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"escrow_id" uuid,
	"raised_by" uuid NOT NULL,
	"against_user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"description" text NOT NULL,
	"evidence" text[],
	"status" text DEFAULT 'open',
	"admin_notes" text,
	"resolution" text,
	"resolved_by" uuid,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "freelance_escrow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"freelancer_id" uuid NOT NULL,
	"amount" numeric(15, 8) NOT NULL,
	"crypto_type" text NOT NULL,
	"contract_address" text,
	"transaction_hash" text,
	"status" text DEFAULT 'pending',
	"locked_at" timestamp,
	"released_at" timestamp,
	"dispute_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "freelance_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"budget_type" text NOT NULL,
	"budget_min" numeric(10, 2),
	"budget_max" numeric(10, 2),
	"budget_amount" numeric(10, 2),
	"deadline" timestamp,
	"duration" text,
	"experience_level" text NOT NULL,
	"skills" text[] NOT NULL,
	"status" text DEFAULT 'open',
	"visibility" text DEFAULT 'public',
	"attachments" text[],
	"applications_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "freelance_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"attachments" text[],
	"message_type" text DEFAULT 'text',
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "freelance_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"proposal_id" uuid NOT NULL,
	"freelancer_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"status" text DEFAULT 'active',
	"agreed_budget" numeric(10, 2) NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0',
	"remaining_amount" numeric(10, 2) NOT NULL,
	"escrow_id" uuid,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"deadline" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "freelance_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"freelancer_id" uuid NOT NULL,
	"cover_letter" text NOT NULL,
	"proposed_rate_type" text NOT NULL,
	"proposed_amount" numeric(10, 2) NOT NULL,
	"delivery_time" text NOT NULL,
	"milestones" jsonb,
	"attachments" text[],
	"status" text DEFAULT 'pending',
	"submitted_at" timestamp DEFAULT now(),
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "freelance_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"reviewee_id" uuid NOT NULL,
	"overall_rating" integer NOT NULL,
	"communication_rating" integer NOT NULL,
	"quality_rating" integer NOT NULL,
	"timeline_rating" integer NOT NULL,
	"comment" text,
	"is_client_review" boolean NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(30) NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"actor_id" uuid,
	"target_type" varchar(20),
	"target_id" uuid,
	"action_url" text,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"category" varchar(30),
	"status" varchar(20) DEFAULT 'unread' NOT NULL,
	"delivery_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"read_at" timestamp,
	"clicked_at" timestamp,
	"dismissed_at" timestamp,
	"expires_at" timestamp,
	"group_key" text,
	"batch_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "p2p_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"offer_type" text NOT NULL,
	"crypto_type" text NOT NULL,
	"amount" numeric(15, 8) NOT NULL,
	"price_per_unit" numeric(10, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"status" text DEFAULT 'active',
	"notes" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false,
	"last_modified_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"parent_id" uuid,
	"like_count" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"mentions" jsonb DEFAULT '[]'::jsonb,
	"media_urls" jsonb DEFAULT '[]'::jsonb,
	"edited" boolean DEFAULT false,
	"pinned" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reaction_type" varchar(20) DEFAULT 'like' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"video_url" text,
	"type" text DEFAULT 'post',
	"filter" text,
	"tags" text[],
	"eloits" integer,
	"is_duet" boolean DEFAULT false,
	"duet_of_post_id" uuid,
	"original_creator_id" uuid,
	"original_creator_username" text,
	"duet_style" text,
	"audio_source" text DEFAULT 'both',
	"duet_video_url" text,
	"original_video_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text,
	"product_type" text DEFAULT 'physical' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"discount_price" numeric(10, 2),
	"discount_percentage" numeric(5, 2),
	"category" text NOT NULL,
	"subcategory" text,
	"tags" text[],
	"images" text[],
	"videos" text[],
	"thumbnail_image" text,
	"in_stock" boolean DEFAULT true,
	"stock_quantity" integer,
	"limited_quantity" boolean DEFAULT false,
	"allow_backorder" boolean DEFAULT false,
	"status" text DEFAULT 'active',
	"is_digital" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"is_sponsored" boolean DEFAULT false,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text[],
	"average_rating" numeric(3, 2) DEFAULT '0',
	"total_reviews" integer DEFAULT 0,
	"total_sales" integer DEFAULT 0,
	"shipping_required" boolean DEFAULT true,
	"shipping_weight" numeric(8, 3),
	"shipping_dimensions" jsonb,
	"delivery_methods" text[],
	"boost_level" integer DEFAULT 0,
	"boosted_until" timestamp,
	"campaign_ids" text[],
	"view_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"favorite_count" integer DEFAULT 0,
	"download_url" text,
	"license_type" text,
	"download_limit" integer,
	"service_delivery_time" text,
	"service_type" text,
	"hourly_rate" numeric(10, 2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"username" text,
	"full_name" text,
	"name" text,
	"bio" text,
	"avatar" text,
	"avatar_url" text,
	"is_verified" boolean DEFAULT false,
	"level" text DEFAULT 'bronze',
	"points" integer DEFAULT 0,
	"role" text DEFAULT 'user',
	"status" text DEFAULT 'active',
	"bank_account_name" text,
	"bank_account_number" text,
	"bank_name" text,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "project_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"milestone_id" uuid,
	"uploaded_by" uuid NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"size" integer NOT NULL,
	"type" text NOT NULL,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" text DEFAULT 'pending',
	"deliverables" text[],
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" uuid,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"amount" numeric(15, 8) NOT NULL,
	"price_per_unit" numeric(10, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"status" text DEFAULT 'pending',
	"escrow_id" uuid,
	"dispute_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"email_confirmed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"employee_id" text,
	"department" text,
	"position" text,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"settings" jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "boosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"reference_id" uuid NOT NULL,
	"boost_type" text NOT NULL,
	"duration" integer NOT NULL,
	"priority" integer DEFAULT 1,
	"cost" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'SOFT_POINTS',
	"payment_method" text NOT NULL,
	"status" text DEFAULT 'pending',
	"approved_by" uuid,
	"approved_at" timestamp,
	"start_date" timestamp,
	"end_date" timestamp,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"admin_notes" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaign_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"requested_by" uuid NOT NULL,
	"status" text DEFAULT 'pending',
	"approved_by" uuid,
	"approved_at" timestamp,
	"custom_discount" numeric(10, 2),
	"featured_order" integer DEFAULT 0,
	"campaign_views" integer DEFAULT 0,
	"campaign_clicks" integer DEFAULT 0,
	"campaign_sales" integer DEFAULT 0,
	"campaign_revenue" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"banner_image" text,
	"banner_text" text,
	"background_color" text,
	"text_color" text,
	"eligibility_criteria" jsonb,
	"discount_type" text,
	"discount_value" numeric(10, 2),
	"max_discount" numeric(10, 2),
	"min_order_amount" numeric(10, 2),
	"max_participants" integer,
	"max_products_per_seller" integer,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0,
	"status" text DEFAULT 'draft',
	"is_public" boolean DEFAULT true,
	"requires_approval" boolean DEFAULT false,
	"created_by" uuid NOT NULL,
	"view_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"conversion_count" integer DEFAULT 0,
	"total_revenue" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "campaigns_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_snapshot" numeric(10, 2) NOT NULL,
	"custom_options" jsonb,
	"notes" text,
	"added_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"reference_id" uuid,
	"participants" jsonb NOT NULL,
	"created_by" uuid NOT NULL,
	"title" text,
	"description" text,
	"is_group" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"last_message_id" uuid,
	"last_message_at" timestamp,
	"message_count" integer DEFAULT 0,
	"is_encrypted" boolean DEFAULT false,
	"is_muted" boolean DEFAULT false,
	"muted_by" uuid,
	"muted_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"content_type" varchar(20) NOT NULL,
	"content_id" uuid NOT NULL,
	"reason" varchar(50) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"action" varchar(30),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"content_id" uuid,
	"content_type" text,
	"amount" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"soft_points_earned" numeric(20, 2) DEFAULT '0',
	"view_count" integer DEFAULT 0,
	"tip_amount" numeric(20, 8) DEFAULT '0',
	"subscription_amount" numeric(20, 8) DEFAULT '0',
	"from_user_id" uuid,
	"status" text DEFAULT 'pending',
	"payout_id" uuid,
	"description" text,
	"metadata" jsonb,
	"earned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "creator_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"soft_points_amount" numeric(20, 2) DEFAULT '0',
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"payment_method" text NOT NULL,
	"payment_details" jsonb,
	"status" text DEFAULT 'pending',
	"processed_at" timestamp,
	"completed_at" timestamp,
	"failure_reason" text,
	"processed_by" uuid,
	"admin_notes" text,
	"transaction_ids" text[],
	"external_transaction_id" text,
	"processing_fee" numeric(10, 2) DEFAULT '0',
	"net_amount" numeric(20, 8) NOT NULL,
	"requested_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "escrow_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payer_id" uuid NOT NULL,
	"payee_id" uuid NOT NULL,
	"type" text NOT NULL,
	"reference_id" uuid NOT NULL,
	"currency" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"platform_fee" numeric(20, 8) DEFAULT '0',
	"fee_percentage" numeric(5, 2) DEFAULT '0',
	"terms" text NOT NULL,
	"auto_release_hours" integer DEFAULT 72,
	"status" text DEFAULT 'created',
	"funded_at" timestamp,
	"released_at" timestamp,
	"refunded_at" timestamp,
	"expires_at" timestamp,
	"release_condition" text DEFAULT 'manual',
	"release_approved_by" uuid,
	"release_notes" text,
	"dispute_id" uuid,
	"dispute_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "escrow_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escrow_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"amount" numeric(20, 8) NOT NULL,
	"due_date" timestamp,
	"status" text DEFAULT 'pending',
	"submitted_at" timestamp,
	"approved_at" timestamp,
	"released_at" timestamp,
	"deliverables" jsonb,
	"review_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"raised_by" uuid NOT NULL,
	"against_user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"reason" text NOT NULL,
	"description" text NOT NULL,
	"evidence" jsonb,
	"disputed_amount" numeric(10, 2),
	"requested_resolution" text,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'medium',
	"assigned_to" uuid,
	"mediator_notes" text,
	"resolution" text,
	"resolution_type" text,
	"resolution_amount" numeric(10, 2),
	"respond_by_date" timestamp,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"order_number" text NOT NULL,
	"order_type" text DEFAULT 'marketplace',
	"items" jsonb NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"shipping_cost" numeric(10, 2) DEFAULT '0',
	"tax" numeric(10, 2) DEFAULT '0',
	"discount" numeric(10, 2) DEFAULT '0',
	"discount_code" text,
	"total" numeric(10, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"payment_currency" text NOT NULL,
	"payment_status" text DEFAULT 'pending',
	"escrow_id" uuid,
	"payment_transaction_id" uuid,
	"shipping_address" jsonb,
	"billing_address" jsonb,
	"shipping_method" text,
	"tracking_number" text,
	"tracking_url" text,
	"estimated_delivery" timestamp,
	"actual_delivery" timestamp,
	"download_urls" text[],
	"download_expires_at" timestamp,
	"download_count" integer DEFAULT 0,
	"download_limit" integer,
	"status" text DEFAULT 'pending',
	"fulfillment_status" text DEFAULT 'pending',
	"requires_shipping" boolean DEFAULT true,
	"auto_complete_after_days" integer DEFAULT 7,
	"chat_thread_id" uuid,
	"customer_notes" text,
	"seller_notes" text,
	"admin_notes" text,
	"confirmed_at" timestamp,
	"processing_at" timestamp,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"platform_fee" numeric(10, 2) DEFAULT '0',
	"fee_percentage" numeric(5, 2) DEFAULT '5.0',
	"seller_revenue" numeric(10, 2),
	"dispute_id" uuid,
	"dispute_reason" text,
	"return_requested" boolean DEFAULT false,
	"return_requested_at" timestamp,
	"return_reason" text,
	"return_status" text,
	"refund_amount" numeric(10, 2),
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "marketplace_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "marketplace_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"overall_rating" integer NOT NULL,
	"quality_rating" integer,
	"value_rating" integer,
	"shipping_rating" integer,
	"service_rating" integer,
	"delivery_rating" integer,
	"communication_rating" integer,
	"accuracy_rating" integer,
	"title" text,
	"comment" text NOT NULL,
	"pros" text[],
	"cons" text[],
	"variant_purchased" text,
	"use_case" text,
	"would_recommend" boolean,
	"images" text[],
	"videos" text[],
	"is_verified_purchase" boolean DEFAULT true,
	"purchase_verified" boolean DEFAULT false,
	"review_source" text DEFAULT 'marketplace',
	"is_flagged" boolean DEFAULT false,
	"flagged_reason" text,
	"moderation_status" text DEFAULT 'approved',
	"moderated_by" uuid,
	"moderated_at" timestamp,
	"helpfulness_score" numeric(3, 2) DEFAULT '0',
	"quality_score" numeric(3, 2) DEFAULT '0',
	"helpful_votes" integer DEFAULT 0,
	"total_votes" integer DEFAULT 0,
	"report_count" integer DEFAULT 0,
	"seller_response_id" uuid,
	"reward_earned" numeric(10, 2) DEFAULT '0',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "monetized_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_id" uuid NOT NULL,
	"content_type" text NOT NULL,
	"title" text,
	"description" text,
	"is_monetized" boolean DEFAULT true,
	"monetization_type" text NOT NULL,
	"min_tip_amount" numeric(10, 2) DEFAULT '1',
	"subscription_price" numeric(10, 2),
	"pay_per_view_price" numeric(10, 2),
	"total_views" integer DEFAULT 0,
	"total_earnings" numeric(20, 8) DEFAULT '0',
	"total_tips" numeric(20, 8) DEFAULT '0',
	"total_soft_points" numeric(20, 2) DEFAULT '0',
	"tip_count" integer DEFAULT 0,
	"subscription_count" integer DEFAULT 0,
	"revenue_breakdown" jsonb,
	"approval_status" text DEFAULT 'approved',
	"approved_by" uuid,
	"approved_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_status_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"reason" text,
	"notes" text,
	"changed_by" uuid NOT NULL,
	"changed_by_type" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "p2p_disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" uuid NOT NULL,
	"raised_by" uuid NOT NULL,
	"reason" text NOT NULL,
	"description" text NOT NULL,
	"evidence" jsonb,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'medium',
	"assigned_to" uuid,
	"admin_notes" text,
	"resolution" text,
	"resolution_type" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "p2p_trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"crypto_type" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"price_per_unit" numeric(10, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"payment_window" integer DEFAULT 30,
	"status" text DEFAULT 'pending',
	"escrow_id" uuid,
	"escrow_address" text,
	"escrow_tx_hash" text,
	"chat_thread_id" uuid,
	"payment_deadline" timestamp,
	"release_deadline" timestamp,
	"payment_confirmed_at" timestamp,
	"payment_confirmed_by" uuid,
	"crypto_released_at" timestamp,
	"dispute_id" uuid,
	"platform_fee" numeric(10, 2) DEFAULT '0',
	"fee_percentage" numeric(5, 2) DEFAULT '0.3',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "platform_earnings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" text NOT NULL,
	"reference_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"gross_amount" numeric(20, 8) NOT NULL,
	"fee_amount" numeric(20, 8) NOT NULL,
	"fee_percentage" numeric(5, 2) NOT NULL,
	"currency" text NOT NULL,
	"usd_amount" numeric(15, 2),
	"exchange_rate" numeric(15, 8),
	"description" text,
	"metadata" jsonb,
	"earned_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "premium_benefits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" text NOT NULL,
	"benefit" text NOT NULL,
	"value" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "premium_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" text NOT NULL,
	"status" text DEFAULT 'active',
	"billing_type" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USDT',
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"next_billing_date" timestamp,
	"monthly_boost_credits" integer DEFAULT 0,
	"used_boost_credits" integer DEFAULT 0,
	"fee_discount_percentage" numeric(5, 2) DEFAULT '0',
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"last_payment_at" timestamp,
	"payment_failures" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid,
	"event_type" text NOT NULL,
	"referrer_url" text,
	"source" text,
	"campaign" text,
	"ip_address" text,
	"user_agent" text,
	"device_type" text,
	"country" text,
	"city" text,
	"session_id" text,
	"session_duration" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_boosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"boost_type" text NOT NULL,
	"duration" integer NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"currency" text NOT NULL,
	"payment_method" text NOT NULL,
	"transaction_id" uuid,
	"status" text DEFAULT 'pending',
	"start_date" timestamp,
	"end_date" timestamp,
	"requires_approval" boolean DEFAULT false,
	"approved_by" uuid,
	"approved_at" timestamp,
	"rejection_reason" text,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"conversion_value" numeric(15, 2) DEFAULT '0',
	"roi" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"level" integer DEFAULT 0,
	"path" text,
	"icon" text,
	"image" text,
	"color" text,
	"sort_order" integer DEFAULT 0,
	"seo_title" text,
	"seo_description" text,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"product_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"discount_price" numeric(10, 2),
	"discount_percentage" numeric(5, 2),
	"change_reason" text,
	"changed_by" uuid,
	"effective_from" timestamp NOT NULL,
	"effective_to" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source_product_id" uuid,
	"recommended_product_id" uuid NOT NULL,
	"algorithm" text NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"context" text,
	"shown" boolean DEFAULT false,
	"clicked" boolean DEFAULT false,
	"purchased" boolean DEFAULT false,
	"shown_at" timestamp,
	"clicked_at" timestamp,
	"purchased_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sku" text,
	"price_adjustment" numeric(10, 2) DEFAULT '0',
	"attributes" jsonb NOT NULL,
	"stock_quantity" integer DEFAULT 0,
	"in_stock" boolean DEFAULT true,
	"images" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "revenue_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_type" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"soft_points_change" numeric(20, 2) DEFAULT '0',
	"content_id" uuid,
	"from_user_id" uuid,
	"to_user_id" uuid,
	"source_details" jsonb,
	"platform_fee" numeric(20, 8) DEFAULT '0',
	"net_amount" numeric(20, 8) NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "review_helpfulness" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_helpful" boolean NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "review_helpfulness_review_id_user_id_unique" UNIQUE("review_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "review_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"response" text NOT NULL,
	"moderation_status" text DEFAULT 'approved',
	"moderated_by" uuid,
	"moderated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seller_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"analytics_date" timestamp NOT NULL,
	"period" text NOT NULL,
	"total_orders" integer DEFAULT 0,
	"total_revenue" numeric(15, 2) DEFAULT '0',
	"total_units_sold" integer DEFAULT 0,
	"average_order_value" numeric(10, 2) DEFAULT '0',
	"total_products" integer DEFAULT 0,
	"active_products" integer DEFAULT 0,
	"out_of_stock_products" integer DEFAULT 0,
	"unique_customers" integer DEFAULT 0,
	"repeat_customers" integer DEFAULT 0,
	"customer_retention_rate" numeric(5, 2) DEFAULT '0',
	"total_views" integer DEFAULT 0,
	"total_clicks" integer DEFAULT 0,
	"conversion_rate" numeric(5, 2) DEFAULT '0',
	"average_rating" numeric(3, 2) DEFAULT '0',
	"total_reviews" integer DEFAULT 0,
	"positive_review_rate" numeric(5, 2) DEFAULT '0',
	"average_response_time" integer DEFAULT 0,
	"response_rate" numeric(5, 2) DEFAULT '0',
	"on_time_delivery_rate" numeric(5, 2) DEFAULT '0',
	"average_shipping_time" numeric(5, 2) DEFAULT '0',
	"total_disputes" integer DEFAULT 0,
	"dispute_resolution_rate" numeric(5, 2) DEFAULT '0',
	"total_boosts" integer DEFAULT 0,
	"boost_roi" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seller_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"overall_score" numeric(5, 2) NOT NULL,
	"quality_score" numeric(5, 2) DEFAULT '0',
	"service_score" numeric(5, 2) DEFAULT '0',
	"delivery_score" numeric(5, 2) DEFAULT '0',
	"communication_score" numeric(5, 2) DEFAULT '0',
	"factors" jsonb,
	"tier" text DEFAULT 'bronze',
	"badges" text[],
	"previous_score" numeric(5, 2),
	"score_change" numeric(5, 2) DEFAULT '0',
	"calculated_at" timestamp DEFAULT now(),
	"next_calculation_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shopping_carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "soft_points_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(20, 2) NOT NULL,
	"balance_after" numeric(20, 2) NOT NULL,
	"source_type" text NOT NULL,
	"source_id" uuid,
	"calculation_rule" text,
	"multiplier" numeric(5, 2) DEFAULT '1',
	"status" text DEFAULT 'confirmed',
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"tier" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USDT',
	"billing_cycle" text DEFAULT 'monthly',
	"status" text DEFAULT 'active',
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"next_billing_date" timestamp,
	"last_payment_date" timestamp,
	"benefits" jsonb,
	"access_level" text DEFAULT 'basic',
	"total_paid" numeric(20, 8) DEFAULT '0',
	"payment_failures" integer DEFAULT 0,
	"last_payment_attempt" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"cancelled_by" uuid,
	"auto_renew" boolean DEFAULT true,
	"renewal_attempts" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_suspensions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"reason" text NOT NULL,
	"description" text,
	"duration" integer,
	"expires_at" timestamp,
	"restrictions" jsonb,
	"suspended_by" uuid NOT NULL,
	"admin_notes" text,
	"is_active" boolean DEFAULT true,
	"lifted_by" uuid,
	"lifted_at" timestamp,
	"lift_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"currency" text NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"fee" numeric(20, 8) DEFAULT '0',
	"net_amount" numeric(20, 8) NOT NULL,
	"reference_type" text,
	"reference_id" uuid,
	"related_user_id" uuid,
	"external_tx_hash" text,
	"external_tx_id" text,
	"status" text DEFAULT 'pending',
	"confirmations" integer DEFAULT 0,
	"required_confirmations" integer DEFAULT 1,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"usdt_balance" numeric(20, 8) DEFAULT '0',
	"eth_balance" numeric(20, 8) DEFAULT '0',
	"btc_balance" numeric(20, 8) DEFAULT '0',
	"soft_points_balance" numeric(20, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"is_frozen" boolean DEFAULT false,
	"freeze_reason" text,
	"frozen_by" uuid,
	"frozen_at" timestamp,
	"backup_seed" text,
	"last_backup_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wishlist_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"preferred_variant_id" uuid,
	"notify_on_sale" boolean DEFAULT false,
	"notify_on_restock" boolean DEFAULT false,
	"target_price" numeric(10, 2),
	"price_when_added" numeric(10, 2),
	"lowest_price_seen" numeric(10, 2),
	"notes" text,
	"priority" integer DEFAULT 1,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text DEFAULT 'My Wishlist',
	"description" text,
	"is_public" boolean DEFAULT false,
	"is_default" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"key_hash" text NOT NULL,
	"permissions" jsonb NOT NULL,
	"created_by" uuid NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"priority" integer DEFAULT 1,
	"action_url" text,
	"metadata" jsonb,
	"read_by" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"permissions" jsonb NOT NULL,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "moderation_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"reported_by" uuid,
	"reason" text NOT NULL,
	"description" text,
	"priority" integer DEFAULT 1,
	"status" text DEFAULT 'pending',
	"assigned_to" uuid,
	"reviewed_by" uuid,
	"review_notes" text,
	"actions" jsonb,
	"evidence" jsonb,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false,
	"is_editable" boolean DEFAULT true,
	"required_permission" text,
	"last_modified_by" uuid,
	"modified_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"target_id" uuid,
	"target_type" text,
	"base_soft_points" numeric(10, 2) DEFAULT '0',
	"final_soft_points" numeric(10, 2) DEFAULT '0',
	"wallet_bonus" numeric(20, 8) DEFAULT '0',
	"currency" text DEFAULT 'USDT',
	"decay_factor" numeric(5, 4) DEFAULT '1.0',
	"trust_multiplier" numeric(3, 2) DEFAULT '1.0',
	"quality_score" numeric(3, 2) DEFAULT '1.0',
	"context" jsonb,
	"status" text DEFAULT 'confirmed',
	"processed_at" timestamp,
	"reviewed_by" uuid,
	"review_notes" text,
	"daily_count" integer DEFAULT 1,
	"weekly_count" integer DEFAULT 1,
	"monthly_count" integer DEFAULT 1,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boost_shop_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"soft_points_cost" numeric(10, 2) DEFAULT '0',
	"wallet_cost" numeric(20, 8) DEFAULT '0',
	"currency" text DEFAULT 'USDT',
	"boost_type" text NOT NULL,
	"boost_value" numeric(10, 4) NOT NULL,
	"duration" integer,
	"is_active" boolean DEFAULT true,
	"stock_quantity" integer,
	"max_purchases_per_user" integer,
	"required_trust_score" numeric(5, 2) DEFAULT '0',
	"icon_url" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "challenge_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"current_progress" integer DEFAULT 0,
	"current_value" numeric(15, 2) DEFAULT '0',
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"reward_claimed" boolean DEFAULT false,
	"reward_claimed_at" timestamp,
	"progress_data" jsonb,
	"last_reset_at" timestamp,
	"completion_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "challenge_progress_user_id_challenge_id_unique" UNIQUE("user_id","challenge_id")
);
--> statement-breakpoint
CREATE TABLE "daily_activity_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"total_activities" integer DEFAULT 0,
	"unique_action_types" integer DEFAULT 0,
	"social_activities" integer DEFAULT 0,
	"commercial_activities" integer DEFAULT 0,
	"content_activities" integer DEFAULT 0,
	"freelance_activities" integer DEFAULT 0,
	"total_soft_points_earned" numeric(15, 2) DEFAULT '0',
	"total_wallet_bonus_earned" numeric(20, 8) DEFAULT '0',
	"average_quality_score" numeric(3, 2) DEFAULT '0',
	"suspicious_activities" integer DEFAULT 0,
	"login_streak" integer DEFAULT 0,
	"activity_streak" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_activity_summaries_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "daily_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"challenge_type" text NOT NULL,
	"target_action" text NOT NULL,
	"target_count" integer DEFAULT 1,
	"target_value" numeric(15, 2),
	"soft_points_reward" numeric(10, 2) DEFAULT '0',
	"wallet_reward" numeric(20, 8) DEFAULT '0',
	"special_reward" jsonb,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"reset_period" text DEFAULT 'daily',
	"max_participants" integer,
	"current_participants" integer DEFAULT 0,
	"eligibility_criteria" jsonb,
	"is_active" boolean DEFAULT true,
	"is_visible" boolean DEFAULT true,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_detection_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"risk_score" numeric(5, 2) NOT NULL,
	"risk_level" text NOT NULL,
	"detection_method" text NOT NULL,
	"activity_log_id" uuid,
	"flagged_actions" jsonb,
	"risk_factors" jsonb,
	"patterns" jsonb,
	"action_taken" text,
	"action_reason" text,
	"action_taken_by" uuid,
	"action_taken_at" timestamp,
	"review_status" text DEFAULT 'pending',
	"reviewed_by" uuid,
	"review_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_link_id" uuid NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referee_id" uuid,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"ip_address" text,
	"user_agent" text,
	"referrer_url" text,
	"referrer_reward" numeric(10, 2) DEFAULT '0',
	"referee_reward" numeric(10, 2) DEFAULT '0',
	"reward_status" text DEFAULT 'pending',
	"processed_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referral_code" text NOT NULL,
	"referral_url" text NOT NULL,
	"type" text DEFAULT 'general',
	"campaign_id" uuid,
	"click_count" integer DEFAULT 0,
	"signup_count" integer DEFAULT 0,
	"conversion_count" integer DEFAULT 0,
	"referrer_reward" numeric(10, 2) DEFAULT '10',
	"referee_reward" numeric(10, 2) DEFAULT '5',
	"revenue_share_percentage" numeric(5, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0,
	"expires_at" timestamp,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "referral_links_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "reward_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_type" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"base_soft_points" numeric(10, 2) DEFAULT '0',
	"base_wallet_bonus" numeric(20, 8) DEFAULT '0',
	"currency" text DEFAULT 'USDT',
	"daily_limit" integer,
	"weekly_limit" integer,
	"monthly_limit" integer,
	"minimum_trust_score" numeric(5, 2) DEFAULT '0',
	"minimum_value" numeric(15, 2),
	"decay_enabled" boolean DEFAULT true,
	"decay_start" integer DEFAULT 1,
	"decay_rate" numeric(5, 4) DEFAULT '0.1',
	"min_multiplier" numeric(3, 2) DEFAULT '0.1',
	"requires_moderation" boolean DEFAULT false,
	"quality_threshold" numeric(3, 2) DEFAULT '0',
	"conditions" jsonb,
	"is_active" boolean DEFAULT true,
	"active_from" timestamp,
	"active_to" timestamp,
	"created_by" uuid,
	"last_modified_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "reward_rules_action_type_unique" UNIQUE("action_type")
);
--> statement-breakpoint
CREATE TABLE "trust_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_score" numeric(5, 2) DEFAULT '50',
	"previous_score" numeric(5, 2) DEFAULT '50',
	"max_score" numeric(5, 2) DEFAULT '100',
	"trust_level" text DEFAULT 'bronze',
	"reward_multiplier" numeric(3, 2) DEFAULT '1.0',
	"daily_soft_points_cap" integer DEFAULT 100,
	"total_activities" integer DEFAULT 0,
	"diversity_score" numeric(5, 2) DEFAULT '0',
	"consistency_score" numeric(5, 2) DEFAULT '0',
	"suspicious_activity_count" integer DEFAULT 0,
	"last_suspicious_activity" timestamp,
	"is_frozen" boolean DEFAULT false,
	"freeze_reason" text,
	"frozen_until" timestamp,
	"score_history" jsonb,
	"last_calculated_at" timestamp DEFAULT now(),
	"next_calculation_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_boosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"boost_item_id" uuid NOT NULL,
	"price_paid" numeric(20, 8) NOT NULL,
	"currency" text NOT NULL,
	"payment_method" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"activated_at" timestamp,
	"expires_at" timestamp,
	"usage_count" integer DEFAULT 0,
	"max_usage" integer,
	"boost_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "battle_bets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"bettor_id" uuid NOT NULL,
	"creator_bet_on" uuid NOT NULL,
	"bet_amount_sp" numeric(10, 2) NOT NULL,
	"odds" numeric(5, 2) DEFAULT '2.0' NOT NULL,
	"outcome" text,
	"payout_sp" numeric(10, 2) DEFAULT '0',
	"status" text DEFAULT 'active' NOT NULL,
	"placed_at" timestamp DEFAULT now(),
	"settled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "battle_gifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"gift_type" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"soft_points_value" numeric(10, 2) NOT NULL,
	"is_combo" boolean DEFAULT false,
	"combo_count" integer DEFAULT 1,
	"combo_multiplier" numeric(5, 2) DEFAULT '1.0',
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "battle_highlights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"title" text NOT NULL,
	"duration" integer NOT NULL,
	"highlight_url" text NOT NULL,
	"thumbnail_url" text,
	"key_moments" jsonb,
	"top_gifter_id" uuid,
	"biggest_gift" numeric(10, 2),
	"views" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"status" text DEFAULT 'processing' NOT NULL,
	"is_published" boolean DEFAULT false,
	"generated_at" timestamp DEFAULT now(),
	"processing_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "battle_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"inviter_id" uuid NOT NULL,
	"invitee_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"message" text,
	"sent_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"score" numeric(10, 2) DEFAULT '0',
	"ranking" integer,
	"views" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"status" text DEFAULT 'submitted' NOT NULL,
	"disqualification_reason" text,
	"reward_earned" numeric(10, 2) DEFAULT '0',
	"reward_paid" boolean DEFAULT false,
	"submitted_at" timestamp DEFAULT now(),
	"judged_at" timestamp,
	CONSTRAINT "challenge_submissions_challenge_id_user_id_unique" UNIQUE("challenge_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "content_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" text NOT NULL,
	"content_id" uuid NOT NULL,
	"flagged_by" uuid,
	"flag_type" text NOT NULL,
	"ai_confidence" numeric(5, 2),
	"ai_reason" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"review_notes" text,
	"action_taken" text,
	"flagged_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "creator_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_tier" text DEFAULT 'rising_star' NOT NULL,
	"tier_points" integer DEFAULT 0,
	"total_views" integer DEFAULT 0,
	"total_duets" integer DEFAULT 0,
	"battles_won" integer DEFAULT 0,
	"battles_lost" integer DEFAULT 0,
	"challenges_won" integer DEFAULT 0,
	"total_earnings" numeric(15, 2) DEFAULT '0',
	"tier_history" jsonb,
	"badges" text[],
	"achievements" jsonb,
	"monthly_bonus" numeric(10, 2) DEFAULT '0',
	"featured_until" timestamp,
	"has_legend_status" boolean DEFAULT false,
	"last_calculated" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "creator_tiers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "duet_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"hashtag" text NOT NULL,
	"original_post_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"is_sponsored" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"first_prize" numeric(10, 2) DEFAULT '100',
	"second_prize" numeric(10, 2) DEFAULT '50',
	"third_prize" numeric(10, 2) DEFAULT '25',
	"participation_reward" numeric(10, 2) DEFAULT '5',
	"total_submissions" integer DEFAULT 0,
	"total_views" integer DEFAULT 0,
	"total_likes" integer DEFAULT 0,
	"banner_url" text,
	"rules" text,
	"tags" text[],
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "duet_challenges_hashtag_unique" UNIQUE("hashtag")
);
--> statement-breakpoint
CREATE TABLE "live_battles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator1_id" uuid NOT NULL,
	"creator2_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"duration" integer DEFAULT 300 NOT NULL,
	"battle_type" text DEFAULT 'live' NOT NULL,
	"status" text DEFAULT 'waiting' NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"winner_id" uuid,
	"creator1_score" integer DEFAULT 0,
	"creator2_score" integer DEFAULT 0,
	"total_gifts" numeric(15, 2) DEFAULT '0',
	"total_viewers" integer DEFAULT 0,
	"peak_viewers" integer DEFAULT 0,
	"total_bets" numeric(15, 2) DEFAULT '0',
	"bet_pool" numeric(15, 2) DEFAULT '0',
	"stream_url" text,
	"replay_url" text,
	"highlight_url" text,
	"thumbnail_url" text,
	"allow_betting" boolean DEFAULT true,
	"is_public" boolean DEFAULT true,
	"is_recorded" boolean DEFAULT true,
	"tags" text[],
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reward_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"source_type" text,
	"source_id" uuid,
	"base_amount" numeric(10, 2),
	"multiplier" numeric(5, 2) DEFAULT '1.0',
	"bonus_reason" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"duets_today" integer DEFAULT 0,
	"battles_today" integer DEFAULT 0,
	"bets_today" integer DEFAULT 0,
	"trust_score" integer DEFAULT 100,
	"flagged_content" integer DEFAULT 0,
	"warnings_received" integer DEFAULT 0,
	"is_restricted" boolean DEFAULT false,
	"restriction_reason" text,
	"restriction_until" timestamp,
	"last_duet_reset" timestamp DEFAULT now(),
	"last_battle_reset" timestamp DEFAULT now(),
	"last_bet_reset" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_limits_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "battle_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"vote_weight" numeric(3, 2) DEFAULT '1.00',
	"is_judge_vote" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_stream_viewers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stream_id" uuid NOT NULL,
	"user_id" uuid,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp,
	"watch_duration" integer DEFAULT 0,
	"device_type" varchar(20),
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "live_streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"viewer_count" integer DEFAULT 0 NOT NULL,
	"max_viewers" integer DEFAULT 0 NOT NULL,
	"stream_key" text NOT NULL,
	"stream_url" text,
	"playback_url" text,
	"category" varchar(50),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"allow_chat" boolean DEFAULT true NOT NULL,
	"allow_gifts" boolean DEFAULT true NOT NULL,
	"monetization_enabled" boolean DEFAULT false,
	"scheduled_start_time" timestamp,
	"actual_start_time" timestamp,
	"end_time" timestamp,
	"duration" integer,
	"recording_enabled" boolean DEFAULT true,
	"recording_url" text,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"duration" integer NOT NULL,
	"file_url" text NOT NULL,
	"genre" varchar(50),
	"mood" varchar(30),
	"bpm" integer,
	"key" varchar(10),
	"copyright_free" boolean DEFAULT false NOT NULL,
	"license_cost" numeric(8, 2) DEFAULT '0.00',
	"popularity_score" integer DEFAULT 0 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"waveform_data" jsonb,
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playlist_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"added_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"unique_views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"avg_watch_time" numeric(8, 2) DEFAULT '0.00',
	"completion_rate" numeric(5, 2) DEFAULT '0.00',
	"engagement" numeric(5, 2) DEFAULT '0.00',
	"revenue" numeric(10, 2) DEFAULT '0.00',
	"impressions" integer DEFAULT 0 NOT NULL,
	"click_through_rate" numeric(5, 2) DEFAULT '0.00',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_battles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"challenger_id" uuid,
	"video1_id" uuid NOT NULL,
	"video2_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"category" varchar(50),
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"duration" integer DEFAULT 7 NOT NULL,
	"voting_enabled" boolean DEFAULT true NOT NULL,
	"video1_votes" integer DEFAULT 0 NOT NULL,
	"video2_votes" integer DEFAULT 0 NOT NULL,
	"winner_id" uuid,
	"prize_pool" numeric(10, 2) DEFAULT '0.00',
	"entry_fee" numeric(10, 2) DEFAULT '0.00',
	"rules" jsonb,
	"judge_ids" jsonb DEFAULT '[]'::jsonb,
	"public_voting" boolean DEFAULT true,
	"min_followers" integer DEFAULT 0,
	"age_restricted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"parent_id" uuid,
	"like_count" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"pinned" boolean DEFAULT false,
	"edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_duets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_video_id" uuid NOT NULL,
	"duet_video_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"duet_type" varchar(20) DEFAULT 'split' NOT NULL,
	"split_position" varchar(10) DEFAULT 'right',
	"sync_offset" integer DEFAULT 0,
	"approved" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_playlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"video_count" integer DEFAULT 0 NOT NULL,
	"total_duration" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_processing_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"job_type" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 5 NOT NULL,
	"input_data" jsonb,
	"output_data" jsonb,
	"error_message" text,
	"progress" numeric(5, 2) DEFAULT '0.00',
	"started_at" timestamp,
	"completed_at" timestamp,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"processing_node" varchar(50),
	"estimated_duration" integer,
	"actual_duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"user_id" uuid,
	"platform" varchar(30) NOT NULL,
	"share_type" varchar(20) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "video_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"user_id" uuid,
	"ip_address" varchar(45),
	"user_agent" text,
	"watch_duration" integer DEFAULT 0 NOT NULL,
	"watch_percentage" numeric(5, 2) DEFAULT '0.00',
	"completed" boolean DEFAULT false,
	"device_type" varchar(20),
	"referrer" text,
	"location" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"filename" text NOT NULL,
	"original_filename" text NOT NULL,
	"file_size" integer NOT NULL,
	"duration" integer,
	"thumbnail" text,
	"status" varchar(20) DEFAULT 'processing' NOT NULL,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"category" varchar(50),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"hashtags" jsonb DEFAULT '[]'::jsonb,
	"view_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"share_count" integer DEFAULT 0 NOT NULL,
	"allow_comments" boolean DEFAULT true NOT NULL,
	"allow_duets" boolean DEFAULT true NOT NULL,
	"allow_downloads" boolean DEFAULT false NOT NULL,
	"location" text,
	"music_id" uuid,
	"aspect_ratio" varchar(10) DEFAULT '9:16',
	"quality" varchar(10) DEFAULT '720p',
	"content_warning" boolean DEFAULT false,
	"age_restricted" boolean DEFAULT false,
	"monetization_enabled" boolean DEFAULT false,
	"processing_data" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reaction_type" varchar(20) DEFAULT 'like' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"invited_by" uuid,
	"mute_notifications" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"avatar" text,
	"cover" text,
	"privacy" varchar(20) DEFAULT 'public' NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"post_count" integer DEFAULT 0 NOT NULL,
	"admin_ids" jsonb DEFAULT '[]'::jsonb,
	"moderator_ids" jsonb DEFAULT '[]'::jsonb,
	"rules" jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"category" varchar(50),
	"location" text,
	"website" text,
	"join_approval_required" boolean DEFAULT false,
	"post_approval_required" boolean DEFAULT false,
	"allow_events" boolean DEFAULT true,
	"verified" boolean DEFAULT false,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hashtags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag" varchar(100) NOT NULL,
	"usage_count" integer DEFAULT 1 NOT NULL,
	"trending_score" numeric(10, 2) DEFAULT '0.00',
	"category" varchar(50),
	"language" varchar(10),
	"is_blocked" boolean DEFAULT false,
	"last_used" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hashtags_tag_unique" UNIQUE("tag")
);
--> statement-breakpoint
CREATE TABLE "mentions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentioner_id" uuid NOT NULL,
	"mentioned_id" uuid NOT NULL,
	"content_type" varchar(20) NOT NULL,
	"content_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"response" text,
	"responded_at" timestamp,
	"verified" boolean DEFAULT false,
	"helpful" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"username" varchar(50),
	"description" text,
	"avatar" text,
	"cover" text,
	"category" varchar(50) NOT NULL,
	"sub_category" varchar(50),
	"website" text,
	"email" text,
	"phone" text,
	"address" text,
	"location" text,
	"business_hours" jsonb,
	"follower_count" integer DEFAULT 0 NOT NULL,
	"post_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"review_count" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false,
	"claimed" boolean DEFAULT false,
	"owner_id" uuid NOT NULL,
	"admin_ids" jsonb DEFAULT '[]'::jsonb,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pages_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "social_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text,
	"type" varchar(20) DEFAULT 'text' NOT NULL,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"media_urls" jsonb DEFAULT '[]'::jsonb,
	"mentions" jsonb DEFAULT '[]'::jsonb,
	"hashtags" jsonb DEFAULT '[]'::jsonb,
	"location" text,
	"like_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"share_count" integer DEFAULT 0 NOT NULL,
	"reach_count" integer DEFAULT 0 NOT NULL,
	"impression_count" integer DEFAULT 0 NOT NULL,
	"allow_comments" boolean DEFAULT true NOT NULL,
	"pinned" boolean DEFAULT false,
	"edited" boolean DEFAULT false,
	"scheduled_for" timestamp,
	"original_post_id" uuid,
	"group_id" uuid,
	"page_id" uuid,
	"poll_data" jsonb,
	"link_data" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text,
	"type" varchar(20) DEFAULT 'image' NOT NULL,
	"media_url" text,
	"background_color" varchar(7),
	"text_color" varchar(7),
	"font" varchar(30),
	"duration" integer DEFAULT 5,
	"view_count" integer DEFAULT 0 NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"music" text,
	"location" text,
	"mentions" jsonb DEFAULT '[]'::jsonb,
	"hashtags" jsonb DEFAULT '[]'::jsonb,
	"allow_replies" boolean DEFAULT true NOT NULL,
	"allow_screenshot" boolean DEFAULT true NOT NULL,
	"highlighted" boolean DEFAULT false,
	"expires_at" timestamp DEFAULT NOW() + INTERVAL '24 hours' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reaction_type" varchar(20) DEFAULT 'like' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text,
	"type" varchar(20) DEFAULT 'text' NOT NULL,
	"media_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"view_duration" integer DEFAULT 0,
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blocker_id" uuid NOT NULL,
	"blocked_id" uuid NOT NULL,
	"reason" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_chat_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"assistant_type" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp,
	"context" jsonb,
	"settings" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" varchar(10) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"attachments" jsonb,
	"feedback" varchar(20),
	"edited" boolean DEFAULT false,
	"token_count" integer,
	"processing_time" integer,
	"model_version" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_content_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" varchar(20) NOT NULL,
	"content_id" uuid NOT NULL,
	"analysis_type" varchar(30) NOT NULL,
	"results" jsonb NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"model_version" varchar(20) NOT NULL,
	"processing_time" integer,
	"flags" jsonb DEFAULT '[]'::jsonb,
	"score" numeric(5, 2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_content_moderation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" varchar(20) NOT NULL,
	"content_id" uuid NOT NULL,
	"moderation_result" varchar(20) NOT NULL,
	"flag_reasons" jsonb DEFAULT '[]'::jsonb,
	"confidence_score" numeric(5, 2) NOT NULL,
	"toxicity_score" numeric(5, 2),
	"spam_score" numeric(5, 2),
	"violence_score" numeric(5, 2),
	"adult_score" numeric(5, 2),
	"hate_speech_score" numeric(5, 2),
	"action_taken" varchar(30),
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"appeal_status" varchar(20),
	"model_version" varchar(20) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_crypto_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"analysis_type" varchar(30) NOT NULL,
	"timeframe" varchar(20) NOT NULL,
	"prediction" jsonb,
	"sentiment" varchar(20),
	"confidence_score" numeric(5, 2),
	"accuracy" numeric(5, 2),
	"market_factors" jsonb,
	"risk_level" varchar(20),
	"recommendation" varchar(20),
	"price_at_analysis" numeric(15, 8),
	"target_price" numeric(15, 8),
	"stop_loss" numeric(15, 8),
	"model_version" varchar(20) NOT NULL,
	"data_source" varchar(30),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ai_model_performance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_name" varchar(50) NOT NULL,
	"model_version" varchar(20) NOT NULL,
	"task_type" varchar(30) NOT NULL,
	"accuracy" numeric(5, 2),
	"precision" numeric(5, 2),
	"recall" numeric(5, 2),
	"f1_score" numeric(5, 2),
	"auc" numeric(5, 2),
	"processing_time" integer,
	"throughput" integer,
	"error_rate" numeric(5, 2),
	"memory_usage" integer,
	"cpu_usage" numeric(5, 2),
	"test_dataset" varchar(50),
	"evaluation_period" varchar(20),
	"deployment_status" varchar(20),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_personalization_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"interests" jsonb,
	"preferences" jsonb,
	"behavior_pattern" jsonb,
	"engagement_history" jsonb,
	"demographic_data" jsonb,
	"content_affinities" jsonb,
	"social_graph" jsonb,
	"session_data" jsonb,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"profile_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_personalization_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ai_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"recommendation_type" varchar(30) NOT NULL,
	"item_type" varchar(20) NOT NULL,
	"item_id" uuid NOT NULL,
	"score" numeric(8, 4) NOT NULL,
	"reasons" jsonb DEFAULT '[]'::jsonb,
	"context" varchar(30),
	"position" integer,
	"clicked" boolean DEFAULT false,
	"liked" boolean DEFAULT false,
	"shared" boolean DEFAULT false,
	"watch_time" integer,
	"engagement" numeric(5, 2) DEFAULT '0.00',
	"model_version" varchar(20) NOT NULL,
	"experiment_group" varchar(30),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_smart_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_type" varchar(30) NOT NULL,
	"priority" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"personalized_data" jsonb,
	"delivery_method" jsonb,
	"optimal_send_time" timestamp,
	"actual_send_time" timestamp,
	"opened" boolean DEFAULT false,
	"clicked" boolean DEFAULT false,
	"dismissed" boolean DEFAULT false,
	"engagement_score" numeric(5, 2),
	"relevance_score" numeric(5, 2),
	"sentiment_score" numeric(5, 2),
	"model_version" varchar(20),
	"ab_test_group" varchar(30),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_trend_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trend_type" varchar(30) NOT NULL,
	"identifier" text NOT NULL,
	"category" varchar(50),
	"current_score" numeric(10, 2) NOT NULL,
	"previous_score" numeric(10, 2),
	"velocity_score" numeric(10, 2),
	"peak_score" numeric(10, 2),
	"engagement" jsonb,
	"demographics" jsonb,
	"time_frame" varchar(20) NOT NULL,
	"predictions" jsonb,
	"related_trends" jsonb DEFAULT '[]'::jsonb,
	"model_version" varchar(20) NOT NULL,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_user_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"insight_type" varchar(30) NOT NULL,
	"category" varchar(30),
	"insights" jsonb NOT NULL,
	"actionable_recommendations" jsonb,
	"confidence_score" numeric(5, 2),
	"impact_score" numeric(5, 2),
	"timeframe" varchar(20),
	"valid_until" timestamp,
	"applied" boolean DEFAULT false,
	"effectiveness" numeric(5, 2),
	"model_version" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_id" uuid,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"unsubscribed_at" timestamp,
	"error_message" text,
	"ab_test_group" varchar(10),
	"personalized_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"platform" varchar(10) NOT NULL,
	"device_info" jsonb,
	"app_version" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used" timestamp DEFAULT now() NOT NULL,
	"badge_count" integer DEFAULT 0 NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "device_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "email_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text,
	"from_email" text NOT NULL,
	"from_name" text,
	"reply_to" text,
	"template_id" text,
	"template_data" jsonb,
	"priority" varchar(10) DEFAULT 'normal',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"bounced_at" timestamp,
	"unsubscribed_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"tracking_pixel" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"notification_type" varchar(30),
	"channel" varchar(20) NOT NULL,
	"campaign_id" uuid,
	"sent" integer DEFAULT 0 NOT NULL,
	"delivered" integer DEFAULT 0 NOT NULL,
	"opened" integer DEFAULT 0 NOT NULL,
	"clicked" integer DEFAULT 0 NOT NULL,
	"failed" integer DEFAULT 0 NOT NULL,
	"bounced" integer DEFAULT 0 NOT NULL,
	"unsubscribed" integer DEFAULT 0 NOT NULL,
	"cost" numeric(10, 4) DEFAULT '0.00',
	"open_rate" numeric(5, 2),
	"click_rate" numeric(5, 2),
	"delivery_rate" numeric(5, 2),
	"unsubscribe_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"template_id" uuid NOT NULL,
	"target_audience" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"total_recipients" integer DEFAULT 0 NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"delivered_count" integer DEFAULT 0 NOT NULL,
	"opened_count" integer DEFAULT 0 NOT NULL,
	"clicked_count" integer DEFAULT 0 NOT NULL,
	"unsubscribed_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"priority" varchar(10) DEFAULT 'medium',
	"ab_test_enabled" boolean DEFAULT false,
	"ab_test_config" jsonb,
	"frequency" varchar(20) DEFAULT 'once',
	"max_occurrences" integer,
	"current_occurrence" integer DEFAULT 0,
	"created_by" uuid NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"preferences" jsonb NOT NULL,
	"global_enabled" boolean DEFAULT true NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"sms_enabled" boolean DEFAULT false NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"quiet_hours_start" varchar(5),
	"quiet_hours_end" varchar(5),
	"timezone" varchar(50),
	"frequency" varchar(20) DEFAULT 'instant',
	"digest" boolean DEFAULT false,
	"digest_time" varchar(5),
	"digest_days" jsonb DEFAULT '[]'::jsonb,
	"language" varchar(10) DEFAULT 'en',
	"unsubscribe_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(30) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"subject" text,
	"title" text,
	"body" text NOT NULL,
	"html_content" text,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"default_data" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by" uuid NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "push_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"device_token" text NOT NULL,
	"platform" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"icon" text,
	"image" text,
	"badge" integer,
	"sound" varchar(30),
	"click_action" text,
	"data" jsonb,
	"ttl" integer,
	"collapse_key" text,
	"priority" varchar(10) DEFAULT 'normal',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"clicked_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"phone_number" text NOT NULL,
	"message" text NOT NULL,
	"provider" varchar(20),
	"message_type" varchar(20) DEFAULT 'transactional',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"clicked_at" timestamp,
	"failed_at" timestamp,
	"error_message" text,
	"cost" numeric(8, 4),
	"segments" integer DEFAULT 1,
	"provider_id" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unsubscribe_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" text,
	"phone_number" text,
	"unsubscribe_type" varchar(20) NOT NULL,
	"notification_type" varchar(30),
	"reason" varchar(50),
	"comment" text,
	"source" varchar(30),
	"token" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_permissions" ADD CONSTRAINT "admin_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_thread_id_chat_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_reply_to_id_chat_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."chat_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_flagged_by_users_id_fk" FOREIGN KEY ("flagged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_moderation_queue" ADD CONSTRAINT "content_moderation_queue_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_moderation_queue" ADD CONSTRAINT "content_moderation_queue_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_moderation_queue" ADD CONSTRAINT "content_moderation_queue_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_disputes" ADD CONSTRAINT "freelance_disputes_project_id_freelance_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."freelance_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_disputes" ADD CONSTRAINT "freelance_disputes_escrow_id_freelance_escrow_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "public"."freelance_escrow"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_disputes" ADD CONSTRAINT "freelance_disputes_raised_by_users_id_fk" FOREIGN KEY ("raised_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_disputes" ADD CONSTRAINT "freelance_disputes_against_user_id_users_id_fk" FOREIGN KEY ("against_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_disputes" ADD CONSTRAINT "freelance_disputes_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_escrow" ADD CONSTRAINT "freelance_escrow_project_id_freelance_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."freelance_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_escrow" ADD CONSTRAINT "freelance_escrow_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_escrow" ADD CONSTRAINT "freelance_escrow_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_jobs" ADD CONSTRAINT "freelance_jobs_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_messages" ADD CONSTRAINT "freelance_messages_project_id_freelance_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."freelance_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_messages" ADD CONSTRAINT "freelance_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_projects" ADD CONSTRAINT "freelance_projects_job_id_freelance_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."freelance_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_projects" ADD CONSTRAINT "freelance_projects_proposal_id_freelance_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."freelance_proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_projects" ADD CONSTRAINT "freelance_projects_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_projects" ADD CONSTRAINT "freelance_projects_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_proposals" ADD CONSTRAINT "freelance_proposals_job_id_freelance_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."freelance_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_proposals" ADD CONSTRAINT "freelance_proposals_freelancer_id_users_id_fk" FOREIGN KEY ("freelancer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_reviews" ADD CONSTRAINT "freelance_reviews_project_id_freelance_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."freelance_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_reviews" ADD CONSTRAINT "freelance_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "freelance_reviews" ADD CONSTRAINT "freelance_reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_offers" ADD CONSTRAINT "p2p_offers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_duet_of_post_id_posts_id_fk" FOREIGN KEY ("duet_of_post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_original_creator_id_users_id_fk" FOREIGN KEY ("original_creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_freelance_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."freelance_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_milestone_id_project_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."project_milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_freelance_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."freelance_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_offer_id_p2p_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."p2p_offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_id_admin_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."admin_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boosts" ADD CONSTRAINT "boosts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boosts" ADD CONSTRAINT "boosts_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_products" ADD CONSTRAINT "campaign_products_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_products" ADD CONSTRAINT "campaign_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_products" ADD CONSTRAINT "campaign_products_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_products" ADD CONSTRAINT "campaign_products_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_shopping_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."shopping_carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_muted_by_users_id_fk" FOREIGN KEY ("muted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_earnings" ADD CONSTRAINT "creator_earnings_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_payouts" ADD CONSTRAINT "creator_payouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_payouts" ADD CONSTRAINT "creator_payouts_processed_by_admin_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_contracts" ADD CONSTRAINT "escrow_contracts_payer_id_users_id_fk" FOREIGN KEY ("payer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_contracts" ADD CONSTRAINT "escrow_contracts_payee_id_users_id_fk" FOREIGN KEY ("payee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_contracts" ADD CONSTRAINT "escrow_contracts_release_approved_by_users_id_fk" FOREIGN KEY ("release_approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_milestones" ADD CONSTRAINT "escrow_milestones_escrow_id_escrow_contracts_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "public"."escrow_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_disputes" ADD CONSTRAINT "marketplace_disputes_order_id_marketplace_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_disputes" ADD CONSTRAINT "marketplace_disputes_raised_by_users_id_fk" FOREIGN KEY ("raised_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_disputes" ADD CONSTRAINT "marketplace_disputes_against_user_id_users_id_fk" FOREIGN KEY ("against_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_disputes" ADD CONSTRAINT "marketplace_disputes_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_escrow_id_escrow_contracts_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "public"."escrow_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_payment_transaction_id_wallet_transactions_id_fk" FOREIGN KEY ("payment_transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_chat_thread_id_chat_threads_id_fk" FOREIGN KEY ("chat_thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_order_id_marketplace_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monetized_content" ADD CONSTRAINT "monetized_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monetized_content" ADD CONSTRAINT "monetized_content_approved_by_admin_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_logs" ADD CONSTRAINT "order_status_logs_order_id_marketplace_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_logs" ADD CONSTRAINT "order_status_logs_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_disputes" ADD CONSTRAINT "p2p_disputes_trade_id_p2p_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."p2p_trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_disputes" ADD CONSTRAINT "p2p_disputes_raised_by_users_id_fk" FOREIGN KEY ("raised_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_disputes" ADD CONSTRAINT "p2p_disputes_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_trades" ADD CONSTRAINT "p2p_trades_offer_id_p2p_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."p2p_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_trades" ADD CONSTRAINT "p2p_trades_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_trades" ADD CONSTRAINT "p2p_trades_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_trades" ADD CONSTRAINT "p2p_trades_escrow_id_escrow_contracts_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "public"."escrow_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_trades" ADD CONSTRAINT "p2p_trades_chat_thread_id_chat_threads_id_fk" FOREIGN KEY ("chat_thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "p2p_trades" ADD CONSTRAINT "p2p_trades_payment_confirmed_by_users_id_fk" FOREIGN KEY ("payment_confirmed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_earnings" ADD CONSTRAINT "platform_earnings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premium_subscriptions" ADD CONSTRAINT "premium_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_analytics" ADD CONSTRAINT "product_analytics_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_analytics" ADD CONSTRAINT "product_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_boosts" ADD CONSTRAINT "product_boosts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_boosts" ADD CONSTRAINT "product_boosts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_boosts" ADD CONSTRAINT "product_boosts_transaction_id_wallet_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_boosts" ADD CONSTRAINT "product_boosts_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_price_history" ADD CONSTRAINT "product_price_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_price_history" ADD CONSTRAINT "product_price_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations" ADD CONSTRAINT "product_recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations" ADD CONSTRAINT "product_recommendations_source_product_id_products_id_fk" FOREIGN KEY ("source_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_recommendations" ADD CONSTRAINT "product_recommendations_recommended_product_id_products_id_fk" FOREIGN KEY ("recommended_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_history" ADD CONSTRAINT "revenue_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_history" ADD CONSTRAINT "revenue_history_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_history" ADD CONSTRAINT "revenue_history_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_helpfulness" ADD CONSTRAINT "review_helpfulness_review_id_marketplace_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."marketplace_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_helpfulness" ADD CONSTRAINT "review_helpfulness_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_review_id_marketplace_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."marketplace_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_analytics" ADD CONSTRAINT "seller_analytics_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_scores" ADD CONSTRAINT "seller_scores_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shopping_carts" ADD CONSTRAINT "shopping_carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "soft_points_log" ADD CONSTRAINT "soft_points_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriber_id_users_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_suspended_by_admin_users_id_fk" FOREIGN KEY ("suspended_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_lifted_by_admin_users_id_fk" FOREIGN KEY ("lifted_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_related_user_id_users_id_fk" FOREIGN KEY ("related_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_frozen_by_users_id_fk" FOREIGN KEY ("frozen_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_wishlists_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_preferred_variant_id_product_variants_id_fk" FOREIGN KEY ("preferred_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_api_keys" ADD CONSTRAINT "admin_api_keys_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_notifications" ADD CONSTRAINT "admin_notifications_admin_id_admin_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_notifications" ADD CONSTRAINT "admin_notifications_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_assigned_to_admin_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_reviewed_by_admin_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_last_modified_by_admin_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boost_shop_items" ADD CONSTRAINT "boost_shop_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_progress" ADD CONSTRAINT "challenge_progress_challenge_id_daily_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."daily_challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_progress" ADD CONSTRAINT "challenge_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_activity_summaries" ADD CONSTRAINT "daily_activity_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_detection_logs" ADD CONSTRAINT "fraud_detection_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_detection_logs" ADD CONSTRAINT "fraud_detection_logs_activity_log_id_activity_logs_id_fk" FOREIGN KEY ("activity_log_id") REFERENCES "public"."activity_logs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_detection_logs" ADD CONSTRAINT "fraud_detection_logs_action_taken_by_users_id_fk" FOREIGN KEY ("action_taken_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fraud_detection_logs" ADD CONSTRAINT "fraud_detection_logs_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referral_link_id_referral_links_id_fk" FOREIGN KEY ("referral_link_id") REFERENCES "public"."referral_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referee_id_users_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_links" ADD CONSTRAINT "referral_links_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_rules" ADD CONSTRAINT "reward_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_rules" ADD CONSTRAINT "reward_rules_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_scores" ADD CONSTRAINT "trust_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_boosts" ADD CONSTRAINT "user_boosts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_boosts" ADD CONSTRAINT "user_boosts_boost_item_id_boost_shop_items_id_fk" FOREIGN KEY ("boost_item_id") REFERENCES "public"."boost_shop_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_bets" ADD CONSTRAINT "battle_bets_battle_id_live_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."live_battles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_bets" ADD CONSTRAINT "battle_bets_bettor_id_users_id_fk" FOREIGN KEY ("bettor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_bets" ADD CONSTRAINT "battle_bets_creator_bet_on_users_id_fk" FOREIGN KEY ("creator_bet_on") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_gifts" ADD CONSTRAINT "battle_gifts_battle_id_live_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."live_battles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_gifts" ADD CONSTRAINT "battle_gifts_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_gifts" ADD CONSTRAINT "battle_gifts_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_highlights" ADD CONSTRAINT "battle_highlights_battle_id_live_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."live_battles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_highlights" ADD CONSTRAINT "battle_highlights_top_gifter_id_users_id_fk" FOREIGN KEY ("top_gifter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_invitations" ADD CONSTRAINT "battle_invitations_battle_id_live_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."live_battles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_invitations" ADD CONSTRAINT "battle_invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_invitations" ADD CONSTRAINT "battle_invitations_invitee_id_users_id_fk" FOREIGN KEY ("invitee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "challenge_submissions_challenge_id_duet_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."duet_challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "challenge_submissions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "challenge_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_flagged_by_users_id_fk" FOREIGN KEY ("flagged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_flags" ADD CONSTRAINT "content_flags_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_tiers" ADD CONSTRAINT "creator_tiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duet_challenges" ADD CONSTRAINT "duet_challenges_original_post_id_posts_id_fk" FOREIGN KEY ("original_post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duet_challenges" ADD CONSTRAINT "duet_challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_battles" ADD CONSTRAINT "live_battles_creator1_id_users_id_fk" FOREIGN KEY ("creator1_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_battles" ADD CONSTRAINT "live_battles_creator2_id_users_id_fk" FOREIGN KEY ("creator2_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_battles" ADD CONSTRAINT "live_battles_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_transactions" ADD CONSTRAINT "reward_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_limits" ADD CONSTRAINT "user_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_priority_idx" ON "notifications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "notifications_scheduled_for_idx" ON "notifications" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_group_key_idx" ON "notifications" USING btree ("group_key");--> statement-breakpoint
CREATE INDEX "post_comments_post_idx" ON "post_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_comments_user_idx" ON "post_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "post_comments_parent_idx" ON "post_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "post_comments_created_at_idx" ON "post_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "post_likes_post_user_idx" ON "post_likes" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "post_likes_user_idx" ON "post_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "content_reports_reporter_idx" ON "content_reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "content_reports_content_idx" ON "content_reports" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "content_reports_status_idx" ON "content_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "battle_votes_battle_user_idx" ON "battle_votes" USING btree ("battle_id","user_id");--> statement-breakpoint
CREATE INDEX "battle_votes_battle_idx" ON "battle_votes" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "live_stream_viewers_stream_idx" ON "live_stream_viewers" USING btree ("stream_id");--> statement-breakpoint
CREATE INDEX "live_stream_viewers_user_idx" ON "live_stream_viewers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "live_streams_user_idx" ON "live_streams" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "live_streams_status_idx" ON "live_streams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "live_streams_scheduled_start_idx" ON "live_streams" USING btree ("scheduled_start_time");--> statement-breakpoint
CREATE INDEX "music_library_genre_idx" ON "music_library" USING btree ("genre");--> statement-breakpoint
CREATE INDEX "music_library_artist_idx" ON "music_library" USING btree ("artist");--> statement-breakpoint
CREATE INDEX "music_library_popularity_idx" ON "music_library" USING btree ("popularity_score");--> statement-breakpoint
CREATE INDEX "playlist_items_playlist_idx" ON "playlist_items" USING btree ("playlist_id");--> statement-breakpoint
CREATE INDEX "playlist_items_playlist_position_idx" ON "playlist_items" USING btree ("playlist_id","position");--> statement-breakpoint
CREATE INDEX "video_analytics_video_date_idx" ON "video_analytics" USING btree ("video_id","date");--> statement-breakpoint
CREATE INDEX "video_analytics_date_idx" ON "video_analytics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "video_battles_creator_idx" ON "video_battles" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "video_battles_challenger_idx" ON "video_battles" USING btree ("challenger_id");--> statement-breakpoint
CREATE INDEX "video_battles_status_idx" ON "video_battles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "video_battles_category_idx" ON "video_battles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "video_comment_likes_comment_user_idx" ON "video_comment_likes" USING btree ("comment_id","user_id");--> statement-breakpoint
CREATE INDEX "video_comments_video_idx" ON "video_comments" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "video_comments_user_idx" ON "video_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "video_comments_parent_idx" ON "video_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "video_comments_created_at_idx" ON "video_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "video_duets_original_idx" ON "video_duets" USING btree ("original_video_id");--> statement-breakpoint
CREATE INDEX "video_duets_duet_idx" ON "video_duets" USING btree ("duet_video_id");--> statement-breakpoint
CREATE INDEX "video_duets_user_idx" ON "video_duets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "video_likes_video_user_idx" ON "video_likes" USING btree ("video_id","user_id");--> statement-breakpoint
CREATE INDEX "video_likes_user_idx" ON "video_likes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "video_playlists_user_idx" ON "video_playlists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "video_playlists_visibility_idx" ON "video_playlists" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "video_processing_jobs_video_idx" ON "video_processing_jobs" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "video_processing_jobs_status_idx" ON "video_processing_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "video_processing_jobs_job_type_idx" ON "video_processing_jobs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "video_processing_jobs_priority_idx" ON "video_processing_jobs" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "video_shares_video_idx" ON "video_shares" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "video_shares_platform_idx" ON "video_shares" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "video_views_video_idx" ON "video_views" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "video_views_user_idx" ON "video_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "video_views_timestamp_idx" ON "video_views" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "videos_user_idx" ON "videos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "videos_status_idx" ON "videos" USING btree ("status");--> statement-breakpoint
CREATE INDEX "videos_visibility_idx" ON "videos" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "videos_category_idx" ON "videos" USING btree ("category");--> statement-breakpoint
CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "comment_likes_comment_user_idx" ON "comment_likes" USING btree ("comment_id","user_id");--> statement-breakpoint
CREATE INDEX "group_members_group_user_idx" ON "group_members" USING btree ("group_id","user_id");--> statement-breakpoint
CREATE INDEX "group_members_group_idx" ON "group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "group_members_user_idx" ON "group_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "groups_name_idx" ON "groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX "groups_privacy_idx" ON "groups" USING btree ("privacy");--> statement-breakpoint
CREATE INDEX "groups_category_idx" ON "groups" USING btree ("category");--> statement-breakpoint
CREATE INDEX "groups_member_count_idx" ON "groups" USING btree ("member_count");--> statement-breakpoint
CREATE INDEX "hashtags_tag_idx" ON "hashtags" USING btree ("tag");--> statement-breakpoint
CREATE INDEX "hashtags_usage_count_idx" ON "hashtags" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX "hashtags_trending_score_idx" ON "hashtags" USING btree ("trending_score");--> statement-breakpoint
CREATE INDEX "hashtags_last_used_idx" ON "hashtags" USING btree ("last_used");--> statement-breakpoint
CREATE INDEX "mentions_mentioned_idx" ON "mentions" USING btree ("mentioned_id");--> statement-breakpoint
CREATE INDEX "mentions_content_idx" ON "mentions" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "page_follows_page_user_idx" ON "page_follows" USING btree ("page_id","user_id");--> statement-breakpoint
CREATE INDEX "page_follows_page_idx" ON "page_follows" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "page_follows_user_idx" ON "page_follows" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "page_reviews_page_idx" ON "page_reviews" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "page_reviews_user_idx" ON "page_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "page_reviews_rating_idx" ON "page_reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "pages_name_idx" ON "pages" USING btree ("name");--> statement-breakpoint
CREATE INDEX "pages_username_idx" ON "pages" USING btree ("username");--> statement-breakpoint
CREATE INDEX "pages_category_idx" ON "pages" USING btree ("category");--> statement-breakpoint
CREATE INDEX "pages_owner_idx" ON "pages" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "social_posts_user_idx" ON "social_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "social_posts_type_idx" ON "social_posts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "social_posts_visibility_idx" ON "social_posts" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "social_posts_created_at_idx" ON "social_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "social_posts_group_idx" ON "social_posts" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "social_posts_page_idx" ON "social_posts" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "stories_user_idx" ON "stories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "stories_type_idx" ON "stories" USING btree ("type");--> statement-breakpoint
CREATE INDEX "stories_expires_at_idx" ON "stories" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "stories_created_at_idx" ON "stories" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "story_likes_story_user_idx" ON "story_likes" USING btree ("story_id","user_id");--> statement-breakpoint
CREATE INDEX "story_replies_story_idx" ON "story_replies" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "story_replies_user_idx" ON "story_replies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "story_views_story_user_idx" ON "story_views" USING btree ("story_id","user_id");--> statement-breakpoint
CREATE INDEX "story_views_story_idx" ON "story_views" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "user_blocks_blocker_blocked_idx" ON "user_blocks" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE INDEX "user_follows_follower_following_idx" ON "user_follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "user_follows_follower_idx" ON "user_follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "user_follows_following_idx" ON "user_follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "ai_chat_conversations_user_idx" ON "ai_chat_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_chat_conversations_assistant_type_idx" ON "ai_chat_conversations" USING btree ("assistant_type");--> statement-breakpoint
CREATE INDEX "ai_chat_conversations_status_idx" ON "ai_chat_conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ai_chat_conversations_last_message_at_idx" ON "ai_chat_conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "ai_chat_messages_conversation_idx" ON "ai_chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "ai_chat_messages_role_idx" ON "ai_chat_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "ai_chat_messages_created_at_idx" ON "ai_chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_content_analysis_content_idx" ON "ai_content_analysis" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "ai_content_analysis_analysis_type_idx" ON "ai_content_analysis" USING btree ("analysis_type");--> statement-breakpoint
CREATE INDEX "ai_content_analysis_created_at_idx" ON "ai_content_analysis" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_content_moderation_content_idx" ON "ai_content_moderation" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "ai_content_moderation_result_idx" ON "ai_content_moderation" USING btree ("moderation_result");--> statement-breakpoint
CREATE INDEX "ai_content_moderation_confidence_idx" ON "ai_content_moderation" USING btree ("confidence_score");--> statement-breakpoint
CREATE INDEX "ai_content_moderation_created_at_idx" ON "ai_content_moderation" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_crypto_analysis_symbol_idx" ON "ai_crypto_analysis" USING btree ("symbol");--> statement-breakpoint
CREATE INDEX "ai_crypto_analysis_analysis_type_idx" ON "ai_crypto_analysis" USING btree ("analysis_type");--> statement-breakpoint
CREATE INDEX "ai_crypto_analysis_timeframe_idx" ON "ai_crypto_analysis" USING btree ("timeframe");--> statement-breakpoint
CREATE INDEX "ai_crypto_analysis_confidence_idx" ON "ai_crypto_analysis" USING btree ("confidence_score");--> statement-breakpoint
CREATE INDEX "ai_crypto_analysis_created_at_idx" ON "ai_crypto_analysis" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_model_performance_model_idx" ON "ai_model_performance" USING btree ("model_name","model_version");--> statement-breakpoint
CREATE INDEX "ai_model_performance_task_type_idx" ON "ai_model_performance" USING btree ("task_type");--> statement-breakpoint
CREATE INDEX "ai_model_performance_accuracy_idx" ON "ai_model_performance" USING btree ("accuracy");--> statement-breakpoint
CREATE INDEX "ai_model_performance_created_at_idx" ON "ai_model_performance" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_personalization_profiles_user_idx" ON "ai_personalization_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_personalization_profiles_last_updated_idx" ON "ai_personalization_profiles" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "ai_recommendations_user_idx" ON "ai_recommendations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_recommendations_type_idx" ON "ai_recommendations" USING btree ("recommendation_type");--> statement-breakpoint
CREATE INDEX "ai_recommendations_item_idx" ON "ai_recommendations" USING btree ("item_type","item_id");--> statement-breakpoint
CREATE INDEX "ai_recommendations_score_idx" ON "ai_recommendations" USING btree ("score");--> statement-breakpoint
CREATE INDEX "ai_recommendations_created_at_idx" ON "ai_recommendations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_smart_notifications_user_idx" ON "ai_smart_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_smart_notifications_type_idx" ON "ai_smart_notifications" USING btree ("notification_type");--> statement-breakpoint
CREATE INDEX "ai_smart_notifications_priority_idx" ON "ai_smart_notifications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "ai_smart_notifications_send_time_idx" ON "ai_smart_notifications" USING btree ("optimal_send_time");--> statement-breakpoint
CREATE INDEX "ai_trend_analysis_trend_type_idx" ON "ai_trend_analysis" USING btree ("trend_type");--> statement-breakpoint
CREATE INDEX "ai_trend_analysis_identifier_idx" ON "ai_trend_analysis" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "ai_trend_analysis_current_score_idx" ON "ai_trend_analysis" USING btree ("current_score");--> statement-breakpoint
CREATE INDEX "ai_trend_analysis_time_frame_idx" ON "ai_trend_analysis" USING btree ("time_frame");--> statement-breakpoint
CREATE INDEX "ai_trend_analysis_calculated_at_idx" ON "ai_trend_analysis" USING btree ("calculated_at");--> statement-breakpoint
CREATE INDEX "ai_user_insights_user_idx" ON "ai_user_insights" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_user_insights_insight_type_idx" ON "ai_user_insights" USING btree ("insight_type");--> statement-breakpoint
CREATE INDEX "ai_user_insights_category_idx" ON "ai_user_insights" USING btree ("category");--> statement-breakpoint
CREATE INDEX "ai_user_insights_confidence_idx" ON "ai_user_insights" USING btree ("confidence_score");--> statement-breakpoint
CREATE INDEX "ai_user_insights_valid_until_idx" ON "ai_user_insights" USING btree ("valid_until");--> statement-breakpoint
CREATE INDEX "campaign_recipients_campaign_idx" ON "campaign_recipients" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "campaign_recipients_user_idx" ON "campaign_recipients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "campaign_recipients_status_idx" ON "campaign_recipients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaign_recipients_campaign_user_idx" ON "campaign_recipients" USING btree ("campaign_id","user_id");--> statement-breakpoint
CREATE INDEX "device_tokens_user_idx" ON "device_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "device_tokens_token_idx" ON "device_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "device_tokens_platform_idx" ON "device_tokens" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "device_tokens_is_active_idx" ON "device_tokens" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "device_tokens_last_used_idx" ON "device_tokens" USING btree ("last_used");--> statement-breakpoint
CREATE INDEX "email_notifications_notification_idx" ON "email_notifications" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "email_notifications_email_idx" ON "email_notifications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_notifications_status_idx" ON "email_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_notifications_sent_at_idx" ON "email_notifications" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "notification_analytics_date_idx" ON "notification_analytics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "notification_analytics_type_idx" ON "notification_analytics" USING btree ("notification_type");--> statement-breakpoint
CREATE INDEX "notification_analytics_channel_idx" ON "notification_analytics" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "notification_analytics_campaign_idx" ON "notification_analytics" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "notification_analytics_date_channel_idx" ON "notification_analytics" USING btree ("date","channel");--> statement-breakpoint
CREATE INDEX "notification_campaigns_status_idx" ON "notification_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_campaigns_scheduled_for_idx" ON "notification_campaigns" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "notification_campaigns_created_by_idx" ON "notification_campaigns" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "notification_campaigns_created_at_idx" ON "notification_campaigns" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notification_preferences_user_idx" ON "notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_preferences_unsubscribe_token_idx" ON "notification_preferences" USING btree ("unsubscribe_token");--> statement-breakpoint
CREATE INDEX "notification_templates_name_idx" ON "notification_templates" USING btree ("name");--> statement-breakpoint
CREATE INDEX "notification_templates_type_idx" ON "notification_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_templates_channel_idx" ON "notification_templates" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "notification_templates_language_idx" ON "notification_templates" USING btree ("language");--> statement-breakpoint
CREATE INDEX "notification_templates_is_active_idx" ON "notification_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "push_notifications_notification_idx" ON "push_notifications" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "push_notifications_device_token_idx" ON "push_notifications" USING btree ("device_token");--> statement-breakpoint
CREATE INDEX "push_notifications_platform_idx" ON "push_notifications" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "push_notifications_status_idx" ON "push_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "push_notifications_sent_at_idx" ON "push_notifications" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "sms_notifications_notification_idx" ON "sms_notifications" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "sms_notifications_phone_idx" ON "sms_notifications" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "sms_notifications_status_idx" ON "sms_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sms_notifications_sent_at_idx" ON "sms_notifications" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "unsubscribe_records_user_idx" ON "unsubscribe_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "unsubscribe_records_email_idx" ON "unsubscribe_records" USING btree ("email");--> statement-breakpoint
CREATE INDEX "unsubscribe_records_phone_idx" ON "unsubscribe_records" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "unsubscribe_records_type_idx" ON "unsubscribe_records" USING btree ("unsubscribe_type");--> statement-breakpoint
CREATE INDEX "unsubscribe_records_token_idx" ON "unsubscribe_records" USING btree ("token");