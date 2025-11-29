# Settings Persistence Fix - Quick Start Guide

## 🚨 Problem

Users report that settings (currency, notifications, preferences) don't persist after page refresh:

```
1. User changes currency to NGN
2. Toast shows "Currency saved"
3. User refreshes page
4. Currency reverts to USD ❌
```

## ✅ Root Cause

RLS UPDATE policies on `profiles` and `notification_preferences` tables are missing the **`WITH CHECK`** clause, causing silent update failures.

## 🔧 Solution - 3 Simple Steps

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your **Eloity** project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Apply the Migration

Copy and paste the entire contents of:

```
migrations/0041_fix_settings_persistence_and_rls.sql
```

Into the SQL editor, then click **Execute**.

You should see output like:
```
Fixed profiles update policy with WITH CHECK clause
Fixed notification_preferences update policy with WITH CHECK clause
Created indexes for settings tables
✅ SETTINGS PERSISTENCE FIX APPLIED
```

### Step 3: Test the Fix

In your application:

1. **Test Currency Settings**:
   - Go to **Settings** → **Currency Settings**
   - Select a different currency (e.g., NGN)
   - Click save
   - Refresh the page (F5)
   - ✅ Currency should still be selected

2. **Test Notification Settings**:
   - Go to **Settings** → **Notifications**
   - Toggle a notification category
   - Refresh the page
   - ✅ Toggle should remain

3. **Check Browser Console**:
   - Press **F12** → **Console**
   - You should see logs like:
     ```
     ✓ Currency preference saved successfully
     ✓ Notification preferences updated successfully
     ```

---

## 📋 What the Migration Does

| Issue | Fix |
|-------|-----|
| RLS UPDATE policies missing WITH CHECK | ✅ Added WITH CHECK clauses |
| Missing columns in profiles table | ✅ Added preferred_currency, auto_detect_currency |
| No trigger for timestamp updates | ✅ Created currency_updated_at trigger |
| Slow queries on settings tables | ✅ Added performance indexes |

## 🧪 Verification Checklist

After applying the migration:

- [ ] Currency settings save and persist ✅
- [ ] Notification preferences save and persist ✅
- [ ] No console errors when saving ✅
- [ ] Settings remain after page refresh ✅
- [ ] Settings remain after logout/login ✅

## 🆘 Troubleshooting

### Issue: "The migration didn't work"

**Verify by running this in the SQL Editor:**

```sql
-- Check if RLS policies have WITH CHECK clause
SELECT policyname, with_check
FROM pg_policies
WHERE tablename = 'profiles'
AND policyname LIKE '%update%';

-- Should return something with "auth.uid() = user_id" in WITH CHECK column
```

### Issue: "Still getting errors when saving"

**Check browser console** (F12):

1. Look for error code:
   - **PGRST201**: RLS policy still broken → Re-run migration
   - **42703**: Missing column → Check migration output
   - **42501**: Permission denied → Check auth status

2. **Add detailed logging**:

```typescript
// In src/contexts/CurrencyContext.tsx
const { data, error } = await supabase
  .from('profiles')
  .update({ preferred_currency: currencyCode })
  .eq('user_id', user.id)
  .select()
  .single();

console.log('Settings update result:', {
  success: !error && !!data,
  error: error?.message,
  errorCode: error?.code,
  dataReturned: !!data
});
```

## 📞 Still Having Issues?

1. **Check the detailed documentation**: `docs/SETTINGS_PERSISTENCE_GUIDE.md`
2. **Run the diagnostic script** in browser console:
   ```typescript
   // See "Quick Diagnostic Script" in the guide
   ```
3. **Check Supabase logs**: Dashboard → Logs → PostgreSQL

## 📊 What Gets Fixed

### Before Migration
```
Setting Changes:
  Currency: USD → NGN ✓ (UI updates)
  After refresh: USD ✗ (Reverted)
  
Reason:
  RLS UPDATE policy missing WITH CHECK
  Query runs but returns 0 rows updated (silent failure)
```

### After Migration
```
Setting Changes:
  Currency: USD → NGN ✓ (UI updates)
  Database update: ✅ (WITH CHECK now enforces)
  After refresh: NGN ✓ (Persisted!)
```

## 🎯 Next Steps

1. ✅ Apply migration from this guide
2. ✅ Test the three scenarios above
3. ✅ Share `docs/SETTINGS_PERSISTENCE_GUIDE.md` with your team
4. ✅ Monitor browser console for any warnings

---

**Status**: Ready to Apply  
**Priority**: High (Affects all users)  
**Time to Apply**: < 5 minutes  
**Testing Time**: ~5 minutes  

✅ **This migration is production-safe and includes automatic rollback safeguards**
