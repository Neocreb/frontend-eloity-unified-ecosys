import { supabase } from '@/integrations/supabase/client';

export type ContentItem = {
  id: string;
  title: string;
  type: string;
  description: string;
  views: number;
  engagement: number;
  revenue: number;
  publishDate: string;
  platform: string;
  thumbnail: string;
  analytics: Record<string, any>;
  likes?: number;
  comments?: number;
  duration?: string;
  price?: number;
  sales?: number;
};

export type FetchContentParams = {
  types?: string[];
  range?: string; // '7d' | '30d' | '90d' | '1y' | 'all'
  sort?: string; // 'recent' | 'views' | 'engagement' | 'revenue'
  search?: string;
  page?: number;
  pageSize?: number;
  cursor?: string | null; // ISO date string for cursor-based pagination
};

// Helper to map range to cutoff date
const rangeToDate = (range?: string) => {
  if (!range || range === 'all') return null;
  const now = new Date();
  const map: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  const days = map[range];
  if (!days) return null;
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
};

// Format numbers for display
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Format currency for display
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Transform post data to content item format
const transformPostData = (post: any): ContentItem => {
  const likesCount = post.post_likes?.length || 0;
  const commentsCount = post.post_comments?.length || 0;
  
  return {
    id: post.id,
    title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
    type: 'Post',
    description: post.content,
    views: post.view_count || 0,
    engagement: likesCount + commentsCount,
    revenue: 0, // Posts don't directly generate revenue
    publishDate: post.created_at,
    platform: 'Feed & Social',
    thumbnail: post.image_url || '/api/placeholder/300/200',
    analytics: {
      likes: likesCount,
      comments: commentsCount,
      shares: 0, // Would need to add shares tracking
    },
    likes: likesCount,
    comments: commentsCount
  };
};

// Transform video data to content item format
const transformVideoData = (video: any): ContentItem => {
  return {
    id: video.id,
    title: video.title,
    type: 'Video',
    description: video.description || '',
    views: video.views_count || 0,
    engagement: (video.likes_count || 0) + (video.comments_count || 0),
    revenue: 0, // Would need to calculate actual revenue
    publishDate: video.created_at,
    platform: 'Video',
    thumbnail: video.thumbnail || '/api/placeholder/300/200',
    analytics: {
      likes: video.likes_count || 0,
      comments: video.comments_count || 0,
      shares: video.share_count || 0,
      duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00',
      watchTime: '0%', // Would need actual watch time data
    },
    likes: video.likes_count || 0,
    comments: video.comments_count || 0,
    duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00'
  };
};

// Transform product data to content item format
const transformProductData = (product: any): ContentItem => {
  const revenue = (product.price || 0) * (product.total_sales || 0);
  
  return {
    id: product.id,
    title: product.name,
    type: 'Product',
    description: product.description,
    views: product.view_count || 0,
    engagement: product.total_reviews || 0,
    revenue: revenue,
    publishDate: product.created_at,
    platform: 'Marketplace',
    thumbnail: product.thumbnail_image || product.images?.[0] || '/api/placeholder/300/200',
    analytics: {
      sales: product.total_sales || 0,
      rating: product.average_rating || 0,
      price: product.price || 0,
      stock: product.stock_quantity || 0,
    },
    price: product.price || 0,
    sales: product.total_sales || 0
  };
};

// Fetch posts from the posts table
const fetchPosts = async (params: FetchContentParams) => {
  try {
    const cutoff = rangeToDate(params.range);
    
    let query = supabase
      .from('posts')
      .select('id, content, image_url, view_count, created_at, post_likes(id), post_comments(id)');
    
    if (cutoff) {
      query = query.gte('created_at', cutoff);
    }
    
    if (params.search && params.search.trim()) {
      query = query.ilike('content', `%${params.search}%`);
    }
    
    // Apply sorting
    switch (params.sort) {
      case 'views':
        query = query.order('view_count', { ascending: false });
        break;
      case 'engagement':
        // For engagement, we'd need to order by a computed value, but for now we'll order by created_at
        query = query.order('created_at', { ascending: false });
        break;
      case 'revenue':
        // Posts don't generate direct revenue, so we'll order by views
        query = query.order('view_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data.map(transformPostData);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

// Fetch videos from the videos table
const fetchVideos = async (params: FetchContentParams) => {
  try {
    const cutoff = rangeToDate(params.range);
    
    let query = supabase
      .from('videos')
      .select('id, title, description, thumbnail, views_count, likes_count, comments_count, share_count, duration, created_at');
    
    if (cutoff) {
      query = query.gte('created_at', cutoff);
    }
    
    if (params.search && params.search.trim()) {
      query = query.ilike('title', `%${params.search}%`).ilike('description', `%${params.search}%`);
    }
    
    // Apply sorting
    switch (params.sort) {
      case 'views':
        query = query.order('views_count', { ascending: false });
        break;
      case 'engagement':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'revenue':
        // Videos don't generate direct revenue in this schema, so we'll order by views
        query = query.order('views_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data.map(transformVideoData);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

// Fetch products from the products table
const fetchProducts = async (params: FetchContentParams) => {
  try {
    const cutoff = rangeToDate(params.range);
    
    let query = supabase
      .from('products')
      .select('id, name, description, thumbnail_image, images, price, total_sales, average_rating, view_count, created_at, stock_quantity');
    
    if (cutoff) {
      query = query.gte('created_at', cutoff);
    }
    
    if (params.search && params.search.trim()) {
      query = query.ilike('name', `%${params.search}%`).ilike('description', `%${params.search}%`);
    }
    
    // Apply sorting
    switch (params.sort) {
      case 'views':
        query = query.order('view_count', { ascending: false });
        break;
      case 'engagement':
        query = query.order('total_reviews', { ascending: false });
        break;
      case 'revenue':
        // Order by revenue (price * sales)
        query = query.order('total_sales', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data.map(transformProductData);
  } catch (error) {
    console.error('Error fetching products:', error instanceof Error ? error.message : String(error));
    return [];
  }
};

// Enhanced content fetching function that combines data from multiple sources
export const fetchEnhancedContentPage = async (params: FetchContentParams) => {
  const {
    types = [],
    range = '30d',
    sort = 'recent',
    search = '',
    page = 1,
    pageSize = 10
  } = params || {};

  try {
    // Fetch content from different sources based on requested types
    const allContent: ContentItem[] = [];
    
    // If no specific types are requested or 'post' is requested, fetch posts
    if (types.length === 0 || types.includes('post')) {
      const posts = await fetchPosts({ ...params, types: ['post'] });
      allContent.push(...posts);
    }
    
    // If no specific types are requested or 'video' is requested, fetch videos
    if (types.length === 0 || types.includes('video')) {
      const videos = await fetchVideos({ ...params, types: ['video'] });
      allContent.push(...videos);
    }
    
    // If no specific types are requested or 'product' is requested, fetch products
    if (types.length === 0 || types.includes('product')) {
      const products = await fetchProducts({ ...params, types: ['product'] });
      allContent.push(...products);
    }
    
    // Sort all content based on the requested sort order
    let sortedContent = [...allContent];
    
    switch (sort) {
      case 'views':
        sortedContent.sort((a, b) => b.views - a.views);
        break;
      case 'engagement':
        sortedContent.sort((a, b) => b.engagement - a.engagement);
        break;
      case 'revenue':
        sortedContent.sort((a, b) => b.revenue - a.revenue);
        break;
      default:
        // Sort by date (most recent first)
        sortedContent.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    }
    
    // Apply pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedContent = sortedContent.slice(start, end);
    
    return { 
      data: paginatedContent, 
      total: sortedContent.length, 
      nextCursor: null 
    };
  } catch (err) {
    console.error('fetchEnhancedContentPage error', err);
    throw err;
  }
};

// Export the original function for backward compatibility
export { fetchContentPageSupabase } from './contentService';
