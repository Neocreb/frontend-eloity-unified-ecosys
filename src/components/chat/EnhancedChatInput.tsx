import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  Mic,
  MicOff,
  Smile,
  Paperclip,
  Image,
  File,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Gift,
  Heart,
  Laugh,
  Camera,
  Download,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { requestCameraAccess, stopCameraStream } from "@/utils/cameraPermissions";

interface EnhancedChatInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: (
    type: "text" | "voice" | "sticker" | "media",
    content: string,
    metadata?: any,
  ) => void;
  isMobile?: boolean;
  disabled?: boolean;
}

// Sticker categories and data
const stickerCategories = [
  {
    id: "emotions",
    name: "Emotions",
    icon: "😊",
    stickers: [
      { id: "1", emoji: "😀", name: "Happy" },
      { id: "2", emoji: "😂", name: "Laughing" },
      { id: "3", emoji: "😍", name: "Love" },
      { id: "4", emoji: "😢", name: "Crying" },
      { id: "5", emoji: "😮", name: "Surprised" },
      { id: "6", emoji: "😴", name: "Sleeping" },
      { id: "7", emoji: "🤔", name: "Thinking" },
      { id: "8", emoji: "😎", name: "Cool" },
      { id: "9", emoji: "😇", name: "Angel" },
      { id: "10", emoji: "🤗", name: "Hugging" },
      { id: "11", emoji: "🥳", name: "Party" },
      { id: "12", emoji: "😅", name: "Nervous" },
    ],
  },
  {
    id: "gestures",
    name: "Gestures",
    icon: "👍",
    stickers: [
      { id: "13", emoji: "👍", name: "Thumbs Up" },
      { id: "14", emoji: "👎", name: "Thumbs Down" },
      { id: "15", emoji: "👌", name: "OK" },
      { id: "16", emoji: "✌️", name: "Peace" },
      { id: "17", emoji: "🤝", name: "Handshake" },
      { id: "18", emoji: "👏", name: "Clapping" },
      { id: "19", emoji: "🙏", name: "Prayer" },
      { id: "20", emoji: "💪", name: "Strong" },
      { id: "21", emoji: "👋", name: "Wave" },
      { id: "22", emoji: "🤘", name: "Rock On" },
      { id: "23", emoji: "🤙", name: "Call Me" },
      { id: "24", emoji: "👊", name: "Fist Bump" },
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: "💼",
    stickers: [
      { id: "25", emoji: "💼", name: "Briefcase" },
      { id: "26", emoji: "💰", name: "Money" },
      { id: "27", emoji: "📈", name: "Chart Up" },
      { id: "28", emoji: "📊", name: "Bar Chart" },
      { id: "29", emoji: "💡", name: "Idea" },
      { id: "30", emoji: "🎯", name: "Target" },
      { id: "31", emoji: "🚀", name: "Rocket" },
      { id: "32", emoji: "⭐", name: "Star" },
      { id: "33", emoji: "🔥", name: "Fire" },
      { id: "34", emoji: "⚡", name: "Lightning" },
      { id: "35", emoji: "🏆", name: "Trophy" },
      { id: "36", emoji: "🎊", name: "Celebration" },
    ],
  },
  {
    id: "memes",
    name: "Memes",
    icon: "🤣",
    stickers: [
      { id: "37", emoji: "🤣", name: "ROFL" },
      { id: "38", emoji: "😭", name: "Crying Laughing" },
      { id: "39", emoji: "🤯", name: "Mind Blown" },
      { id: "40", emoji: "🙃", name: "Upside Down" },
      { id: "41", emoji: "😵", name: "Dizzy" },
      { id: "42", emoji: "🤐", name: "Zipper Mouth" },
      { id: "43", emoji: "🤭", name: "Hand Over Mouth" },
      { id: "44", emoji: "🤪", name: "Zany" },
      { id: "45", emoji: "😜", name: "Winking Tongue" },
      { id: "46", emoji: "🤤", name: "Drooling" },
      { id: "47", emoji: "😈", name: "Devil" },
      { id: "48", emoji: "👽", name: "Alien" },
    ],
  },
];

export const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
  messageInput,
  setMessageInput,
  onSendMessage,
  isMobile = false,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showStickers, setShowStickers] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [voicePermission, setVoicePermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Check microphone permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        setVoicePermission(permission.state);
        permission.onchange = () => setVoicePermission(permission.state);
      } catch (error) {
        console.log("Permission API not supported");
      }
    };
    checkPermission();
  }, []);

  const startRecording = async () => {
    try {
      const result = await requestCameraAccess({ audio: true });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.stream) {
        const mediaRecorder = new MediaRecorder(result.stream);

        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Send voice message with transcription (mock for now)
          const transcription = "Voice message recorded"; // In real app, use speech-to-text API

          onSendMessage("voice", audioUrl, {
            duration: recordingTime,
            transcription,
            audioBlob,
          });

          // Clean up
          stopCameraStream(result.stream);
          setRecordingTime(0);
        };

        mediaRecorder.start();
        setIsRecording(true);

        // Start timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Recording Error",
        description: error.message || "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleSendSticker = (sticker: any) => {
    onSendMessage("sticker", sticker.emoji, {
      name: sticker.name,
      id: sticker.id,
    });
    setShowStickers(false);
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "file" | "image",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      onSendMessage("media", fileUrl, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        mediaType: type,
        file,
      });
    }
    // Reset input
    event.target.value = "";
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`border-t flex-shrink-0 bg-gradient-to-r from-background via-background to-background backdrop-blur-sm ${isMobile ? "p-2.5" : "p-3"} relative`}
    >
      {/* Recording overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-400/15 to-red-500/20 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-red-500/25 animate-pulse">
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-ping"></div>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              Recording: {formatRecordingTime(recordingTime)}
            </span>
            <Button
              onClick={stopRecording}
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <MicOff className="w-4 h-4 mr-1" />
              Stop
            </Button>
          </div>
        </div>
      )}

      {/* File inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "file")}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "image")}
        accept="image/*,video/*"
      />

      {/* Main input area */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Popover open={showAttachments} onOpenChange={setShowAttachments}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex-shrink-0 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200",
                isMobile ? "h-11 w-11" : "h-10 w-10",
              )}
            >
              <Paperclip className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-64 p-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-xl">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col gap-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200 rounded-xl"
                onClick={() => imageInputRef.current?.click()}
              >
                <Image className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium">Photo/Video</span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col gap-2 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/20 transition-all duration-200 rounded-xl"
                onClick={() => fileInputRef.current?.click()}
              >
                <File className="h-7 w-7 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium">Document</span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col gap-2 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/20 dark:hover:to-purple-800/20 transition-all duration-200 rounded-xl"
                onClick={() => {
                  // Future: Open camera
                  // Trigger camera input for photo capture
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      onSendMessage?.("media", url, {
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        mediaType: "image",
                        file,
                      });
                      toast({
                        title: "Photo captured!",
                        description: "Your photo has been sent.",
                      });
                    }
                  };
                  input.click();
                }}
              >
                <Camera className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium">Camera</span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-4 flex flex-col gap-2 hover:bg-gradient-to-br hover:from-pink-50 hover:to-pink-100 dark:hover:from-pink-900/20 dark:hover:to-pink-800/20 transition-all duration-200 rounded-xl"
                onClick={() => {
                  // Future: Location sharing
                  toast({
                    title: "Gift",
                    description: "Gift feature in development!",
                  });
                }}
              >
                <Gift className="h-7 w-7 text-pink-600 dark:text-pink-400" />
                <span className="text-xs font-medium">Gift</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Message input */}
        <div className="flex-1 relative">
          <Input
            placeholder={isMobile ? "Type a message..." : "Type a message..."}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (messageInput.trim()) {
                  onSendMessage("text", messageInput.trim());
                  setMessageInput("");
                }
              }
            }}
            className={cn(
              "pr-12 rounded-full border-2 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-gray-50 dark:bg-gray-900 shadow-inner",
              isMobile ? "h-11" : "h-10",
            )}
            disabled={disabled || isRecording}
          />

          {/* Emoji/Sticker button */}
          <Popover open={showStickers} onOpenChange={setShowStickers}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all duration-200"
              >
                <Smile className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-80 p-0">
              <Tabs defaultValue="emotions" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {stickerCategories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="text-xs"
                    >
                      {category.icon}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {stickerCategories.map((category) => (
                  <TabsContent
                    key={category.id}
                    value={category.id}
                    className="p-3"
                  >
                    <ScrollArea className="h-32">
                      <div className="grid grid-cols-6 gap-2">
                        {category.stickers.map((sticker) => (
                          <Button
                            key={sticker.id}
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 text-lg hover:bg-muted"
                            onClick={() => handleSendSticker(sticker)}
                          >
                            {sticker.emoji}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </PopoverContent>
          </Popover>
        </div>

        {/* Voice/Send button */}
        {messageInput.trim() ? (
          <Button
            onClick={() => {
              onSendMessage("text", messageInput.trim());
              setMessageInput("");
            }}
            className={cn(
              "flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105",
              isMobile ? "h-11 w-11" : "h-10 w-10",
            )}
            disabled={disabled}
          >
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "flex-shrink-0 rounded-full transition-all duration-200 hover:scale-105",
              isRecording
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 animate-pulse"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 hover:shadow-green-500/40",
              isMobile ? "h-11 w-11" : "h-10 w-10",
            )}
            disabled={disabled || voicePermission === "denied"}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedChatInput;
