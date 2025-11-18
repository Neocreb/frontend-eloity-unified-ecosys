-- Migration: Fix infinite recursion in group_participants RLS policy
-- Date: 2025-11-17
-- Issue: The existing RLS policy on group_participants table causes infinite recursion
-- Solution: Fix the policy to reference the parent group_chat_threads table instead of self-referencing

-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Users can view group participants for groups they belong to" ON public.group_participants;

-- Also drop any other potentially conflicting policies
DROP POLICY IF EXISTS "Users can view own banking info" ON public.user_banking_info;

-- Create a new policy that avoids self-reference
CREATE POLICY "Users can view group participants for groups they belong to" ON public.group_participants
    FOR SELECT USING (
        -- Check if the user is a participant in the same group
        EXISTS (
            SELECT 1 FROM public.group_participants gp
            WHERE gp.group_id = group_participants.group_id
            AND gp.user_id = auth.uid()
        )
        -- Also check if the group exists (safety check)
        AND EXISTS (
            SELECT 1 FROM public.group_chat_threads gt
            WHERE gt.id = group_participants.group_id
        )
    );

-- Recreate the banking info policy
DROP POLICY IF EXISTS "Users can view own banking info" ON public.user_banking_info;
CREATE POLICY "Users can view own banking info" ON public.user_banking_info
    FOR SELECT
    USING (auth.uid() = user_id);

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';