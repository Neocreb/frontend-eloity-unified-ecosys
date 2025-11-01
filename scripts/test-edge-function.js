#!/usr/bin/env node

// Simple script to test Edge Function deployment
import fetch from 'node-fetch';

const PROJECT_URL = 'https://hjebzdekquczudhrygns.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZWJ6ZGVrcXVjenVkaHJ5Z25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjIzMjksImV4cCI6MjA2MDE5ODMyOX0.bUXtDIV-QReFFgv6UoOGovH2zi2q68HKe2E4Kkbhc7U';

async function testFunction() {
  try {
    console.log('Testing test-function...');
    
    const response = await fetch(`${PROJECT_URL}/functions/v1/test-function`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Test function is working correctly!');
    } else {
      console.log('❌ Test function failed');
    }
  } catch (error) {
    console.error('Error testing function:', error.message);
  }
}

testFunction();