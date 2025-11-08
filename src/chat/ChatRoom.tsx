// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { badgeVariants } from "@/components/ui/badge"; // keep as is; exported name is 'badgeVariants'
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Send,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Search,
  Star,
  Volume2,
  VolumeX,
  Trash2,
  Image as ImageIcon,
  Download,
  Reply,
  Copy,
  Forward,
} from "lucide-react";
import { ChatMessage } from "@/types/chat";
import { useChatThread } from "@/chat/hooks/useChatThread";
import { useSendMessage } from "@/chat/hooks/useSendMessage";
import {
  formatChatTitle,
  formatContextSubtitle,
  getChatTypeIcon,
  getChatTypeLabel,
  getChatTypeBadgeColor,
  shouldGroupMessages,
  formatMessageTime,
} from "@/chat/utils/chatHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { EnhancedVideoCall } from "@/components/chat/EnhancedVideoCall";
import { EnhancedMessage, EnhancedChatMessage } from "@/components/chat/EnhancedMessage";
import ChatAd from "@/components/chat/ChatAd";
import { chatAdsService } from "@/services/chatAdsService";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import WhatsAppChatInput from "@/components/chat/WhatsAppChatInput";

export const ChatRoom: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [messageInput, setMessageInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [callData, setCallData] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<Array<{id: string, name: string, avatar?: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    thread,
    messages,
    loading,
    error,
    sendMessage,
    sendFile,
    addReaction,
    deleteMessage,
    sendTypingIndicator,
  } = useChatThread(threadId);

  const { sending, uploading, sendTextMessage, sendFiles } = useSendMessage(
    threadId || "",
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enhance empty state with styling preview
  const [showStylingSample, setShowStylingSample] = useState(false);

  useEffect(() => {
    if (thread && messages.length === 0) {
      // Show a brief styling sample after a delay
      const timeout = setTimeout(() => {
        setShowStylingSample(true);
        // Hide it after showing the beauty
        setTimeout(() => setShowStylingSample(false), 10000);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [thread, messages.length]);

  // Simulate typing occasionally
  useEffect(() => {
    if (thread && Math.random() > 0.8) {
      const participantName = formatChatTitle(thread, user?.id || "");
      setTypingUsers([{
        id: 'typing-user',
        name: participantName,
        avatar: thread.groupAvatar
      }]);

      // Clear typing after a few seconds
      const timeout = setTimeout(() => {
        setTypingUsers([]);
      }, 3000 + Math.random() * 2000);

      return () => clearTimeout(timeout);
    }
  }, [thread, user]);

  // Handle scroll to show/hide scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isNearBottom && messages.length > 0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;

    const content = messageInput.trim();
    setMessageInput("");

    if (replyingTo) {
      // Handle reply
      const replyContent = `Replying to: "${replyingTo.content.substring(0, 50)}${replyingTo.content.length > 50 ? "..." : ""}"\n\n${content}`;
      await sendMessage(replyContent);
      setReplyingTo(null);
    } else {
      await sendMessage(content);
    }
  };

  const handleSendEnhancedMessage = async (
    type: "text" | "voice" | "sticker" | "media" | "emoji",
    content: string,
    metadata?: any,
  ) => {
    if (sending) return;

    try {
      switch (type) {
        case "text":
        case "emoji":
          if (replyingTo) {
            const replyContent = `Replying to: "${replyingTo.content.substring(0, 50)}${replyingTo.content.length > 50 ? "..." : ""}"\n\n${content}`;
            await sendMessage(replyContent, undefined, replyingTo.id);
            setReplyingTo(null);
          } else {
            await sendMessage(content);
          }
          break;

        case "sticker":
          await sendMessage(content, undefined, undefined, "text", {
            stickerName: metadata?.name || "Sticker",
            pack: metadata?.pack,
            animated: metadata?.animated,
          });
          toast({
            title: "Sticker sent!",
            description: `Sent ${metadata?.name || "sticker"}`,
          });
          break;

        case "media":
          if (metadata?.file) {
            await sendMessage(
              metadata.caption || content,
              [content], // File URL
              undefined,
              metadata.mediaType === "image" ? "image" : "file",
              {
                fileName: metadata.fileName,
                fileSize: metadata.fileSize,
                fileType: metadata.fileType,
                mediaType: metadata.mediaType,
                caption: metadata.caption,
              }
            );
            toast({
              title: "Media sent!",
              description: `Sent ${metadata.fileName}`,
            });
          }
          break;

        case "voice":
          await sendMessage(content, [content], undefined, "voice", {
            duration: metadata?.duration || 0,
            transcription: metadata?.transcription || "Voice message",
          });
          toast({
            title: "Voice message sent!",
            description: `Duration: ${metadata?.duration || 0}s`,
          });
          break;

        default:
          await sendMessage(content);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };





  const handleReaction = async (messageId: string, emoji: string) => {
    await addReaction(messageId, emoji);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(messageId);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleVideoCall = () => {
    if (!thread || !user) {
      toast({
        title: "Call Error",
        description: "Unable to start call. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const participantName = formatChatTitle(thread, user.id);
      const participantIds = thread.participants || [];
      const participantId = participantIds.find((id: string) => id !== user.id) || '';

      setCallData({
        participant: {
          id: participantId,
          name: participantName,
          avatar: thread.groupAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
        },
        type: 'video',
        isIncoming: false,
        isGroup: thread.isGroup || false
      });
      setShowVideoCall(true);
      toast({
        title: "Starting Video Call",
        description: `Calling ${participantName}...`
      });
    } catch (error) {
      console.error('Error starting video call:', error);
      toast({
        title: "Call Error",
        description: "Failed to start video call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVoiceCall = () => {
    if (!thread || !user) {
      toast({
        title: "Call Error",
        description: "Unable to start call. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      const participantName = formatChatTitle(thread, user.id);
      const participantIds = thread.participants || [];
      const participantId = participantIds.find((id: string) => id !== user.id) || '';

      setCallData({
        participant: {
          id: participantId,
          name: participantName,
          avatar: thread.groupAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
        },
        type: 'voice',
        isIncoming: false,
        isGroup: thread.isGroup || false
      });
      setShowVoiceCall(true);
      toast({
        title: "Starting Voice Call",
        description: `Calling ${participantName}...`
      });
    } catch (error) {
      console.error('Error starting voice call:', error);
      toast({
        title: "Call Error",
        description: "Failed to start voice call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCallEnd = () => {
    setShowVideoCall(false);
    setShowVoiceCall(false);
    setCallData(null);
  };

  const formatMessageTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() ===
      date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (isYesterday) {
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

  // Convert ChatMessage to EnhancedChatMessage for beautiful styling
  const convertToEnhancedMessage = (message: ChatMessage): EnhancedChatMessage => {
    // Handle different message types properly
    let content = message.content;
    let messageType: "text" | "voice" | "sticker" | "media" = "text";
    let metadata: any = undefined;

    // Check if message has custom metadata (from WhatsApp-style input)
    if (message.metadata) {
      // Handle WhatsApp-style messages with metadata
      if (message.metadata.mediaType) {
        messageType = "media";
        metadata = {
          fileName: message.metadata.fileName || "File",
          fileSize: message.metadata.fileSize || 0,
          fileType: message.metadata.fileType || "unknown",
          mediaType: message.metadata.mediaType,
          caption: message.metadata.caption,
        };
      } else if (message.metadata.duration !== undefined) {
        messageType = "voice";
        metadata = {
          transcription: message.metadata.transcription || "Voice message",
          duration: message.metadata.duration,
        };
      } else if (message.metadata.stickerName || message.metadata.pack) {
        messageType = "sticker";
        metadata = {
          stickerName: message.metadata.name || message.metadata.stickerName || "Sticker",
          pack: message.metadata.pack,
          animated: message.metadata.animated,
        };
      }
    }
    // Legacy message type handling
    else if (message.messageType === "voice") {
      messageType = "voice";
      metadata = {
        transcription: "Voice message",
        duration: 30 // Default duration
      };
    } else if (message.messageType === "image") {
      messageType = "media";
      content = message.attachments?.[0] || content;
      metadata = {
        fileName: "Image",
        mediaType: "image" as const,
        fileSize: 1024 * 1024 // Default 1MB
      };
    } else if (message.messageType === "file") {
      messageType = "media";
      content = message.attachments?.[0] || content;
      metadata = {
        fileName: "Document",
        mediaType: "file" as const,
        fileSize: 1024 * 512 // Default 512KB
      };
    } else if (content.length === 1 || content.length === 2) {
      // Simple emoji detection without Unicode ranges
      const commonEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
      if (commonEmojis.includes(content.trim())) {
        messageType = "sticker";
        metadata = { stickerName: "Emoji" };
      }
    }

    return {
      id: message.id,
      senderId: message.senderId,
      senderName: message.senderName || (message.senderId === user?.id ? "You" : "Unknown"),
      senderAvatar: message.senderAvatar,
      content,
      type: messageType,
      timestamp: message.timestamp,
      metadata,
      status: message.readBy.includes(user?.id || "") ? "read" : "delivered",
      reactions: message.reactions?.map((reaction) => ({
        userId: reaction.userIds[0] || "unknown",
        emoji: reaction.emoji,
        timestamp: message.timestamp,
      })) || [],
      isEdited: false,
      replyTo: message.replyTo ? {
        messageId: message.replyTo,
        content: "Replied message",
        senderName: "Unknown",
      } : undefined,
    };
  };

  const handleReplyToMessage = (message: EnhancedChatMessage) => {
    const originalMessage = messages.find(m => m.id === message.id);
    if (originalMessage) {
      setReplyingTo(originalMessage);
    }
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    handleReaction(messageId, emoji);
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    // Handle edit message logic here
    toast({
      title: "Edit Feature",
      description: "Message editing coming soon!",
    });
  };

  const handleDeleteMessageEnhanced = (messageId: string) => {
    handleDeleteMessage(messageId);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="p-4 border-b">
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
            >
              <Skeleton className="h-16 w-64" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium">Chat not found</h3>
            <p className="text-muted-foreground mb-4">
              {error || "This conversation doesn't exist"}
            </p>
            <Button onClick={() => navigate("/messages")}>
              Back to Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chatTitle = formatChatTitle(thread, user?.id || "");
  const chatSubtitle = formatContextSubtitle(thread);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className={`border-b bg-background/95 backdrop-blur ${isMobile ? "p-3" : "p-4"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/chat")}
              className={isMobile ? "p-1" : "md:hidden"}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <Avatar className={isMobile ? "w-9 h-9" : "w-10 h-10"}>
              <AvatarImage
                src={
                  thread.groupAvatar ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
                }
              />
              <AvatarFallback>{thread.isGroup ? "👥" : "💬"}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className={`font-semibold truncate ${isMobile ? "text-base" : "text-lg"}`}>{chatTitle}</h2>
                {!isMobile && (
                  <span
                    className={`${badgeVariants({ variant: "secondary" })} text-xs ${getChatTypeBadgeColor(thread.type)}`}
                  >
                    {getChatTypeIcon(thread.type)} {getChatTypeLabel(thread.type)}
                  </span>
                )}
              </div>
              {chatSubtitle && (
                <p className={`text-muted-foreground truncate ${isMobile ? "text-xs" : "text-sm"}`}>
                  {chatSubtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "sm"}
              onClick={handleVoiceCall}
              title="Start voice call"
              className={isMobile ? "p-2" : ""}
              disabled={!thread || !user || loading}
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "sm"}
              onClick={handleVideoCall}
              title="Start video call"
              className={isMobile ? "p-2" : ""}
              disabled={!thread || !user || loading}
            >
              <Video className="w-4 h-4" />
            </Button>
            {!isMobile && (
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size={isMobile ? "sm" : "sm"} className={isMobile ? "p-2" : ""}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Info className="w-4 h-4 mr-2" />
                  Chat Info
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Mute Chat
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="w-4 h-4 mr-2" />
                  Star Chat
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">
                {getChatTypeIcon(thread.type)}
              </div>
              <h3 className="text-lg font-medium mb-2">
                Start the conversation
              </h3>
              <p className="text-muted-foreground mb-4">
                Send a message to see the beautiful chat styling!
              </p>
            </div>

            {/* Styling Preview */}
            {showStylingSample && (
              <div className="space-y-4 w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                <div className="text-xs text-center text-muted-foreground mb-2">✨ Preview of enhanced chat styling ✨</div>

                {/* Sample received message */}
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl max-w-sm bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 dark:text-gray-100 relative shadow-md before:absolute before:bottom-0 before:-left-1 before:w-3 before:h-3 before:bg-gradient-to-br before:from-gray-100 before:to-gray-200 before:rotate-45 before:transform before:origin-bottom-right dark:before:from-gray-700 dark:before:to-gray-800">
                    <p className="whitespace-pre-wrap leading-relaxed">Beautiful colors & gradients! 🎨</p>
                  </div>
                </div>

                {/* Sample sent message */}
                <div className="flex justify-end">
                  <div className="px-4 py-3 rounded-2xl max-w-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white relative shadow-md before:absolute before:bottom-0 before:-right-1 before:w-3 before:h-3 before:bg-gradient-to-br before:from-blue-500 before:to-blue-600 before:rotate-45 before:transform before:origin-bottom-left">
                    <p className="whitespace-pre-wrap leading-relaxed">Your messages on the right! 💙</p>
                  </div>
                </div>

                <div className="text-xs text-center text-muted-foreground opacity-75 mt-4">
                  Send a message to start chatting with this beautiful interface!
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {(() => {
              // Interleave ads for group chats only. Config: show ad every N messages.
              const ads = thread.isGroup ? chatAdsService.getAdsForThread(thread.id) : [];
              const frequency = 8; // show ad after every 8 messages
              const items: React.ReactNode[] = [];

              messages.forEach((message, index) => {
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const isGrouped = shouldGroupMessages(message, previousMessage);
                const enhancedMessage = convertToEnhancedMessage(message);

                items.push(
                  <div
                    key={`msg_${message.id}`}
                    className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <EnhancedMessage
                      message={enhancedMessage}
                      currentUserId={user?.id || ""}
                      isCurrentUser={message.senderId === user?.id}
                      isMobile={isMobile}
                      onReply={handleReplyToMessage}
                      onReact={handleReactToMessage}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessageEnhanced}
                      showAvatar={!isGrouped}
                      groupWithPrevious={isGrouped}
                    />
                  </div>
                );

                // insert ad after every frequency messages if ads available
                if (ads.length > 0 && thread.isGroup && (index + 1) % frequency === 0) {
                  const adIndex = Math.floor((index + 1) / frequency) % ads.length;
                  const ad = ads[adIndex];
                  items.push(
                    <div key={`ad_${ad.id}_${index}`} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                      <ChatAd
                        ad={ad}
                        onClickCTA={(adId) => {
                          chatAdsService.trackAdClick(adId);
                        }}
                        onDismiss={(adId) => {
                          // persist dismissed ad state per thread
                          try {
                            const key = `dismissed_ads_${thread.id}`;
                            const raw = localStorage.getItem(key) || "[]";
                            const arr = JSON.parse(raw);
                            if (!arr.includes(adId)) {
                              arr.push(adId);
                              localStorage.setItem(key, JSON.stringify(arr));
                            }
                          } catch (e) {}
                        }}
                      />
                    </div>
                  );
                }
              });

              return items;
            })()}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator
            users={typingUsers}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <div className="absolute bottom-20 right-6">
          <Button
            onClick={scrollToBottom}
            size="sm"
            className="rounded-full shadow-lg"
          >
            ↓
          </Button>
        </div>
      )}

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Replying to:</span>
              <span className="ml-2">
                {replyingTo.content.substring(0, 50)}...
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* WhatsApp-Style Message Input */}
      <WhatsAppChatInput
        messageInput={messageInput}
        setMessageInput={(value) => {
          setMessageInput(value);
          sendTypingIndicator();
        }}
        onSendMessage={handleSendEnhancedMessage}
        isMobile={isMobile}
        disabled={sending || uploading}
        placeholder={`Message ${thread ? formatChatTitle(thread, user?.id || '') : 'chat'}...`}
      />

      {/* Enhanced Video Call */}
      {(showVideoCall || showVoiceCall) && callData && (
        <EnhancedVideoCall
          isOpen={showVideoCall || showVoiceCall}
          onClose={handleCallEnd}
          callData={callData}
          onAccept={() => {
            toast({
              title: "Call Connected",
              description: "Call has started successfully"
            });
          }}
          onDecline={handleCallEnd}
          onMute={(muted) => {
            toast({
              title: muted ? "Microphone Muted" : "Microphone Unmuted",
              description: muted ? "Your microphone is now muted" : "Your microphone is now active"
            });
          }}
          onVideoToggle={(enabled) => {
            toast({
              title: enabled ? "Camera On" : "Camera Off",
              description: enabled ? "Your camera is now on" : "Your camera is now off"
            });
          }}
          onScreenShare={(sharing) => {
            toast({
              title: sharing ? "Screen Sharing Started" : "Screen Sharing Stopped",
              description: sharing ? "Your screen is now being shared" : "Screen sharing has stopped"
            });
          }}
        />
      )}
    </div>
  );
};

export default ChatRoom;
