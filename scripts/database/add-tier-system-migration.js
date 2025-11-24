import { sql } from 'drizzle-orm';
import { db } from '../server/utils/db.js';

async function addTierSystemMigration() {
  try {
    console.log('🚀 Starting tier system migration...');

    // 1. Add tier columns to profiles table
    console.log('📝 Adding tier columns to profiles table...');
    await db.execute(sql`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS tier_level TEXT DEFAULT 'tier_1',
      ADD COLUMN IF NOT EXISTS kyc_trigger_reason TEXT,
      ADD COLUMN IF NOT EXISTS tier_upgraded_at TIMESTAMP;
    `);
    console.log('✅ Tier columns added to profiles table');

    // 2. Update pioneer_badges table
    console.log('📝 Updating pioneer_badges table...');
    await db.execute(sql`
      ALTER TABLE pioneer_badges 
      ADD COLUMN IF NOT EXISTS premium_granted BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS premium_expiry TIMESTAMP;
    `);
    console.log('✅ Pioneer badges table updated');

    // 3. Create feature_gates table
    console.log('📝 Creating feature_gates table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS feature_gates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        feature_name TEXT NOT NULL UNIQUE,
        feature_description TEXT,
        tier_1_access BOOLEAN DEFAULT false,
        tier_2_access BOOLEAN DEFAULT true,
        requires_kyc BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ feature_gates table created');

    // 4. Create tier_access_history table
    console.log('📝 Creating tier_access_history table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tier_access_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        from_tier TEXT,
        to_tier TEXT NOT NULL,
        kyc_verified_at TIMESTAMP,
        action_type TEXT NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ tier_access_history table created');

    // 5. Create indexes for better query performance
    console.log('📝 Creating indexes...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_profiles_tier_level ON profiles(tier_level);
      CREATE INDEX IF NOT EXISTS idx_tier_access_history_user_id ON tier_access_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_tier_access_history_created_at ON tier_access_history(created_at);
      CREATE INDEX IF NOT EXISTS idx_feature_gates_feature_name ON feature_gates(feature_name);
    `);
    console.log('✅ Indexes created');

    // 6. Insert default feature gates
    console.log('📝 Inserting default feature gates...');
    const featureGates = [
      {
        feature_name: 'social_posting',
        feature_description: 'Create posts, stories, and content',
        tier_1_access: true,
        tier_2_access: true,
        requires_kyc: false,
      },
      {
        feature_name: 'marketplace_sell',
        feature_description: 'List and sell products on marketplace',
        tier_1_access: false,
        tier_2_access: true,
        requires_kyc: true,
      },
      {
        feature_name: 'crypto_view',
        feature_description: 'View cryptocurrency prices and information',
        tier_1_access: true,
        tier_2_access: true,
        requires_kyc: false,
      },
      {
        feature_name: 'crypto_trade',
        feature_description: 'Trade cryptocurrencies',
        tier_1_access: false,
        tier_2_access: true,
        requires_kyc: true,
      },
      {
        feature_name: 'crypto_p2p',
        feature_description: 'Peer-to-peer crypto trading',
        tier_1_access: false,
        tier_2_access: true,
        requires_kyc: true,
      },
      {
        feature_name: 'freelance_apply',
        feature_description: 'Apply for freelance jobs',
        tier_1_access: true,
        tier_2_access: true,
        requires_kyc: false,
      },
      {
        feature_name: 'freelance_offer',
        feature_description: 'Create and manage freelance offerings',
        tier_1_access: false,
        tier_2_access: true,
        requires_kyc: true,
      },
      {
        feature_name: 'withdraw_earnings',
        feature_description: 'Withdraw earnings to bank account',
        tier_1_access: false,
        tier_2_access: true,
        requires_kyc: true,
      },
      {
        feature_name: 'creator_fund',
        feature_description: 'Access creator monetization fund',
        tier_1_access: false,
        tier_2_access: true,
        requires_kyc: true,
      },
      {
        feature_name: 'marketplace_buy',
        feature_description: 'Purchase products from marketplace',
        tier_1_access: true,
        tier_2_access: true,
        requires_kyc: false,
      },
      {
        feature_name: 'premium_badges',
        feature_description: 'Purchase premium verification badges',
        tier_1_access: false,
        tier_2_access: true,
        requires_kyc: false,
      },
      {
        feature_name: 'premium_subscription',
        feature_description: 'Access premium subscription features',
        tier_1_access: false,
        tier_2_access: true,
        requires_kyc: false,
      },
    ];

    for (const gate of featureGates) {
      await db.execute(sql`
        INSERT INTO feature_gates (feature_name, feature_description, tier_1_access, tier_2_access, requires_kyc)
        VALUES (${gate.feature_name}, ${gate.feature_description}, ${gate.tier_1_access}, ${gate.tier_2_access}, ${gate.requires_kyc})
        ON CONFLICT (feature_name) DO NOTHING;
      `);
    }
    console.log('✅ Default feature gates inserted');

    // 7. Update pioneer_badges to reflect 100 slot limit instead of 500
    console.log('📝 Updating pioneer badge constraints...');
    await db.execute(sql`
      ALTER TABLE pioneer_badges
      ADD CONSTRAINT pioneer_badge_number_check CHECK (badge_number <= 100);
    `);
    console.log('✅ Pioneer badge constraints updated');

    console.log('✅ Tier system migration completed successfully!');
    return { success: true, message: 'Tier system migration completed' };
  } catch (error) {
    console.error('❌ Error during tier system migration:', error);
    throw error;
  }
}

// Run migration
addTierSystemMigration()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
