-- Migration 0041: Fix Settings Persistence and RLS Policies
-- This migration adds missing columns to profiles table for appearance settings
-- and fixes RLS policies for proper persistence across page refreshes

-- 1. Add missing columns to profiles table for appearance settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'medium';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ui_language TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_play_videos BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reduced_motion BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS high_contrast BOOLEAN DEFAULT false;

-- 2. Fix RLS policies for profiles table with proper WITH CHECK clause
-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;

-- Create SELECT policy for profiles
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT
  USING (true);

-- Create INSERT policy for profiles with WITH CHECK
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create UPDATE policy for profiles with WITH CHECK (critical for persistence)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create DELETE policy for profiles
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  USING (user_id = auth.uid());

-- 3. Fix RLS policies for notification_preferences table
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "notification_preferences_select_policy" ON notification_preferences;
DROP POLICY IF EXISTS "notification_preferences_update_policy" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON notification_preferences;

-- Create SELECT policy for notification_preferences
CREATE POLICY "notification_preferences_select_own" ON notification_preferences
  FOR SELECT
  USING (user_id = auth.uid());

-- Create INSERT policy for notification_preferences with WITH CHECK
CREATE POLICY "notification_preferences_insert_own" ON notification_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create UPDATE policy for notification_preferences with WITH CHECK (critical for persistence)
CREATE POLICY "notification_preferences_update_own" ON notification_preferences
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. Fix RLS policies for user_banking_info table if it exists
ALTER TABLE user_banking_info ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users can view their own banking info" ON user_banking_info;
DROP POLICY IF EXISTS "Users can update their own banking info" ON user_banking_info;
DROP POLICY IF EXISTS "user_banking_info_select_policy" ON user_banking_info;
DROP POLICY IF EXISTS "user_banking_info_update_policy" ON user_banking_info;

-- Create SELECT policy for user_banking_info
CREATE POLICY "user_banking_info_select_own" ON user_banking_info
  FOR SELECT
  USING (user_id = auth.uid());

-- Create INSERT policy for user_banking_info with WITH CHECK
CREATE POLICY "user_banking_info_insert_own" ON user_banking_info
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create UPDATE policy for user_banking_info with WITH CHECK (critical for persistence)
CREATE POLICY "user_banking_info_update_own" ON user_banking_info
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. Fix RLS policies for premium_subscriptions table if it exists
DROP POLICY IF EXISTS "Users can view their own premium subscription" ON premium_subscriptions;
DROP POLICY IF EXISTS "Users can update their own premium subscription" ON premium_subscriptions;
DROP POLICY IF EXISTS "premium_subscriptions_select_policy" ON premium_subscriptions;
DROP POLICY IF EXISTS "premium_subscriptions_update_policy" ON premium_subscriptions;

-- Create SELECT policy for premium_subscriptions
CREATE POLICY "premium_subscriptions_select_own" ON premium_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

-- Create INSERT policy for premium_subscriptions with WITH CHECK
CREATE POLICY "premium_subscriptions_insert_own" ON premium_subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create UPDATE policy for premium_subscriptions with WITH CHECK (critical for persistence)
CREATE POLICY "premium_subscriptions_update_own" ON premium_subscriptions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. Create indexes for better query performance on settings tables
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_banking_info_user_id ON user_banking_info(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(user_id);

-- 7. Ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_banking_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- 8. Create or update AI assistant preferences table with proper RLS if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ai_assistant_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  smart_feed_curation BOOLEAN DEFAULT true,
  ai_recommendations BOOLEAN DEFAULT true,
  content_type_preferences JSONB DEFAULT NULL,
  model_selection TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ai_assistant_preferences
ALTER TABLE public.ai_assistant_preferences ENABLE ROW LEVEL SECURITY;

-- Create indexes for ai_assistant_preferences
CREATE INDEX IF NOT EXISTS idx_ai_assistant_preferences_user_id ON public.ai_assistant_preferences(user_id);

-- Drop existing policies for ai_assistant_preferences if they exist
DROP POLICY IF EXISTS "Users can view their own AI preferences" ON ai_assistant_preferences;
DROP POLICY IF EXISTS "Users can update their own AI preferences" ON ai_assistant_preferences;
DROP POLICY IF EXISTS "Users can insert their own AI preferences" ON ai_assistant_preferences;

-- Create RLS policies for ai_assistant_preferences
CREATE POLICY "ai_assistant_preferences_select_own" ON ai_assistant_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "ai_assistant_preferences_insert_own" ON ai_assistant_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_assistant_preferences_update_own" ON ai_assistant_preferences
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Commit message
-- Fixed: Settings persistence by adding WITH CHECK clauses to all RLS UPDATE policies
-- Fixed: Missing columns in profiles table for appearance settings
-- Fixed: RLS policies for notification_preferences, user_banking_info, and premium_subscriptions
-- Added: AI assistant preferences table with proper RLS policies
-- Added: Performance indexes on all settings tables
