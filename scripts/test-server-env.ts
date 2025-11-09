#!/usr/bin/env npx tsx

// Test if environment variables are accessible in the server context
import dotenv from 'dotenv';

// Load environment variables
console.log("🔄 Loading environment variables...");
dotenv.config({ path: '.env.local' });

console.log("🔍 Checking environment variables in server context:");
console.log("   DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log("   VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL ? "SET" : "NOT SET");
console.log("   SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");

if (process.env.VITE_SUPABASE_URL) {
  console.log("✅ VITE_SUPABASE_URL is accessible in server context");
} else {
  console.log("❌ VITE_SUPABASE_URL is NOT accessible in server context");
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log("✅ SUPABASE_SERVICE_ROLE_KEY is accessible in server context");
} else {
  console.log("❌ SUPABASE_SERVICE_ROLE_KEY is NOT accessible in server context");
}