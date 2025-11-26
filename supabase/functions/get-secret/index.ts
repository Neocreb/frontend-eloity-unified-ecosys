// Supabase Edge Function to retrieve secrets
// This function allows authorized clients to retrieve specific secrets

// @ts-nocheck - Supabase Edge Functions use Deno runtime, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

console.log("🚀 Supabase Edge Function: get-secret started");

serve(async (req) => {
  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { headers: { 'Content-Type': 'application/json' }, status: 405 }
    );
  }

  try {
    // Parse the request body
    const { key } = await req.json();

    // Validate the key parameter
    if (!key) {
      return new Response(
        JSON.stringify({ error: 'Missing key parameter' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // List of allowed secret keys (for security)
    const allowedKeys = [
      // Payment Processing
      'FLUTTERWAVE_SECRET_KEY',
      'PAYSTACK_SECRET_KEY',
      'PAYSTACK_PUBLIC_API',
      'PAYSTACK_API_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      
      // SMS & Notifications
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER',
      'TWILIO_API_SECRET_KEY',
      'TWILIO_SID_KEY',
      'AFRICAS_TALKING_API_KEY',
      'AFRICAS_TALKING_USERNAME',
      'TERMII_API_KEY',
      'RESEND_API',
      
      // Crypto Services
      'COINGECKO_API_KEY',
      'COINGECKO_API',
      'CRYPTOAPIS_API_KEY',
      
      // AI Services
      'OPENAI_API_KEY',
      
      // Email Services
      'SMTP_USER',
      'SMTP_PASS',
      
      // File Storage
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      
      // Authentication
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'FACEBOOK_APP_ID',
      'FACEBOOK_APP_SECRET',
      'TWITTER_API_KEY',
      'TWITTER_API_SECRET',
      
      // Firebase
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      
      // Analytics
      'GA_TRACKING_ID',
      'MIXPANEL_TOKEN',
      'SENTRY_DSN',
      
      // Security
      'JWT_SECRET',
      'SESSION_SECRET'
    ];

    // Check if the requested key is allowed
    if (!allowedKeys.includes(key)) {
      return new Response(
        JSON.stringify({ error: 'Key not allowed' }),
        { headers: { 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Retrieve the secret from Deno.env
    // Note: These secrets must be set in the Supabase Dashboard under Project Settings > API > Edge Functions
    const secretValue = Deno.env.get(key);

    if (!secretValue) {
      return new Response(
        JSON.stringify({ error: `Secret not found for key: ${key}` }),
        { headers: { 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Return the secret value
    return new Response(
      JSON.stringify({ key, value: secretValue }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-secret function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});