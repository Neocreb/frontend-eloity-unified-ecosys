import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageCircle, 
  Heart, Share, Gift, Users, Settings, Maximize, Minimize,
  Play, Pause, Volume2, VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { liveStreamService, LiveStream } from '@/services/liveStreamService';
import { useAuth } from '@/contexts/AuthContext';

const LiveStreamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [gifts, setGifts] = useState<any[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch stream data
  useEffect(() => {
    const fetchStream = async () => {
      if (!id) return;
      
      try {
        const streamData = await liveStreamService.getLiveStreamById(id);
        if (streamData) {
          setStream(streamData);
          setViewerCount(streamData.viewer_count || 0);
        }
      } catch (error) {
        console.error("Error fetching stream:", error);
        navigate('/app/videos');
      }
    };
    
    fetchStream();
    
    // Simulate viewer count updates
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    
    // Simulate comments
    const commentInterval = setInterval(() => {
      const fakeComments = [
        "Amazing stream!",
        "Love this content!",
        "Keep it up!",
        "So entertaining!",
        "Great job!",
        "Following now!",
        "This is awesome!",
        "More please!"
      ];
      
      const newFakeComment = {
        id: Date.now(),
        user: {
          username: `user${Math.floor(Math.random() * 1000)}`,
          avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`
        },
        content: fakeComments[Math.floor(Math.random() * fakeComments.length)],
        likes: Math.floor(Math.random() * 10),
        timestamp: new Date()
      };
      
      setComments(prev => [...prev.slice(-49), newFakeComment]);
      
      // Scroll to bottom
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 3000);
    
    return () => {
      clearInterval(viewerInterval);
      clearInterval(commentInterval);
    };
  }, [id, navigate]);
  
  // Handle gift sending
  const sendGift = (giftType: string) => {
    const newGift = {
      id: Date.now(),
      user: user?.username || "You",
      gift: giftType,
      timestamp: new Date()
    };
    
    setGifts(prev => [...prev, newGift]);
    setShowGifts(true);
    
    // Hide gift after animation
    setTimeout(() => {
      setShowGifts(false);
    }, 3000);
  };
  
  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      user: {
        username: user?.username || "You",
        avatar_url: user?.avatar_url || "https://i.pravatar.cc/150"
      },
      content: newComment,
      likes: 0,
      timestamp: new Date()
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment("");
    
    // Scroll to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };
  
  if (!stream) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading stream...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Video Player */}
      <div className="relative h-full w-full">
        {/* Video Placeholder - In a real implementation, this would be an actual video stream */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
          <div className="text-center">
            <Video className="w-24 h-24 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">{stream.title}</h2>
            <p className="text-gray-300 mb-4">{stream.description || 'Live stream in progress'}</p>
            <div className="flex items-center justify-center gap-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={stream.user?.avatar_url || "https://i.pravatar.cc/150"} />
                <AvatarFallback>{stream.user?.username?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span className="text-white font-medium">@{stream.user?.username || "Unknown"}</span>
            </div>
          </div>
        </div>
        
        {/* Live Indicator */}
        <div className="absolute top-4 left-4">
          <Badge
            variant="secondary"
            className="bg-red-500/20 text-red-400 border-none text-sm px-3 py-1 animate-pulse"
          >
            LIVE
          </Badge>
        </div>
        
        {/* Viewer Count */}
        <div className="absolute top-4 right-4">
          <Badge
            variant="secondary"
            className="bg-black/40 text-white border-none text-sm px-3 py-1"
          >
            <Users className="w-4 h-4 mr-2" />
            {viewerCount.toLocaleString()}
          </Badge>
        </div>
        
        {/* Gift Animation */}
        {showGifts && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-6xl animate-bounce">🎁</div>
          </div>
        )}
        
        {/* Video Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
          <Button
            size="icon"
            variant="secondary"
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          
          <Button
            size="icon"
            variant="secondary"
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
          
          <Button
            size="icon"
            variant="secondary"
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
          </Button>
          
          <Button
            size="icon"
            variant="destructive"
            className="w-12 h-12 rounded-full bg-red-500/80 backdrop-blur-sm hover:bg-red-600"
            onClick={() => navigate('/app/videos')}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
      
      {/* Chat Overlay */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-black/80 backdrop-blur-sm flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-semibold">Live Chat</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChat(false)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={comment.user.avatar_url} />
                  <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm truncate">
                      {comment.user.username}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-white text-sm mt-1">{comment.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <Heart className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Gift Section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {['Rose ($1)', 'Coffee ($2)', 'Pizza ($5)', 'Diamond ($10)'].map((gift, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0 text-xs"
                  onClick={() => sendGift(gift)}
                >
                  {gift}
                </Button>
              ))}
            </div>
            
            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Say something..."
                className="flex-1 bg-gray-800 border-gray-600 text-white"
              />
              <Button 
                type="submit"
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
      
      {/* Toggle Chat Button */}
      {!showChat && (
        <Button
          variant="secondary"
          className="absolute top-4 right-4 rounded-full bg-black/50 backdrop-blur-sm"
          onClick={() => setShowChat(true)}
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      )}
      
      {/* Streamer Controls (if this is the streamer's own stream) */}
      {user?.id === stream.user_id && (
        <div className="absolute bottom-20 left-4 flex gap-2">
          <Button
            size="icon"
            variant={isCameraOn ? "default" : "destructive"}
            className="w-10 h-10 rounded-full"
            onClick={() => setIsCameraOn(!isCameraOn)}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          
          <Button
            size="icon"
            variant={isMicOn ? "default" : "destructive"}
            className="w-10 h-10 rounded-full"
            onClick={() => setIsMicOn(!isMicOn)}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiveStreamPage;