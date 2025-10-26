import React, { useState, useEffect } from "react";
import { Clock, Zap, Star, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MarketplaceService } from "@/services/marketplaceService";

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  discount: string;
  endDate: Date;
  bgColor: string;
  textColor: string;
  image?: string;
  ctaText: string;
  ctaLink: string;
  type: "flash" | "seasonal" | "special";
  // Progress tracking for flash sales
  progress?: number;
}

interface CountdownProps {
  endDate: Date;
  onExpire?: () => void;
}

interface CampaignBannersProps {
  campaigns?: Campaign[];
  showCountdown?: boolean;
  dismissible?: boolean;
  className?: string;
}

const Countdown: React.FC<CountdownProps> = ({ endDate, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = endDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
      <Clock className="w-4 h-4 opacity-90 flex-shrink-0" />
      <div className="flex items-center gap-1 text-sm font-mono flex-wrap">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs whitespace-nowrap">
              {formatTime(timeLeft.days)}d
            </span>
            <span className="opacity-60">:</span>
          </>
        )}
        <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs whitespace-nowrap">
          {formatTime(timeLeft.hours)}h
        </span>
        <span className="opacity-60">:</span>
        <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs whitespace-nowrap">
          {formatTime(timeLeft.minutes)}m
        </span>
        <span className="opacity-60">:</span>
        <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs whitespace-nowrap">
          {formatTime(timeLeft.seconds)}s
        </span>
      </div>
    </div>
  );
};

const defaultCampaigns: Campaign[] = [
  {
    id: "flash-sale",
    title: "⚡ Flash Sale",
    subtitle: "Limited Time Offer",
    description: "Up to 70% off on selected electronics",
    discount: "70% OFF",
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    bgColor: "from-red-500 to-red-600",
    textColor: "text-white",
    ctaText: "Shop Now",
    ctaLink: "/marketplace/flash-sale",
    type: "flash",
  },
  {
    id: "winter-sale",
    title: "❄️ Winter Collection",
    subtitle: "New Season Arrivals",
    description: "Discover the latest winter fashion trends",
    discount: "40% OFF",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    bgColor: "from-blue-500 to-blue-600",
    textColor: "text-white",
    ctaText: "Explore",
    ctaLink: "/marketplace/winter-collection",
    type: "seasonal",
  },
];

export const CampaignBanners: React.FC<CampaignBannersProps> = ({
  campaigns,
  showCountdown = true,
  dismissible = true,
  className,
}) => {
  const [visibleCampaigns, setVisibleCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaigns = async () => {
      if (campaigns) {
        // Use provided campaigns
        setVisibleCampaigns(campaigns);
        setLoading(false);
      } else {
        // Fetch campaigns from service
        try {
          const campaignData = await MarketplaceService.getCampaigns();
          
          // Transform database campaigns to component format
          const transformedCampaigns = campaignData.map(campaign => {
            // Determine campaign type based on database type
            let type: "flash" | "seasonal" | "special" = "special";
            if (campaign.type === "flash_sale") type = "flash";
            else if (campaign.type === "seasonal") type = "seasonal";
            
            // Create background gradient based on colors
            const bgColor = campaign.backgroundColor ? 
              `from-${campaign.backgroundColor.split('-')[1] || 'gray'}-500 to-${campaign.backgroundColor.split('-')[1] || 'gray'}-600` : 
              "from-gray-500 to-gray-600";
            
            return {
              id: campaign.id,
              title: campaign.name,
              subtitle: campaign.bannerText || "Special Offer",
              description: campaign.description || "",
              discount: campaign.discountValue ? `${campaign.discountValue}% OFF` : "Limited Time Offer",
              endDate: new Date(campaign.endDate),
              bgColor,
              textColor: campaign.textColor || "text-white",
              ctaText: "Shop Now",
              ctaLink: `/marketplace/campaign/${campaign.slug}`,
              type,
              // Add progress tracking for flash sales (mock data for now)
              progress: type === "flash" ? 78 : undefined
            };
          });
          
          setVisibleCampaigns(transformedCampaigns);
        } catch (error) {
          console.error("Error loading campaigns:", error);
          // Fallback to default campaigns
          setVisibleCampaigns(defaultCampaigns);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCampaigns();
  }, [campaigns]);

  // If no campaigns provided and no default campaigns, use the default ones
  useEffect(() => {
    if (!campaigns && !loading && visibleCampaigns.length === 0) {
      setVisibleCampaigns(defaultCampaigns);
    }
  }, [campaigns, loading, visibleCampaigns.length]);

  const handleDismiss = (campaignId: string) => {
    setVisibleCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
  };

  const handleExpire = (campaignId: string) => {
    setVisibleCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
  };

  if (visibleCampaigns.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {visibleCampaigns.map((campaign) => (
        <div
          key={campaign.id}
          className={cn(
            "relative overflow-hidden rounded-xl bg-gradient-to-r p-4 sm:p-6 w-full",
            campaign.bgColor,
            campaign.textColor,
          )}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/20 transform skew-x-12 translate-x-1/2"></div>
          </div>

          {/* Dismiss Button */}
          {dismissible && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/20"
              onClick={() => handleDismiss(campaign.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0">
            {/* Campaign Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg sm:text-xl font-bold">
                  {campaign.title}
                </h3>
                {campaign.type === "flash" && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-400 text-yellow-900"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    HOT
                  </Badge>
                )}
                {campaign.type === "seasonal" && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    NEW
                  </Badge>
                )}
              </div>

              <p className="text-sm sm:text-base opacity-90 mb-1">
                {campaign.subtitle}
              </p>
              <p className="text-xs sm:text-sm opacity-80">
                {campaign.description}
              </p>

              {/* Discount Badge */}
              <div className="mt-3">
                <Badge
                  variant="secondary"
                  className="bg-white text-gray-900 font-bold text-sm px-3 py-1"
                >
                  {campaign.discount}
                </Badge>
              </div>
            </div>

            {/* Right Side - Countdown & CTA */}
            <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto flex-shrink-0">
              {/* Countdown Timer */}
              {showCountdown && (
                <div className="order-2 sm:order-1">
                  <Countdown
                    endDate={campaign.endDate}
                    onExpire={() => handleExpire(campaign.id)}
                  />
                </div>
              )}

              {/* CTA Button */}
              <Button
                variant="secondary"
                className="order-1 sm:order-2 bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-2 w-full sm:w-auto"
                onClick={() => (window.location.href = campaign.ctaLink)}
              >
                {campaign.ctaText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Progress Bar for Flash Sales */}
          {campaign.type === "flash" && (
            <div className="mt-4">
              <div className="flex justify-between text-xs opacity-80 mb-1">
                <span>Limited Stock</span>
                <span>{campaign.progress || 78}% claimed</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${campaign.progress || 78}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CampaignBanners;
