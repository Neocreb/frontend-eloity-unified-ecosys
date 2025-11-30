# Edith AI Content Generator - Complete Setup Guide

## Overview
The Edith AI Content Generator has been refactored to work seamlessly within the post creation flow (like Facebook). This guide walks you through verification, configuration, and testing.

## What Changed

### Before (Issue)
- The EdithAIGenerator modal was a full-screen overlay
- It blocked the post creation dialog
- Generated content wasn't automatically integrated

### After (Fixed)
- The AI generator is now integrated into the post creation flow
- Users can generate content without losing their post context
- Generated content is automatically added to the post as media
- Smooth transitions between post editing and AI generation

## Setup Checklist

### ✅ Step 1: Verify Environment Variables

Check that your `.env.local` file contains the Replicate API key:

```bash
# Check if .env.local exists and contains REPLICATE_API_KEY
cat .env.local | grep REPLICATE_API_KEY
```

**If not present**, add it:
```bash
REPLICATE_API_KEY=your_actual_replicate_api_key_here
```

To get a Replicate API key:
1. Go to https://replicate.com/account/api-tokens
2. Create or copy your API token
3. Add it to `.env.local`

### ✅ Step 2: Set Supabase Edge Function Secret

The Replicate API key must be set as a secret in your Supabase project:

**Option A: Using the provided script (Recommended)**
```bash
node scripts/set-replicate-api-key.js
```

**Option B: Manual using Supabase CLI**
```bash
npx supabase functions secrets set REPLICATE_API_KEY
# Then paste your API key when prompted
```

**Option C: Supabase Dashboard**
1. Visit: https://supabase.com/dashboard
2. Go to your project → Project Settings → API → Edge Functions
3. Click "Secrets" tab
4. Add Secret:
   - Key: `REPLICATE_API_KEY`
   - Value: Your actual Replicate API key
5. Save

### ✅ Step 3: Deploy Edge Function

Deploy the replicate-generate Edge Function:

**Option A: Using the provided script (Recommended)**
```bash
node scripts/deploy-replicate-function.js
```

**Option B: Manual deployment**
```bash
npx supabase functions deploy replicate-generate
```

### ✅ Step 4: Test the Integration

Run the test script to verify everything is working:

```bash
node scripts/test-replicate-function.js
```

**Expected output:**
```
✅ Function call successful!
🎉 Replicate API integration is working correctly!
```

If you get errors:
- "Function not found" → Deploy the edge function (Step 3)
- "REPLICATE_API_KEY not configured" → Set the secret (Step 2)
- "Failed to generate content" → Check your API key is valid

## How to Use

### In the Feed Page

1. Click "Create post" to open the post creation dialog
2. In the post editor, you'll see action buttons:
   - Photo
   - Video
   - Audio
   - **Edith AI** ← New!
3. Click "Edith AI" to enter the AI generation mode
4. Select content type (Image or Video)
5. Enter a detailed prompt
6. Click "Generate with Edith AI"
7. Once generated, click "Use Content" to add it to your post
8. The content is automatically added as media to your post
9. Review your post and click "Next" to access post settings
10. Click "Post" to publish

### Supported Features

#### Image Generation
- Model: Stable Diffusion SDXL (high quality)
- Customizable dimensions (256-1024px)
- Negative prompts to exclude unwanted elements
- Image upscaling (2x resolution)
- Preview before using

#### Video Generation
- Model: Zeroscope v2 XL
- 24 frames at 8 fps
- Negative prompts for better control
- MP4 format compatible with posts

#### AI Integration Across Platform

The Edith AI generator is also available in:
- Marketplace product listings
- Video recorder/editor
- Content creation pages
- Unified AI Studio

## Architecture

### Client-Side
- **EdithAIGenerator.tsx** - Core component (now embeddable)
- **replicateService.ts** - Supabase Edge Function client
- **CreatePostFlow.tsx** - Integrated post creation dialog

### Server-Side
- **supabase/functions/replicate-generate/index.ts** - Deno Edge Function
- Handles API calls securely
- Supports multiple AI models (SDXL, Stable Diffusion, Zeroscope, Real-ESRGAN)

### Security
- API key stored in Supabase Edge Function secrets
- Never exposed to client-side code
- All requests go through secure Supabase infrastructure

## Troubleshooting

### Problem: "Edith AI" button not visible
- Clear browser cache
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check that the app is running the latest code

### Problem: Generation fails with error
1. Check your Replicate API key is valid:
   - Visit https://replicate.com/account/api-tokens
   - Create a new one if needed

2. Verify the Edge Function is deployed:
   ```bash
   npx supabase functions list
   ```
   You should see `replicate-generate` in the list

3. Check the Supabase logs:
   ```bash
   npx supabase functions logs replicate-generate
   ```

4. Run the test script:
   ```bash
   node scripts/test-replicate-function.js
   ```

### Problem: "Failed to add the generated content"
- Check browser console for errors (F12 or Cmd+Option+I)
- Verify the generated content URL is accessible
- Try a different prompt or smaller image dimensions

### Problem: Very slow generation
- This is expected! AI models take time to generate
- SDXL takes 30-60 seconds
- Video generation takes 1-3 minutes
- Be patient and don't close the modal

## Performance Tips

1. **Image Generation**
   - Use clear, descriptive prompts
   - Include style details (e.g., "photorealistic", "digital art")
   - Avoid extremely large dimensions (keep under 768x768)

2. **Video Generation**
   - Keep prompts short and focused
   - Videos are resource-intensive - expect longer wait times
   - Don't generate videos with very detailed prompts

3. **General**
   - Generate content before composing long posts
   - Use negative prompts wisely
   - Test generation in off-peak hours

## API Rate Limits

Replicate has rate limits based on your plan:
- **Free plan**: Limited concurrent runs
- **Paid plans**: Higher limits based on subscription

Monitor your usage at https://replicate.com/account/usage

## Next Steps

1. ✅ Complete the setup checklist above
2. ✅ Test the integration with `node scripts/test-replicate-function.js`
3. ✅ Try generating content in the post creation flow
4. ✅ Verify the generated content is properly inserted
5. ✅ Check across the platform (marketplace, video recorder, etc.)
6. ✅ Monitor API usage and costs

## Support

If you encounter issues:
1. Check this guide first
2. Review the troubleshooting section
3. Check Supabase function logs
4. Visit https://support.replicate.com for API-specific issues
