import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, X } from "lucide-react";
import { SuggestedUsers } from "@/components/social/SuggestedUsers";
import { useIsMobile } from "@/hooks/use-mobile";

const FindUsers = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Helmet>
        <title>Find People | Eloity</title>
        <meta
          name="description"
          content="Find and connect with people on Eloity"
        />
      </Helmet>
      <div className="h-screen bg-background flex flex-col">
        {/* Header with back button */}
        <div className="border-b p-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-1 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">Choose People</h3>
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/app/chat")}
                className="ml-auto p-1 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="p-3 border-b">
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
        
        {/* Suggested Users */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              <SuggestedUsers
                title=""
                showTitle={false}
                variant="list"
                maxUsers={20}
                onUserClick={async (username) => {
                  // TODO: Implement user selection logic
                  console.log("Selected user:", username);
                }}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default FindUsers;