import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  X,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Music,
  MapPin,
  UserPlus,
  Smile,
  Globe,
  Users,
  Lock,
  Clock,
  DollarSign,
  Megaphone,
  TestTube,
  BookOpen,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import TagPeopleModal from "@/components/feed/TagPeopleModal";
import FeelingActivityModal from "@/components/feed/FeelingActivityModal";
import CheckInModal from "@/components/feed/CheckInModal";
import { supabase } from "@/integrations/supabase/client";
import { storiesService } from "@/services/storiesService";
import EdithAIGenerator from "@/components/ai/EdithAIGenerator";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postType, setPostType] = useState("post");
  const [privacy, setPrivacy] = useState("public");
  const [showTagPeople, setShowTagPeople] = useState(false);
  const [showFeeling, setShowFeeling] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [taggedPeople, setTaggedPeople] = useState<any[]>([]);
  const [feeling, setFeeling] = useState<any>(null);
  const [location, setLocation] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [enableMonetization, setEnableMonetization] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postContent.trim()) {
      toast({
        title: "Empty post",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      if (selectedImage) {
        const fileName = `${user?.id}/${Date.now()}-${selectedImage.name}`;
        const { data, error } = await supabase.storage
          .from("posts")
          .upload(fileName, selectedImage);

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from("posts")
          .getPublicUrl(fileName);

        imageUrl = publicUrl.publicUrl;
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user?.id,
          content: postContent,
          image: imageUrl,
          visibility: privacy,
          allow_comments: allowComments,
          monetization_enabled: enableMonetization,
          scheduled_at: scheduledDate ? scheduledDate.toISOString() : null,
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: scheduledDate ? "Your post will be published at the scheduled time." : "Your post has been published.",
      });

      navigate("/app/feed");
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Failed to create post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/app/feed")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Create Post</h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!postContent.trim() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit}>
          {/* User Info */}
          <div className="bg-white rounded-lg p-4 mb-4 flex gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-gray-500">@{user?.username}</p>
            </div>
          </div>

          {/* Post Editor */}
          <div className="bg-white rounded-lg p-6 mb-4">
            <Textarea
              ref={textareaRef}
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="text-lg min-h-[200px] border-0 resize-none focus-visible:ring-0 p-0"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-96 w-full object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview("");
                  }}
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            )}

            {/* Post Options */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              {/* Privacy & Type */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Label className="text-sm text-gray-600 block mb-2">Post Type</Label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger className="bg-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Regular Post</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-sm text-gray-600 block mb-2">Privacy</Label>
                  <Select value={privacy} onValueChange={setPrivacy}>
                    <SelectTrigger className="bg-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => document.getElementById("image-input")?.click()}
                >
                  <ImageIcon className="h-4 w-4" />
                  Photo
                </Button>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowFeeling(true)}
                >
                  <Smile className="h-4 w-4" />
                  Feeling
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowCheckIn(true)}
                >
                  <MapPin className="h-4 w-4" />
                  Location
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowTagPeople(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Tag
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowSchedule(!showSchedule)}
                >
                  <Clock className="h-4 w-4" />
                  Schedule
                </Button>
              </div>

              {/* Tagging Display */}
              {taggedPeople.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {taggedPeople.map((person) => (
                    <Badge key={person.id} variant="secondary">
                      {person.name}
                      <button
                        type="button"
                        onClick={() =>
                          setTaggedPeople(taggedPeople.filter((p) => p.id !== person.id))
                        }
                        className="ml-1 text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Schedule Picker */}
              {showSchedule && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {scheduledDate ? format(scheduledDate, "PPp") : "Select date & time"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Settings */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Allow comments</label>
                  <Switch checked={allowComments} onCheckedChange={setAllowComments} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Enable monetization
                  </label>
                  <Switch checked={enableMonetization} onCheckedChange={setEnableMonetization} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Generator (Optional) */}
          <div className="bg-white rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generate Content with Edith AI
            </h3>
            <EdithAIGenerator
              isEmbedded={true}
              onContentGenerated={async (content) => {
                try {
                  // Fetch the content from the URL
                  const response = await fetch(content.url);
                  if (!response.ok) {
                    throw new Error(`Failed to fetch generated content: ${response.statusText}`);
                  }

                  const blob = await response.blob();

                  // Determine file extension based on content type
                  const extension = content.type === "image" ? "png" : "mp4";
                  const filename = `edith-${content.type}-${Date.now()}.${extension}`;

                  // Create a File object from the blob
                  const file = new File([blob], filename, {
                    type: content.type === "image" ? "image/png" : "video/mp4",
                  });

                  // Set the media in the post form
                  setSelectedImage(file);
                  setImagePreview(URL.createObjectURL(blob));

                  toast({
                    title: "Content Added!",
                    description: `Your AI-generated ${content.type} has been added to your post.`,
                  });
                } catch (error) {
                  console.error("Error processing generated content:", error);
                  toast({
                    title: "Error",
                    description: "Failed to add the generated content. Please try again.",
                    variant: "destructive",
                  });
                }
              }}
              onClose={() => {
                // Close is handled by the embedded component
              }}
            />
          </div>
        </form>
      </div>

      {/* Modals */}
      {showTagPeople && (
        <TagPeopleModal
          onClose={() => setShowTagPeople(false)}
          onSelect={(person) => {
            setTaggedPeople((prev) => [...prev, person]);
            setShowTagPeople(false);
          }}
        />
      )}

      {showFeeling && (
        <FeelingActivityModal
          onClose={() => setShowFeeling(false)}
          onSelect={(f) => {
            setFeeling(f);
            setShowFeeling(false);
          }}
        />
      )}

      {showCheckIn && (
        <CheckInModal
          onClose={() => setShowCheckIn(false)}
          onSelect={(loc) => {
            setLocation(loc);
            setShowCheckIn(false);
          }}
        />
      )}
    </div>
  );
};

export default CreatePost;
