import React from 'react';
import { Swords, Users, Trophy, Heart, MessageCircle, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LiveStream } from '@/services/liveStreamService';

interface BattleCardProps {
  battle: LiveStream & { battle: any };
  onClick: () => void;
}

const BattleCard: React.FC<BattleCardProps> = ({ battle, onClick }) => {
  return (
    <div 
      className="relative h-screen w-full bg-black snap-start snap-always cursor-pointer"
      onClick={onClick}
    >
      {/* Battle Background */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/70 via-pink-900/70 to-red-900/70 flex items-center justify-center">
        <div className="text-center">
          <Swords className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">BATTLE IN PROGRESS</h3>
          <p className="text-gray-300 mb-4">{battle.title}</p>
          
          {/* Battle Scores */}
          <div className="flex justify-center items-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{battle.battle.challenger_score || 0}</div>
              <div className="text-sm text-gray-300">Challenger</div>
            </div>
            <div className="text-2xl font-bold text-yellow-400">VS</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{battle.battle.opponent_score || 0}</div>
              <div className="text-sm text-gray-300">Opponent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

      {/* Battle Indicator */}
      <div className="absolute top-4 left-4">
        <Badge
          variant="secondary"
          className="bg-purple-500/20 text-purple-400 border-none text-xs px-2 py-1"
        >
          <Swords className="w-3 h-3 mr-1" />
          BATTLE
        </Badge>
      </div>

      {/* Viewer Count */}
      <div className="absolute top-4 right-4">
        <Badge
          variant="secondary"
          className="bg-black/40 text-white border-none text-xs px-2 py-1"
        >
          <Users className="w-3 h-3 mr-1" />
          {battle.viewer_count?.toLocaleString() || '0'}
        </Badge>
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex">
        {/* Left side - battle info */}
        <div className="flex-1 flex flex-col justify-end p-4 pb-24">
          <div className="space-y-3">
            {/* Battle Type */}
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">
                {battle.battle.battle_type?.toUpperCase() || 'GENERAL'} BATTLE
              </span>
            </div>
            
            {/* Time Remaining */}
            {battle.battle.time_remaining && (
              <div className="text-white/80 text-xs">
                Time remaining: {Math.floor(battle.battle.time_remaining / 60)}:{(battle.battle.time_remaining % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Interactive Features */}
        <div className="flex flex-col items-center justify-end gap-4 p-4 pb-32">
          {/* Vote Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="w-14 h-14 rounded-full bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm text-blue-400 transition-all duration-300 shadow-lg border border-blue-500/30"
            >
              <div className="flex flex-col items-center">
                <Heart className="w-5 h-5" />
                <span className="text-xs mt-1">Vote</span>
              </div>
            </Button>
            
            <Button
              size="sm"
              className="w-14 h-14 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-red-400 transition-all duration-300 shadow-lg border border-red-500/30"
            >
              <div className="flex flex-col items-center">
                <Heart className="w-5 h-5" />
                <span className="text-xs mt-1">Vote</span>
              </div>
            </Button>
          </div>

          {/* Comment Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg"
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
            <span className="text-white text-xs font-medium">Comment</span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg"
            >
              <Share className="w-7 h-7" />
            </Button>
            <span className="text-white text-xs font-medium">Share</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleCard;