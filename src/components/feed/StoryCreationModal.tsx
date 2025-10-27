// src/components/feed/StoryCreationModal.tsx
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Upload,
  Image,
  Video,
  Type,
  Palette,
  Camera,
  Music,
  Smile,
  Clock,
  Globe,
  Users,
  Lock,
  Send,
} from "lucide-react";
import { MediaUpload, feedService } from "@/services/feedService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { storiesService } from "@/services/storiesService";
import { supabase } from "@/integrations/supabase/client";

interface StoryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (story: any) => void;
}

interface StoryData {
  type: "image" | "video" | "text";
  content?: string;
  media?: MediaUpload;
  textContent?: string;
  backgroundColor?: string;
  textColor?: string;
  duration?: number;
  privacy: "public" | "friends" | "close-friends";
}

const TEXT_BACKGROUNDS = [
  {
    name: "Gradient Blue",
    value: "bg-gradient-to-br from-blue-400 to-purple-600",
  },
  {
    name: "Gradient Pink",
    value: "bg-gradient-to-br from-pink-400 to-red-600",
  },
  {
    name: "Gradient Green",
    value: "bg-gradient-to-br from-green-400 to-teal-600",
  },
  {
    name: "Gradient Orange",
    value: "bg-gradient-to-br from-orange-400 to-yellow-600",
  },
  { name: "Solid Black", value: "bg-black" },
  { name: "Solid White", value: "bg-white border-2 border-gray-200" },
  { name: "Solid Navy", value: "bg-navy-900" },
  { name: "Solid Purple", value: "bg-purple-600" },
];

const TEXT_COLORS = [
  { name: "White", value: "text-white" },
  { name: "Black", value: "text-black" },
  { name: "Yellow", value: "text-yellow-300" },
  { name: "Pink", value: "text-pink-300" },
  { name: "Blue", value: "text-blue-300" },
  { name: "Green", value: "text-green-300" },
];

export function StoryCreationModal({
  isOpen,
  onClose,
  onStoryCreated,
}: StoryCreationModalProps) {
  const [storyType, setStoryType] = useState<"image" | "video" | "text">(
    "image",
  );
  const [storyData, setStoryData] = useState<StoryData>({
    type: "image",
    privacy: "public",
    backgroundColor: TEXT_BACKGROUNDS[0].value,
    textColor: TEXT_COLORS[0].value,
    duration: 15,
  });
  const [selectedMedia, setSelectedMedia] = useState<MediaUpload | null>(null);
  const [textContent, setTextContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const [mediaUpload] = await feedService.uploadMedia([file]);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setSelectedMedia(mediaUpload);
        setStoryType(mediaUpload.type);
        setStoryData((prev) => ({
          ...prev,
          type: mediaUpload.type,
          media: mediaUpload,
        }));
        setIsUploading(false);
        setUploadProgress(0);
      }, 300);
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateStory = async () => {
    // Validate user authentication first
    if (!user || !user.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a story.",
        variant: "destructive",
      });
      return;
    }

    if (storyType === "text" && !textContent.trim()) {
      toast({
        title: "Empty story",
        description: "Please add some text to your story.",
        variant: "destructive",
      });
      return;
    }

    if ((storyType === "image" || storyType === "video") && !selectedMedia) {
      toast({
        title: "No media selected",
        description: "Please select an image or video for your story.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let mediaUrl = "";

      // Upload media to Supabase storage if we have media
      if ((storyType === "image" || storyType === "video") && selectedMedia) {
        const bucket = "stories"; // Ensure a public bucket named "stories" exists in Supabase Storage
        const path = `${user.id}/${Date.now()}-${selectedMedia.file.name}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, selectedMedia.file, {
          upsert: false,
          cacheControl: "3600",
          contentType: selectedMedia.file.type,
        });
        
        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          toast({ 
            title: "Upload failed", 
            description: uploadError.message, 
            variant: "destructive" 
          });
          setIsSubmitting(false);
          return;
        }
        
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        mediaUrl = data.publicUrl;
      }

      // Create story using real storiesService
      const storyDataPayload = {
        media_url: mediaUrl,
        media_type: (selectedMedia?.type || "image") as "image" | "video",
        caption: textContent || undefined,
        expires_in_hours: storyData.duration,
      };

      const newStory = await storiesService.createStory(storyDataPayload, user.id);

      // Safely extract user properties
      const userName = user.name || user.profile?.full_name || "You";
      const userUsername = user.username || user.profile?.username || "you";
      const userAvatar = user.avatar || user.profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=user";

      const storyResponse = {
        id: newStory.id,
        user: {
          id: user.id,
          name: userName,
          username: userUsername,
          avatar: userAvatar,
        },
        type: storyType,
        content: storyType === "text" ? textContent : undefined,
        media: selectedMedia,
        backgroundColor: storyType === "text" ? storyData.backgroundColor : undefined,
        textColor: storyType === "text" ? storyData.textColor : undefined,
        timestamp: newStory.created_at,
        duration: storyData.duration,
        privacy: storyData.privacy,
        views: newStory.views_count,
        isOwn: true,
      };

      onStoryCreated(storyResponse);
      handleClose();

      toast({
        title: "Story created!",
        description: "Your story has been shared with your followers.",
      });
    } catch (error) {
      console.error("Error creating story:", error);
      toast({
        title: "Failed to create story",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up
    if (selectedMedia?.preview) {
      URL.revokeObjectURL(selectedMedia.preview);
    }
    setSelectedMedia(null);
    setTextContent("");
    setStoryType("image");
    setStoryData({
      type: "image",
      privacy: "public",
      backgroundColor: TEXT_BACKGROUNDS[0].value,
      textColor: TEXT_COLORS[0].value,
      duration: 15,
    });
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
  };

  const getPrivacyIcon = () => {
    switch (storyData.privacy) {
      case "public":
        return <Globe className="w-4 h-4" />;
      case "friends":
        return <Users className="w-4 h-4" />;
      case "close-friends":
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Create Story
          </DialogTitle>
        </DialogHeader>

        {/* Story Type Selection */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button
            variant={storyType === "image" ? "default" : "outline"}
            onClick={() => setStoryType("image")}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Image className="w-5 h-5" />
            <span className="text-xs">Photo</span>
          </Button>
          <Button
            variant={storyType === "video" ? "default" : "outline"}
            onClick={() => setStoryType("video")}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Video className="w-5 h-5" />
            <span className="text-xs">Video</span>
          </Button>
          <Button
            variant={storyType === "text" ? "default" : "outline"}
            onClick={() => setStoryType("text")}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Type className="w-5 h-5" />
            <span className="text-xs">Text</span>
          </Button>
        </div>

        {/* Media Upload */}
        {(storyType === "image" || storyType === "video") && !selectedMedia && (
          <Card className="p-8 text-center border-dashed border-2">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              Add {storyType === "image" ? "Photo" : "Video"}
            </h3>
            <p className="text-gray-500 mb-4">
              {storyType === "image"
                ? "Choose a photo to share as your story"
                : "Choose a video to share as your story"}
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Select File"}
            </Button>
          </Card>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Media Preview */}
        {selectedMedia && (
          <div className="relative">
            <Card className="relative overflow-hidden">
              <div className="aspect-[9/16] max-h-80 relative">
                {selectedMedia.type === "image" ? (
                  <img
                    src={selectedMedia.preview}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={selectedMedia.preview}
                    className="w-full h-full object-cover"
                    muted
                    controls
                  />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => {
                    if (selectedMedia.preview) {
                      URL.revokeObjectURL(selectedMedia.preview);
                    }
                    setSelectedMedia(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Card>

            {/* Text Content for Media */}
            <div className="mt-4">
              <Textarea
                placeholder="Add a caption..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Text Story */}
        {storyType === "text" && (
          <div className="space-y-4">
            <div className="relative">
              <div
                className={cn(
                  "min-h-[400px] rounded-lg p-6 flex flex-col justify-center items-center relative",
                  storyData.backgroundColor,
                )}
              >
                <Textarea
                  placeholder="Type your story..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className={cn(
                    "text-2xl font-bold text-center bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/70 w-full max-w-xs",
                    storyData.textColor,
                  )}
                  rows={4}
                />
              </div>
              
              {/* Text Color Picker */}
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Text Color</p>
                <div className="flex flex-wrap gap-2">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color.name}
                      className={cn(
                        "w-8 h-8 rounded-full border-2",
                        color.value === storyData.textColor
                          ? "border-gray-800"
                          : "border-gray-300",
                        color.value.replace("text-", "bg-"),
                      )}
                      onClick={() =>
                        setStoryData((prev) => ({
                          ...prev,
                          textColor: color.value,
                        }))
                      }
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Story Settings */}
        <div className="space-y-4 pt-4 border-t">
          {/* Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <select
              value={storyData.duration}
              onChange={(e) =>
                setStoryData((prev) => ({
                  ...prev,
                  duration: parseInt(e.target.value),
                }))
              }
              className="text-sm border rounded px-2 py-1"
            >
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
            </select>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPrivacyIcon()}
              <span className="text-sm font-medium">Privacy</span>
            </div>
            <select
              value={storyData.privacy}
              onChange={(e) =>
                setStoryData((prev) => ({
                  ...prev,
                  privacy: e.target.value as any,
                }))
              }
              className="text-sm border rounded px-2 py-1"
            >
              <option value="public">Everyone</option>
              <option value="friends">Friends</option>
              <option value="close-friends">Close Friends</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleCreateStory} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Story"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
