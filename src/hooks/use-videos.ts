import { useState, useCallback } from "react";
import { ContentItem, VideoItem, AdItem } from "@/types/video";
import { mockVideos, mockAdData } from "@/data/mockVideosData";

export const useVideos = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Combine videos and ads into a single content feed
  const allItems: ContentItem[] = [
    ...mockVideos.slice(0, 2),
    { isAd: true, ad: mockAdData } as AdItem,
    ...mockVideos.slice(2)
  ];

  const handleNextVideo = useCallback(() => {
    setCurrentIndex((prev) =>
      prev < allItems.length - 1 ? prev + 1 : 0
    );
  }, [allItems.length]);

  const handlePrevVideo = useCallback(() => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : allItems.length - 1
    );
  }, [allItems.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = useCallback(() => {
    if (touchStart - touchEnd > 50) {
      // Swipe up
      handleNextVideo();
    } else if (touchEnd - touchStart > 50) {
      // Swipe down
      handlePrevVideo();
    }
  }, [touchStart, touchEnd, handleNextVideo, handlePrevVideo]);

  const getCurrentItem = (): ContentItem | null => {
    if (allItems.length === 0) return null;
    return allItems[currentIndex % allItems.length];
  };

  return {
    currentItem: getCurrentItem(),
    handleNextVideo,
    handlePrevVideo,
    allItems,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    currentIndex,
  };
};