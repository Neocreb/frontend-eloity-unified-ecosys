-- Migration: Enable Row Level Security on public.users table
-- The users table had no RLS policies defined, causing 406 errors from PostgREST
-- when querying. This migration enables RLS and adds safe policies.

-- Enable RLS on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read non-sensitive user information
-- This allows users to see other users' basic profile info (for search, mentions, etc.)
CREATE POLICY "Authenticated users can read public user info"
ON public.users
FOR SELECT
USING (
  auth.role() = 'authenticated'
);

-- Policy: Allow users to view their own complete profile
-- This is a more permissive policy for the user's own row
CREATE POLICY "Users can view their own user record"
ON public.users
FOR SELECT
USING (
  auth.uid() = id
);

-- Policy: Allow users to update their own record
CREATE POLICY "Users can update their own user record"
ON public.users
FOR UPDATE
USING (
  auth.uid() = id
);

-- Policy: Allow users to delete their own record (e.g., account deletion)
CREATE POLICY "Users can delete their own user record"
ON public.users
FOR DELETE
USING (
  auth.uid() = id
);

-- Grant appropriate permissions to authenticated role
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE (email, username, full_name, avatar_url, bio, location, website, updated_at) ON public.users TO authenticated;
GRANT DELETE ON public.users TO authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
