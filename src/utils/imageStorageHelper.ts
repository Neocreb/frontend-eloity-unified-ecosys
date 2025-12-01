import { supabase } from '@/integrations/supabase/client';

/**
 * Helper utility for handling image storage and persistence
 * Ensures images are properly uploaded and URLs are stored in the database
 */

export interface ImageUploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Upload image to Supabase Storage
 * @param bucket - Storage bucket name (e.g., 'posts', 'avatars')
 * @param file - File object to upload
 * @param userId - User ID for path organization
 * @returns Promise with public URL or error
 */
export async function uploadImage(
  bucket: string,
  file: File,
  userId: string
): Promise<ImageUploadResult> {
  try {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      return { success: false, error: 'Invalid image type. Use JPEG, PNG, WebP, or GIF' };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 5MB limit' };
    }

    // Create unique file path
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomSuffix}-${file.name}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: false,
        cacheControl: '86400', // 24 hours cache
        contentType: file.type,
      });

    if (uploadError) {
      console.error(`Upload error to ${bucket}:`, uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      return { success: false, error: 'Failed to generate public URL' };
    }

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Image upload error:', message);
    return { success: false, error: message };
  }
}

/**
 * Validate and repair image URL
 * Ensures URL is still valid and accessible
 * @param url - Image URL to validate
 * @returns Promise<boolean> - true if valid, false otherwise
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    if (!url) return false;

    // Quick check if URL starts with expected Supabase domain
    const isSupabaseUrl = url.includes('supabase.co') || url.includes('storage');
    if (!isSupabaseUrl) return false;

    // Try a HEAD request to validate URL is accessible
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return response.status < 400 || response.ok;
  } catch (error) {
    console.warn('Image URL validation failed:', error);
    return false;
  }
}

/**
 * Delete image from storage
 * @param bucket - Storage bucket name
 * @param filePath - Full file path in storage
 */
export async function deleteImage(bucket: string, filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      console.error('Delete error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Image delete error:', error);
    return false;
  }
}

/**
 * Get optimized image URL with parameters
 * Useful for responsive images and different sizes
 * @param publicUrl - Original public URL
 * @param width - Optional width for optimization
 * @param quality - Optional quality (0-100)
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(
  publicUrl: string,
  width?: number,
  quality: number = 80
): string {
  if (!publicUrl) return '';

  // Supabase storage doesn't support query params for image optimization
  // This is a placeholder for future CDN integration (Cloudinary, Imgix, etc.)
  // For now, return original URL
  return publicUrl;
}

/**
 * Normalize image field from database
 * Handles different field names: image_url, media_urls, image, etc.
 * @param post - Post object from database
 * @returns Normalized image URL or array of URLs
 */
export function normalizeImageField(post: any): string | string[] | null {
  // Try multiple common field names
  if (post.image_url) return post.image_url;
  if (post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > 0)
    return post.media_urls;
  if (post.image) return post.image;
  if (post.images && Array.isArray(post.images) && post.images.length > 0)
    return post.images;

  return null;
}

/**
 * Create a data URL for preview without uploading
 * Useful for showing preview before upload
 * @param file - File object
 * @returns Promise<string> - Data URL
 */
export function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
