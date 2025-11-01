#!/usr/bin/env node

// Script to test if the Replicate API key is valid
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Replicate API Key\n');

// Check if .env.local file exists
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');

let envContent = '';
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ Found .env.local file');
} else if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found .env file');
} else {
  console.log('❌ No .env or .env.local file found');
  process.exit(1);
}

// Extract REPLICATE_API_KEY from env file
const replicateApiKeyMatch = envContent.match(/REPLICATE_API_KEY=(.+)/);
if (!replicateApiKeyMatch) {
  console.log('❌ REPLICATE_API_KEY not found in environment file');
  process.exit(1);
}

const replicateApiKey = replicateApiKeyMatch[1].trim();
console.log('🔑 REPLICATE_API_KEY found:', replicateApiKey ? 'YES' : 'NO');

// Test the API key by making a simple request to Replicate API
import fetch from 'node-fetch';

async function testReplicateKey() {
  try {
    console.log('\n🔍 Testing Replicate API key...');
    
    const response = await fetch('https://api.replicate.com/v1/collections', {
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      console.log('✅ Replicate API key is valid!');
      const data = await response.json();
      console.log('📦 Collections available:', data.results.length);
    } else {
      console.log('❌ Replicate API key is invalid or there was an error');
      const errorText = await response.text();
      console.log('📝 Error details:', errorText);
    }
  } catch (error) {
    console.error('💥 Error testing Replicate API key:', error.message);
  }
}

testReplicateKey();