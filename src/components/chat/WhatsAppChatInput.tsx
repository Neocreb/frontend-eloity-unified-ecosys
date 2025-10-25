import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Send,
  Mic,
  MicOff,
  Smile,
  Paperclip,
  Image,
  File,
  X,
  Camera,
  Gift,
  Plus,
  Sticker,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { requestCameraAccess, stopCameraStream } from "@/utils/cameraPermissions";
import { MemeStickerPicker } from "./MemeStickerPicker";
import { WhatsAppStickerPicker } from "./WhatsAppStickerPicker";
import { MobileStickerBottomSheet } from "./MobileStickerBottomSheet";
import { StickerData } from "@/types/sticker";
import { useUserCollections } from "@/contexts/UserCollectionsContext";

interface WhatsAppChatInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: (
    type: "text" | "voice" | "sticker" | "media",
    content: string,
    metadata?: any,
  ) => void;
  isMobile?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onMediaSaved?: (mediaId: string, collection: "memes" | "gifs" | "stickers") => void;
  onSaveToCollection?: (mediaId: string, collection: "memes" | "gifs" | "stickers") => void;
  onRemoveFromCollection?: (mediaId: string, collection: "memes" | "gifs" | "stickers") => void;
  onReportMedia?: (mediaId: string, reason: string) => void;
  currentUserId?: string;
}

export const WhatsAppChatInput: React.FC<WhatsAppChatInputProps> = ({
  messageInput,
  setMessageInput,
  onSendMessage,
  isMobile = false,
  disabled = false,
  placeholder = "Type a message...",
  onMediaSaved,
  onSaveToCollection,
  onRemoveFromCollection,
  onReportMedia,
  currentUserId = "current_user",
}) => {
  const { toast } = useToast();
  const { collections } = useUserCollections();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showStickers, setShowStickers] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [stickerPickerMode, setStickerPickerMode] = useState<"enhanced" | "legacy">("enhanced");
  const [voicePermission, setVoicePermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSendSticker = (sticker: StickerData) => {
    // Determine if it's an emoji or image sticker
    const isEmojiSticker = sticker.type === "emoji" || (sticker.emoji && !sticker.fileUrl);

    // Use fileUrl if available, otherwise use emoji/name for text stickers
    const stickerContent = isEmojiSticker ? (sticker.emoji || sticker.name) : sticker.fileUrl;

    onSendMessage("sticker", stickerContent, {
      stickerName: sticker.name,
      stickerPackId: sticker.packId,
      stickerPackName: sticker.packName,
      stickerUrl: sticker.fileUrl,
      stickerThumbnailUrl: sticker.thumbnailUrl || sticker.fileUrl,
      stickerType: sticker.type,
      stickerWidth: sticker.width || 128,
      stickerHeight: sticker.height || 128,
      isAnimated: sticker.type === "animated" || sticker.type === "gif" || sticker.animated,
      animated: sticker.animated || sticker.type === "animated" || sticker.type === "gif",
      // Include meme metadata if present
      topText: sticker.metadata?.topText,
      bottomText: sticker.metadata?.bottomText,
      originalFile: sticker.metadata?.originalFile,
      duration: sticker.metadata?.duration,
      capturedAt: sticker.metadata?.capturedAt,
    });

    setShowStickers(false);

    // Show success feedback
    toast({
      title: "Sticker sent!",
      description: `Sent ${sticker.name}`,
      duration: 2000,
    });

    // Focus back on input
    inputRef.current?.focus();
  };

  const handleLegacyStickerSelect = (sticker: any) => {
    // Handle legacy sticker picker format
    onSendMessage("sticker", sticker.emoji, {
      stickerName: sticker.name,
      pack: sticker.pack,
      animated: sticker.animated,
    });
    setShowStickers(false);
    inputRef.current?.focus();
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
    setShowAttachments(false);
  };

  const handleSendText = () => {
    if (messageInput.trim()) {
      onSendMessage("text", messageInput.trim());
      setMessageInput("");
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "border-t flex-shrink-0 bg-gradient-to-r from-background via-background to-background backdrop-blur-sm relative",
        isMobile ? "p-2.5" : "p-3"
      )}
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
          <PopoverContent side="top" className="w-72 p-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 shadow-xl">
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
                  // Trigger camera input for photo capture
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      onSendMessage("media", url, {
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
                  toast({
                    title: "Gift",
                    description: "Gift feature coming soon!",
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
            ref={inputRef}
            placeholder={placeholder}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
              }
            }}
            className={cn(
              "pr-12 rounded-full border-2 transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-gray-50 dark:bg-gray-900 shadow-inner",
              isMobile ? "h-11 text-base" : "h-10 text-sm",
              isMobile && "touch-manipulation"
            )}
            disabled={disabled || isRecording}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck="true"
          />

          {/* Sticker/Emoji button */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {isMobile ? (
              <MobileStickerBottomSheet
                isOpen={showStickers}
                onOpenChange={setShowStickers}
                onStickerSelect={handleSendSticker}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all duration-200"
                  >
                    <Sticker className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </Button>
                }
              />
            ) : (
              <Popover open={showStickers} onOpenChange={setShowStickers}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-all duration-200"
                  >
                    <Sticker className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  className="p-0 border-0 shadow-none bg-transparent w-auto"
                  align="end"
                  alignOffset={-20}
                  sideOffset={5}
                  avoidCollisions={true}
                  collisionPadding={8}
                >
                  <div className="flex flex-col gap-2">
                    {/* Mode toggle */}
                    <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 mx-auto">
                      <Button
                        size="sm"
                        variant={stickerPickerMode === "enhanced" ? "default" : "ghost"}
                        onClick={() => setStickerPickerMode("enhanced")}
                        className="text-xs"
                      >
                        Enhanced
                      </Button>
                      <Button
                        size="sm"
                        variant={stickerPickerMode === "legacy" ? "default" : "ghost"}
                        onClick={() => setStickerPickerMode("legacy")}
                        className="text-xs"
                      >
                        Classic
                      </Button>
                    </div>

                    {/* Sticker picker */}
                    {stickerPickerMode === "enhanced" ? (
                      <MemeStickerPicker
                        onStickerSelect={handleSendSticker}
                        onClose={() => setShowStickers(false)}
                        isMobile={false}
                      />
                    ) : (
                      <WhatsAppStickerPicker
                        onStickerSelect={handleLegacyStickerSelect}
                        isMobile={false}
                      />
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Voice/Send button */}
        {messageInput.trim() ? (
          <Button
            onClick={handleSendText}
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

export default WhatsAppChatInput;
