import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

export interface UserCampaign {
  id: string;
  name: string;
  description?: string;
  goal_type: string;
  status: 'draft' | 'active' | 'paused' | 'ended' | 'cancelled';
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  view_count: number;
  click_count: number;
  conversion_count: number;
  total_revenue: number;
  estimated_reach: number;
  created_at: string;
  updated_at: string;
}

export function useUserCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<UserCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setCampaigns([]);
      setIsLoading(false);
      return;
    }

    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setCampaigns(data || []);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [user?.id]);

  return { campaigns, isLoading, error };
}
