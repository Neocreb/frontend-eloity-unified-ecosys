-- Migration: Fix groups and group_members RLS policies with correct column names
-- Date: 2025-11-04

-- Drop existing policies that reference incorrect column names
DROP POLICY IF EXISTS "Users can view groups they created" ON public.groups;
DROP POLICY IF EXISTS "Users can view public groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

-- Create proper policies for groups table with correct column names
CREATE POLICY "Users can view groups they created" ON public.groups
  FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Users can view public groups" ON public.groups
  FOR SELECT USING (privacy = 'public');

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group creators can update their groups" ON public.groups
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Group creators can delete their groups" ON public.groups
  FOR DELETE USING (auth.uid() = creator_id);

-- Create proper policies for group_members table with correct column names
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_members.group_id 
      AND (groups.privacy = 'public' OR groups.creator_id = auth.uid())
    )
  );

CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = group_members.group_id 
      AND groups.privacy IN ('public', 'unlisted')
    )
  );

CREATE POLICY "Users can leave groups" ON public.group_members
  FOR DELETE USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.group_members gm 
      JOIN public.groups g ON g.id = gm.group_id
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
      AND g.creator_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can manage members" ON public.group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid()
      AND gm.role IN ('admin', 'moderator')
    )
    OR EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_members.group_id 
      AND g.creator_id = auth.uid()
    )
  );

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';