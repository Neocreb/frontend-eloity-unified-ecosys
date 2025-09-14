import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Settings, Users, Video, Phone, Search, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { UnifiedChatThread, UnifiedChatType } from "@/types/unified-chat";
import { ChatMessage, ChatParticipant } from "@/types/chat";
import { CreateGroupModal } from "./CreateGroupModal";
import { GroupSettingsModal } from "./GroupSettingsModal";
import { ChatListItem } from "./ChatListItem";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedChatInterfaceProps {
  currentUserId?: string;
  isMobile?: boolean;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  currentUserId = "current",
  isMobile = false,
}) => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<UnifiedChatThread[]>([]);
  const [activeTab, setActiveTab] = useState<UnifiedChatType>("social");
  const [selectedChat, setSelectedChat] = useState<UnifiedChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Load conversations from Supabase
  useEffect(() => {
    loadConversations();
  }, [activeTab]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Load chat conversations from Supabase
      const { data: chatData, error: chatError } = await supabase
        .from('chat_conversations')
        .select('*')
        .contains('participants', [currentUserId]);

      if (chatError) throw chatError;

      // Transform to UnifiedChatThread format
      const transformedChats: UnifiedChatThread[] = (chatData || []).map(chat => ({
        id: chat.id,
        type: activeTab,
        isAI: false,
        referenceId: null,
        participants: chat.participants,
        lastMessage: "No messages yet",
        lastMessageAt: chat.updated_at,
        updatedAt: chat.updated_at,
        createdAt: chat.created_at,
        isGroup: chat.participants.length > 2,
        title: `Chat ${chat.id.slice(0, 8)}`,
        unreadCount: 0,
      }));

      setConversations(transformedChats);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', threadId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const transformedMessages: ChatMessage[] = (messagesData || []).map(msg => ({
        id: msg.id,
        threadId: msg.conversation_id,
        senderId: msg.sender_id,
        senderName: "User",
        content: msg.content,
        timestamp: msg.created_at,
        readBy: [],
        messageType: "text"
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleTabChange = (tabId: UnifiedChatType) => {
    setActiveTab(tabId);
    setSelectedChat(null);
    setMessages([]);
  };

  const handleChatSelect = (chat: UnifiedChatThread) => {
    setSelectedChat(chat);
    loadMessages(chat.id);
  };

  const handleCreateGroup = async (request: any) => {
    try {
      // Create new conversation in Supabase
      const { data: newChat, error } = await supabase
        .from('chat_conversations')
        .insert({
          participants: [currentUserId, ...request.participants]
        })
        .select()
        .single();

      if (error) throw error;

      const newThread: UnifiedChatThread = {
        id: newChat.id,
        type: activeTab,
        isAI: false,
        referenceId: null,
        participants: newChat.participants,
        lastMessage: "Group created",
        lastMessageAt: newChat.created_at,
        updatedAt: newChat.updated_at,
        createdAt: newChat.created_at,
        isGroup: true,
        title: request.name,
        unreadCount: 0,
      };

      setConversations(prev => [newThread, ...prev]);
      setShowCreateGroup(false);

      toast({
        title: "Group Created",
        description: `${request.name} has been created successfully`,
      });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChat || !content.trim()) return;

    try {
      const { data: newMessage, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: selectedChat.id,
          sender_id: currentUserId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      const message: ChatMessage = {
        id: newMessage.id,
        threadId: selectedChat.id,
        senderId: currentUserId,
        senderName: "You",
        content: content.trim(),
        timestamp: newMessage.created_at,
        readBy: [],
        messageType: "text"
      };

      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    searchQuery === "" ||
    (conv.title && conv.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full", isMobile ? "flex-col" : "")}>
      {/* Chat List Sidebar */}
      <div className={cn(
        "border-r bg-background",
        isMobile ? "h-1/2" : "w-80 flex-shrink-0"
      )}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold capitalize">{activeTab} Chat</h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCreateGroup(true)}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateGroup(true)}
                className="mt-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                Start a conversation
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  currentUserId={currentUserId}
                  isSelected={selectedChat?.id === chat.id}
                  onClick={() => handleChatSelect(chat)}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={""} alt={selectedChat.title} />
                    <AvatarFallback>
                      {selectedChat.title ? selectedChat.title.charAt(0).toUpperCase() : "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedChat.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.isGroup ? `${selectedChat.participants.length} members` : "Active now"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  {selectedChat.isGroup && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowGroupSettings(true)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.senderId === currentUserId ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2",
                          message.senderId === currentUserId
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const content = formData.get("message") as string;
                  if (content) {
                    handleSendMessage(content);
                    e.currentTarget.reset();
                  }
                }}
                className="flex gap-2"
              >
                <Input
                  name="message"
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit">Send</Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateGroup && (
        <CreateGroupModal
          onCreateGroup={handleCreateGroup}
          onCancel={() => setShowCreateGroup(false)}
          availableContacts={[]}
          isMobile={isMobile}
        />
      )}

      {showGroupSettings && selectedChat && (
        <GroupSettingsModal
          groupChat={selectedChat as any}
          currentUserId={currentUserId}
          onUpdateGroup={() => {}}
          onLeaveGroup={() => {}}
          onDeleteGroup={() => {}}
          onClose={() => setShowGroupSettings(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default EnhancedChatInterface;
