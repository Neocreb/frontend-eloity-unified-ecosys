// @ts-nocheck
// @ts-nocheck
// Mobile Performance Optimization Utilities

// Intersection Observer for lazy loading
export class LazyLoadManager {
  private observer: IntersectionObserver | null = null;
  private elements: Map<Element, () => void> = new Map();

  constructor() {
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const callback = this.elements.get(entry.target);
              if (callback) {
                callback();
                this.unobserve(entry.target);
              }
            }
          });
        },
        {
          rootMargin: "50px",
          threshold: 0.1,
        },
      );
    }
  }

  observe(element: Element, callback: () => void): void {
    if (this.observer) {
      this.elements.set(element, callback);
      this.observer.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      callback();
    }
  }

  unobserve(element: Element): void {
    if (this.observer) {
      this.observer.unobserve(element);
      this.elements.delete(element);
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.elements.clear();
    }
  }
}

// Image optimization for mobile
export const optimizeImageForMobile = (
  src: string,
  width: number,
  quality: number = 80,
): string => {
  // In a real app, this would integrate with a CDN like Cloudinary or ImageKit
  const params = new URLSearchParams({
    w: width.toString(),
    q: quality.toString(),
    f: "webp",
    fit: "cover",
  });

  // Check if the image is already optimized
  if (src.includes("?")) {
    return `${src}&${params.toString()}`;
  }

  return `${src}?${params.toString()}`;
};

// Device detection utilities
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

export const isIOS = (): boolean => {
  if (typeof window === "undefined") return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  if (typeof window === "undefined") return false;

  return /Android/.test(navigator.userAgent);
};

// Viewport utilities
export const getViewportSize = () => {
  if (typeof window === "undefined") return { width: 0, height: 0 };

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const isLandscape = (): boolean => {
  const { width, height } = getViewportSize();
  return width > height;
};

// Touch utilities
export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

// Network optimization
export class NetworkOptimizer {
  private connectionType: string = "unknown";
  private effectiveType: string = "unknown";

  constructor() {
    this.detectConnection();
  }

  private detectConnection(): void {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const connection = (navigator as any).connection;
      this.connectionType = connection.type || "unknown";
      this.effectiveType = connection.effectiveType || "unknown";
    }
  }

  isSlowConnection(): boolean {
    return this.effectiveType === "slow-2g" || this.effectiveType === "2g";
  }

  isFastConnection(): boolean {
    return this.effectiveType === "4g" || this.connectionType === "wifi";
  }

  getOptimalImageQuality(): number {
    if (this.isSlowConnection()) return 60;
    if (this.effectiveType === "3g") return 75;
    return 90;
  }

  shouldPreloadImages(): boolean {
    return this.isFastConnection();
  }

  getOptimalVideoQuality(): string {
    if (this.isSlowConnection()) return "480p";
    if (this.effectiveType === "3g") return "720p";
    return "1080p";
  }
}

// Memory optimization
export class MemoryManager {
  private cache: Map<string, any> = new Map();
  private maxCacheSize: number = 50;

  set(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getMemoryInfo(): any {
    if (
      typeof window !== "undefined" &&
      "performance" in window &&
      "memory" in (window.performance as any)
    ) {
      return (window.performance as any).memory;
    }
    return null;
  }

  isLowMemory(): boolean {
    const memInfo = this.getMemoryInfo();
    if (memInfo) {
      const usedRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
      return usedRatio > 0.8; // 80% memory usage
    }
    return false;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startTiming(name: string): void {
    this.metrics.set(`${name}_start`, performance.now());
  }

  endTiming(name: string): number {
    const startTime = this.metrics.get(`${name}_start`);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.set(name, duration);
      return duration;
    }
    return 0;
  }

  getMetric(name: string): number {
    return this.metrics.get(name) || 0;
  }

  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      if (!key.endsWith("_start")) {
        result[key] = value;
      }
    });
    return result;
  }

  measureRender(name: string, fn: () => void): number {
    this.startTiming(name);
    fn();
    return this.endTiming(name);
  }

  getNavigationTiming(): any {
    if (typeof window !== "undefined" && "performance" in window) {
      return window.performance.getEntriesByType("navigation")[0];
    }
    return null;
  }

  getFCP(): number {
    if (typeof window !== "undefined" && "performance" in window) {
      const entries = window.performance.getEntriesByType("paint");
      const fcpEntry = entries.find(
        (entry) => entry.name === "first-contentful-paint",
      );
      return fcpEntry ? fcpEntry.startTime : 0;
    }
    return 0;
  }

  getLCP(): Promise<number> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
        resolve(0);
        return;
      }

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });

      // Fallback timeout
      setTimeout(() => resolve(0), 5000);
    });
  }
}

// Gesture handling for mobile
export class GestureHandler {
  private element: Element;
  private startX: number = 0;
  private startY: number = 0;
  private threshold: number = 50;

  constructor(element: Element, threshold: number = 50) {
    this.element = element;
    this.threshold = threshold;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.element.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: true },
    );
    this.element.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      { passive: true },
    );
    this.element.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: true,
    });
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
  }

  private handleTouchMove(e: TouchEvent): void {
    // Prevent scroll if needed
    if (Math.abs(e.touches[0].clientX - this.startX) > this.threshold) {
      e.preventDefault();
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;

    if (Math.abs(deltaX) > this.threshold) {
      if (deltaX > 0) {
        this.onSwipeRight();
      } else {
        this.onSwipeLeft();
      }
    }

    if (Math.abs(deltaY) > this.threshold) {
      if (deltaY > 0) {
        this.onSwipeDown();
      } else {
        this.onSwipeUp();
      }
    }
  }

  onSwipeLeft(): void {
    // Override in subclass
  }

  onSwipeRight(): void {
    // Override in subclass
  }

  onSwipeUp(): void {
    // Override in subclass
  }

  onSwipeDown(): void {
    // Override in subclass
  }

  destroy(): void {
    this.element.removeEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
    );
    this.element.removeEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
    );
    this.element.removeEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
    );
  }
}

// Virtual scrolling for large lists
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private items: any[];
  private renderItem: (item: any, index: number) => HTMLElement;
  private scrollTop: number = 0;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    items: any[],
    renderItem: (item: any, index: number) => HTMLElement,
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.items = items;
    this.renderItem = renderItem;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2; // Buffer
    this.init();
  }

  private init(): void {
    this.container.style.overflowY = "auto";
    this.container.addEventListener("scroll", this.handleScroll.bind(this), {
      passive: true,
    });
    this.render();
  }

  private handleScroll(): void {
    this.scrollTop = this.container.scrollTop;
    this.render();
  }

  private render(): void {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleCount,
      this.items.length,
    );

    // Clear container
    this.container.innerHTML = "";

    // Create spacer for items above
    if (startIndex > 0) {
      const topSpacer = document.createElement("div");
      topSpacer.style.height = `${startIndex * this.itemHeight}px`;
      this.container.appendChild(topSpacer);
    }

    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.renderItem(this.items[i], i);
      item.style.height = `${this.itemHeight}px`;
      this.container.appendChild(item);
    }

    // Create spacer for items below
    if (endIndex < this.items.length) {
      const bottomSpacer = document.createElement("div");
      bottomSpacer.style.height = `${(this.items.length - endIndex) * this.itemHeight}px`;
      this.container.appendChild(bottomSpacer);
    }
  }

  updateItems(newItems: any[]): void {
    this.items = newItems;
    this.render();
  }

  destroy(): void {
    this.container.removeEventListener("scroll", this.handleScroll.bind(this));
  }
}

// Singleton instances
export const lazyLoadManager = new LazyLoadManager();
export const networkOptimizer = new NetworkOptimizer();
export const memoryManager = new MemoryManager();
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for React components
export const useImageOptimization = (src: string): string => {
  const viewportWidth = getViewportSize().width;
  const quality = networkOptimizer.getOptimalImageQuality();

  // Responsive image sizing
  let width = viewportWidth;
  if (viewportWidth > 768) {
    width = Math.min(800, viewportWidth * 0.8);
  } else {
    width = viewportWidth;
  }

  return optimizeImageForMobile(src, width, quality);
};

export const shouldReduceAnimations = (): boolean => {
  // Check user preference
  if (typeof window !== "undefined" && window.matchMedia) {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReducedMotion.matches) return true;
  }

  // Check device performance
  return networkOptimizer.isSlowConnection() || memoryManager.isLowMemory();
};

export const getOptimalChunkSize = (): number => {
  if (networkOptimizer.isSlowConnection()) return 10;
  if (memoryManager.isLowMemory()) return 15;
  return 25;
};

// PWA utilities
export const installPWA = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  const deferredPrompt = (window as any).deferredPrompt;
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    (window as any).deferredPrompt = null;
    return outcome === "accepted";
  }
  return false;
};

export const canInstallPWA = (): boolean => {
  return typeof window !== "undefined" && !!(window as any).deferredPrompt;
};
