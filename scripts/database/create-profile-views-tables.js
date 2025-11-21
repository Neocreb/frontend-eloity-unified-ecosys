const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Get database URL from environment or .env.local
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && fs.existsSync('.env.local')) {
  const envLocal = fs.readFileSync('.env.local', 'utf8');
  const dbUrlMatch = envLocal.match(/DATABASE_URL=(.*)/);
  databaseUrl = dbUrlMatch ? dbUrlMatch[1] : null;
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found in environment or .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
});

async function createProfileViewsTables() {
  try {
    await client.connect();
    console.log('Connected to database successfully!');

    // Create profile_views table
    const profileViewsTableSql = `
      CREATE TABLE IF NOT EXISTS profile_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
        viewer_username TEXT,
        viewer_display_name TEXT,
        viewer_avatar TEXT,
        location TEXT,
        device_type TEXT,
        referrer_source TEXT,
        time_spent_seconds INT DEFAULT 0,
        is_online BOOLEAN DEFAULT false,
        last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create profile_view_stats table
    const profileViewsStatsSql = `
      CREATE TABLE IF NOT EXISTS profile_view_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        total_views INT DEFAULT 0,
        unique_viewers INT DEFAULT 0,
        avg_view_time_seconds INT DEFAULT 0,
        top_location TEXT,
        peak_hour INT,
        mobile_views INT DEFAULT 0,
        desktop_views INT DEFAULT 0,
        tablet_views INT DEFAULT 0,
        direct_views INT DEFAULT 0,
        search_views INT DEFAULT 0,
        social_views INT DEFAULT 0,
        freelance_views INT DEFAULT 0,
        marketplace_views INT DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create indexes for better performance
    const indexesSql = `
      CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON profile_views(profile_id);
      CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
      CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON profile_views(created_at);
      CREATE INDEX IF NOT EXISTS idx_profile_view_stats_profile_id ON profile_view_stats(profile_id);
    `;

    // Enable RLS
    const rlsSql = `
      ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
      ALTER TABLE profile_view_stats ENABLE ROW LEVEL SECURITY;
    `;

    // Create RLS policies
    const policiesSql = `
      CREATE POLICY "Users can view their own profile views" ON profile_views
        FOR SELECT USING (
          auth.uid()::text = (SELECT user_id FROM profiles WHERE id = profile_id)::text
        );
      
      CREATE POLICY "Users can insert profile views" ON profile_views
        FOR INSERT WITH CHECK (true);

      CREATE POLICY "Users can view their own profile view stats" ON profile_view_stats
        FOR SELECT USING (
          auth.uid()::text = (SELECT user_id FROM profiles WHERE id = profile_id)::text
        );
      
      CREATE POLICY "System can update profile view stats" ON profile_view_stats
        FOR UPDATE USING (true);
      
      CREATE POLICY "System can insert profile view stats" ON profile_view_stats
        FOR INSERT WITH CHECK (true);
    `;

    // Execute all SQL statements
    const statements = [
      profileViewsTableSql,
      profileViewsStatsSql,
      indexesSql,
      rlsSql,
      policiesSql
    ];

    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        const parts = trimmedStatement.split(';').filter(s => s.trim() !== '');
        for (const part of parts) {
          const cleanPart = part.trim();
          if (cleanPart) {
            try {
              await client.query(cleanPart);
              console.log(`✓ Executed: ${cleanPart.substring(0, 60)}...`);
            } catch (error) {
              if (error.message.includes('already exists') || 
                  error.message.includes('duplicate key') ||
                  error.message.includes('policy') && error.message.includes('exists')) {
                console.log(`⚠ Skipped (already exists): ${cleanPart.substring(0, 60)}...`);
              } else {
                throw error;
              }
            }
          }
        }
      }
    }

    console.log('\n✅ Profile views tables created successfully!');
    console.log('Tables created:');
    console.log('  - profile_views');
    console.log('  - profile_view_stats');
    console.log('\nIndexes created for performance optimization');
    console.log('RLS policies configured for security');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createProfileViewsTables();
