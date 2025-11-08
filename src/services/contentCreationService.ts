import { supabase } from '@/integrations/supabase/client';

export interface CreatePostData {
  content: string;
  type?: 'text' | 'image' | 'video';
  media_urls?: string[];
  privacy?: 'public' | 'private' | 'friends';
}

export interface CreateVideoData {
  title: string;
  description: string;
  file: File;
  category?: string;
  privacy?: 'public' | 'private' | 'unlisted';
  monetization?: boolean;
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  currency?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  condition?: string;
  stock_quantity?: number;
  images?: string[];
  specifications?: Record<string, any>;
  tags?: string[];
  weight?: number;
  dimensions?: Record<string, number>;
  shipping_info?: Record<string, any>;
  return_policy?: string;
  warranty?: string;
  is_digital?: boolean;
}

export interface CreateLiveData {
  title: string;
  description: string;
  category?: string;
  quality?: string;
  isPrivate?: boolean;
  bitrate?: number;
  framerate?: number;
}

export class ContentCreationService {
  // Create a new post
  async createPost(postData: CreatePostData) {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postData.content,
          type: postData.type || 'text',
          media_urls: postData.media_urls || [],
          privacy: postData.privacy || 'public'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Upload and create a new video
  async createVideo(videoData: CreateVideoData) {
    try {
      const formData = new FormData();
      formData.append('video', videoData.file);
      formData.append('title', videoData.title);
      formData.append('description', videoData.description);
      if (videoData.category) formData.append('category', videoData.category);
      if (videoData.privacy) formData.append('privacy', videoData.privacy);
      if (videoData.monetization !== undefined) formData.append('monetization', String(videoData.monetization));

      const response = await fetch('/api/video/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to upload video: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  // Create a new product
  async createProduct(productData: CreateProductData) {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          currency: productData.currency || 'USD',
          category: productData.category,
          subcategory: productData.subcategory,
          brand: productData.brand,
          condition: productData.condition,
          stock_quantity: productData.stock_quantity,
          images: productData.images || [],
          specifications: productData.specifications || {},
          tags: productData.tags || [],
          weight: productData.weight,
          dimensions: productData.dimensions || {},
          shipping_info: productData.shipping_info || {},
          return_policy: productData.return_policy,
          warranty: productData.warranty,
          is_digital: productData.is_digital || false
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create product: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Create a live stream
  async createLiveStream(liveData: CreateLiveData) {
    try {
      const response = await fetch('/api/video/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: liveData.title,
          description: liveData.description,
          category: liveData.category || 'general',
          quality: liveData.quality || '720p',
          isPrivate: liveData.isPrivate || false,
          bitrate: liveData.bitrate || 2500,
          framerate: liveData.framerate || 30
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create live stream: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating live stream:', error);
      throw error;
    }
  }

  // Generic content creation method
  async createContent(type: 'post' | 'video' | 'product' | 'live', data: any) {
    switch (type) {
      case 'post':
        return this.createPost(data as CreatePostData);
      case 'video':
        return this.createVideo(data as CreateVideoData);
      case 'product':
        return this.createProduct(data as CreateProductData);
      case 'live':
        return this.createLiveStream(data as CreateLiveData);
      default:
        throw new Error(`Unsupported content type: ${type}`);
    }
  }
}

export const contentCreationService = new ContentCreationService();