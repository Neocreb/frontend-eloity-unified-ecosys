// Supabase Edge Function to handle new user provisioning
// This function is triggered when a new user signs up

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// Define the Supabase client for Edge Functions
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Function to handle new user signups
async function handleNewUser(user: any) {
  console.log('Handling new user signup:', user.id);
  
  try {
    // 1. Create entry in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          email: user.email,
          email_confirmed: user.email_confirmed || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (userError) {
      console.error('Error creating user entry:', userError.message);
      return { error: userError.message };
    }
    
    console.log('Created user entry:', userData?.[0]?.id);
    
    // 2. Create entry in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: user.id,
          username: null,
          full_name: null,
          name: null,
          bio: null,
          avatar: null,
          avatar_url: null,
          is_verified: false,
          level: 'bronze',
          points: 0,
          role: 'user',
          status: 'active',
          bank_account_name: null,
          bank_account_number: null,
          bank_name: null,
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (profileError) {
      console.error('Error creating profile entry:', profileError.message);
      return { error: profileError.message };
    }
    
    console.log('Created profile entry:', profileData?.[0]?.user_id);
    
    // 3. Create default wallet for the user
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .insert([
        {
          user_id: user.id,
          usdt_balance: '0',
          eth_balance: '0',
          btc_balance: '0',
          soft_points_balance: '0',
          is_active: true,
          is_frozen: false,
          freeze_reason: null,
          frozen_by: null,
          frozen_at: null,
          backup_seed: null,
          last_backup_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (walletError) {
      console.error('Error creating wallet entry:', walletError.message);
      // Don't return error here as wallet is not critical for basic functionality
    } else {
      console.log('Created wallet entry:', walletData?.[0]?.id);
    }
    
    console.log('Successfully provisioned new user:', user.id);
    return { success: true };
    
  } catch (error) {
    console.error('Error in handleNewUser:', error.message);
    return { error: error.message };
  }
}

// Main function that gets called by Supabase
Deno.serve(async (req) => {
  try {
    // Get the event data from the request
    const { record } = await req.json();
    
    // Handle the new user
    const result = await handleNewUser(record);
    
    return new Response(
      JSON.stringify(result),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in main function:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});