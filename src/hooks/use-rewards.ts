import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { rewardsService, RewardsData } from "@/services/rewardsService";

interface UseRewardsReturn {
  data: RewardsData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export const useRewards = (): UseRewardsReturn => {
  const { user } = useAuth();
  const [data, setData] = useState<RewardsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const rewardsData = await rewardsService.getAllRewardsData(user.id);
      setData(rewardsData);
    } catch (err) {
      console.error("Error fetching rewards data:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch rewards data"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh
  };
};