# Eloity Platform - Supabase Integration

This document explains how to set up and use the Supabase integration for the Eloity Unified Ecosystem platform.

## Overview

The Eloity platform uses Supabase as its primary backend service for:
- User authentication and management
- Database storage and querying
- Real-time subscriptions
- File storage
- Edge functions for secure secret management

## Prerequisites

1. Node.js (version 18 or higher)
2. A Supabase account (free tier available at [supabase.com](https://supabase.com))
3. Git installed on your system

## Setting Up Supabase

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Create a new project:
   - Choose a project name
   - Select a region closest to your users
   - Set a strong database password
3. Wait for the project to be created (this may take a few minutes)

### 2. Get Your Supabase Credentials

Once your project is ready, navigate to the project settings:
1. Go to Project Settings > API
2. Note down your:
   - Project URL (VITE_SUPABASE_URL)
   - Anonymous Key (VITE_SUPABASE_PUBLISHABLE_KEY)
   - Service Role Key (for server-side operations)

### 3. Configure Environment Variables

Create a [.env](file:///C:/Users/HP/learn%20coding/frontend-eloity-unified-ecosys-5/.env) file in the root of your project:

```bash
cp .env.example .env
```

Edit the [.env](file:///C:/Users/HP/learn%20coding/frontend-eloity-unified-ecosys-5/.env) file and add your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Database Configuration
DATABASE_URL=your_postgres_database_url

# Auth Configuration
JWT_SECRET=your_jwt_secret_key
```

### 4. Install Dependencies

Install all required dependencies:

```bash
npm install
```

### 5. Apply Database Migrations

Run the migration script to set up your database schema:

```bash
node apply-migrations.js
```

This will create all necessary tables and set up Row Level Security (RLS) policies.

### 6. Test the Connection

Verify that your Supabase configuration is working:

```bash
node test-supabase-connection.js
```

## Using Supabase in the Application

### Authentication

The platform uses Supabase Auth for user authentication. The authentication service is implemented in [src/services/authService.ts](file:///C:/Users/HP/learn%20coding/frontend-eloity-unified-ecosys-5/src/services/authService.ts).

### Database Operations

Database operations are performed using the Supabase client:

```javascript
import { supabase } from "@/integrations/supabase/client";

// Example: Get user profile
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Real-time Subscriptions

The platform uses Supabase Real-time for live updates:

```javascript
import { supabase } from "@/integrations/supabase/client";

// Example: Subscribe to new messages
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

## Secure Secret Management

For enhanced security, sensitive API keys are stored in Supabase Edge Functions:

### Deploying Edge Functions

1. Deploy the `get-secret` Edge Function:
   ```bash
   node scripts/deploy-edge-function.js
   ```

2. Set your secret keys in the Supabase Dashboard:
   - Go to Project Settings > API > Edge Functions
   - Add environment variables for your secret keys

### Retrieving Secrets

Use the retrieval script to get your secret keys:
```bash
node scripts/retrieve-supabase-secrets.js
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**:
   - Ensure all required environment variables are set in your [.env](file:///C:/Users/HP/learn%20coding/frontend-eloity-unified-ecosys-5/.env) file
   - Restart your development server after updating environment variables

2. **Database Connection Failed**:
   - Verify your `DATABASE_URL` is correct
   - Check that your Supabase project is not paused
   - Ensure your IP is allowed in the Supabase database settings

3. **RLS Policy Errors**:
   - Make sure you're authenticated when accessing protected tables
   - Check that RLS policies are correctly defined in your migrations

### Testing

Run individual test scripts to verify functionality:

```bash
# Test user service
node test-user-service.js

# Test profile service
node test-profile-service.js

# Test database connection
node test-db-connection.js
```

## Production Deployment

When deploying to production:

1. Set environment variables in your deployment platform:
   - Vercel: Project Settings > Environment Variables
   - Heroku: Settings > Config Vars
   - Docker: Environment variables in docker-compose.yml

2. Ensure your Supabase project is configured for production:
   - Enable email confirmations if needed
   - Set up proper authentication providers
   - Configure database connection pooling

## Security Best Practices

1. **Never commit sensitive keys** to version control
2. **Use different keys** for development and production environments
3. **Regularly rotate API keys** for enhanced security
4. **Monitor API usage** to detect unusual activity
5. **Implement proper error handling** to avoid exposing sensitive information

## Support

If you encounter any issues during the setup process:

1. Check the application logs for error messages
2. Verify all environment variables are correctly set
3. Ensure your Supabase project is properly configured
4. Refer to the [Supabase documentation](https://supabase.com/docs) for additional guidance

For additional help, you can:
- Check the [Supabase Integration Guide](file:///C:/Users/HP/learn%20coding/frontend-eloity-unified-ecosys-5/SUPABASE_INTEGRATION_SUMMARY.md)
- Review the [Secret Keys Integration Guide](file:///C:/Users/HP/learn%20coding/frontend-eloity-unified-ecosys-5/SUPABASE_SECRET_INTEGRATION_GUIDE.md)
- Look at the [Setup Guide](file:///C:/Users/HP/learn%20coding/frontend-eloity-unified-ecosys-5/SUPABASE_SETUP_GUIDE.md)