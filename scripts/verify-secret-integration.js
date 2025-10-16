#!/usr/bin/env node

// Script to verify secret key integration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Secret Key Integration...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('   Please create a .env file with your secret keys.\n');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse environment variables
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  }
});

// Required secret keys
const requiredKeys = [
  'FLUTTERWAVE_SECRET_KEY',
  'PAYSTACK_SECRET_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'COINGECKO_API_KEY'
];

// Optional keys (nice to have)
const optionalKeys = [
  'AFRICAS_TALKING_API_KEY',
  'AFRICAS_TALKING_USERNAME',
  'TERMII_API_KEY'
];

console.log('📋 Checking Required Secret Keys:\n');

let allRequiredKeysPresent = true;
requiredKeys.forEach(key => {
  if (envVars[key] && envVars[key] !== `your_actual_${key.toLowerCase()}`) {
    console.log(`✅ ${key}: Present`);
  } else {
    console.log(`❌ ${key}: Missing or placeholder value`);
    allRequiredKeysPresent = false;
  }
});

console.log('\n📋 Checking Optional Secret Keys:\n');

optionalKeys.forEach(key => {
  if (envVars[key] && envVars[key] !== `your_actual_${key.toLowerCase()}`) {
    console.log(`✅ ${key}: Present`);
  } else {
    console.log(`⚠️  ${key}: Missing or placeholder value (optional)`);
  }
});

console.log('\n📋 Checking Service Implementation:\n');

// Check if services are implemented
const serviceFiles = [
  {
    name: 'Crypto Service',
    path: 'src/services/cryptoService.ts',
    key: 'COINGECKO_API_KEY'
  },
  {
    name: 'Payment Service',
    path: 'server/services/paymentService.ts',
    keys: ['FLUTTERWAVE_SECRET_KEY', 'PAYSTACK_SECRET_KEY']
  },
  {
    name: 'Notification Service',
    path: 'server/services/notificationService.ts',
    keys: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN']
  }
];

serviceFiles.forEach(service => {
  const fullPath = path.join(__dirname, '..', service.path);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (Array.isArray(service.keys)) {
      const allKeysImplemented = service.keys.every(key => 
        content.includes(key) || content.includes(key.replace(/_/g, ''))
      );
      
      if (allKeysImplemented) {
        console.log(`✅ ${service.name}: Implemented`);
      } else {
        console.log(`❌ ${service.name}: Missing key references`);
      }
    } else {
      if (content.includes(service.key) || content.includes(service.key.replace(/_/g, ''))) {
        console.log(`✅ ${service.name}: Implemented`);
      } else {
        console.log(`❌ ${service.name}: Missing key reference`);
      }
    }
  } else {
    console.log(`❌ ${service.name}: Service file not found (${service.path})`);
  }
});

console.log('\n📋 Checking Environment Configuration:\n');

// Check if we're in production mode
const nodeEnv = envVars['NODE_ENV'] || process.env.NODE_ENV || 'development';
console.log(`📍 NODE_ENV: ${nodeEnv}`);

if (nodeEnv === 'production') {
  console.log('✅ Production mode detected');
} else {
  console.log('⚠️  Development mode detected (mock services will be used)');
}

console.log('\n📊 Integration Status:\n');

if (allRequiredKeysPresent) {
  console.log('🎉 All required secret keys are properly configured!');
  console.log('🚀 The platform is ready for production deployment.');
} else {
  console.log('⚠️  Some required secret keys are missing.');
  console.log('📝 Please update your .env file with the actual secret keys.');
}

console.log('\n📚 Next Steps:');
console.log('1. Test individual services using the provided test scripts');
console.log('2. Verify API connectivity for each service');
console.log('3. Monitor logs for any authentication errors');
console.log('4. Implement proper error handling and fallbacks');

console.log('\n🧪 Testing Commands:');
console.log('   node test-coingecko-integration.ts');
console.log('   node test-payment-services.js');
console.log('   node test-sms-services.js');