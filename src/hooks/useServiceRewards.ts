import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { serviceRewardsService, UserServiceRewards } from '@/services/serviceRewardsService';

interface UseServiceRewardsReturn {
  rewards: UserServiceRewards | null;
  allRewards: UserServiceRewards[];
  isLoading: boolean;
  error: string | null;
  loadServiceRewards: (serviceId: string) => Promise<void>;
  loadAllRewards: () => Promise<void>;
  awardPoints: (serviceId: string, transactionId: string) => Promise<boolean>;
}

export const useServiceRewards = (initialServiceId?: string): UseServiceRewardsReturn => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<UserServiceRewards | null>(null);
  const [allRewards, setAllRewards] = useState<UserServiceRewards[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServiceRewards = useCallback(async (serviceId: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await serviceRewardsService.getUserServiceRewards(user.id, serviceId);
      setRewards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rewards');
      console.error('Error loading rewards:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadAllRewards = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await serviceRewardsService.getUserAllServiceRewards(user.id);
      setAllRewards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rewards');
      console.error('Error loading rewards:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const awardPoints = useCallback(async (serviceId: string, transactionId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      const result = await serviceRewardsService.awardPoints(user.id, serviceId, transactionId);
      if (result) {
        // Refresh the rewards
        await loadServiceRewards(serviceId);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to award points');
      return false;
    }
  }, [user?.id, loadServiceRewards]);

  // Load initial data
  useEffect(() => {
    if (initialServiceId) {
      loadServiceRewards(initialServiceId);
    } else {
      loadAllRewards();
    }
  }, [initialServiceId, loadServiceRewards, loadAllRewards]);

  return {
    rewards,
    allRewards,
    isLoading,
    error,
    loadServiceRewards,
    loadAllRewards,
    awardPoints,
  };
};
