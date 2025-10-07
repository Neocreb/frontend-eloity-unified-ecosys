// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Video, 
  Users, 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  Share2,
  TrendingUp,
  Clock,
  User,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import DuetEnabledVideoPlayer from '@/components/video/DuetEnabledVideoPlayer';
import duetService from '@/services/duetService';

interface MockVideo {
  id: string;
  url: string;
  thumbnail?: string;
  duration: number;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    duets: number;
  };
  isDuet?: boolean;
  duetOfPostId?: string;
  originalCreatorUsername?: string;
  duetStyle?: 'side-by-side' | 'react-respond' | 'picture-in-picture';
  audioSource?: 'original' | 'both' | 'voiceover';
  createdAt: string;
}

const DuetDemo: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<MockVideo | null>(null);
  const [duetChain, setDuetChain] = useState<any[]>([]);
  const [duetStats, setDuetStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('original');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock video data for demonstration
  const mockVideos: MockVideo[] = [
    {
      id: 'original-1',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
      duration: 30,
      title: 'Amazing Dance Routine',
      description: 'Check out this incredible dance routine! Can you duet with me? 💃 #dance #viral #fyp',
      author: {
        id: 'user-1',
        name: 'Sarah Johnson',
        username: 'sarahdances',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150',
        verified: true,
      },
      stats: {
        likes: 12500,
        comments: 445,
        shares: 189,
        duets: 89,
      },
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'duet-1',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1614680376573-df3480f67536?w=400',
      duration: 30,
      title: 'Dance Duet Response',
      description: 'Duet with @sarahdances - learned this routine so fast! 🔥',
      author: {
        id: 'user-2',
        name: 'Mike Chen',
        username: 'mikemoves',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        verified: false,
      },
      stats: {
        likes: 8900,
        comments: 234,
        shares: 156,
        duets: 23,
      },
      isDuet: true,
      duetOfPostId: 'original-1',
      originalCreatorUsername: 'sarahdances',
      duetStyle: 'side-by-side',
      audioSource: 'both',
      createdAt: '2024-01-16T14:20:00Z',
    },
    {
      id: 'duet-2',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      duration: 30,
      title: 'My Reaction to Sarah\'s Dance',
      description: 'Duet with @sarahdances - this is so hard! 😅 How does she make it look easy?',
      author: {
        id: 'user-3',
        name: 'Emma Wilson',
        username: 'emmatries',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        verified: false,
      },
      stats: {
        likes: 5600,
        comments: 178,
        shares: 89,
        duets: 12,
      },
      isDuet: true,
      duetOfPostId: 'original-1',
      originalCreatorUsername: 'sarahdances',
      duetStyle: 'react-respond',
      audioSource: 'voiceover',
      createdAt: '2024-01-17T09:15:00Z',
    },
    {
      id: 'duet-3',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400',
      duration: 30,
      title: 'Learning from the Best',
      description: 'Duet with @sarahdances - step by step breakdown! Thanks for the inspiration 🙏',
      author: {
        id: 'user-4',
        name: 'Alex Rivera',
        username: 'alexlearns',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        verified: true,
      },
      stats: {
        likes: 7800,
        comments: 312,
        shares: 445,
        duets: 34,
      },
      isDuet: true,
      duetOfPostId: 'original-1',
      originalCreatorUsername: 'sarahdances',
      duetStyle: 'picture-in-picture',
      audioSource: 'original',
      createdAt: '2024-01-18T16:45:00Z',
    },
  ];

  // Select the original video by default
  useEffect(() => {
    const originalVideo = mockVideos.find(v => !v.isDuet);
    if (originalVideo) {
      setSelectedVideo(originalVideo);
      loadDuetData(originalVideo.id);
    }
  }, []);

  const loadDuetData = async (videoId: string) => {
    setIsLoading(true);
    try {
      // Simulate API calls with mock data
      const duets = mockVideos.filter(v => v.duetOfPostId === videoId);
      setDuetChain(duets);
      
      // Mock duet stats
      const stats = {
        totalDuets: duets.length,
        styleBreakdown: duets.reduce((acc: any, duet) => {
          const style = duet.duetStyle || 'side-by-side';
          acc[style] = (acc[style] || 0) + 1;
          return acc;
        }, {}),
        audioBreakdown: duets.reduce((acc: any, duet) => {
          const audio = duet.audioSource || 'both';
          acc[audio] = (acc[audio] || 0) + 1;
          return acc;
        }, {}),
      };
      setDuetStats(stats);
    } catch (error) {
      console.error('Error loading duet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load duet data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoSelect = (video: MockVideo) => {
    setSelectedVideo(video);
    if (!video.isDuet) {
      loadDuetData(video.id);
    }
  };

  const handleDuetComplete = (duetData: any) => {
    toast({
      title: 'Duet Created!',
      description: 'Your duet has been successfully created and posted.',
    });
    
    // Refresh duet data
    if (selectedVideo) {
      loadDuetData(selectedVideo.id);
    }
  };

  const getDuetStyleIcon = (style: string) => {
    switch (style) {
      case 'side-by-side':
        return <Users className="w-4 h-4" />;
      case 'react-respond':
        return <MessageCircle className="w-4 h-4" />;
      case 'picture-in-picture':
        return <Video className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getDuetStyleName = (style: string) => {
    switch (style) {
      case 'side-by-side':
        return 'Side-by-Side';
      case 'react-respond':
        return 'React & Respond';
      case 'picture-in-picture':
        return 'Picture-in-Picture';
      default:
        return 'Unknown Style';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  if (!selectedVideo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading duet demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Duet Feature Demo
              </h1>
              <p className="text-gray-400">Experience the complete duet creation system</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-600">
              <Video className="w-3 h-3 mr-1" />
              Live Demo
            </Badge>
            <Badge variant="outline">
              v1.0
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {selectedVideo.isDuet ? (
                      <>
                        {getDuetStyleIcon(selectedVideo.duetStyle || 'side-by-side')}
                        Duet Video
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        Original Video
                      </>
                    )}
                  </CardTitle>
                  {selectedVideo.isDuet && (
                    <Badge variant="secondary">
                      {getDuetStyleName(selectedVideo.duetStyle || 'side-by-side')}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <DuetEnabledVideoPlayer
                  video={selectedVideo}
                  allowDuets={!selectedVideo.isDuet}
                  autoPlay={false}
                  showControls={true}
                  onDuetComplete={handleDuetComplete}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Duet Stats */}
            {duetStats && !selectedVideo.isDuet && (
              <Card className="bg-gray-900 border-gray-800 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Duet Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {duetStats.totalDuets}
                      </div>
                      <div className="text-sm text-gray-400">Total Duets</div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Duet Styles</h4>
                      {Object.entries(duetStats.styleBreakdown).map(([style, count]: [string, any]) => (
                        <div key={style} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {getDuetStyleIcon(style)}
                            {getDuetStyleName(style)}
                          </span>
                          <span className="text-gray-400">{count}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Audio Mix</h4>
                      {Object.entries(duetStats.audioBreakdown).map(([audio, count]: [string, any]) => (
                        <div key={audio} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{audio === 'voiceover' ? 'Voice Only' : audio}</span>
                          <span className="text-gray-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Selection */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Demo Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockVideos.map((video) => (
                  <div
                    key={video.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedVideo.id === video.id
                        ? 'bg-blue-600/20 border border-blue-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={video.author.avatar} />
                        <AvatarFallback>{video.author.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            @{video.author.username}
                          </span>
                          {video.author.verified && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-400 truncate">
                          {video.title}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(video.stats.likes)}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(video.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {video.isDuet && (
                          <Badge variant="outline" className="text-xs">
                            Duet
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Duet Chain */}
            {!selectedVideo.isDuet && duetChain.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Duet Chain ({duetChain.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {duetChain.slice(0, 5).map((duet) => (
                    <div
                      key={duet.id}
                      className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleVideoSelect(duet)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={duet.author.avatar} />
                          <AvatarFallback>{duet.author.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getDuetStyleIcon(duet.duetStyle)}
                            <span className="font-medium text-sm">
                              @{duet.author.username}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {getDuetStyleName(duet.duetStyle)} • {formatNumber(duet.stats.likes)} likes
                          </p>
                        </div>
                        
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(duet.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {duetChain.length > 5 && (
                    <Button variant="ghost" className="w-full text-sm">
                      View all {duetChain.length} duets
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Feature Highlights */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">✨ Duet Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Camera className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Real-time Recording</h4>
                      <p className="text-xs text-gray-400">Synchronized recording with original video</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Multiple Styles</h4>
                      <p className="text-xs text-gray-400">Side-by-side, react & respond, PiP</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Audio Mixing</h4>
                      <p className="text-xs text-gray-400">Original, voiceover, or both audio sources</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Analytics</h4>
                      <p className="text-xs text-gray-400">Track duet performance and engagement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuetDemo;
