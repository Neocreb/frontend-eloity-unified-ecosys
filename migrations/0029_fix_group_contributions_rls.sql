-- Migration: Fix group contributions RLS policies
-- Date: 2025-11-18
-- Issue: Group contributions RLS policies reference incorrect column names
-- Solution: Update policies to use correct column names and table references

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view group contributions for their groups" ON public.group_contributions;
DROP POLICY IF EXISTS "Group admins can create contributions" ON public.group_contributions;
DROP POLICY IF EXISTS "Group admins can update contributions" ON public.group_contributions;
DROP POLICY IF EXISTS "Group admins can delete contributions" ON public.group_contributions;
DROP POLICY IF EXISTS "Users can view contributors for their group contributions" ON public.group_contributors;
DROP POLICY IF EXISTS "Users can create their own contributions" ON public.group_contributors;
DROP POLICY IF EXISTS "Users can view votes for their groups" ON public.group_votes;
DROP POLICY IF EXISTS "Group members can create votes" ON public.group_votes;
DROP POLICY IF EXISTS "Group admins can update votes" ON public.group_votes;
DROP POLICY IF EXISTS "Group admins can delete votes" ON public.group_votes;
DROP POLICY IF EXISTS "Users can view vote responses for their group votes" ON public.group_vote_responses;
DROP POLICY IF EXISTS "Users can create their own vote responses" ON public.group_vote_responses;
DROP POLICY IF EXISTS "Users can update their own vote responses" ON public.group_vote_responses;
DROP POLICY IF EXISTS "Users can delete their own vote responses" ON public.group_vote_responses;
DROP POLICY IF EXISTS "Group members can view payouts for their contributions" ON public.contribution_payouts;
DROP POLICY IF EXISTS "Admins can view all payouts" ON public.contribution_payouts;

-- Create proper policies for group_contributions
CREATE POLICY "Users can view group contributions for their groups" ON public.group_contributions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_contributions.group_id 
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can create contributions" ON public.group_contributions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'creator')
        )
    );

CREATE POLICY "Group admins can update contributions" ON public.group_contributions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'creator')
        )
    );

CREATE POLICY "Group admins can delete contributions" ON public.group_contributions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'creator')
        )
    );

-- Create proper policies for group_contributors
CREATE POLICY "Users can view contributors for their group contributions" ON public.group_contributors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_contributions gc
            JOIN public.group_members gm ON gm.group_id = gc.group_id
            WHERE gc.id = group_contributors.contribution_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own contributions" ON public.group_contributors
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Create proper policies for group_votes
CREATE POLICY "Users can view votes for their groups" ON public.group_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_votes.group_id 
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create votes" ON public.group_votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can update votes" ON public.group_votes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'creator')
        )
    );

CREATE POLICY "Group admins can delete votes" ON public.group_votes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_members.group_id = group_id 
            AND group_members.user_id = auth.uid()
            AND group_members.role IN ('admin', 'creator')
        )
    );

-- Create proper policies for group_vote_responses
CREATE POLICY "Users can view vote responses for their group votes" ON public.group_vote_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_votes gv
            JOIN public.group_members gm ON gm.group_id = gv.group_id
            WHERE gv.id = group_vote_responses.vote_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own vote responses" ON public.group_vote_responses
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own vote responses" ON public.group_vote_responses
    FOR UPDATE USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can delete their own vote responses" ON public.group_vote_responses
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Create proper policies for contribution_payouts
CREATE POLICY "Group members can view payouts for their contributions" ON public.contribution_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_contributions gc
            JOIN public.group_members gm ON gm.group_id = gc.group_id
            WHERE gc.id = contribution_payouts.contribution_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all payouts" ON public.contribution_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_contributions gc
            JOIN public.group_members gm ON gm.group_id = gc.group_id
            WHERE gc.id = contribution_payouts.contribution_id
            AND gm.user_id = auth.uid()
            AND gm.role IN ('admin', 'creator')
        )
    );

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';