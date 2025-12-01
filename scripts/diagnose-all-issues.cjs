#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseIssues() {
  console.log('🔍 Diagnosing all issues...\n');

  // Issue 1: Group Chats
  console.log('═══════════════════════════════════════════════════════');
  console.log('ISSUE #1: GROUP CHATS NOT DISPLAYING');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Check if group_chat_threads table exists
    const { data: threads, error: threadsError } = await supabase
      .from('group_chat_threads')
      .select('id')
      .limit(1);

    if (threadsError) {
      console.log('❌ group_chat_threads table issue:', threadsError.message);
    } else {
      console.log('✅ group_chat_threads table accessible');
    }

    // Check if group_participants table exists
    const { data: participants, error: participantsError } = await supabase
      .from('group_participants')
      .select('id')
      .limit(1);

    if (participantsError) {
      console.log('❌ group_participants table issue:', participantsError.message);
    } else {
      console.log('✅ group_participants table accessible');
    }

    // Check if create-group function is deployed
    console.log('\n🔍 Checking Supabase Edge Function deployment...');
    console.log('   Note: Cannot check from client. Verify in Supabase Dashboard:');
    console.log('   - Navigate to Edge Functions');
    console.log('   - Look for "create-group-with-participants"');
    console.log('   - Status should be "Active"');

    console.log('\n📋 To fix group chats:');
    console.log('   1. Run: supabase functions deploy create-group-with-participants');
    console.log('   2. Check RLS policies on group_chat_threads and group_participants');
    console.log('   3. Run: node scripts/fix-group-policies.js');
  } catch (error) {
    console.error('Error checking group chats:', error);
  }

  // Issue 2: Post Images
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('ISSUE #2: POST IMAGES DISAPPEARING ON REFRESH');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Check if posts table exists and has image_url field
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, image_url')
      .limit(1);

    if (postsError) {
      console.log('❌ posts table issue:', postsError.message);
    } else {
      console.log('✅ posts table accessible with image_url field');
      if (posts && posts.length > 0) {
        console.log(`   Sample post image_url: ${posts[0].image_url ? '✅ Present' : '❌ Missing'}`);
      }
    }

    console.log('\n📋 To fix post images:');
    console.log('   1. Verify Supabase Storage "posts" bucket is PUBLIC');
    console.log('   2. Check CORS policies in bucket settings');
    console.log('   3. Verify images exist in storage with correct paths');
    console.log('   4. Test image URLs directly in browser');
    console.log('   5. Check browser console for 403/404 errors');
  } catch (error) {
    console.error('Error checking posts:', error);
  }

  // Issue 3: CRYPTOAPI
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('ISSUE #3: CRYPTOAPI NOT WORKING');
  console.log('═══════════════════════════════════════════════════════\n');

  const cryptoapiKey = process.env.CRYPTOAPIS_API_KEY;
  if (cryptoapiKey) {
    console.log('✅ CRYPTOAPIS_API_KEY is set');
  } else {
    console.log('❌ CRYPTOAPIS_API_KEY is NOT set');
    console.log('\n📋 To fix CRYPTOAPI:');
    console.log('   1. Sign up at https://cryptoapis.io');
    console.log('   2. Get your API key');
    console.log('   3. Use DevServerControl to set: CRYPTOAPIS_API_KEY=<your-key>');
    console.log('   4. For production, add to deployment secrets (Netlify/Vercel)');
  }

  // Issue 4: RELOADLY
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('ISSUE #4: RELOADLY NOT WORKING');
  console.log('═══════════════════════════════════════════════════════\n');

  const reloadlyKey = process.env.RELOADLY_API_KEY;
  const reloadlySecret = process.env.RELOADLY_API_SECRET;

  if (reloadlyKey && reloadlySecret) {
    console.log('✅ RELOADLY_API_KEY is set');
    console.log('✅ RELOADLY_API_SECRET is set');
  } else {
    console.log(reloadlyKey ? '✅ RELOADLY_API_KEY is set' : '❌ RELOADLY_API_KEY is NOT set');
    console.log(reloadlySecret ? '✅ RELOADLY_API_SECRET is set' : '❌ RELOADLY_API_SECRET is NOT set');
    console.log('\n📋 To fix RELOADLY:');
    console.log('   1. Sign up at https://www.reloadly.com');
    console.log('   2. Get your API credentials (client_id and client_secret)');
    console.log('   3. Use DevServerControl to set:');
    console.log('      - RELOADLY_API_KEY=<client-id>');
    console.log('      - RELOADLY_API_SECRET=<client-secret>');
    console.log('   4. For production, add to deployment secrets');
  }

  // Check database tables for RELOADLY
  console.log('\n🔍 Checking RELOADLY database tables...');
  try {
    const { data: operators, error: operatorsError } = await supabase
      .from('bill_payment_operators')
      .select('id')
      .limit(1);

    if (operatorsError) {
      console.log('❌ bill_payment_operators table issue:', operatorsError.message);
    } else {
      console.log('✅ bill_payment_operators table accessible');
    }

    const { data: transactions, error: transactionsError } = await supabase
      .from('reloadly_transactions')
      .select('id')
      .limit(1);

    if (transactionsError) {
      console.log('⚠️  reloadly_transactions table issue:', transactionsError.message);
    } else {
      console.log('✅ reloadly_transactions table accessible');
    }
  } catch (error) {
    console.error('Error checking RELOADLY tables:', error);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('Run these commands to fix issues:');
  console.log('1. Group Chats: supabase functions deploy create-group-with-participants');
  console.log('2. Post Images: Verify Supabase Storage bucket settings');
  console.log('3. CRYPTOAPI: Set CRYPTOAPIS_API_KEY environment variable');
  console.log('4. RELOADLY: Set RELOADLY_API_KEY and RELOADLY_API_SECRET');

  console.log('\nFor detailed fixes, run:');
  console.log('- node scripts/fix-group-policies.js (fix RLS policies)');
}

diagnoseIssues().catch(console.error);
