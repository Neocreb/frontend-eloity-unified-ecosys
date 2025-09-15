import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Users,
  Settings,
  Maximize,
  Minimize,
  MoreVertical,
  UserPlus,
  Share,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isAudioMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: "excellent" | "good" | "poor";
}

interface VoiceVideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  callType: "voice" | "video" | "group";
  participants: CallParticipant[];
  currentUser: CallParticipant;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onInviteUsers?: () => void;
  onEndCall: () => void;
  chatName?: string;
  isIncoming?: boolean;
  onAcceptCall?: () => void;
  onDeclineCall?: () => void;
}

export const VoiceVideoCall: React.FC<VoiceVideoCallProps> = ({
  isOpen,
  onClose,
  callType,
  participants,
  currentUser,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onInviteUsers,
  onEndCall,
  chatName,
  isIncoming = false,
  onAcceptCall,
  onDeclineCall,
}) => {
  const { toast } = useToast();
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [speakerVolume, setSpeakerVolume] = useState(100);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Start call timer
  useEffect(() => {
    if (isOpen && !isIncoming) {
      const timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, isIncoming]);

  // Initialize media streams (mock implementation)
  useEffect(() => {
    if (isOpen && callType === "video") {
      // In a real implementation, you would initialize WebRTC here
      initializeVideoCall();
    }
  }, [isOpen, callType]);

  const initializeVideoCall = async () => {
    try {
      // Mock video stream initialization
      // In real implementation, use getUserMedia and WebRTC
      toast({
        title: "Video Call Initialized",
        description: "Connected to video call",
      });
    } catch (error) {
      toast({
        title: "Video Call Error",
        description: "Failed to initialize video call",
        variant: "destructive",
      });
    }
  };

  const formatCallDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  // Incoming call UI
  if (isIncoming) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-6 p-6">
            <div className="relative">
              <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary ring-offset-4">
                <AvatarImage src={participants[0]?.avatar} />
                <AvatarFallback className="text-2xl">
                  {participants[0]?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-2">
                {callType === "video" ? (
                  <Video className="w-8 h-8 text-primary bg-background rounded-full p-1 border-2 border-primary" />
                ) : (
                  <Phone className="w-8 h-8 text-primary bg-background rounded-full p-1 border-2 border-primary" />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                {participants[0]?.name || chatName}
              </h3>
              <p className="text-muted-foreground">
                Incoming {callType} call...
              </p>
            </div>

            <div className="flex justify-center gap-6">
              <Button
                onClick={onDeclineCall}
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button
                onClick={onAcceptCall}
                className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
              >
                <Phone className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Active call UI
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "p-0 border-0",
          isFullscreen
            ? "max-w-none w-screen h-screen"
            : "sm:max-w-4xl sm:h-[600px]",
        )}
      >
        <div className="relative h-full bg-black text-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {callType === "group" && <Users className="w-5 h-5" />}
                <h3 className="font-semibold">
                  {chatName || participants[0]?.name}
                </h3>
                {participants.length > 1 && (
                  <Badge variant="secondary">
                    {participants.length} participants
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-300">
                {formatCallDuration(callDuration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowChat(!showChat)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {showChat ? "Hide Chat" : "Show Chat"}
                  </DropdownMenuItem>
                  {onInviteUsers && (
                    <DropdownMenuItem onClick={onInviteUsers}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Others
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Call Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Share className="w-4 h-4 mr-2" />
                    Share Call Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Video Area */}
          <div className="flex-1 relative">
            {callType === "video" ? (
              <div className="h-full relative">
                {/* Main video (remote) */}
                <video
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />

                {/* Local video (picture-in-picture) */}
                <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                  <video
                    ref={localVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                </div>

                {/* Participant overlays */}
                {participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`absolute bottom-4 ${
                      index === 0 ? "left-4" : `left-${4 + index * 40}`
                    } bg-black/50 backdrop-blur rounded-lg p-2 flex items-center gap-2`}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="text-xs">
                        {participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{participant.name}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${getConnectionQualityColor(participant.connectionQuality)}`}
                    />
                    {!participant.isAudioMuted && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Voice call UI
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="flex justify-center gap-4">
                    {participants.slice(0, 3).map((participant) => (
                      <div key={participant.id} className="text-center">
                        <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/30">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="text-2xl">
                            {participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm mt-2">{participant.name}</p>
                        <div
                          className={`w-2 h-2 mx-auto mt-1 rounded-full ${getConnectionQualityColor(participant.connectionQuality)}`}
                        />
                      </div>
                    ))}
                  </div>

                  {participants.length > 3 && (
                    <p className="text-gray-300">
                      +{participants.length - 3} more participants
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-6 bg-black/50 backdrop-blur">
            <div className="flex items-center justify-center gap-4">
              {/* Audio toggle */}
              <Button
                onClick={onToggleAudio}
                variant={currentUser.isAudioMuted ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full w-14 h-14"
              >
                {currentUser.isAudioMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>

              {/* Video toggle (only for video calls) */}
              {callType === "video" && (
                <Button
                  onClick={onToggleVideo}
                  variant={
                    !currentUser.isVideoEnabled ? "destructive" : "secondary"
                  }
                  size="lg"
                  className="rounded-full w-14 h-14"
                >
                  {!currentUser.isVideoEnabled ? (
                    <VideoOff className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                </Button>
              )}

              {/* Screen share */}
              <Button
                onClick={onToggleScreenShare}
                variant={currentUser.isScreenSharing ? "default" : "secondary"}
                size="lg"
                className="rounded-full w-14 h-14"
              >
                {currentUser.isScreenSharing ? (
                  <MonitorOff className="w-5 h-5" />
                ) : (
                  <Monitor className="w-5 h-5" />
                )}
              </Button>

              {/* Speaker/Volume */}
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setSpeakerVolume(speakerVolume > 0 ? 0 : 100)}
              >
                {speakerVolume > 0 ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </Button>

              {/* End call */}
              <Button
                onClick={onEndCall}
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceVideoCall;
