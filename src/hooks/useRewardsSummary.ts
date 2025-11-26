import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userRewardsSummaryService, UserRewardsSummary } from "@/services/userRewardsSummaryService";

interface UseRewardsSummaryReturn {
  summary: UserRewardsSummary | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  updateTrustScore: () => Promise<void>;
  withdraw: (amount: number, method: string) => Promise<boolean>;
}

export const useRewardsSummary = (): UseRewardsSummaryReturn => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<UserRewardsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Initialize summary if needed
      await userRewardsSummaryService.initializeSummary(user.id);

      // Fetch summary
      const data = await userRewardsSummaryService.getSummary(user.id);

      if (data) {
        setSummary(data);
      } else {
        // Set default for new users
        setSummary({
          user_id: user.id,
          total_earned: 0,
          available_balance: 0,
          total_withdrawn: 0,
          current_streak: 0,
          longest_streak: 0,
          trust_score: 50,
          level: 1,
          next_level_threshold: 100,
          currency_code: "USD",
          total_activities: 0,
          activities_this_month: 0,
          last_activity_at: null,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch rewards summary"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial data
    fetchSummary();

    // Subscribe to real-time updates
    const subscription = userRewardsSummaryService.subscribeToSummary(
      user.id,
      (updatedSummary) => {
        setSummary(updatedSummary);
      },
      (err) => {
        console.error("Subscription error:", err);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [user?.id, fetchSummary]);

  // Refresh summary
  const refresh = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      await userRewardsSummaryService.updateSummaryOnActivity(user.id);
      await fetchSummary();
    } catch (err) {
      console.error("Error refreshing summary:", err);
      setError(err instanceof Error ? err : new Error("Failed to refresh summary"));
    }
  }, [user?.id, fetchSummary]);

  // Update trust score
  const updateTrustScore = useCallback(async () => {
    if (!user?.id || !summary) return;

    try {
      setError(null);
      const success = await userRewardsSummaryService.updateTrustScore(user.id);

      if (success) {
        await fetchSummary();
      }
    } catch (err) {
      console.error("Error updating trust score:", err);
      setError(err instanceof Error ? err : new Error("Failed to update trust score"));
    }
  }, [user?.id, summary, fetchSummary]);

  // Withdraw funds
  const withdraw = useCallback(
    async (amount: number, method: string): Promise<boolean> => {
      if (!user?.id || !summary) {
        setError(new Error("User or summary not available"));
        return false;
      }

      try {
        setError(null);

        if (summary.available_balance < amount) {
          setError(new Error("Insufficient balance"));
          return false;
        }

        const success = await userRewardsSummaryService.withdrawFunds(
          user.id,
          amount,
          method
        );

        if (success) {
          // Update local state optimistically
          setSummary((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              available_balance: prev.available_balance - amount,
              total_withdrawn: prev.total_withdrawn + amount,
            };
          });

          // Fetch fresh data
          await fetchSummary();
        }

        return success;
      } catch (err) {
        console.error("Error processing withdrawal:", err);
        setError(err instanceof Error ? err : new Error("Failed to process withdrawal"));
        return false;
      }
    },
    [user?.id, summary, fetchSummary]
  );

  return {
    summary,
    isLoading,
    error,
    refresh,
    updateTrustScore,
    withdraw,
  };
};
