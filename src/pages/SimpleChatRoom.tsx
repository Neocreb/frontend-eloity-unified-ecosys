import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { GroupDataTest } from "@/components/debug/GroupDataTest";
import { GroupInfoModal } from "@/components/chat/group/GroupInfoModal";

const SimpleChatRoom = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const chatType = searchParams.get("type") || "social";
  
  const [loading, setLoading] = useState(true);
  const [chatData, setChatData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  useEffect(() => {
    const loadChat = async () => {
      try {
        console.log("Loading simple chat for:", threadId, chatType);
        
        // Try localStorage first
        const stored = localStorage.getItem(`chat_${threadId}`);
        if (stored) {
          const data = JSON.parse(stored);
          console.log("Found stored data:", data);
          setChatData(data);
        } else {
          // Create simple mock data
          const mockData = {
            id: threadId,
            type: chatType,
            isGroup: threadId?.includes('group'),
            groupName: threadId?.includes('group') ? 'Test Group' : undefined,
            participant_profile: !threadId?.includes('group') ? {
              id: 'test_user',
              name: 'Test User',
              avatar: null,
              is_online: true
            } : undefined,
            participants: threadId?.includes('group') ? [
              {
                id: user?.id || 'current',
                name: user?.profile?.full_name || 'You',
                role: 'admin',
                isActive: true,
                isOnline: true,
                joinedAt: new Date().toISOString(),
                addedBy: 'current'
              }
            ] : [],
            lastMessage: 'Test message',
            lastMessageAt: new Date().toISOString()
          };
          console.log("Created mock data:", mockData);
          setChatData(mockData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error in loadChat:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    if (threadId) {
      loadChat();
    } else {
      setLoading(false);
      setError("No thread ID provided");
    }
  }, [threadId, chatType, user]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2 text-destructive">Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/app/chat")}>
            Back to Chats
          </Button>
        </div>
      </div>
    );
  }

  if (!chatData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">No Data</h2>
          <p className="text-sm text-muted-foreground mb-4">No chat data found</p>
          <Button onClick={() => navigate("/app/chat")}>
            Back to Chats
          </Button>
        </div>
      </div>
    );
  }

  const displayName = chatData.isGroup ? chatData.groupName : chatData.participant_profile?.name;

  return (
    <>
      <Helmet>
        <title>Simple Chat with {displayName} | Eloity</title>
      </Helmet>

      <div className="h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/chat")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{displayName}</h3>
                {chatData.isGroup && <Users className="h-4 w-4" />}
              </div>
              <p className="text-sm text-muted-foreground">
                {chatData.isGroup 
                  ? `${chatData.participants?.length || 0} members`
                  : "Online"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {/* Group Data Validation for group chats */}
            {chatData.isGroup && (
              <GroupDataTest group={chatData} />
            )}

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Debug Info</h4>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(chatData, null, 2)}
              </pre>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm">
                ✅ Simple chat room loaded successfully! This means the basic routing and data loading works.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Thread ID: {threadId}, Type: {chatType}
              </p>

              {/* Test Group Modal for group chats */}
              {chatData.isGroup && (
                <div className="mt-4">
                  <Button
                    onClick={() => setShowGroupModal(true)}
                    variant="outline"
                    size="sm"
                  >
                    🧪 Test Group Info Modal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Group Info Modal */}
      {chatData?.isGroup && showGroupModal && (
        <GroupInfoModal
          trigger={<div />}
          group={chatData}
          currentUserId="current"
          onUpdateGroup={async (request) => {
            console.log("Test update group:", request);
          }}
          isOpen={showGroupModal}
          onOpenChange={setShowGroupModal}
        />
      )}
    </>
  );
};

export default SimpleChatRoom;
