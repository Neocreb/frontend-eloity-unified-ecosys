import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;

async function main() {
  console.log('🚀 Posts Storage Policies Fix\n');
  
  console.log('This script will help you fix the storage policies for the posts bucket.');
  console.log('The issue is that authenticated users cannot upload files due to incorrect RLS policies.\n');
  
  // Check if environment variables are set
  if (!supabaseUrl) {
    console.log('⚠️  Supabase URL not found in environment variables.');
    console.log('Please ensure you have a .env.local file with VITE_SUPABASE_URL configured.\n');
  }
  
  // Read the SQL fix file
  const sqlFixPath = join(process.cwd(), 'fix-posts-storage-policies.sql');
  try {
    const sqlContent = readFileSync(sqlFixPath, 'utf8');
    console.log('✅ Loaded SQL fix file\n');
    
    console.log('🔧 To fix the storage policies, follow these steps:\n');
    
    console.log('1. Open the Supabase Dashboard:');
    console.log('   - Go to https://app.supabase.com');
    console.log('   - Sign in to your account');
    console.log('   - Select your project (hjebzdekquczudhrygns)\n');
    
    console.log('2. Navigate to the SQL Editor:');
    console.log('   - In the left sidebar, click on "SQL Editor"\n');
    
    console.log('3. Copy and paste the following SQL commands into the editor:\n');
    console.log('=== SQL COMMANDS START ===\n');
    console.log(sqlContent);
    console.log('=== SQL COMMANDS END ===\n');
    
    console.log('4. Click the "Run" button to execute the SQL commands\n');
    
    console.log('5. Test the file upload functionality again\n');
    
    console.log('📝 Notes:');
    console.log('- These commands will fix the RLS policies for the posts bucket');
    console.log('- The fix allows authenticated users to upload files');
    console.log('- Public read access is maintained');
    console.log('- Owners can still update/delete their own files');
    console.log('- We do not alter the storage.objects table structure as it is managed by Supabase\n');
    
    console.log('🧪 After applying the fix, you can test the storage functionality by running:');
    console.log('   node scripts/test-posts-storage.js\n');
    
  } catch (error) {
    console.error('❌ Error reading SQL fix file:', error.message);
    console.log('\n📝 To fix the storage policies manually:');
    console.log('1. Open the file fix-posts-storage-policies.sql');
    console.log('2. Copy its contents');
    console.log('3. Paste them into the Supabase SQL Editor');
    console.log('4. Run the commands');
  }
}

// Run the main function
main();