import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { StickerData } from "@/types/sticker";

interface MemeGifActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: {
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
  };
  userCollections: {
    memes: StickerData[];
    gifs: StickerData[];
    stickers: StickerData[];
  };
  onSaveToCollection: (mediaId: string, collection: "memes" | "gifs" | "stickers") => void;
  onRemoveFromCollection: (mediaId: string, collection: "memes" | "gifs" | "stickers") => void;
  onSendMessage: (content: string, type: "sticker" | "media", metadata?: any) => void;
  onReport: (mediaId: string, reason: string) => void;
  onForward?: (mediaId: string) => void;
  currentUserId: string;
  isMobile?: boolean;
}

export const MemeGifActionDialog: React.FC<MemeGifActionDialogProps> = ({
  open,
  onOpenChange,
  media,
  userCollections,
  onSaveToCollection,
  onRemoveFromCollection,
  onSendMessage,
  onReport,
  onForward,
  currentUserId,
  isMobile = false,
}) => {
  const { toast } = useToast();
  const [reportReason, setReportReason] = useState("");
  const [showReportOptions, setShowReportOptions] = useState(false);

  // Check if media is already in user's collection
  const getCollectionStatus = () => {
    const collectionKey = media.type === "meme" ? "memes" : 
                          media.type === "gif" ? "gifs" : "stickers";
    
    const isInCollection = userCollections[collectionKey]?.some(item => 
      item.id === media.id || item.fileUrl === media.url
    );
    
    return { collectionKey, isInCollection };
  };

  const { collectionKey, isInCollection } = getCollectionStatus();

  const handleSaveToCollection = () => {
    if (isInCollection) {
      onRemoveFromCollection(media.id, collectionKey as "memes" | "gifs" | "stickers");
      toast({
        title: "Removed from collection",
        description: `${media.name} has been removed from your ${collectionKey}`,
      });
    } else {
      onSaveToCollection(media.id, collectionKey as "memes" | "gifs" | "stickers");
      toast({
        title: "Added to collection",
        description: `${media.name} has been saved to your ${collectionKey}`,
      });
    }
  };

  const handleSendAsMessage = () => {
    onSendMessage(media.url, media.type === "meme" || media.type === "gif" ? "sticker" : "media", {
      stickerName: media.name,
      stickerUrl: media.url,
      stickerType: media.type,
      animated: media.type === "gif",
      ...media.metadata,
    });
    
    toast({
      title: "Sent!",
      description: `${media.name} has been sent`,
    });
    
    onOpenChange(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(media.url);
    toast({
      title: "Link copied",
      description: "Media link has been copied to clipboard",
    });
  };

  const handleReport = (reason: string) => {
    onReport(media.id, reason);
    toast({
      title: "Reported",
      description: "Thank you for helping keep our community safe",
    });
    setShowReportOptions(false);
    onOpenChange(false);
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

  const reportOptions = [
    { id: "inappropriate", label: "Inappropriate content", description: "Contains offensive or harmful material" },
    { id: "spam", label: "Spam", description: "Repetitive or unwanted content" },
    { id: "copyright", label: "Copyright violation", description: "Uses copyrighted material without permission" },
    { id: "harassment", label: "Harassment", description: "Targets or bullies individuals" },
    { id: "misinformation", label: "Misinformation", description: "Contains false or misleading information" },
    { id: "other", label: "Other", description: "Something else that violates community guidelines" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-md",
        isMobile && "w-[95vw] max-h-[90vh] overflow-y-auto"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="capitalize">{media.type}</span>
            {media.type === "gif" && (
              <Badge variant="secondary" className="text-xs">
                GIF
              </Badge>
            )}
            {media.metadata?.animated && (
              <Badge variant="secondary" className="text-xs">
                Animated
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {media.name}
            {media.sender && media.sender.id !== currentUserId && (
              <span className="block text-sm mt-1">
                Sent by {media.sender.name}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Media Preview */}
        <div className="flex justify-center py-4">
          {media.type === "gif" || media.url.includes('.gif') ? (
            <img
              src={media.url}
              alt={media.name}
              className="max-w-full max-h-48 object-contain rounded-lg border"
            />
          ) : media.type === "meme" || media.type === "image" || media.type === "sticker" ? (
            <img
              src={media.url}
              alt={media.name}
              className="max-w-full max-h-48 object-contain rounded-lg border"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-4xl">{media.metadata?.emoji || "📎"}</span>
            </div>
          )}
        </div>

        {/* Metadata */}
        {media.metadata && (
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {media.metadata.topText && (
              <div className="text-sm">
                <span className="font-medium">Top text:</span> {media.metadata.topText}
              </div>
            )}
            {media.metadata.bottomText && (
              <div className="text-sm">
                <span className="font-medium">Bottom text:</span> {media.metadata.bottomText}
              </div>
            )}
            {media.metadata.duration && (
              <div className="text-sm">
                <span className="font-medium">Duration:</span> {(media.metadata.duration / 1000).toFixed(1)}s
              </div>
            )}
            {media.metadata.capturedAt && (
              <div className="text-sm">
                <span className="font-medium">Created:</span> {new Date(media.metadata.capturedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {!showReportOptions ? (
          <div className="space-y-3">
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleSaveToCollection}
                variant={isInCollection ? "destructive" : "default"}
                className="w-full"
              >
                {isInCollection ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 mr-2" />
                    Remove
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleSendAsMessage}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>

            {/* More Actions */}
            <div className="flex gap-2">
              {onForward && (
                <Button
                  onClick={() => onForward(media.id)}
                  variant="outline"
                  className="flex-1"
                >
                  <Forward className="w-4 h-4 mr-2" />
                  Forward
                </Button>
              )}
              
              {/* Report button - only show if not own content */}
              {media.sender && media.sender.id !== currentUserId && (
                <Button
                  onClick={() => setShowReportOptions(true)}
                  variant="outline"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </Button>
              )}
            </div>

            {/* Collection Info */}
            <div className="text-center text-sm text-muted-foreground pt-2 border-t">
              {isInCollection ? (
                <span className="text-green-600 dark:text-green-400">
                  ✓ Saved in your {collectionKey}
                </span>
              ) : (
                <span>
                  Not in your collection yet
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Report Options */
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowReportOptions(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <h4 className="font-medium">Report this content</h4>
            </div>
            
            <div className="space-y-2">
              {reportOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  onClick={() => handleReport(option.id)}
                  className="w-full justify-start h-auto p-3 text-left"
                >
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MemeGifActionDialog;
