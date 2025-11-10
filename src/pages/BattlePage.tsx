import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Swords, Users, Heart, MessageCircle, Share, Gift, 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, PhoneOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { liveStreamService, LiveStream } from '@/services/liveStreamService';
import { useAuth } from '@/contexts/AuthContext';

const BattlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [battle, setBattle] = useState<LiveStream & { battle: any } | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [gifts, setGifts] = useState<any[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch battle data
  useEffect(() => {
    const fetchBattle = async () => {
      if (!id) return;
      
      try {
        // In a real implementation, we would fetch the specific battle
        // For now, we'll simulate a battle
        const mockBattle = {
          id: id,
          user_id: "user1",
          title: "Epic Rap Battle",
          description: "Two creators going head to head",
          viewer_count: 1250,
          is_active: true,
          started_at: new Date().toISOString(),
          ended_at: null,
          category: "rap",
          user: {
            username: "battleking",
            full_name: "Battle King",
            avatar_url: "https://i.pravatar.cc/150?u=battleking",
            is_verified: true
          },
          battle: {
            id: id,
            live_stream_id: id,
            challenger_id: "user1",
            opponent_id: "user2",
            battle_type: "rap",
            time_remaining: 300,
            challenger_score: 45,
            opponent_score: 38,
            winner_id: null,
            status: "active"
          }
        };
        
        setBattle(mockBattle as any);
        setViewerCount(mockBattle.viewer_count);
        setTimeRemaining(mockBattle.battle.time_remaining);
      } catch (error) {
        console.error("Error fetching battle:", error);
        navigate('/app/videos');
      }
    };
    
    fetchBattle();
    
    // Simulate timer countdown
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    
    // Simulate viewer count updates
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    
    // Simulate comments
    const commentInterval = setInterval(() => {
      const fakeComments = [
        "Challenger is winning!",
        "This is epic!",
        "Vote for challenger!",
        "Opponent needs to step up!",
        "AMAZING battle!",
        "Both are talented!",
        "Challenger for the win!",
        "Opponent comeback!",
        "This is fire!",
        "Best battle ever!"
      ];
      
      const users = [
        { username: "rapfan123", avatar: "https://i.pravatar.cc/150?u=rapfan123" },
        { username: "battlelover", avatar: "https://i.pravatar.cc/150?u=battlelover" },
        { username: "musicmaster", avatar: "https://i.pravatar.cc/150?u=musicmaster" },
        { username: "tiktokstar", avatar: "https://i.pravatar.cc/150?u=tiktokstar" }
      ];
      
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const newFakeComment = {
        id: Date.now(),
        user: {
          username: randomUser.username,
          avatar_url: randomUser.avatar
        },
        content: fakeComments[Math.floor(Math.random() * fakeComments.length)],
        likes: Math.floor(Math.random() * 15),
        timestamp: new Date()
      };
      
      setComments(prev => [...prev.slice(-49), newFakeComment]);
      
      // Scroll to bottom
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 2000);
    
    return () => {
      clearInterval(timerInterval);
      clearInterval(viewerInterval);
      clearInterval(commentInterval);
    };
  }, [id, navigate]);
  
  // Handle voting
  const voteForChallenger = () => {
    // In a real implementation, this would update the backend
    setBattle(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        battle: {
          ...prev.battle,
          challenger_score: prev.battle.challenger_score + 1
        }
      };
    });
  };
  
  const voteForOpponent = () => {
    // In a real implementation, this would update the backend
    setBattle(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        battle: {
          ...prev.battle,
          opponent_score: prev.battle.opponent_score + 1
        }
      };
    });
  };
  
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
  
  if (!battle) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading battle...</p>
        </div>
      </div>
    );
  }
  
  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Battle Arena */}
      <div className="relative h-full w-full">
        {/* Battle Background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/70 via-pink-900/70 to-red-900/70 flex items-center justify-center">
          <div className="text-center">
            <Swords className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">{battle.title}</h2>
            <p className="text-gray-300 mb-6">{battle.description || 'Epic creator battle'}</p>
            
            {/* Battle Scores */}
            <div className="flex justify-center items-center gap-12 mb-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mb-2">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="https://i.pravatar.cc/150?u=challenger" />
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-3xl font-bold text-blue-400">{battle.battle.challenger_score}</div>
                <div className="text-sm text-gray-300">Challenger</div>
                <Button
                  size="sm"
                  className="mt-2 bg-blue-500 hover:bg-blue-600"
                  onClick={voteForChallenger}
                >
                  Vote
                </Button>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">VS</div>
                <div className="text-xl font-bold text-white">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-gray-300">Time Left</div>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-2">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src="https://i.pravatar.cc/150?u=opponent" />
                    <AvatarFallback>O</AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-3xl font-bold text-red-400">{battle.battle.opponent_score}</div>
                <div className="text-sm text-gray-300">Opponent</div>
                <Button
                  size="sm"
                  className="mt-2 bg-red-500 hover:bg-red-600"
                  onClick={voteForOpponent}
                >
                  Vote
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Battle Indicator */}
        <div className="absolute top-4 left-4">
          <Badge
            variant="secondary"
            className="bg-purple-500/20 text-purple-400 border-none text-sm px-3 py-1"
          >
            <Swords className="w-4 h-4 mr-2" />
            BATTLE
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
            <div className="text-6xl animate-bounce">🏆</div>
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
            <h3 className="font-semibold">Battle Chat</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChat(false)}
            >
              <Swords className="w-5 h-5" />
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
              {['Rose ($1)', 'Coffee ($2)', 'Pizza ($5)', 'Diamond ($10)', 'Crown ($20)'].map((gift, index) => (
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
                placeholder="Vote and comment..."
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
    </div>
  );
};

export default BattlePage;