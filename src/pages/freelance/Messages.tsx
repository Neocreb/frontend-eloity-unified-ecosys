// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Trash2,
  Flag,
  Eye,
  EyeOff,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Download,
  Plus,
  Mic,
  Smile,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  type: "text" | "file" | "image" | "proposal" | "milestone";
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  read: boolean;
}

interface Conversation {
  id: string;
  type: "direct" | "project" | "group";
  title: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: "client" | "freelancer" | "admin";
    online: boolean;
    lastSeen?: Date;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  projectId?: string;
  archived: boolean;
  muted: boolean;
  priority: "normal" | "high" | "urgent";
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      type: "project",
      title: "E-commerce Platform Project",
      participants: [
        {
          id: "c1",
          name: "Alice Johnson",
          avatar: "",
          role: "client",
          online: true,
        },
        {
          id: "u1",
          name: user?.name || "You",
          avatar: user?.avatar,
          role: "freelancer",
          online: true,
        },
      ],
      lastMessage: {
        id: "m1",
        content: "Great work on the latest milestone! The designs look fantastic.",
        senderId: "c1",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: "text",
        read: false,
      },
      unreadCount: 2,
      projectId: "p1",
      archived: false,
      muted: false,
      priority: "normal",
    },
    {
      id: "2",
      type: "direct",
      title: "Bob Wilson",
      participants: [
        {
          id: "c2",
          name: "Bob Wilson",
          avatar: "",
          role: "client",
          online: false,
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "u1",
          name: user?.name || "You",
          avatar: user?.avatar,
          role: "freelancer",
          online: true,
        },
      ],
      lastMessage: {
        id: "m2",
        content: "When can we schedule a call to discuss the project requirements?",
        senderId: "c2",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: "text",
        read: true,
      },
      unreadCount: 0,
      archived: false,
      muted: false,
      priority: "high",
    },
    {
      id: "3",
      type: "project",
      title: "Mobile App Design",
      participants: [
        {
          id: "c3",
          name: "Sarah Davis",
          avatar: "",
          role: "client",
          online: true,
        },
        {
          id: "u1",
          name: user?.name || "You",
          avatar: user?.avatar,
          role: "freelancer",
          online: true,
        },
      ],
      lastMessage: {
        id: "m3",
        content: "Thanks for the quick revision. Approved!",
        senderId: "u1",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        type: "text",
        read: true,
      },
      unreadCount: 0,
      projectId: "p2",
      archived: false,
      muted: false,
      priority: "normal",
    },
    {
      id: "4",
      type: "direct",
      title: "Mike Chen",
      participants: [
        {
          id: "c4",
          name: "Mike Chen",
          avatar: "",
          role: "client",
          online: false,
          lastSeen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: "u1",
          name: user?.name || "You",
          avatar: user?.avatar,
          role: "freelancer",
          online: true,
        },
      ],
      lastMessage: {
        id: "m4",
        content: "Looking forward to working with you on this project!",
        senderId: "c4",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        type: "text",
        read: true,
      },
      unreadCount: 0,
      archived: false,
      muted: false,
      priority: "urgent",
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg1",
      content: "Hi! I reviewed your proposal and I'm impressed with your portfolio. I'd like to discuss the project details.",
      senderId: "c1",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "text",
      read: true,
    },
    {
      id: "msg2",
      content: "Thank you! I'm excited to work on this project. I have some questions about the technical requirements.",
      senderId: "u1",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      type: "text",
      read: true,
    },
    {
      id: "msg3",
      content: "Of course! Feel free to ask anything. I've attached the detailed project specification document.",
      senderId: "c1",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: "file",
      attachments: [
        {
          id: "file1",
          name: "Project_Specifications.pdf",
          type: "application/pdf",
          size: 2048000,
          url: "#",
        },
      ],
      read: true,
    },
    {
      id: "msg4",
      content: "Perfect! I'll review the document and get back to you with a detailed timeline and milestone breakdown.",
      senderId: "u1",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: "text",
      read: true,
    },
    {
      id: "msg5",
      content: "Great work on the latest milestone! The designs look fantastic.",
      senderId: "c1",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: "text",
      read: false,
    },
  ]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    switch (activeTab) {
      case "unread":
        return matchesSearch && conv.unreadCount > 0;
      case "projects":
        return matchesSearch && conv.type === "project";
      case "archived":
        return matchesSearch && conv.archived;
      default:
        return matchesSearch && !conv.archived;
    }
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: user?.id || "u1",
      timestamp: new Date(),
      type: "text",
      read: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: message }
        : conv
    ));

    // Simulate response (in real app, this would come from websocket/polling)
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for the update! I'll review and get back to you soon.",
        senderId: selectedConversation.participants.find(p => p.id !== user?.id)?.id || "c1",
        timestamp: new Date(),
        type: "text",
        read: false,
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      default:
        return "bg-blue-500";
    }
  };

  const ConversationCard: React.FC<{ conversation: Conversation }> = ({ conversation }) => {
    const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
    
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedConversation?.id === conversation.id ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => {
          setSelectedConversation(conversation);
          markAsRead(conversation.id);
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={otherParticipant?.avatar} />
                <AvatarFallback>
                  {conversation.type === "group" ? <Users className="w-6 h-6" /> : otherParticipant?.name[0]}
                </AvatarFallback>
              </Avatar>
              {otherParticipant?.online && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
              {conversation.priority !== "normal" && (
                <div className={`absolute -top-1 -right-1 w-3 h-3 ${getPriorityColor(conversation.priority)} rounded-full`}></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold truncate">
                  {conversation.type === "project" ? conversation.title : otherParticipant?.name}
                </h3>
                <div className="flex items-center gap-1">
                  {conversation.muted && <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
              
              {conversation.type === "project" && (
                <p className="text-xs text-muted-foreground mb-1">
                  Project • {otherParticipant?.name}
                </p>
              )}
              
              <p className="text-sm text-muted-foreground truncate mb-2">
                {conversation.lastMessage?.content || "No messages yet"}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{conversation.lastMessage ? getTimeAgo(conversation.lastMessage.timestamp) : ""}</span>
                {!otherParticipant?.online && otherParticipant?.lastSeen && (
                  <span>Last seen {getTimeAgo(otherParticipant.lastSeen)}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isOwnMessage = message.senderId === user?.id;
    const sender = selectedConversation?.participants.find(p => p.id === message.senderId);

    return (
      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
        <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : ""}`}>
          {!isOwnMessage && (
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="w-6 h-6">
                <AvatarImage src={sender?.avatar} />
                <AvatarFallback className="text-xs">{sender?.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{sender?.name}</span>
            </div>
          )}
          
          <div className={`rounded-lg p-3 ${
            isOwnMessage 
              ? "bg-blue-500 text-white" 
              : "bg-gray-100 dark:bg-gray-800"
          }`}>
            {message.type === "text" && (
              <p className="text-sm">{message.content}</p>
            )}
            
            {message.type === "file" && (
              <div className="space-y-2">
                <p className="text-sm">{message.content}</p>
                {message.attachments?.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 p-2 bg-white/10 rounded">
                    <FileText className="w-4 h-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs opacity-75">{formatFileSize(file.size)}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <span>{getTimeAgo(message.timestamp)}</span>
            {isOwnMessage && (
              <CheckCircle2 className={`w-3 h-3 ${message.read ? "text-blue-500" : ""}`} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with your clients</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Conversations</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 text-xs">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="archived">Archived</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto space-y-3">
              {filteredConversations.map((conversation) => (
                <ConversationCard key={conversation.id} conversation={conversation} />
              ))}
              
              {filteredConversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.participants.find(p => p.id !== user?.id)?.avatar} />
                      <AvatarFallback>
                        {selectedConversation.type === "group" ? <Users className="w-5 h-5" /> : 
                         selectedConversation.participants.find(p => p.id !== user?.id)?.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.type === "project" ? 
                         selectedConversation.title : 
                         selectedConversation.participants.find(p => p.id !== user?.id)?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.participants.find(p => p.id !== user?.id)?.online ? 
                         "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Info className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={1}
                      className="min-h-[40px] max-h-32 resize-none"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the left to start chatting
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
