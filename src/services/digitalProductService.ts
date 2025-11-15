import { supabase } from "@/integrations/supabase/client";

export class DigitalProductService {
  // Upload a digital product file (PDF, DOCX, etc.)
  static async uploadDigitalProductFile(file: File, userId: string): Promise<{ url: string; error: string | null }> {
    try {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
        'image/jpeg',
        'image/png',
        'image/gif',
        'audio/mpeg',
        'audio/wav',
        'video/mp4',
        'video/quicktime'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        return { 
          url: '', 
          error: 'Unsupported file type. Please upload a valid file format (PDF, DOC, DOCX, etc.)' 
        };
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        return { 
          url: '', 
          error: 'File size exceeds 100MB limit. Please upload a smaller file.' 
        };
      }
      
      // Upload file to Supabase storage
      const bucket = 'digital-products';
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: false,
        cacheControl: '3600',
        contentType: file.type,
      });
      
      if (uploadError) {
        console.error("Error uploading digital product file:", uploadError);
        return { 
          url: '', 
          error: 'Failed to upload file. Please try again.' 
        };
      }
      
      // Get public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error("Error uploading digital product file:", error);
      return { 
        url: '', 
        error: 'An unexpected error occurred. Please try again.' 
      };
    }
  }
  
  // Upload a book cover image
  static async uploadBookCover(file: File, userId: string): Promise<{ url: string; error: string | null }> {
    try {
      // Validate file type (images only)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      
      if (!allowedTypes.includes(file.type)) {
        return { 
          url: '', 
          error: 'Unsupported file type. Please upload a valid image format (JPEG, PNG, GIF)' 
        };
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return { 
          url: '', 
          error: 'File size exceeds 10MB limit. Please upload a smaller image.' 
        };
      }
      
      // Upload file to Supabase storage
      const bucket = 'book-covers';
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: false,
        cacheControl: '3600',
        contentType: file.type,
      });
      
      if (uploadError) {
        console.error("Error uploading book cover:", uploadError);
        return { 
          url: '', 
          error: 'Failed to upload cover image. Please try again.' 
        };
      }
      
      // Get public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error("Error uploading book cover:", error);
      return { 
        url: '', 
        error: 'An unexpected error occurred. Please try again.' 
      };
    }
  }
  
  // Get file information
  static async getFileInfo(url: string): Promise<{ name: string; size: number; type: string } | null> {
    try {
      // In a real implementation, we would fetch file metadata from storage
      // For now, we'll parse information from the URL
      const fileName = url.split('/').pop() || 'Unknown file';
      return {
        name: decodeURIComponent(fileName),
        size: 0, // Would need to fetch actual size from storage
        type: url.split('.').pop() || 'unknown'
      };
    } catch (error) {
      console.error("Error getting file info:", error);
      return null;
    }
  }
  
  // Generate download link with expiration (for secure downloads)
  static async generateSecureDownloadLink(productId: string, userId: string): Promise<{ url: string; error: string | null }> {
    try {
      // In a real implementation, we would generate a signed URL with expiration
      // For now, we'll return the public URL
      // This would typically involve server-side logic to verify purchase
      return { url: '', error: 'Secure download not implemented yet' };
    } catch (error) {
      console.error("Error generating secure download link:", error);
      return { url: '', error: 'Failed to generate download link' };
    }
  }
}

export default DigitalProductService;