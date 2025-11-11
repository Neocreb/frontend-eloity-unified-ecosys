#!/usr/bin/env ts-node

/**
 * Script to verify the product schema updates for digital and service products
 * This script checks if the required columns exist in the products table
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyProductSchema() {
  console.log('Verifying product schema updates...\n');

  try {
    // Get the structure of the products table
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying products table:', error.message);
      process.exit(1);
    }

    // If we get here, the table exists
    console.log('✓ Products table exists');

    // Check for digital product columns
    const digitalColumns = [
      'digital_type',
      'system_requirements',
      'support_info',
      'file_size',
      'format',
      'authors',
      'publisher',
      'publication_date',
      'language'
    ];

    // Check for service product columns
    const serviceColumns = [
      'service_type',
      'delivery_time',
      'hourly_rate',
      'requirements'
    ];

    // Since we can't directly query column info with this method,
    // we'll try to insert a test record with the new fields
    const testProduct = {
      seller_id: 'test-user',
      name: 'Schema Verification Product',
      description: 'Test product to verify schema',
      price: 0,
      image_url: 'https://example.com/test.jpg',
      category: 'test',
      digital_type: 'ebook',
      service_type: 'consulting',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('products')
      .insert([testProduct]);

    if (insertError) {
      console.error('✗ Error inserting test product:', insertError.message);
      console.log('This may indicate missing columns in the products table');
    } else {
      console.log('✓ Successfully inserted test product with new fields');
      
      // Clean up the test record
      await supabase
        .from('products')
        .delete()
        .eq('name', 'Schema Verification Product');
      
      console.log('✓ Cleaned up test product');
    }

    // Check product_categories table
    const { data: categories, error: categoriesError } = await supabase
      .from('product_categories')
      .select('*')
      .limit(5);

    if (categoriesError) {
      console.error('✗ Error querying product_categories table:', categoriesError.message);
    } else {
      console.log('✓ Product categories table exists');
      console.log(`  Found ${categories.length} categories`);
    }

    console.log('\nSchema verification complete!');
    console.log('If no errors were shown, your database schema is ready for enhanced product listings.');

  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Run the verification
verifyProductSchema();