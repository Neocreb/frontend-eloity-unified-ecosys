-- Migration: Make group_chat_threads RLS policy less restrictive
-- Date: 2025-11-18
-- Issue: The existing RLS policy on group_chat_threads table is too restrictive
-- Solution: Remove the auth.users existence check to allow group creation

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create group chat threads" ON public.group_chat_threads;

-- Create a less restrictive policy that doesn't check auth.users table
CREATE POLICY "Users can create group chat threads" ON public.group_chat_threads
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';