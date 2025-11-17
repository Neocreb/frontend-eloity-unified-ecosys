# Supabase Pioneers Group Setup

Since we don't have access to the Supabase credentials in this environment, here's how to manually create the "Pioneers" group in your Supabase database.

## Manual Setup Instructions

1. Go to your Supabase dashboard at https://app.supabase.com/
2. Select your project
3. Navigate to the "Table Editor" in the left sidebar
4. Find the `group_chat_threads` table
5. Click "Insert" to add a new row with the following values:

| Column | Value |
|--------|-------|
| id | [Generate a UUID] |
| name | Pioneers |
| description | A public group for all pioneers to connect, share ideas, and collaborate. Join us! |
| avatar | (leave empty or add a default avatar URL) |
| privacy | public |
| member_count | 0 |
| post_count | 0 |
| category | community |
| created_by | 00000000-0000-0000-0000-000000000000 |
| created_at | [Current timestamp] |
| updated_at | [Current timestamp] |
| last_activity | [Current timestamp] |

6. After creating the group, you can also add a welcome message to the `group_messages` table:
   - id: [Generate a UUID]
   - thread_id: [The ID of the group you just created]
   - sender_id: 00000000-0000-0000-0000-000000000000
   - content: "Welcome to the Pioneers group! This is a public community space for all pioneers to connect and collaborate."
   - type: system
   - created_at: [Current timestamp]
   - updated_at: [Current timestamp]

## Alternative: Using Supabase SQL Editor

You can also run this SQL query in the Supabase SQL editor:

```sql
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

-- Add a welcome message (you'll need to get the group ID first)
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
--   '[GROUP_ID_HERE]',
--   '00000000-0000-0000-0000-000000000000', -- Placeholder for system sender
--   'Welcome to the Pioneers group! This is a public community space for all pioneers to connect and collaborate.',
--   'system',
--   NOW(),
--   NOW()
-- );
```

Once the group is created, users will be able to see it in their chat list and choose to join it.