#!/usr/bin/env npx tsx

import { config } from "dotenv";
import { spawn } from 'child_process';

// Load environment variables from .env.local first
console.log("🔄 Loading environment variables from .env.local...");
const result = config({ path: '.env.local' });

if (result.error) {
  console.error("❌ Failed to load environment variables:", result.error);
  process.exit(1);
}

console.log("✅ Environment variables loaded successfully");
console.log("🔍 DATABASE_URL configured:", !!process.env.DATABASE_URL);
console.log("🔍 VITE_SUPABASE_URL configured:", !!process.env.VITE_SUPABASE_URL);
console.log("🔍 SUPABASE_SERVICE_ROLE_KEY configured:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("");

// Now start the server
console.log("🚀 Starting server with loaded environment variables...");
const server = spawn('npx', ['cross-env', 'NODE_ENV=development', 'npx', 'tsx', 'server/enhanced-index.ts'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🔧 Server process exited with code ${code}`);
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log("🛑 Received SIGINT, shutting down server...");
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log("🛑 Received SIGTERM, shutting down server...");
  server.kill('SIGTERM');
});