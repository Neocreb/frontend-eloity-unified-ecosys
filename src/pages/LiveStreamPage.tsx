import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '@/utils/utils';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageCircle, 
  Heart, Share, Gift, Users, Settings, Maximize, Minimize,
  Play, Pause, Volume2, VolumeX, Send, MoreHorizontal,
  Zap, Crown, Trophy, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { liveStreamService, LiveStream } from '@/services/liveStreamService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const LiveStreamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
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
  const [likes, setLikes] = useState(0);
  const [showLikes, setShowLikes] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor">("good");
  
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
        console.error("Error fetching stream:", getErrorMessage(error));
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
        "More please!",
        "🔥🔥🔥",
        "You're so talented!",
        "How do you do this?",
        "Subscribed!",
        "Best streamer ever!",
        "Can you do that again?",
        "Mind blown! 🤯"
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
    
    // Simulate likes
    const likeInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLikes(prev => prev + Math.floor(Math.random() * 5));
        setShowLikes(true);
        setTimeout(() => setShowLikes(false), 2000);
      }
    }, 4000);
    
    return () => {
      clearInterval(viewerInterval);
      clearInterval(commentInterval);
      clearInterval(likeInterval);
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
    
    toast({
      title: "Gift Sent!",
      description: `You sent a ${giftType}`,
    });
  };
  
  // Handle like
  const handleLike = () => {
    setLikes(prev => prev + 1);
    setShowLikes(true);
    
    // Hide like animation after delay
    setTimeout(() => setShowLikes(false), 1000);
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
        {/* Video Background with Animated Gradient */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-red-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_70%)]"></div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-red-500/5 animate-pulse"
              style={{
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 200 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 5 + 3}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Video Placeholder - In a real implementation, this would be an actual video stream */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <div className="text-center z-10">
            <div className="relative inline-block mb-6">
              <Video className="w-24 h-24 text-red-500 mx-auto mb-4 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-ping">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-white">{stream.title}</h2>
            <p className="text-gray-300 mb-6 text-lg max-w-md mx-auto">{stream.description || 'Live stream in progress'}</p>
            
            {/* Streamer Info */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Avatar className="w-16 h-16 border-2 border-white/20">
                <AvatarImage src={stream.user?.avatar_url || "https://i.pravatar.cc/150"} />
                <AvatarFallback>{stream.user?.username?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-xl">
                    @{stream.user?.username || "Unknown"}
                  </span>
                  {stream.user?.is_verified && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div className="text-gray-400">
                  {stream.user?.full_name || "Unknown User"}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Live Indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-red-500/20 text-red-400 border-none text-sm px-3 py-1.5 animate-pulse"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <span className="font-bold">LIVE</span>
            </div>
          </Badge>
          
          {/* Connection Quality */}
          <Badge
            variant="secondary"
            className={cn(
              "border-none text-xs px-2 py-1",
              connectionQuality === "excellent" && "bg-green-500/20 text-green-400",
              connectionQuality === "good" && "bg-yellow-500/20 text-yellow-400",
              connectionQuality === "poor" && "bg-red-500/20 text-red-400"
            )}
          >
            {connectionQuality === "excellent" && "Excellent"}
            {connectionQuality === "good" && "Good"}
            {connectionQuality === "poor" && "Poor"}
          </Badge>
        </div>
        
        {/* Viewer Count and Likes */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-black/40 text-white border-none text-sm px-3 py-1.5 backdrop-blur-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            {viewerCount.toLocaleString()}
          </Badge>
          
          <Badge
            variant="secondary"
            className="bg-black/40 text-white border-none text-sm px-3 py-1.5 backdrop-blur-sm"
          >
            <Heart className="w-4 h-4 mr-2" />
            {likes.toLocaleString()}
          </Badge>
        </div>
        
        {/* Gift Animation */}
        {showGifts && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="text-8xl animate-bounce">🎁</div>
          </div>
        )}
        
        {/* Like Animation */}
        {showLikes && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
            <div className="text-6xl text-red-500 animate-ping">❤️</div>
          </div>
        )}
        
        {/* Video Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 hover:scale-110 transition-all duration-300 shadow-lg"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
          </Button>
          
          <Button
            size="icon"
            variant="secondary"
            className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 hover:scale-110 transition-all duration-300 shadow-lg"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
          </Button>
          
          <Button
            size="icon"
            variant="secondary"
            className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 hover:scale-110 transition-all duration-300 shadow-lg"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="w-7 h-7" /> : <Maximize className="w-7 h-7" />}
          </Button>
          
          <Button
            size="icon"
            variant="destructive"
            className="w-14 h-14 rounded-full bg-red-500/80 backdrop-blur-sm hover:bg-red-600 hover:scale-110 transition-all duration-300 shadow-lg"
            onClick={() => navigate('/app/videos')}
          >
            <PhoneOff className="w-7 h-7" />
          </Button>
        </div>
      </div>
      
      {/* Chat Overlay */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-black/80 backdrop-blur-sm flex flex-col z-30">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {comments.length} messages
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(false)}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2 group">
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
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="w-3 h-3" />
                    </Button>
                    <span className="text-gray-400 text-xs">{comment.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Gift Section */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {[
                { name: 'Rose', icon: '🌹', price: 1 },
                { name: 'Heart', icon: '❤️', price: 5 },
                { name: 'Diamond', icon: '💎', price: 10 },
                { name: 'Crown', icon: '👑', price: 25 },
                { name: 'Rocket', icon: '🚀', price: 50 },
                { name: 'Fireworks', icon: '🎆', price: 100 }
              ].map((gift, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0 text-xs flex flex-col items-center gap-1 h-auto py-2 px-2"
                  onClick={() => sendGift(gift.name)}
                >
                  <span className="text-lg">{gift.icon}</span>
                  <span>{gift.price}</span>
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
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
      
      {/* Toggle Chat Button */}
      {!showChat && (
        <Button
          variant="secondary"
          className="absolute top-4 right-4 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 hover:scale-110 transition-all duration-300 z-30"
          onClick={() => setShowChat(true)}
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      )}
      
      {/* Streamer Controls (if this is the streamer's own stream) */}
      {user?.id === stream.user_id && (
        <div className="absolute bottom-24 left-4 flex gap-2 z-10">
          <Button
            size="icon"
            variant={isCameraOn ? "default" : "destructive"}
            className="w-12 h-12 rounded-full hover:scale-110 transition-all duration-300"
            onClick={() => setIsCameraOn(!isCameraOn)}
          >
            {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
          
          <Button
            size="icon"
            variant={isMicOn ? "default" : "destructive"}
            className="w-12 h-12 rounded-full hover:scale-110 transition-all duration-300"
            onClick={() => setIsMicOn(!isMicOn)}
          >
            {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
        </div>
      )}
      
      {/* Floating Action Buttons */}
      <div className="absolute left-4 bottom-24 md:bottom-32 flex flex-col gap-3 z-10">
        {/* Like Button */}
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-red-400 transition-all duration-300 shadow-lg hover:scale-110 border border-red-500/30"
          onClick={handleLike}
        >
          <Heart className="w-7 h-7" />
        </Button>
        
        {/* Gift Button */}
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 backdrop-blur-sm text-white transition-all duration-300 shadow-lg hover:scale-110"
          onClick={() => {
            // Show gift panel or modal
            toast({
              title: "Send Gift",
              description: "Select a gift to send to the streamer",
            });
          }}
        >
          <Gift className="w-7 h-7" />
        </Button>
        
        {/* Share Button */}
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg hover:scale-110"
        >
          <Share className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
};

export default LiveStreamPage;
