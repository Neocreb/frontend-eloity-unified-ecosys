-- SQL script to create the default "Pioneers" group in Supabase
-- This script should be run in the Supabase SQL Editor

-- Create the Pioneers group
INSERT INTO group_chat_threads (
  id,
  name,
  description,
  avatar,
  privacy,
  member_count,
  post_count,
  category,
  created_by,
  created_at,
  updated_at,
  last_activity
) VALUES (
  gen_random_uuid(),
  'Pioneers',
  'A public group for all pioneers to connect, share ideas, and collaborate. Join us!',
  '',
  'public',
  0,
  0,
  'community',
  '00000000-0000-0000-0000-000000000000', -- Placeholder UUID for system-created group
  NOW(),
  NOW(),
  NOW()
);

-- After running the above, you can add a welcome message
-- First, get the group ID from the result of the above query or by running:
-- SELECT id FROM group_chat_threads WHERE name = 'Pioneers';

-- Then, uncomment and run the following query with the actual group ID:
-- INSERT INTO group_messages (
--   id,
--   thread_id,
--   sender_id,
--   content,
--   type,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   '[REPLACE_WITH_ACTUAL_GROUP_ID]',
--   '00000000-0000-0000-0000-000000000000', -- Placeholder for system sender
--   'Welcome to the Pioneers group! This is a public community space for all pioneers to connect and collaborate.',
--   'system',
--   NOW(),
--   NOW()
-- );