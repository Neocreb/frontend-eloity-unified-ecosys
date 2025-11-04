import dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

// Use the correct database URL
const connectionString =
  "postgresql://neondb_owner:npg_GWUcF3OZCph6@ep-long-hat-adb36p2f-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = postgres(connectionString);

async function testRewardSystem() {
  console.log("🧪 Testing Reward System Connection...");

  try {
    // Test basic connection
    const result = await sql`SELECT 1 as test`;
    console.log("✅ Database connection successful");

    // Check existing tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log(
      "📋 Existing tables:",
      tables.map((t) => t.table_name),
    );

    // Check if reward_rules table exists
    const rewardRulesExists = tables.some(
      (t) => t.table_name === "reward_rules",
    );

    if (!rewardRulesExists) {
      console.log("❌ reward_rules table doesn't exist");
      console.log("🔧 Creating basic reward_rules table...");

      // Create the complete reward_rules table structure
      await sql`
        CREATE TABLE IF NOT EXISTS reward_rules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          action_type TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          description TEXT,
          base_soft_points DECIMAL(10,2) DEFAULT 0,
          base_wallet_bonus DECIMAL(20,8) DEFAULT 0,
          currency TEXT DEFAULT 'USDT',
          daily_limit INTEGER,
          weekly_limit INTEGER,
          monthly_limit INTEGER,
          minimum_trust_score DECIMAL(5,2) DEFAULT 0,
          minimum_value DECIMAL(15,2),
          decay_enabled BOOLEAN DEFAULT true,
          decay_start INTEGER DEFAULT 1,
          decay_rate DECIMAL(5,4) DEFAULT 0.1,
          min_multiplier DECIMAL(3,2) DEFAULT 0.1,
          requires_moderation BOOLEAN DEFAULT false,
          quality_threshold DECIMAL(3,2) DEFAULT 0,
          conditions JSONB,
          is_active BOOLEAN DEFAULT true,
          active_from TIMESTAMP,
          active_to TIMESTAMP,
          created_by UUID,
          last_modified_by UUID,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      console.log("✅ reward_rules table created");

      // Insert basic reward rules
      const basicRules = [
        {
          action_type: "post_content",
          display_name: "Create Post",
          description: "Earn points for creating content",
          base_soft_points: 3.0,
          daily_limit: 10,
        },
        {
          action_type: "like_post",
          display_name: "Like Post",
          description: "Earn points for liking posts",
          base_soft_points: 0.5,
          daily_limit: 100,
        },
        {
          action_type: "comment_post",
          display_name: "Comment on Post",
          description: "Earn points for commenting",
          base_soft_points: 1.5,
          daily_limit: 50,
        },
        {
          action_type: "daily_login",
          display_name: "Daily Login",
          description: "Earn points for daily login",
          base_soft_points: 5.0,
          daily_limit: 1,
        },
      ];

      for (const rule of basicRules) {
        await sql`
          INSERT INTO reward_rules (
            action_type, display_name, description, 
            base_soft_points, daily_limit
          ) VALUES (
            ${rule.action_type}, ${rule.display_name}, ${rule.description},
            ${rule.base_soft_points}, ${rule.daily_limit}
          ) ON CONFLICT (action_type) DO NOTHING;
        `;
      }

      console.log("✅ Basic reward rules inserted");
    } else {
      console.log("✅ reward_rules table exists");

      // Check existing rules
      const existingRules = await sql`
        SELECT action_type, display_name, base_soft_points, daily_limit 
        FROM reward_rules 
        WHERE is_active = true;
      `;

      console.log("📋 Active reward rules:");
      existingRules.forEach((rule) => {
        console.log(
          `  - ${rule.action_type}: ${rule.base_soft_points} SP (limit: ${rule.daily_limit}/day)`,
        );
      });
    }

    console.log("🎉 Reward system test completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sql.end();
  }
}

testRewardSystem();
