import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase connection - using service role key for server-side operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use the service role key from the environment variables
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.log('Available env vars:');
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('SUPABASE_SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE);
  process.exit(1);
}

console.log('Connecting to Supabase with service role key...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertFreelanceStats() {
  console.log('Inserting sample freelance stats data...');
  
  try {
    // Insert sample freelance stats for a test user
    // You would replace this with actual user IDs in a real implementation
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Placeholder user ID
    
    console.log('Inserting stats for user:', testUserId);
    
    const { data, error } = await supabase
      .from('freelance_stats')
      .upsert({
        user_id: testUserId,
        total_projects: 42,
        completed_projects: 38,
        total_earnings: 21500.00,
        average_rating: 4.8,
        response_time: 1, // hours
        success_rate: 92.00,
        repeat_clients: 15,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error inserting freelance stats:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✓ Freelance stats inserted/updated:', data);
    }
    
    // Insert stats for another test user with different values
    const testUserId2 = '11111111-1111-1111-1111-111111111111'; // Another placeholder user ID
    
    console.log('Inserting stats for user:', testUserId2);
    
    const { data: data2, error: error2 } = await supabase
      .from('freelance_stats')
      .upsert({
        user_id: testUserId2,
        total_projects: 28,
        completed_projects: 25,
        total_earnings: 12850.00,
        average_rating: 4.9,
        response_time: 3, // hours
        success_rate: 94.00,
        repeat_clients: 8,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();
      
    if (error2) {
      console.error('Error inserting freelance stats for user 2:', error2);
      console.error('Error details:', JSON.stringify(error2, null, 2));
    } else {
      console.log('✓ Freelance stats inserted/updated for user 2:', data2);
    }
    
    console.log('\n✅ Sample freelance stats data insertion completed!');
    
  } catch (error) {
    console.error('Error inserting sample freelance stats:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the function
insertFreelanceStats();