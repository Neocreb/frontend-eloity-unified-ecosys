import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PostContentRendererProps {
  content: string;
  maxLines?: number; // Number of lines to show before truncating (approximately 3-4 lines is good)
  className?: string;
  onSeeMore?: () => void; // Called when user clicks "see more"
}

const PostContentRenderer: React.FC<PostContentRendererProps> = ({
  content,
  maxLines = 4,
  className,
  onSeeMore,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate if content needs truncation
  // Use line count or character count threshold
  const lines = content.split("\n");
  const shouldTruncate = lines.length > maxLines || content.length > 280;

  const displayContent =
    !isExpanded && shouldTruncate
      ? lines.slice(0, maxLines).join("\n")
      : content;

  const handleSeeMore = () => {
    if (onSeeMore) {
      // Navigate to full post page
      onSeeMore();
    } else {
      // Expand in place
      setIsExpanded(true);
    }
  };

  const hasMoreContent = !isExpanded && shouldTruncate;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="whitespace-pre-wrap break-words leading-relaxed text-sm md:text-base text-gray-900 dark:text-white">
        {displayContent}
        {hasMoreContent && "..."}
      </p>

      {hasMoreContent && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
          onClick={handleSeeMore}
        >
          See more
        </Button>
      )}
    </div>
  );
};

export default PostContentRenderer;
