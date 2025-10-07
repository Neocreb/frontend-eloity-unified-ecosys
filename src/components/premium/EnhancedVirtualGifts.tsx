// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Gift,
  Heart,
  DollarSign,
  Star,
  Sparkles,
  Crown,
  Coffee,
  Send,
  UserCheck,
  TrendingUp,
  Calendar,
  Award,
  Eye,
  EyeOff,
  ShoppingBag,
  Image,
  ExternalLink,
  Zap,
  Flame,
  Gem,
  Trophy,
  Rocket,
  Diamond,
  Music,
  Gamepad2,
  PartyPopper,
  Cake,
  Rose,
  Moon,
  Sun,
  Snowflake,
  Leaf,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface EnhancedVirtualGiftsProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  recipientIsPremium?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onGiftSent?: (gift: EnhancedGift, recipient: string) => void;
  userPremiumStatus?: boolean;
  userCoins?: number;
  userCredits?: number;
}

interface EnhancedGift {
  id: string;
  name: string;
  emoji: string;
  icon: React.ReactNode;
  cost: number;
  category: "basic" | "premium" | "exclusive" | "seasonal" | "animated" | "interactive";
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  effects?: {
    animation?: string;
    sound?: string;
    particles?: boolean;
    glow?: boolean;
    screen_effect?: string;
  };
  premiumOnly?: boolean;
  limitedTime?: boolean;
  metadata?: {
    creator?: string;
    collection?: string;
    power?: number;
    special_message?: string;
  };
}

interface GiftBundle {
  id: string;
  name: string;
  description: string;
  gifts: string[];
  originalCost: number;
  bundleCost: number;
  savings: number;
  premiumOnly?: boolean;
  limitedTime?: boolean;
  icon: React.ReactNode;
}

const ENHANCED_GIFTS: EnhancedGift[] = [
  // Basic Gifts
  {
    id: "heart",
    name: "Heart",
    emoji: "❤️",
    icon: <Heart className="w-6 h-6" />,
    cost: 10,
    category: "basic",
    description: "Show some love",
    rarity: "common",
  },
  {
    id: "star",
    name: "Star",
    emoji: "⭐",
    icon: <Star className="w-6 h-6" />,
    cost: 15,
    category: "basic",
    description: "You're a star!",
    rarity: "common",
  },
  {
    id: "coffee",
    name: "Coffee",
    emoji: "☕",
    icon: <Coffee className="w-6 h-6" />,
    cost: 25,
    category: "basic",
    description: "Buy them a coffee",
    rarity: "common",
  },
  
  // Premium Gifts
  {
    id: "crown",
    name: "Royal Crown",
    emoji: "👑",
    icon: <Crown className="w-6 h-6" />,
    cost: 100,
    category: "premium",
    description: "Crown them royalty",
    rarity: "rare",
    premiumOnly: true,
    effects: {
      animation: "crown_glow",
      particles: true,
      glow: true,
    },
  },
  {
    id: "diamond",
    name: "Diamond",
    emoji: "💎",
    icon: <Diamond className="w-6 h-6" />,
    cost: 200,
    category: "premium",
    description: "You're a precious gem",
    rarity: "epic",
    premiumOnly: true,
    effects: {
      animation: "sparkle",
      particles: true,
      glow: true,
      screen_effect: "shimmer",
    },
  },
  {
    id: "rocket",
    name: "Rocket",
    emoji: "🚀",
    icon: <Rocket className="w-6 h-6" />,
    cost: 150,
    category: "premium",
    description: "To the moon!",
    rarity: "rare",
    premiumOnly: true,
    effects: {
      animation: "launch",
      sound: "rocket_launch",
      particles: true,
    },
  },

  // Exclusive Gifts
  {
    id: "phoenix",
    name: "Phoenix Fire",
    emoji: "🔥",
    icon: <Flame className="w-6 h-6" />,
    cost: 500,
    category: "exclusive",
    description: "Rise from the ashes",
    rarity: "legendary",
    premiumOnly: true,
    effects: {
      animation: "phoenix_rise",
      sound: "fire_whoosh",
      particles: true,
      glow: true,
      screen_effect: "fire_overlay",
    },
    metadata: {
      power: 95,
      special_message: "You have the power to rise above anything!",
    },
  },
  {
    id: "galaxy",
    name: "Galaxy",
    emoji: "🌌",
    icon: <Sparkles className="w-6 h-6" />,
    cost: 750,
    category: "exclusive",
    description: "You're out of this world",
    rarity: "legendary",
    premiumOnly: true,
    effects: {
      animation: "galaxy_swirl",
      sound: "cosmic_wind",
      particles: true,
      glow: true,
      screen_effect: "starfield",
    },
    metadata: {
      power: 100,
      special_message: "You are infinite like the cosmos!",
    },
  },

  // Seasonal Gifts
  {
    id: "snow_crystal",
    name: "Snow Crystal",
    emoji: "❄️",
    icon: <Snowflake className="w-6 h-6" />,
    cost: 75,
    category: "seasonal",
    description: "Winter magic",
    rarity: "rare",
    limitedTime: true,
    effects: {
      animation: "snow_fall",
      particles: true,
    },
  },
  {
    id: "spring_flower",
    name: "Spring Bloom",
    emoji: "🌸",
    icon: <Leaf className="w-6 h-6" />,
    cost: 75,
    category: "seasonal",
    description: "Fresh as spring",
    rarity: "rare",
    limitedTime: true,
    effects: {
      animation: "petal_fall",
      particles: true,
    },
  },

  // Animated Gifts
  {
    id: "party",
    name: "Party Time",
    emoji: "🎉",
    icon: <PartyPopper className="w-6 h-6" />,
    cost: 125,
    category: "animated",
    description: "Let's celebrate!",
    rarity: "epic",
    effects: {
      animation: "confetti_burst",
      sound: "celebration",
      particles: true,
      screen_effect: "confetti_rain",
    },
  },
  {
    id: "gaming",
    name: "Game Master",
    emoji: "🎮",
    icon: <Gamepad2 className="w-6 h-6" />,
    cost: 100,
    category: "animated",
    description: "Level up!",
    rarity: "rare",
    effects: {
      animation: "level_up",
      sound: "power_up",
      particles: true,
    },
  },

  // Interactive Gifts
  {
    id: "music_box",
    name: "Music Box",
    emoji: "🎵",
    icon: <Music className="w-6 h-6" />,
    cost: 175,
    category: "interactive",
    description: "Play a beautiful melody",
    rarity: "epic",
    effects: {
      animation: "musical_notes",
      sound: "music_box_melody",
      particles: true,
    },
  },
];

const GIFT_BUNDLES: GiftBundle[] = [
  {
    id: "starter_pack",
    name: "Starter Pack",
    description: "Perfect for new users",
    gifts: ["heart", "star", "coffee"],
    originalCost: 50,
    bundleCost: 40,
    savings: 10,
    icon: <Gift className="w-6 h-6" />,
  },
  {
    id: "premium_collection",
    name: "Premium Collection",
    description: "Show you really care",
    gifts: ["crown", "diamond", "rocket"],
    originalCost: 450,
    bundleCost: 350,
    savings: 100,
    premiumOnly: true,
    icon: <Crown className="w-6 h-6" />,
  },
  {
    id: "seasonal_bundle",
    name: "Seasonal Bundle",
    description: "Limited time collection",
    gifts: ["snow_crystal", "spring_flower", "party"],
    originalCost: 275,
    bundleCost: 200,
    savings: 75,
    limitedTime: true,
    icon: <Snowflake className="w-6 h-6" />,
  },
  {
    id: "legendary_vault",
    name: "Legendary Vault",
    description: "The ultimate gift collection",
    gifts: ["phoenix", "galaxy", "music_box"],
    originalCost: 1425,
    bundleCost: 1000,
    savings: 425,
    premiumOnly: true,
    icon: <Trophy className="w-6 h-6" />,
  },
];

export const EnhancedVirtualGifts: React.FC<EnhancedVirtualGiftsProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
  recipientIsPremium = false,
  isOpen,
  onClose,
  onGiftSent,
  userPremiumStatus = false,
  userCoins = 100,
  userCredits = 10,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("gifts");
  const [selectedGift, setSelectedGift] = useState<EnhancedGift | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<GiftBundle | null>(null);
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [giftMessage, setGiftMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { id: "all", name: "All", icon: <Gift className="w-4 h-4" /> },
    { id: "basic", name: "Basic", icon: <Heart className="w-4 h-4" /> },
    { id: "premium", name: "Premium", icon: <Crown className="w-4 h-4" /> },
    { id: "exclusive", name: "Exclusive", icon: <Gem className="w-4 h-4" /> },
    { id: "seasonal", name: "Seasonal", icon: <Snowflake className="w-4 h-4" /> },
    { id: "animated", name: "Animated", icon: <Zap className="w-4 h-4" /> },
    { id: "interactive", name: "Interactive", icon: <Gamepad2 className="w-4 h-4" /> },
  ];

  const filteredGifts = ENHANCED_GIFTS.filter(gift => {
    if (selectedCategory === "all") return true;
    return gift.category === selectedCategory;
  }).filter(gift => {
    // Filter out premium-only gifts for non-premium users
    if (gift.premiumOnly && !userPremiumStatus) return false;
    return true;
  });

  const filteredBundles = GIFT_BUNDLES.filter(bundle => {
    if (bundle.premiumOnly && !userPremiumStatus) return false;
    return true;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "rare": return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200";
      case "epic": return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200";
      case "legendary": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "basic": return "border-gray-200 dark:border-gray-700";
      case "premium": return "border-blue-200 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10";
      case "exclusive": return "border-purple-200 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-900/10";
      case "seasonal": return "border-green-200 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10";
      case "animated": return "border-orange-200 dark:border-orange-700 bg-orange-50/30 dark:bg-orange-900/10";
      case "interactive": return "border-pink-200 dark:border-pink-700 bg-pink-50/30 dark:bg-pink-900/10";
      default: return "border-gray-200 dark:border-gray-700";
    }
  };

  const canAffordGift = (cost: number, quantity: number = 1) => {
    return userCoins >= (cost * quantity);
  };

  const handleSendGift = async () => {
    if (!selectedGift && !selectedBundle) {
      toast({
        title: "No gift selected",
        description: "Please select a gift to send",
        variant: "destructive",
      });
      return;
    }

    const totalCost = selectedGift 
      ? selectedGift.cost * giftQuantity
      : selectedBundle?.bundleCost || 0;

    if (!canAffordGift(selectedGift?.cost || selectedBundle?.bundleCost || 0, giftQuantity)) {
      toast({
        title: "Insufficient coins",
        description: "You don't have enough coins for this gift",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (selectedGift) {
        onGiftSent?.(selectedGift, recipientId);
      }

      toast({
        title: "Gift sent successfully! 🎉",
        description: `Sent ${selectedGift?.name || selectedBundle?.name} to ${recipientName}`,
      });

      // Reset form
      setSelectedGift(null);
      setSelectedBundle(null);
      setGiftQuantity(1);
      setGiftMessage("");
      setIsAnonymous(false);
      onClose();
    } catch (error) {
      toast({
        title: "Failed to send gift",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const renderGiftCard = (gift: EnhancedGift) => (
    <Card
      key={gift.id}
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:scale-105",
        getCategoryColor(gift.category),
        selectedGift?.id === gift.id && "ring-2 ring-primary",
        !canAffordGift(gift.cost) && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => canAffordGift(gift.cost) && setSelectedGift(gift)}
    >
      <CardContent className="p-4 text-center">
        <div className="relative mb-3">
          <div className="text-4xl mb-2">{gift.emoji}</div>
          {gift.effects?.glow && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-lg" />
          )}
          {gift.limitedTime && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
              LIMITED
            </Badge>
          )}
          {gift.premiumOnly && (
            <Crown className="absolute -top-1 -left-1 w-4 h-4 text-yellow-500" />
          )}
        </div>
        
        <h4 className="font-semibold text-sm mb-1">{gift.name}</h4>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{gift.description}</p>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn("text-xs", getRarityColor(gift.rarity))}>
            {gift.rarity}
          </Badge>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-yellow-500" />
            <span className="font-bold text-sm">{gift.cost}</span>
          </div>
        </div>

        {gift.effects && (
          <div className="mt-2 flex justify-center gap-1">
            {gift.effects.animation && <Zap className="w-3 h-3 text-blue-500" />}
            {gift.effects.sound && <Music className="w-3 h-3 text-green-500" />}
            {gift.effects.particles && <Sparkles className="w-3 h-3 text-purple-500" />}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderBundleCard = (bundle: GiftBundle) => (
    <Card
      key={bundle.id}
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:scale-105",
        selectedBundle?.id === bundle.id && "ring-2 ring-primary",
        !canAffordGift(bundle.bundleCost) && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => canAffordGift(bundle.bundleCost) && setSelectedBundle(bundle)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{bundle.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{bundle.name}</h4>
              {bundle.premiumOnly && <Crown className="w-4 h-4 text-yellow-500" />}
              {bundle.limitedTime && (
                <Badge className="bg-red-500 text-white text-xs">LIMITED</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{bundle.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="line-through text-muted-foreground">{bundle.originalCost}</span>
                <span className="font-bold text-green-600 ml-2">{bundle.bundleCost}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Save {bundle.savings}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            Send Gift to {recipientName}
            {recipientIsPremium && <Crown className="w-5 h-5 text-yellow-500" />}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* User Balance */}
          <Card className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{userCoins.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">coins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gem className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold">{userCredits}</span>
                  <span className="text-sm text-muted-foreground">credits</span>
                </div>
                {userPremiumStatus && (
                  <Badge className="bg-yellow-500">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-3 h-3 mr-1" />
                Buy More
              </Button>
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gifts">Individual Gifts</TabsTrigger>
              <TabsTrigger value="bundles">Gift Bundles</TabsTrigger>
              <TabsTrigger value="preview">Preview & Send</TabsTrigger>
            </TabsList>

            <TabsContent value="gifts" className="flex-1 flex flex-col">
              {/* Category Filter */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    {category.icon}
                    {category.name}
                  </Button>
                ))}
              </div>

              <ScrollArea className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                  {filteredGifts.map(renderGiftCard)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="bundles" className="flex-1 flex flex-col">
              <ScrollArea className="flex-1">
                <div className="grid gap-4 pb-4">
                  {filteredBundles.map(renderBundleCard)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 flex flex-col">
              {(selectedGift || selectedBundle) ? (
                <div className="space-y-4">
                  {/* Selected Gift/Bundle Preview */}
                  <Card className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={recipientAvatar} alt={recipientName} />
                        <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">Sending to {recipientName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl">
                            {selectedGift?.emoji || "🎁"}
                          </span>
                          <span className="font-medium">
                            {selectedGift?.name || selectedBundle?.name}
                          </span>
                          {selectedGift && giftQuantity > 1 && (
                            <Badge>x{giftQuantity}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Gift Options */}
                  <div className="space-y-4">
                    {selectedGift && (
                      <div>
                        <Label>Quantity</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Slider
                            value={[giftQuantity]}
                            onValueChange={(value) => setGiftQuantity(value[0])}
                            max={Math.min(10, Math.floor(userCoins / selectedGift.cost))}
                            min={1}
                            step={1}
                            className="flex-1"
                          />
                          <span className="font-medium w-8">{giftQuantity}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Personal Message (Optional)</Label>
                      <Textarea
                        placeholder="Add a personal message..."
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        maxLength={200}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isAnonymous}
                          onCheckedChange={setIsAnonymous}
                        />
                        <Label>Send anonymously</Label>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Cost</div>
                        <div className="font-bold text-lg">
                          {((selectedGift?.cost || selectedBundle?.bundleCost || 0) * giftQuantity).toLocaleString()} coins
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSendGift}
                    disabled={isSending || !canAffordGift(selectedGift?.cost || selectedBundle?.bundleCost || 0, giftQuantity)}
                    className="w-full h-12 text-lg"
                  >
                    {isSending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Sending Gift...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Gift
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Gift className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a gift or bundle to preview</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedVirtualGifts;
