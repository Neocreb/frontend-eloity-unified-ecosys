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

  const addLiveStream = useCallback((streamData: Partial<LiveStreamData>) => {
    const id = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newStream: LiveStreamData = {
      id,
      type: 'live',
      startedAt: new Date(),
      isActive: true,
      viewerCount: 0,
      title: 'New Live Stream',
      description: 'Live streaming now!',
      isUserOwned: true,
      user: {
        id: "current_user",
        username: "current_user",
        displayName: "You",
        avatar: "/placeholder.svg",
        verified: false,
        followerCount: 0,
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
      viewerCount: 0,
      title: 'New Battle',
      description: 'Battle starting now!',
      isUserOwned: true,
      user: {
        id: "current_user",
        username: "current_user",
        displayName: "You",
        avatar: "/placeholder.svg",
        verified: false,
        followerCount: 0,
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
