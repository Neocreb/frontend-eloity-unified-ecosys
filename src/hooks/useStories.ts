import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Story {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail: string;
  };
  timestamp: string;
  isViewed: boolean;
}

export const useStories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = async () => {
    try {
      setLoading(true);
      
      // For now, return empty array as stories table doesn't exist yet
      // TODO: Create stories table in database
      setStories([]);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [user]);

  return { stories, loading, refetch: fetchStories };
};
