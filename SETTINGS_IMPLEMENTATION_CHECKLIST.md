# Settings Implementation Checklist ✅

## Pre-Implementation Checklist

- [ ] Backup your database (or confirm backup exists)
- [ ] Review migration file: `migrations/0041_fix_settings_persistence_and_rls.sql`
- [ ] Verify you have Supabase admin access
- [ ] Check current Supabase version supports RLS policies

## Step 1: Apply the Migration

### Option A: Via Supabase Dashboard
1. [ ] Go to Supabase Dashboard → SQL Editor
2. [ ] Create new query
3. [ ] Copy entire content from `migrations/0041_fix_settings_persistence_and_rls.sql`
4. [ ] Click "Run" button
5. [ ] Verify no errors in output
6. [ ] Check the migration runs successfully

### Option B: Via CLI (if using Supabase CLI)
```bash
supabase migration up
```
- [ ] Verify migration was applied
- [ ] Check for any errors in output

### Option C: Verify Migration Applied
After applying, run this query to verify:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('font_size', 'ui_language', 'auto_play_videos', 'reduced_motion', 'high_contrast');
```
- [ ] All 5 columns should appear in results
- [ ] All should have correct data types (text or boolean)

## Step 2: Verify RLS Policies

Run this verification query:
```sql
SELECT 
  tablename, 
  policyname, 
  qual as "USING clause",
  with_check as "WITH CHECK clause"
FROM pg_policies
WHERE tablename IN (
  'profiles',
  'notification_preferences',
  'user_banking_info',
  'premium_subscriptions',
  'ai_assistant_preferences'
)
ORDER BY tablename, policyname;
```

- [ ] `profiles` should have 4 policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] `notification_preferences` should have 3 policies (SELECT, INSERT, UPDATE)
- [ ] `user_banking_info` should have 3 policies (SELECT, INSERT, UPDATE)
- [ ] `premium_subscriptions` should have 3 policies (SELECT, INSERT, UPDATE)
- [ ] `ai_assistant_preferences` should have 3 policies (SELECT, INSERT, UPDATE)
- [ ] **ALL UPDATE policies should have `with_check` NOT NULL** ⚠️ CRITICAL

## Step 3: Code Deployment

- [ ] Code changes are deployed to your environment:
  - [ ] `src/contexts/AuthContext.tsx` updated
  - [ ] `src/pages/EnhancedSettings.tsx` updated
  - [ ] `shared/enhanced-schema.ts` updated

- [ ] Verify app is running with latest code
- [ ] Check browser console has no errors
- [ ] Verify user is logged in

## Testing Checklist

### Test Appearance Settings Persistence

#### Font Size
1. [ ] Go to Settings → Appearance tab
2. [ ] Change Font Size to "Large"
3. [ ] Click "Save Appearance Settings"
4. [ ] See success toast message
5. [ ] Refresh page (F5 or Cmd+R)
6. [ ] Verify Font Size is still "Large" ✅ CRITICAL TEST

#### Language (in Appearance)
1. [ ] Go to Settings → Appearance tab
2. [ ] Change Language to "Español"
3. [ ] Click "Save Appearance Settings"
4. [ ] See success toast message
5. [ ] Refresh page
6. [ ] Verify Language is still "Español" ✅ CRITICAL TEST

#### Auto-play Videos
1. [ ] Go to Settings → Appearance tab
2. [ ] Toggle "Auto-play Videos" OFF
3. [ ] Click "Save Appearance Settings"
4. [ ] See success toast message
5. [ ] Refresh page
6. [ ] Verify toggle is still OFF ✅ CRITICAL TEST

#### Other Appearance Settings
- [ ] Test "Reduced Motion" toggle persistence
- [ ] Test "High Contrast" toggle persistence

### Test Language Tab (i18n)

1. [ ] Go to Settings → Language tab
2. [ ] Change Language to "Français"
3. [ ] Change Region to relevant region
4. [ ] Change Currency to "EUR" (or currency for that region)
5. [ ] Click "Save Regional Preferences"
6. [ ] See success toast message
7. [ ] Refresh page
8. [ ] Verify all three settings persist ✅ CRITICAL TEST
9. [ ] Verify app UI language updates (if translations are available)
10. [ ] Verify currency symbols update on product prices

### Test Other Settings Tabs

#### Profile Tab
1. [ ] Go to Settings → Profile tab
2. [ ] Change Full Name to "Test User"
3. [ ] Change Bio to "Test Bio"
4. [ ] Click "Save Profile Changes"
5. [ ] Refresh page
6. [ ] Verify changes persist

#### Alerts Tab (Notifications)
1. [ ] Go to Settings → Alerts tab
2. [ ] Toggle email notifications OFF
3. [ ] Click "Save Notification Settings"
4. [ ] Refresh page
5. [ ] Verify setting is still OFF

#### Money Tab (Banking Info - if applicable)
1. [ ] Go to Settings → Money tab
2. [ ] Update banking information
3. [ ] Save changes
4. [ ] Refresh page
5. [ ] Verify banking info persists

### Database Verification

#### Check Saved Data in Database
In Supabase, run this query to verify settings are actually in the database:
```sql
SELECT 
  user_id,
  font_size,
  ui_language,
  auto_play_videos,
  reduced_motion,
  high_contrast
FROM profiles
WHERE user_id = 'YOUR_USER_ID_HERE'
LIMIT 1;
```
- [ ] Record should exist with your test data
- [ ] All 5 columns should show your selected values

#### Check RLS Policies Are Working
Try this as a test (should fail if RLS is working):
```sql
-- This should return error or 0 rows (depending on RLS setup)
UPDATE profiles SET font_size = 'medium' 
WHERE user_id != auth.uid();
```
- [ ] Query should fail or return 0 rows updated ✅ Security working

## Error Scenarios & Troubleshooting

### Scenario 1: "Failed to update appearance settings" Error
**Symptoms**: Toast shows error message, nothing saves
**Checks**:
- [ ] User is authenticated (check auth.uid() is set)
- [ ] Database connection is working
- [ ] profiles table exists (check in Supabase)
- [ ] RLS policies allow UPDATE (check migration was applied)
- [ ] Check browser console for specific error message

**Solution**:
1. Re-apply migration 0041
2. Verify WITH CHECK clause is in UPDATE policies
3. Check database logs for RLS policy violations

### Scenario 2: Settings Save but Don't Persist After Refresh
**Symptoms**: Toast shows success, but refresh reverts changes
**Checks**:
- [ ] Is the WITH CHECK clause missing in UPDATE policies? ⚠️ COMMON!
- [ ] Is the update going to Auth metadata instead of database?
- [ ] Check browser Storage → Application → IndexedDB (Supabase cache)

**Solution**:
1. Re-apply migration 0041
2. Verify all UPDATE policies have WITH CHECK clause
3. Clear browser cache
4. Try again with fresh login

### Scenario 3: "Language tab not showing"
**Symptoms**: Language tab missing from settings tabs
**Checks**:
- [ ] I18nProvider is imported in App.tsx
- [ ] useI18n() hook works (no errors in console)
- [ ] SafeI18nProvider is being used as fallback

**Solution**:
1. Verify I18nContext.tsx exists
2. Check App.tsx includes I18nProvider in context chain
3. Restart dev server

### Scenario 4: Settings save to Auth but not Database
**Symptoms**: Changes work during session but lost on login
**Checks**:
- [ ] Are columns in profiles table actually created? 
- [ ] Does migration have the ALTER TABLE ADD COLUMN statements?
- [ ] Is AuthContext.updateProfile() calling supabase.from('profiles').update()?

**Solution**:
1. Verify migration added all 5 columns to profiles table
2. Check AuthContext.tsx has the database update code
3. Check browser console for database error messages

## Performance & Load Testing

- [ ] Load Settings page with no visible lag
- [ ] Saving settings completes in < 2 seconds
- [ ] Page refresh completes in < 3 seconds
- [ ] Database queries use proper indexes

## Browser Compatibility

- [ ] Chrome/Edge - Settings persist ✅
- [ ] Firefox - Settings persist ✅
- [ ] Safari - Settings persist ✅
- [ ] Mobile browsers - Settings persist ✅

## Security Verification

- [ ] Cannot update other users' settings (RLS blocking)
- [ ] Cannot see other users' banking info
- [ ] Cannot access premium settings for other accounts
- [ ] Passwords are not exposed in any setting

## Final Verification

- [ ] All 11 tabs load without errors
- [ ] All tabs allow saving changes
- [ ] All changes persist after page refresh
- [ ] No console errors appear
- [ ] Database has proper indexes (query results show indexes exist)
- [ ] No RLS policy errors in logs
- [ ] Users report settings persist correctly

## Rollback Plan (If Needed)

If something goes wrong:

### Option 1: Drop Added Columns
```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS font_size;
ALTER TABLE profiles DROP COLUMN IF EXISTS ui_language;
ALTER TABLE profiles DROP COLUMN IF EXISTS auto_play_videos;
ALTER TABLE profiles DROP COLUMN IF EXISTS reduced_motion;
ALTER TABLE profiles DROP COLUMN IF EXISTS high_contrast;
```

### Option 2: Revert RLS Policies
Drop problematic policies and recreate simpler versions:
```sql
-- Drop new policies
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
-- Recreate minimal policy
CREATE POLICY "allow_update" ON profiles
  FOR UPDATE USING (true);
```

### Option 3: Full Database Restore
- Restore from backup before migration
- Re-test thoroughly

---

## Deployment Timeline

- [ ] **Day 1**: Apply migration 0041
- [ ] **Day 1**: Verify RLS policies in database
- [ ] **Day 1**: Deploy code changes (AuthContext, EnhancedSettings, schema)
- [ ] **Day 2**: Internal testing of all tabs
- [ ] **Day 3**: User acceptance testing
- [ ] **Day 4**: Production release

---

## Success Criteria

✅ **All of these must pass**:
1. Font size, language, and accessibility settings persist across page refreshes
2. Currency and region settings persist across page refreshes
3. All profile information persists
4. All notification preferences persist
5. No console errors or warnings
6. Database shows proper indexes
7. RLS policies protect user data
8. Settings load from database on page refresh

---

## Sign-Off Checklist

**QA Team**:
- [ ] All tests passed
- [ ] No regressions found
- [ ] Performance acceptable

**Developer**:
- [ ] Code reviewed
- [ ] Migration applied correctly
- [ ] No outstanding issues

**Product**:
- [ ] Feature meets requirements
- [ ] User experience acceptable
- [ ] Ready for production

---

**Status**: Ready for deployment! 🚀

