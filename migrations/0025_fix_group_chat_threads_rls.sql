-- Migration: Fix group_chat_threads RLS policy for user existence check
-- Date: 2025-11-18
-- Issue: The existing RLS policy on group_chat_threads table doesn't verify that the creating user exists
-- Solution: Update the policy to check that the user exists in auth.users table

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create group chat threads" ON public.group_chat_threads;

-- Create a new policy that verifies the user exists
CREATE POLICY "Users can create group chat threads" ON public.group_chat_threads
    FOR INSERT WITH CHECK (
        auth.uid() = created_by 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = created_by
        )
    );

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';