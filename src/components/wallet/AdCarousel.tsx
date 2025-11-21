import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundColor?: string;
  textColor?: string;
  ctaText?: string;
  ctaUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

interface AdCarouselProps {
  ads?: Ad[];
  autoScroll?: boolean;
  scrollInterval?: number;
  onAdClick?: (ad: Ad) => void;
}

const DEFAULT_ADS: Ad[] = [
  {
    id: "1",
    title: "Premium Features",
    description: "Unlock advanced wallet features",
    imageUrl: "https://images.unsplash.com/photo-1579621970563-430f63602022?w=800&h=200&fit=crop",
    backgroundColor: "#FF6B6B",
    textColor: "#FFFFFF",
    ctaText: "Learn More",
    ctaUrl: "/app/premium",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Save More",
    description: "Get cashback on every transaction",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=200&fit=crop",
    backgroundColor: "#4ECDC4",
    textColor: "#FFFFFF",
    ctaText: "Explore",
    ctaUrl: "/app/rewards",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Invest Smartly",
    description: "Start your investment journey today",
    imageUrl: "https://images.unsplash.com/photo-1526628653514-7524971f64b8?w=800&h=200&fit=crop",
    backgroundColor: "#95E1D3",
    textColor: "#1A1A1A",
    ctaText: "Start Now",
    ctaUrl: "/app/crypto",
    isActive: true,
    createdAt: new Date(),
  },
];

const AdCarousel = ({
  ads = DEFAULT_ADS,
  autoScroll = true,
  scrollInterval = 5000,
  onAdClick,
}: AdCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleAds, setVisibleAds] = useState<Ad[]>([]);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter active ads
  useEffect(() => {
    const activeAds = ads.filter((ad) => ad.isActive);
    setVisibleAds(activeAds.length > 0 ? activeAds : DEFAULT_ADS);
  }, [ads]);

  // Auto scroll effect
  useEffect(() => {
    if (!autoScroll || visibleAds.length === 0) return;

    const startAutoScroll = () => {
      autoScrollTimer.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % visibleAds.length);
      }, scrollInterval);
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [autoScroll, scrollInterval, visibleAds.length]);

  const handlePrev = () => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    setCurrentIndex((prev) => (prev - 1 + visibleAds.length) % visibleAds.length);
  };

  const handleNext = () => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    setCurrentIndex((prev) => (prev + 1) % visibleAds.length);
  };

  const handleAdClick = (ad: Ad) => {
    if (onAdClick) {
      onAdClick(ad);
    } else if (ad.ctaUrl) {
      window.location.href = ad.ctaUrl;
    }
  };

  if (visibleAds.length === 0) {
    return null;
  }

  const currentAd = visibleAds[currentIndex];

  return (
    <div ref={containerRef} className="relative w-full h-32 md:h-40 rounded-2xl overflow-hidden group">
      {/* Ad Carousel Container */}
      <div className="relative w-full h-full">
        {/* Ad Slide */}
        <div
          className="w-full h-full transition-all duration-500 ease-out"
          style={{
            backgroundColor: currentAd.backgroundColor || "#8B5CF6",
          }}
        >
          {/* Background Image */}
          {currentAd.imageUrl && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url(${currentAd.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}

          {/* Content */}
          <div className="relative z-10 h-full p-4 md:p-6 flex flex-col justify-between text-left">
            <div className="space-y-1">
              <h3
                className="text-sm md:text-base font-bold truncate"
                style={{ color: currentAd.textColor || "#FFFFFF" }}
              >
                {currentAd.title}
              </h3>
              <p
                className="text-xs md:text-sm truncate opacity-90"
                style={{ color: currentAd.textColor || "#FFFFFF" }}
              >
                {currentAd.description}
              </p>
            </div>

            {currentAd.ctaText && (
              <button
                onClick={() => handleAdClick(currentAd)}
                className="self-start px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs md:text-sm font-semibold hover:bg-white/30 transition-all"
                style={{ color: currentAd.textColor || "#FFFFFF" }}
              >
                {currentAd.ctaText}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        {visibleAds.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous ad"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next ad"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {visibleAds.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {visibleAds.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 w-2 hover:bg-white/70"
                }`}
                aria-label={`Go to ad ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdCarousel;
