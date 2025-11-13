// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { apiClient } from "@/lib/api";
import { UserProfile } from "@/types/user";

interface SuggestedUsersProps {
  title?: string;
  maxUsers?: number;
  showTitle?: boolean;
  variant?: "card" | "list" | "grid";
  onUserClick?: (username: string) => void;
  showGiftButton?: boolean;
  onSendGift?: (user: any) => void;
  users?: any[]; // Add custom users prop
  loading?: boolean; // Add loading prop
}

// Simple badge component since import is failing
const SimpleBadge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className || ""}`}>
    {children}
  </div>
);

export const SuggestedUsers: React.FC<SuggestedUsersProps> = ({
  title = "Discover Users",
  maxUsers = 6,
  showTitle = true,
  variant = "card",
  onUserClick,
  showGiftButton = false,
  onSendGift,
  users: customUsers, // Accept custom users
  loading: customLoading, // Accept custom loading state
}) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Use custom users if provided, otherwise fetch suggested users
  const shouldFetchUsers = !customUsers;
  const displayUsers = customUsers || users;
  const displayLoading = customLoading !== undefined ? customLoading : loading;

  useEffect(() => {
    // Only fetch if custom users are not provided
    if (shouldFetchUsers) {
      const fetchSuggestedUsers = async () => {
        try {
          setLoading(true);
          const response = await apiClient.getSuggestedUsers(maxUsers);
          
          if (response?.users) {
            setUsers(response.users);
          } else {
            // Following project specification: return empty results when API fails
            console.warn('No suggested users data received from API');
            setUsers([]);
          }
        } catch (error) {
          // Following project specification: log warnings and return empty results
          console.warn('Failed to fetch suggested users:', error);
          setUsers([]);
        } finally {
          setLoading(false);
        }
      };

      fetchSuggestedUsers();
    }
  }, [maxUsers, shouldFetchUsers]);

  const handleUserClick = (username: string) => {
    if (onUserClick) {
      onUserClick(username);
    } else {
      navigate(`/app/profile/${username}`);
    }
  };

  const getUserTypeIcon = (profile: any) => {
    if (profile?.marketplace_profile)
      return <Store className="w-4 h-4 text-green-600" />;
    if (profile?.freelance_profile)
      return <Code className="w-4 h-4 text-blue-600" />;
    if (profile?.crypto_profile)
      return <TrendingUp className="w-4 h-4 text-orange-600" />;
    if (profile?.social_profile)
      return <Camera className="w-4 h-4 text-purple-600" />;
    if (profile?.business_profile)
      return <Briefcase className="w-4 h-4 text-gray-600" />;
    return <Users className="w-4 h-4 text-gray-500" />;
  };

  const getUserTypeBadge = (profile: any) => {
    if (profile?.marketplace_profile) {
      return (
        <SimpleBadge className="border-green-400 text-green-600">
          <Store className="w-3 h-3 mr-1" />
          Seller
        </SimpleBadge>
      );
    }
    if (profile?.freelance_profile) {
      return (
        <SimpleBadge className="border-blue-400 text-blue-600">
          <Code className="w-3 h-3 mr-1" />
          Freelancer
        </SimpleBadge>
      );
    }
    if (profile?.crypto_profile) {
      return (
        <SimpleBadge className="border-orange-400 text-orange-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          Trader
        </SimpleBadge>
      );
    }
    if (profile?.social_profile) {
      return (
        <SimpleBadge className="border-purple-400 text-purple-600">
          <Camera className="w-3 h-3 mr-1" />
          Creator
        </SimpleBadge>
      );
    }
    return (
      <SimpleBadge>
        <Users className="w-3 h-3 mr-1" />
        User
      </SimpleBadge>
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Early return for loading state
  if (displayLoading) {
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
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Early return for empty state
  if (displayUsers.length === 0) {
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
        <CardContent className="text-center py-8">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No suggested users available</p>
        </CardContent>
      </Card>
    );
  }

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
        {displayUsers.map((user, index) => (
          <div
            key={user.id || index}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() =>
              handleUserClick(user.username || user.profile?.username || user.name || `user-${index}`)
            }
          >
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={user.avatar_url || user.profile?.avatar_url}
                alt={user.full_name || user.profile?.full_name || user.name || "User"}
              />
              <AvatarFallback>
                {(user.full_name || user.profile?.full_name || user.name || "U")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm truncate">
                  {user.full_name || user.profile?.full_name || user.name || "Anonymous User"}
                </span>
                {(user.is_verified || user.profile?.is_verified) && (
                  <Verified className="w-4 h-4 text-blue-500" />
                )}
                {getUserTypeIcon(user.profile || user)}
              </div>

              <p className="text-xs text-muted-foreground mb-1">
                @{user.username || user.profile?.username || user.name || `user-${index}`}
              </p>

              <div className="flex items-center gap-2">
                {getUserTypeBadge(user.profile || user)}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {user.reputation || user.profile?.reputation || 0}
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
};

export default SuggestedUsers;
