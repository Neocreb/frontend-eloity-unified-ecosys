// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  virtualGiftsService,
  VirtualGift,
} from "@/services/virtualGiftsService";
import {
  Gift,
  Heart,
  Star,
  Trophy,
  Crown,
  Sparkles,
  Filter,
  TrendingUp,
  ZapOff,
} from "lucide-react";

interface BrowseGiftsTabProps {
  onSelectGift?: (gift: VirtualGift) => void;
}

const BrowseGiftsTab: React.FC<BrowseGiftsTabProps> = ({ onSelectGift }) => {
  const [availableGifts, setAvailableGifts] = useState<VirtualGift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [expandedGiftId, setExpandedGiftId] = useState<string | null>(null);

  // Gift categories with metadata
  const giftCategories = [
    {
      id: "basic",
      name: "Basic Gifts",
      slug: "basic",
      icon: Heart,
      color: "bg-red-500",
      description: "Love and appreciation",
      emoji: "❤️",
      hint: "Perfect for everyday appreciation and positive feedback",
    },
    {
      id: "premium",
      name: "Premium Gifts",
      slug: "premium",
      icon: Crown,
      color: "bg-purple-500",
      description: "Exclusive and special",
      emoji: "👑",
      hint: "For special occasions and meaningful gestures",
    },
    {
      id: "seasonal",
      name: "Seasonal Gifts",
      slug: "seasonal",
      icon: Sparkles,
      color: "bg-green-500",
      description: "Holiday and events",
      emoji: "🎄",
      hint: "Limited-time gifts for holidays and celebrations",
    },
    {
      id: "special",
      name: "Special Events",
      slug: "special",
      icon: Trophy,
      color: "bg-yellow-500",
      description: "Celebrations",
      emoji: "🏆",
      hint: "For milestone moments and legendary achievements",
    },
  ];

  const rarityLevels = [
    {
      value: "common",
      label: "Common",
      color: "bg-gray-500",
      description: "Easy to get, perfect for showing daily appreciation",
    },
    {
      value: "rare",
      label: "Rare",
      color: "bg-blue-500",
      description: "More valuable, for special recognition",
    },
    {
      value: "epic",
      label: "Epic",
      color: "bg-purple-500",
      description: "Impressive gifts for extraordinary moments",
    },
    {
      value: "legendary",
      label: "Legendary",
      color: "bg-yellow-500",
      description: "The rarest and most exclusive gifts available",
    },
  ];

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    setIsLoading(true);
    try {
      const gifts = await virtualGiftsService.getVirtualGiftsFromDB();
      setAvailableGifts(gifts);
    } catch (error) {
      console.error("Error loading gifts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: VirtualGift["rarity"]) => {
    const level = rarityLevels.find((r) => r.value === rarity);
    return level?.color || "bg-gray-500";
  };

  // Group gifts by category
  const giftsByCategory = availableGifts.reduce(
    (acc, gift) => {
      if (!acc[gift.category]) {
        acc[gift.category] = [];
      }
      acc[gift.category].push(gift);
      return acc;
    },
    {} as Record<string, VirtualGift[]>,
  );

  // Filter gifts by rarity if selected
  const filteredGifts = selectedRarity
    ? availableGifts.filter((gift) => gift.rarity === selectedRarity)
    : availableGifts;

  const filteredByCategory = filteredGifts.reduce(
    (acc, gift) => {
      if (!acc[gift.category]) {
        acc[gift.category] = [];
      }
      acc[gift.category].push(gift);
      return acc;
    },
    {} as Record<string, VirtualGift[]>,
  );

  return (
    <div className="space-y-4 sm:space-y-6 mt-4">
      {/* Category Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {giftCategories.map((category) => (
          <Card
            key={category.id}
            className="hover:shadow-lg transition-all duration-300 group cursor-pointer"
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div
                className={`w-10 h-10 sm:w-14 sm:h-14 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}
              >
                <category.icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="font-semibold text-xs sm:text-base mb-0.5 sm:mb-1">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                {category.description}
              </p>
              <Badge variant="secondary" className="text-xs">
                {giftsByCategory[category.slug]?.length || 0} gifts
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rarity Filter */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filter by Rarity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant={selectedRarity === null ? "default" : "outline"}
              onClick={() => setSelectedRarity(null)}
              className="text-xs sm:text-sm h-8 sm:h-auto py-1 sm:py-2"
            >
              All Gifts
            </Button>
            {rarityLevels.map((rarity) => (
              <Button
                key={rarity.value}
                variant={selectedRarity === rarity.value ? "default" : "outline"}
                onClick={() => setSelectedRarity(rarity.value)}
                className={`text-xs sm:text-sm h-8 sm:h-auto py-1 sm:py-2 ${
                  selectedRarity === rarity.value ? rarity.color + " text-white" : ""
                }`}
              >
                {rarity.label}
              </Button>
            ))}
          </div>
          {selectedRarity && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-3">
              {rarityLevels.find((r) => r.value === selectedRarity)?.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Gifts by Category */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[...Array(6)].map((_, j) => (
                    <Skeleton key={j} className="h-20 sm:h-24 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue={giftCategories[0]?.slug || "basic"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
            {giftCategories.map((category) => (
              <TabsTrigger key={category.slug} value={category.slug} className="text-xs sm:text-sm py-2">
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.emoji}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {giftCategories.map((category) => (
            <TabsContent key={category.slug} value={category.slug} className="space-y-4 mt-4">
              {!filteredByCategory[category.slug] ||
              filteredByCategory[category.slug].length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <ZapOff className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {selectedRarity
                        ? `No ${selectedRarity} gifts in ${category.name}`
                        : `No gifts available in ${category.name} right now`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
                    {filteredByCategory[category.slug]?.map((gift) => (
                      <div
                        key={gift.id}
                        className={`relative group cursor-pointer transition-all ${
                          expandedGiftId === gift.id ? "col-span-4 sm:col-span-5 md:col-span-6" : ""
                        }`}
                        onClick={() =>
                          setExpandedGiftId(expandedGiftId === gift.id ? null : gift.id)
                        }
                      >
                        <Card
                          className={`transition-all p-2 text-center hover:shadow-md ${
                            expandedGiftId === gift.id ? "ring-2 ring-primary" : ""
                          }`}
                        >
                          <CardContent className="p-1.5 sm:p-2">
                            <div className="text-2xl sm:text-3xl mb-1">{gift.emoji}</div>
                            <h3 className="font-medium text-xs line-clamp-1 mb-0.5">
                              {gift.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-1">
                              ${gift.price.toFixed(2)}
                            </p>
                            <Badge
                              className={`text-xs ${getRarityColor(gift.rarity)} text-white`}
                            >
                              {gift.rarity}
                            </Badge>
                          </CardContent>
                        </Card>

                        {/* Expanded Gift Details */}
                        {expandedGiftId === gift.id && (
                          <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-background border rounded-lg shadow-lg p-3 sm:p-4">
                            <div className="flex items-start gap-3">
                              <div className="text-4xl">{gift.emoji}</div>
                              <div className="flex-1">
                                <h4 className="font-bold text-sm sm:text-base mb-1">
                                  {gift.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                                  {gift.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    className={`text-xs ${getRarityColor(gift.rarity)} text-white`}
                                  >
                                    {gift.rarity}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    ${gift.price.toFixed(2)}
                                  </Badge>
                                  {gift.effects && gift.effects.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {gift.effects.length} effects
                                    </Badge>
                                  )}
                                </div>
                                {gift.seasonalStart && gift.seasonalEnd && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Available: {new Date(gift.seasonalStart).toLocaleDateString()} -{" "}
                                    {new Date(gift.seasonalEnd).toLocaleDateString()}
                                  </p>
                                )}
                                {onSelectGift && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectGift(gift);
                                      setExpandedGiftId(null);
                                    }}
                                    className="w-full mt-3 text-xs sm:text-sm h-7 sm:h-auto py-1 sm:py-2"
                                    size="sm"
                                  >
                                    <Gift className="h-3 w-3 mr-1" />
                                    Send This Gift
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Category Info Card */}
                  <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${category.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <category.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs sm:text-sm mb-1">
                            {category.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {category.hint}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Price Info Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Gift Price Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gifts are available at various price points to fit your budget:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { min: 0.5, max: 2, label: "Budget-Friendly", emoji: "💰" },
              { min: 3, max: 10, label: "Mid-Range", emoji: "💳" },
              { min: 15, max: 30, label: "Premium", emoji: "✨" },
              { min: 40, max: 50, label: "Exclusive", emoji: "👑" },
            ].map((range) => (
              <div key={range.label} className="p-2 rounded-lg border text-center">
                <div className="text-lg sm:text-2xl mb-1">{range.emoji}</div>
                <p className="text-xs font-medium">{range.label}</p>
                <p className="text-xs text-muted-foreground">
                  ${range.min}-${range.max}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrowseGiftsTab;
