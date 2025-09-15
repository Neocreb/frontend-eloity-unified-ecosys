import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Users,
  Settings,
  Grid3X3,
  Maximize,
  Volume2,
  VolumeX,
  Hand,
  UserPlus,
  Share,
  Circle,
  StopCircle,
  Camera,
  CameraOff,
  MoreVertical,
  Pin,
  PinOff,
  Crown,
  Presentation,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface RoomParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: "host" | "moderator" | "speaker" | "participant";
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
  joinedAt: string;
  connectionQuality: "excellent" | "good" | "poor";
  isPinned?: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: "message" | "system";
}

interface GroupVideoRoomProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  roomType:
    | "community_event"
    | "freelance_collab"
    | "marketplace_demo"
    | "crypto_discussion";
  participants: RoomParticipant[];
  currentUser: RoomParticipant;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onLeaveRoom: () => void;
  onInviteUsers?: () => void;
  onKickUser?: (userId: string) => void;
  onMakeHost?: (userId: string) => void;
  onToggleUserRole?: (userId: string, role: string) => void;
  isHost?: boolean;
}

export const GroupVideoRoom: React.FC<GroupVideoRoomProps> = ({
  isOpen,
  onClose,
  roomId,
  roomName,
  roomType,
  participants,
  currentUser,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveRoom,
  onInviteUsers,
  onKickUser,
  onMakeHost,
  onToggleUserRole,
  isHost = false,
}) => {
  const { toast } = useToast();
  const [layoutMode, setLayoutMode] = useState<
    "grid" | "speaker" | "presentation"
  >("grid");
  const [showChat, setShowChat] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(
    null,
  );
  const [isRecording, setIsRecording] = useState(false);
  const [roomDuration, setRoomDuration] = useState(0);
  const [raisedHands, setRaisedHands] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    "chat" | "participants" | "settings"
  >("chat");

  // Room timer
  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setRoomDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Mock chat messages
  useEffect(() => {
    if (isOpen) {
      setChatMessages([
        {
          id: "1",
          userId: "system",
          userName: "System",
          message: `Welcome to ${roomName}! Please be respectful and follow community guidelines.`,
          timestamp: new Date(Date.now() - 300000),
          type: "system",
        },
        {
          id: "2",
          userId: "2",
          userName: "Sarah Chen",
          message: "Great to be here! Looking forward to the discussion.",
          timestamp: new Date(Date.now() - 240000),
          type: "message",
        },
        {
          id: "3",
          userId: "3",
          userName: "Mike Johnson",
          message: "Can everyone see my screen okay?",
          timestamp: new Date(Date.now() - 120000),
          type: "message",
        },
      ]);
    }
  }, [isOpen, roomName]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      message: newMessage,
      timestamp: new Date(),
      type: "message",
    };

    setChatMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleRaiseHand = () => {
    // Toggle hand raise for current user
    if (raisedHands.includes(currentUser.id)) {
      setRaisedHands((prev) => prev.filter((id) => id !== currentUser.id));
    } else {
      setRaisedHands((prev) => [...prev, currentUser.id]);
    }
  };

  const handlePinParticipant = (participantId: string) => {
    setPinnedParticipant(
      participantId === pinnedParticipant ? null : participantId,
    );
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "host":
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case "moderator":
        return <Badge className="w-3 h-3 text-blue-500" />;
      case "speaker":
        return <Mic className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "text-green-500";
      case "good":
        return "text-yellow-500";
      case "poor":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getRoomTypeLabel = () => {
    switch (roomType) {
      case "community_event":
        return "Community Event";
      case "freelance_collab":
        return "Freelance Collaboration";
      case "marketplace_demo":
        return "Product Demo";
      case "crypto_discussion":
        return "Crypto Discussion";
      default:
        return "Video Room";
    }
  };

  const renderParticipantVideo = (
    participant: RoomParticipant,
    isMain = false,
  ) => (
    <div
      key={participant.id}
      className={cn(
        "relative bg-gray-900 rounded-lg overflow-hidden group",
        isMain ? "aspect-video" : "aspect-square",
        pinnedParticipant === participant.id && "ring-2 ring-blue-500",
      )}
    >
      {/* Video/Avatar */}
      {participant.isVideoEnabled ? (
        <video
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={participant.id === currentUser.id}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Avatar
            className={cn(
              "ring-2 ring-gray-600",
              isMain ? "w-20 h-20" : "w-12 h-12",
            )}
          >
            <AvatarImage src={participant.avatar} />
            <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Participant info overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-black/70 rounded px-2 py-1 text-white text-xs">
          {getRoleIcon(participant.role)}
          <span className="truncate max-w-24">{participant.name}</span>
          {participant.handRaised && (
            <Hand className="w-3 h-3 text-yellow-400" />
          )}
        </div>
        <div className="flex items-center gap-1">
          {!participant.isAudioEnabled && (
            <div className="bg-red-500 rounded p-1">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          {participant.isScreenSharing && (
            <div className="bg-blue-500 rounded p-1">
              <Monitor className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Connection quality indicator */}
      <div
        className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getConnectionQualityColor(participant.connectionQuality)}`}
      />

      {/* Participant controls (for host) */}
      {isHost && participant.id !== currentUser.id && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="h-6 w-6">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{participant.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handlePinParticipant(participant.id)}
              >
                {pinnedParticipant === participant.id ? (
                  <>
                    <PinOff className="w-4 h-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 mr-2" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              {onMakeHost && (
                <DropdownMenuItem onClick={() => onMakeHost(participant.id)}>
                  <Crown className="w-4 h-4 mr-2" />
                  Make Host
                </DropdownMenuItem>
              )}
              {onKickUser && (
                <DropdownMenuItem
                  onClick={() => onKickUser(participant.id)}
                  className="text-red-600"
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <div className="h-full flex flex-col bg-black text-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-semibold text-lg">{roomName}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Badge variant="secondary">{getRoomTypeLabel()}</Badge>
                  <span>•</span>
                  <span>{participants.length} participants</span>
                  <span>•</span>
                  <span>{formatDuration(roomDuration)}</span>
                  {isRecording && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-red-400">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Recording
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Layout toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLayoutMode("grid")}>
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Grid View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLayoutMode("speaker")}>
                    <Users className="w-4 h-4 mr-2" />
                    Speaker View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLayoutMode("presentation")}
                  >
                    <Presentation className="w-4 h-4 mr-2" />
                    Presentation Mode
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Recording toggle (host only) */}
              {isHost && (
                <Button
                  onClick={() => setIsRecording(!isRecording)}
                  variant={isRecording ? "destructive" : "ghost"}
                  size="icon"
                  className="text-white"
                >
                  {isRecording ? (
                    <StopCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4 fill-red-500 text-red-500" />
                  )}
                </Button>
              )}

              {/* Invite users */}
              {onInviteUsers && (
                <Button
                  onClick={onInviteUsers}
                  variant="ghost"
                  size="icon"
                  className="text-white"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              )}

              {/* Settings */}
              <Button variant="ghost" size="icon" className="text-white">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Video area */}
            <div className="flex-1 p-4">
              {layoutMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
                  {participants.map((participant) =>
                    renderParticipantVideo(participant),
                  )}
                </div>
              )}

              {layoutMode === "speaker" && (
                <div className="flex gap-4 h-full">
                  <div className="flex-1">
                    {pinnedParticipant
                      ? renderParticipantVideo(
                          participants.find(
                            (p) => p.id === pinnedParticipant,
                          ) || participants[0],
                          true,
                        )
                      : renderParticipantVideo(participants[0], true)}
                  </div>
                  <div className="w-32 space-y-2 overflow-y-auto">
                    {participants
                      .slice(1)
                      .map((participant) =>
                        renderParticipantVideo(participant),
                      )}
                  </div>
                </div>
              )}

              {layoutMode === "presentation" && (
                <div className="flex gap-4 h-full">
                  <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">
                        Waiting for screen share...
                      </p>
                    </div>
                  </div>
                  <div className="w-40 space-y-2 overflow-y-auto">
                    {participants.map((participant) =>
                      renderParticipantVideo(participant),
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            {showChat && (
              <div className="w-80 border-l border-gray-700 bg-gray-900 flex flex-col">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="flex-1 flex flex-col"
                >
                  <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="participants">
                      People ({participants.length})
                    </TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="chat"
                    className="flex-1 flex flex-col p-0"
                  >
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-3">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "text-sm",
                              message.type === "system"
                                ? "text-center text-gray-400 italic"
                                : "",
                            )}
                          >
                            {message.type === "message" && (
                              <div>
                                <span className="font-medium text-blue-400">
                                  {message.userName}:{" "}
                                </span>
                                <span className="text-gray-200">
                                  {message.message}
                                </span>
                              </div>
                            )}
                            {message.type === "system" && (
                              <div>{message.message}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-gray-700">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          className="flex-1 bg-gray-800 border-gray-600 text-white"
                        />
                        <Button onClick={handleSendMessage} size="icon">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="participants" className="flex-1 p-4">
                    <ScrollArea className="h-full">
                      <div className="space-y-2">
                        {participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback>
                                {participant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                {getRoleIcon(participant.role)}
                                <span className="text-sm font-medium truncate">
                                  {participant.name}
                                </span>
                                {participant.handRaised && (
                                  <Hand className="w-3 h-3 text-yellow-400" />
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <div
                                  className={`w-2 h-2 rounded-full ${getConnectionQualityColor(participant.connectionQuality)}`}
                                />
                                {participant.role}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!participant.isAudioEnabled && (
                                <MicOff className="w-3 h-3 text-gray-400" />
                              )}
                              {!participant.isVideoEnabled && (
                                <VideoOff className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="settings" className="flex-1 p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Room Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Room ID:</span>
                            <span className="text-gray-400">{roomId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="text-gray-400">
                              {getRoomTypeLabel()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="text-gray-400">
                              {formatDuration(roomDuration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-900 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowChat(!showChat)}
                  variant="ghost"
                  className="text-white"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {showChat ? "Hide Chat" : "Show Chat"}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {/* Audio toggle */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={onToggleAudio}
                        variant={
                          currentUser.isAudioEnabled
                            ? "secondary"
                            : "destructive"
                        }
                        size="lg"
                        className="rounded-full w-12 h-12"
                      >
                        {currentUser.isAudioEnabled ? (
                          <Mic className="w-5 h-5" />
                        ) : (
                          <MicOff className="w-5 h-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {currentUser.isAudioEnabled ? "Mute" : "Unmute"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Video toggle */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={onToggleVideo}
                        variant={
                          currentUser.isVideoEnabled
                            ? "secondary"
                            : "destructive"
                        }
                        size="lg"
                        className="rounded-full w-12 h-12"
                      >
                        {currentUser.isVideoEnabled ? (
                          <Video className="w-5 h-5" />
                        ) : (
                          <VideoOff className="w-5 h-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {currentUser.isVideoEnabled
                        ? "Turn off camera"
                        : "Turn on camera"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Screen share */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={onToggleScreenShare}
                        variant={
                          currentUser.isScreenSharing ? "default" : "secondary"
                        }
                        size="lg"
                        className="rounded-full w-12 h-12"
                      >
                        {currentUser.isScreenSharing ? (
                          <MonitorOff className="w-5 h-5" />
                        ) : (
                          <Monitor className="w-5 h-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {currentUser.isScreenSharing
                        ? "Stop sharing"
                        : "Share screen"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Raise hand */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleRaiseHand}
                        variant={
                          raisedHands.includes(currentUser.id)
                            ? "default"
                            : "secondary"
                        }
                        size="lg"
                        className="rounded-full w-12 h-12"
                      >
                        <Hand className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {raisedHands.includes(currentUser.id)
                        ? "Lower hand"
                        : "Raise hand"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Leave room */}
                <Button
                  onClick={onLeaveRoom}
                  variant="destructive"
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2 w-24">
                <span className="text-xs text-gray-400">
                  {participants.length} online
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupVideoRoom;
