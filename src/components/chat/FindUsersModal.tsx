import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { SuggestedUsers } from "@/components/profile/SuggestedUsers";
import { useIsMobile } from "@/hooks/use-mobile";

interface FindUsersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FindUsersModal: React.FC<FindUsersModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="flex flex-col max-w-full mx-0 h-screen p-0 rounded-none"
        style={{
          margin: 0,
        }}
      >
        <DialogHeader className="p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Find People
              </DialogTitle>
              <DialogDescription className="text-xs">
                Search and connect with users
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="p-1 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </DialogHeader>
        
        {/* Suggested Users - Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-3">
            <SuggestedUsers
              title=""
              showTitle={false}
              variant="list"
              maxUsers={20}
              onUserClick={async (username: string) => {
                // TODO: Implement user selection logic
                console.log("Selected user:", username);
                onOpenChange(false);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};