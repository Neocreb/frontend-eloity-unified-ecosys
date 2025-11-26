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
        .eq("user_id", userId)
        .order("position", { ascending: true });

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
      // Get current max position
      const { data: maxData } = await supabase
        .from("user_service_favorites")
        .select("position")
        .eq("user_id", userId)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition = maxData && maxData.length > 0 ? maxData[0].position + 1 : 0;

      const { data, error } = await supabase
        .from("user_service_favorites")
        .insert({
          user_id: userId,
          service_id: serviceId,
          position: nextPosition,
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
   * Reorder favorites
   */
  async updateFavoritePosition(
    userId: string,
    serviceId: string,
    newPosition: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_service_favorites")
        .update({ position: newPosition })
        .eq("user_id", userId)
        .eq("service_id", serviceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating favorite position:", error);
      return false;
    }
  }

  /**
   * Reorder favorites after deletion
   */
  private async reorderFavorites(userId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites(userId);
      for (let i = 0; i < favorites.length; i++) {
        await this.updateFavoritePosition(userId, favorites[i].serviceId, i);
      }
    } catch (error) {
      console.error("Error reordering favorites:", error);
    }
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
