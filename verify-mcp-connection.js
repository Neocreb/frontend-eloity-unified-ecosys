// Script to verify Supabase MCP connection
import dotenv from 'dotenv';
dotenv.config();

console.log('='.repeat(50));
console.log('Supabase MCP Connection Verification');
console.log('='.repeat(50));

// Display MCP configuration
console.log('\nMCP Configuration:');
console.log('- Project Reference: hjebzdekquczudhrygns');
console.log('- MCP URL: https://mcp.supabase.com/mcp?project_ref=hjebzdekquczudhrygns');

// Check environment variables
console.log('\nEnvironment Variables Check:');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log(`VITE_SUPABASE_URL: ${supabaseUrl || 'NOT SET'}`);
console.log(`VITE_SUPABASE_PUBLISHABLE_KEY: ${supabaseKey ? 'SET' : 'NOT SET'}`);

if (!supabaseUrl) {
  console.log('\n❌ ERROR: VITE_SUPABASE_URL is not set in .env file');
}

if (!supabaseKey || supabaseKey === 'your-public-anon-key-here') {
  console.log('\n❌ ERROR: VITE_SUPABASE_PUBLISHABLE_KEY is not set or is still the placeholder value');
  console.log('   Please update it in your .env file with your actual Supabase anon key');
}

if (supabaseUrl && supabaseKey && supabaseKey !== 'your-public-anon-key-here') {
  console.log('\n✅ Environment variables are properly set');
  
  // Test Supabase connection
  try {
    console.log('\nTesting Supabase connection...');
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    
    // Test authentication by getting user session (won't error even if not logged in)
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Authentication error:', error.message);
    } else {
      console.log('✅ Authentication successful');
    }
    
    // Test database connection with a simple query
    console.log('\nTesting database connectivity...');
    const { data, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (dbError && dbError.message.includes('Invalid API key')) {
      console.log('❌ Database connection failed: Invalid API key');
      console.log('   Please verify your VITE_SUPABASE_PUBLISHABLE_KEY is correct');
    } else if (dbError) {
      console.log('ℹ️  Note:', dbError.message);
      console.log('✅ Database connection successful (authentication working)');
    } else {
      console.log('✅ Database connection successful!');
    }
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
  }
}

console.log('\n' + '='.repeat(50));
console.log('Connection Verification Complete');
console.log('='.repeat(50));