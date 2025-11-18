# Supabase MCP Integration Guide

This document explains how to set up and use the Supabase MCP (Multi-Channel Platform) integration for the Eloity Unified Ecosystem platform.

## Overview

The Eloity platform uses Supabase as its primary backend service, and this integration is specifically configured to work with the MCP server at:
`https://mcp.supabase.com/mcp?project_ref=hjebzdekquczudhrygns`

## Prerequisites

1. Node.js (version 18 or higher)
2. A Supabase account with access to project `hjebzdekquczudhrygns`
3. Git installed on your system

## Setting Up Supabase MCP Integration

### 1. Run the Automated Setup Script

The easiest way to configure the Supabase integration is to use our automated setup script:

```bash
npm run setup:supabase-mcp
```

This script will:
- Create or update your [.env](file:///C:/Users/HP/learn%20coding/frontend-eloity-unified-ecosys-5/.env) file with the correct configuration
- Generate secure secrets for JWT and session management
- Create a [.env.local](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/.env.local) file for local development (not committed to version control)

### 2. Manual Configuration

If you prefer to configure manually, follow these steps:

1. Create a [.env](file:///C:/Users/HP/learn%20coding/frontend-eloity-unified-ecosys-5/.env) file from [.env.example](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-3/.env.example):
   ```bash
   cp .env.example .env
   ```

2. Edit the [.env](file:///C:/Users/HP/learn%20coding/frontend-eloity-unified-ecosys-5/.env) file and add your Supabase credentials:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://hjebzdekquczudhrygns.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   
   # Database Configuration
   DATABASE_URL=postgresql://postgres:your_password@aws-0-us-west-1.pooler.supabase.com:5432/postgres
   
   # Auth Configuration
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_generated_jwt_secret
   SESSION_SECRET=your_generated_session_secret
   ```

### 3. Getting Your Supabase Credentials

To find your Supabase credentials:

1. Go to [https://app.supabase.com/project/hjebzdekquczudhrygns/settings/api](https://app.supabase.com/project/hjebzdekquczudhrygns/settings/api)
2. Copy your Project URL and Anonymous Key
3. Also copy your Service Role Key (needed for server-side operations)

For your database password:
1. Go to [https://app.supabase.com/project/hjebzdekquczudhrygns/settings/database](https://app.supabase.com/project/hjebzdekquczudhrygns/settings/database)
2. Find your database password under Connection Info

## Testing the Integration

### Run the Connection Test

After configuring your credentials, test the connection:

```bash
npm run test:supabase-mcp
```

This script will:
- Verify that your Supabase client is correctly configured
- Test the connection to your Supabase project
- Check that the MCP integration is working

### Manual Connection Test

You can also test manually by running:

```bash
node scripts/test-supabase-mcp-connection.js
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

For enhanced security, sensitive API keys are stored in environment variables:

### Environment Variables

The following environment variables are used:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)
- `DATABASE_URL`: Your database connection string
- `JWT_SECRET`: Secret for JWT token signing
- `SESSION_SECRET`: Secret for session management

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