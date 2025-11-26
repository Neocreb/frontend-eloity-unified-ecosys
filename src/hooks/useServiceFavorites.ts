import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { serviceFavoritesService, ServiceFavorite } from '@/services/serviceFavoritesService';

interface UseServiceFavoritesReturn {
  favorites: ServiceFavorite[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  isFavorited: (serviceId: string) => boolean;
  toggleFavorite: (serviceId: string) => Promise<boolean>;
  addFavorite: (serviceId: string) => Promise<boolean>;
  removeFavorite: (serviceId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useServiceFavorites = (): UseServiceFavoritesReturn => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<ServiceFavorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorites on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    }
  }, [user?.id]);

  const loadFavorites = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await serviceFavoritesService.getFavorites(user.id);
      setFavorites(data);
      setFavoriteIds(new Set(data.map(fav => fav.serviceId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
      console.error('Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const isFavorited = useCallback((serviceId: string): boolean => {
    return favoriteIds.has(serviceId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (serviceId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      if (isFavorited(serviceId)) {
        return await removeFavorite(serviceId);
      } else {
        return await addFavorite(serviceId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      return false;
    }
  }, [user?.id, isFavorited]);

  const addFavorite = useCallback(async (serviceId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      const result = await serviceFavoritesService.addFavorite(user.id, serviceId);
      if (result) {
        setFavorites(prev => [...prev, result]);
        setFavoriteIds(prev => new Set([...prev, serviceId]));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add favorite');
      return false;
    }
  }, [user?.id]);

  const removeFavorite = useCallback(async (serviceId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      const success = await serviceFavoritesService.removeFavorite(user.id, serviceId);
      if (success) {
        setFavorites(prev => prev.filter(fav => fav.serviceId !== serviceId));
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(serviceId);
          return newSet;
        });
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove favorite');
      return false;
    }
  }, [user?.id]);

  const refresh = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    favoriteIds,
    isLoading,
    error,
    isFavorited,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    refresh,
  };
};
