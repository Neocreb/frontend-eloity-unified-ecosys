import dotenv from 'dotenv';
import reloadlyService from './server/services/reloadlyService.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testReloadlyIntegration() {
  try {
    console.log('Testing RELOADLY API Integration...');
    
    // Test 1: Get balance
    console.log('\n1. Testing balance retrieval...');
    const balance = await reloadlyService.getBalance();
    console.log('Balance:', balance);
    
    // Test 2: Get operators for Nigeria
    console.log('\n2. Testing operator retrieval for Nigeria...');
    const operators = await reloadlyService.getOperatorsByCountry('NG');
    console.log(`Found ${operators.length} operators`);
    console.log('First operator:', operators[0]);
    
    // Test 3: Get gift card products
    console.log('\n3. Testing gift card products retrieval...');
    const products = await reloadlyService.getGiftCardProducts();
    console.log(`Found ${products.length} gift card products`);
    console.log('First product:', products[0]);
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testReloadlyIntegration();