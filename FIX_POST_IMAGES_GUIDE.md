# Fix Guide: Post Images Disappearing on Page Refresh

## Issue
Images uploaded with posts disappear after page refresh. Only text content remains visible.

## Root Causes & Solutions

### 1. Storage Bucket Not Public (Most Common)

**Problem:** Images are uploaded to private Supabase Storage bucket, so `getPublicUrl()` doesn't work.

**Solution:**

Go to Supabase Dashboard → Storage and for each bucket (`posts`, `stories`, `avatars`):

1. Click the bucket name
2. Go to "Policies" tab
3. Click "New policy" → "For SELECT"
4. Create policy with:
   - **Name:** Public read access
   - **Expression:** `true`
5. Click "Save"
6. Go to bucket settings (gear icon)
7. Enable "Make bucket public" toggle

Or run SQL in Supabase:

```sql
-- Make buckets public
UPDATE storage.buckets SET public = true WHERE id IN ('posts', 'stories', 'avatars', 'products');

-- Add public read policies
CREATE POLICY "Public read posts" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Public read stories" ON storage.objects
FOR SELECT USING (bucket_id = 'stories');

CREATE POLICY "Public read avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### 2. Image URL Not Persisted in Database

**Problem:** Image URL generated from `getPublicUrl()` is not properly saved to database.

**Solution:**

Check the `posts` table schema. You should have ONE of:
- `image_url` (TEXT field)
- `media_urls` (JSONB array field)

The field name must be consistent. In `src/hooks/useFeedPosts.ts`, ensure:

```typescript
// Select the correct image field
const { data: postsData } = await supabase
  .from('posts')
  .select(`
    id,
    content,
    image_url,        // ← Make sure this matches your schema
    media_urls,
    user_id,
    created_at,
    profiles:user_id(...)
  `);
```

**Update CreatePostFlow.tsx:**

```typescript
// Ensure image URL is properly saved
const { error: insertError } = await supabase
  .from('posts')
  .insert([{
    user_id: user.id,
    content: postContent,
    image_url: publicUrl,  // ← Must match your schema field name
    created_at: new Date().toISOString()
  }]);
```

### 3. Incorrect Cache-Control Header

**Problem:** Browser or CDN caching may cause stale image URLs.

**Solution:**

Update `CreatePostFlow.tsx` to use proper cache control:

```typescript
const { error: uploadError } = await supabase.storage
  .from('posts')
  .upload(path, file, {
    upsert: false,
    cacheControl: '86400',  // 24 hours (was 3600 = 1 hour)
    contentType: file.type,
  });
```

### 4. Image Field Inconsistency Across Components

**Problem:** Different components expect different field names (`image_url`, `image`, `media_urls`, etc.).

**Solution:**

Use the image storage helper to normalize:

```typescript
import { normalizeImageField } from '@/utils/imageStorageHelper';

// In your component
const imageUrl = normalizeImageField(post);
```

Or update display components:

```typescript
// PostCard.tsx
const { post } = props;
const imageUrl = post.image_url || post.image_urls?.[0] || post.media_urls?.[0] || null;

{imageUrl && (
  <img 
    src={imageUrl} 
    alt="Post image"
    loading="lazy"
    className="w-full object-cover"
  />
)}
```

## Step-by-Step Fix

### Step 1: Make Storage Bucket Public
```bash
# Use Supabase Dashboard or run SQL above
```

### Step 2: Standardize Database Schema
Decide on ONE image field name and update all code to use it.

```sql
-- Option A: Use image_url field (recommended for single images)
ALTER TABLE posts ADD COLUMN image_url TEXT;

-- Option B: Use media_urls field (recommended for multiple images)
ALTER TABLE posts ADD COLUMN media_urls JSONB DEFAULT '[]'::jsonb;
```

### Step 3: Update Upload Code
In `src/components/feed/CreatePostFlow.tsx`:

```typescript
const { data } = supabase.storage
  .from('posts')
  .getPublicUrl(path);

// Store in database with correct field name
await supabase
  .from('posts')
  .insert([{
    user_id: user.id,
    content: content,
    image_url: data.publicUrl,  // ← Correct field
    created_at: new Date().toISOString()
  }]);
```

### Step 4: Update Fetch Code
In `src/hooks/useFeedPosts.ts`:

```typescript
const { data: postsData } = await supabase
  .from('posts')
  .select('*, profiles:user_id(...)')
  .order('created_at', { ascending: false });

// Return posts with normalized image URL
return postsData.map(post => ({
  ...post,
  image_url: post.image_url,  // Explicitly include
}));
```

### Step 5: Update Display Components
Update all feed components to use consistent field:

```typescript
// src/components/feed/PostCard.tsx
{post.image_url && (
  <img 
    src={post.image_url}
    alt="Post"
    loading="lazy"
    className="w-full object-cover rounded"
  />
)}

// src/components/feed/UnifiedFeedItemCard.tsx
{item.content?.image_url && (
  <img
    src={item.content.image_url}
    alt="Post"
    loading="lazy"
  />
)}
```

## Verification

1. **Create a post with image:**
   - Go to Feed
   - Create new post with image
   - Submit

2. **Verify image appears:**
   - Image should show immediately
   - Check browser DevTools → Network → check image request
   - Status should be 200, not 404/403

3. **Refresh page:**
   - Image should still be visible
   - If gone, check:
     - Image file exists in Supabase Storage
     - image_url field has correct URL in database
     - Storage bucket is public

4. **Check Supabase Storage:**
   - Go to Storage → posts bucket
   - Should see uploaded files
   - Click file → "Get URL"
   - Should return public URL

## Troubleshooting

**Issue: 403 Forbidden errors on image load**
- Storage bucket is not public
- Solution: Make bucket public (see Step 1)

**Issue: 404 Not Found errors**
- Image file doesn't exist in storage
- Solution: Check file paths in Supabase Storage → posts bucket

**Issue: Image shows then disappears**
- Cache issue or URL changing
- Solution: Increase cacheControl to 604800 (7 days)

**Issue: Different image fields in different places**
- Code inconsistency
- Solution: Use `normalizeImageField()` utility or standardize to one field

## Production Checklist

- [ ] Storage bucket is PUBLIC
- [ ] RLS policies allow public read access
- [ ] Image URLs stored in ONE consistent database field
- [ ] Upload sets correct cacheControl (86400+)
- [ ] All display components use same image field
- [ ] Test image upload → refresh → image still shows
- [ ] Monitor Supabase logs for storage errors

## Using the Image Helper Utility

After fixes above, use the new utility for uploads:

```typescript
import { uploadImage, normalizeImageField, validateImageUrl } from '@/utils/imageStorageHelper';

// Upload
const result = await uploadImage('posts', file, userId);
if (result.success) {
  const imageUrl = result.publicUrl;
  // Save to database
}

// Normalize when reading
const imageUrl = normalizeImageField(post);

// Validate
const isValid = await validateImageUrl(imageUrl);
```
