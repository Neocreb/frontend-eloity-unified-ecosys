# Settings Persistence System - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Settings Categories](#settings-categories)
4. [Database Schema](#database-schema)
5. [RLS Policies](#rls-policies)
6. [Frontend Implementation](#frontend-implementation)
7. [Adding New Settings](#adding-new-settings)
8. [Troubleshooting](#troubleshooting)
9. [Migration Guide](#migration-guide)
10. [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

Eloity's settings system provides a comprehensive way for users to persist their preferences across the platform. Settings are stored in a combination of:

- **Client-side (localStorage)**: Accessibility, theme preferences (client-only UI settings)
- **Server-side (Supabase)**: User profile data, notification preferences, banking info, currency settings

### Key Features

✅ User-specific data isolation (RLS enforced)  
✅ Automatic persistence on save  
✅ Type-safe settings management  
✅ Real-time validation  
✅ Error handling and recovery  
✅ Audit trail via timestamps

---

## Architecture

### Three-Layer Pattern

```
┌─────────────────────────────────────────────┐
│          UI Components (Settings Pages)     │
│  - CurrencySettings.tsx                     │
│  - PlatformSettings.tsx                     │
│  - NotificationSettings.tsx                 │
│  - EnhancedSettings.tsx                     │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────┴────────────────────────────┐
│  Service/Context Layer                      │
│  - CurrencyContext                          │
│  - NotificationSettingsService              │
│  - AuthContext                              │
│  - AdminService                             │
└────────────────┬────────────────────────────┘
                 │
┌─────────────────┴────────────────────────────┐
│  Database Layer (Supabase)                  │
│  - profiles table (user settings)           │
│  - notification_preferences table           │
│  - user_banking_info table                  │
│  - platform_settings table (admin)          │
└─────────────────────────────────────────────┘
```

### Data Flow

#### Saving Settings:
```
User Input → UI State → Service/Hook → Supabase Update → Confirmation Toast → UI Update
                          ↓
                    Error Handling
                    & Logging
```

#### Loading Settings:
```
Page Mount → Check Auth Context → Load from Supabase → Set UI State → Render
                                    ↓
                            RLS checks auth.uid()
```

---

## Settings Categories

### 1. **User Profile Settings** (Persisted in `profiles` table)

| Setting | Column | Type | Default | Scope |
|---------|--------|------|---------|-------|
| Preferred Currency | `preferred_currency` | VARCHAR(10) | 'USD' | User |
| Auto-Detect Currency | `auto_detect_currency` | BOOLEAN | true | User |
| Currency Last Updated | `currency_updated_at` | TIMESTAMP | NOW() | System |
| Bio | `bio` | TEXT | NULL | User |
| Avatar URL | `avatar_url` | TEXT | NULL | User |
| Banner URL | `banner_url` | TEXT | NULL | User |
| Full Name | `full_name` | VARCHAR | NULL | User |
| Username | `username` | VARCHAR | NULL | User |
| Is Verified | `is_verified` | BOOLEAN | false | User |

**Related File**: `src/pages/settings/CurrencySettings.tsx`

### 2. **Notification Settings** (Persisted in `notification_preferences` table)

| Setting | Column | Type | Default | Scope |
|---------|--------|------|---------|-------|
| Global Notifications | `global_enabled` | BOOLEAN | true | User |
| Push Enabled | `push_enabled` | BOOLEAN | true | User |
| Email Enabled | `email_enabled` | BOOLEAN | true | User |
| SMS Enabled | `sms_enabled` | BOOLEAN | false | User |
| In-App Enabled | `in_app_enabled` | BOOLEAN | true | User |
| Notification Categories | `preferences` | JSONB | {...} | User |
| Quiet Hours Start | `quiet_hours_start` | VARCHAR | NULL | User |
| Quiet Hours End | `quiet_hours_end` | VARCHAR | NULL | User |
| Frequency | `frequency` | VARCHAR | 'instant' | User |
| Digest Enabled | `digest` | BOOLEAN | false | User |
| Digest Time | `digest_time` | VARCHAR | NULL | User |
| Language | `language` | VARCHAR | 'en' | User |

**Default Preferences**:
```json
{
  "social": true,
  "trading": true,
  "marketplace": true,
  "system": true,
  "rewards": true,
  "freelance": true,
  "crypto": true,
  "chat": true
}
```

**Related File**: `src/pages/admin/PlatformSettings.tsx`, `src/components/notifications/NotificationSettings.tsx`

### 3. **Accessibility Settings** (Client-side localStorage only)

| Setting | Key | Type | Default | Scope |
|---------|-----|------|---------|-------|
| High Contrast | `highContrast` | BOOLEAN | false | Client |
| Dark Mode | `darkMode` | BOOLEAN | false | Client |
| Font Size | `fontSize` | NUMBER | 16 | Client |
| Font Family | `fontFamily` | STRING | 'sans' | Client |
| Reduced Motion | `reducedMotion` | BOOLEAN | false | Client |
| Screen Reader | `screenReader` | BOOLEAN | false | Client |
| Audio Descriptions | `audioDescriptions` | BOOLEAN | false | Client |
| Captions Enabled | `captionsEnabled` | BOOLEAN | false | Client |

**Storage Key**: `accessibility-settings` (localStorage)

**Related File**: `src/components/accessibility/AccessibilityFeatures.tsx`

### 4. **Theme Settings** (Client-side localStorage only)

| Setting | Key | Type | Default | Scope |
|---------|-----|------|---------|-------|
| Theme Mode | `theme` | 'light' \| 'dark' \| 'system' | 'system' | Client |

**Storage Key**: `theme` (localStorage)

**Related File**: `src/contexts/ThemeContext.tsx`

### 5. **Banking/Financial Settings** (Persisted in `user_banking_info` table)

| Setting | Column | Type | Default | Scope |
|---------|--------|------|---------|-------|
| Bank Name | `bank_name` | VARCHAR | NULL | User |
| Account Number | `account_number` | VARCHAR | NULL | User |
| Account Type | `account_type` | VARCHAR | NULL | User |
| Account Holder | `account_holder` | VARCHAR | NULL | User |
| Routing Number | `routing_number` | VARCHAR | NULL | User |
| SWIFT Code | `swift_code` | VARCHAR | NULL | User |
| IBAN | `iban` | VARCHAR | NULL | User |

**Related File**: `src/components/wallet/BankAccountSettings.tsx`

### 6. **Platform Settings** (Admin only, `platform_settings` table)

Stored as JSON in key-value pairs. Examples:

```json
{
  "maintenance_mode": false,
  "max_file_upload_size": 52428800,
  "api_rate_limit": 1000,
  "feature_flags": {
    "crypto_trading": true,
    "marketplace": true,
    "freelancing": true
  }
}
```

**Related File**: `src/pages/admin/PlatformSettings.tsx`

---

## Database Schema

### Profiles Table

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile Information
  username VARCHAR UNIQUE,
  full_name VARCHAR,
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  
  -- Currency Settings
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  auto_detect_currency BOOLEAN DEFAULT true,
  currency_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_preferred_currency ON public.profiles(preferred_currency);
CREATE INDEX idx_profiles_user_id_for_updates ON public.profiles(user_id);
```

### Notification Preferences Table

```sql
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Global Settings
  global_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  in_app_enabled BOOLEAN DEFAULT true,
  
  -- Category Preferences (JSONB)
  preferences JSONB DEFAULT '{
    "social": true,
    "trading": true,
    "marketplace": true,
    "system": true,
    "rewards": true,
    "freelance": true,
    "crypto": true,
    "chat": true
  }',
  
  -- Quiet Hours
  quiet_hours_start VARCHAR,
  quiet_hours_end VARCHAR,
  timezone VARCHAR,
  
  -- Digest Settings
  frequency VARCHAR DEFAULT 'instant',
  digest BOOLEAN DEFAULT false,
  digest_time VARCHAR,
  digest_days TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- User Preferences
  language VARCHAR DEFAULT 'en',
  unsubscribe_token VARCHAR,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
```

---

## RLS Policies

### Critical: WITH CHECK Clause Requirement

**Before Fix (Broken - Settings Don't Persist)**:
```sql
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
  -- Missing WITH CHECK - causes silent failure!
```

**After Fix (Working - Settings Persist)**:
```sql
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  -- WITH CHECK ensures updates are allowed
```

### Why WITH CHECK Matters

- **USING clause**: Determines which rows can be accessed (SELECT/DELETE behavior)
- **WITH CHECK clause**: Required for UPDATE/INSERT to allow the new values

Without WITH CHECK, PostgreSQL returns 0 rows updated even though the query succeeds.

### All RLS Policies

#### Profiles Table

```sql
-- SELECT: Users can view all profiles, admins can manage
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (true);

-- INSERT: Users can only insert their own profile
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Only auth system (cascading deletes)
CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);
```

#### Notification Preferences Table

```sql
-- SELECT: Users can view their own preferences
CREATE POLICY "notification_preferences_select" ON public.notification_preferences
  FOR SELECT USING (user_id = auth.uid());

-- INSERT: Users can create their own preferences
CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can update their own preferences (CRITICAL: WITH CHECK required)
CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete their own preferences
CREATE POLICY "notification_preferences_delete" ON public.notification_preferences
  FOR DELETE USING (user_id = auth.uid());
```

#### User Banking Info Table

```sql
CREATE POLICY "Users can update their own banking info" ON public.user_banking_info
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

## Frontend Implementation

### Pattern 1: Context-Based (Currency, Theme)

```typescript
// src/contexts/CurrencyContext.tsx
const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  
  const setCurrency = useCallback(async (currencyCode: string) => {
    try {
      // Update local state immediately
      const currency = getCurrencyByCode(currencyCode);
      setSelectedCurrency(currency);
      
      // Persist to database
      if (user?.id && session) {
        const { data, error } = await supabase
          .from('profiles')
          .update({ preferred_currency: currencyCode })
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('RLS policy blocked update');
        
        console.log('Settings saved successfully');
      } else {
        localStorage.setItem('preferred_currency', currencyCode);
      }
    } catch (error) {
      // Reset local state on error
      setSelectedCurrency(previousCurrency);
      throw error;
    }
  }, [user?.id, session]);
  
  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
```

### Pattern 2: Service-Based (Notifications)

```typescript
// src/services/notificationSettingsService.ts
class NotificationSettingsService {
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('No data returned from update');
      
      return data;
    } catch (error) {
      console.error('Update failed:', error);
      return null;
    }
  }
}
```

### Pattern 3: Hook-Based (Notification Settings)

```typescript
// src/hooks/useNotificationSettings.ts
export const useNotificationSettings = (userId: string) => {
  const [settings, setSettings] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const prefs = await notificationSettingsService.getUserPreferences(userId);
        setSettings(prefs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load'));
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [userId]);
  
  const updateSettings = useCallback(async (updates: Partial<NotificationPreferences>) => {
    try {
      const updated = await notificationSettingsService.updateUserPreferences(userId, updates);
      if (updated) {
        setSettings(updated);
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Update failed'));
      return null;
    }
  }, [userId]);
  
  return { settings, loading, error, updateSettings };
};
```

---

## Adding New Settings

### Step 1: Design the Setting

Determine:
- Storage location (profiles, notifications, or new table?)
- Data type (string, boolean, JSON object?)
- Default value
- User scope (personal, admin-wide, system?)

### Step 2: Create Migration

```sql
-- migrations/[number]_add_[setting_name].sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS [setting_name] [DATA_TYPE] DEFAULT [DEFAULT_VALUE];

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.[setting_name] IS '[Description of setting]';
```

### Step 3: Update RLS Policies (if new table)

```sql
-- Enable RLS
ALTER TABLE public.[table_name] ENABLE ROW LEVEL SECURITY;

-- Create policies with WITH CHECK
CREATE POLICY "users_select" ON public.[table_name]
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_insert" ON public.[table_name]
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update" ON public.[table_name]
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Step 4: Create Service/Hook

```typescript
// src/services/[setting]Service.ts or src/hooks/use[Setting].ts
export const useMySetting = () => {
  const { user } = useAuth();
  const [value, setValue] = useState<Type | null>(null);
  
  useEffect(() => {
    if (!user?.id) return;
    
    const loadSetting = async () => {
      const { data, error } = await supabase
        .from('[table]')
        .select('[column]')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) setValue(data.[column]);
    };
    
    loadSetting();
  }, [user?.id]);
  
  const updateSetting = useCallback(async (newValue: Type) => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('[table]')
      .update({ [column]: newValue })
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (!error && data) {
      setValue(data.[column]);
      toast.success('Setting updated');
    } else {
      toast.error('Failed to update setting');
    }
  }, [user?.id]);
  
  return { value, updateSetting };
};
```

### Step 5: Create UI Component

```typescript
// src/pages/settings/MySetting.tsx
const MySettingPage: React.FC = () => {
  const { value, updateSetting } = useMySetting();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleChange = async (newValue: Type) => {
    setIsSaving(true);
    try {
      await updateSetting(newValue);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Setting</CardTitle>
      </CardHeader>
      <CardContent>
        <Switch
          checked={value}
          onCheckedChange={handleChange}
          disabled={isSaving}
        />
      </CardContent>
    </Card>
  );
};
```

### Step 6: Update TypeScript Types

```typescript
// src/types/user.ts
export interface UserProfile {
  // ... existing fields
  [setting_name]?: Type;
}

// src/integrations/supabase/types.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          // ... existing fields
          [setting_name]: Type | null;
        };
        Insert: {
          [setting_name]?: Type;
        };
        Update: {
          [setting_name]?: Type;
        };
      };
    };
  };
}
```

### Step 7: Test

1. Create a new user
2. Change the setting
3. Refresh the page - setting should persist
4. Log out and log back in - setting should still be there
5. Check browser console for any errors

---

## Troubleshooting

### Issue 1: Settings Don't Persist After Refresh

**Symptoms**:
- User changes a setting
- Toast shows "Setting saved"
- Page refreshes and setting reverts to old value
- Browser console shows no errors

**Root Causes**:
1. RLS policy missing `WITH CHECK` clause (most common)
2. Database transaction rolling back silently
3. User not properly authenticated when saving
4. Race condition between state update and DB write

**Solutions**:

```typescript
// Check 1: Verify RLS policy has WITH CHECK
// In Supabase Dashboard: Authentication → Policies
// Should show: "... WITH CHECK (auth.uid() = user_id)"

// Check 2: Add logging to identify the issue
const { data, error } = await supabase
  .from('profiles')
  .update({ preferred_currency: code })
  .eq('user_id', user.id)
  .select()
  .single();

console.log('Update result:', { data, error });

if (error) {
  console.error('Error details:', {
    code: error.code,  // Look for PGRST201 or similar
    message: error.message,
    details: error.details
  });
}

// Check 3: Verify user_id matches
console.log('Current user ID:', user.id);
console.log('Profile row user_id:', data?.user_id);

// Check 4: Use transaction pattern
await supabase
  .from('profiles')
  .update({ preferred_currency: code })
  .eq('user_id', user.id)
  .then(() => {
    // Only update UI after confirmation
    setSelectedCurrency(currency);
  });
```

### Issue 2: "Permission Denied" Error (403)

**Symptoms**:
- Toast shows "Failed to save settings"
- Console shows: `error code: 42501` or "permission denied"

**Root Causes**:
1. User not authenticated (session expired)
2. RLS policy too restrictive
3. Database grants insufficient

**Solutions**:

```typescript
// Check 1: Verify authentication status
const { user, session } = useAuth();
if (!user?.id || !session) {
  toast.error('Please log in to save settings');
  return;
}

// Check 2: Check RLS policy
// Should allow authenticated users:
// CREATE POLICY "name" ON table
//   FOR UPDATE 
//   USING (auth.uid() = user_id)
//   WITH CHECK (auth.uid() = user_id);

// Check 3: Verify database grants
// In Supabase SQL Editor:
SELECT grantee, privilege_type, table_name
FROM information_schema.table_privileges
WHERE table_name = 'profiles';
```

### Issue 3: "Column Does Not Exist" Error (42703)

**Symptoms**:
- Trying to save a new setting
- Console shows: `error code: 42703` or "column does not exist"

**Root Cause**: Migration not applied to database

**Solution**:

```sql
-- Apply the migration:
-- 1. Open Supabase SQL Editor
-- 2. Run migrations/0041_fix_settings_persistence_and_rls.sql
-- 3. Verify column exists:

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'preferred_currency';
```

### Issue 4: Null/Empty Values Not Saving

**Symptoms**:
- User clears a text field (sets to empty string)
- Setting doesn't update
- NULL values don't persist

**Root Cause**: Query filtering out NULL values

**Solution**:

```typescript
// Instead of relying on truthy checks:
const update = {
  bio: value  // Empty string won't be included
};

// Use explicit update:
const update = {
  bio: value ?? '',  // Always include, even if empty
  updated_at: new Date().toISOString()
};

// And verify the update:
const { data, error } = await supabase
  .from('profiles')
  .update(update)
  .eq('user_id', user.id)
  .select()
  .single();
```

### Issue 5: Settings Only Work When Logged In

**Symptoms**:
- Unauthenticated users can't save settings
- Accessibility/theme settings lost on refresh
- No localStorage fallback working

**Root Cause**: Missing localStorage fallback

**Solution**:

```typescript
const saveSetting = async (key: string, value: any) => {
  const { user } = useAuth();
  
  // Try database first
  if (user?.id) {
    try {
      await supabase
        .from('profiles')
        .update({ [key]: value })
        .eq('user_id', user.id);
      return;
    } catch (err) {
      console.warn('Database save failed, falling back to localStorage');
    }
  }
  
  // Fallback to localStorage for unauthenticated users
  localStorage.setItem(`setting_${key}`, JSON.stringify(value));
};

const loadSetting = async (key: string) => {
  const { user } = useAuth();
  
  // Try database first
  if (user?.id) {
    const { data } = await supabase
      .from('profiles')
      .select(key)
      .eq('user_id', user.id)
      .single();
    if (data?.[key]) return data[key];
  }
  
  // Fallback to localStorage
  const stored = localStorage.getItem(`setting_${key}`);
  return stored ? JSON.parse(stored) : null;
};
```

---

## Migration Guide

### Applying the Settings Fix

**Step 1**: Backup your database (Supabase Dashboard → Database → Backups)

**Step 2**: Open Supabase SQL Editor

**Step 3**: Copy and paste the migration:

```sql
-- From migrations/0041_fix_settings_persistence_and_rls.sql
-- (entire file content)
```

**Step 4**: Run the migration (Execute button)

**Step 5**: Check for success messages in the output:

```
Fixed profiles update policy with WITH CHECK clause
Fixed notification_preferences update policy with WITH CHECK clause
Created indexes for settings tables
```

**Step 6**: Test in your application:

```typescript
// Test currency settings
1. Login to app
2. Go to Settings → Currency Settings
3. Select a different currency
4. Refresh page
5. Currency should still be selected

// Test notification settings
1. Go to Notifications → Settings
2. Toggle a notification category
3. Refresh page
4. Toggle should still be on

// Test accessibility
1. Enable high contrast accessibility setting
2. Refresh page
3. Setting should persist (localStorage)
```

**Step 7**: Monitor browser console for errors:

```javascript
// You should see logs like:
// ✓ "Currency preference saved successfully: {currencyCode: 'NGN'}"
// ✓ "Notification preferences updated successfully: {...}"

// If you see errors, check:
// - "PGRST201" → RLS policy issue
// - "42703" → Missing column
// - "42501" → Permission denied
```

---

## Common Issues & Solutions

### Checklist for Settings Not Persisting

- [ ] **Step 1: Check Authentication**
  ```typescript
  const { user, session } = useAuth();
  console.log('User:', user?.id);
  console.log('Session:', session ? 'active' : 'none');
  ```

- [ ] **Step 2: Check Database Connection**
  ```typescript
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('user_id', user.id)
    .single();
  console.log('Database connected:', !error);
  ```

- [ ] **Step 3: Check RLS Policies**
  ```sql
  SELECT policyname, permissive, roles, qual, with_check
  FROM pg_policies
  WHERE tablename = 'profiles'
  AND policyname LIKE '%update%';
  
  -- Look for WITH CHECK in with_check column
  ```

- [ ] **Step 4: Check Migrations**
  ```sql
  -- Verify columns exist
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'profiles'
  AND column_name IN ('preferred_currency', 'auto_detect_currency');
  ```

- [ ] **Step 5: Check Browser Logs**
  - F12 → Console tab
  - Look for detailed error messages
  - Check Network tab for failed API calls

- [ ] **Step 6: Check Service Logs**
  - Supabase Dashboard → Logs
  - Look for PostgreSQL errors
  - Check rate limiting

### Quick Diagnostic Script

```typescript
// Run this in browser console to test settings system
async function testSettings() {
  const { user } = useAuth();
  
  if (!user?.id) {
    console.error('❌ Not authenticated');
    return;
  }
  
  console.log('✓ Authenticated as:', user.id);
  
  // Test read
  const { data: readData, error: readError } = await supabase
    .from('profiles')
    .select('preferred_currency')
    .eq('user_id', user.id)
    .single();
  
  if (readError) {
    console.error('❌ Read failed:', readError);
    return;
  }
  console.log('✓ Read works. Current currency:', readData?.preferred_currency);
  
  // Test update
  const { data: updateData, error: updateError } = await supabase
    .from('profiles')
    .update({ preferred_currency: 'EUR' })
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (updateError) {
    console.error('❌ Update failed:', updateError);
    console.error('   Code:', updateError.code);
    console.error('   Details:', updateError.details);
    return;
  }
  
  if (!updateData) {
    console.error('❌ Update returned no data (RLS WITH CHECK issue)');
    return;
  }
  
  console.log('✓ Update works. New currency:', updateData.preferred_currency);
  console.log('✅ All settings system checks passed!');
}

// Call it
testSettings();
```

---

## Support & Resources

### Related Files
- Migration: `migrations/0041_fix_settings_persistence_and_rls.sql`
- Currency Context: `src/contexts/CurrencyContext.tsx`
- Notification Service: `src/services/notificationSettingsService.ts`
- Currency Settings UI: `src/pages/settings/CurrencySettings.tsx`
- Enhanced Settings: `src/pages/EnhancedSettings.tsx`

### External Resources
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Context](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

### Key Concepts
- **RLS (Row Level Security)**: Database-level access control
- **USING clause**: Filter which rows are accessible
- **WITH CHECK clause**: Filter which rows can be updated/inserted
- **auth.uid()**: Current authenticated user's ID in Supabase
- **Foreign Key**: Link between auth.users and other tables

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01 | Initial documentation, settings persistence fixes |
| 1.1 | 2024-01 | Added troubleshooting section, diagnostic tools |
| 1.2 | 2024-01 | Added new settings categories, migration guide |

---

**Last Updated**: January 2024  
**Maintained By**: Development Team  
**Status**: Production Ready ✅
