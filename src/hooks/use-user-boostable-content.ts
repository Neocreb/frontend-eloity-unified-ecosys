import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BoostableContent {
  id: string;
  type: 'product' | 'service' | 'job' | 'video' | 'post' | 'profile';
  name: string;
  description?: string;
  image?: string;
  price?: number;
  status: string;
  performance?: {
    views: number;
    clicks?: number;
    sales?: number;
    likes?: number;
    shares?: number;
  };
  createdAt: string;
}

export function useUserBoostableContent() {
  const { user } = useAuth();
  const [content, setContent] = useState<BoostableContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setContent([]);
      setIsLoading(false);
      return;
    }

    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, description, image_url, price, status, created_at, view_count')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;

        // Fetch freelance services/gigs
        const { data: freelanceGigs, error: gigsError } = await supabase
          .from('freelance_gigs')
          .select('id, title, description, image_url, price, status, created_at, view_count')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (gigsError) throw gigsError;

        // Fetch freelance jobs (if user posted them)
        const { data: freelanceJobs, error: jobsError } = await supabase
          .from('freelance_jobs')
          .select('id, title, description, image_url, budget, status, created_at, view_count, application_count')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Fetch videos
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('id, title, description, thumbnail_url, created_at, view_count, like_count, share_count')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (videosError) throw videosError;

        // Fetch posts
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select('id, content, created_at, view_count, like_count, share_count')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        // Fetch user profile for profile boosting
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, bio, created_at, followers_count')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Combine and format all content
        const allContent: BoostableContent[] = [];

        // Add products
        if (products && Array.isArray(products)) {
          allContent.push(
            ...products.map(p => ({
              id: p.id,
              type: 'product' as const,
              name: p.name,
              description: p.description,
              image: p.image_url,
              price: p.price,
              status: p.status,
              performance: {
                views: p.view_count || 0,
              },
              createdAt: p.created_at,
            }))
          );
        }

        // Add freelance services
        if (freelanceGigs && Array.isArray(freelanceGigs)) {
          allContent.push(
            ...freelanceGigs.map(g => ({
              id: g.id,
              type: 'service' as const,
              name: g.title,
              description: g.description,
              image: g.image_url,
              price: g.price,
              status: g.status,
              performance: {
                views: g.view_count || 0,
              },
              createdAt: g.created_at,
            }))
          );
        }

        // Add freelance jobs
        if (freelanceJobs && Array.isArray(freelanceJobs)) {
          allContent.push(
            ...freelanceJobs.map(j => ({
              id: j.id,
              type: 'job' as const,
              name: j.title,
              description: j.description,
              image: j.image_url,
              price: j.budget,
              status: j.status,
              performance: {
                views: j.view_count || 0,
                clicks: j.application_count || 0,
              },
              createdAt: j.created_at,
            }))
          );
        }

        // Add videos
        if (videos && Array.isArray(videos)) {
          allContent.push(
            ...videos.map(v => ({
              id: v.id,
              type: 'video' as const,
              name: v.title,
              description: v.description,
              image: v.thumbnail_url,
              status: 'published',
              performance: {
                views: v.view_count || 0,
                likes: v.like_count || 0,
                shares: v.share_count || 0,
              },
              createdAt: v.created_at,
            }))
          );
        }

        // Add posts
        if (posts && Array.isArray(posts)) {
          allContent.push(
            ...posts.slice(0, 5).map(p => ({
              id: p.id,
              type: 'post' as const,
              name: p.content.substring(0, 50),
              description: p.content,
              status: 'published',
              performance: {
                views: p.view_count || 0,
                likes: p.like_count || 0,
                shares: p.share_count || 0,
              },
              createdAt: p.created_at,
            }))
          );
        }

        // Add user profile
        if (profile) {
          allContent.push({
            id: profile.id,
            type: 'profile' as const,
            name: profile.full_name || profile.username || 'Your Profile',
            description: profile.bio,
            image: profile.avatar_url,
            status: 'active',
            performance: {
              views: 0,
              clicks: profile.followers_count || 0,
            },
            createdAt: profile.created_at,
          });
        }

        setContent(allContent);
      } catch (err) {
        console.error('Error fetching boostable content:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [user?.id]);

  return { content, isLoading, error };
}
