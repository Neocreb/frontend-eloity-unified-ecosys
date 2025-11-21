import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Search,
  UserPlus,
  Check,
  Clock,
  MessageCircle,
  Send,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  isFollowing?: boolean;
  followsBack?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  bio?: string;
  followers?: number;
}

const UserFollowers: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call to fetch followers
        // const response = await profileService.getFollowers(username);
        // setUsers(response);
        setUsers([]);
      } catch (error) {
        console.error("Failed to load followers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (username) {
      loadFollowers();
    }
  }, [username]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchQuery]);

  useEffect(() => {
    const states: Record<string, boolean> = {};
    users.forEach((user) => {
      states[user.id] = user.isFollowing || false;
    });
    setFollowingStates(states);
  }, [users]);

  const handleFollowToggle = (userId: string) => {
    setFollowingStates((prev) => ({
      ...prev,
      [userId]: !prev[userId],
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
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b dark:border-slate-700">
        <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate dark:text-white">
              Followers
            </h1>
            <p className="text-sm text-muted-foreground dark:text-slate-400 truncate">
              @{username}
            </p>
          </div>
          <Badge variant="secondary" className="flex-shrink-0 dark:bg-slate-700 dark:text-white">
            {filteredUsers.length}
          </Badge>
        </div>

        {/* Search */}
        <div className="px-4 py-3 sm:px-6 border-t dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search followers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* User List */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-3 sm:px-6 space-y-2">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground dark:text-slate-400">Loading followers...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2 dark:text-white">No followers yet</h3>
              <p className="text-muted-foreground text-sm px-4 dark:text-slate-400">
                {searchQuery ? "No users match your search" : "Start connecting with people!"}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                {/* Avatar with online status */}
                <div className="relative flex-shrink-0">
                  <Avatar
                    className="h-12 w-12 sm:h-14 sm:w-14 cursor-pointer"
                    onClick={() => handleUserClick(user.username)}
                  >
                    <AvatarImage src={user.avatar} alt={user.displayName} />
                    <AvatarFallback className="text-sm dark:bg-slate-700 dark:text-white">
                      {user.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleUserClick(user.username)}
                  >
                    <span className="font-semibold text-sm sm:text-base truncate dark:text-white">
                      {user.displayName.length > 20
                        ? `${user.displayName.slice(0, 20)}...`
                        : user.displayName}
                    </span>
                    {user.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground dark:text-slate-400 flex items-center gap-1 flex-wrap">
                    <span className="truncate max-w-[140px]">
                      @{user.username.length > 15 ? `${user.username.slice(0, 15)}...` : user.username}
                    </span>
                    {user.followsBack && (
                      <Badge variant="secondary" className="text-xs px-1.5 h-5 dark:bg-slate-700 dark:text-white">
                        Follows you
                      </Badge>
                    )}
                  </div>
                  {user.bio && (
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1 truncate">
                      {user.bio.length > 50 ? `${user.bio.slice(0, 50)}...` : user.bio}
                    </p>
                  )}
                  {user.followers && (
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
                      {user.followers.toLocaleString()} followers
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0">
                  <Button
                    variant={followingStates[user.id] ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleFollowToggle(user.id)}
                    className="text-xs px-2 py-1 h-8 w-full sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {followingStates[user.id] ? (
                      <>
                        <Check className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Follow</span>
                      </>
                    )}
                  </Button>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMessage(user.username)}
                      className="text-xs p-1 h-8 w-8 dark:border-slate-600 dark:hover:bg-slate-800"
                      title="Message"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendMoney(user.username)}
                      className="text-xs p-1 h-8 w-8 dark:border-slate-600 dark:hover:bg-slate-800"
                      title="Send Money"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserFollowers;
