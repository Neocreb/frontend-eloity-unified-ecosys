import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it to your Supabase Postgres connection string.");
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
    url: databaseUrl,
  },
});
