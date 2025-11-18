#!/usr/bin/env node

// Script to set up Supabase integration with MCP configuration
// This script will help configure the .env file with actual Supabase credentials for the provided MCP server

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Supabase MCP Integration Setup Script\n');
console.log('Project Reference: hjebzdekquczudhrygns');
console.log('MCP Server URL: https://mcp.supabase.com/mcp?project_ref=hjebzdekquczudhrygns\n');

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function setupSupabaseMCPIntegration() {
  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found!');
      console.log('Creating .env file from .env.example...');
      
      // Copy .env.example to .env if it doesn't exist
      const envExamplePath = path.join(__dirname, '..', '.env.example');
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file from .env.example');
      } else {
        console.log('❌ .env.example file not found!');
        return;
      }
    }

    console.log('📝 Please provide your Supabase credentials for project hjebzdekquczudhrygns:\n');
    
    // Get Supabase credentials from user
    console.log('To find these credentials:');
    console.log('1. Go to https://app.supabase.com/project/hjebzdekquczudhrygns/settings/api');
    console.log('2. Find your Project URL and Anonymous Key\n');
    
    const supabaseUrl = await prompt('Supabase Project URL (should be https://hjebzdekquczudhrygns.supabase.co): ') || 'https://hjebzdekquczudhrygns.supabase.co';
    const supabaseAnonKey = await prompt('Supabase Anonymous Key (anon key): ');
    const supabaseServiceKey = await prompt('Supabase Service Role Key (service_role key): ');
    
    console.log('\nTo find your database password:');
    console.log('1. Go to https://app.supabase.com/project/hjebzdekquczudhrygns/settings/database');
    console.log('2. Find your database password under Connection Info\n');
    
    const databasePassword = await prompt('Database Password: ');
    
    // Generate secure secrets
    console.log('\nGenerating secure secrets...\n');
    const jwtSecret = require('crypto').randomBytes(32).toString('base64');
    const sessionSecret = require('crypto').randomBytes(64).toString('base64');

    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update Supabase configuration
    envContent = envContent.replace(
      /VITE_SUPABASE_URL=.*/,
      `VITE_SUPABASE_URL=${supabaseUrl}`
    );
    envContent = envContent.replace(
      /VITE_SUPABASE_PUBLISHABLE_KEY=.*/,
      `VITE_SUPABASE_PUBLISHABLE_KEY=${supabaseAnonKey}`
    );
    envContent = envContent.replace(
      /SUPABASE_SERVICE_ROLE_KEY=.*/g,
      `SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}`
    );
    envContent = envContent.replace(
      /DATABASE_URL=.*/g,
      `DATABASE_URL=postgresql://postgres:${databasePassword}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`
    );
    envContent = envContent.replace(
      /JWT_SECRET=.*/g,
      `JWT_SECRET=${jwtSecret}`
    );
    envContent = envContent.replace(
      /SESSION_SECRET=.*/g,
      `SESSION_SECRET=${sessionSecret}`
    );

    // Write updated .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Supabase MCP configuration updated successfully!');

    // Create .env.local file for local overrides
    const envLocalPath = path.join(__dirname, '..', '.env.local');
    const envLocalContent = `# Local Supabase Configuration
# This file should NOT be committed to version control

VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_PUBLISHABLE_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}
DATABASE_URL=postgresql://postgres:${databasePassword}@aws-0-us-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}
`;
    
    fs.writeFileSync(envLocalPath, envLocalContent);
    console.log('✅ Created .env.local file for local configuration');

    // Instructions for next steps
    console.log('\n📋 Next steps:');
    console.log('1. Apply database migrations: npm run migrate:apply');
    console.log('2. Test the connection: npm run test:supabase');
    console.log('3. Start the development server: npm run dev');
    console.log('\n🔐 Security Notes:');
    console.log('✅ Your .env.local file contains sensitive information and should NOT be committed to version control');
    console.log('✅ The .gitignore file should already exclude .env.local files');

  } catch (error) {
    console.error('❌ Error setting up Supabase MCP integration:', error.message);
  }
}

// Run the setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSupabaseMCPIntegration().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

export default setupSupabaseMCPIntegration;