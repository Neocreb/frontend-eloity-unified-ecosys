import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UserPresence {
  user_id: string;
  username?: string;
  avatar_url?: string;
  online_at: string;
}

export function usePresence(roomId: string = 'global') {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const updatePresence = useCallback(async (status: 'online' | 'away' | 'offline' = 'online') => {
    if (!channel || !user) return;

    const presenceData = {
      user_id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
      avatar_url: user.user_metadata?.avatar_url || null,
      online_at: new Date().toISOString(),
      status
    };

    console.log('Updating presence:', presenceData);
    
    const presenceTrackStatus = await channel.track(presenceData);
    console.log('Presence track status:', presenceTrackStatus);
  }, [channel, user]);

  useEffect(() => {
    if (!user) return;

    console.log('Setting up presence channel for room:', roomId);
    
    const presenceChannel = supabase.channel(`presence_${roomId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence sync event');
        const newState = presenceChannel.presenceState();
        console.log('Current presence state:', newState);
        
        const users: UserPresence[] = [];
        Object.keys(newState).forEach(key => {
          const presences = newState[key] as UserPresence[];
          if (presences && presences.length > 0) {
            users.push(presences[0]); // Take the latest presence for each user
          }
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('Presence channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await updatePresence('online');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Presence channel error');
          setIsConnected(false);
        }
      });

    setChannel(presenceChannel);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (presenceChannel) {
        console.log('Unsubscribing from presence channel');
        supabase.removeChannel(presenceChannel);
      }
    };
  }, [user, roomId, updatePresence]);

  const getUsersInRoom = useCallback((excludeSelf = true) => {
    if (excludeSelf && user) {
      return onlineUsers.filter(u => u.user_id !== user.id);
    }
    return onlineUsers;
  }, [onlineUsers, user]);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.some(u => u.user_id === userId);
  }, [onlineUsers]);

  return {
    onlineUsers: getUsersInRoom(),
    allUsers: onlineUsers,
    isConnected,
    updatePresence,
    isUserOnline,
    onlineCount: onlineUsers.length
  };
}