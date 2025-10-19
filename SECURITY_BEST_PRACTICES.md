# Security Best Practices for Environment Variables

This document outlines the security best practices for managing environment variables in the Eloity Unified Ecosystem Platform.

## Understanding Environment Variable Files

The project uses multiple environment files with different purposes:

### .env (Committed to Repository)
- **Purpose**: Template file with placeholder values
- **Security**: Safe to commit as it contains no real credentials
- **Usage**: Serves as a reference for required environment variables

### .env.local (Never Committed)
- **Purpose**: Local development environment variables
- **Security**: Must never be committed to version control
- **Usage**: Contains actual development credentials
- **Git Status**: Automatically ignored via .gitignore

### Deployment Platform Environment Variables
- **Purpose**: Production/staging environment variables
- **Security**: Managed securely by the platform
- **Usage**: Set through deployment platform UI or CLI

## Security Guidelines

### 1. Never Commit Sensitive Data

**DO NOT** commit files containing:
- Real API keys or secrets
- Database passwords
- Service credentials
- Private keys

**DO** commit:
- Template files with placeholder values
- Documentation and instructions
- Non-sensitive configuration options

### 2. Proper File Usage

#### For Local Development
1. Copy `.env` to `.env.local`
2. Update `.env.local` with your actual credentials
3. Ensure `.env.local` is in `.gitignore`

#### For Production Deployment
1. Set environment variables through your deployment platform's UI
2. Use platform-specific secret management features
3. Never store secrets in version control

### 3. Environment Variable Classification

#### Public Variables (Safe for Client-side)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

These variables are prefixed with `VITE_` which makes them available to the frontend. They are meant to be public but should still not be committed with real values.

#### Private Variables (Server-side Only)
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`

These variables should NEVER be exposed to the client-side and should only be used in server-side code.

### 4. Credential Management

#### Generating Strong Secrets
Use secure methods to generate secrets:
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate session secret
openssl rand -base64 64
```

#### Rotating Credentials
1. Generate new credentials in respective services
2. Update environment variables in deployment platforms
3. Test application functionality
4. Revoke old credentials after successful transition

### 5. Access Control

#### Development Team
- Each developer should have their own `.env.local` file
- Never share actual credentials through insecure channels
- Use team password managers for sharing secrets when necessary

#### Production Access
- Limit access to production environment variables
- Use role-based access control in deployment platforms
- Audit access logs regularly

## Implementation in Code

### Loading Environment Variables
The application uses `dotenv` to load environment variables:
```javascript
import dotenv from 'dotenv';
dotenv.config(); // Loads .env and .env.local
```

### Using Environment Variables in Code
```javascript
// Public variables (available in frontend)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Private variables (server-side only)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

## Deployment Platform Integration

### Vercel
Set environment variables in the project settings:
1. Go to your Vercel project
2. Navigate to Settings > Environment Variables
3. Add each required variable with its production value

### Netlify
Set environment variables in the project settings:
1. Go to your Netlify site
2. Navigate to Site settings > Build & deploy > Environment
3. Add your environment variables

### Other Platforms
Most deployment platforms have similar environment variable management features. Always use these instead of committing real credentials.

## Monitoring and Auditing

### Regular Security Checks
1. Verify `.gitignore` includes environment files
2. Check repository for accidentally committed secrets
3. Review deployment platform access logs
4. Audit environment variable usage in code

### Incident Response
If credentials are accidentally committed:
1. Immediately revoke the compromised credentials
2. Generate new credentials
3. Update all affected systems
4. Remove sensitive data from repository history
5. Notify affected parties if necessary

## Additional Resources

- [Supabase Security Guide](https://supabase.com/docs/guides/security)
- [OWASP Configuration Management](https://owasp.org/www-project-cheat-sheets/cheatsheets/Configuration_Management_Cheat_Sheet)
- [12-Factor App - Configuration](https://12factor.net/config)

By following these security best practices, you can ensure that your Eloity platform remains secure while maintaining proper configuration management across different environments.