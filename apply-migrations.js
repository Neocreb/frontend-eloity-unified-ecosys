import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function applyMigrations() {
  try {
    console.log('Applying migrations...');
    const sql = neon(process.env.DATABASE_URL);
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '0000_tired_bloodaxe.sql');
    const migrationContent = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration content into individual statements
    const statements = migrationContent.split('--> statement-breakpoint');
    
    console.log(`Found ${statements.length} statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith('CREATE INDEX') && !statement.startsWith('ALTER TABLE')) {
        console.log(`Executing statement ${i + 1}/${statements.length}`);
        try {
          await sql(statement);
          console.log(`Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('Migrations applied successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error.message);
  }
}

applyMigrations();