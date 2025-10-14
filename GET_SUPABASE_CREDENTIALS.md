# How to Get Your Supabase Credentials

## Step-by-Step Guide

### 1. Access Your Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Sign in with your account
3. Find your project with reference ID: `hjebzdekquczudhrygns`
4. Click on the project to open it

### 2. Navigate to API Settings
1. In the left sidebar, click on the gear icon (Settings)
2. In the Settings menu, click on "API"

### 3. Copy Your Credentials
You'll see two important pieces of information:

#### Project URL
- This should match what's already in your [.env](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-1/.env) file:
  ```
  https://hjebzdekquczudhrygns.supabase.co
  ```

#### Project API Keys
There are two keys listed:
1. **anon (public)** - This is your `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Used for client-side operations
   - Safe to expose in frontend code
2. **service_role (secret)** - Do NOT use this in your frontend
   - Used only for server-side operations
   - Keep this secret

### 4. Update Your Environment File
Replace the placeholder in your [.env](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-1/.env) file:

```env
# Before (placeholder)
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-anon-key-here

# After (with your actual key)
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZ...
```

### 5. Verify Your Connection
After updating your credentials, test the connection:

```bash
node verify-mcp-connection.js
```

## Troubleshooting

### If You Can't Access the Project
- Make sure you're logged into the correct Supabase account
- Check that you have the proper permissions for this project
- If you're a collaborator, make sure you've accepted the invitation

### If You Can't Find the API Keys
- Make sure you're in the correct project
- Check that you're looking at the "API" section under "Project Settings"
- Refresh the page if the keys aren't loading

### Common Mistakes
1. Using the service_role key instead of the anon key
2. Copying extra spaces or characters with the key
3. Forgetting to save the [.env](file:///C:/Users/HP/.qoder/frontend-eloity-unified-ecosys-1/.env) file after editing
4. Not restarting your development server after updating credentials