import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Image,
  Video,
  Type,
  Camera,
  Clock,
  Globe,
  Users,
  Lock,
  ChevronLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MediaUpload, feedService } from "@/services/feedService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { storiesService } from "@/services/storiesService";
import { supabase } from "@/integrations/supabase/client";

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

const CreateStory = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const [storyType, setStoryType] = useState<"image" | "video" | "text">("image");
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

      if ((storyType === "image" || storyType === "video") && selectedMedia) {
        const bucket = "stories";
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

      const storyDataPayload = {
        media_url: mediaUrl,
        media_type: (selectedMedia?.type || "image") as "image" | "video",
        caption: textContent || undefined,
        expires_in_hours: storyData.duration,
      };

      const newStory = await storiesService.createStory(storyDataPayload, user.id);

      const userName = user.user_metadata?.name || user.profile?.full_name || user.email || "User";
      const userUsername = user.user_metadata?.username || user.profile?.username || user.email?.split('@')[0] || "user";
      const userAvatar = user.user_metadata?.avatar_url || user.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

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

      toast({
        title: "Story created!",
        description: "Your story has been shared with your followers.",
      });

      navigate(-1);
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-0 h-auto"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold">Create Story</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* Story Type Selection */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <Button
              variant={storyType === "image" ? "default" : "outline"}
              onClick={() => setStoryType("image")}
              className="flex flex-col items-center gap-1 h-auto py-4"
            >
              <Image className="w-5 h-5" />
              <span className="text-xs">Photo</span>
            </Button>
            <Button
              variant={storyType === "video" ? "default" : "outline"}
              onClick={() => setStoryType("video")}
              className="flex flex-col items-center gap-1 h-auto py-4"
            >
              <Video className="w-5 h-5" />
              <span className="text-xs">Video</span>
            </Button>
            <Button
              variant={storyType === "text" ? "default" : "outline"}
              onClick={() => setStoryType("text")}
              className="flex flex-col items-center gap-1 h-auto py-4"
            >
              <Type className="w-5 h-5" />
              <span className="text-xs">Text</span>
            </Button>
          </div>

          {/* Media Upload */}
          {(storyType === "image" || storyType === "video") && !selectedMedia && (
            <>
              <Card className="p-12 text-center border-dashed border-2 mb-6">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">
                  Add {storyType === "image" ? "Photo" : "Video"}
                </h3>
                <p className="text-gray-600 mb-6">
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={storyType === "image" ? "image/*" : "video/*"}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </Card>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </>
          )}

          {/* Media Preview */}
          {selectedMedia && (
            <div className="relative mb-6">
              <Card className="relative overflow-hidden">
                <div className="aspect-[9/16] max-h-96 relative">
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
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      if (selectedMedia.preview) {
                        URL.revokeObjectURL(selectedMedia.preview);
                      }
                      setSelectedMedia(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Add a caption</label>
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
            <div className="space-y-4 mb-6">
              <div
                className={cn(
                  "min-h-96 rounded-lg p-6 flex flex-col justify-center items-center relative border",
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
                  rows={6}
                />
              </div>
              
              {/* Text Color Picker */}
              <div>
                <p className="text-sm font-medium mb-3">Text Color</p>
                <div className="flex flex-wrap gap-2">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color.name}
                      className={cn(
                        "w-8 h-8 rounded-full border-2",
                        color.value === storyData.textColor
                          ? "border-gray-800"
                          : "border-gray-300",
                      )}
                      style={{ 
                        backgroundColor: color.value.includes('white') ? 'white' : 
                                        color.value.includes('yellow') ? '#fcd34d' :
                                        color.value.includes('pink') ? '#ec4899' :
                                        color.value.includes('blue') ? '#60a5fa' :
                                        color.value.includes('green') ? '#4ade80' : 'black'
                      }}
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
          )}

          {/* Story Settings */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h3 className="font-medium">Story Settings</h3>
            
            {/* Duration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
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
                className="text-sm border rounded px-3 py-2"
              >
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
              </select>
            </div>

            {/* Privacy */}
            <div className="flex items-center justify-between pt-4 border-t">
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
                className="text-sm border rounded px-3 py-2"
              >
                <option value="public">Everyone</option>
                <option value="friends">Friends</option>
                <option value="close-friends">Close Friends</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="max-w-2xl mx-auto flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleCreateStory} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? "Creating..." : "Create Story"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateStory;
