// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useSocketEvent } from '../../hooks/use-realtime';
import { Play, Pause, Volume2, VolumeX, Maximize, Eye, Coins, Gift } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface VideoAd {
  id: string;
  title: string;
  duration: number;
  reward: number;
  skipable: boolean;
  skipTime?: number;
  videoUrl: string;
  clickUrl?: string;
}

interface VideoData {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  ads: VideoAd[];
  watchRewards: {
    baseReward: number;
    milestones: { time: number; reward: number }[];
  };
}

interface Watch2EarnPlayerProps {
  videoId: string;
  onRewardEarned?: (reward: number, type: string) => void;
}

export function Watch2EarnPlayer({ videoId, onRewardEarned }: Watch2EarnPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ad state
  const [currentAd, setCurrentAd] = useState<VideoAd | null>(null);
  const [adProgress, setAdProgress] = useState(0);
  const [adCanSkip, setAdCanSkip] = useState(false);
  const [adWatched, setAdWatched] = useState<Set<string>>(new Set());
  
  // Rewards state
  const [milestonesMet, setMilestonesMet] = useState<Set<number>>(new Set());
  const [showRewardToast, setShowRewardToast] = useState<{ amount: number; type: string } | null>(null);

  // Listen for real-time viewer count updates
  useSocketEvent('viewer_count_update', (data) => {
    if (data.videoId === videoId) {
      setViewerCount(data.count);
    }
  }, [videoId]);

  // Listen for ad completion rewards
  useSocketEvent('ad_view_complete', (data) => {
    if (data.videoId === videoId) {
      const reward = data.reward;
      setTotalEarned(prev => prev + reward);
      setShowRewardToast({ amount: reward, type: 'Ad View' });
      onRewardEarned?.(reward, 'ad_view');
    }
  }, [videoId]);

  // Fetch video data
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}`);
        const data = await response.json();
        setVideoData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch video data:', error);
        setIsLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId]);

  // Track watch time and milestones
  useEffect(() => {
    if (!isPlaying || !videoData) return;

    const interval = setInterval(() => {
      setWatchTime(prev => prev + 1);
      
      // Check for milestone rewards
      videoData.watchRewards.milestones.forEach(milestone => {
        if (watchTime >= milestone.time && !milestonesMet.has(milestone.time)) {
          setMilestonesMet(prev => new Set([...prev, milestone.time]));
          setTotalEarned(prev => prev + milestone.reward);
          setShowRewardToast({ amount: milestone.reward, type: 'Watch Milestone' });
          onRewardEarned?.(milestone.reward, 'watch_milestone');
          
          // Send to backend
          fetch('/api/rewards/watch-milestone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId, milestone: milestone.time, reward: milestone.reward })
          });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, watchTime, videoData, milestonesMet, onRewardEarned, videoId]);

  // Handle ad insertion
  useEffect(() => {
    if (!videoData || currentTime === 0) return;

    // Check if we should show an ad at 10 seconds
    if (currentTime >= 10 && currentTime < 11 && !adWatched.has('mid_roll_10s')) {
      const adToShow = videoData.ads.find(ad => ad.id === 'mid_roll_10s');
      if (adToShow) {
        setCurrentAd(adToShow);
        setIsPlaying(false);
      }
    }
  }, [currentTime, videoData, adWatched]);

  // Ad timer
  useEffect(() => {
    if (!currentAd || !isPlaying) return;

    const interval = setInterval(() => {
      setAdProgress(prev => {
        const newProgress = prev + 1;
        
        // Check if ad can be skipped
        if (currentAd.skipable && currentAd.skipTime && newProgress >= currentAd.skipTime) {
          setAdCanSkip(true);
        }
        
        // Auto-complete ad when finished
        if (newProgress >= currentAd.duration) {
          handleAdComplete();
          return 0;
        }
        
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentAd, isPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleAdComplete = () => {
    if (currentAd) {
      setAdWatched(prev => new Set([...prev, currentAd.id]));
      
      // Send ad completion to backend
      fetch('/api/rewards/ad-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoId, 
          adId: currentAd.id, 
          watchDuration: adProgress,
          reward: currentAd.reward 
        })
      });
    }
    
    setCurrentAd(null);
    setAdProgress(0);
    setAdCanSkip(false);
    setIsPlaying(true);
  };

  const handleAdSkip = () => {
    if (adCanSkip) {
      handleAdComplete();
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading video...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!videoData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <p>Video not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-lg overflow-hidden">
            {/* Main Video */}
            <video
              ref={videoRef}
              src={videoData.videoUrl}
              className="w-full aspect-video"
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              poster={videoData.thumbnail}
            />
            
            {/* Ad Overlay */}
            {currentAd && (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <div className="w-full h-full flex flex-col">
                  <video
                    src={currentAd.videoUrl}
                    className="flex-1 w-full object-cover"
                    autoPlay
                    muted={isMuted}
                  />
                  
                  {/* Ad Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white">
                        <p className="text-sm">Advertisement</p>
                        <p className="text-xs opacity-75">{currentAd.title}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-600">
                          <Coins className="w-3 h-3 mr-1" />
                          +{currentAd.reward}
                        </Badge>
                        {adCanSkip && (
                          <Button size="sm" onClick={handleAdSkip}>
                            Skip Ad
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={(adProgress / currentAd.duration) * 100} 
                      className="h-1"
                    />
                    <div className="flex justify-between text-xs text-white/75 mt-1">
                      <span>{formatTime(adProgress)}</span>
                      <span>{formatTime(currentAd.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <Progress value={getProgressPercentage()} className="mb-2 h-1" />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleMute}>
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-white text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    {viewerCount}
                  </div>
                  <Button size="sm" variant="ghost">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Info & Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{videoData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3 mb-3">
              <img 
                src={videoData.creator.avatar} 
                alt={videoData.creator.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{videoData.creator.name}</p>
                <p className="text-sm text-muted-foreground">Creator</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{videoData.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="w-5 h-5 mr-2 text-yellow-600" />
              Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalEarned)}
                </div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Watch Time:</span>
                  <span>{formatTime(watchTime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Base Reward:</span>
                  <span>{formatCurrency(videoData.watchRewards.baseReward)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ads Watched:</span>
                  <span>{adWatched.size}</span>
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div>
                <h4 className="font-medium text-sm mb-2">Next Milestones</h4>
                <div className="space-y-1">
                  {videoData.watchRewards.milestones
                    .filter(m => !milestonesMet.has(m.time) && m.time > watchTime)
                    .slice(0, 3)
                    .map(milestone => (
                      <div key={milestone.time} className="flex justify-between text-xs">
                        <span>{formatTime(milestone.time)}</span>
                        <span className="text-green-600">+{formatCurrency(milestone.reward)}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reward Toast */}
      {showRewardToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Reward Earned!</p>
                  <p className="text-sm text-green-600">
                    +{formatCurrency(showRewardToast.amount)} from {showRewardToast.type}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Auto-hide reward toast
useEffect(() => {
  if (showRewardToast) {
    const timer = setTimeout(() => {
      setShowRewardToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [showRewardToast]);
