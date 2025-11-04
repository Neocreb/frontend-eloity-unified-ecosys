import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, X, Check } from "lucide-react";
import { UserService } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
}

interface TagPeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagged: (users: User[]) => void;
  currentlyTagged: User[];
}

const TagPeopleModal: React.FC<TagPeopleModalProps> = ({
  isOpen,
  onClose,
  onTagged,
  currentlyTagged
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>(currentlyTagged);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await UserService.searchUsers(searchTerm || "", 50);
      
      // Transform to User interface
      const transformedUsers: User[] = fetchedUsers.map(u => ({
        id: u.id,
        name: u.full_name || u.username || "Unknown",
        username: u.username || "",
        avatar: u.avatar_url || u.avatar || "/placeholder.svg",
        verified: u.is_verified || false
      }));

      // Filter out current user
      const filteredUsers = transformedUsers.filter(u => u.id !== currentUser?.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (user: User) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleDone = () => {
    onTagged(selectedUsers);
    onClose();
  };

  const handleClose = () => {
    setSelectedUsers(currentlyTagged);
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full h-[70vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Tag people</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-b">
            <p className="text-sm font-medium mb-2">Tagged ({selectedUsers.length})</p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <Badge key={user.id} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  <span className="text-sm">{user.name}</span>
                  <button
                    onClick={() => removeUser(user.id)}
                    className="hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Users list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>{searchTerm ? "No users found" : "Start typing to search users"}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map(user => {
                const isSelected = selectedUsers.some(u => u.id === user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => toggleUser(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <p className="font-medium">{user.name}</p>
                        {user.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleDone} className="flex-1">
            Done ({selectedUsers.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TagPeopleModal;
