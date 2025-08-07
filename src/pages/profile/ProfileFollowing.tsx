import React, { useState, useEffect } from "react";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  UserMinus,
  Check,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  followsBack?: boolean;
  isOnline?: boolean;
  bio?: string;
  followers?: number;
  followedDate?: string;
}

const ProfileFollowing: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"all" | "mutual" | "verified">("all");

  // Mock following data
  const mockFollowing: User[] = [
    {
      id: "1",
      username: "tech_guru",
      displayName: "Tech Guru",
      avatar: "/placeholder.svg",
      verified: true,
      followsBack: true,
      isOnline: true,
      bio: "Tech industry insights and trends",
      followers: 45600,
      followedDate: "6 months ago",
    },
    {
      id: "2",
      username: "design_master",
      displayName: "Design Master",
      avatar: "/placeholder.svg",
      verified: true,
      followsBack: false,
      isOnline: false,
      bio: "Creating beautiful user experiences",
      followers: 23400,
      followedDate: "3 months ago",
    },
    {
      id: "3",
      username: "crypto_expert",
      displayName: "Crypto Expert",
      avatar: "/placeholder.svg",
      verified: false,
      followsBack: true,
      isOnline: true,
      bio: "Cryptocurrency analysis and trading tips",
      followers: 12800,
      followedDate: "1 month ago",
    },
    {
      id: "4",
      username: "startup_founder",
      displayName: "Startup Founder",
      avatar: "/placeholder.svg",
      verified: true,
      followsBack: true,
      isOnline: false,
      bio: "Building the next unicorn",
      followers: 67900,
      followedDate: "2 weeks ago",
    },
    {
      id: "5",
      username: "marketing_pro",
      displayName: "Marketing Pro",
      avatar: "/placeholder.svg",
      verified: false,
      followsBack: false,
      isOnline: true,
      bio: "Digital marketing strategies that work",
      followers: 8900,
      followedDate: "1 week ago",
    },
  ];

  useEffect(() => {
    let filtered = mockFollowing.filter(
      (user) =>
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Apply filters
    if (filter === "mutual") {
      filtered = filtered.filter(user => user.followsBack);
    } else if (filter === "verified") {
      filtered = filtered.filter(user => user.verified);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filter]);

  useEffect(() => {
    // Initialize following states (all are true since we're following them)
    const states: Record<string, boolean> = {};
    mockFollowing.forEach((user) => {
      states[user.id] = true;
    });
    setFollowingStates(states);
  }, []);

  const handleUnfollow = (userId: string) => {
    setFollowingStates((prev) => ({
      ...prev,
      [userId]: false,
    }));
  };

  const handleUserClick = (userUsername: string) => {
    navigate(`/app/profile/${userUsername}`);
  };

  const handleMessage = (userUsername: string) => {
    navigate(`/app/chat?user=${userUsername}`);
  };

  const handleSendMoney = (userUsername: string) => {
    navigate(`/app/wallet?action=send&recipient=${userUsername}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/app/profile/${username}`)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 flex-1">
              <Users className="h-5 w-5 text-indigo-600" />
              <h1 className="text-lg sm:text-xl font-bold">Following</h1>
              <Badge variant="secondary" className="text-xs">
                {filteredUsers.length}
              </Badge>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search following..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="text-xs"
              >
                All
              </Button>
              <Button
                variant={filter === "mutual" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("mutual")}
                className="text-xs"
              >
                Mutual
              </Button>
              <Button
                variant={filter === "verified" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("verified")}
                className="text-xs"
              >
                Verified
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {filteredUsers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? "No one matches your search" : "Not following anyone yet"}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchQuery ? "Try adjusting your search terms" : "Start following people to see them here!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar with online status */}
                    <div className="relative flex-shrink-0">
                      <Avatar
                        className="h-12 w-12 sm:h-14 sm:w-14 cursor-pointer"
                        onClick={() => handleUserClick(user.username)}
                      >
                        <AvatarImage src={user.avatar} alt={user.displayName} />
                        <AvatarFallback className="text-sm">
                          {user.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleUserClick(user.username)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm sm:text-base truncate">
                            {user.displayName}
                          </span>
                          {user.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          {user.followsBack && (
                            <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                              Follows you
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">@{user.username}</div>
                        {user.bio && (
                          <p className="text-sm text-gray-700 mb-2 line-clamp-2">{user.bio}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{user.followers?.toLocaleString()} followers</span>
                          <span>Following since {user.followedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                      {followingStates[user.id] ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUnfollow(user.id)}
                          className="text-xs px-3 py-2 w-full sm:w-auto hover:bg-red-100 hover:text-red-600 hover:border-red-200"
                        >
                          <UserMinus className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Unfollow</span>
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-xs px-3 py-2">
                          Unfollowed
                        </Badge>
                      )}

                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMessage(user.username)}
                          className="p-2"
                          title="Message"
                        >
                          <MessageCircle className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMoney(user.username)}
                          className="p-2"
                          title="Send Money"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileFollowing;
