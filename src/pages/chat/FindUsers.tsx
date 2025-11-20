import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Users, ChevronLeft } from "lucide-react";
import { SuggestedUsers } from "@/components/profile/SuggestedUsers";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface FindUsersPageProps {
  onUserClick?: (username: string) => void;
}

const FindUsersPage: React.FC<FindUsersPageProps> = ({ onUserClick }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  const handleUserClick = async (username: string) => {
    if (onUserClick) {
      await onUserClick(username);
    }
    // Navigate to user profile
    navigate(`/app/profile/${username}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col dark:bg-gray-950">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-50 p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 flex-shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold dark:text-gray-100">
                Find People
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
                Search and connect with users
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-10 h-10 text-sm dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 dark:hover:bg-gray-900"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - Scrollable Users List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-3 sm:p-4 pb-6 sm:pb-8">
          <SuggestedUsers
            title=""
            showTitle={false}
            variant="list"
            maxUsers={20}
            onUserClick={handleUserClick}
          />
        </div>
      </div>

      {/* Quick info footer */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 text-center text-xs sm:text-sm text-muted-foreground dark:text-gray-400">
        Click on a user to view their profile or start a conversation
      </div>
    </div>
  );
};

export default FindUsersPage;
