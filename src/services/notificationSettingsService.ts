import { supabase } from "@/integrations/supabase/client";

export interface NotificationPreferences {
  id?: string;
  user_id: string;
  preferences: {
    [key: string]: boolean;
  };
  global_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone?: string;
  frequency: string;
  digest: boolean;
  digest_time?: string;
  digest_days?: string[];
  language: string;
  unsubscribe_token?: string;
  created_at?: string;
  updated_at?: string;
}

class NotificationSettingsService {
  // Get user notification preferences
  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned, create default preferences
          return await this.createDefaultPreferences(userId);
        }
        throw error;
      }

      return data as NotificationPreferences;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return null;
    }
  }

  // Create default notification preferences for a user
  async createDefaultPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const defaultPreferences: Partial<NotificationPreferences> = {
        user_id: userId,
        preferences: {
          social: true,
          trading: true,
          marketplace: true,
          system: true,
          rewards: true,
          freelance: true,
          crypto: true,
          chat: true,
        },
        global_enabled: true,
        push_enabled: true,
        email_enabled: true,
        sms_enabled: false,
        in_app_enabled: true,
        frequency: 'instant',
        digest: false,
        language: 'en',
      };

      const { data, error } = await supabase
        .from('notification_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (error) throw error;
      return data as NotificationPreferences;
    } catch (error) {
      console.error('Error creating default notification preferences:', error);
      return null;
    }
  }

  // Update user notification preferences
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      // First try to update existing preferences
      const { data: updateData, error: updateError } = await supabase
        .from('notification_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError && updateError.code !== 'PGRST116') {
        console.error('Notification preference update failed:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          userId: userId,
          timestamp: new Date().toISOString()
        });
        throw updateError;
      }

      // If update succeeded, return the data
      if (updateData) {
        console.log('Notification preferences updated successfully:', {
          userId: userId,
          timestamp: new Date().toISOString(),
          updatedFields: Object.keys(preferences)
        });
        return updateData as NotificationPreferences;
      }

      // If no rows were updated, create new preferences
      const newPreferences = {
        user_id: userId,
        ...preferences,
      };

      const { data: insertData, error: insertError } = await supabase
        .from('notification_preferences')
        .insert(newPreferences)
        .select()
        .single();

      if (insertError) {
        console.error('Notification preference insert failed:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          userId: userId,
          timestamp: new Date().toISOString()
        });
        throw insertError;
      }

      console.log('Notification preferences created successfully:', {
        userId: userId,
        timestamp: new Date().toISOString()
      });

      return insertData as NotificationPreferences;
    } catch (error) {
      console.error('Error updating notification preferences:', {
        error: error instanceof Error ? error.message : String(error),
        userId: userId,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  // Update specific preference category
  async updatePreferenceCategory(
    userId: string,
    category: string,
    enabled: boolean
  ): Promise<boolean> {
    try {
      const currentPreferences = await this.getUserPreferences(userId);
      if (!currentPreferences) return false;

      const updatedPreferences = {
        ...currentPreferences.preferences,
        [category]: enabled,
      };

      const result = await this.updateUserPreferences(userId, {
        preferences: updatedPreferences,
      });

      return result !== null;
    } catch (error) {
      console.error('Error updating preference category:', error);
      return false;
    }
  }

  // Check if a notification type is enabled for user
  async isNotificationTypeEnabled(userId: string, type: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      if (!preferences || !preferences.global_enabled) return false;
      
      // If preferences exist, check the specific type
      if (preferences.preferences && typeof preferences.preferences === 'object') {
        return preferences.preferences[type] !== false; // Default to true if not explicitly set to false
      }
      
      return true;
    } catch (error) {
      console.error('Error checking notification type status:', error);
      return true; // Default to enabled if there's an error
    }
  }

  // Generate unsubscribe token
  async generateUnsubscribeToken(userId: string): Promise<string | null> {
    try {
      // Generate a random token
      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      const result = await this.updateUserPreferences(userId, {
        unsubscribe_token: token,
      });

      return result ? token : null;
    } catch (error) {
      console.error('Error generating unsubscribe token:', error);
      return null;
    }
  }

  // Get user by unsubscribe token
  async getUserByUnsubscribeToken(token: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('user_id')
        .eq('unsubscribe_token', token)
        .single();

      if (error) throw error;
      return data?.user_id || null;
    } catch (error) {
      console.error('Error getting user by unsubscribe token:', error);
      return null;
    }
  }

  // Unsubscribe user from all notifications
  async unsubscribeAll(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          global_enabled: false,
          push_enabled: false,
          email_enabled: false,
          sms_enabled: false,
          in_app_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unsubscribing user:', error);
      return false;
    }
  }
}

export const notificationSettingsService = new NotificationSettingsService();
