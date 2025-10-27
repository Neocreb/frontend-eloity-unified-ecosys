import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Supabase RLS Policy Implementation Tool');
console.log('==========================================');
console.log('URL:', supabaseUrl);
console.log('Service Key Present:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

// List of tables organized by category that need RLS policies
const tableCategories = {
  // User & Auth tables
  userAuth: [
    'users', 'profiles', 'user_sessions', 'user_preferences'
  ],
  
  // Admin system
  admin: [
    'admin_users', 'admin_roles', 'admin_permissions', 'admin_role_permissions',
    'admin_sessions', 'admin_activity_logs'
  ],
  
  // Notifications
  notifications: [
    'notifications', 'notification_preferences', 'device_tokens'
  ],
  
  // Social / Content
  social: [
    'posts', 'post_comments', 'post_likes', 'social_posts', 'videos', 
    'video_comments', 'video_likes', 'stories', 'user_follows', 'user_blocks',
    'content_reports', 'content_moderation_logs'
  ],
  
  // Marketplace / E-commerce
  marketplace: [
    'products', 'marketplace_orders', 'marketplace_reviews', 'shopping_carts', 
    'cart_items', 'wishlists', 'wishlist_items', 'product_categories',
    'seller_profiles', 'seller_ratings'
  ],
  
  // Freelance / Projects
  freelance: [
    'freelance_jobs', 'freelance_proposals', 'freelance_projects', 
    'freelance_escrow', 'freelance_messages', 'freelance_reviews',
    'freelancer_profiles', 'client_profiles'
  ],
  
  // P2P / Crypto / Wallets
  crypto: [
    'p2p_offers', 'p2p_trades', 'p2p_disputes', 'p2p_payment_methods',
    'wallets', 'wallet_transactions', 'crypto_balances',
    'escrow_contracts', 'crypto_orders', 'crypto_transactions'
  ],
  
  // Rewards / Gamification
  rewards: [
    'rewards', 'user_rewards', 'virtual_gifts', 'gift_transactions', 
    'tip_transactions', 'creator_tip_settings', 'trust_scores',
    'achievements', 'user_achievements', 'points_ledger'
  ],
  
  // Community / Groups
  community: [
    'groups', 'group_members', 'group_posts', 'group_invitations',
    'pages', 'page_follows', 'page_posts'
  ],
  
  // Communication
  communication: [
    'chat_threads', 'chat_messages', 'live_streams', 'call_sessions'
  ],
  
  // System & Settings
  system: [
    'system_settings', 'platform_settings', 'user_suspensions',
    'audit_logs', 'error_logs'
  ],
  
  // Promotions (from the schema)
  promotions: [
    'flash_sales', 'sponsored_products', 'marketplace_ads'
  ]
};

// Function to check current RLS status
async function checkRLSStatus() {
  console.log('\n🔍 Checking current RLS status...');
  
  try {
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT 
          tablename as table_name,
          CASE 
            WHEN relrowsecurity THEN 'ENABLED' 
            ELSE 'DISABLED' 
          END as rls_status
        FROM pg_tables t
        JOIN pg_class c ON t.tablename = c.relname
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `
    });
    
    if (error) {
      console.error('❌ Error checking RLS status:', error.message);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return null;
  }
}

// Function to enable RLS on a table
async function enableRLS(tableName) {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`
    });
    
    if (error) {
      console.error(`❌ Failed to enable RLS on ${tableName}:`, error.message);
      return false;
    }
    
    console.log(`✅ Enabled RLS on ${tableName}`);
    return true;
  } catch (err) {
    console.error(`❌ Error enabling RLS on ${tableName}:`, err.message);
    return false;
  }
}

// Function to create policies for a table
async function createPolicies(tableName, category) {
  try {
    let policySQL = '';
    
    // Define policy templates based on category
    switch (category) {
      case 'userAuth':
      case 'social':
      case 'marketplace':
      case 'freelance':
      case 'crypto':
      case 'rewards':
      case 'community':
      case 'communication':
      case 'promotions':
        // User-owned data pattern
        policySQL = `
          CREATE POLICY "Users can view their own ${tableName}" ON public.${tableName}
            FOR SELECT USING (user_id = auth.uid());
          
          CREATE POLICY "Users can insert their own ${tableName}" ON public.${tableName}
            FOR INSERT WITH CHECK (user_id = auth.uid());
          
          CREATE POLICY "Users can update their own ${tableName}" ON public.${tableName}
            FOR UPDATE USING (user_id = auth.uid());
          
          CREATE POLICY "Users can delete their own ${tableName}" ON public.${tableName}
            FOR DELETE USING (user_id = auth.uid());
        `;
        break;
        
      case 'admin':
        // Admin-only access
        policySQL = `
          CREATE POLICY "Admins can view ${tableName}" ON public.${tableName}
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE user_id = auth.uid() AND is_active = true
              )
            );
          
          CREATE POLICY "Admins can manage ${tableName}" ON public.${tableName}
            FOR ALL USING (
              EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE user_id = auth.uid() AND is_active = true
              )
            );
        `;
        break;
        
      case 'notifications':
        // User notifications - user can view their own
        policySQL = `
          CREATE POLICY "Users can view their own ${tableName}" ON public.${tableName}
            FOR SELECT USING (user_id = auth.uid());
          
          CREATE POLICY "Users can update their own ${tableName}" ON public.${tableName}
            FOR UPDATE USING (user_id = auth.uid());
          
          CREATE POLICY "System can insert ${tableName}" ON public.${tableName}
            FOR INSERT WITH CHECK (true);
        `;
        break;
        
      case 'system':
        // System tables - admin-only access
        policySQL = `
          CREATE POLICY "Admins can access ${tableName}" ON public.${tableName}
            FOR ALL USING (
              EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE user_id = auth.uid() AND is_active = true
              )
            );
        `;
        break;
        
      default:
        // Default user-owned pattern
        policySQL = `
          CREATE POLICY "Users can view their own ${tableName}" ON public.${tableName}
            FOR SELECT USING (user_id = auth.uid());
          
          CREATE POLICY "Users can insert their own ${tableName}" ON public.${tableName}
            FOR INSERT WITH CHECK (user_id = auth.uid());
          
          CREATE POLICY "Users can update their own ${tableName}" ON public.${tableName}
            FOR UPDATE USING (user_id = auth.uid());
          
          CREATE POLICY "Users can delete their own ${tableName}" ON public.${tableName}
            FOR DELETE USING (user_id = auth.uid());
        `;
    }
    
    const { error } = await supabase.rpc('execute_sql', {
      sql: policySQL
    });
    
    if (error) {
      console.error(`❌ Failed to create policies for ${tableName}:`, error.message);
      return false;
    }
    
    console.log(`✅ Created policies for ${tableName} (${category})`);
    return true;
  } catch (err) {
    console.error(`❌ Error creating policies for ${tableName}:`, err.message);
    return false;
  }
}

// Main function to implement RLS policies
async function implementRLSPolicies() {
  console.log('\n🚀 Starting RLS Policy Implementation...\n');
  
  // Test connection first
  console.log('🔄 Testing connection...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count()', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Connection successful!');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
  
  // Check current RLS status
  const rlsStatus = await checkRLSStatus();
  if (!rlsStatus) {
    console.error('❌ Cannot proceed without RLS status information');
    process.exit(1);
  }
  
  // Collect all tables that need RLS enabled
  const allTables = Object.values(tableCategories).flat();
  const tablesToProcess = allTables.filter(tableName => {
    const tableStatus = rlsStatus.find(t => t.table_name === tableName);
    return tableStatus && tableStatus.rls_status === 'DISABLED';
  });
  
  console.log(`\n📋 Found ${tablesToProcess.length} tables that need RLS enabled`);
  
  if (tablesToProcess.length === 0) {
    console.log('✅ All specified tables already have RLS enabled');
    return;
  }
  
  // Show which tables will be processed
  console.log('\n🔧 Tables to process:');
  const tablesByCategory = {};
  tablesToProcess.forEach(tableName => {
    const category = Object.keys(tableCategories).find(cat => 
      tableCategories[cat].includes(tableName)
    );
    if (!tablesByCategory[category]) tablesByCategory[category] = [];
    tablesByCategory[category].push(tableName);
  });
  
  Object.keys(tablesByCategory).forEach(category => {
    console.log(`  ${category}: ${tablesByCategory[category].join(', ')}`);
  });
  
  // Confirm before proceeding (in a real script, we'd wait for user input)
  console.log('\n⚠️  About to enable RLS and create policies for these tables...');
  
  // Enable RLS on tables
  console.log('\n🔧 Enabling RLS on tables...');
  for (const tableName of tablesToProcess) {
    await enableRLS(tableName);
  }
  
  // Create policies for tables
  console.log('\n🛡️  Creating RLS policies...');
  for (const tableName of tablesToProcess) {
    const category = Object.keys(tableCategories).find(cat => 
      tableCategories[cat].includes(tableName)
    ) || 'default';
    await createPolicies(tableName, category);
  }
  
  console.log('\n✅ RLS policy implementation completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the policies in your Supabase dashboard');
  console.log('2. Test your application to ensure everything works correctly');
  console.log('3. Adjust policies as needed based on your specific requirements');
}

// Run the implementation
implementRLSPolicies().catch(console.error);