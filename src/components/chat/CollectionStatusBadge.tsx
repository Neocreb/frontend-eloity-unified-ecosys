import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bookmark, 
  BookmarkCheck, 
  Image, 
  Zap, 
  Camera,
  Crown 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserCollections } from "@/contexts/UserCollectionsContext";

interface CollectionStatusBadgeProps {
  className?: string;
  compact?: boolean;
}

export const CollectionStatusBadge: React.FC<CollectionStatusBadgeProps> = ({
  className,
  compact = false,
}) => {
  const { collections } = useUserCollections();

  const totalItems = collections.memes.length + collections.gifs.length + collections.stickers.length;

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!compact && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <BookmarkCheck className="w-3 h-3" />
          <span>Your Collection:</span>
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {collections.memes.length > 0 && (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {collections.memes.length} meme{collections.memes.length !== 1 ? 's' : ''}
          </Badge>
        )}
        
        {collections.gifs.length > 0 && (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {collections.gifs.length} GIF{collections.gifs.length !== 1 ? 's' : ''}
          </Badge>
        )}
        
        {collections.stickers.length > 0 && (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Image className="w-3 h-3" />
            {collections.stickers.length} sticker{collections.stickers.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {!compact && (
        <Badge variant="outline" className="text-xs">
          {totalItems} total
        </Badge>
      )}
    </div>
  );
};

export default CollectionStatusBadge;
