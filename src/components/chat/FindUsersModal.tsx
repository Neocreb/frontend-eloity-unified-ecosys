import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
        className="max-w-md mx-auto max-h-[90vh] flex flex-col"
        style={{
          maxHeight: isMobile ? '100vh' : '90vh',
          height: isMobile ? '100vh' : 'auto',
          margin: isMobile ? '0' : '1.5rem',
          borderRadius: isMobile ? '0' : undefined,
        }}
      >
        <DialogHeader className={isMobile ? "p-4" : "p-6 pb-0"}>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Find People
            </DialogTitle>
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
        
        {/* Suggested Users */}
        <div className="flex-1 min-h-0">
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