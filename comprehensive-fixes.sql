-- Comprehensive fixes for database issues

-- 1. Add missing foreign key constraints
-- Stories table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stories_user_id_users_id_fk' 
        AND table_name = 'stories'
    ) THEN
        ALTER TABLE "stories" 
        ADD CONSTRAINT "stories_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
        RAISE NOTICE 'Added foreign key constraint for stories table';
    ELSE
        RAISE NOTICE 'Foreign key constraint for stories table already exists';
    END IF;
END $$;

-- Profiles table (ensure it exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_users_id_fk' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE "profiles" 
        ADD CONSTRAINT "profiles_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
        RAISE NOTICE 'Added foreign key constraint for profiles table';
    ELSE
        RAISE NOTICE 'Foreign key constraint for profiles table already exists';
    END IF;
END $$;

-- 2. Enable RLS on key tables if not already enabled
ALTER TABLE "stories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "live_streams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "battles" ENABLE ROW LEVEL SECURITY;

-- 3. Create basic RLS policies for stories table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p
        JOIN pg_class c ON p.polrelid = c.oid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'stories' AND p.polname = 'stories_select_policy'
    ) THEN
        CREATE POLICY "stories_select_policy" ON "stories"
        FOR SELECT USING (true);
        RAISE NOTICE 'Created select policy for stories table';
    ELSE
        RAISE NOTICE 'Select policy for stories table already exists';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p
        JOIN pg_class c ON p.polrelid = c.oid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'stories' AND p.polname = 'stories_insert_policy'
    ) THEN
        CREATE POLICY "stories_insert_policy" ON "stories"
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Created insert policy for stories table';
    ELSE
        RAISE NOTICE 'Insert policy for stories table already exists';
    END IF;
END $$;

-- 4. Create basic RLS policies for profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p
        JOIN pg_class c ON p.polrelid = c.oid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'profiles' AND p.polname = 'profiles_select_policy'
    ) THEN
        CREATE POLICY "profiles_select_policy" ON "profiles"
        FOR SELECT USING (true);
        RAISE NOTICE 'Created select policy for profiles table';
    ELSE
        RAISE NOTICE 'Select policy for profiles table already exists';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy p
        JOIN pg_class c ON p.polrelid = c.oid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'profiles' AND p.polname = 'profiles_update_policy'
    ) THEN
        CREATE POLICY "profiles_update_policy" ON "profiles"
        FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Created update policy for profiles table';
    ELSE
        RAISE NOTICE 'Update policy for profiles table already exists';
    END IF;
END $$;

-- 5. Grant necessary permissions
GRANT SELECT ON TABLE "stories" TO anon;
GRANT ALL ON TABLE "stories" TO authenticated;

GRANT SELECT ON TABLE "profiles" TO anon;
GRANT ALL ON TABLE "profiles" TO authenticated;

GRANT SELECT ON TABLE "posts" TO anon;
GRANT ALL ON TABLE "posts" TO authenticated;

GRANT SELECT ON TABLE "live_streams" TO anon;
GRANT ALL ON TABLE "live_streams" TO authenticated;

GRANT SELECT ON TABLE "battles" TO anon;
GRANT ALL ON TABLE "battles" TO authenticated;

-- 6. Create helper view for stories with profiles
DROP VIEW IF EXISTS "stories_with_profiles";
CREATE VIEW "stories_with_profiles" AS
SELECT 
    s.*,
    p.username,
    p.full_name,
    p.avatar_url,
    p.is_verified
FROM "stories" s
LEFT JOIN "profiles" p ON s.user_id = p.user_id;

GRANT SELECT ON TABLE "stories_with_profiles" TO anon;
GRANT ALL ON TABLE "stories_with_profiles" TO authenticated;

-- 7. Create helper view for posts with profiles
DROP VIEW IF EXISTS "posts_with_profiles";
CREATE VIEW "posts_with_profiles" AS
SELECT 
    p.*,
    pr.username,
    pr.full_name,
    pr.avatar_url,
    pr.is_verified
FROM "posts" p
LEFT JOIN "profiles" pr ON p.user_id = pr.user_id;

GRANT SELECT ON TABLE "posts_with_profiles" TO anon;
GRANT ALL ON TABLE "posts_with_profiles" TO authenticated;

-- 8. Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

RAISE NOTICE 'All fixes applied successfully!';