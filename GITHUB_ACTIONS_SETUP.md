# GitHub Actions Setup for Supabase Migrations

This document provides instructions for setting up GitHub Actions secrets to enable automatic Supabase migrations.

## Issue Explanation

The GitHub Actions workflow is failing with the error:
```
No database URL set. Set SUPABASE_DB_URL (preferred) or DATABASE_URL to your Supabase Postgres connection string.
```

This happens because the GitHub Actions environment doesn't have access to your local `.env.local` file, which contains the database credentials.

## Solution

You need to set up GitHub Actions secrets in your repository settings.

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" → "Actions"
4. Click "New repository secret" button
5. Add the following secrets:

### Required Secrets

1. **SUPABASE_DB_URL**
   - Name: `SUPABASE_DB_URL`
   - Value: Your Supabase database URL
   - Example: `postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT_ID].supabase.co:5432/postgres`

2. **DATABASE_URL** (backup)
   - Name: `DATABASE_URL`
   - Value: Same as SUPABASE_DB_URL (for compatibility)
   - Example: `postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT_ID].supabase.co:5432/postgres`

## Getting Your Supabase Database URL

1. Go to https://app.supabase.com/
2. Select your project
3. In the left sidebar, click on "Settings" → "Database"
4. Under "Connection Info", find your database connection string
5. It should look like: `postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT_ID].supabase.co:5432/postgres`

## Security Notes

- Never commit actual credentials to your repository
- GitHub secrets are encrypted and only accessible to GitHub Actions workflows
- Use different credentials for development and production environments
- Regularly rotate your database passwords

## Verification

After setting up the secrets:

1. Go to the "Actions" tab in your GitHub repository
2. Find the "Apply Supabase Migrations" workflow
3. Click "Run workflow" to manually trigger it
4. Check that the workflow completes successfully

## Troubleshooting

If the workflow still fails:

1. Verify that both `SUPABASE_DB_URL` and `DATABASE_URL` secrets are set
2. Check that the database URL format is correct
3. Ensure your Supabase project is not paused
4. Verify that your database password is correct

## Alternative Approach

If you prefer not to use GitHub secrets, you can modify the workflow to use a different approach:

1. Remove the environment variables from the workflow
2. The updated migration script will automatically load from `.env` and `.env.local` files
3. However, this would require committing your credentials, which is not recommended

The recommended approach is to use GitHub secrets as described above.