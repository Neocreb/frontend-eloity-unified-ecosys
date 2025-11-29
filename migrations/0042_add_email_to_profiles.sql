-- Migration: Add email and last_sign_in columns to profiles table
-- Issue: Supabase auth tries to update email and last_sign_in in profiles during login
-- Error: ERROR: column "email" of relation "profiles" does not exist (SQLSTATE 42703)

-- Add email column to profiles table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add last_sign_in column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMP WITH TIME ZONE;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_last_sign_in_idx ON public.profiles(last_sign_in);

-- Grant permissions
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO service_role;

-- Refresh schema
NOTIFY pgrst, 'reload schema';
