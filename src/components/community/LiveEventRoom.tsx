import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Share2,
  MessageSquare,
  Users,
  Settings,
  Monitor,
  Hand,
  ThumbsUp,
  Gift,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Send,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  MoreHorizontal,
  Award,
  Target,
  Zap,
  Eye,
  Heart,
  Star,
  Crown,
  Shield,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: "host" | "moderator" | "speaker" | "viewer";
  isVideoOn: boolean;
  isAudioOn: boolean;
  handRaised: boolean;
  reactions: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: "message" | "reaction" | "system";
}

interface LiveEventRoomProps {
  eventId: string;
  eventTitle: string;
  eventType:
    | "trading"
    | "marketplace"
    | "workshop"
    | "freelance"
    | "challenge"
    | "social";
  isHost?: boolean;
}

const LiveEventRoom: React.FC<LiveEventRoomProps> = ({
  eventId,
  eventTitle,
  eventType,
  isHost = false,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [currentView, setCurrentView] = useState<"grid" | "speaker" | "screen">(
    "grid",
  );
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [reactions, setReactions] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mock participants data
  const mockParticipants: Participant[] = [
    {
      id: "1",
      name: "Alex Rivera (Host)",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      role: "host",
      isVideoOn: true,
      isAudioOn: true,
      handRaised: false,
      reactions: 45,
    },
    {
      id: "2",
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      role: "speaker",
      isVideoOn: true,
      isAudioOn: true,
      handRaised: false,
      reactions: 23,
    },
    {
      id: "3",
      name: "Mike Johnson",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      role: "viewer",
      isVideoOn: false,
      isAudioOn: false,
      handRaised: true,
      reactions: 12,
    },
  ];

  // Mock chat messages
  const mockMessages: ChatMessage[] = [
    {
      id: "1",
      userId: "1",
      userName: "Alex Rivera",
      message: "Welcome everyone! Let's start with today's DeFi strategies.",
      timestamp: new Date(Date.now() - 300000),
      type: "message",
    },
    {
      id: "2",
      userId: "2",
      userName: "Sarah Chen",
      message:
        "Great presentation! The yield farming section was very insightful.",
      timestamp: new Date(Date.now() - 240000),
      type: "message",
    },
    {
      id: "3",
      userId: "system",
      userName: "System",
      message: "Mike Johnson raised their hand",
      timestamp: new Date(Date.now() - 120000),
      type: "system",
    },
  ];

  useEffect(() => {
    setParticipants(mockParticipants);
    setChatMessages(mockMessages);
  }, []);

  useEffect(() => {
    // Auto-scroll chat to bottom
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: "current-user",
      userName: "You",
      message: newMessage,
      timestamp: new Date(),
      type: "message",
    };

    setChatMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleReaction = () => {
    setReactions((prev) => prev + 1);
    toast({
      title: "Reaction sent! 👍",
      description: "Your reaction has been shared with everyone",
    });
  };

  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    if (!handRaised) {
      toast({
        title: "Hand raised",
        description: "The host will be notified",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "host":
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-3 h-3 text-blue-500" />;
      case "speaker":
        return <Mic className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderEventSpecificTools = () => {
    switch (eventType) {
      case "trading":
        return (
          <div className="space-y-2">
            <Link to="/app/crypto">
              <Button variant="outline" size="sm" className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Open Crypto Trading
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="w-full">
              <DollarSign className="w-4 h-4 mr-2" />
              Share Portfolio
            </Button>
          </div>
        );
      case "marketplace":
        return (
          <div className="space-y-2">
            <Link to="/app/marketplace">
              <Button variant="outline" size="sm" className="w-full">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Open Marketplace
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="w-full">
              <Gift className="w-4 h-4 mr-2" />
              Flash Deals
            </Button>
          </div>
        );
      case "workshop":
        return (
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              <Monitor className="w-4 h-4 mr-2" />
              Screen Share
            </Button>
            <Link to="/app/unified-creator-studio">
              <Button variant="outline" size="sm" className="w-full">
                <Award className="w-4 h-4 mr-2" />
                Creator Studio
              </Button>
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Badge className="bg-red-500 animate-pulse">
            <Eye className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
          <h1 className="font-semibold text-lg">{eventTitle}</h1>
          <Badge variant="outline" className="text-white border-gray-600">
            {participants.length} participants
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Video Grid */}
          <div className="absolute inset-0 bg-gray-900">
            {currentView === "screen" ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400">Screen sharing view</p>
                </div>
              </div>
            ) : (
              <div
                className={`grid gap-2 p-4 h-full ${
                  currentView === "speaker"
                    ? "grid-cols-1"
                    : participants.filter((p) => p.isVideoOn).length <= 4
                      ? "grid-cols-2"
                      : "grid-cols-3"
                }`}
              >
                {participants
                  .filter((p) => p.isVideoOn || p.role === "host")
                  .map((participant) => (
                    <div
                      key={participant.id}
                      className="relative bg-gray-800 rounded-lg overflow-hidden"
                    >
                      <div className="aspect-video flex items-center justify-center">
                        {participant.isVideoOn ? (
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                              <span className="text-xl font-bold">
                                {participant.name.charAt(0)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300">
                              {participant.name}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Participant Info Overlay */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
                          {getRoleIcon(participant.role)}
                          <span className="text-xs font-medium truncate">
                            {participant.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {!participant.isAudioOn && (
                            <MicOff className="w-4 h-4 text-red-500" />
                          )}
                          {participant.handRaised && (
                            <Hand className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAudioOn(!isAudioOn)}
              className={`rounded-full ${!isAudioOn ? "bg-red-500 hover:bg-red-600" : "hover:bg-gray-700"}`}
            >
              {isAudioOn ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`rounded-full ${!isVideoOn ? "bg-red-500 hover:bg-red-600" : "hover:bg-gray-700"}`}
            >
              {isVideoOn ? (
                <Video className="w-4 h-4" />
              ) : (
                <VideoOff className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`rounded-full ${isScreenSharing ? "bg-blue-500 hover:bg-blue-600" : "hover:bg-gray-700"}`}
            >
              <Monitor className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRaiseHand}
              className={`rounded-full ${handRaised ? "bg-yellow-500 hover:bg-yellow-600" : "hover:bg-gray-700"}`}
            >
              <Hand className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReaction}
              className="rounded-full hover:bg-gray-700"
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-gray-600 mx-2" />

            <Button variant="destructive" size="sm" className="rounded-full">
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>

          {/* Reactions Overlay */}
          {reactions > 0 && (
            <div className="absolute top-4 right-4 bg-black/70 px-3 py-2 rounded-full flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">{reactions}</span>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0">
              {/* Chat Messages */}
              <div
                ref={chatRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`${
                      message.type === "system" ? "text-center" : ""
                    }`}
                  >
                    {message.type === "system" ? (
                      <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {message.message}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-blue-400">
                            {message.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          {message.message}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-gray-800 border-gray-700 text-white"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="participants"
              className="flex-1 p-4 overflow-y-auto"
            >
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-800"
                  >
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {getRoleIcon(participant.role)}
                        <span className="text-sm font-medium truncate">
                          {participant.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {participant.isAudioOn ? (
                            <Mic className="w-3 h-3 text-green-500" />
                          ) : (
                            <MicOff className="w-3 h-3 text-red-500" />
                          )}
                          {participant.isVideoOn ? (
                            <Video className="w-3 h-3 text-green-500" />
                          ) : (
                            <VideoOff className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        {participant.handRaised && (
                          <Hand className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Heart className="w-3 h-3" />
                      {participant.reactions}
                    </div>
                  </div>
                ))}
              </div>

              {/* Event-Specific Tools */}
              {isHost && (
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <h4 className="text-sm font-medium mb-3">Host Tools</h4>
                  {renderEventSpecificTools()}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LiveEventRoom;
