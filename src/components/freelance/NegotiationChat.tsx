// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Paperclip,
  MoreVertical,
  Download,
  FileText,
  Image,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Smile,
  Search,
} from "lucide-react";
import { useFreelanceMessaging } from "@/hooks/use-freelance";
import { FreelanceMessageWithSender } from "@/services/freelanceMessagingService";
import { useToast } from "@/hooks/use-toast";

interface NegotiationChatProps {
  projectId: string;
  currentUserId: string;
  projectStatus: "negotiation" | "active" | "completed" | "cancelled";
  participants: {
    client: {
      id: string;
      name: string;
      avatar: string;
    };
    freelancer: {
      id: string;
      name: string;
      avatar: string;
    };
  };
}

export const NegotiationChat: React.FC<NegotiationChatProps> = ({
  projectId,
  currentUserId,
  projectStatus,
  participants,
}) => {
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    loading,
    unreadCount,
    sendMessage,
    markAsRead,
    uploadAttachment,
    searchMessages,
  } = useFreelanceMessaging(projectId);

  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0 && unreadCount > 0) {
      markAsRead(currentUserId);
    }
  }, [messages, unreadCount, currentUserId, markAsRead]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const result = await sendMessage(messageInput.trim());
    if (result) {
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const attachment = await uploadAttachment(file);
        if (attachment) {
          await sendMessage(`📎 Uploaded: ${file.name}`, [attachment.url]);
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "file":
        return <Paperclip className="w-4 h-4" />;
      case "milestone":
        return <Calendar className="w-4 h-4" />;
      case "payment":
        return <DollarSign className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffHours < 48) {
      return (
        "Yesterday " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const isOwnMessage = (message: FreelanceMessageWithSender) => {
    return message.senderId === currentUserId;
  };

  const getOtherParticipant = () => {
    return currentUserId === participants.client.id
      ? participants.freelancer
      : participants.client;
  };

  const MessageBubble: React.FC<{ message: FreelanceMessageWithSender }> = ({
    message,
  }) => {
    const isOwn = isOwnMessage(message);
    const isSystem = message.senderId === "system";

    if (isSystem) {
      return (
        <div className="flex justify-center my-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
            {getMessageTypeIcon(message.messageType)}
            <span>{message.content}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"} mb-4`}
      >
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
        </Avatar>

        <div
          className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}
        >
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            <div className="text-sm">{message.content}</div>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs opacity-80"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{attachment}</span>
                    <Button variant="ghost" size="sm" className="h-auto p-1">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(message.createdAt)}
            </span>
            {isOwn && (
              <div className="text-xs text-muted-foreground">
                {message.read ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProjectStatusBanner = () => {
    if (projectStatus === "active") return null;

    const statusConfig = {
      negotiation: {
        icon: <AlertTriangle className="w-4 h-4" />,
        text: "Project is in negotiation phase",
        color: "bg-yellow-50 border-yellow-200 text-yellow-800",
      },
      completed: {
        icon: <CheckCircle2 className="w-4 h-4" />,
        text: "Project has been completed",
        color: "bg-green-50 border-green-200 text-green-800",
      },
      cancelled: {
        icon: <AlertTriangle className="w-4 h-4" />,
        text: "Project has been cancelled",
        color: "bg-red-50 border-red-200 text-red-800",
      },
    };

    const config = statusConfig[projectStatus];

    return (
      <div
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg mb-4 ${config.color}`}
      >
        {config.icon}
        <span className="text-sm font-medium">{config.text}</span>
      </div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={getOtherParticipant().avatar} />
            <AvatarFallback>{getOtherParticipant().name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm">
              {getOtherParticipant().name}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Project Details</DropdownMenuItem>
              <DropdownMenuItem>Message History</DropdownMenuItem>
              <DropdownMenuItem>Report Issue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Search Bar */}
        {showSearch && (
          <div className="px-4 py-2 border-b">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
        )}

        <ProjectStatusBanner />

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">Start the conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Send a message to begin discussing project details
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={getOtherParticipant().avatar} />
                    <AvatarFallback>
                      {getOtherParticipant().name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{getOtherParticipant().name} is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <Separator />

        {/* Message Input */}
        <div className="p-4">
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <div className="flex-1">
              <Input
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={
                  projectStatus === "completed" || projectStatus === "cancelled"
                }
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={
                !messageInput.trim() ||
                projectStatus === "completed" ||
                projectStatus === "cancelled"
              }
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {(projectStatus === "completed" || projectStatus === "cancelled") && (
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Messaging is disabled for {projectStatus} projects
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NegotiationChat;
