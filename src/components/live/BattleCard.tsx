import React from 'react';
import { Swords, Users, Trophy, Heart, MessageCircle, Share, Zap, Crown, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LiveStream } from '@/services/liveStreamService';

interface BattleCardProps {
  battle: LiveStream & { battle: any };
  onClick: () => void;
}

const BattleCard: React.FC<BattleCardProps> = ({ battle, onClick }) => {
  // Get challenger and opponent info from battle data
  const challenger = {
    username: battle.user?.username || "challenger",
    fullName: battle.user?.full_name || "Challenger",
    avatar: battle.user?.avatar_url || "https://i.pravatar.cc/150?u=challenger",
    isVerified: battle.user?.is_verified || false,
    score: battle.battle?.challenger_score || 0
  };
  
  // For opponent, we would need to fetch their profile data
  // For now, we'll use mock data but in a real implementation this would come from the database
  const opponent = {
    username: "epicfighter",
    fullName: "Epic Fighter",
    avatar: "https://i.pravatar.cc/150?u=opponent",
    isVerified: true,
    score: battle.battle?.opponent_score || 0
  };

  return (
    <div 
      className="relative h-screen w-full bg-black snap-start snap-always cursor-pointer group"
      onClick={onClick}
    >
      {/* Battle Background with Animated Gradient */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-red-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_70%)]"></div>
      </div>
      
      {/* Animated Battle Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-purple-500/10 animate-pulse"
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

      {/* Battle Arena */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center z-10 max-w-2xl mx-auto px-4">
          {/* Battle Title */}
          <div className="relative mb-8">
            <Swords className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
            BATTLE IN PROGRESS
          </h2>
          <h3 className="text-white text-2xl font-bold mb-2 drop-shadow-lg">{battle.title}</h3>
          <p className="text-gray-300 mb-8 text-lg max-w-lg mx-auto">{battle.description || 'Epic creator battle'}</p>
          
          {/* Battle Arena */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center mb-8">
            {/* Challenger */}
            <div className="text-center">
              <div className="relative inline-block mb-3">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 p-1 mx-auto">
                  <Avatar className="w-full h-full rounded-full">
                    <AvatarImage src={challenger.avatar} />
                    <AvatarFallback>{challenger.username[0]}</AvatarFallback>
                  </Avatar>
                </div>
                {challenger.isVerified && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">{challenger.score}</div>
              <div className="text-white font-medium">@{challenger.username}</div>
              <div className="text-gray-400 text-sm">{challenger.fullName}</div>
            </div>
            
            {/* VS Indicator */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-500 to-red-500 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-xl md:text-2xl">VS</span>
              </div>
              <div className="text-yellow-400 font-bold text-sm md:text-base">
                {battle.battle?.time_remaining ? `${Math.floor(battle.battle.time_remaining / 60)}:${(battle.battle.time_remaining % 60).toString().padStart(2, '0')}` : '05:00'}
              </div>
              <div className="text-gray-400 text-xs">TIME LEFT</div>
            </div>
            
            {/* Opponent */}
            <div className="text-center">
              <div className="relative inline-block mb-3">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-red-500 to-pink-500 p-1 mx-auto">
                  <Avatar className="w-full h-full rounded-full">
                    <AvatarImage src={opponent.avatar} />
                    <AvatarFallback>{opponent.username[0]}</AvatarFallback>
                  </Avatar>
                </div>
                {opponent.isVerified && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-red-400 mb-1">{opponent.score}</div>
              <div className="text-white font-medium">@{opponent.username}</div>
              <div className="text-gray-400 text-sm">{opponent.fullName}</div>
            </div>
          </div>
          
          {/* Battle Type */}
          <div className="flex justify-center mb-6">
            <Badge
              variant="secondary"
              className="bg-purple-500/20 text-purple-400 border-none text-sm px-4 py-2"
            >
              <Trophy className="w-4 h-4 mr-2" />
              {battle.battle?.battle_type?.toUpperCase() || 'GENERAL'} BATTLE
            </Badge>
          </div>
        </div>
      </div>

      {/* Battle Indicator */}
      <div className="absolute top-4 left-4">
        <Badge
          variant="secondary"
          className="bg-purple-500/20 text-purple-400 border-none text-sm px-3 py-1.5 animate-pulse"
        >
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-bold">BATTLE</span>
          </div>
        </Badge>
      </div>

      {/* Viewer Count */}
      <div className="absolute top-4 right-4">
        <Badge
          variant="secondary"
          className="bg-black/40 text-white border-none text-sm px-3 py-1.5 backdrop-blur-sm"
        >
          <Users className="w-4 h-4 mr-2" />
          {battle.viewer_count?.toLocaleString() || '0'}
        </Badge>
      </div>

      {/* Interactive Features Overlay - Hidden by default, shown on hover */}
      <div className="absolute right-4 bottom-24 md:bottom-32 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Vote for Challenger */}
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm text-blue-400 transition-all duration-300 shadow-lg hover:scale-110 border border-blue-500/30"
        >
          <Heart className="w-5 h-5" />
        </Button>
        
        {/* Vote for Opponent */}
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-red-400 transition-all duration-300 shadow-lg hover:scale-110 border border-red-500/30"
        >
          <Heart className="w-5 h-5" />
        </Button>
        
        {/* Comment Button */}
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg hover:scale-110"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
        
        {/* Share Button */}
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg hover:scale-110"
        >
          <Share className="w-5 h-5" />
        </Button>
      </div>

      {/* Battle Info Bar at Bottom */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-white font-medium">Leader: {challenger.score > opponent.score ? challenger.username : opponent.username}</div>
                <div className="text-gray-400 text-xs">Current Score: {Math.max(challenger.score, opponent.score)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs h-8 px-3"
              >
                <Zap className="w-3 h-3 mr-1" />
                Join Battle
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleCard;