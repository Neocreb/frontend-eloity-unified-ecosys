# Database Migration Guide: Adding followers_count to profiles table

## Overview
This guide will help you add the missing `followers_count` and `following_count` columns to the `profiles` table in your Supabase database.

## Prerequisites
- Supabase CLI installed
- Database access credentials
- Migration file: `migrations/0024_add_followers_count_to_profiles.sql`

## Migration Steps

### 1. Apply the Migration
Run the following command to apply the migration:

```bash
supabase migration up
```

Or if you're using the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/0024_add_followers_count_to_profiles.sql`
4. Run the SQL commands

### 2. Verify the Migration
After running the migration, verify that the columns were added successfully:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('followers_count', 'following_count');
```

You should see both columns listed in the result.

### 3. Refresh the Schema Cache
To ensure that PostgREST can detect the new relationships:

1. Go to your Supabase project dashboard
2. Navigate to "Settings" → "API"
3. Click "Reset Database Schema Cache"

### 4. Update Existing Records (Optional)
If you want to populate the new columns with actual data, you can run queries to count existing followers:

```sql
-- Update followers_count for each user
UPDATE profiles 
SET followers_count = (
    SELECT COUNT(*) 
    FROM followers 
    WHERE following_id = profiles.user_id
);

-- Update following_count for each user
UPDATE profiles 
SET following_count = (
    SELECT COUNT(*) 
    FROM followers 
    WHERE follower_id = profiles.user_id
);
```

## Testing
After applying the migration:

1. Restart your development server
2. Navigate to the explore page or any page that shows suggested users
3. Verify that the follower counts are displayed correctly
4. Check that there are no more "column profiles.followers_count does not exist" errors

## Rollback (If Needed)
If you need to rollback the migration, you can run:

```sql
ALTER TABLE public.profiles DROP COLUMN IF EXISTS followers_count;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS following_count;
```

## Additional Notes
- The migration includes indexes on both columns for better query performance
- Default values are set to 0 for both columns
- The columns are nullable by default but will use the default value for new records