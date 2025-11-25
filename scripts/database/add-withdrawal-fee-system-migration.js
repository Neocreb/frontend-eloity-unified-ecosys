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
    console.log('Starting withdrawal fee system migration...');

    // Create withdrawal_fee_revenue table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS withdrawal_fee_revenue (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          source TEXT NOT NULL,
          gross_amount DECIMAL(18, 8) NOT NULL,
          fee_percentage DECIMAL(5, 2) NOT NULL,
          fee_amount DECIMAL(18, 8) NOT NULL,
          net_amount DECIMAL(18, 8) NOT NULL,
          transaction_id TEXT,
          recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_withdrawal_fee_revenue_user_id ON withdrawal_fee_revenue(user_id);
        CREATE INDEX IF NOT EXISTS idx_withdrawal_fee_revenue_category ON withdrawal_fee_revenue(category);
        CREATE INDEX IF NOT EXISTS idx_withdrawal_fee_revenue_recorded_at ON withdrawal_fee_revenue(recorded_at);
        CREATE INDEX IF NOT EXISTS idx_withdrawal_fee_revenue_transaction_id ON withdrawal_fee_revenue(transaction_id);
      `
    });

    if (tableError && !tableError.message.includes('already exists')) {
      console.error('Error creating withdrawal_fee_revenue table:', tableError);
      // Continue - table might already exist
    } else {
      console.log('✅ Created withdrawal_fee_revenue table');
    }

    // Add fee columns to redemptions table if they don't exist
    const { error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE redemptions
        ADD COLUMN IF NOT EXISTS fee_amount DECIMAL(18, 8) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS net_amount DECIMAL(18, 8),
        ADD COLUMN IF NOT EXISTS fee_breakdown JSONB,
        ADD COLUMN IF NOT EXISTS fee_calculated_at TIMESTAMP WITH TIME ZONE;
      `
    });

    if (columnsError && !columnsError.message.includes('already exists')) {
      console.error('Error adding fee columns to redemptions:', columnsError);
      // Continue - columns might already exist
    } else {
      console.log('✅ Added fee columns to redemptions table');
    }

    // Create fee_configurations table for admin control
    const { error: configError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS fee_configurations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category TEXT NOT NULL UNIQUE,
          fee_percentage DECIMAL(5, 2) NOT NULL,
          min_fee DECIMAL(18, 8),
          max_fee DECIMAL(18, 8),
          description TEXT,
          active BOOLEAN DEFAULT true,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_by UUID REFERENCES profiles(user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_fee_configurations_category ON fee_configurations(category);
        CREATE INDEX IF NOT EXISTS idx_fee_configurations_active ON fee_configurations(active);
      `
    });

    if (configError && !configError.message.includes('already exists')) {
      console.error('Error creating fee_configurations table:', configError);
      // Continue
    } else {
      console.log('✅ Created fee_configurations table');
    }

    // Insert default fee configurations
    const { error: insertError } = await supabase
      .from('fee_configurations')
      .upsert([
        {
          category: 'marketplace',
          fee_percentage: 1.5,
          min_fee: 0.25,
          max_fee: 100,
          description: 'Marketplace seller withdrawal fee',
          active: true
        },
        {
          category: 'crypto',
          fee_percentage: 0.3,
          min_fee: 0.1,
          max_fee: 50,
          description: 'Crypto withdrawal fee',
          active: true
        },
        {
          category: 'creator',
          fee_percentage: 3.0,
          min_fee: 0.5,
          max_fee: 200,
          description: 'Creator fund withdrawal fee',
          active: true
        },
        {
          category: 'freelance',
          fee_percentage: 2.0,
          min_fee: 0.25,
          max_fee: 75,
          description: 'Freelance earnings withdrawal fee',
          active: true
        }
      ], { onConflict: 'category' });

    if (insertError) {
      console.error('Error inserting fee configurations:', insertError);
    } else {
      console.log('✅ Inserted default fee configurations');
    }

    console.log('\n✅ Withdrawal fee system migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigration();
