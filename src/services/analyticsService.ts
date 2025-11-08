import { supabase } from '@/integrations/supabase/client';

// Utility functions for formatting
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Types for our analytics data
export interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
  description?: string;
}

export interface FeatureAnalytics {
  name: string;
  icon: React.ElementType;
  color: string;
  metrics: MetricCard[];
  growth: number;
  active: boolean;
}

export interface ContentAnalytics {
  id: string;
  title: string;
  type: string;
  views: number;
  engagement: number;
  revenue: number;
  description: string;
  publishDate: string;
  platform: string;
  thumbnail: string;
  analytics: Record<string, any>;
}

export interface DetailedMetric {
  name: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  description: string;
}

export interface DetailedCategory {
  category: string;
  metrics: DetailedMetric[];
}

// Data transformation utilities
export const transformPostData = (posts: any[], contentAnalytics: any[]) => {
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.post_likes?.length || 0), 0);
  const totalComments = posts.reduce((sum: number, post: any) => sum + (post.post_comments?.length || 0), 0);
  
  // Calculate growth (simplified - in a real app, you'd compare to previous period)
  const growth = totalPosts > 0 ? Math.min(100, Math.round((totalLikes / totalPosts) * 10)) : 0;
  
  return {
    growth,
    metrics: [
      { 
        title: "Total Posts", 
        value: formatNumber(totalPosts), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-blue-600" 
      },
      { 
        title: "Engagement Rate", 
        value: totalPosts > 0 ? `${((totalLikes + totalComments) / totalPosts).toFixed(1)}%` : "0%", 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-pink-600" 
      },
      { 
        title: "Likes", 
        value: formatNumber(totalLikes), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-green-600" 
      },
      { 
        title: "Comments", 
        value: formatNumber(totalComments), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-purple-600" 
      }
    ]
  };
};

export const transformVideoData = (videos: any[], videoAnalytics: any[]) => {
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum: number, video: any) => sum + (video.views_count || 0), 0);
  const totalLikes = videos.reduce((sum: number, video: any) => sum + (video.likes_count || 0), 0);
  const totalComments = videos.reduce((sum: number, video: any) => sum + (video.comments_count || 0), 0);
  
  // Calculate growth (simplified)
  const growth = totalVideos > 0 ? Math.min(100, Math.round((totalViews / totalVideos) / 1000)) : 0;
  
  return {
    growth,
    metrics: [
      { 
        title: "Videos Created", 
        value: formatNumber(totalVideos), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-red-600" 
      },
      { 
        title: "Total Views", 
        value: formatNumber(totalViews), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-blue-600" 
      },
      { 
        title: "Likes", 
        value: formatNumber(totalLikes), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-green-600" 
      },
      { 
        title: "Comments", 
        value: formatNumber(totalComments), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-orange-600" 
      }
    ]
  };
};

export const transformProductData = (products: any[], productAnalytics: any[]) => {
  const totalProducts = products.length;
  const totalRevenue = products.reduce((sum: number, product: any) => sum + (product.price * (product.total_sales || 0)), 0);
  const totalSales = products.reduce((sum: number, product: any) => sum + (product.total_sales || 0), 0);
  const avgRating = totalProducts > 0 ? 
    (products.reduce((sum: number, product: any) => sum + (parseFloat(product.average_rating) || 0), 0) / totalProducts).toFixed(1) : "0";
  
  // Calculate growth (simplified)
  const growth = totalProducts > 0 ? Math.min(100, Math.round((totalSales / totalProducts) * 5)) : 0;
  
  return {
    growth,
    metrics: [
      { 
        title: "Products Listed", 
        value: formatNumber(totalProducts), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-green-600" 
      },
      { 
        title: "Total Revenue", 
        value: formatCurrency(totalRevenue), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-emerald-600" 
      },
      { 
        title: "Units Sold", 
        value: formatNumber(totalSales), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-blue-600" 
      },
      { 
        title: "Avg Rating", 
        value: avgRating, 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-yellow-600" 
      }
    ]
  };
};

export const transformEngagementData = (chatMessages: any[], postComments: any[], videoComments: any[]) => {
  const totalMessages = chatMessages ? chatMessages.length : 0;
  const totalComments = (postComments?.length || 0) + (videoComments?.length || 0);
  
  // Calculate growth (simplified)
  const growth = totalMessages > 0 ? Math.min(100, Math.round((totalComments / totalMessages) * 100)) : 0;
  
  return {
    growth,
    metrics: [
      { 
        title: "Messages Sent", 
        value: formatNumber(totalMessages), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-blue-600" 
      },
      { 
        title: "Comments", 
        value: formatNumber(totalComments), 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-green-600" 
      },
      { 
        title: "Engagement Rate", 
        value: totalMessages > 0 ? `${Math.min(100, Math.round((totalComments / totalMessages) * 100))}%` : "0%", 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-emerald-600" 
      },
      { 
        title: "Active Chats", 
        value: totalMessages > 0 ? formatNumber(Math.round(totalMessages / 10)) : "0", 
        change: growth, 
        trend: growth > 0 ? "up" : "neutral", 
        icon: () => null, 
        color: "text-purple-600" 
      }
    ]
  };
};

export const transformContentAnalytics = (contentItems: any[]): ContentAnalytics[] => {
  return contentItems.map(item => ({
    id: item.id,
    title: item.title,
    type: item.type,
    views: item.views,
    engagement: parseFloat(item.engagement) || 0,
    revenue: item.revenue,
    description: `Performance metrics for ${item.title}`,
    publishDate: item.publish_date?.toISOString() || new Date().toISOString(),
    platform: item.platform,
    thumbnail: item.thumbnail || '/api/placeholder/300/200',
    analytics: item.analytics || {}
  }));
};

// Fetch real analytics data for all platform features
export const fetchPlatformAnalytics = async (): Promise<FeatureAnalytics[]> => {
  try {
    // Fetch data from various tables
    const [postsData, videosData, productsData, freelancesData, financesData, engagementsData] = await Promise.all([
      fetchPostAnalytics(),
      fetchVideoAnalytics(),
      fetchProductAnalytics(),
      fetchFreelanceAnalytics(),
      fetchFinanceAnalytics(),
      fetchEngagementAnalytics()
    ]);

    return [
      {
        name: "Feed & Social",
        icon: () => null, // Will be replaced by actual icon component
        color: "bg-blue-500",
        growth: postsData.growth,
        active: true,
        metrics: postsData.metrics as MetricCard[]
      },
      {
        name: "Video",
        icon: () => null, // Will be replaced by actual icon component
        color: "bg-red-500",
        growth: videosData.growth,
        active: true,
        metrics: videosData.metrics as MetricCard[]
      },
      {
        name: "Marketplace",
        icon: () => null, // Will be replaced by actual icon component
        color: "bg-green-500",
        growth: productsData.growth,
        active: true,
        metrics: productsData.metrics as MetricCard[]
      },
      {
        name: "Freelance",
        icon: () => null, // Will be replaced by actual icon component
        color: "bg-orange-500",
        growth: freelancesData.growth,
        active: true,
        metrics: freelancesData.metrics as MetricCard[]
      },
      {
        name: "Finance",
        icon: () => null, // Will be replaced by actual icon component
        color: "bg-yellow-500",
        growth: financesData.growth,
        active: true,
        metrics: financesData.metrics as MetricCard[]
      },
      {
        name: "Engagement",
        icon: () => null, // Will be replaced by actual icon component
        color: "bg-purple-500",
        growth: engagementsData.growth,
        active: true,
        metrics: engagementsData.metrics as MetricCard[]
      },
      {
        name: "Live Streaming",
        icon: () => null, // Will be replaced by actual icon component
        color: "bg-pink-500",
        growth: 0,
        active: false,
        metrics: [
          { title: "Live Sessions", value: "0", change: 0, trend: "neutral" as const, icon: () => null, color: "text-pink-600" },
          { title: "Peak Viewers", value: "0", change: 0, trend: "neutral" as const, icon: () => null, color: "text-blue-600" },
          { title: "Stream Time", value: "0h", change: 0, trend: "neutral" as const, icon: () => null, color: "text-green-600" },
          { title: "Super Chats", value: "$0", change: 0, trend: "neutral" as const, icon: () => null, color: "text-yellow-600" },
        ]
      },
      {
        name: "Events & Calendar",
        icon: () => null, // Will be replaced by actual icon component
        color: "bg-indigo-500",
        growth: 0,
        active: true,
        metrics: [
          { title: "Events Created", value: "0", change: 0, trend: "neutral" as const, icon: () => null, color: "text-indigo-600" },
          { title: "Attendees", value: "0", change: 0, trend: "neutral" as const, icon: () => null, color: "text-blue-600" },
          { title: "Event Revenue", value: "$0", change: 0, trend: "neutral" as const, icon: () => null, color: "text-green-600" },
          { title: "Avg Rating", value: "0", change: 0, trend: "neutral" as const, icon: () => null, color: "text-yellow-600" },
        ]
      }
    ];
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    throw error;
  }
};

// Fetch post analytics data
const fetchPostAnalytics = async () => {
  try {
    // Get post counts and engagement data
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, created_at, post_likes(id), post_comments(id)');
    
    if (postsError) throw postsError;
    
    // Get content analytics for posts
    const { data: contentAnalytics, error: analyticsError } = await supabase
      .from('content_analytics')
      .select('*')
      .eq('type', 'Post');
    
    if (analyticsError) throw analyticsError;
    
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.post_likes?.length || 0), 0);
    const totalComments = posts.reduce((sum: number, post: any) => sum + (post.post_comments?.length || 0), 0);
    
    // Calculate growth (simplified - in a real app, you'd compare to previous period)
    const growth = totalPosts > 0 ? Math.min(100, Math.round((totalLikes / totalPosts) * 10)) : 0;
    
    return {
      growth,
      metrics: [
        { 
          title: "Total Posts", 
          value: formatNumber(totalPosts), 
          change: growth, 
          trend: growth > 0 ? "up" as const : "neutral" as const, 
          icon: () => null, 
          color: "text-blue-600" 
        },
        { 
          title: "Engagement Rate", 
          value: totalPosts > 0 ? `${((totalLikes + totalComments) / totalPosts).toFixed(1)}%` : "0%", 
          change: growth, 
          trend: growth > 0 ? "up" as const : "neutral" as const, 
          icon: () => null, 
          color: "text-pink-600" 
        },
        { 
          title: "Likes", 
          value: formatNumber(totalLikes), 
          change: growth, 
          trend: growth > 0 ? "up" as const : "neutral" as const, 
          icon: () => null, 
          color: "text-green-600" 
        },
        { 
          title: "Comments", 
          value: formatNumber(totalComments), 
          change: growth, 
          trend: growth > 0 ? "up" as const : "neutral" as const, 
          icon: () => null, 
          color: "text-purple-600" 
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching post analytics:', error);
    return {
      growth: 0,
      metrics: [
        { title: "Total Posts", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-blue-600" },
        { title: "Engagement Rate", value: "0%", change: 0, trend: "neutral", icon: () => null, color: "text-pink-600" },
        { title: "Likes", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" },
        { title: "Comments", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-purple-600" }
      ]
    };
  }
};

// Fetch video analytics data
const fetchVideoAnalytics = async () => {
  try {
    // Get video data
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, title, views_count, likes_count, comments_count, created_at');
    
    if (videosError) throw videosError;
    
    // Get video analytics data
    const { data: videoAnalytics, error: analyticsError } = await supabase
      .from('video_analytics')
      .select('*');
    
    if (analyticsError) throw analyticsError;
    
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum: number, video: any) => sum + (video.views_count || 0), 0);
    const totalLikes = videos.reduce((sum: number, video: any) => sum + (video.likes_count || 0), 0);
    const totalComments = videos.reduce((sum: number, video: any) => sum + (video.comments_count || 0), 0);
    
    // Calculate growth (simplified)
    const growth = totalVideos > 0 ? Math.min(100, Math.round((totalViews / totalVideos) / 1000)) : 0;
    
    return {
      growth,
      metrics: [
        { 
          title: "Videos Created", 
          value: formatNumber(totalVideos), 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-red-600" 
        },
        { 
          title: "Total Views", 
          value: formatNumber(totalViews), 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-blue-600" 
        },
        { 
          title: "Likes", 
          value: formatNumber(totalLikes), 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-green-600" 
        },
        { 
          title: "Comments", 
          value: formatNumber(totalComments), 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-orange-600" 
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching video analytics:', error);
    return {
      growth: 0,
      metrics: [
        { title: "Videos Created", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-red-600" },
        { title: "Total Views", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-blue-600" },
        { title: "Likes", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" },
        { title: "Comments", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-orange-600" }
      ]
    };
  }
};

// Fetch product analytics data
const fetchProductAnalytics = async () => {
  try {
    // Get product data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, total_sales, total_reviews, average_rating');
    
    if (productsError) throw productsError;
    
    // Get product analytics data
    const { data: productAnalytics, error: analyticsError } = await supabase
      .from('product_analytics')
      .select('*');
    
    if (analyticsError) throw analyticsError;
    
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum: number, product: any) => sum + (product.price * (product.total_sales || 0)), 0);
    const totalSales = products.reduce((sum: number, product: any) => sum + (product.total_sales || 0), 0);
    const avgRating = totalProducts > 0 ? 
      (products.reduce((sum: number, product: any) => sum + (parseFloat(product.average_rating) || 0), 0) / totalProducts).toFixed(1) : "0";
    
    // Calculate growth (simplified)
    const growth = totalProducts > 0 ? Math.min(100, Math.round((totalSales / totalProducts) * 5)) : 0;
    
    return {
      growth,
      metrics: [
        { 
          title: "Products Listed", 
          value: formatNumber(totalProducts), 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-green-600" 
        },
        { 
          title: "Total Revenue", 
          value: formatCurrency(totalRevenue), 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-emerald-600" 
        },
        { 
          title: "Units Sold", 
          value: formatNumber(totalSales), 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-blue-600" 
        },
        { 
          title: "Avg Rating", 
          value: avgRating, 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-yellow-600" 
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    return {
      growth: 0,
      metrics: [
        { title: "Products Listed", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" },
        { title: "Total Revenue", value: "$0", change: 0, trend: "neutral", icon: () => null, color: "text-emerald-600" },
        { title: "Units Sold", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-blue-600" },
        { title: "Avg Rating", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-yellow-600" }
      ]
    };
  }
};

// Fetch freelance analytics data
const fetchFreelanceAnalytics = async () => {
  try {
    // For now, we'll use placeholder data since we don't have specific freelance tables
    // In a real implementation, you would query freelance-specific tables
    
    return {
      growth: 0,
      metrics: [
        { title: "Projects Completed", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" },
        { title: "Client Rating", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-yellow-600" },
        { title: "Earnings", value: "$0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" },
        { title: "Response Time", value: "0h", change: 0, trend: "neutral", icon: () => null, color: "text-blue-600" }
      ]
    };
  } catch (error) {
    console.error('Error fetching freelance analytics:', error);
    return {
      growth: 0,
      metrics: [
        { title: "Projects Completed", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" },
        { title: "Client Rating", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-yellow-600" },
        { title: "Earnings", value: "$0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" },
        { title: "Response Time", value: "0h", change: 0, trend: "neutral", icon: () => null, color: "text-blue-600" }
      ]
    };
  }
};

// Fetch finance analytics data
const fetchFinanceAnalytics = async () => {
  try {
    // For now, we'll use placeholder data since we don't have specific finance tables
    // In a real implementation, you would query finance-specific tables
    
    return {
      growth: 0,
      metrics: [
        { title: "Portfolio Value", value: "$0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" },
        { title: "Trading Volume", value: "$0", change: 0, trend: "neutral", icon: () => null, color: "text-blue-600" },
        { title: "Win Rate", value: "0%", change: 0, trend: "neutral", icon: () => null, color: "text-emerald-600" },
        { title: "P&L Today", value: "$0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" }
      ]
    };
  } catch (error) {
    console.error('Error fetching finance analytics:', error);
    return {
      growth: 0,
      metrics: [
        { title: "Portfolio Value", value: "$0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" },
        { title: "Trading Volume", value: "$0", change: 0, trend: "neutral", icon: () => null, color: "text-blue-600" },
        { title: "Win Rate", value: "0%", change: 0, trend: "neutral", icon: () => null, color: "text-emerald-600" },
        { title: "P&L Today", value: "$0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" }
      ]
    };
  }
};

// Fetch engagement analytics data
const fetchEngagementAnalytics = async () => {
  try {
    // Get chat data
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .select('id, content, created_at');
    
    if (chatError && chatError.message !== 'Relation not found') throw chatError;
    
    // Get comment data from multiple sources
    const { data: postComments, error: postCommentsError } = await supabase
      .from('post_comments')
      .select('id, content, created_at');
    
    if (postCommentsError) throw postCommentsError;
    
    const { data: videoComments, error: videoCommentsError } = await supabase
      .from('video_comments')
      .select('id, content, created_at');
    
    if (videoCommentsError) throw videoCommentsError;
    
    const totalMessages = chatMessages ? chatMessages.length : 0;
    const totalComments = (postComments?.length || 0) + (videoComments?.length || 0);
    
    // Calculate growth (simplified)
    const growth = totalMessages > 0 ? Math.min(100, Math.round((totalComments / totalMessages) * 100)) : 0;
    
    return {
      growth,
      metrics: [
        { 
          title: "Messages Sent", 
          value: formatNumber(totalMessages), 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-blue-600" 
        },
        { 
          title: "Comments", 
          value: formatNumber(totalComments), 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-green-600" 
        },
        { 
          title: "Engagement Rate", 
          value: totalMessages > 0 ? `${Math.min(100, Math.round((totalComments / totalMessages) * 100))}%` : "0%", 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-emerald-600" 
        },
        { 
          title: "Active Chats", 
          value: totalMessages > 0 ? formatNumber(Math.round(totalMessages / 10)) : "0", 
          change: growth, 
          trend: growth > 0 ? "up" : "neutral", 
          icon: () => null, 
          color: "text-purple-600" 
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching engagement analytics:', error);
    return {
      growth: 0,
      metrics: [
        { title: "Messages Sent", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-blue-600" },
        { title: "Comments", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-green-600" },
        { title: "Engagement Rate", value: "0%", change: 0, trend: "neutral", icon: () => null, color: "text-emerald-600" },
        { title: "Active Chats", value: "0", change: 0, trend: "neutral", icon: () => null, color: "text-purple-600" }
      ]
    };
  }
};

// Fetch top performing content
export const fetchTopPerformingContent = async (): Promise<ContentAnalytics[]> => {
  try {
    const { data, error } = await supabase
      .from('content_analytics')
      .select('*')
      .order('views', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      views: item.views,
      engagement: parseFloat(item.engagement) || 0,
      revenue: item.revenue,
      description: `Performance metrics for ${item.title}`,
      publishDate: item.publish_date?.toISOString() || new Date().toISOString(),
      platform: item.platform,
      thumbnail: item.thumbnail || '/api/placeholder/300/200',
      analytics: item.analytics || {}
    }));
  } catch (error) {
    console.error('Error fetching top performing content:', error);
    return [];
  }
};

// Fetch detailed analytics for a specific feature
export const fetchFeatureDetails = async (featureName: string): Promise<DetailedCategory[]> => {
  try {
    switch (featureName) {
      case "Feed & Social":
        return await fetchFeedSocialDetails();
      case "Video":
        return await fetchVideoDetails();
      case "Marketplace":
        return await fetchMarketplaceDetails();
      case "Freelance":
        return await fetchFreelanceDetails();
      case "Finance":
        return await fetchFinanceDetails();
      case "Engagement":
        return await fetchEngagementDetails();
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error fetching details for ${featureName}:`, error);
    return [];
  }
};

// Fetch detailed analytics for Feed & Social
const fetchFeedSocialDetails = async (): Promise<DetailedCategory[]> => {
  try {
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, created_at, post_likes(id), post_comments(id)');
    
    if (postsError) throw postsError;
    
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum: number, post: any) => sum + (post.post_likes?.length || 0), 0);
    const totalComments = posts.reduce((sum: number, post: any) => sum + (post.post_comments?.length || 0), 0);
    
    return [
      {
        category: "Content Performance",
        metrics: [
          { 
            name: "Total Posts", 
            value: formatNumber(totalPosts), 
            change: "+0%", 
            trend: "neutral", 
            description: "Posts published this period" 
          },
          { 
            name: "Avg Likes per Post", 
            value: totalPosts > 0 ? formatNumber(Math.round(totalLikes / totalPosts)) : "0", 
            change: "+0%", 
            trend: "neutral", 
            description: "Average likes per post" 
          },
          { 
            name: "Avg Comments per Post", 
            value: totalPosts > 0 ? formatNumber(Math.round(totalComments / totalPosts)) : "0", 
            change: "+0%", 
            trend: "neutral", 
            description: "Average comments per post" 
          },
          { 
            name: "Engagement Rate", 
            value: totalPosts > 0 ? `${((totalLikes + totalComments) / totalPosts).toFixed(1)}%` : "0%", 
            change: "+0%", 
            trend: "neutral", 
            description: "Overall engagement rate" 
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Error fetching Feed & Social details:', error);
    return [];
  }
};

// Fetch detailed analytics for Video
const fetchVideoDetails = async (): Promise<DetailedCategory[]> => {
  try {
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select('id, title, views_count, likes_count, comments_count, created_at');
    
    if (videosError) throw videosError;
    
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum: number, video: any) => sum + (video.views_count || 0), 0);
    const totalLikes = videos.reduce((sum: number, video: any) => sum + (video.likes_count || 0), 0);
    const totalComments = videos.reduce((sum: number, video: any) => sum + (video.comments_count || 0), 0);
    
    return [
      {
        category: "Video Performance",
        metrics: [
          { 
            name: "Total Videos", 
            value: formatNumber(totalVideos), 
            change: "+0%", 
            trend: "neutral", 
            description: "Videos created" 
          },
          { 
            name: "Total Views", 
            value: formatNumber(totalViews), 
            change: "+0%", 
            trend: "neutral", 
            description: "All-time views" 
          },
          { 
            name: "Avg Views per Video", 
            value: totalVideos > 0 ? formatNumber(Math.round(totalViews / totalVideos)) : "0", 
            change: "+0%", 
            trend: "neutral", 
            description: "Average views per video" 
          },
          { 
            name: "Engagement Rate", 
            value: totalVideos > 0 ? `${((totalLikes + totalComments) / totalVideos).toFixed(1)}%` : "0%", 
            change: "+0%", 
            trend: "neutral", 
            description: "Overall engagement rate" 
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Error fetching Video details:', error);
    return [];
  }
};

// Fetch detailed analytics for Marketplace
const fetchMarketplaceDetails = async (): Promise<DetailedCategory[]> => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, total_sales, total_reviews, average_rating');
    
    if (productsError) throw productsError;
    
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum: number, product: any) => sum + (product.price * (product.total_sales || 0)), 0);
    const totalSales = products.reduce((sum: number, product: any) => sum + (product.total_sales || 0), 0);
    const avgRating = totalProducts > 0 ? 
      (products.reduce((sum: number, product: any) => sum + (parseFloat(product.average_rating) || 0), 0) / totalProducts).toFixed(1) : "0";
    
    return [
      {
        category: "Sales Performance",
        metrics: [
          { 
            name: "Products Listed", 
            value: formatNumber(totalProducts), 
            change: "+0%", 
            trend: "neutral", 
            description: "Active products" 
          },
          { 
            name: "Total Revenue", 
            value: formatCurrency(totalRevenue), 
            change: "+0%", 
            trend: "neutral", 
            description: "Gross sales revenue" 
          },
          { 
            name: "Units Sold", 
            value: formatNumber(totalSales), 
            change: "+0%", 
            trend: "neutral", 
            description: "Total units sold" 
          },
          { 
            name: "Avg Product Rating", 
            value: avgRating, 
            change: "+0%", 
            trend: "neutral", 
            description: "Average customer rating" 
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Error fetching Marketplace details:', error);
    return [];
  }
};

// Fetch detailed analytics for Freelance
const fetchFreelanceDetails = async (): Promise<DetailedCategory[]> => {
  // Placeholder implementation
  return [
    {
      category: "Project Performance",
      metrics: [
        { 
          name: "Projects Completed", 
          value: "0", 
          change: "+0%", 
          trend: "neutral", 
          description: "Finished projects" 
        },
        { 
          name: "Client Rating", 
          value: "0", 
          change: "+0%", 
          trend: "neutral", 
          description: "Average client rating" 
        },
        { 
          name: "Earnings", 
          value: "$0", 
          change: "+0%", 
          trend: "neutral", 
          description: "Total earnings" 
        },
        { 
          name: "Response Time", 
          value: "0h", 
          change: "+0%", 
          trend: "neutral", 
          description: "Avg response time" 
        }
      ]
    }
  ];
};

// Fetch detailed analytics for Finance
const fetchFinanceDetails = async (): Promise<DetailedCategory[]> => {
  // Placeholder implementation
  return [
    {
      category: "Portfolio Performance",
      metrics: [
        { 
          name: "Portfolio Value", 
          value: "$0", 
          change: "+0%", 
          trend: "neutral", 
          description: "Total portfolio worth" 
        },
        { 
          name: "Total P&L", 
          value: "$0", 
          change: "+0%", 
          trend: "neutral", 
          description: "Profit/Loss this period" 
        },
        { 
          name: "Win Rate", 
          value: "0%", 
          change: "+0%", 
          trend: "neutral", 
          description: "Profitable trades" 
        },
        { 
          name: "Trading Volume", 
          value: "$0", 
          change: "+0%", 
          trend: "neutral", 
          description: "Total volume traded" 
        }
      ]
    }
  ];
};

// Fetch detailed analytics for Engagement
const fetchEngagementDetails = async (): Promise<DetailedCategory[]> => {
  try {
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .select('id, content, created_at');
    
    if (chatError && chatError.message !== 'Relation not found') throw chatError;
    
    const { data: postComments, error: postCommentsError } = await supabase
      .from('post_comments')
      .select('id, content, created_at');
    
    if (postCommentsError) throw postCommentsError;
    
    const { data: videoComments, error: videoCommentsError } = await supabase
      .from('video_comments')
      .select('id, content, created_at');
    
    if (videoCommentsError) throw videoCommentsError;
    
    const totalMessages = chatMessages ? chatMessages.length : 0;
    const totalComments = (postComments?.length || 0) + (videoComments?.length || 0);
    
    return [
      {
        category: "Communication Stats",
        metrics: [
          { 
            name: "Messages Sent", 
            value: formatNumber(totalMessages), 
            change: "+0%", 
            trend: "neutral", 
            description: "Total messages sent" 
          },
          { 
            name: "Comments", 
            value: formatNumber(totalComments), 
            change: "+0%", 
            trend: "neutral", 
            description: "Total comments" 
          },
          { 
            name: "Engagement Rate", 
            value: totalMessages > 0 ? `${Math.min(100, Math.round((totalComments / totalMessages) * 100))}%` : "0%", 
            change: "+0%", 
            trend: "neutral", 
            description: "Overall engagement rate" 
          },
          { 
            name: "Active Chats", 
            value: totalMessages > 0 ? formatNumber(Math.round(totalMessages / 10)) : "0", 
            change: "+0%", 
            trend: "neutral", 
            description: "Ongoing conversations" 
          }
        ]
      }
    ];
  } catch (error) {
    console.error('Error fetching Engagement details:', error);
    return [];
  }
};

// Export a default object for backward compatibility
export default {
  fetchPlatformAnalytics,
  fetchTopPerformingContent,
  fetchFeatureDetails,
  // Add track method for giftCardService
  track: (event: string, properties: Record<string, any> = {}) => {
    console.log(`Analytics event: ${event}`, properties);
    // In a real implementation, this would send data to an analytics service
  }
};
