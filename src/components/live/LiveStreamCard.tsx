import React from 'react';
import { Users, Radio, Heart, MessageCircle, Share } from 'lucide-react';
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
      className="relative h-screen w-full bg-black snap-start snap-always cursor-pointer"
      onClick={onClick}
    >
      {/* Live Stream Thumbnail/Video Placeholder */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-white text-xl font-bold mb-2">{stream.title}</h3>
          <p className="text-gray-300">{stream.description || 'Live stream in progress'}</p>
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

      {/* Live Indicator */}
      <div className="absolute top-4 left-4">
        <Badge
          variant="secondary"
          className="bg-red-500/20 text-red-400 border-none text-xs px-2 py-1 animate-pulse"
        >
          LIVE
        </Badge>
      </div>

      {/* Viewer Count */}
      <div className="absolute top-4 right-4">
        <Badge
          variant="secondary"
          className="bg-black/40 text-white border-none text-xs px-2 py-1"
        >
          <Users className="w-3 h-3 mr-1" />
          {stream.viewer_count?.toLocaleString() || '0'}
        </Badge>
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex">
        {/* Left side - user info */}
        <div className="flex-1 flex flex-col justify-end p-4 pb-24">
          <div className="space-y-3">
            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarImage src={stream.user?.avatar_url || "https://i.pravatar.cc/150"} />
                <AvatarFallback>{stream.user?.username?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm truncate">
                    @{stream.user?.username || "Unknown"}
                  </span>
                  {stream.user?.is_verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div className="text-white/80 text-xs">
                  {stream.user?.full_name || "Unknown User"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Interactive Features */}
        <div className="flex flex-col items-center justify-end gap-4 p-4 pb-32">
          {/* User Avatar */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-14 h-14 border-2 border-white/20">
              <AvatarImage src={stream.user?.avatar_url || "https://i.pravatar.cc/150"} />
              <AvatarFallback>{stream.user?.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>

          {/* Like Button */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="icon"
              className="w-14 h-14 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white transition-all duration-300 shadow-lg"
            >
              <Heart className="w-7 h-7" />
            </Button>
            <span className="text-white text-xs font-medium">Like</span>
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

export default LiveStreamCard;