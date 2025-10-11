import { useState, useEffect, useCallback } from 'react';
import { liveStreamService } from '@/services/liveStreamService';

export interface LiveStreamData {
  id: string;
  type: 'live' | 'battle';
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
    followerCount: number;
  };
  title: string;
  description: string;
  viewerCount: number;
  isActive: boolean;
  startedAt: Date;
  isUserOwned?: boolean;
  category?: string;
  streamKey?: string;
  battleData?: {
    opponent?: {
      id: string;
      username: string;
      displayName: string;
      avatar: string;
    };
    type: 'dance' | 'rap' | 'comedy' | 'general';
    timeRemaining?: number;
    scores?: {
      user1: number;
      user2: number;
    };
  };
}

export function useLiveContent() {
  const [liveContent, setLiveContent] = useState<LiveStreamData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real data from database
  const loadLiveContent = useCallback(async () => {
    try {
      setLoading(true);
      const [streams, battles] = await Promise.all([
        liveStreamService.getActiveLiveStreams(),
        liveStreamService.getActiveBattles()
      ]);

      const liveStreams: LiveStreamData[] = streams.map(stream => ({
        id: stream.id,
        type: 'live',
        user: {
          id: stream.user_id,
          username: stream.user?.username || 'unknown',
          displayName: stream.user?.full_name || 'Unknown User',
          avatar: stream.user?.avatar_url || '',
          verified: stream.user?.is_verified || false,
          followerCount: 0
        },
        title: stream.title,
        description: stream.description || '',
        viewerCount: stream.viewer_count,
        isActive: stream.is_active,
        startedAt: new Date(stream.started_at),
        category: stream.category || undefined,
        streamKey: stream.stream_key || undefined
      }));

      const battleStreams: LiveStreamData[] = battles.map(item => ({
        id: item.id,
        type: 'battle',
        user: {
          id: item.user_id,
          username: item.user?.username || 'unknown',
          displayName: item.user?.full_name || 'Unknown User',
          avatar: item.user?.avatar_url || '',
          verified: item.user?.is_verified || false,
          followerCount: 0
        },
        title: item.title,
        description: item.description || '',
        viewerCount: item.viewer_count,
        isActive: item.is_active,
        startedAt: new Date(item.started_at),
        category: item.category || undefined,
        battleData: {
          type: item.battle.battle_type,
          timeRemaining: item.battle.time_remaining || undefined,
          scores: {
            user1: item.battle.challenger_score,
            user2: item.battle.opponent_score
          }
        }
      }));

      setLiveContent([...liveStreams, ...battleStreams]);
    } catch (error) {
      console.error('Failed to load live content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveContent();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadLiveContent, 30000);
    return () => clearInterval(interval);
  }, [loadLiveContent]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveContent(prev => prev.map(content => ({
        ...content,
        viewerCount: Math.max(1, content.viewerCount + Math.floor(Math.random() * 10 - 3)),
        battleData: content.battleData ? {
          ...content.battleData,
          timeRemaining: Math.max(0, (content.battleData.timeRemaining || 0) - 1),
          scores: content.battleData.scores ? {
            user1: content.battleData.scores.user1 + Math.floor(Math.random() * 20),
            user2: content.battleData.scores.user2 + Math.floor(Math.random() * 20),
          } : undefined,
        } : undefined,
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addLiveStream = useCallback((streamData: Partial<LiveStreamData>) => {
    const id = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newStream: LiveStreamData = {
      id,
      type: 'live',
      startedAt: new Date(),
      isActive: true,
      viewerCount: 1,
      title: 'New Live Stream',
      description: 'Live streaming now!',
      isUserOwned: true, // Mark as user-owned
      user: {
        id: "current_user",
        username: "current_user",
        displayName: "You",
        avatar: "https://i.pravatar.cc/150?img=1",
        verified: false,
        followerCount: 1200,
      },
      ...streamData,
    };

    setLiveContent(prev => [newStream, ...prev]);
    return id;
  }, []);

  const addBattle = useCallback((battleData: Partial<LiveStreamData>) => {
    const id = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBattle: LiveStreamData = {
      id,
      type: 'battle',
      startedAt: new Date(),
      isActive: true,
      viewerCount: 1,
      title: 'New Battle',
      description: 'Battle starting now!',
      isUserOwned: true, // Mark as user-owned
      user: {
        id: "current_user",
        username: "current_user",
        displayName: "You",
        avatar: "https://i.pravatar.cc/150?img=1",
        verified: false,
        followerCount: 1200,
      },
      battleData: {
        type: 'general',
        timeRemaining: 300,
        scores: { user1: 0, user2: 0 },
      },
      ...battleData,
    };

    setLiveContent(prev => [newBattle, ...prev]);
    return id;
  }, []);

  const removeLiveContent = useCallback((id: string) => {
    setLiveContent(prev => prev.filter(content => content.id !== id));
  }, []);

  const updateViewerCount = useCallback((id: string, count: number) => {
    setLiveContent(prev => prev.map(content => 
      content.id === id ? { ...content, viewerCount: count } : content
    ));
  }, []);

  const getLiveContentById = useCallback((id: string) => {
    return liveContent.find(content => content.id === id);
  }, [liveContent]);

  const isUserLive = useCallback((userId: string) => {
    return liveContent.some(content => content.user.id === userId && content.isActive);
  }, [liveContent]);

  const liveStreams = liveContent.filter(content => content.type === 'live');
  const activeBattles = liveContent.filter(content => content.type === 'battle');

  return {
    liveStreams,
    activeBattles,
    allLiveContent: liveContent,
    addLiveStream,
    addBattle,
    removeLiveContent,
    updateViewerCount,
    getLiveContentById,
    isUserLive,
  };
}
