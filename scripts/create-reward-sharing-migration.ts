import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
let sql: any = null;
let db: any = null;
if (!connectionString) {
  console.warn('scripts/create-reward-sharing-migration: DATABASE_URL not set; skipping DB migrations in this environment');
} else {
  sql = neon(connectionString);
  db = drizzle(sql);
}

async function createRewardSharingTables() {
  try {
    console.log('Creating reward sharing and pioneer badge tables...');

    // Create reward_sharing_transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS reward_sharing_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sharer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_reward_amount NUMERIC(10, 2) NOT NULL,
        shared_amount NUMERIC(10, 2) NOT NULL,
        sharing_percentage NUMERIC(5, 2) DEFAULT 0.5,
        transaction_type TEXT NOT NULL,
        source_activity TEXT NOT NULL,
        activity_id UUID,
        status TEXT DEFAULT 'completed',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create pioneer_badges table
    await sql`
      CREATE TABLE IF NOT EXISTS pioneer_badges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_number INTEGER NOT NULL,
        earned_at TIMESTAMP DEFAULT NOW(),
        eligibility_score NUMERIC(8, 2) NOT NULL,
        activity_metrics JSONB,
        verification_data JSONB,
        is_verified BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id),
        CONSTRAINT unique_badge_number UNIQUE(badge_number)
      );
    `;

    // Create user_activity_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS user_activity_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_start TIMESTAMP DEFAULT NOW(),
        session_end TIMESTAMP,
        total_time_minutes INTEGER DEFAULT 0,
        activities_count INTEGER DEFAULT 0,
        quality_interactions INTEGER DEFAULT 0,
        device_info JSONB,
        engagement_score NUMERIC(5, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Add automatic_sharing_enabled to referral_links if it doesn't exist
    await sql`
      ALTER TABLE referral_links 
      ADD COLUMN IF NOT EXISTS automatic_sharing_enabled BOOLEAN DEFAULT true;
    `;

    // Create indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_reward_sharing_sharer_id ON reward_sharing_transactions(sharer_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_reward_sharing_recipient_id ON reward_sharing_transactions(recipient_id);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_pioneer_badges_badge_number ON pioneer_badges(badge_number);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_activity_sessions_user_id ON user_activity_sessions(user_id);
    `;

    console.log('✅ Reward sharing and pioneer badge tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  createRewardSharingTables()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { createRewardSharingTables };
