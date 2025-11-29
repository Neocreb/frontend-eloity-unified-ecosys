-- Migration: Add email column to profiles table
-- Issue: Supabase auth tries to update email in profiles during login
-- Error: ERROR: column "email" of relation "profiles" does not exist

-- Add email column to profiles table
ALTER TABLE public.profiles
ADD COLUMN email TEXT;

-- Add index on email for faster lookups
CREATE INDEX profiles_email_idx ON public.profiles(email);

-- Grant permissions
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO service_role;

-- Refresh schema
NOTIFY pgrst, 'reload schema';
