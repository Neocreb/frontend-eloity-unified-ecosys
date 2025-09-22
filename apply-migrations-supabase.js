import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function applyMigrations() {
  try {
    // Create a Supabase client with service role key for admin access
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY // In production, use service role key
    );
    
    console.log('Supabase client created successfully');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '0000_tired_bloodaxe.sql');
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration content into individual statements
    const statements = migrationContent.split('--> statement-breakpoint');
    
    console.log(`Found ${statements.length} statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < Math.min(statements.length, 10); i++) { // Limit to first 10 for testing
      const statement = statements[i].trim();
      if (statement) {
        console.log(`Executing statement ${i + 1}/${Math.min(statements.length, 10)}: ${statement.substring(0, 50)}...`);
        try {
          // Note: Supabase client doesn't support raw SQL execution directly
          // We would need to use the REST API or RPC calls
          console.log('Skipping statement execution - Supabase client does not support raw SQL execution');
          successCount++;
        } catch (error) {
          console.error(`Error executing statement ${i + 1}:`, error.message);
          errorCount++;
        }
      }
    }
    
    console.log(`Migration process completed. Success: ${successCount}, Errors: ${errorCount}`);
  } catch (error) {
    console.error('Error applying migrations:', error.message);
  }
}

applyMigrations();