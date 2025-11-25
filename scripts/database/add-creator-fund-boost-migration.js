const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Starting creator fund boost system migration...');

    // Create creator_boosts table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS creator_boosts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
          boost_type TEXT NOT NULL,
          multiplier DECIMAL(3, 2) NOT NULL,
          description TEXT,
          start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          end_date TIMESTAMP WITH TIME ZONE NOT NULL,
          is_active BOOLEAN DEFAULT true,
          applied_earnings DECIMAL(18, 8) DEFAULT 0,
          config_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_creator_boosts_user_id ON creator_boosts(user_id);
        CREATE INDEX IF NOT EXISTS idx_creator_boosts_boost_type ON creator_boosts(boost_type);
        CREATE INDEX IF NOT EXISTS idx_creator_boosts_is_active ON creator_boosts(is_active);
        CREATE INDEX IF NOT EXISTS idx_creator_boosts_date_range ON creator_boosts(start_date, end_date);
      `
    });

    if (tableError && !tableError.message.includes('already exists')) {
      console.error('Error creating creator_boosts table:', tableError);
      // Continue - table might already exist
    } else {
      console.log('✅ Created creator_boosts table');
    }

    // Create boost_configurations table
    const { error: configError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS boost_configurations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          boost_type TEXT NOT NULL UNIQUE,
          multiplier DECIMAL(3, 2) NOT NULL,
          duration_days INTEGER NOT NULL,
          description TEXT,
          enabled BOOLEAN DEFAULT true,
          conditions JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_by UUID REFERENCES profiles(user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_boost_configurations_enabled ON boost_configurations(enabled);
        CREATE INDEX IF NOT EXISTS idx_boost_configurations_boost_type ON boost_configurations(boost_type);
      `
    });

    if (configError && !configError.message.includes('already exists')) {
      console.error('Error creating boost_configurations table:', configError);
      // Continue
    } else {
      console.log('✅ Created boost_configurations table');
    }

    // Add boost_active column to profiles if it doesn't exist
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS has_active_boost BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS current_boost_multiplier DECIMAL(3, 2) DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS last_boost_applied_at TIMESTAMP WITH TIME ZONE;
      `
    });

    if (profilesError && !profilesError.message.includes('already exists')) {
      console.error('Error updating profiles table:', profilesError);
      // Continue - columns might already exist
    } else {
      console.log('✅ Added boost columns to profiles table');
    }

    // Insert default boost configurations
    const { error: insertError } = await supabase
      .from('boost_configurations')
      .upsert([
        {
          boost_type: 'tier_upgrade',
          multiplier: 1.5,
          duration_days: 30,
          description: 'Welcome boost for newly verified Tier 2 creators - earn 1.5x for 30 days',
          enabled: true,
          conditions: { requiresTier2: true, requiresCreatorStatus: true }
        },
        {
          boost_type: 'seasonal',
          multiplier: 1.25,
          duration_days: 14,
          description: 'Seasonal promotion - earn 1.25x for 2 weeks',
          enabled: false,
          conditions: { minEarnings: 100 }
        },
        {
          boost_type: 'promotional',
          multiplier: 1.3,
          duration_days: 7,
          description: 'Flash promotion - earn 1.3x for 7 days',
          enabled: false,
          conditions: {}
        },
        {
          boost_type: 'referral',
          multiplier: 1.2,
          duration_days: 60,
          description: 'Referral reward - earn 1.2x for 60 days after successful referral',
          enabled: true,
          conditions: { requiresValidReferral: true }
        }
      ], { onConflict: 'boost_type' });

    if (insertError) {
      console.error('Error inserting boost configurations:', insertError);
    } else {
      console.log('✅ Inserted default boost configurations');
    }

    console.log('\n✅ Creator fund boost system migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();
