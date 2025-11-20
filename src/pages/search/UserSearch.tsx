import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Users, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserService, UserWithProfile } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface UserSearchPageProps {
  onSelectUser?: (user: UserWithProfile) => void;
  title?: string;
  placeholder?: string;
}

const UserSearchPage: React.FC<UserSearchPageProps> = ({ 
  onSelectUser,
  title = "Search Users",
  placeholder = "Search users..."
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);

  // Search for users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await UserService.searchUsers(searchQuery, 20);
        // Filter out the current user
        const filteredResults = results.filter(u => u.id !== user?.id);
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user?.id]);

  const handleSelectUser = (selectedUser: UserWithProfile) => {
    setSelectedUser(selectedUser);
    if (onSelectUser) {
      onSelectUser(selectedUser);
    }
    // Navigate to user profile or stay here depending on use case
    navigate(`/app/profile/${selectedUser.username || selectedUser.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col dark:bg-gray-950">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 flex-shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-4 sm:space-y-6">
          {/* Search Input */}
          <div className="relative sticky top-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur -mx-4 px-4 py-3 sm:py-4 sm:mx-0 sm:bg-transparent sm:dark:bg-transparent sm:backdrop-blur-0 sm:sticky-none">
            <Search className="absolute left-7 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-600 w-4 h-4 flex-shrink-0" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-10 h-10 sm:h-11 text-sm sm:text-base dark:bg-gray-900 dark:border-gray-800"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 flex-shrink-0 dark:hover:bg-gray-900"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Search Results or Empty State */}
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-700 border-t-primary"></div>
                <p className="text-sm text-muted-foreground">Searching users...</p>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2 pb-4">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium px-2">
                {searchResults.length} {searchResults.length === 1 ? 'user' : 'users'} found
              </p>
              {searchResults.map((u) => (
                <div
                  key={u.id}
                  className={cn(
                    "flex items-center gap-3 p-3 sm:p-4 rounded-lg cursor-pointer",
                    "hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors",
                    selectedUser?.id === u.id && "bg-gray-100 dark:bg-gray-900"
                  )}
                  onClick={() => handleSelectUser(u)}
                >
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                    <AvatarImage src={u.avatar_url || u.avatar || undefined} />
                    <AvatarFallback className="dark:bg-gray-800">
                      {u.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base truncate dark:text-gray-100">
                      {u.full_name || u.username}
                    </div>
                    {u.username && (
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        @{u.username}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/profile/${u.username || u.id}`);
                    }}
                    className="flex-shrink-0 dark:border-gray-700 dark:hover:bg-gray-900"
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery.trim() !== '' ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-900">
                    <Users className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No users found</p>
                <p className="text-xs text-muted-foreground">Try searching with a different name or username</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-900">
                    <Search className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Find people</p>
                <p className="text-xs text-muted-foreground max-w-xs">{placeholder}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchPage;
