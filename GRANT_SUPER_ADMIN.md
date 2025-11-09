# How to Grant Super Admin Privileges

This document explains how to grant super admin privileges to a user in the Eloity platform.

## Prerequisites

1. Access to the database (either local development database or production database)
2. Database credentials
3. User ID of the user to be granted super admin privileges

## Method 1: Using the Script (Recommended)

We've created a script that automates the process of granting super admin privileges:

```bash
npm run grant-super-admin <user-id>
```

Example:
```bash
npm run grant-super-admin 4211e864-4051-4404-b8b7-60d937b8631c
```

### Setup Required

Before running the script, you need to set up your environment variables in a `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_actual_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_actual_supabase_anon_key

# Database Configuration (if using direct database connection)
DATABASE_URL=your_database_connection_string
```

## Method 2: Manual Database Update

If you prefer to manually grant super admin privileges, you can directly insert a record into the `admin_permissions` table:

```sql
INSERT INTO admin_permissions (user_id, role, permissions, is_active, granted_by)
VALUES (
  '4211e864-4051-4404-b8b7-60d937b8631c',
  'super_admin',
  '["admin.all", "users.all", "content.all", "marketplace.all", "crypto.all", "freelance.all", "financial.all", "settings.all", "moderation.all", "analytics.all", "system.all"]',
  true,
  '4211e864-4051-4404-b8b7-60d937b8631c'
);
```

## Method 3: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the Table Editor
3. Select the `admin_permissions` table
4. Click "Insert" to add a new row
5. Fill in the following fields:
   - `user_id`: 4211e864-4051-4404-b8b7-60d937b8631c
   - `role`: super_admin
   - `permissions`: ["admin.all", "users.all", "content.all", "marketplace.all", "crypto.all", "freelance.all", "financial.all", "settings.all", "moderation.all", "analytics.all", "system.all"]
   - `is_active`: true
   - `granted_by`: 4211e864-4051-4404-b8b7-60d937b8631c (or the ID of the admin granting the permission)

## Super Admin Permissions

Super admins have access to all platform features and administrative functions:

- Full user management
- Content moderation
- Marketplace oversight
- Crypto trading monitoring
- Freelance platform management
- Financial controls
- System settings
- Analytics and reporting

## Verification

After granting super admin privileges, the user should be able to:

1. Access the admin dashboard at `/admin/login`
2. See all administrative options in the sidebar
3. Perform all administrative actions

## Security Notes

- Only grant super admin privileges to trusted users
- Regularly review admin permissions
- Use strong authentication for admin accounts
- Consider implementing two-factor authentication for admin users