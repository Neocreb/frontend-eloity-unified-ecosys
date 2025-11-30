// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export interface ServiceFavorite {
  id: string;
  userId: string;
  serviceId: string;
  position: number;
  createdAt: string;
  service?: any;
}

export interface FavoriteService {
  serviceId: string;
  isFavorite: boolean;
  position?: number;
}

class ServiceFavoritesService {
  /**
   * Get all favorite services for a user
   */
  async getFavorites(userId: string): Promise<ServiceFavorite[]> {
    try {
      const { data, error } = await supabase
        .from("user_service_favorites")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }
  }

  /**
   * Check if a service is favorited
   */
  async isFavorited(userId: string, serviceId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("user_service_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("service_id", serviceId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
      return !!data;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  }

  /**
   * Add a service to favorites
   */
  async addFavorite(userId: string, serviceId: string): Promise<ServiceFavorite | null> {
    try {
      const { data, error } = await supabase
        .from("user_service_favorites")
        .insert({
          user_id: userId,
          service_id: serviceId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding favorite:", error);
      return null;
    }
  }

  /**
   * Remove a service from favorites
   */
  async removeFavorite(userId: string, serviceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_service_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("service_id", serviceId);

      if (error) throw error;

      // Reorder remaining favorites
      await this.reorderFavorites(userId);
      return true;
    } catch (error) {
      console.error("Error removing favorite:", error);
      return false;
    }
  }

  /**
   * Reorder favorites (deprecated - position column no longer used)
   */
  async updateFavoritePosition(
    userId: string,
    serviceId: string,
    newPosition: number
  ): Promise<boolean> {
    // Position column has been removed. This method is kept for backward compatibility.
    return true;
  }

  /**
   * Reorder favorites after deletion (deprecated - position column no longer used)
   */
  private async reorderFavorites(userId: string): Promise<void> {
    // Position column has been removed. This method is kept for backward compatibility.
  }

  /**
   * Clear all favorites for a user
   */
  async clearAllFavorites(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_service_favorites")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error clearing favorites:", error);
      return false;
    }
  }
}

export const serviceFavoritesService = new ServiceFavoritesService();
