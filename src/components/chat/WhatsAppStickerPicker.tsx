import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Temporary fix: remove Badge import
// import { Badge } from "@/components/ui/badge";
import {
  Smile,
  Heart,
  ThumbsUp,
  Coffee,
  Briefcase,
  Gamepad2,
  Sparkles,
  Zap,
  Star,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StickerPickerProps {
  onStickerSelect: (sticker: StickerData) => void;
  className?: string;
  isMobile?: boolean;
}

interface StickerData {
  id: string;
  emoji: string;
  name: string;
  pack: string;
  animated?: boolean;
}

interface StickerPack {
  id: string;
  name: string;
  icon: React.ReactNode;
  stickers: StickerData[];
  premium?: boolean;
}

// Enhanced sticker packs with more variety
const stickerPacks: StickerPack[] = [
  {
    id: "emotions",
    name: "Emotions",
    icon: <Smile className="w-4 h-4" />,
    stickers: [
      { id: "happy", emoji: "😀", name: "Happy", pack: "emotions" },
      { id: "laughing", emoji: "😂", name: "Laughing", pack: "emotions" },
      { id: "love", emoji: "😍", name: "Love Eyes", pack: "emotions" },
      { id: "crying", emoji: "😢", name: "Crying", pack: "emotions" },
      { id: "surprised", emoji: "😮", name: "Surprised", pack: "emotions" },
      { id: "sleeping", emoji: "😴", name: "Sleeping", pack: "emotions" },
      { id: "thinking", emoji: "🤔", name: "Thinking", pack: "emotions" },
      { id: "cool", emoji: "😎", name: "Cool", pack: "emotions" },
      { id: "angel", emoji: "😇", name: "Angel", pack: "emotions" },
      { id: "hugging", emoji: "🤗", name: "Hugging", pack: "emotions" },
      { id: "party", emoji: "🥳", name: "Party", pack: "emotions" },
      { id: "nervous", emoji: "😅", name: "Nervous", pack: "emotions" },
      { id: "winking", emoji: "😉", name: "Winking", pack: "emotions" },
      { id: "kissing", emoji: "😘", name: "Kissing", pack: "emotions" },
      { id: "shocked", emoji: "😱", name: "Shocked", pack: "emotions" },
      { id: "sick", emoji: "🤢", name: "Sick", pack: "emotions" },
      { id: "dizzy", emoji: "😵", name: "Dizzy", pack: "emotions" },
      { id: "crazy", emoji: "🤪", name: "Crazy", pack: "emotions" },
      { id: "angry", emoji: "😡", name: "Angry", pack: "emotions" },
      { id: "sad", emoji: "😭", name: "Sad", pack: "emotions" },
    ],
  },
  {
    id: "gestures",
    name: "Gestures",
    icon: <ThumbsUp className="w-4 h-4" />,
    stickers: [
      { id: "thumbs_up", emoji: "👍", name: "Thumbs Up", pack: "gestures" },
      { id: "thumbs_down", emoji: "👎", name: "Thumbs Down", pack: "gestures" },
      { id: "ok_hand", emoji: "👌", name: "OK Hand", pack: "gestures" },
      { id: "peace", emoji: "✌️", name: "Peace", pack: "gestures" },
      { id: "handshake", emoji: "🤝", name: "Handshake", pack: "gestures" },
      { id: "clapping", emoji: "👏", name: "Clapping", pack: "gestures" },
      { id: "prayer", emoji: "🙏", name: "Prayer", pack: "gestures" },
      { id: "strong", emoji: "💪", name: "Strong", pack: "gestures" },
      { id: "wave", emoji: "👋", name: "Wave", pack: "gestures" },
      { id: "rock_on", emoji: "🤘", name: "Rock On", pack: "gestures" },
      { id: "call_me", emoji: "🤙", name: "Call Me", pack: "gestures" },
      { id: "fist_bump", emoji: "👊", name: "Fist Bump", pack: "gestures" },
      { id: "pointing_up", emoji: "☝️", name: "Pointing Up", pack: "gestures" },
      { id: "pointing_right", emoji: "👉", name: "Pointing Right", pack: "gestures" },
      { id: "pointing_left", emoji: "👈", name: "Pointing Left", pack: "gestures" },
      { id: "raised_hand", emoji: "✋", name: "Raised Hand", pack: "gestures" },
    ],
  },
  {
    id: "hearts",
    name: "Hearts & Love",
    icon: <Heart className="w-4 h-4" />,
    stickers: [
      { id: "red_heart", emoji: "❤️", name: "Red Heart", pack: "hearts" },
      { id: "orange_heart", emoji: "🧡", name: "Orange Heart", pack: "hearts" },
      { id: "yellow_heart", emoji: "💛", name: "Yellow Heart", pack: "hearts" },
      { id: "green_heart", emoji: "💚", name: "Green Heart", pack: "hearts" },
      { id: "blue_heart", emoji: "💙", name: "Blue Heart", pack: "hearts" },
      { id: "purple_heart", emoji: "💜", name: "Purple Heart", pack: "hearts" },
      { id: "black_heart", emoji: "🖤", name: "Black Heart", pack: "hearts" },
      { id: "white_heart", emoji: "🤍", name: "White Heart", pack: "hearts" },
      { id: "brown_heart", emoji: "🤎", name: "Brown Heart", pack: "hearts" },
      { id: "broken_heart", emoji: "💔", name: "Broken Heart", pack: "hearts" },
      { id: "heart_fire", emoji: "❤️‍🔥", name: "Heart on Fire", pack: "hearts" },
      { id: "heart_heal", emoji: "❤️‍🩹", name: "Mending Heart", pack: "hearts" },
      { id: "two_hearts", emoji: "💕", name: "Two Hearts", pack: "hearts" },
      { id: "sparkling_heart", emoji: "💖", name: "Sparkling Heart", pack: "hearts" },
      { id: "growing_heart", emoji: "💗", name: "Growing Heart", pack: "hearts" },
      { id: "beating_heart", emoji: "💓", name: "Beating Heart", pack: "hearts" },
      { id: "revolving_hearts", emoji: "💞", name: "Revolving Hearts", pack: "hearts" },
      { id: "cupid", emoji: "💘", name: "Cupid", pack: "hearts" },
      { id: "heart_kiss", emoji: "💋", name: "Kiss", pack: "hearts" },
      { id: "love_letter", emoji: "💌", name: "Love Letter", pack: "hearts" },
    ],
  },
  {
    id: "business",
    name: "Business",
    icon: <Briefcase className="w-4 h-4" />,
    stickers: [
      { id: "briefcase", emoji: "💼", name: "Briefcase", pack: "business" },
      { id: "money", emoji: "💰", name: "Money", pack: "business" },
      { id: "chart_up", emoji: "📈", name: "Chart Up", pack: "business" },
      { id: "chart_down", emoji: "📉", name: "Chart Down", pack: "business" },
      { id: "bar_chart", emoji: "📊", name: "Bar Chart", pack: "business" },
      { id: "idea", emoji: "💡", name: "Idea", pack: "business" },
      { id: "target", emoji: "🎯", name: "Target", pack: "business" },
      { id: "rocket", emoji: "🚀", name: "Rocket", pack: "business" },
      { id: "star", emoji: "⭐", name: "Star", pack: "business" },
      { id: "fire", emoji: "🔥", name: "Fire", pack: "business" },
      { id: "lightning", emoji: "⚡", name: "Lightning", pack: "business" },
      { id: "trophy", emoji: "🏆", name: "Trophy", pack: "business" },
      { id: "celebration", emoji: "🎊", name: "Celebration", pack: "business" },
      { id: "handshake_biz", emoji: "🤝", name: "Deal", pack: "business" },
      { id: "laptop", emoji: "💻", name: "Laptop", pack: "business" },
      { id: "phone", emoji: "📱", name: "Phone", pack: "business" },
      { id: "email", emoji: "📧", name: "Email", pack: "business" },
      { id: "calendar", emoji: "📅", name: "Calendar", pack: "business" },
      { id: "clock", emoji: "⏰", name: "Clock", pack: "business" },
      { id: "gear", emoji: "⚙️", name: "Gear", pack: "business" },
    ],
  },
  {
    id: "food",
    name: "Food & Drinks",
    icon: <Coffee className="w-4 h-4" />,
    stickers: [
      { id: "coffee", emoji: "☕", name: "Coffee", pack: "food" },
      { id: "tea", emoji: "🍵", name: "Tea", pack: "food" },
      { id: "beer", emoji: "🍺", name: "Beer", pack: "food" },
      { id: "wine", emoji: "🍷", name: "Wine", pack: "food" },
      { id: "cocktail", emoji: "🍹", name: "Cocktail", pack: "food" },
      { id: "pizza", emoji: "🍕", name: "Pizza", pack: "food" },
      { id: "burger", emoji: "🍔", name: "Burger", pack: "food" },
      { id: "fries", emoji: "🍟", name: "Fries", pack: "food" },
      { id: "hotdog", emoji: "🌭", name: "Hot Dog", pack: "food" },
      { id: "taco", emoji: "🌮", name: "Taco", pack: "food" },
      { id: "sushi", emoji: "🍣", name: "Sushi", pack: "food" },
      { id: "cake", emoji: "🎂", name: "Cake", pack: "food" },
      { id: "donut", emoji: "🍩", name: "Donut", pack: "food" },
      { id: "cookie", emoji: "🍪", name: "Cookie", pack: "food" },
      { id: "apple", emoji: "🍎", name: "Apple", pack: "food" },
      { id: "banana", emoji: "🍌", name: "Banana", pack: "food" },
      { id: "grapes", emoji: "🍇", name: "Grapes", pack: "food" },
      { id: "strawberry", emoji: "🍓", name: "Strawberry", pack: "food" },
      { id: "watermelon", emoji: "🍉", name: "Watermelon", pack: "food" },
      { id: "popcorn", emoji: "🍿", name: "Popcorn", pack: "food" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    icon: <Star className="w-4 h-4" />,
    premium: true,
    stickers: [
      { id: "diamond", emoji: "💎", name: "Diamond", pack: "premium", animated: true },
      { id: "crown", emoji: "👑", name: "Crown", pack: "premium", animated: true },
      { id: "sparkles", emoji: "✨", name: "Sparkles", pack: "premium", animated: true },
      { id: "magic", emoji: "🪄", name: "Magic Wand", pack: "premium", animated: true },
      { id: "unicorn", emoji: "🦄", name: "Unicorn", pack: "premium", animated: true },
      { id: "rainbow", emoji: "🌈", name: "Rainbow", pack: "premium", animated: true },
      { id: "star_struck", emoji: "🤩", name: "Star Struck", pack: "premium", animated: true },
      { id: "gold_star", emoji: "🌟", name: "Gold Star", pack: "premium", animated: true },
      { id: "fireworks", emoji: "🎆", name: "Fireworks", pack: "premium", animated: true },
      { id: "confetti", emoji: "🎉", name: "Confetti", pack: "premium", animated: true },
    ],
  },
];

export const WhatsAppStickerPicker: React.FC<StickerPickerProps> = ({
  onStickerSelect,
  className,
  isMobile = false,
}) => {
  const [selectedPack, setSelectedPack] = useState("emotions");

  const handleStickerClick = (sticker: StickerData) => {
    onStickerSelect(sticker);
  };

  return (
    <div className={cn(
      "flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg",
      isMobile ? "w-full h-80 mx-2" : "w-80 h-96",
      className
    )}>
      {/* Pack tabs */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <ScrollArea className="w-full">
          <div className={cn(
            "flex items-center space-x-1",
            isMobile ? "p-1.5" : "p-2"
          )}>
            {stickerPacks.map((pack) => (
              <Button
                key={pack.id}
                variant={selectedPack === pack.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex-shrink-0 rounded-lg relative",
                  isMobile ? "h-8 px-2" : "h-10 px-3",
                  selectedPack === pack.id
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => setSelectedPack(pack.id)}
              >
                <div className={cn(
                  "flex items-center",
                  isMobile ? "gap-1" : "gap-2"
                )}>
                  <span className={cn(isMobile ? "text-xs" : "")}>{pack.icon}</span>
                  {!isMobile && (
                    <span className="text-xs font-medium">{pack.name}</span>
                  )}
                  {pack.premium && !isMobile && (
                    <span className="text-xs bg-secondary text-secondary-foreground px-1 py-0 h-4 rounded">
                      Pro
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Sticker grid */}
      <ScrollArea className="flex-1">
        <div className={cn(
          "grid gap-2",
          isMobile ? "grid-cols-6 gap-1.5 p-2" : "grid-cols-5 gap-2 p-3"
        )}>
          {stickerPacks
            .find(pack => pack.id === selectedPack)
            ?.stickers.map((sticker) => (
              <Button
                key={sticker.id}
                variant="ghost"
                className={cn(
                  "p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 relative group",
                  isMobile
                    ? "h-10 w-10 text-base touch-manipulation active:scale-95"
                    : "h-14 w-14 text-2xl",
                  sticker.animated && !isMobile && "hover:scale-110"
                )}
                onClick={() => handleStickerClick(sticker)}
              >
                <span className={cn(
                  "transition-transform duration-200",
                  sticker.animated && "group-hover:animate-bounce"
                )}>
                  {sticker.emoji}
                </span>
                
                {/* Animated indicator */}
                {sticker.animated && (
                  <div className={cn(
                    "absolute top-0 right-0 bg-blue-500 rounded-full",
                    isMobile ? "w-1.5 h-1.5" : "w-2 h-2"
                  )}></div>
                )}
                
                {/* Tooltip - only on desktop */}
                {!isMobile && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {sticker.name}
                  </div>
                )}
              </Button>
            ))}
        </div>
      </ScrollArea>

      {/* Pack info */}
      <div className={cn(
        "border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900",
        isMobile ? "p-1.5" : "p-2"
      )}>
        <div className={cn(
          "flex items-center justify-between text-gray-600 dark:text-gray-400",
          isMobile ? "text-[10px]" : "text-xs"
        )}>
          <span>
            {stickerPacks.find(pack => pack.id === selectedPack)?.name} Pack
          </span>
          <div className="flex items-center gap-2">
            <span>
              {stickerPacks.find(pack => pack.id === selectedPack)?.stickers.length} stickers
            </span>
            {stickerPacks.find(pack => pack.id === selectedPack)?.premium && (
              <span className="text-xs border border-border px-1.5 py-0 h-5 rounded flex items-center">
                <Star className="w-2.5 h-2.5 mr-1" />
                Premium
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppStickerPicker;
