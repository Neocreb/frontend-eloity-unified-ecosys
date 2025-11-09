#!/usr/bin/env npx tsx

import { config } from "dotenv";

// Load environment variables from .env.local
const result = config({ path: '.env.local' });

console.log("🚀 Testing environment variables\n");

console.log("📄 dotenv result:", result.parsed ? "Parsed successfully" : "Failed to parse");
console.log("⚠️  dotenv errors:", result.error || "None");

console.log("\n🔍 Checking key environment variables:");
console.log("   DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log("   VITE_SUPABASE_URL:", process.env.VITE_SUPABASE_URL ? "SET" : "NOT SET");
console.log("   SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET");

if (process.env.DATABASE_URL) {
  console.log("\n📋 DATABASE_URL value:");
  console.log("   ", process.env.DATABASE_URL);
}

if (process.env.VITE_SUPABASE_URL) {
  console.log("\n📋 VITE_SUPABASE_URL value:");
  console.log("   ", process.env.VITE_SUPABASE_URL);
}

console.log("\n✅ Environment variable test completed");