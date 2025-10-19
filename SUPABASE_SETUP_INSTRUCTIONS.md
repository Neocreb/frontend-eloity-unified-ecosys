# Supabase Setup Instructions

This document provides step-by-step instructions for setting up your Supabase credentials for the Eloity Unified Ecosystem Platform.

## Security Notice

⚠️ **Never commit real credentials to version control.** This project uses `.gitignore` to exclude `.env.local` files, but you must still be vigilant about security.

## Prerequisites

1. A Supabase account (free tier available at https://supabase.com/)
2. Your Supabase project ID (visible in the project dashboard URL)

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/ and sign up or log in
2. Click "New Project"
3. Enter a name for your project
4. Select a region closest to you
5. Set a database password (make sure to save this!)
6. Click "Create New Project"

## Step 2: Get Your Project Credentials

1. Once your project is created, go to the project dashboard
2. In the left sidebar, click on "Project Settings" (gear icon)
3. Click on "API" in the settings menu

You'll find the following information:

- **Project URL**: This is your `VITE_SUPABASE_URL`
- **anon public key**: This is your `VITE_SUPABASE_PUBLISHABLE_KEY`
- **service_role key**: This is your `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Configure Environment Variables Securely

### For Local Development

1. Copy `.env` to create `.env.local`:
   ```bash
   cp .env .env.local
   ```

2. Update `.env.local` with your actual Supabase credentials:
   ```env
   # Supabase Configuration (Required for Supabase integration)
   VITE_SUPABASE_PROJECT_ID=your-actual-project-id
   VITE_SUPABASE_URL=your-actual-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-actual-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

   # Database Configuration (Required for migrations)
   SUPABASE_DB_URL=postgresql://postgres:your-actual-db-password@your-project-id.supabase.co:5432/postgres
   DATABASE_URL=postgresql://postgres:your-actual-db-password@your-project-id.supabase.co:5432/postgres
   ```

3. Verify that `.env.local` is in `.gitignore` (it should be already)

### For Production Deployment

Set environment variables through your deployment platform's UI rather than committing them:

**Vercel:**
1. Go to your Vercel project
2. Navigate to Settings > Environment Variables
3. Add each required variable with its production value

**Netlify:**
1. Go to your Netlify site
2. Navigate to Site settings > Build & deploy > Environment
3. Add your environment variables

## Step 4: Test Your Configuration

Run the environment test script to verify your configuration:

```bash
npm run test:env
```

If all variables show as "SET" and not "USING PLACEHOLDER VALUE", you're ready to proceed.

## Step 5: Run Database Migrations

Once your environment variables are properly configured, run the database migrations:

```bash
npm run migrate:apply
```

## Troubleshooting

### "No database URL set" Error

This error occurs when the migration script can't find the `SUPABASE_DB_URL` or `DATABASE_URL` environment variables.

**Solution:**
1. Ensure your `.env.local` file contains the database URL variables
2. Verify that you've replaced the placeholder values with actual credentials
3. Restart your terminal/command prompt to ensure environment variables are loaded

### "Connection refused" or "Authentication failed" Errors

These errors occur when the database credentials are incorrect.

**Solution:**
1. Double-check your Supabase project URL
2. Verify your database password is correct
3. Ensure your Supabase project is not paused

### "Permission denied" or "Insufficient privileges" Errors

These errors occur when the database user doesn't have sufficient privileges.

**Solution:**
1. Use the `SUPABASE_SERVICE_ROLE_KEY` which has admin privileges
2. Ensure your database user has permission to create tables and modify schema

## Security Best Practices

1. **Never commit actual credentials to version control**
   - The project already includes `.env.local` in `.gitignore`
   - Use different credentials for development and production

2. **Regularly rotate your keys**
   - Change your API keys periodically
   - Update your database password regularly

3. **Monitor for suspicious activity**
   - Check your Supabase project logs regularly
   - Set up alerts for unusual database activity

4. **Use environment-specific configurations**
   - Maintain separate environment files for different stages
   - Use different keys for each environment

## Next Steps

Once your Supabase integration is working:

1. Explore the admin dashboard
2. Set up initial user accounts
3. Configure payment processors
4. Customize the platform for your needs

For more detailed documentation, refer to the README files in the repository and the Supabase documentation at https://supabase.com/docs.