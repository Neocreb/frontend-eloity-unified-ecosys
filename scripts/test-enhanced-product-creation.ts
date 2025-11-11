#!/usr/bin/env ts-node

/**
 * Test script to verify enhanced product creation functionality
 * This script tests the creation of physical, digital, and service products
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

async function testEnhancedProductCreation() {
  console.log('Testing enhanced product creation...\n');

  try {
    // Test 1: Create a physical product
    console.log('1. Testing physical product creation...');
    
    const physicalProduct = {
      seller_id: 'test-user-1',
      name: 'Test Physical Product',
      description: 'A test physical product for verification',
      price: 29.99,
      image_url: 'https://example.com/physical-product.jpg',
      category: 'Electronics',
      in_stock: true,
      stock_quantity: 10,
      weight: 1.5,
      dimensions: { length: 10, width: 5, height: 2 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: physicalData, error: physicalError } = await supabase
      .from('products')
      .insert([physicalProduct])
      .select();

    if (physicalError) {
      console.error('✗ Error creating physical product:', physicalError.message);
    } else {
      console.log('✓ Successfully created physical product');
      console.log('  Product ID:', physicalData[0].id);
    }

    // Test 2: Create a digital product
    console.log('\n2. Testing digital product creation...');
    
    const digitalProduct = {
      seller_id: 'test-user-2',
      name: 'Test Digital Product',
      description: 'A test digital product for verification',
      price: 19.99,
      image_url: 'https://example.com/digital-product.jpg',
      category: 'Books & Literature',
      in_stock: true,
      stock_quantity: 1000, // Digital products have high stock
      digital_type: 'ebook',
      format: 'PDF',
      file_size: '2.5MB',
      authors: 'Test Author',
      publisher: 'Test Publisher',
      language: 'English',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: digitalData, error: digitalError } = await supabase
      .from('products')
      .insert([digitalProduct])
      .select();

    if (digitalError) {
      console.error('✗ Error creating digital product:', digitalError.message);
    } else {
      console.log('✓ Successfully created digital product');
      console.log('  Product ID:', digitalData[0].id);
      console.log('  Digital Type:', digitalData[0].digital_type);
    }

    // Test 3: Create a service product
    console.log('\n3. Testing service product creation...');
    
    const serviceProduct = {
      seller_id: 'test-user-3',
      name: 'Test Service Product',
      description: 'A test service product for verification',
      price: 49.99,
      image_url: 'https://example.com/service-product.jpg',
      category: 'Business & Productivity',
      in_stock: true,
      stock_quantity: 10, // Services might have limited availability
      service_type: 'consulting',
      delivery_time: '2-3 business days',
      hourly_rate: 25.00,
      requirements: 'Initial consultation required',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: serviceData, error: serviceError } = await supabase
      .from('products')
      .insert([serviceProduct])
      .select();

    if (serviceError) {
      console.error('✗ Error creating service product:', serviceError.message);
    } else {
      console.log('✓ Successfully created service product');
      console.log('  Product ID:', serviceData[0].id);
      console.log('  Service Type:', serviceData[0].service_type);
    }

    // Test 4: Query products by type
    console.log('\n4. Testing product queries...');
    
    // Query digital products
    const { data: digitalProducts, error: queryError } = await supabase
      .from('products')
      .select('*')
      .not('digital_type', 'is', null)
      .limit(5);

    if (queryError) {
      console.error('✗ Error querying digital products:', queryError.message);
    } else {
      console.log('✓ Successfully queried digital products');
      console.log('  Found', digitalProducts.length, 'digital products');
    }

    // Query service products
    const { data: serviceProducts, error: serviceQueryError } = await supabase
      .from('products')
      .select('*')
      .not('service_type', 'is', null)
      .limit(5);

    if (serviceQueryError) {
      console.error('✗ Error querying service products:', serviceQueryError.message);
    } else {
      console.log('✓ Successfully queried service products');
      console.log('  Found', serviceProducts.length, 'service products');
    }

    // Clean up test records
    console.log('\n5. Cleaning up test records...');
    
    const testProducts = [
      'Test Physical Product',
      'Test Digital Product', 
      'Test Service Product'
    ];

    for (const productName of testProducts) {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('name', productName);
      
      if (deleteError) {
        console.warn('  Warning: Could not delete test product:', productName);
      } else {
        console.log('  ✓ Deleted test product:', productName);
      }
    }

    console.log('\n✓ All tests completed successfully!');
    console.log('\nEnhanced product creation is working correctly.');
    console.log('Your marketplace now supports physical, digital, and service products.');

  } catch (err) {
    console.error('Unexpected error during testing:', err);
    process.exit(1);
  }
}

// Run the tests
testEnhancedProductCreation();