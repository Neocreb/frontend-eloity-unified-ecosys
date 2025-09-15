import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Code,
  TrendingUp,
  Camera,
  Briefcase,
  Users,
  Star,
  MapPin,
  Verified,
  Gift,
} from "lucide-react";
import { mockUsers } from "@/data/mockUsers";
import { UserProfile } from "@/types/user";

interface SuggestedUsersProps {
  title?: string;
  maxUsers?: number;
  showTitle?: boolean;
  variant?: "card" | "list" | "grid";
  onUserClick?: (username: string) => void;
  showGiftButton?: boolean;
  onSendGift?: (user: any) => void;
}

export const SuggestedUsers: React.FC<SuggestedUsersProps> = ({
  title = "Discover Users",
  maxUsers = 6,
  showTitle = true,
  variant = "card",
  onUserClick,
  showGiftButton = false,
  onSendGift,
}) => {
  const navigate = useNavigate();

  const handleUserClick = (username: string) => {
    if (onUserClick) {
      onUserClick(username);
    } else {
      navigate(`/app/profile/${username}`);
    }
  };

  const getUserTypeIcon = (profile: UserProfile) => {
    if (profile.marketplace_profile)
      return <Store className="w-4 h-4 text-green-600" />;
    if (profile.freelance_profile)
      return <Code className="w-4 h-4 text-blue-600" />;
    if (profile.crypto_profile)
      return <TrendingUp className="w-4 h-4 text-orange-600" />;
    if (profile.social_profile)
      return <Camera className="w-4 h-4 text-purple-600" />;
    if (profile.business_profile)
      return <Briefcase className="w-4 h-4 text-gray-600" />;
    return <Users className="w-4 h-4 text-gray-500" />;
  };

  const getUserTypeBadge = (profile: UserProfile) => {
    if (profile.marketplace_profile) {
      return (
        <Badge
          variant="outline"
          className="border-green-400 text-green-600 text-xs"
        >
          <Store className="w-3 h-3 mr-1" />
          Seller
        </Badge>
      );
    }
    if (profile.freelance_profile) {
      return (
        <Badge
          variant="outline"
          className="border-blue-400 text-blue-600 text-xs"
        >
          <Code className="w-3 h-3 mr-1" />
          Freelancer
        </Badge>
      );
    }
    if (profile.crypto_profile) {
      return (
        <Badge
          variant="outline"
          className="border-orange-400 text-orange-600 text-xs"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Trader
        </Badge>
      );
    }
    if (profile.social_profile) {
      return (
        <Badge
          variant="outline"
          className="border-purple-400 text-purple-600 text-xs"
        >
          <Camera className="w-3 h-3 mr-1" />
          Creator
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs">
        <Users className="w-3 h-3 mr-1" />
        User
      </Badge>
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const users = Object.values(mockUsers).slice(0, maxUsers);

  if (variant === "card") {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() =>
                handleUserClick(user.profile?.username || user.name)
              }
            >
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={user.profile?.avatar_url}
                  alt={user.profile?.full_name}
                />
                <AvatarFallback>
                  {user.profile?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm truncate">
                    {user.profile?.full_name}
                  </span>
                  {user.profile?.is_verified && (
                    <Verified className="w-4 h-4 text-blue-500" />
                  )}
                  {getUserTypeIcon(user.profile!)}
                </div>

                <p className="text-xs text-muted-foreground mb-1">
                  @{user.profile?.username}
                </p>

                <div className="flex items-center gap-2">
                  {getUserTypeBadge(user.profile!)}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {user.profile?.reputation || 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {showGiftButton && onSendGift && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendGift(user);
                    }}
                    className="text-pink-600 border-pink-200 hover:bg-pink-50"
                  >
                    <Gift className="h-3 w-3 mr-1" />
                    Gift
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (variant === "grid") {
    return (
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card
              key={user.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() =>
                handleUserClick(user.profile?.username || user.name)
              }
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage
                      src={user.profile?.avatar_url}
                      alt={user.profile?.full_name}
                    />
                    <AvatarFallback className="text-lg">
                      {user.profile?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="font-semibold truncate">
                        {user.profile?.full_name}
                      </h3>
                      {user.profile?.is_verified && (
                        <Verified className="w-4 h-4 text-blue-500" />
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      @{user.profile?.username}
                    </p>

                    {user.profile?.location && (
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {user.profile.location}
                      </div>
                    )}

                    <div className="flex justify-center">
                      {getUserTypeBadge(user.profile!)}
                    </div>

                    <div className="flex justify-center items-center gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-semibold">
                          {formatNumber(user.profile?.followers_count || 0)}
                        </div>
                        <div className="text-muted-foreground">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold flex items-center gap-1 justify-center">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {user.profile?.reputation || 0}
                        </div>
                        <div className="text-muted-foreground">Rating</div>
                      </div>
                    </div>

                    {showGiftButton && onSendGift && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendGift(user);
                        }}
                        className="mt-3 w-full text-pink-600 border-pink-200 hover:bg-pink-50"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Send Gift
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // List variant
  return (
    <div className="space-y-3">
      {showTitle && (
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          {title}
        </h2>
      )}
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleUserClick(user.profile?.username || user.name)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={user.profile?.avatar_url}
                alt={user.profile?.full_name}
              />
              <AvatarFallback>
                {user.profile?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {user.profile?.full_name}
                </span>
                {user.profile?.is_verified && (
                  <Verified className="w-3 h-3 text-blue-500" />
                )}
                {getUserTypeIcon(user.profile!)}
              </div>
              <p className="text-xs text-muted-foreground">
                @{user.profile?.username}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {user.profile?.reputation || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedUsers;
