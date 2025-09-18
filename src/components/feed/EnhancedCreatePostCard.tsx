import { useState, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Image, 
  Link, 
  Smile, 
  X, 
  Camera, 
  MapPin, 
  Heart,
  Film,
  Mic
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFeed } from "@/contexts/FeedContext";
import { supabase } from '@/integrations/supabase/client';

// Available feelings
const feelings = [
  { id: "happy", emoji: "😊", label: "happy" },
  { id: "excited", emoji: "🤩", label: "excited" },
  { id: "grateful", emoji: "🙏", label: "grateful" },
  { id: "blessed", emoji: "✨", label: "blessed" },
  { id: "love", emoji: "❤️", label: "in love" },
  { id: "sad", emoji: "😢", label: "sad" },
  { id: "angry", emoji: "😠", label: "angry" },
  { id: "tired", emoji: "😴", label: "tired" },
  { id: "motivated", emoji: "💪", label: "motivated" },
  { id: "peaceful", emoji: "😌", label: "peaceful" },
  { id: "confused", emoji: "🤔", label: "confused" },
  { id: "proud", emoji: "🥳", label: "proud" },
];

// Common emojis
const commonEmojis = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
  "🙂", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "🤗",
  "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥",
  "😮", "🤐", "😯", "😪", "😫", "🥱", "😴", "😌", "😛", "😜",
  "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹️", "🙁",
  "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩",
  "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "🥴",
  "😠", "😡", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇",
  "🥳", "🥺", "🤠", "🤡", "🤥", "🤫", "🤭", "🧐", "🤓", "😈",
  "👿", "👹", "👺", "💀", "☠️", "👻", "👽", "👾", "🤖", "🎃",
  "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "❤️",
  "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💔", "❣️",
  "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️",
  "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐", "⛎",
  "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓",
  "🔮", "🧿", "💫", "⭐", "🌟", "✨", "⚡", "☄️", "💥", "🔥",
  "🌈", "☀️", "🌤️", "⛅", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "❄️",
  "��️", "⛄", "🌬️", "💨", "💧", "💦", "☔", "☂️", "🌊", "🌍",
  "🌎", "🌏", "🌐", "🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗",
  "🌘", "🌙", "🌚", "🌛", "🌜", "🌝", "🌞", "⭐", "🌟", "💫",
];

interface EnhancedCreatePostCardProps {
  onPostCreated?: (post: any) => void;
}

const EnhancedCreatePostCard: React.FC<EnhancedCreatePostCardProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<any>(null);
  const [location, setLocation] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addPost } = useFeed();

  const handlePost = () => {
    if (!content.trim() && !previewImage && !linkUrl) {
      toast({
        title: "Post cannot be empty",
        description: "Please add some content, an image, or a link.",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);

    // Create new post object
    const newPost = {
      id: `post-${Date.now()}`,
      type: "post",
      timestamp: new Date(),
      priority: 8,
      author: {
        id: user?.id || "current-user",
        name: user?.name || "You",
        username: user?.username || "user",
        avatar: user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
        verified: user?.verified || false,
        badges: user?.badges || [],
      },
      content: {
        text: content,
        media: previewImage ? [{
          type: "image",
          url: previewImage,
          alt: "User uploaded image",
        }] : [],
        location: location || undefined,
        feeling: selectedFeeling ? `feeling ${selectedFeeling.label} ${selectedFeeling.emoji}` : undefined,
        link: linkUrl || undefined,
      },
      interactions: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
      },
      userInteracted: {
        liked: false,
        commented: false,
        shared: false,
        saved: false,
      },
    };

    // Simulate post creation
    setTimeout(() => {
      setIsPosting(false);

      // Add post to feed context
      addPost(newPost);

      // Reset form
      setContent("");
      setPreviewImage(null);
      setSelectedFeeling(null);
      setLocation("");
      setLinkUrl("");
      setShowLinkInput(false);

      // Notify parent component
      if (onPostCreated) {
        onPostCreated(newPost);
      }

      toast({
        title: "Post created!",
        description: "Your post has been published to the feed.",
      });
    }, 1000);
  };

  const handleFileUpload = (type: 'image' | 'video' | 'audio') => {
    if (type === 'image') {
      fileInputRef.current?.click();
    } else if (type === 'video') {
      videoInputRef.current?.click();
    } else if (type === 'audio') {
      audioInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removePreviewImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addEmoji = (emoji: string) => {
    const cursorPosition = content.length;
    const newContent = content.slice(0, cursorPosition) + emoji + content.slice(cursorPosition);
    setContent(newContent);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      setShowLinkInput(false);
      toast({
        title: "Link added!",
        description: "Your link has been attached to the post.",
      });
    }
  };

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="pt-4">
        <div className="flex space-x-3">
          <Avatar>
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "@user"} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'friend'}?`}
              className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-transparent p-2 h-20"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Selected feeling and location display */}
            {(selectedFeeling || location) && (
              <div className="flex items-center gap-2 mt-2 mb-3">
                {selectedFeeling && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    feeling {selectedFeeling.label} {selectedFeeling.emoji}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setSelectedFeeling(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setLocation("")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}

            {/* Link URL display */}
            {linkUrl && (
              <div className="mt-2 mb-3">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Link className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 truncate flex-1">{linkUrl}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setLinkUrl("")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Link input */}
            {showLinkInput && (
              <div className="mt-2 mb-3 flex gap-2">
                <Input
                  placeholder="Enter URL..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleLinkSubmit}>
                  Add
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowLinkInput(false)}
                >
                  Cancel
                </Button>
              </div>
            )}

            {previewImage && (
              <div className="relative mt-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full h-6 w-6 p-1 z-10"
                  onClick={removePreviewImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="rounded-md max-h-48 w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <input
            type="file"
            ref={videoInputRef}
            className="hidden"
            accept="video/*"
          />
          <input
            type="file"
            ref={audioInputRef}
            className="hidden"
            accept="audio/*"
          />

          {/* Media buttons */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground flex-shrink-0"
            onClick={() => handleFileUpload('image')}
            disabled={isUploading}
          >
            {isUploading ? (
              <>Loading...</>
            ) : (
              <>
                <Image className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Photo</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground flex-shrink-0"
            onClick={() => handleFileUpload('video')}
          >
            <Film className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Video</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground flex-shrink-0"
            onClick={() => handleFileUpload('audio')}
          >
            <Mic className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Audio</span>
          </Button>

          {/* Link button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground flex-shrink-0"
            onClick={() => setShowLinkInput(!showLinkInput)}
          >
            <Link className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Link</span>
          </Button>

          {/* Emoji picker */}
          <Dialog open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground flex-shrink-0">
                <Smile className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Emoji</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Choose an emoji</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-10 gap-2 max-h-64 overflow-y-auto">
                {commonEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                    onClick={() => {
                      addEmoji(emoji);
                      setShowEmojiPicker(false);
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Feeling picker */}
          <Dialog open={showFeelingPicker} onOpenChange={setShowFeelingPicker}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground flex-shrink-0">
                <Heart className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Feeling</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>How are you feeling?</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {feelings.map((feeling) => (
                  <Button
                    key={feeling.id}
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => {
                      setSelectedFeeling(feeling);
                      setShowFeelingPicker(false);
                    }}
                  >
                    <span className="text-lg mr-2">{feeling.emoji}</span>
                    <span className="text-sm">{feeling.label}</span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Location input */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground flex-shrink-0">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Location</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Where are you?"
                  value={location}
                  onChange={handleLocationChange}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setLocation("")}>
                    Cancel
                  </Button>
                  <Button onClick={() => setLocation(location)}>
                    Add Location
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={handlePost}
          disabled={isPosting || (!content.trim() && !previewImage && !linkUrl)}
          className="self-center sm:self-auto flex-shrink-0"
        >
          {isPosting ? "Posting..." : "Post"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnhancedCreatePostCard;
