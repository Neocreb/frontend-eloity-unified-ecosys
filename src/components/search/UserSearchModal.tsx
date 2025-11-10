import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserService, UserWithProfile } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';

interface UserSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (user: UserWithProfile) => void;
  title?: string;
  placeholder?: string;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({ 
  open, 
  onOpenChange,
  onSelectUser,
  title = "Search Users",
  placeholder = "Search users..."
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSelectUser = (user: UserWithProfile) => {
    onSelectUser(user);
    onOpenChange(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          {isSearching ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => handleSelectUser(user)}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar_url || user.avatar || undefined} />
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {user.full_name || user.username}
                    </div>
                    {user.username && (
                      <div className="text-xs text-gray-500 truncate">
                        @{user.username}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery.trim() !== '' ? (
            <div className="text-center py-4 text-gray-500">
              No users found
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchModal;