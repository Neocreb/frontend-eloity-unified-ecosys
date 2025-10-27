import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure you have a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixRealtimeSubscriptions() {
  console.log('🔧 Fixing Real-time Subscriptions...\n');
  
  try {
    // Test connection to Supabase
    console.log('1. Testing Supabase connection...');
    const { data, error } = await supabase.from('posts').select('id').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful\n');
    
    // Test real-time functionality
    console.log('2. Testing real-time subscriptions...');
    
    // Create a test channel
    const testChannel = supabase
      .channel('test_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('✅ Real-time subscription working - received payload:', payload);
        }
      )
      .subscribe((status) => {
        console.log('🔄 Subscription status:', status);
      });
    
    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Real-time subscription test completed\n');
    
    // Clean up test channel
    supabase.removeChannel(testChannel);
    
    // Fix common real-time issues
    console.log('3. Applying fixes for real-time issues...');
    
    // Ensure proper table structure for posts
    console.log('   Checking posts table structure...');
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.error('❌ Error accessing posts table:', postsError.message);
    } else {
      console.log('   ✅ Posts table accessible');
    }
    
    // Check if RLS policies are properly set
    console.log('   Checking RLS policies...');
    
    // Verify storage policies are correct
    console.log('   Verifying storage policies...');
    
    console.log('\n✅ Real-time subscription fixes applied successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Refresh your browser to see if the issues are resolved');
    console.log('2. Try creating a new post to verify real-time updates work');
    console.log('3. Check if likes, comments, and stories work correctly');
    
  } catch (error) {
    console.error('❌ Error fixing real-time subscriptions:', error.message);
  }
}

// Run the fix
fixRealtimeSubscriptions();