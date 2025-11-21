import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  HeartOff,
  Download,
  Share,
  Flag,
  Send,
  Copy,
  Bookmark,
  BookmarkCheck,
  Forward,
  MoreVertical,
  X,
  ChevronLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { StickerData } from "@/types/sticker";

interface MemeData {
  id: string;
  url: string;
  name: string;
  type: "meme" | "gif" | "sticker" | "image";
  metadata?: any;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface UserCollections {
  memes: StickerData[];
  gifs: StickerData[];
  stickers: StickerData[];
}

export const ShareMeme: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [reportReason, setReportReason] = useState("");
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Get media data from URL parameters
  const mediaId = searchParams.get("id") || "";
  const mediaUrl = searchParams.get("url") || "";
  const mediaName = searchParams.get("name") || "Meme";
  const mediaType = (searchParams.get("type") || "meme") as "meme" | "gif" | "sticker" | "image";
  const senderName = searchParams.get("senderName") || "";
  const senderAvatar = searchParams.get("senderAvatar") || "";
  const senderId = searchParams.get("senderId") || "";

  // Mock user collections
  const userCollections: UserCollections = {
    memes: [],
    gifs: [],
    stickers: [],
  };

  const media: MemeData = {
    id: mediaId,
    url: mediaUrl,
    name: mediaName,
    type: mediaType,
    metadata: {},
    sender:
      senderName && senderId
        ? {
            id: senderId,
            name: senderName,
            avatar: senderAvatar,
          }
        : undefined,
  };

  const handleSaveToCollection = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from collection" : "Added to collection",
      description: isSaved
        ? `${media.name} has been removed from your collection`
        : `${media.name} has been saved to your collection`,
    });
  };

  const handleSendAsMessage = () => {
    toast({
      title: "Sent!",
      description: `${media.name} has been sent`,
    });
    setTimeout(() => navigate(-1), 1000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(media.url);
    toast({
      title: "Link copied",
      description: "Media link has been copied to clipboard",
    });
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = media.url;
    link.download = media.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Downloading",
      description: "Your media is being downloaded",
    });
  };

  const handleReport = (reason: string) => {
    toast({
      title: "Reported",
      description: "Thank you for helping keep our community safe",
    });
    setShowReportOptions(false);
    setTimeout(() => navigate(-1), 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: media.name,
        url: media.url,
      });
    } else {
      handleCopyLink();
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed like" : "Liked",
      description: isLiked ? "Like removed" : "You liked this meme",
    });
  };

  const reportOptions = [
    {
      id: "inappropriate",
      label: "Inappropriate content",
      description: "Contains offensive or harmful material",
    },
    { id: "spam", label: "Spam", description: "Repetitive or unwanted content" },
    {
      id: "copyright",
      label: "Copyright violation",
      description: "Uses copyrighted material without permission",
    },
    { id: "harassment", label: "Harassment", description: "Targets or bullies individuals" },
    {
      id: "misinformation",
      label: "Misinformation",
      description: "Contains false or misleading information",
    },
    { id: "other", label: "Other", description: "Something else that violates guidelines" },
  ];

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold capitalize flex items-center gap-2">
                {media.type}
                {media.type === "gif" && (
                  <Badge variant="secondary" className="text-xs">
                    GIF
                  </Badge>
                )}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {media.name}
              </p>
            </div>
          </div>
          {media.sender && media.sender.id !== user?.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowReportOptions(true)}>
                  <Flag className="h-4 w-4 mr-2 text-red-600" />
                  <span>Report content</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
        {!showReportOptions ? (
          <div className="w-full max-w-2xl space-y-6">
            {/* Media Preview */}
            <div className="flex justify-center">
              {media.type === "gif" || media.url.includes(".gif") ? (
                <img
                  src={media.url}
                  alt={media.name}
                  className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
                />
              ) : media.type === "meme" ||
                media.type === "image" ||
                media.type === "sticker" ? (
                <img
                  src={media.url}
                  alt={media.name}
                  className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
                />
              ) : (
                <div className="w-64 h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <span className="text-6xl">{media.metadata?.emoji || "📎"}</span>
                </div>
              )}
            </div>

            {/* Media info */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">{media.name}</h2>
              {media.sender && media.sender.id !== user?.id && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Shared by <span className="font-medium">{media.sender.name}</span>
                </p>
              )}
            </div>

            {/* Metadata */}
            {media.metadata &&
              (media.metadata.topText ||
                media.metadata.bottomText ||
                media.metadata.duration) && (
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {media.metadata.topText && (
                    <div className="text-sm">
                      <span className="font-medium">Top text:</span> {media.metadata.topText}
                    </div>
                  )}
                  {media.metadata.bottomText && (
                    <div className="text-sm">
                      <span className="font-medium">Bottom text:</span>{" "}
                      {media.metadata.bottomText}
                    </div>
                  )}
                  {media.metadata.duration && (
                    <div className="text-sm">
                      <span className="font-medium">Duration:</span>{" "}
                      {(media.metadata.duration / 1000).toFixed(1)}s
                    </div>
                  )}
                </div>
              )}

            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Button
                onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                className={cn(
                  "w-full flex items-center justify-center gap-2",
                  isLiked && "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                {isLiked ? (
                  <Heart className="w-4 h-4 fill-current" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Like</span>
              </Button>

              <Button
                onClick={handleSaveToCollection}
                variant={isSaved ? "default" : "outline"}
                className={cn(
                  "w-full flex items-center justify-center gap-2",
                  isSaved && "bg-amber-600 hover:bg-amber-700 text-white"
                )}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Save</span>
              </Button>

              <Button
                onClick={handleSendAsMessage}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Share className="w-4 h-4" />
                <span>Share</span>
              </Button>

              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </Button>
            </div>

            {/* Download button */}
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>

            {/* Status message */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
              {isSaved ? (
                <span className="text-green-600 dark:text-green-400">
                  ✓ Saved in your collection
                </span>
              ) : (
                <span>Save this meme for easy access later</span>
              )}
            </div>
          </div>
        ) : (
          /* Report Options */
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowReportOptions(false)}
                className="h-10 w-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="font-semibold">Report content</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Help us understand why you're reporting this
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {reportOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  onClick={() => handleReport(option.id)}
                  className="w-full justify-start h-auto p-4 text-left hover:bg-red-50 dark:hover:bg-red-900/20 border-gray-200 dark:border-gray-700"
                >
                  <div className="w-full">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowReportOptions(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareMeme;
