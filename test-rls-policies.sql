-- Test script to verify RLS policies for group creation

-- First, let's check if we can see the current policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policy 
JOIN pg_class ON pg_policy.polrelid = pg_class.oid 
WHERE pg_class.relname = 'group_chat_threads';

-- Check if the user exists in auth.users
-- Replace 'USER_ID_HERE' with an actual user ID from your system
SELECT id, email FROM auth.users WHERE id = 'USER_ID_HERE';

-- Try to insert a group chat thread directly (this should fail with RLS)
-- Replace 'USER_ID_HERE' with an actual user ID from your system
INSERT INTO public.group_chat_threads (
    name, 
    description, 
    created_by, 
    privacy, 
    member_count, 
    last_activity
) VALUES (
    'Test Group', 
    'Test Description', 
    'USER_ID_HERE', 
    'public', 
    1, 
    NOW()
);

-- Check if we can see the group_participants policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policy 
JOIN pg_class ON pg_policy.polrelid = pg_class.oid 
WHERE pg_class.relname = 'group_participants';