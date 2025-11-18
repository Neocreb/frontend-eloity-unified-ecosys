-- Migration: Make group_participants RLS policy less restrictive
-- Date: 2025-11-18
-- Issue: The existing RLS policy on group_participants table may be too restrictive
-- Solution: Simplify the policy to avoid complex checks

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view group participants for groups they belong to" ON public.group_participants;

-- Create a simpler policy
CREATE POLICY "Users can view group participants for groups they belong to" ON public.group_participants
    FOR SELECT USING (
        -- Check if the user is a participant in the same group
        EXISTS (
            SELECT 1 FROM public.group_participants gp
            WHERE gp.group_id = group_participants.group_id
            AND gp.user_id = auth.uid()
        )
    );

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';