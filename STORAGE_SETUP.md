# Supabase Storage Setup for Eloity Platform

This document describes the storage bucket configuration for the Eloity platform, which handles various types of digital content across multiple modules.

## Bucket Configuration

### Public Buckets (Accessible to everyone)

1. **avatars** - User profile pictures and avatars
   - Public read access
   - Authenticated users can upload
   - Users can update/delete their own avatars

2. **posts** - Social media posts images and videos
   - Public read access
   - Authenticated users can upload
   - Users can update/delete their own posts

3. **stories** - Instagram-style stories content
   - Public read access
   - Authenticated users can upload
   - Users can update/delete their own stories

4. **products** - E-commerce product images and media
   - Public read access
   - Authenticated users can upload
   - Users can update/delete their own products

5. **portfolio** - Freelancer portfolio items and work samples
   - Public read access
   - Authenticated users can upload
   - Users can update/delete their own portfolio items

### Private Buckets (Accessible only to owners)

1. **documents** - Private documents like contracts, invoices, and legal documents
   - Owner-only access
   - Used for sensitive business documents

2. **chat-attachments** - Private chat attachments and files
   - Owner-only access
   - Secure storage for private conversations

3. **verification** - User verification documents (ID, certificates, etc.)
   - Owner-only access
   - Secure storage for sensitive identity documents

4. **admin-assets** - Private admin panel assets and reports
   - Owner-only access
   - Secure storage for administrative content

5. **temp** - Temporary files and uploads
   - Owner-only access
   - Short-term storage for processing files

## Security Policies

### Public Buckets
Public buckets follow this security model:
- **Read**: Available to everyone (public)
- **Write**: Authenticated users only
- **Update/Delete**: Only the owner can modify their content

### Private Buckets
Private buckets follow this security model:
- **All Operations**: Only the owner can access content

## File Size and Type Limits

All buckets have the following limits:
- Maximum file size: 50MB
- Allowed file types:
  - Images (jpg, png, gif, etc.)
  - Videos (mp4, mov, avi, etc.)
  - Audio (mp3, wav, etc.)
  - Documents (pdf, doc, docx, xls, xlsx, ppt, pptx)
  - Text files

## Implementation Files

1. **Migration Script**: `supabase/migrations/20251026153000_create_storage_buckets.sql`
   - Creates all buckets and sets up security policies
   - Can be applied using `supabase migration up`

2. **Setup Script**: `scripts/setup-storage-buckets.js`
   - Alternative Node.js script to create buckets programmatically
   - Can be run with `node scripts/setup-storage-buckets.js`

## Usage Examples

### Uploading to a Public Bucket
```javascript
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload(`public/${user.id}/avatar.png`, file);
```

### Uploading to a Private Bucket
```javascript
const { data, error } = await supabase
  .storage
  .from('documents')
  .upload(`${user.id}/contract.pdf`, file);
```

### Retrieving Public Content
```javascript
const { data } = supabase
  .storage
  .from('posts')
  .getPublicUrl('public/post-image.jpg');
```

### Retrieving Private Content
```javascript
const { data } = await supabase
  .storage
  .from('documents')
  .createSignedUrl('user-id/contract.pdf', 60); // URL valid for 60 seconds
```

## Maintenance

### Adding New Buckets
1. Add the bucket definition to the migration script
2. Create appropriate security policies
3. Apply the migration with `supabase migration up`

### Modifying Existing Buckets
1. Update the bucket configuration in the migration script
2. Apply the migration with `supabase migration up`

### Monitoring Storage Usage
Use the Supabase dashboard to monitor storage usage and manage content.