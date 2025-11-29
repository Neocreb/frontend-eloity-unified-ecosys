import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Users,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSuggestedUsersData, useLiveNowData } from "@/hooks/use-sidebar-widgets";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface SuggestedUser {
  id: string;
  name?: string;
  username?: string;
  avatar?: string;
  verified?: boolean;
  mutualFriends?: number;
  profile?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    is_verified?: boolean;
    followers_count?: number;
  };
}

interface LiveStream {
  id: string;
  title: string;
  viewerCount: number;
  user: {
    displayName: string;
    avatar: string;
  };
}

const SuggestedSidebar: React.FC<{ maxUsers?: number }> = ({ maxUsers = 6 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: suggestedUsers = [], isLoading: usersLoading } = useSuggestedUsersData(maxUsers);
  const { liveStreams = [] } = useLiveNowData();
  const [following, setFollowing] = React.useState<Record<string, boolean>>({});
  const [isLoadingFollow, setIsLoadingFollow] = React.useState<Record<string, boolean>>({});

  const toggleFollowUser = async (userId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingFollow((prev) => ({ ...prev, [userId]: true }));
      const currentFollowing = !!following[userId];
      setFollowing((prev) => ({ ...prev, [userId]: !currentFollowing }));

      const { toggleFollow } = await import("@/services/profileService");
      await toggleFollow(user.id, userId, currentFollowing);

      toast({
        title: currentFollowing ? "Unfollowed" : "Following",
        description: currentFollowing
          ? "You unfollowed this user"
          : "You are now following this user",
      });
    } catch (error) {
      console.error("Follow action failed", error);
      // Revert the state on error
      setFollowing((prev) => ({ ...prev, [userId]: !following[userId] }));
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFollow((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleLiveStreamClick = (streamId: string) => {
    navigate(`/app/live/${streamId}`);
  };

  const formatUserData = (user: SuggestedUser) => {
    const name = user.name || user.profile?.full_name || user.username || "Unknown User";
    const id = user.id || user.profile?.id || "unknown";
    const username = user.username || user.profile?.username || "user";
    const avatar = user.avatar || user.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    const verified = Boolean(user.verified || user.profile?.is_verified);
    const mutualConnections = user.mutualFriends ?? Math.floor((user.profile?.followers_count || 0) % 16);

    return { name, id, username, avatar, verified, mutualConnections };
  };

  return (
    <div className="space-y-4">
      {/* Suggested Users Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {usersLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : suggestedUsers && suggestedUsers.length > 0 ? (
            suggestedUsers.map((suggestedUser: SuggestedUser) => {
              const { name, id, username, avatar, verified, mutualConnections } = formatUserData(suggestedUser);
              const isFollowing = !!following[id];
              const isLoadingThisUser = isLoadingFollow[id];

              return (
                <div key={id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>{String(name).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <p className="font-medium text-sm truncate" title={name}>
                        {name}
                      </p>
                      {verified && (
                        <Badge variant="secondary" className="h-4 w-4 p-0 rounded-full bg-blue-500 flex-shrink-0">
                          <span className="text-white text-xs flex items-center justify-center w-full h-full">✓</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {mutualConnections} mutual connections
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isFollowing ? "secondary" : "outline"}
                    className="text-xs px-2 py-1 h-auto flex-shrink-0"
                    onClick={() => toggleFollowUser(id)}
                    disabled={isLoadingThisUser}
                  >
                    {isLoadingThisUser ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isFollowing ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No suggestions available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Now Card */}
      {liveStreams && liveStreams.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Play className="h-4 w-4" />
              Live Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {liveStreams.map((content: LiveStream) => (
              <div
                key={content.id}
                className="relative cursor-pointer group rounded-lg overflow-hidden"
                onClick={() => handleLiveStreamClick(content.id)}
              >
                <div className="relative">
                  <img
                    src={content.user.avatar}
                    alt={content.title}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="destructive" className="absolute top-2 right-2 text-xs animate-pulse">
                    LIVE
                  </Badge>
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {content.viewerCount}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-sm truncate" title={content.title}>
                    {content.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{content.user.displayName}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuggestedSidebar;
