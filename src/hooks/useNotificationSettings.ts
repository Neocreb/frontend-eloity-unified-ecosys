import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  notificationSettingsService, 
  type NotificationPreferences 
} from '@/services/notificationSettingsService';

export interface UseNotificationSettingsReturn {
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<boolean>;
  updateCategory: (category: string, enabled: boolean) => Promise<boolean>;
  isTypeEnabled: (type: string) => Promise<boolean>;
  unsubscribeAll: () => Promise<boolean>;
}

export const useNotificationSettings = (): UseNotificationSettingsReturn => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const userPreferences = await notificationSettingsService.getUserPreferences(user.id);
        setPreferences(userPreferences);
      } catch (err) {
        console.error('Error loading notification preferences:', err);
        setError('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      
      const updated = await notificationSettingsService.updateUserPreferences(user.id, prefs);
      if (updated) {
        setPreferences(updated);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError('Failed to update notification preferences');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update specific category
  const updateCategory = useCallback(async (category: string, enabled: boolean): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      
      const success = await notificationSettingsService.updatePreferenceCategory(user.id, category, enabled);
      if (success && preferences) {
        const updatedPreferences = {
          ...preferences,
          preferences: {
            ...preferences.preferences,
            [category]: enabled,
          },
        };
        setPreferences(updatedPreferences);
      }
      return success;
    } catch (err) {
      console.error('Error updating notification category:', err);
      setError('Failed to update notification category');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, preferences]);

  // Check if notification type is enabled
  const isTypeEnabled = useCallback(async (type: string): Promise<boolean> => {
    if (!user) return false;
    return await notificationSettingsService.isNotificationTypeEnabled(user.id, type);
  }, [user]);

  // Unsubscribe from all notifications
  const unsubscribeAll = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);
      
      const success = await notificationSettingsService.unsubscribeAll(user.id);
      if (success && preferences) {
        const updatedPreferences = {
          ...preferences,
          global_enabled: false,
          push_enabled: false,
          email_enabled: false,
          sms_enabled: false,
          in_app_enabled: false,
        };
        setPreferences(updatedPreferences);
      }
      return success;
    } catch (err) {
      console.error('Error unsubscribing from notifications:', err);
      setError('Failed to unsubscribe from notifications');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, preferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    updateCategory,
    isTypeEnabled,
    unsubscribeAll,
  };
};