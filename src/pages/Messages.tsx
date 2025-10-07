// @ts-nocheck
import { Helmet } from "react-helmet-async";
import {
  Search,
  MessageCircle,
  Phone,
  Video,
  Bot,
  Send,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { enhancedAIService } from "@/services/enhancedAIService";
import { useAuth } from "@/contexts/AuthContext";

const Messages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const mockConversations = [
    {
      id: "edith-ai",
      user: {
        name: "Edith - AI Assistant",
        avatar: "/placeholder.svg",
        isAI: true,
      },
      lastMessage:
        "Hi! I'm here to help you with anything on SoftChat. Ask me about trading, content creation, earning tips, or anything else!",
      time: "now",
      unread: 0,
      online: true,
    },
    {
      id: "1",
      user: { name: "Alice Johnson", avatar: "/placeholder.svg" },
      lastMessage: "Hey! How are you doing?",
      time: "2m",
      unread: 2,
      online: true,
    },
    {
      id: "2",
      user: { name: "Bob Smith", avatar: "/placeholder.svg" },
      lastMessage: "Thanks for the crypto tips!",
      time: "1h",
      unread: 0,
      online: false,
    },
    {
      id: "3",
      user: { name: "Charlie Wilson", avatar: "/placeholder.svg" },
      lastMessage: "Let's catch up soon",
      time: "3h",
      unread: 1,
      online: true,
    },
  ];

  const handleChatClick = (conversationId: string) => {
    setSelectedChat(conversationId);
    if (conversationId === "edith-ai") {
      // Initialize Edith chat with welcome message
      setChatMessages([
        {
          id: "welcome",
          type: "assistant",
          content: `Hey ${user?.username || user?.email || "there"}! 👋 I'm Edith, your personal SoftChat assistant. I'm here to help you succeed on the platform - whether you want to create amazing content, trade crypto, sell products, or earn through freelancing. Just ask me anything and I'll guide you step by step!`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const currentInput = chatInput;
    setChatInput("");

    setIsTyping(true);

    // Simulate realistic response time
    const responseDelay = Math.min(500 + currentInput.length * 8, 1800);

    setTimeout(() => {
      const smartResponse = enhancedAIService.generateSmartResponse(
        currentInput,
        user,
      );
      const aiResponse = {
        id: `ai-${Date.now()}`,
        type: "assistant",
        content: smartResponse.message,
        timestamp: new Date(),
        suggestedActions: smartResponse.suggestedActions,
        followUpQuestions: smartResponse.followUpQuestions,
      };
      setChatMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, responseDelay);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setChatMessages([]);
  };

  // If a chat is selected, show the chat interface
  if (selectedChat === "edith-ai") {
    return (
      <>
        <Helmet>
          <title>Chat with Edith - AI Assistant | Softchat</title>
        </Helmet>

        <div className="max-w-4xl mx-auto h-screen flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10 border-2 border-purple-300">
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                🤖
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-purple-700">
                Edith - AI Assistant
              </h2>
              <p className="text-sm text-purple-600">
                Always online and ready to help!
              </p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${message.type === "user" ? "" : "space-y-2"}`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-purple-500 text-white ml-auto"
                        : "bg-gray-100"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-line">
                      {message.content}
                    </div>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Show suggested actions for AI messages */}
                  {message.type === "assistant" && message.suggestedActions && (
                    <div className="flex flex-wrap gap-1">
                      {message.suggestedActions
                        .slice(0, 3)
                        .map((action: any, index: number) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-6"
                            onClick={() => {
                              if (action.url) {
                                window.location.href = action.url;
                              }
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                    </div>
                  )}

                  {/* Show follow-up questions */}
                  {message.type === "assistant" &&
                    message.followUpQuestions && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Quick questions:
                        </p>
                        <div className="space-y-1">
                          {message.followUpQuestions
                            .slice(0, 2)
                            .map((question: string, index: number) => (
                              <button
                                key={index}
                                className="block text-xs text-purple-600 hover:text-purple-800 underline"
                                onClick={() => setChatInput(question)}
                              >
                                {question}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        Edith is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Edith anything about SoftChat..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" size="sm" disabled={isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Messages | Softchat</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button>
            <MessageCircle className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </div>

        <div className="space-y-2">
          {mockConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                conversation.user.isAI
                  ? "border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50"
                  : ""
              }`}
              onClick={() => handleChatClick(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar
                      className={`h-12 w-12 ${
                        conversation.user.isAI
                          ? "border-2 border-purple-300"
                          : ""
                      }`}
                    >
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback
                        className={
                          conversation.user.isAI
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                            : ""
                        }
                      >
                        {conversation.user.isAI
                          ? "🤖"
                          : conversation.user.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div
                        className={`absolute -bottom-1 -right-1 h-4 w-4 border-2 border-background rounded-full ${
                          conversation.user.isAI
                            ? "bg-purple-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-medium truncate ${
                            conversation.user.isAI ? "text-purple-700" : ""
                          }`}
                        >
                          {conversation.user.name}
                        </h3>
                        {conversation.user.isAI && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            AI
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {conversation.time}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        conversation.user.isAI
                          ? "text-purple-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {conversation.lastMessage}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {conversation.unread > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread}
                      </div>
                    )}

                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            End-to-end encrypted messaging coming soon!
          </p>
        </div>
      </div>
    </>
  );
};

export default Messages;
