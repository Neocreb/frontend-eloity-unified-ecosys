# Replicate API Integration Setup Guide

This guide explains how to set up and configure the Replicate API integration for the Edith AI content generation features in the Eloity platform.

## Overview

The Edith AI content generation features use the Replicate API through a Supabase Edge Function to:
- Generate images using Stable Diffusion and SDXL models
- Generate videos using the Zeroscope model
- Upscale images using the Real-ESRGAN model

The integration is secure because API keys are stored in Supabase Edge Function secrets, not in the client-side code.

## Prerequisites

1. A Replicate account (free tier available at [replicate.com](https://replicate.com))
2. A Replicate API token
3. Supabase CLI installed (`npm install -g supabase`)
4. Supabase project configured with environment variables

## Step 1: Get Your Replicate API Key

1. Go to [replicate.com](https://replicate.com) and sign up or log in
2. Navigate to your account settings
3. Go to the "API Tokens" section
4. Create a new API token or copy an existing one
5. Save this token securely - you'll need it in the next steps

## Step 2: Configure Environment Variables

Add your Replicate API key to your environment configuration:

1. Open your `.env.local` file (or create it if it doesn't exist)
2. Add the following line:
   ```
   REPLICATE_API_KEY=your_actual_replicate_api_key_here
   ```

3. Replace `your_actual_replicate_api_key_here` with your actual Replicate API key

## Step 3: Set the Secret in Supabase

You need to set the Replicate API key as a secret in your Supabase project:

### Option 1: Using the Setup Script (Recommended)
```bash
node scripts/set-replicate-api-key.js
```

This script will guide you through setting the secret using the Supabase CLI.

### Option 2: Manual Setup with Supabase CLI
```bash
npx supabase functions secrets set REPLICATE_API_KEY=your_actual_replicate_api_key_here
```

### Option 3: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Project Settings > API > Edge Functions
3. Click on "Secrets" tab
4. Click "Add Secret"
5. Set Key as "REPLICATE_API_KEY"
6. Set Value as your actual Replicate API key
7. Click "Add"

## Step 4: Deploy the Edge Function

Deploy the replicate-generate Edge Function to your Supabase project:

### Using the Deployment Script (Recommended)
```bash
node scripts/deploy-replicate-function.js
```

### Manual Deployment
```bash
npx supabase functions deploy replicate-generate
```

## Step 5: Test the Integration

Verify that the integration is working correctly:

```bash
node scripts/test-replicate-function.js
```

This script will:
1. Call the replicate-generate function with a test prompt
2. Verify that the function returns output from the Replicate API
3. Provide troubleshooting guidance if there are issues

## Step 6: Use the Edith AI Features

Once the integration is set up and tested, you can use the Edith AI content generation features:

1. Navigate to any content creation interface in the app
2. Look for the "Edith AI" or "Generate with AI" options
3. Use the image/video generation features
4. The content will be generated using the Replicate API through the secure Edge Function

## Troubleshooting

### "Function not found" Error
This means the replicate-generate function hasn't been deployed yet.
- Solution: Deploy the function using `node scripts/deploy-replicate-function.js`

### "REPLICATE_API_KEY not configured" Error
This means the Replicate API key hasn't been set as a secret in Supabase.
- Solution: Set the secret using `node scripts/set-replicate-api-key.js`

### "Failed to generate content" Error
This could mean:
1. Invalid Replicate API key
2. Replicate API service issues
3. Network connectivity issues

Check:
- That your Replicate API key is valid and active
- The Replicate API status page for any service issues
- Your network connectivity

## Security Best Practices

1. **Never commit API keys to version control**
   - The project already includes `.env.local` in `.gitignore`
   - Always use environment variables for secrets

2. **Use Edge Function secrets for production**
   - API keys are stored securely in Supabase Edge Function secrets
   - Never expose API keys to client-side code

3. **Regularly rotate your API keys**
   - Generate new API keys periodically
   - Update the secrets in Supabase when rotating keys

4. **Monitor API usage**
   - Check your Replicate account for unusual usage patterns
   - Set up billing alerts to avoid unexpected charges

## Models Used

The integration uses the following Replicate models:

1. **Stable Diffusion** (`stability-ai/stable-diffusion`)
   - For general image generation
   - Used by the `generateImage` function

2. **SDXL** (`stability-ai/sdxl`)
   - For high-quality image generation
   - Used by the `generateImageSDXL` function

3. **Zeroscope** (`text-to-video-zeroscope/zeroscope-v2-xl`)
   - For video generation
   - Used by the `generateVideo` function

4. **Real-ESRGAN** (`nightmareai/real-esrgan`)
   - For image upscaling
   - Used by the `upscaleImage` function

## Next Steps

1. ✅ Set your Replicate API key in environment variables
2. ✅ Deploy the replicate-generate Edge Function
3. ✅ Set the REPLICATE_API_KEY secret in Supabase
4. ✅ Test the integration
5. ✅ Use the Edith AI content generation features
6. ✅ Monitor usage and rotate keys periodically