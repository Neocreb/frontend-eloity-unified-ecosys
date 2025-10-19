#!/usr/bin/env node

// Script to help users get their Supabase credentials securely

console.log("🔐 Supabase Credentials Helper");
console.log("==============================\n");

console.log("This script will guide you through getting your Supabase credentials securely.\n");

console.log("Step 1: Get Your Service Role Key");
console.log("----------------------------------");
console.log("1. Go to https://app.supabase.com/");
console.log("2. Select your project (hjebzdekquczudhrygns)");
console.log("3. In the left sidebar, click on 'Project Settings' (gear icon)");
console.log("4. Click on 'API' in the settings menu");
console.log("5. Find the 'service_role' key (NOT the 'anon' key)");
console.log("6. Copy this key - it's your SUPABASE_SERVICE_ROLE_KEY\n");

console.log("Step 2: Get Your Database Password");
console.log("-----------------------------------");
console.log("1. In the same Supabase dashboard");
console.log("2. Click on 'Settings' in the left sidebar");
console.log("3. Click on 'Database'");
console.log("4. Under 'Connection Info', find your database password");
console.log("5. If you need to reset it, use the 'Reset Password' button\n");

console.log("Step 3: Update Your .env.local File");
console.log("------------------------------------");
console.log("Open your .env.local file and update these values:\n");

console.log("# Replace these placeholders with actual values from Supabase");
console.log("SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here");
console.log("SUPABASE_DB_URL=postgresql://postgres:your-db-password-here@hjebzdekquczudhrygns.supabase.co:5432/postgres");
console.log("DATABASE_URL=postgresql://postgres:your-db-password-here@hjebzdekquczudhrygns.supabase.co:5432/postgres\n");

console.log("Step 4: Generate Secure Secrets");
console.log("--------------------------------");
console.log("Run these commands in your terminal to generate secure secrets:\n");

console.log("# Generate JWT secret");
console.log("openssl rand -base64 32\n");

console.log("# Generate session secret");
console.log("openssl rand -base64 64\n");

console.log("Then update your .env.local with these generated secrets:\n");
console.log("JWT_SECRET=your-generated-jwt-secret");
console.log("SESSION_SECRET=your-generated-session-secret\n");

console.log("Security Reminders:");
console.log("-------------------");
console.log("✅ Never commit .env.local to version control");
console.log("✅ Use different credentials for development and production");
console.log("✅ Regularly rotate your keys for security");
console.log("✅ Monitor your Supabase project for unusual activity\n");

console.log("Once you've updated your .env.local file, test your configuration:");
console.log("npm run test:env\n");

console.log("Then run your migrations:");
console.log("npm run migrate:apply\n");