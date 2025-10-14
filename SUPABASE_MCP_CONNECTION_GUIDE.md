# Supabase MCP Connection Guide

## Overview
This guide explains how to properly connect to your Supabase MCP (Multiplayer Code Protocol) server for the Eloity Unified Ecosystem project.

## Current Configuration
Your project is configured to connect to Supabase MCP server with:
- Project Reference: `hjebzdekquczudhrygns`
- MCP URL: `https://mcp.supabase.com/mcp?project_ref=hjebzdekquczudhrygns`

## Steps to Complete the Connection

### 1. Get Your Supabase Credentials
1. Visit the Supabase dashboard: https://app.supabase.com/project/hjebzdekquczudhrygns
2. Go to Project Settings > API
3. Copy the following values:
   - Project URL
   - anon (public) key - This is your `VITE_SUPABASE_PUBLISHABLE_KEY`

### 2. Update Environment Variables
Update your [.env](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-1/.env) file with the real credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://hjebzdekquczudhrygns.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-actual-anon-key-here
```

### 3. Test the Connection
Run the test script to verify your connection:

```bash
node test-mcp-connection.js
```

### 4. Using the Supabase Client in Your Application
The project already has a configured Supabase client in [src/integrations/supabase/client.ts](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-1/src/integrations/supabase/client.ts). You can import and use it like this:

```javascript
import { supabase } from "@/integrations/supabase/client";

// Example usage
const { data, error } = await supabase
  .from('users')
  .select('*');
```

## Troubleshooting

### Common Issues
1. **Invalid API key**: Make sure you're using the anon (public) key, not the service role key
2. **Network connectivity**: Ensure your firewall isn't blocking connections to Supabase
3. **CORS issues**: Check that your frontend URL is in the Supabase dashboard's allowed CORS origins

### Testing Scripts
The project includes several test scripts to verify your connection:
- [test-mcp-connection.js](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-1/test-mcp-connection.js) - Basic MCP connection test
- [test-supabase-config.js](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-1/test-supabase-config.js) - Environment variable verification
- [test-supabase-connection.js](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-1/test-supabase-connection.js) - Full connection test

Run any of these scripts with:
```bash
node script-name.js
```

## Next Steps
After successfully connecting to Supabase:
1. Run database migrations using the scripts in the [migrations](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-1/migrations) folder
2. Create necessary tables using [create-tables-supabase.js](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-1/scripts/create-tables-supabase.js) or similar scripts
3. Implement authentication using Supabase Auth
4. Set up real-time subscriptions for live updates