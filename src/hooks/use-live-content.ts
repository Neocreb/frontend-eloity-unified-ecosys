import { useState, useEffect, useCallback } from 'react';

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
  isUserOwned?: boolean; // Track if current user owns this stream
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

// Mock data for initial state
const mockLiveContent: LiveStreamData[] = [
  {
    id: "live1",
    type: "live",
    user: {
      id: "user1",
      username: "crypto_guru",
      displayName: "Crypto Guru",
      avatar: "https://i.pravatar.cc/150?img=10",
      verified: true,
      followerCount: 50000,
    },
    title: "Bitcoin Analysis Live",
    description: "LIVE: Bitcoin analysis and market predictions! 🔴 Join the discussion",
    viewerCount: 1250,
    isActive: true,
    startedAt: new Date(Date.now() - 1800000), // Started 30 mins ago
    category: "crypto",
  },
  {
    id: "battle1",
    type: "battle",
    user: {
      id: "user2",
      username: "dance_master",
      displayName: "Dance Master",
      avatar: "https://i.pravatar.cc/150?img=3",
      verified: true,
      followerCount: 892000,
    },
    title: "Epic Dance Battle",
    description: "🔥 LIVE BATTLE: Epic Dance Battle vs @melody_queen! Vote with gifts! ⚡",
    viewerCount: 2480,
    isActive: true,
    startedAt: new Date(Date.now() - 900000), // Started 15 mins ago
    category: "dance",
    battleData: {
      opponent: {
        id: "user3",
        username: "melody_queen",
        displayName: "Melody Queen",
        avatar: "https://i.pravatar.cc/150?img=5",
      },
      type: "dance",
      timeRemaining: 180, // 3 minutes left
      scores: {
        user1: 2450,
        user2: 3120,
      },
    },
  },
];

export function useLiveContent() {
  const [liveContent, setLiveContent] = useState<LiveStreamData[]>(mockLiveContent);

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
