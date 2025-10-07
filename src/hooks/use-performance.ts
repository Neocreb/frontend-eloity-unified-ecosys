// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";

// Debounce hook for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for scroll events and frequent updates
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current),
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit,
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        ...options,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// Lazy loading hook for images and content
export function useLazyLoad() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const { hasIntersected } = useIntersectionObserver(elementRef);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return {
    elementRef,
    shouldLoad: hasIntersected,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
  };
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    navigationStart: 0,
    domContentLoaded: 0,
    loadComplete: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
  });

  useEffect(() => {
    // Navigation timing
    const navigationTiming = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;

    if (navigationTiming) {
      setMetrics((prev) => ({
        ...prev,
        navigationStart: navigationTiming.navigationStart,
        domContentLoaded:
          navigationTiming.domContentLoadedEventEnd -
          navigationTiming.navigationStart,
        loadComplete:
          navigationTiming.loadEventEnd - navigationTiming.navigationStart,
      }));
    }

    // Paint timing
    const paintEntries = performance.getEntriesByType("paint");
    paintEntries.forEach((entry) => {
      if (entry.name === "first-contentful-paint") {
        setMetrics((prev) => ({
          ...prev,
          firstContentfulPaint: entry.startTime,
        }));
      }
    });

    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setMetrics((prev) => ({
        ...prev,
        largestContentfulPaint: lastEntry.startTime,
      }));
    });

    try {
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (error) {
      console.warn("LCP observer not supported");
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return metrics;
}

// Virtual scrolling hook for large lists
export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

// Image optimization hook
export function useImageOptimization() {
  const [supportsWebP, setSupportsWebP] = useState(false);
  const [supportsAVIF, setSupportsAVIF] = useState(false);

  useEffect(() => {
    // Check WebP support
    const webpImage = new Image();
    webpImage.onload = () => setSupportsWebP(true);
    webpImage.onerror = () => setSupportsWebP(false);
    webpImage.src =
      "data:image/webp;base64,UklGRhIAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAAAAABWUDhGAAAAAgAAAA==";

    // Check AVIF support
    const avifImage = new Image();
    avifImage.onload = () => setSupportsAVIF(true);
    avifImage.onerror = () => setSupportsAVIF(false);
    avifImage.src =
      "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABUAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=";
  }, []);

  const getOptimizedImageUrl = useCallback(
    (baseUrl: string, width?: number, height?: number) => {
      const url = new URL(baseUrl);

      // Add responsive parameters if supported by the image service
      if (width) url.searchParams.set("w", width.toString());
      if (height) url.searchParams.set("h", height.toString());

      // Add format optimization
      if (supportsAVIF) {
        url.searchParams.set("f", "avif");
      } else if (supportsWebP) {
        url.searchParams.set("f", "webp");
      }

      return url.toString();
    },
    [supportsWebP, supportsAVIF],
  );

  return {
    supportsWebP,
    supportsAVIF,
    getOptimizedImageUrl,
  };
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      try {
        if ("memory" in performance) {
          const memory = (performance as any).memory;
          setMemoryInfo({
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          });
        }
      } catch (error) {
        // Silently handle errors during component unmount
        console.warn("Memory info update failed:", error);
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  return memoryInfo;
}

// Connection quality hook
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    effectiveType: "4g",
    downlink: 10,
    rtt: 50,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus((prev) => ({
        ...prev,
        online: navigator.onLine,
      }));
    };

    const updateConnectionInfo = () => {
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        setNetworkStatus((prev) => ({
          ...prev,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        }));
      }
    };

    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    if ("connection" in navigator) {
      (navigator as any).connection.addEventListener(
        "change",
        updateConnectionInfo,
      );
      updateConnectionInfo();
    }

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);

      if ("connection" in navigator) {
        (navigator as any).connection.removeEventListener(
          "change",
          updateConnectionInfo,
        );
      }
    };
  }, []);

  return networkStatus;
}
