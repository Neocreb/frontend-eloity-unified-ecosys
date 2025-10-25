import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Send,
  Paperclip,
  Image,
  Package,
  DollarSign,
  FileText,
  Camera,
  Smile,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Shield,
  X,
  ArrowLeft,
  Download,
  ExternalLink,
} from "lucide-react";
import { useEnhancedMarketplace } from "@/contexts/EnhancedMarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { chatService } from "@/services/chatService";
import { orderService } from "@/services";
import { ChatMessage, ChatThread } from "@/types/chat"; // Import proper types

interface MarketplaceChatIntegrationProps {
  orderId?: string;
  productId?: string;
  sellerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const MarketplaceChatIntegration: React.FC<MarketplaceChatIntegrationProps> = ({
  orderId,
  productId,
  sellerId,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showThreadList, setShowThreadList] = useState(true);
  const [loading, setLoading] = useState(true);

  // Get active thread
  const activeThread = chatThreads.find(thread => thread.id === activeThreadId);

  // Load chat threads
  useEffect(() => {
    if (isOpen && user?.id) {
      loadChatThreads();
    }
  }, [isOpen, user?.id]);

  const loadChatThreads = async () => {
    try {
      setLoading(true);
      // Use the real chat service to get chat threads
      const threads = await chatService.getChatThreads();
      setChatThreads(threads);
      
      // Find relevant thread based on props
      if (orderId) {
        const thread = threads.find((t: ChatThread) => t.referenceId === orderId);
        if (thread) {
          setActiveThreadId(thread.id);
          setShowThreadList(false);
          loadMessages(thread.id);
        }
      } else if (sellerId) {
        const thread = threads.find((t: ChatThread) => t.participants.includes(sellerId));
        if (thread) {
          setActiveThreadId(thread.id);
          setShowThreadList(false);
          loadMessages(thread.id);
        }
      }
    } catch (error) {
      console.error("Error loading chat threads:", error);
      toast({
        title: "Error",
        description: "Failed to load chat conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load messages for active thread
  const loadMessages = async (threadId: string) => {
    try {
      // Use the real chat service to get messages
      const threadMessages = await chatService.getMessages(threadId);
      setMessages(threadMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeThread || !user) return;

    try {
      // Send message through real chat service
      const message = await chatService.sendMessage({
        threadId: activeThread.id,
        content: newMessage,
        messageType: "text",
      });
      
      // Update local state with the real message
      setMessages((prev) => [...prev, message]);
      setNewMessage("");

      // Update the thread's last message
      setChatThreads(prev => prev.map(thread => 
        thread.id === activeThread.id 
          ? { ...thread, lastMessage: newMessage, lastMessageAt: new Date().toISOString() }
          : thread
      ));

      toast({
        title: "Message Sent",
        description: "Your message has been sent to the seller",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getMessageIcon = (messageType: string | undefined) => {
    switch (messageType) {
      case "order_update":
        return <Package className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "contract":
        return <FileText className="h-4 w-4" />;
      case "system":
        return <Info className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isCurrentUser = message.senderId === user?.id;
    const isSystem =
      message.messageType === "system";

    if (isSystem) {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className="bg-gray-100 px-4 py-2 rounded-full text-sm flex items-center gap-2">
            {getMessageIcon(message.messageType)}
            <span>{message.content}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${isCurrentUser ? "flex-row-reverse" : ""}`}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback>{message.senderName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>

        <div
          className={`max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"} flex flex-col`}
        >
          <div
            className={`p-3 rounded-lg ${
              isCurrentUser
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <p className="text-sm">{message.content}</p>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="border rounded p-2 bg-white/10">
                    {typeof attachment === 'string' && (attachment.includes('.jpg') || attachment.includes('.png') || attachment.includes('.jpeg')) ? (
                      <img
                        src={attachment}
                        alt="Attachment"
                        className="max-w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">Attachment</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground mt-1">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    );
  };

  const renderThreadList = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Order Conversations</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : chatThreads.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
          <p className="text-muted-foreground">
            Start a conversation with a seller to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {chatThreads.map((thread) => (
            <Card
              key={thread.id}
              className={`cursor-pointer transition-all hover:shadow-sm ${
                thread.id === activeThreadId ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => {
                setActiveThreadId(thread.id);
                setShowThreadList(false);
                loadMessages(thread.id);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={thread.groupAvatar} />
                    <AvatarFallback>
                      {thread.groupName?.charAt(0) || "C"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">
                        {thread.groupName || "Conversation"}
                      </h4>
                      {thread.unreadCount && thread.unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white text-xs">
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground truncate">
                      {thread.lastMessage}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(thread.lastMessageAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderChatInterface = () => {
    if (!activeThread) return null;

    return (
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="border-b p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowThreadList(true)}
            className="md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Avatar className="h-10 w-10">
            <AvatarImage src={activeThread.groupAvatar} />
            <AvatarFallback>
              {activeThread.groupName?.charAt(0) || "C"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{activeThread.groupName || "Conversation"}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              "Typically responds within hours"
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                Order Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="h-4 w-4 mr-2" />
                Rate Seller
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertCircle className="h-4 w-4 mr-2" />
                Report Issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(renderMessage)}

          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activeThread.groupAvatar} />
                <AvatarFallback>
                  {activeThread.groupName?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                className="resize-none"
              />
            </div>

            <div className="flex gap-1">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Image className="h-4 w-4" />
              </Button>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[600px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {showThreadList ? "Order Conversations" : "Chat"}
          </DialogTitle>
          <DialogDescription>
            {showThreadList
              ? "Communicate with sellers about your orders"
              : "Chat with seller about your order"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {showThreadList ? (
            <div className="p-6 pt-0">{renderThreadList()}</div>
          ) : (
            renderChatInterface()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarketplaceChatIntegration;