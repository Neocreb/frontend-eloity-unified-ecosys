# Fix Guide: Group Chats Not Displaying

## Issue
Group chats are not showing on the chat page even though they exist in the database.

## Root Cause
RLS (Row-Level Security) policies on `group_chat_threads` and `group_participants` tables may be:
1. Too restrictive (denying SELECT access)
2. Missing or incorrectly configured
3. The Edge Function may not be deployed

## Solution

### Step 1: Deploy Edge Function
```bash
supabase functions deploy create-group-with-participants
```

### Step 2: Fix RLS Policies

Go to Supabase Dashboard → SQL Editor and run this:

```sql
-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their group chats" ON public.group_chat_threads;
DROP POLICY IF EXISTS "Users can create group chat threads" ON public.group_chat_threads;
DROP POLICY IF EXISTS "Users can view group participants" ON public.group_participants;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_participants;

-- Enable RLS
ALTER TABLE public.group_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_participants ENABLE ROW LEVEL SECURITY;

-- Policy for group_chat_threads - SELECT
-- Users can see public groups OR groups they're a member of
CREATE POLICY "Users can view accessible group chats"
ON public.group_chat_threads
FOR SELECT
USING (
  privacy = 'public'
  OR id IN (
    SELECT group_id FROM public.group_participants 
    WHERE user_id = auth.uid()
  )
);

-- Policy for group_chat_threads - INSERT
-- Users can create groups
CREATE POLICY "Users can create group chats"
ON public.group_chat_threads
FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Policy for group_chat_threads - UPDATE
-- Users can update groups they created
CREATE POLICY "Users can update their group chats"
ON public.group_chat_threads
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Policy for group_participants - SELECT
-- Users can see group participants if they're in the group
CREATE POLICY "Users can view group members"
ON public.group_participants
FOR SELECT
USING (
  group_id IN (
    SELECT id FROM public.group_chat_threads
    WHERE privacy = 'public'
    OR id IN (
      SELECT group_id FROM public.group_participants 
      WHERE user_id = auth.uid()
    )
  )
);

-- Policy for group_participants - INSERT
-- Users can join groups (Edge Function handles admin control)
CREATE POLICY "Users can join groups"
ON public.group_participants
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy for group_participants - DELETE
-- Users can leave groups
CREATE POLICY "Users can leave groups"
ON public.group_participants
FOR DELETE
USING (user_id = auth.uid());
```

### Step 3: Verify Tables Exist
Check that these columns exist in the tables:

**group_chat_threads:**
- id (UUID, primary key)
- name (text)
- description (text)
- privacy (text: 'public' or 'private')
- created_by (UUID, user ID)
- avatar (text, URL)
- last_activity (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

**group_participants:**
- id (UUID, primary key)
- group_id (UUID, foreign key to group_chat_threads)
- user_id (UUID, foreign key to auth.users)
- role (text: 'member', 'admin', 'creator')
- joined_at (timestamp)

If columns are missing, run this migration:

```sql
-- Create group_chat_threads if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  privacy TEXT DEFAULT 'private' CHECK (privacy IN ('public', 'private')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar TEXT,
  last_activity TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create group_participants if it doesn't exist
CREATE TABLE IF NOT EXISTS public.group_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.group_chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'creator')),
  joined_at TIMESTAMP DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS group_participants_user_id_idx ON public.group_participants(user_id);
CREATE INDEX IF NOT EXISTS group_participants_group_id_idx ON public.group_participants(group_id);
CREATE INDEX IF NOT EXISTS group_chat_threads_created_by_idx ON public.group_chat_threads(created_by);
```

### Step 4: Test
1. Go to chat page
2. Create a new group chat
3. Verify groups appear in the sidebar
4. Check browser console for errors
5. Check Supabase logs for RLS denials

## Troubleshooting

**Issue: "Permission denied" errors in console**
- RLS policies are too restrictive
- Solution: Re-run the SQL above, ensuring policies allow SELECT

**Issue: Edge Function returns "not found"**
- Function not deployed
- Solution: Run `supabase functions deploy create-group-with-participants`

**Issue: Groups still not showing**
1. Open browser DevTools → Network tab
2. Check the API call to fetch groups
3. Look at the response (should contain group data)
4. If error, check Supabase Dashboard → Logs → Edge Function

## Verification Commands

Run in Supabase SQL Editor:

```sql
-- Check if tables exist and have data
SELECT COUNT(*) as group_count FROM public.group_chat_threads;
SELECT COUNT(*) as participant_count FROM public.group_participants;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'group_chat_threads';
SELECT * FROM pg_policies WHERE tablename = 'group_participants';

-- Test if current user can see groups
SELECT * FROM public.group_chat_threads 
WHERE privacy = 'public' 
OR id IN (
  SELECT group_id FROM public.group_participants 
  WHERE user_id = auth.uid()
)
LIMIT 5;
```

## For Production Deployment

Ensure these environment variables are set:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

And Edge Function can call Supabase as admin:
- Supabase project has `service_role` key configured in deployment environment
