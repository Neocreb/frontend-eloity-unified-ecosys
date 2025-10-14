# Supabase Table Creation Guide

Since we don't have direct permissions to create tables through the Supabase client, you'll need to create the required tables manually through the Supabase dashboard. This guide will walk you through the process.

## Prerequisites

1. Access to your Supabase project dashboard
2. Project URL: `https://hjebzdekquczudhrygns.supabase.co`
3. Admin credentials for the Supabase dashboard

## Steps to Create Tables

### 1. Access the Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in with your Supabase account
3. Select your project with reference ID: `hjebzdekquczudhrygns`

### 2. Navigate to the Table Editor

1. In the left sidebar, click on "Table Editor"
2. You'll see your existing tables like `users`, `posts`, etc.

### 3. Create the Required Tables

You need to create the following tables:

#### Table 1: chat_ads

Click "New Table" and create with these columns:

| Column Name | Data Type | Required | Default Value | Description |
|-------------|-----------|----------|---------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key |
| sponsor | Text | No | - | Ad sponsor name |
| title | Text | Yes | - | Ad title |
| body | Text | No | - | Ad description |
| image_url | Text | No | - | Ad image URL |
| cta_label | Text | No | - | Call-to-action label |
| cta_url | Text | No | - | Call-to-action URL |
| is_active | Boolean | No | true | Whether ad is active |
| priority | Integer | No | 0 | Ad priority for ordering |
| start_date | Timestamp with time zone | No | - | When ad becomes active |
| end_date | Timestamp with time zone | No | - | When ad expires |
| created_at | Timestamp with time zone | No | NOW() | Creation timestamp |
| updated_at | Timestamp with time zone | No | NOW() | Last update timestamp |

#### Table 2: flagged_messages

Click "New Table" and create with these columns:

| Column Name | Data Type | Required | Default Value | Description |
|-------------|-----------|----------|---------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key |
| message_id | UUID | Yes | - | Reference to chat message |
| thread_id | UUID | Yes | - | Reference to chat thread |
| reporter_id | UUID | No | - | User who reported the message |
| reason | Text | Yes | - | Reason for flagging |
| description | Text | No | - | Additional description |
| status | Text | No | 'pending' | Flag status (pending, approved, rejected, resolved) |
| priority | Text | No | 'medium' | Priority level (low, medium, high) |
| auto_detected | Boolean | No | false | Whether flagged by AI |
| confidence_score | Numeric (5,2) | No | - | AI confidence score |
| reviewed_by | UUID | No | - | Admin who reviewed |
| reviewed_at | Timestamp with time zone | No | - | Review timestamp |
| review_notes | Text | No | - | Reviewer notes |
| created_at | Timestamp with time zone | No | NOW() | Creation timestamp |
| updated_at | Timestamp with time zone | No | NOW() | Last update timestamp |

#### Table 3: admin_users

Click "New Table" and create with these columns:

| Column Name | Data Type | Required | Default Value | Description |
|-------------|-----------|----------|---------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key |
| user_id | UUID | Yes | - | Reference to users table |
| email | Text | Yes | - | Admin email (unique) |
| name | Text | No | - | Admin name |
| avatar_url | Text | No | - | Admin avatar |
| roles | Text[] | No | ARRAY['content_admin'] | Admin roles |
| permissions | Text[] | No | - | Specific permissions |
| is_active | Boolean | No | true | Whether admin is active |
| last_login | Timestamp with time zone | No | - | Last login timestamp |
| created_at | Timestamp with time zone | No | NOW() | Creation timestamp |
| updated_at | Timestamp with time zone | No | NOW() | Last update timestamp |

#### Table 4: admin_sessions

Click "New Table" and create with these columns:

| Column Name | Data Type | Required | Default Value | Description |
|-------------|-----------|----------|---------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key |
| admin_id | UUID | Yes | - | Reference to admin_users |
| session_token | Text | Yes | - | Unique session token |
| ip_address | Text | No | - | IP address |
| user_agent | Text | No | - | Browser user agent |
| is_active | Boolean | No | true | Whether session is active |
| expires_at | Timestamp with time zone | Yes | - | Session expiration |
| last_activity | Timestamp with time zone | No | NOW() | Last activity timestamp |
| created_at | Timestamp with time zone | No | NOW() | Creation timestamp |

#### Table 5: admin_activity_logs

Click "New Table" and create with these columns:

| Column Name | Data Type | Required | Default Value | Description |
|-------------|-----------|----------|---------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key |
| admin_id | UUID | Yes | - | Reference to admin_users |
| admin_name | Text | No | - | Admin name (cached) |
| action | Text | Yes | - | Action performed |
| target_type | Text | No | - | Type of target (user, post, etc.) |
| target_id | UUID | No | - | ID of target |
| details | JSONB | No | - | Additional details |
| ip_address | Text | No | - | IP address |
| user_agent | Text | No | - | Browser user agent |
| created_at | Timestamp with time zone | No | NOW() | Creation timestamp |

#### Table 6: platform_settings

Click "New Table" and create with these columns:

| Column Name | Data Type | Required | Default Value | Description |
|-------------|-----------|----------|---------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key |
| key | Text | Yes | - | Setting key (unique) |
| value | JSONB | No | - | Setting value |
| category | Text | No | - | Setting category |
| description | Text | No | - | Setting description |
| is_public | Boolean | No | false | Whether setting is public |
| last_modified_by | UUID | No | - | Admin who last modified |
| created_at | Timestamp with time zone | No | NOW() | Creation timestamp |
| updated_at | Timestamp with time zone | No | NOW() | Last update timestamp |

### 4. Create Indexes (Optional but Recommended)

For better performance, create these indexes:

1. On `chat_ads`: 
   - `is_active` index
   - `priority` index

2. On `flagged_messages`:
   - `status` index
   - `priority` index
   - `created_at` index

3. On `admin_activity_logs`:
   - `admin_id` index
   - `action` index
   - `created_at` index

### 5. Insert Default Data

After creating the tables, insert some default data:

#### Insert Default Admin User

If you have a user with email `admin@eloity.com` in your users table, insert them as an admin:

```sql
INSERT INTO admin_users (user_id, email, name, roles, permissions, is_active)
SELECT 
    id,
    email,
    full_name,
    ARRAY['super_admin'],
    ARRAY[
        'admin.all',
        'users.all',
        'content.all',
        'marketplace.all',
        'crypto.all',
        'freelance.all',
        'settings.all',
        'moderation.all'
    ],
    true
FROM users
WHERE email = 'admin@eloity.com';
```

#### Insert Default Platform Settings

```sql
INSERT INTO platform_settings (key, value, category, description, is_public)
VALUES 
    ('platform_name', '"Eloity Platform"', 'general', 'Platform display name', true),
    ('maintenance_mode', 'false', 'general', 'Enable maintenance mode', false),
    ('chat_ads_enabled', 'true', 'chat', 'Enable chat advertisements', true),
    ('moderation_auto_flag_threshold', '0.85', 'moderation', 'AI confidence threshold for auto-flagging', false);
```

## Testing the Setup

After creating the tables:

1. Run `node scripts/test-db-tables.js` to verify table access
2. Run `node scripts/insert-sample-ads.js` to insert sample ads
3. Test the AdminChat interface to verify it's working with real data

## Troubleshooting

If you encounter issues:

1. **Permission Errors**: Make sure you're using the correct Supabase credentials
2. **Table Already Exists**: Skip creation if tables already exist
3. **Foreign Key Constraints**: Ensure referenced tables exist before creating tables with foreign keys
4. **Data Type Issues**: Make sure you're using the correct data types for each column

## Next Steps

Once the tables are created:

1. Update the chatAdsService to use the new database tables
2. Test the admin interface with real data
3. Implement additional features like user management and content moderation