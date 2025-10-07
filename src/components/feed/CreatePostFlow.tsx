import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  MessageCircle,
  Crown,
  Zap,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useFeed } from "@/contexts/FeedContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import TagPeopleModal from "./TagPeopleModal";
import FeelingActivityModal from "./FeelingActivityModal";
import CheckInModal from "./CheckInModal";
import { supabase } from "@/integrations/supabase/client";

interface CreatePostFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

type PostStep = "create" | "settings";
type AudienceType = "public" | "friends" | "private" | "custom";

const CreatePostFlow: React.FC<CreatePostFlowProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<PostStep>("create");
  const [content, setContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [location, setLocation] = useState("");
  const [feeling, setFeeling] = useState("");
  const [activity, setActivity] = useState("");
  const [taggedUsers, setTaggedUsers] = useState<any[]>([]);
  
  // Settings
  const [audience, setAudience] = useState<AudienceType>("public");
  const [shareToStory, setShareToStory] = useState(false);
  const [enableComments, setEnableComments] = useState(true);
  const [enableBoost, setEnableBoost] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [enableMonetization, setEnableMonetization] = useState(false);
  const [enableCollaborator, setEnableCollaborator] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [enableABTest, setEnableABTest] = useState(false);
  const [abTestVariant, setAbTestVariant] = useState("A");
  
  // Modal states
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [showABTestModal, setShowABTestModal] = useState(false);
  const [showTagPeopleModal, setShowTagPeopleModal] = useState(false);
  const [showFeelingModal, setShowFeelingModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addPost } = useFeed();

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedMedia(file);

      // Determine media type
      if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else if (file.type.startsWith('audio/')) {
        setMediaType('audio');
      } else {
        setMediaType('image');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = () => {
    videoInputRef.current?.click();
  };

  const handleAudioSelect = () => {
    audioInputRef.current?.click();
  };

  const handleNext = () => {
    if (currentStep === "create") {
      setCurrentStep("settings");
    }
  };

  const handleBack = () => {
    if (currentStep === "settings") {
      setCurrentStep("create");
    }
  };

  const handleTaggedUsers = (users: any[]) => {
    setTaggedUsers(users);
  };

  const handleFeelingActivity = (selection: { type: 'feeling' | 'activity'; data: any }) => {
    if (selection.type === 'feeling') {
      setFeeling(selection.data.label);
      setActivity('');
    } else {
      setActivity(selection.data.label);
      setFeeling('');
    }
  };

  const handleCheckIn = (location: any) => {
    setLocation(location.name);
  };

  const handlePost = async () => {
    if (!user?.id) {
      toast({ title: "Sign in required", description: "Please sign in to post.", variant: "destructive" });
      return;
    }

    try {
      let publicUrl: string | null = null;

      if (selectedMedia) {
        const bucket = "posts"; // Ensure a public bucket named "posts" exists in Supabase Storage
        const path = `${user.id}/${Date.now()}-${selectedMedia.name}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, selectedMedia, {
          upsert: false,
          cacheControl: "3600",
          contentType: selectedMedia.type,
        });
        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
          return;
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        publicUrl = data.publicUrl;
      }

      const { data: inserted, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content,
          image_url: publicUrl,
          location: location || null,
          tagged_users: taggedUsers.map((t: any) => t.id || t.username || t.name).slice(0, 20),
        })
        .select("*, profiles:user_id(full_name, username, avatar_url, is_verified)")
        .single();

      if (error) {
        console.error("Create post error:", error.message);
        toast({ title: "Post failed", description: error.message, variant: "destructive" });
        return;
      }

      const newPost = {
        id: inserted.id,
        type: "post" as const,
        timestamp: new Date(inserted.created_at),
        priority: 8,
        author: {
          id: user.id,
          name: user.name || "You",
          username: user.username || "you",
          avatar: user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
          verified: false,
          badges: [] as string[],
        },
        content: {
          text: inserted.content,
          media: inserted.image_url ? [{ type: mediaType || 'image', url: inserted.image_url, alt: "User uploaded media" }] : [],
          feeling: feeling || undefined,
          activity: activity || undefined,
          taggedUsers: taggedUsers,
          audience: audience,
          monetized: enableMonetization,
          boosted: enableBoost,
          collaborative: enableCollaborator,
          collaborator: collaboratorEmail || undefined,
        },
        interactions: { likes: 0, comments: enableComments ? 0 : -1, shares: 0, views: 0 },
        userInteracted: { liked: false, commented: false, shared: false, saved: false },
      };

      addPost(newPost);

      if (scheduleDate) {
        toast({ title: "Post scheduled!", description: `Your post will be published on ${format(scheduleDate, "PPP")}` });
      } else {
        toast({ title: "Post published!", description: "Your post has been shared with your audience." });
      }

      handleClose();
    } catch (e: any) {
      console.error("Post creation error:", e?.message || e);
      toast({ title: "Post failed", description: e?.message || "Unexpected error" , variant: "destructive"});
    }
  };

  const handleClose = () => {
    setCurrentStep("create");
    setContent("");
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    setLocation("");
    setFeeling("");
    setActivity("");
    setTaggedUsers([]);
    setShareToStory(false);
    setEnableBoost(false);
    setScheduleDate(undefined);
    setEnableMonetization(false);
    setEnableCollaborator(false);
    setCollaboratorEmail("");
    setEnableABTest(false);
    onClose();
  };

  const canProceed = content.trim() || mediaPreview;

  const getAudienceIcon = () => {
    switch (audience) {
      case "public": return <Globe className="h-3 w-3" />;
      case "friends": return <Users className="h-3 w-3" />;
      case "private": return <Lock className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
    }
  };

  const getAudienceLabel = () => {
    switch (audience) {
      case "public": return "Public";
      case "friends": return "Friends";
      case "private": return "Only me";
      case "custom": return "Custom";
      default: return "Public";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg w-full h-[95vh] sm:h-[85vh] mx-1 sm:mx-2 md:mx-auto p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {currentStep === "settings" && (
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              )}
              <h2 className="text-sm sm:text-base md:text-lg font-semibold truncate">
                {currentStep === "create" ? "Create post" : "Post settings"}
              </h2>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {currentStep === "create" && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  size="sm"
                  className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 md:px-4 text-xs sm:text-sm"
                >
                  Next
                </Button>
              )}
              {currentStep === "settings" && (
                <Button onClick={handlePost} size="sm" className="h-7 sm:h-8 md:h-9 px-2 sm:px-3 md:px-4 text-xs sm:text-sm">
                  Post
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleClose} className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 flex-shrink-0">
                <X className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pb-safe">
            {currentStep === "create" && (
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-xs sm:text-sm">{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{user?.name}</p>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-blue-600">
                      {getAudienceIcon()}
                      <span>{getAudienceLabel()}</span>
                    </div>
                  </div>
                </div>

                {/* Text input */}
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px] sm:min-h-[120px] border-0 resize-none text-base sm:text-lg placeholder:text-gray-400 focus-visible:ring-0"
                />

                {/* Media preview */}
                {mediaPreview && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10 h-8 w-8"
                      onClick={() => {
                        setMediaPreview(null);
                        setSelectedMedia(null);
                        setMediaType(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {mediaType === 'video' ? (
                      <video
                        src={mediaPreview}
                        className="w-full max-h-64 sm:max-h-96 rounded-lg object-cover"
                        controls
                      />
                    ) : mediaType === 'audio' ? (
                      <div className="w-full p-8 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                        <Music className="h-16 w-16 text-gray-400 mb-4" />
                        <audio src={mediaPreview} controls className="w-full max-w-sm" />
                        <p className="text-sm text-gray-600 mt-2">{selectedMedia?.name}</p>
                      </div>
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="w-full max-h-64 sm:max-h-96 rounded-lg object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Tagged users display */}
                {taggedUsers.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">
                      With {taggedUsers.map(u => u.name).join(', ')}
                    </span>
                  </div>
                )}

                {/* Feeling/Activity display */}
                {(feeling || activity) && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <Smile className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">
                      {feeling ? `Feeling ${feeling}` : `${activity}`}
                    </span>
                  </div>
                )}

                {/* Location display */}
                {location && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">At {location}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleMediaSelect}
                  />
                  <input
                    type="file"
                    ref={videoInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={handleMediaSelect}
                  />
                  <input
                    type="file"
                    ref={audioInputRef}
                    className="hidden"
                    accept="audio/*"
                    onChange={handleMediaSelect}
                  />

                  <Button
                    variant="outline"
                    className="h-12 sm:h-16 flex-col gap-1 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4 sm:h-6 sm:w-6 text-green-500" />
                    <span>Photo</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 sm:h-16 flex-col gap-1 text-xs"
                    onClick={handleVideoSelect}
                  >
                    <Video className="h-4 w-4 sm:h-6 sm:w-6 text-red-500" />
                    <span>Video</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 sm:h-16 flex-col gap-1 text-xs"
                    onClick={handleAudioSelect}
                  >
                    <Music className="h-4 w-4 sm:h-6 sm:w-6 text-purple-500" />
                    <span>Audio</span>
                  </Button>
                </div>

                {/* Quick options */}
                <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 sm:h-12 text-sm"
                    onClick={() => setShowTagPeopleModal(true)}
                  >
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                    <span>Tag people</span>
                    {taggedUsers.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {taggedUsers.length}
                      </Badge>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 sm:h-12 text-sm"
                    onClick={() => setShowFeelingModal(true)}
                  >
                    <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                    <span>Feeling/activity</span>
                    {(feeling || activity) && (
                      <Badge variant="secondary" className="ml-auto">
                        ✓
                      </Badge>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 sm:h-12 text-sm"
                    onClick={() => setShowCheckInModal(true)}
                  >
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    <span>Check in</span>
                    {location && (
                      <Badge variant="secondary" className="ml-auto">
                        ✓
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === "settings" && (
              <div className="space-y-0">
                {/* Post preview */}
                <div className="p-3 sm:p-4 border-b">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">Post preview</h3>
                  {mediaPreview && (
                    <div className="mb-3">
                      {selectedMedia?.type.startsWith('video') ? (
                        <video
                          src={mediaPreview}
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  )}
                  {content && (
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">{content}</p>
                  )}
                </div>

                {/* Settings options */}
                <div className="space-y-0">
                  {/* Post audience */}
                  <button
                    onClick={() => setShowAudienceModal(true)}
                    className="flex items-center justify-between w-full p-3 sm:p-4 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getAudienceIcon()}
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Post audience</p>
                        <p className="text-xs sm:text-sm text-gray-500">{getAudienceLabel()}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </button>

                  {/* Scheduling */}
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex items-center justify-between w-full p-3 sm:p-4 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Scheduling options</p>
                        <p className="text-xs sm:text-sm text-blue-600">
                          {scheduleDate ? format(scheduleDate, "PPP") : "Publish now"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </button>

                  {/* Share to story */}
                  <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Share to your story</p>
                      </div>
                    </div>
                    <Switch checked={shareToStory} onCheckedChange={setShareToStory} />
                  </div>

                  {/* Comments */}
                  <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Allow comments</p>
                        <p className="text-xs sm:text-sm text-gray-500">Let people comment on your post</p>
                      </div>
                    </div>
                    <Switch checked={enableComments} onCheckedChange={setEnableComments} />
                  </div>

                  {/* Monetization */}
                  <button
                    onClick={() => setShowMonetizationModal(true)}
                    className="flex items-center justify-between w-full p-3 sm:p-4 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Monetization</p>
                        <p className="text-xs sm:text-sm text-blue-600">
                          {enableMonetization ? "Enabled - Earn from views" : "Earn money on your content"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </button>

                  {/* Boost post */}
                  <button
                    onClick={() => setShowBoostModal(true)}
                    className="flex items-center justify-between w-full p-3 sm:p-4 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Megaphone className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Boost post</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {enableBoost ? "Boost enabled - Reach more people" : "Reach more people with ads"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </button>

                  {/* Collaborator */}
                  <button
                    onClick={() => setShowCollaboratorModal(true)}
                    className="flex items-center justify-between w-full p-3 sm:p-4 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">Collaborator</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {enableCollaborator ? `Collaborating with ${collaboratorEmail}` : "Share credit for your post"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </button>

                  {/* A/B tests */}
                  <button
                    onClick={() => setShowABTestModal(true)}
                    className="flex items-center justify-between w-full p-3 sm:p-4 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <TestTube className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm sm:text-base">A/B tests</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {enableABTest ? `Testing variant ${abTestVariant}` : "Test different versions"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Audience Selection Modal */}
      <Dialog open={showAudienceModal} onOpenChange={setShowAudienceModal}>
        <DialogContent className="max-w-md w-full p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-lg">Who can see your post?</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-3">
            {[
              { value: "public", icon: Globe, label: "Public", desc: "Anyone on or off Eloity" },
              { value: "friends", icon: Users, label: "Friends", desc: "Your friends on Eloity" },
              { value: "private", icon: Lock, label: "Only me", desc: "Only you can see this post" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setAudience(option.value as AudienceType);
                  setShowAudienceModal(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                  audience === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  audience === option.value ? "bg-blue-100" : "bg-gray-100"
                )}>
                  <option.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Schedule your post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Publication date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleDate ? format(scheduleDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setScheduleDate(undefined);
                  setShowScheduleModal(false);
                }}
              >
                Publish now
              </Button>
              <Button 
                className="flex-1"
                onClick={() => setShowScheduleModal(false)}
                disabled={!scheduleDate}
              >
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Monetization Modal */}
      <Dialog open={showMonetizationModal} onOpenChange={setShowMonetizationModal}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Monetize your content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-medium">Creator Economy</p>
                  <p className="text-sm text-gray-500">Earn from views and engagement</p>
                </div>
              </div>
              <Switch checked={enableMonetization} onCheckedChange={setEnableMonetization} />
            </div>
            {enableMonetization && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ Your post will earn rewards based on views, likes, and comments
                </p>
              </div>
            )}
            <Button 
              className="w-full"
              onClick={() => setShowMonetizationModal(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Boost Modal */}
      <Dialog open={showBoostModal} onOpenChange={setShowBoostModal}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Boost your post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium">Promote Post</p>
                  <p className="text-sm text-gray-500">Reach more people</p>
                </div>
              </div>
              <Switch checked={enableBoost} onCheckedChange={setEnableBoost} />
            </div>
            {enableBoost && (
              <div className="space-y-3">
                <div>
                  <Label>Budget (daily)</Label>
                  <Select defaultValue="10">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">$5/day</SelectItem>
                      <SelectItem value="10">$10/day</SelectItem>
                      <SelectItem value="25">$25/day</SelectItem>
                      <SelectItem value="50">$50/day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ✓ Your post will be shown to more people interested in your content
                  </p>
                </div>
              </div>
            )}
            <Button 
              className="w-full"
              onClick={() => setShowBoostModal(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collaborator Modal */}
      <Dialog open={showCollaboratorModal} onOpenChange={setShowCollaboratorModal}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Add collaborator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Collaborator email</Label>
              <Input
                placeholder="Enter email address"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Enable collaboration</p>
                <p className="text-sm text-gray-500">Share credit and analytics</p>
              </div>
              <Switch checked={enableCollaborator} onCheckedChange={setEnableCollaborator} />
            </div>
            {enableCollaborator && collaboratorEmail && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-700">
                  ✓ {collaboratorEmail} will be credited as collaborator
                </p>
              </div>
            )}
            <Button 
              className="w-full"
              onClick={() => setShowCollaboratorModal(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* A/B Test Modal */}
      <Dialog open={showABTestModal} onOpenChange={setShowABTestModal}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>A/B Test Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Enable A/B testing</p>
                <p className="text-sm text-gray-500">Test different versions</p>
              </div>
              <Switch checked={enableABTest} onCheckedChange={setEnableABTest} />
            </div>
            {enableABTest && (
              <div className="space-y-3">
                <div>
                  <Label>Test variant</Label>
                  <Select value={abTestVariant} onValueChange={setABTestVariant}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Variant A (Current)</SelectItem>
                      <SelectItem value="B">Variant B (Alternative)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700">
                    ✓ Testing {abTestVariant === 'A' ? 'original' : 'alternative'} version with 50% of audience
                  </p>
                </div>
              </div>
            )}
            <Button 
              className="w-full"
              onClick={() => setShowABTestModal(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag People Modal */}
      <TagPeopleModal
        isOpen={showTagPeopleModal}
        onClose={() => setShowTagPeopleModal(false)}
        onTagged={handleTaggedUsers}
        currentlyTagged={taggedUsers}
      />

      {/* Feeling/Activity Modal */}
      <FeelingActivityModal
        isOpen={showFeelingModal}
        onClose={() => setShowFeelingModal(false)}
        onSelect={handleFeelingActivity}
      />

      {/* Check In Modal */}
      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onCheckIn={handleCheckIn}
      />
    </>
  );
};

export default CreatePostFlow;
