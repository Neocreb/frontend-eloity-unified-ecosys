# Edith AI Content Generator - Test Checklist

## Pre-Test Setup

Before testing, ensure:
- [ ] Dev server is running (`npm run dev`)
- [ ] Replicate API key is set in `.env.local`
- [ ] Edge function secret is configured in Supabase
- [ ] Edge function is deployed (`npx supabase functions deploy replicate-generate`)

## Test 1: Feed Post Creation Flow

### Steps:
1. [ ] Navigate to `/app/feed` page
2. [ ] Look for "Create post" button and click it
3. [ ] Verify the post creation dialog opens
4. [ ] In the action buttons row, look for "Edith AI" button (should have sparkles icon)
5. [ ] Click "Edith AI" button

### Expected Results:
- [ ] Dialog header changes to "Generate with Edith AI"
- [ ] Back button appears to return to "Create post"
- [ ] AI generator interface is displayed (no full-screen overlay)
- [ ] Can see "Generate Image" and "Generate Video" buttons
- [ ] Text areas for prompt and negative prompt are visible

### Test 2: Image Generation

1. [ ] Ensure "Generate Image" button is selected
2. [ ] Enter a test prompt: "a beautiful sunset over mountains, photorealistic, high quality"
3. [ ] (Optional) Enter negative prompt: "blurry, low quality, distorted"
4. [ ] Click "Generate with Edith AI" button
5. [ ] Wait for generation (should take 30-60 seconds)

### Expected Results:
- [ ] Button shows "Generating..." with spinner
- [ ] After completion, generated image appears in preview
- [ ] "Use Content" and "Upscale 2x" buttons appear
- [ ] Image quality should be high (SDXL model)

### Test 3: Using Generated Content

1. [ ] After image generation completes, click "Use Content" button
2. [ ] Wait for content to be processed

### Expected Results:
- [ ] Toast notification: "Content Added! Your AI-generated image has been added to your post."
- [ ] Dialog switches back to "Create post" step
- [ ] Generated image appears in the media preview area
- [ ] Can now type text for the post
- [ ] Image is displayed with remove button (X) overlay

### Test 4: Complete Post Creation

1. [ ] Type some content in the text area
2. [ ] Review the media preview
3. [ ] Click "Next" to proceed to settings
4. [ ] Verify post settings are available
5. [ ] Click "Post" to publish

### Expected Results:
- [ ] Post is successfully created
- [ ] Generated image is visible in the post
- [ ] Post appears in feed with correct content and media

## Test 5: Video Generation

1. [ ] Open post creation dialog again
2. [ ] Click "Edith AI" button
3. [ ] Click "Generate Video" button
4. [ ] Enter a video prompt: "a person dancing happily"
5. [ ] Click "Generate with Edith AI"
6. [ ] Wait for generation (video takes longer - 1-3 minutes)

### Expected Results:
- [ ] Video generation starts (longer wait than images)
- [ ] Video preview appears with playback controls
- [ ] "Use Content" button available
- [ ] Can select the video and create a post with it

## Test 6: Image Upscaling

1. [ ] Generate an image and wait for completion
2. [ ] Click "Upscale 2x" button on the generated image

### Expected Results:
- [ ] Upscale button shows "Upscaling..." with spinner
- [ ] Image is upscaled (should appear sharper/larger)
- [ ] Button returns to normal state
- [ ] Can still use the upscaled image for the post

## Test 7: Standalone CreatePost Page

1. [ ] Navigate to `/app/create-post` page
2. [ ] Scroll down to "Generate Content with Edith AI" section
3. [ ] Click "Generate Image" button
4. [ ] Generate an image with a test prompt

### Expected Results:
- [ ] Image generates successfully
- [ ] Image preview appears in the form
- [ ] Can write post content and submit

## Test 8: Error Handling

### Test 8a: Invalid Prompt
1. [ ] Click "Edith AI" in post creation
2. [ ] Leave prompt empty
3. [ ] Click "Generate with Edith AI"

### Expected Results:
- [ ] Toast error: "Prompt Required"
- [ ] Function does not execute

### Test 8b: API Key Missing
1. [ ] If REPLICATE_API_KEY is not set
2. [ ] Try to generate image

### Expected Results:
- [ ] Error message: "REPLICATE_API_KEY not configured"
- [ ] Toast shows generation failed
- [ ] Helpful error displayed

### Test 8c: Network Error
1. [ ] Generate image then immediately close browser/disconnect network
2. [ ] See if error is handled gracefully

### Expected Results:
- [ ] Error is caught
- [ ] Toast notifies user
- [ ] Dialog remains open for retry

## Test 9: Marketplace Integration

1. [ ] Navigate to marketplace and create a product listing
2. [ ] Look for "Generate with Edith AI" option
3. [ ] Generate a product image

### Expected Results:
- [ ] Image generation works in marketplace context
- [ ] Generated image can be used for product

## Test 10: Performance

- [ ] Image generation time: 30-60 seconds (expect this)
- [ ] Video generation time: 1-3 minutes (expect this)
- [ ] No freezing or unresponsive UI during generation
- [ ] Can still navigate UI (read toast messages, etc.)
- [ ] Multiple generations work sequentially

## Test 11: Browser Compatibility

Test on:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Expected Results:
- [ ] Works consistently across browsers
- [ ] Responsive design on mobile
- [ ] Touch controls work on mobile devices

## Verification Checklist

After all tests pass:

- [ ] Post creation flow is seamless with AI generator
- [ ] AI generator doesn't block the dialog
- [ ] Generated content is automatically inserted into posts
- [ ] Image quality is high (SDXL)
- [ ] Video generation works (Zeroscope)
- [ ] Upscaling feature works (Real-ESRGAN)
- [ ] Error handling is robust
- [ ] All integrations work (feed, marketplace, standalone page)
- [ ] Performance is acceptable
- [ ] Mobile responsiveness is good

## Quick Test Commands

```bash
# Verify Replicate API configuration
node scripts/test-replicate-function.js

# Check Edge Function deployment
npx supabase functions list

# View Edge Function logs
npx supabase functions logs replicate-generate

# Deploy Edge Function (if needed)
npx supabase functions deploy replicate-generate
```

## Common Issues & Solutions

### Issue: "Edith AI button not visible"
- **Solution**: Clear cache (Ctrl+Shift+Delete), hard refresh (Ctrl+Shift+R), restart dev server

### Issue: "Generation takes very long"
- **Solution**: This is expected! SDXL takes 30-60s, videos take 1-3 minutes. Be patient.

### Issue: "REPLICATE_API_KEY not configured"
- **Solution**: Run `node scripts/set-replicate-api-key.js`

### Issue: "Function not found" (404)
- **Solution**: Deploy function with `npx supabase functions deploy replicate-generate`

### Issue: "Failed to add the generated content"
- **Solution**: Check browser console (F12), check that generated URL is accessible

### Issue: "Image preview doesn't show"
- **Solution**: Check browser console for CORS errors, verify image URL is public

## Success Criteria

✅ All tests pass  
✅ No console errors  
✅ Smooth user experience  
✅ Generated content properly integrated  
✅ Post creation completes successfully  
✅ Content visible in feed/marketplace  

## Sign-Off

Once all tests pass, you can consider the Edith AI Content Generator integration complete!

- Tested by: _______________
- Date: _______________
- Notes: _______________
