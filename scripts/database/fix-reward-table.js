import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const connectionString =
  "postgresql://neondb_owner:npg_GWUcF3OZCph6@ep-long-hat-adb36p2f-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = postgres(connectionString);

async function fixRewardTable() {
  console.log("🔧 Adding missing columns to reward_rules table...");

  try {
    // Add missing columns
    await sql`
      ALTER TABLE reward_rules 
      ADD COLUMN IF NOT EXISTS minimum_value DECIMAL(15,2),
      ADD COLUMN IF NOT EXISTS conditions JSONB,
      ADD COLUMN IF NOT EXISTS active_from TIMESTAMP,
      ADD COLUMN IF NOT EXISTS active_to TIMESTAMP,
      ADD COLUMN IF NOT EXISTS created_by UUID,
      ADD COLUMN IF NOT EXISTS last_modified_by UUID;
    `;

    console.log("✅ Missing columns added successfully");

    // Verify the table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reward_rules' 
      ORDER BY column_name;
    `;

    console.log("📋 Current reward_rules table columns:");
    columns.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sql.end();
  }
}

fixRewardTable();
