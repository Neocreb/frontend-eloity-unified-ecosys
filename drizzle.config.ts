import { defineConfig } from "drizzle-kit";

// Use the standard Supabase URL instead of the db. subdomain
const standardDatabaseUrl = process.env.DATABASE_URL?.replace(
  'db.', 
  ''
);

if (!standardDatabaseUrl) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: [
    "./shared/schema.ts",
    "./shared/enhanced-schema.ts",
    "./shared/admin-schema.ts",
    "./shared/activity-economy-schema.ts",
    "./shared/engagement-schema.ts",
    "./shared/video-schema.ts",
    "./shared/social-schema.ts",
    "./shared/ai-schema.ts",
    "./shared/notifications-schema.ts"
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: standardDatabaseUrl,
  },
});