-- Migration: Fix group_participants insert policy for user existence check
-- Date: 2025-11-18
-- Issue: The existing RLS policy on group_participants table doesn't verify that all participants exist
-- Solution: Update the policy to check that users exist in auth.users table

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can join groups through invite links" ON public.group_participants;

-- Create a new policy that verifies the user exists
CREATE POLICY "Users can join groups through invite links" ON public.group_participants
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = user_id
        )
        AND EXISTS (
            SELECT 1 FROM public.group_chat_threads 
            WHERE group_chat_threads.id = group_participants.group_id
        )
    );

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';