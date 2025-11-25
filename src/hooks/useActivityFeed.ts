import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { activityTransactionService, ActivityTransaction, ActivityFilter } from "@/services/activityTransactionService";

interface UseActivityFeedReturn {
  activities: ActivityTransaction[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  filter: (filters: ActivityFilter) => Promise<void>;
  clearFilters: () => Promise<void>;
}

const DEFAULT_LIMIT = 50;

export const useActivityFeed = (initialLimit: number = DEFAULT_LIMIT): UseActivityFeedReturn => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<ActivityFilter | undefined>();
  const [limit] = useState(initialLimit);

  // Initial fetch
  const fetchActivities = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [data, count] = await Promise.all([
        activityTransactionService.getActivityFeed(user.id, limit, 0, currentFilters),
        activityTransactionService.getActivityCount(user.id, currentFilters),
      ]);

      setActivities(data);
      setTotalCount(count);
      setOffset(limit);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch activities"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, limit, currentFilters]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial data
    fetchActivities();

    // Subscribe to real-time updates
    const subscription = activityTransactionService.subscribeToActivities(
      user.id,
      (newActivity) => {
        // Add new activity to the top of the list
        setActivities((prev) => [newActivity, ...prev]);
      },
      (err) => {
        console.error("Subscription error:", err);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [user?.id, fetchActivities]);

  // Load more activities
  const loadMore = useCallback(async () => {
    if (!user?.id || isLoading || offset >= totalCount) return;

    try {
      const moreData = await activityTransactionService.getActivityFeed(
        user.id,
        limit,
        offset,
        currentFilters
      );

      setActivities((prev) => [...prev, ...moreData]);
      setOffset((prev) => prev + limit);
    } catch (err) {
      console.error("Error loading more activities:", err);
      setError(err instanceof Error ? err : new Error("Failed to load more activities"));
    }
  }, [user?.id, isLoading, offset, totalCount, limit, currentFilters]);

  // Refresh data
  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchActivities();
  }, [fetchActivities]);

  // Apply filters
  const filter = useCallback(async (filters: ActivityFilter) => {
    setCurrentFilters(filters);
    setOffset(0);
    // Filters will trigger re-fetch via useEffect dependency
  }, []);

  // Clear filters
  const clearFilters = useCallback(async () => {
    setCurrentFilters(undefined);
    setOffset(0);
  }, []);

  return {
    activities,
    isLoading,
    error,
    hasMore: offset < totalCount,
    totalCount,
    loadMore,
    refresh,
    filter,
    clearFilters,
  };
};
