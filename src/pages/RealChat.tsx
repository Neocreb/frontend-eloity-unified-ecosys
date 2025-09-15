import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Users, Send, Plus } from "lucide-react";

const RealChat = () => {
  const { 
    conversations, 
    loading, 
    startConversation 
  } = useRealtimeChat();

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return (
    <>
      <Helmet>
        <title>Messages | Eloity</title>
        <meta
          name="description"
          content="Real-time messaging with users, freelancers, and marketplace sellers"
        />
      </Helmet>
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Messages</h1>
                <p className="text-muted-foreground">
                  {totalUnread > 0 ? `${totalUnread} unread messages` : 'All messages read'}
                </p>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{conversations.length}</p>
                  <p className="text-sm text-muted-foreground">Active Chats</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{totalUnread}</p>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Send className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Recent Conversations
                {totalUnread > 0 && (
                  <Badge variant="destructive">{totalUnread}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading conversations...</p>
                </div>
              ) : conversations.length > 0 ? (
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div 
                      key={conversation.id} 
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
                        (conversation.unreadCount || 0) > 0 ? 'bg-primary/5 border-primary/20' : ''
                      }`}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              Chat {conversation.id.substring(0, 8)}...
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {conversation.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conversation.updatedAt))} ago
                            </span>
                            {(conversation.unreadCount || 0) > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {conversation.participants.length} participants
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start chatting with other users, freelancers, or marketplace sellers
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RealChat;