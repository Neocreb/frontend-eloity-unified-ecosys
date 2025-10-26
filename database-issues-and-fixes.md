# Database Issues and Fixes

## Issues Identified

### 1. Stories Table Join Error
**Error**: `Could not find a relationship between 'stories' and 'user_id' in the schema cache`
**Cause**: The [stories](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/migrations/0000_tired_bloodaxe.sql#L704-L726) table has a [user_id](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/migrations/0000_tired_bloodaxe.sql#L707-L707) column that references the [users](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/migrations/0000_tired_bloodaxe.sql#L581-L588) table, but there's no explicit foreign key constraint defined in the database schema.

### 2. Profiles Table Permissions Error
**Error**: `permission denied for table profiles`
**Cause**: The anonymous and authenticated roles don't have sufficient permissions to access the [profiles](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/migrations/0000_tired_bloodaxe.sql#L378-L406) table.

### 3. Network Connection Issues
**Error**: `ERR_CONNECTION_CLOSED` for live_streams and battles endpoints
**Cause**: Likely network connectivity issues or server-side problems.

### 4. Posts Table "tagged_users" Error
**Error**: `Could not find the 'tagged_users' column of 'posts' in the schema cache`
**Cause**: This was a false alarm - the column actually exists in the [posts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/migrations/0000_tired_bloodaxe.sql#L457-L503) table.

## Root Causes

1. **Missing Foreign Key Constraints**: The migration script defined the [stories](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/migrations/0000_tired_bloodaxe.sql#L704-L726) table with a [user_id](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/migrations/0000_tired_bloodaxe.sql#L707-L707) column that references [users](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/migrations/0000_tired_bloodaxe.sql#L581-L588), but didn't create the explicit foreign key constraint. Supabase's PostgREST service requires explicit foreign key constraints to enable table joins.

2. **Insufficient Permissions**: The [profiles](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/migrations/0000_tired_bloodaxe.sql#L378-L406) table didn't have proper permissions granted to the `anon` and `authenticated` roles.

3. **Missing RLS Policies**: While RLS was enabled, there were no policies defined for public access to the tables.

## Fixes Applied

### 1. Added Missing Foreign Key Constraints
```sql
ALTER TABLE "stories" 
ADD CONSTRAINT "stories_user_id_users_id_fk" 
FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
```

### 2. Granted Proper Permissions
```sql
GRANT SELECT ON TABLE "profiles" TO anon;
GRANT ALL ON TABLE "profiles" TO authenticated;
```

### 3. Enabled RLS and Created Basic Policies
```sql
ALTER TABLE "stories" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stories_select_policy" ON "stories"
FOR SELECT USING (true);

CREATE POLICY "stories_insert_policy" ON "stories"
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Created Helper Views
To provide an alternative way to access joined data:
```sql
CREATE VIEW "stories_with_profiles" AS
SELECT 
    s.*,
    p.username,
    p.full_name,
    p.avatar_url,
    p.is_verified
FROM "stories" s
LEFT JOIN "profiles" p ON s.user_id = p.user_id;
```

## Files Created

1. `fix-database-relationships.sql` - Basic fixes for foreign key constraints and permissions
2. `comprehensive-fixes.sql` - Complete solution with RLS policies and helper views
3. `test-fixes.cjs` - Script to verify the fixes work
4. `check-rls-policies.cjs` - Script to check current RLS policies
5. `database-issues-and-fixes.md` - This document

## How to Apply the Fixes

1. Open the Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `comprehensive-fixes.sql`
4. Run the script
5. Test the fixes using `test-fixes.cjs`:
   ```bash
   node test-fixes.cjs
   ```

## Additional Recommendations

1. **Monitor Network Issues**: The `ERR_CONNECTION_CLOSED` errors for live_streams and battles may require infrastructure investigation.

2. **Review RLS Policies**: The basic policies provided are permissive. Review and adjust them based on your security requirements.

3. **Update Frontend Code**: Consider using the helper views (`stories_with_profiles`, `posts_with_profiles`) in your frontend queries as they provide pre-joined data.

4. **Regular Maintenance**: Periodically check and refresh the PostgREST schema cache if you make schema changes:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```