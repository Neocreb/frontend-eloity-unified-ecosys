# Admin Setup Guide

## Quick Admin Access

### Default Admin Credentials

Once your database is set up, you can use these default admin credentials:

```
Email: admin@eloity.com
Password: Eloity2024!
```

**🔗 Admin Login URL:** `/admin/login`

## Database Setup Required

Before you can use admin access, you need to set up your database:

### Step 1: Set up Environment Variables

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. **Minimum required setup** - Update these values in your `.env` file:

   ```env
   # Database (Required)
   DATABASE_URL=postgresql://username:password@host:5432/database

   # Security (Required)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   SESSION_SECRET=your-session-secret-key
   ```

### Step 2: Option A - Use Neon Database (Recommended)

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in your `.env` file

**💡 Tip:** You can connect to **Neon** through the MCP Servers integration available in this chat interface! Click the "MCP Servers" button below the chat input to connect your Neon database.

### Step 3: Option B - Local PostgreSQL

If you prefer local development:

```bash
# Install PostgreSQL locally
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
createdb eloity

# Update .env with local database URL
DATABASE_URL=postgresql://username:password@localhost:5432/eloity
```

### Step 4: Initialize Database and Admin

```bash
# Install dependencies
npm install

# Generate and push database schema
npm run db:generate
npm run db:push

# Create default admin user
npm run create-admin
```

## Alternative: Manual Admin Creation

If the automated script doesn't work, you can manually create an admin user through the database:

### Using Drizzle Studio (Recommended)

```bash
# Open database studio
npm run db:studio
```

This opens a web interface where you can:

1. Create roles in the `admin_roles` table
2. Create users in the `users` table
3. Create admin entries in the `admin_users` table

### Using SQL (Advanced)

```sql
-- Insert admin role (if not exists)
INSERT INTO admin_roles (id, name, display_name, permissions, priority)
VALUES (
  gen_random_uuid(),
  'super_admin',
  'Super Administrator',
  '["admin.all", "users.all", "content.all", "marketplace.all", "crypto.all", "freelance.all", "settings.all", "moderation.all"]',
  1000
) ON CONFLICT (name) DO NOTHING;

-- Insert user account
INSERT INTO users (id, email, password, email_confirmed)
VALUES (
  gen_random_uuid(),
  'admin@eloity.com',
  '$2b$12$hash-of-Eloity2024!', -- Use bcrypt to hash the password
  true
);

-- Create admin user (link user to role)
INSERT INTO admin_users (user_id, role_id, is_active)
SELECT u.id, r.id, true
FROM users u, admin_roles r
WHERE u.email = 'admin@eloity.com'
AND r.name = 'super_admin';
```

## Accessing Admin Dashboard

Once set up, access the admin panel at:

- **Local Development:** `http://localhost:5000/admin/login`
- **Production:** `https://your-domain.com/admin/login`

## Security Notes

⚠️ **Important Security Reminders:**

1. **Change the default password immediately** after first login
2. The default credentials should only be used for initial setup
3. Never use default credentials in production
4. Set up proper environment variables for production
5. Enable MFA (Multi-Factor Authentication) for admin accounts

## Troubleshooting

### "Loading Eloity..." on Admin Login

This usually means:

1. Database is not connected (check `DATABASE_URL`)
2. Admin user doesn't exist (run `npm run create-admin`)
3. Database schema is not up to date (run `npm run db:push`)

### "Invalid credentials" Error

1. Verify admin user exists in database
2. Check password is correct: `Eloity2024!`
3. Ensure database connection is working

### Database Connection Issues

1. Verify `DATABASE_URL` is correct in `.env`
2. Test database connection: `npm run db:studio`
3. Check database server is running

## Need Help?

If you're still having issues:

1. **Connect Neon Database:** Use the "MCP Servers" button in the chat to connect your database
2. **Check logs:** Look at server console for error messages
3. **Verify setup:** Run `npm run check` to validate configuration
4. **Database studio:** Use `npm run db:studio` to inspect your database

## Next Steps After Login

Once you have admin access:

1. Change default password
2. Create additional admin users
3. Configure platform settings
4. Set up content moderation rules
5. Review user management options
6. Configure payment and crypto settings