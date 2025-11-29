import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '@/utils/utils';
import { 
  Swords, Users, Heart, MessageCircle, Share, Gift, 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, PhoneOff,
  Send, Crown, Trophy, Zap, Flame, Target, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { liveStreamService, LiveStream } from '@/services/liveStreamService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const BattlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
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
  const [votes, setVotes] = useState({ challenger: 0, opponent: 0 });
  const [showVotes, setShowVotes] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor">("good");
  
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
          title: "EPIC RAP BATTLE",
          description: "Two legendary creators going head to head in an epic showdown!",
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
        setVotes({
          challenger: mockBattle.battle.challenger_score,
          opponent: mockBattle.battle.opponent_score
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("Error fetching battle:", errorMessage);
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
        "Best battle ever!",
        "🔥🔥🔥",
        "Who's your pick?",
        "Incredible skills!",
        "Mind blown! 🤯",
        "Can't look away!",
        "This is legendary!",
        "History in the making!",
        "GOAT level talent!"
      ];
      
      const users = [
        { username: "rapfan123", avatar: "https://i.pravatar.cc/150?u=rapfan123" },
        { username: "battlelover", avatar: "https://i.pravatar.cc/150?u=battlelover" },
        { username: "musicmaster", avatar: "https://i.pravatar.cc/150?u=musicmaster" },
        { username: "tiktokstar", avatar: "https://i.pravatar.cc/150?u=tiktokstar" },
        { username: "hiphophead", avatar: "https://i.pravatar.cc/150?u=hiphophead" },
        { username: "lyricgenius", avatar: "https://i.pravatar.cc/150?u=lyricgenius" }
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
    
    // Simulate votes
    const voteInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setVotes(prev => {
          const isChallenger = Math.random() > 0.5;
          return {
            challenger: isChallenger ? prev.challenger + 1 : prev.challenger,
            opponent: isChallenger ? prev.opponent : prev.opponent + 1
          };
        });
        setShowVotes(true);
        setTimeout(() => setShowVotes(false), 1500);
      }
    }, 3000);
    
    return () => {
      clearInterval(timerInterval);
      clearInterval(viewerInterval);
      clearInterval(commentInterval);
      clearInterval(voteInterval);
    };
  }, [id, navigate]);
  
  // Handle voting
  const voteForChallenger = () => {
    setVotes(prev => ({
      ...prev,
      challenger: prev.challenger + 1
    }));
    setShowVotes(true);
    
    // Hide vote animation after delay
    setTimeout(() => setShowVotes(false), 1000);
    
    toast({
      title: "Vote Cast!",
      description: "You voted for the Challenger!",
    });
  };
  
  const voteForOpponent = () => {
    setVotes(prev => ({
      ...prev,
      opponent: prev.opponent + 1
    }));
    setShowVotes(true);
    
    // Hide vote animation after delay
    setTimeout(() => setShowVotes(false), 1000);
    
    toast({
      title: "Vote Cast!",
      description: "You voted for the Opponent!",
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
    
    toast({
      title: "Gift Sent!",
      description: `You sent a ${giftType}`,
    });
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
  
  // Calculate vote percentages
  const totalVotes = votes.challenger + votes.opponent;
  const challengerPercentage = totalVotes > 0 ? (votes.challenger / totalVotes) * 100 : 50;
  const opponentPercentage = totalVotes > 0 ? (votes.opponent / totalVotes) * 100 : 50;
  
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Battle Arena */}
      <div className="relative h-full w-full">
        {/* Battle Background with Animated Gradient */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-red-900/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_70%)]"></div>
        </div>
        
        {/* Animated Battle Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-purple-500/5 animate-pulse"
              style={{
                width: `${Math.random() * 150 + 50}px`,
                height: `${Math.random() * 150 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 4 + 3}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Battle Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10 max-w-3xl mx-auto px-4">
            {/* Battle Title */}
            <div className="relative mb-8">
              <Swords className="w-24 h-24 text-yellow-400 mx-auto mb-4 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
              BATTLE IN PROGRESS
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">{battle.title}</h2>
            <p className="text-gray-300 mb-8 text-lg max-w-xl mx-auto">{battle.description || 'Epic creator battle'}</p>
            
            {/* Battle Arena */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center mb-10">
              {/* Challenger */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 p-2 mx-auto">
                    <Avatar className="w-full h-full rounded-full border-4 border-white/20">
                      <AvatarImage src="https://i.pravatar.cc/150?u=challenger" />
                      <AvatarFallback>C</AvatarFallback>
                    </Avatar>
                  </div>
                  {battle.user?.is_verified && (
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{votes.challenger}</div>
                <div className="text-white font-medium text-lg">@battleking</div>
                <div className="text-gray-400">Battle King</div>
                <Button
                  size="lg"
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-all duration-300"
                  onClick={voteForChallenger}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Vote
                </Button>
              </div>
              
              {/* VS Indicator */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-500 to-red-500 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white font-bold text-2xl md:text-3xl">VS</span>
                </div>
                <div className="text-yellow-400 font-bold text-xl md:text-2xl mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-gray-400 text-sm">TIME LEFT</div>
                
                {/* Vote Progress Bar */}
                <div className="mt-6 w-full max-w-[200px] mx-auto">
                  <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-1000"
                      style={{ width: `${challengerPercentage}%` }}
                    />
                    <div 
                      className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-1000"
                      style={{ width: `${opponentPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{Math.round(challengerPercentage)}%</span>
                    <span>{Math.round(opponentPercentage)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Opponent */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-red-500 to-pink-500 p-2 mx-auto">
                    <Avatar className="w-full h-full rounded-full border-4 border-white/20">
                      <AvatarImage src="https://i.pravatar.cc/150?u=opponent" />
                      <AvatarFallback>O</AvatarFallback>
                    </Avatar>
                  </div>
                  {true && ( // Mock verified status
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-red-400 mb-2">{votes.opponent}</div>
                <div className="text-white font-medium text-lg">@epicfighter</div>
                <div className="text-gray-400">Epic Fighter</div>
                <Button
                  size="lg"
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-all duration-300"
                  onClick={voteForOpponent}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Vote
                </Button>
              </div>
            </div>
            
            {/* Battle Type */}
            <div className="flex justify-center mb-6">
              <Badge
                variant="secondary"
                className="bg-purple-500/20 text-purple-400 border-none text-lg px-6 py-2"
              >
                <Trophy className="w-5 h-5 mr-2" />
                {battle.battle?.battle_type?.toUpperCase() || 'GENERAL'} BATTLE
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Battle Indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-purple-500/20 text-purple-400 border-none text-sm px-3 py-1.5 animate-pulse"
          >
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span className="font-bold">BATTLE</span>
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
        
        {/* Viewer Count */}
        <div className="absolute top-4 right-4">
          <Badge
            variant="secondary"
            className="bg-black/40 text-white border-none text-sm px-3 py-1.5 backdrop-blur-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            {viewerCount.toLocaleString()}
          </Badge>
        </div>
        
        {/* Gift Animation */}
        {showGifts && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="text-8xl animate-bounce">🏆</div>
          </div>
        )}
        
        {/* Vote Animation */}
        {showVotes && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
            <div className="text-6xl text-yellow-400 animate-ping">⚡</div>
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
              Battle Chat
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
                <Swords className="w-5 h-5" />
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
                placeholder="Vote and comment..."
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
      
      {/* Floating Action Buttons */}
      <div className="absolute left-4 bottom-24 md:bottom-32 flex flex-col gap-3 z-10">
        {/* Vote for Challenger */}
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm text-blue-400 transition-all duration-300 shadow-lg hover:scale-110 border border-blue-500/30"
          onClick={voteForChallenger}
        >
          <Heart className="w-7 h-7" />
        </Button>
        
        {/* Vote for Opponent */}
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-red-400 transition-all duration-300 shadow-lg hover:scale-110 border border-red-500/30"
          onClick={voteForOpponent}
        >
          <Heart className="w-7 h-7" />
        </Button>
        
        {/* Gift Button */}
        <Button
          size="icon"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 backdrop-blur-sm text-white transition-all duration-300 shadow-lg hover:scale-110"
          onClick={() => {
            toast({
              title: "Send Gift",
              description: "Select a gift to send to the creators",
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

export default BattlePage;
