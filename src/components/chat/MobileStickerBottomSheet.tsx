import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  Smile,
  Heart,
  ThumbsUp,
  Coffee,
  Briefcase,
  Zap,
  Clock,
  Plus,
  X,
  Keyboard,
  Camera,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { StickerData } from "@/types/sticker";

interface MobileStickerBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStickerSelect: (sticker: StickerData) => void;
  onCreateSticker?: () => void;
  trigger?: React.ReactNode;
}

// Mobile-optimized sticker tabs - focused on Memes, GIFs, and Create
const MOBILE_TABS = [
  { id: "memes", icon: <Zap className="w-5 h-5" />, label: "Memes" },
  { id: "gifs", icon: <Camera className="w-5 h-5" />, label: "GIFs" },
  { id: "create", icon: <Plus className="w-5 h-5" />, label: "Create" },
];

// Mock sticker data for demonstration - focused on Memes and GIFs
const mockStickers: Record<string, StickerData[]> = {
  memes: [
    // Image-based memes/stickers
    {
      id: "m1",
      name: "Laughing Drake",
      type: "image",
      tags: ["funny", "meme", "reaction"],
      fileUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150
    },
    {
      id: "m2",
      name: "Thinking Cat",
      type: "image",
      tags: ["thinking", "cat", "meme"],
      fileUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150
    },
    {
      id: "m3",
      name: "Surprised Dog",
      type: "image",
      tags: ["surprised", "dog", "reaction"],
      fileUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150
    },
    {
      id: "m4",
      name: "Happy Pup",
      type: "image",
      tags: ["happy", "dog", "cute"],
      fileUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150
    },
    {
      id: "m5",
      name: "Grumpy Cat",
      type: "image",
      tags: ["grumpy", "cat", "mood"],
      fileUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150
    },
    {
      id: "m6",
      name: "Sleepy Kitten",
      type: "image",
      tags: ["sleepy", "kitten", "tired"],
      fileUrl: "https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150
    },
  ],
  gifs: [
    // GIF-based stickers
    {
      id: "g1",
      name: "Dancing Cat",
      type: "gif",
      tags: ["dancing", "cat", "party"],
      fileUrl: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
      thumbnailUrl: "https://media.giphy.com/media/JIX9t2j0ZTN9S/200w_d.gif",
      animated: true,
      width: 200,
      height: 200
    },
    {
      id: "g2",
      name: "Thumbs Up",
      type: "gif",
      tags: ["thumbs", "up", "approval"],
      fileUrl: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
      thumbnailUrl: "https://media.giphy.com/media/111ebonMs90YLu/200w_d.gif",
      animated: true,
      width: 200,
      height: 200
    },
    {
      id: "g3",
      name: "Clapping",
      type: "gif",
      tags: ["clapping", "applause", "good job"],
      fileUrl: "https://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif",
      thumbnailUrl: "https://media.giphy.com/media/7rj2ZgttvgomY/200w_d.gif",
      animated: true,
      width: 200,
      height: 200
    },
    {
      id: "g4",
      name: "Mind Blown",
      type: "gif",
      tags: ["mind", "blown", "amazed"],
      fileUrl: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
      thumbnailUrl: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/200w_d.gif",
      animated: true,
      width: 200,
      height: 200
    },
  ],
};

export const MobileStickerBottomSheet: React.FC<MobileStickerBottomSheetProps> = ({
  isOpen,
  onOpenChange,
  onStickerSelect,
  onCreateSticker,
  trigger,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("memes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboard, setShowKeyboard] = useState(false);

  const filteredStickers = React.useMemo(() => {
    const stickers = mockStickers[activeTab] || [];
    if (!searchQuery) return stickers;
    
    return stickers.filter(sticker => 
      sticker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sticker.emoji.includes(searchQuery)
    );
  }, [activeTab, searchQuery]);

  const handleStickerClick = (sticker: StickerData) => {
    onStickerSelect(sticker);
    onOpenChange(false);
    toast({
      title: "Sticker sent!",
      description: `Sent ${sticker.name} sticker`,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent 
        side="bottom" 
        className="h-[75vh] max-h-[500px] p-0 border-t-2 border-gray-200 dark:border-gray-700 rounded-t-xl"
      >
        <div className="flex flex-col h-full">
          {/* Header with handle and actions */}
          <div className="flex flex-col gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {/* Drag handle */}
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto"></div>
            
            {/* Title and action buttons */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Stickers</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className="h-9 w-9"
                >
                  <Keyboard className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    toast({
                      title: "Camera",
                      description: "Camera sticker creation coming soon!",
                    });
                  }}
                  className="h-9 w-9"
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onCreateSticker?.();
                    toast({
                      title: "Create",
                      description: "Custom sticker creation coming soon!",
                    });
                  }}
                  className="h-9 w-9"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-9 w-9"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stickers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Tabs and Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <ScrollArea orientation="horizontal" className="w-full">
                <TabsList className="inline-flex h-12 w-full bg-transparent p-0 justify-start">
                  {MOBILE_TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        "flex flex-col items-center gap-2 px-8 py-3 text-sm rounded-none border-b-3 transition-all flex-1",
                        "data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20",
                        "data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500"
                      )}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="text-xs font-medium leading-none">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {MOBILE_TABS.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="mt-0">
                      {tab.id === "create" ? (
                        <CreateStickerPanel onCreateSticker={onCreateSticker} />
                      ) : filteredStickers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            {tab.icon}
                          </div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {searchQuery ? `No ${tab.label.toLowerCase()} found` : `No ${tab.label.toLowerCase()} yet`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {searchQuery ? "Try a different search" : `Add some ${tab.label.toLowerCase()} to get started`}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          {filteredStickers.map((sticker) => (
                            <StickerMemeCard
                              key={sticker.id}
                              sticker={sticker}
                              onClick={() => handleStickerClick(sticker)}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Tabs>

          {/* Bottom actions bar */}
          <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {filteredStickers.length} stickers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast({
                    title: "GIF",
                    description: "GIF stickers coming soon!",
                  });
                }}
                className="h-8 px-3 text-xs"
              >
                GIF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast({
                    title: "Create",
                    description: "Custom sticker packs coming soon!",
                  });
                }}
                className="h-8 px-3 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileStickerBottomSheet;
