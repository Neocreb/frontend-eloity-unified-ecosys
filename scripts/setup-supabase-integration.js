#!/usr/bin/env node

// Script to set up Supabase integration properly
// This script will help configure the .env file with actual Supabase credentials

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Supabase Integration Setup Script\n');

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function setupSupabaseIntegration() {
  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found!');
      console.log('Please create a .env file first by copying .env.example');
      return;
    }

    console.log('📝 Please provide your Supabase configuration:\n');

    // Get Supabase configuration from user
    const supabaseUrl = await prompt('Supabase Project URL (e.g., https://your-project.supabase.co): ');
    const supabaseAnonKey = await prompt('Supabase Anonymous Key (anon key): ');
    const databaseUrl = await prompt('Database URL (postgresql://...): ');
    const jwtSecret = await prompt('JWT Secret Key: ');

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
      /DATABASE_URL=.*/,
      `DATABASE_URL=${databaseUrl}`
    );
    envContent = envContent.replace(
      /JWT_SECRET=.*/,
      `JWT_SECRET=${jwtSecret}`
    );

    // Write updated .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Supabase configuration updated successfully!');

    // Instructions for next steps
    console.log('\n📋 Next steps:');
    console.log('1. Run the database migration script: node apply-migrations.js');
    console.log('2. Test the connection: node test-supabase-connection.js');
    console.log('3. Start the development server: npm run dev');

  } catch (error) {
    console.error('❌ Error setting up Supabase integration:', error.message);
  }
}

setupSupabaseIntegration();