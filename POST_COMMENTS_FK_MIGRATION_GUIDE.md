# Post Comments Foreign Key Migration Guide

## Problem
When adding comments to posts, you see this error:
```
Error adding comment: 
{code: 'PGRST200', message: "Could not find a relationship between 'post_comments' and 'user_id' in the schema cache"}
```

This happens because the `post_comments` table is missing a **foreign key constraint** linking `user_id` to the `profiles` table.

## Solution
Run the migration script to add the missing foreign key relationship.

## Prerequisites
- PostgreSQL/Supabase connection configured
- `DATABASE_URL` environment variable set in `.env.local` OR
- Run the script with `DATABASE_URL` environment variable: `DATABASE_URL=your_url node scripts/database/apply-post-comments-fix.js`

## Quick Start

### Option 1: Using Environment Variable
```bash
# Set your database URL and run the migration
DATABASE_URL="postgresql://user:password@host:port/database" node scripts/database/apply-post-comments-fix.js
```

### Option 2: Using .env.local
1. Make sure your `.env.local` has `DATABASE_URL` set:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

2. Run the migration script:
   ```bash
   node scripts/database/apply-post-comments-fix.js
   ```

## What the Migration Does
The migration file at `migrations/0043_fix_post_comments_profiles_relationship.sql` performs these actions:

1. ✅ Checks if the foreign key already exists (prevents errors if run multiple times)
2. ✅ Adds a foreign key constraint: `post_comments.user_id → profiles.id`
3. ✅ Sets cascade delete behavior (deleting a profile will delete their comments)
4. ✅ Refreshes the PostgREST schema cache so Supabase REST API recognizes the relationship

## Verification
After running the migration, you should be able to:
- ✅ Add comments to posts without the PGRST200 error
- ✅ Comments will correctly display user profile information
- ✅ The REST API join with profiles will work correctly

## Files
- **Migration**: `migrations/0043_fix_post_comments_profiles_relationship.sql`
- **Runner Script**: `scripts/database/apply-post-comments-fix.js`

## Code Integration
The code is **already configured** to use this relationship. These files were already expecting the foreign key to exist:

- `src/services/feedService.ts` - Uses `profiles:user_id` join in getComments() and addComment()
- `src/services/postService.ts` - Uses `profiles:user_id` join when fetching comments
- Other services that fetch comments with profile data

## Troubleshooting

### Error: DATABASE_URL not found
Make sure you either:
- Have `DATABASE_URL` in your `.env.local` file, OR
- Pass it as an environment variable: `DATABASE_URL=... node scripts/database/apply-post-comments-fix.js`

### Error: Connection refused
- Verify your database URL is correct
- Ensure the database server is running
- Check your network connectivity

### Already applied?
The migration is idempotent (safe to run multiple times). It checks if the constraint exists before adding it.

## Manual Application (if needed)
If you prefer to apply the migration manually using a SQL client:

1. Open your database connection (Supabase SQL Editor, pgAdmin, etc.)
2. Copy the contents of `migrations/0043_fix_post_comments_profiles_relationship.sql`
3. Run the SQL

That's it! The relationship will be established.
