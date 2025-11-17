import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        className="flex flex-col max-w-full md:max-w-md mx-0 md:mx-auto h-screen md:h-[90vh] md:rounded-lg p-0 max-h-[100vh] md:max-h-[90vh]"
        style={{
          margin: 0,
          borderRadius: isMobile ? 0 : '0.5rem',
        }}
      >
        <DialogHeader className={isMobile ? "p-4" : "p-6 pb-0"}>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Find People
              </DialogTitle>
              <DialogDescription>
                Search and connect with users on the platform
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
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </DialogHeader>
        
        {/* Suggested Users - Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
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
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};