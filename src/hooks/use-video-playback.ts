// @ts-nocheck
import { useRef, useCallback } from "react";

export const useVideoPlayback = () => {
  const playbackPromiseRef = useRef<Promise<void> | null>(null);

  const safePlay = useCallback(
    async (videoElement: HTMLVideoElement): Promise<void> => {
      if (!videoElement) return;

      try {
        // Wait for any pending playback operation to complete
        if (playbackPromiseRef.current) {
          await playbackPromiseRef.current;
        }

        // Check if video is already playing
        if (!videoElement.paused && !videoElement.ended) {
          return;
        }

        // Start new playback operation
        playbackPromiseRef.current = videoElement.play();
        await playbackPromiseRef.current;
        playbackPromiseRef.current = null;
      } catch (error) {
        playbackPromiseRef.current = null;

        // Only log non-abort errors
        if (error.name !== "AbortError" && error.name !== "NotAllowedError") {
          console.error("Video play error:", error);
        }

        throw error;
      }
    },
    [],
  );

  const safePause = useCallback((videoElement: HTMLVideoElement): void => {
    if (!videoElement) return;

    try {
      // Cancel any pending play operation
      if (playbackPromiseRef.current) {
        playbackPromiseRef.current = null;
      }

      // Only pause if video is playing
      if (!videoElement.paused) {
        videoElement.pause();
      }
    } catch (error) {
      console.error("Video pause error:", error);
    }
  }, []);

  const togglePlayback = useCallback(
    async (
      videoElement: HTMLVideoElement,
      currentState: boolean,
      setState: (playing: boolean) => void,
    ): Promise<void> => {
      if (!videoElement) return;

      try {
        if (currentState) {
          safePause(videoElement);
          setState(false);
        } else {
          await safePlay(videoElement);
          setState(true);
        }
      } catch (error) {
        // Handle play errors by not updating state
        if (error.name === "NotAllowedError") {
          console.warn("Video play blocked by browser policy");
        }
      }
    },
    [safePlay, safePause],
  );

  return {
    safePlay,
    safePause,
    togglePlayback,
  };
};
