// @ts-nocheck
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import WhatsAppChatInput from "@/components/chat/WhatsAppChatInput";
import { EnhancedMessage, EnhancedChatMessage } from "@/components/chat/EnhancedMessage";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Image,
  Smile,
  Sticker,
  Mic,
  Camera,
  Paperclip,
  Send,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const WhatsAppChatDemo: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([
    {
      id: "1",
      senderId: "other",
      senderName: "Demo User",
      senderAvatar: "https://ui-avatars.com/api/?name=Demo+User&background=random",
      content: "Hey! Welcome to the enhanced WhatsApp-style chat! 👋",
      type: "text",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: "read",
    },
    {
      id: "2",
      senderId: "current",
      senderName: "You",
      content: "This looks amazing! Let me test the features",
      type: "text",
      timestamp: new Date(Date.now() - 240000).toISOString(),
      status: "read",
    },
    {
      id: "3",
      senderId: "other",
      senderName: "Demo User",
      content: "🎉",
      type: "sticker",
      timestamp: new Date(Date.now() - 180000).toISOString(),
      status: "read",
      metadata: {
        stickerName: "Celebration",
      },
    },
    {
      id: "4",
      senderId: "current",
      senderName: "You",
      content: "I love the emoji picker and sticker support! 😍",
      type: "text",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      status: "read",
    },
  ]);

  const handleSendMessage = (
    type: "text" | "voice" | "sticker" | "media" | "emoji",
    content: string,
    metadata?: any,
  ) => {
    const newMessage: EnhancedChatMessage = {
      id: Date.now().toString(),
      senderId: "current",
      senderName: "You",
      content,
      type: type === "emoji" ? "text" : type,
      timestamp: new Date().toISOString(),
      status: "sending",
      metadata,
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: "sent" as const }
            : msg
        )
      );
    }, 500);

    // Simulate message read
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: "read" as const }
            : msg
        )
      );
    }, 1000);

    // Show success toast
    toast({
      title: "Message sent!",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} message delivered successfully`,
    });
  };

  const features = [
    {
      icon: <Image className="w-5 h-5" />,
      title: "Rich Media Support",
      description: "Send images, videos, and documents with captions",
      color: "bg-blue-500",
    },
    {
      icon: <Smile className="w-5 h-5" />,
      title: "Comprehensive Emoji Picker",
      description: "Over 3000+ emojis with search and categories",
      color: "bg-yellow-500",
    },
    {
      icon: <Sticker className="w-5 h-5" />,
      title: "Animated Stickers",
      description: "Express yourself with fun sticker packs",
      color: "bg-purple-500",
    },
    {
      icon: <Mic className="w-5 h-5" />,
      title: "Voice Messages",
      description: "Record and send voice messages with transcription",
      color: "bg-green-500",
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: "Camera Integration",
      description: "Take photos directly from the chat",
      color: "bg-red-500",
    },
    {
      icon: <Paperclip className="w-5 h-5" />,
      title: "File Attachments",
      description: "Share documents and files easily",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <MessageCircle className="w-6 h-6 text-green-600" />
            <h1 className="text-xl font-bold">WhatsApp-Style Chat Demo</h1>
          </div>
          <Badge variant="secondary" className="hidden md:inline-flex">
            Enhanced Features
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-80px)]">
        {/* Features Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Enhanced Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white",
                    feature.color
                  )}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSendMessage("text", "Testing the text messaging! 📱")}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Sample Text
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSendMessage("sticker", "🎉", { name: "Party", pack: "emotions" })}
              >
                <Sticker className="w-4 h-4 mr-2" />
                Send Sticker
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => toast({
                  title: "Voice Message Demo",
                  description: "Click the microphone button in the chat input to record!",
                })}
              >
                <Mic className="w-4 h-4 mr-2" />
                Voice Message Tip
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {/* Chat Header */}
            <CardHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="https://ui-avatars.com/api/?name=Demo+Chat&background=random" />
                  <AvatarFallback>DC</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Demo Chat</CardTitle>
                  <p className="text-sm text-green-600 dark:text-green-400">Online</p>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <EnhancedMessage
                      key={message.id}
                      message={message}
                      isCurrentUser={message.senderId === "current"}
                      showAvatar={message.senderId !== "current"}
                      groupWithPrevious={
                        index > 0 && 
                        messages[index - 1].senderId === message.senderId &&
                        new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() < 60000
                      }
                      onReact={(messageId, emoji) => {
                        toast({
                          title: "Reaction Added",
                          description: `Reacted with ${emoji}`,
                        });
                      }}
                      onReply={(msg) => {
                        toast({
                          title: "Reply Feature",
                          description: "Reply functionality is available!",
                        });
                      }}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <WhatsAppChatInput
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                onSendMessage={handleSendMessage}
                placeholder="Type a message to test the enhanced features..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChatDemo;
