import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPresence {
  user_id: string;
  online_at: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  activity?: string;
}

export const useUserPresence = (roomId: string = 'global') => {
  const [presenceState, setPresenceState] = useState<Record<string, UserPresence[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user } = useAuth();

  const updatePresence = useCallback(async (status: 'online' | 'away' | 'busy' | 'offline' = 'online', activity?: string) => {
    if (!user?.id) return;

    const presenceData: UserPresence = {
      user_id: user.id,
      online_at: new Date().toISOString(),
      status,
      activity,
    };

    const channel = supabase.channel(roomId);
    await channel.track(presenceData);
  }, [user?.id, roomId]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(roomId);

    // Track presence state changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        setPresenceState(newState);
        
        // Extract online user IDs
        const userIds = Object.keys(newState).reduce((acc: string[], key) => {
          const presences = newState[key] as UserPresence[];
          presences.forEach(presence => {
            if (presence.status !== 'offline' && !acc.includes(presence.user_id)) {
              acc.push(presence.user_id);
            }
          });
          return acc;
        }, []);
        
        setOnlineUsers(userIds);
        console.log('Users online:', userIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await updatePresence('online');
        }
      });

    // Update presence every 30 seconds to maintain active status
    const interval = setInterval(() => {
      updatePresence('online');
    }, 30000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle page unload
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updatePresence('offline');
      supabase.removeChannel(channel);
    };
  }, [user?.id, roomId, updatePresence]);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  const getUserStatus = useCallback((userId: string): 'online' | 'away' | 'busy' | 'offline' => {
    for (const presences of Object.values(presenceState)) {
      const userPresence = presences.find(p => p.user_id === userId);
      if (userPresence) {
        return userPresence.status || 'online';
      }
    }
    return 'offline';
  }, [presenceState]);

  return {
    presenceState,
    onlineUsers,
    isUserOnline,
    getUserStatus,
    updatePresence,
  };
};