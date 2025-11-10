import React from 'react';
import { Users, Radio, Heart, MessageCircle, Share, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LiveStream } from '@/services/liveStreamService';

interface LiveStreamCardProps {
  stream: LiveStream;
  onClick: () => void;
}

const LiveStreamCard: React.FC<LiveStreamCardProps> = ({ stream, onClick }) => {
  return (
    <div 
      className="relative h-screen w-full bg-black snap-start snap-always cursor-pointer group"
      onClick={onClick}
    >
      {/* Live Stream Background with Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-red-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0)_70%)]"></div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-red-500/10 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Live Stream Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center z-10">
          <div className="relative inline-block">
            <Radio className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-ping">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <h3 className="text-white text-2xl font-bold mb-2 drop-shadow-lg">{stream.title}</h3>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">{stream.description || 'Live stream in progress'}</p>
          
          {/* Streamer Info */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Avatar className="w-12 h-12 border-2 border-white/20">
              <AvatarImage src={stream.user?.avatar_url || "https://i.pravatar.cc/150"} />
              <AvatarFallback>{stream.user?.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-lg">
                  @{stream.user?.username || "Unknown"}
                </span>
                {stream.user?.is_verified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="text-gray-400 text-sm">
                {stream.user?.full_name || "Unknown User"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Indicator with Animation */}
      <div className="absolute top-4 left-4">
        <Badge
          variant="secondary"
          className="bg-red-500/20 text-red-400 border-none text-sm px-3 py-1.5 animate-pulse"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <Radio className="w-3.5 h-3.5" />
            <span className="font-bold">LIVE</span>
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
          {stream.viewer_count?.toLocaleString() || '0'}
        </Badge>
      </div>

      {/* Interactive Features Overlay - Hidden by default, shown on hover */}
      <div className="absolute right-4 bottom-24 md:bottom-32 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Like Button */}
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg hover:scale-110"
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

      {/* Stream Info Bar at Bottom */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white/20">
                <AvatarImage src={stream.user?.avatar_url || "https://i.pravatar.cc/150"} />
                <AvatarFallback>{stream.user?.username?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white font-medium">{stream.user?.username || "Unknown"}</div>
                <div className="text-gray-400 text-xs">{stream.category || "General"}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xs h-8 px-3"
              >
                <Zap className="w-3 h-3 mr-1" />
                Join
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamCard;