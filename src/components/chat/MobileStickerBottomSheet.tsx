import React, { useState, useRef, useEffect } from "react";
import { EnhancedMediaCreationPanel } from "./EnhancedMediaCreationPanel";
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
  Image as ImageIcon,
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
      height: 150,
      packId: "memes",
      packName: "Memes",
      usageCount: 0
    },
    {
      id: "m2",
      name: "Thinking Cat",
      type: "image",
      tags: ["thinking", "cat", "meme"],
      fileUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150,
      packId: "memes",
      packName: "Memes",
      usageCount: 0
    },
    {
      id: "m3",
      name: "Surprised Dog",
      type: "image",
      tags: ["surprised", "dog", "reaction"],
      fileUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150,
      packId: "memes",
      packName: "Memes",
      usageCount: 0
    },
    {
      id: "m4",
      name: "Happy Pup",
      type: "image",
      tags: ["happy", "dog", "cute"],
      fileUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150,
      packId: "memes",
      packName: "Memes",
      usageCount: 0
    },
    {
      id: "m5",
      name: "Grumpy Cat",
      type: "image",
      tags: ["grumpy", "cat", "mood"],
      fileUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150,
      packId: "memes",
      packName: "Memes",
      usageCount: 0
    },
    {
      id: "m6",
      name: "Sleepy Kitten",
      type: "image",
      tags: ["sleepy", "kitten", "tired"],
      fileUrl: "https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=150&h=150&fit=crop&crop=face",
      thumbnailUrl: "https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=80&h=80&fit=crop&crop=face",
      width: 150,
      height: 150,
      packId: "memes",
      packName: "Memes",
      usageCount: 0
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
      height: 200,
      packId: "gifs",
      packName: "GIFs",
      usageCount: 0
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
      height: 200,
      packId: "gifs",
      packName: "GIFs",
      usageCount: 0
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
      height: 200,
      packId: "gifs",
      packName: "GIFs",
      usageCount: 0
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
      height: 200,
      packId: "gifs",
      packName: "GIFs",
      usageCount: 0
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
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const filteredStickers = React.useMemo(() => {
    const stickers = mockStickers[activeTab] || [];
    if (!searchQuery) return stickers;
    
    return stickers.filter(sticker => 
      sticker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sticker.emoji?.includes(searchQuery)
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
                    setActiveTab("create");
                    setShowCreatePanel(true);
                  }}
                  className="h-9 w-9"
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setActiveTab("create");
                    setShowCreatePanel(true);
                    onCreateSticker?.();
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
              <ScrollArea className="w-full">
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
                        showCreatePanel ? (
                          <EnhancedMediaCreationPanel
                            isMobile={true}
                            onStickerCreate={(stickerData) => {
                              // Create a sticker object and send it
                              const sticker: StickerData = {
                                id: Date.now().toString(),
                                name: stickerData.name,
                                fileUrl: stickerData.url,
                                thumbnailUrl: stickerData.url,
                                packId: "custom",
                                packName: "Custom",
                                type: stickerData.type === "gif" ? "gif" : "image",
                                width: 128,
                                height: 128,
                                usageCount: 0,
                                tags: [stickerData.type],
                                metadata: stickerData.metadata,
                              };
                              onStickerSelect(sticker);
                              setShowCreatePanel(false);
                              onOpenChange(false);
                            }}
                          />
                        ) : (
                          <CreateStickerPanel
                            onCreateSticker={onCreateSticker}
                            onShowMediaPanel={() => setShowCreatePanel(true)}
                          />
                        )
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
                    description: "Switch to Create tab to make GIF stickers!",
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
                  setActiveTab("create");
                  toast({
                    title: "Create",
                    description: "Create your own custom stickers!",
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

// Individual sticker/meme card component
interface StickerMemeCardProps {
  sticker: StickerData;
  onClick: () => void;
}

const StickerMemeCard: React.FC<StickerMemeCardProps> = ({ sticker, onClick }) => {
  return (
    <Button
      variant="ghost"
      className="h-24 w-full p-1 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation relative group"
      onClick={onClick}
    >
      {sticker.type === "image" || sticker.type === "gif" ? (
        <div className="relative w-full h-full">
          <img
            src={sticker.thumbnailUrl || sticker.fileUrl}
            alt={sticker.name}
            className="w-full h-full object-cover rounded-lg"
          />
          {sticker.animated && (
            <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
              GIF
            </div>
          )}
        </div>
      ) : (
        <span className="text-3xl">{sticker.emoji}</span>
      )}

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {sticker.name}
      </div>
    </Button>
  );
};

// Create sticker panel component
interface CreateStickerPanelProps {
  onCreateSticker?: () => void;
  onShowMediaPanel?: () => void;
}

const CreateStickerPanel: React.FC<CreateStickerPanelProps> = ({ onCreateSticker, onShowMediaPanel }) => {
  const { toast } = useToast();

  const createOptions = [
    {
      id: "meme",
      title: "Create Meme",
      description: "Turn images into fun stickers",
      icon: <ImageIcon className="w-8 h-8" />,
      color: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      action: () => {
        onShowMediaPanel?.();
        toast({
          title: "Meme Creator",
          description: "Upload an image to create a meme!",
        });
      }
    },
    {
      id: "gif",
      title: "Create GIF",
      description: "Convert videos to animated stickers",
      icon: <Camera className="w-8 h-8" />,
      color: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      action: () => {
        onShowMediaPanel?.();
        toast({
          title: "GIF Creator",
          description: "Upload a video to create an animated sticker!",
        });
      }
    },
    {
      id: "camera",
      title: "Take Photo",
      description: "Capture and create instantly",
      icon: <Camera className="w-8 h-8" />,
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      action: () => {
        onShowMediaPanel?.();
        toast({
          title: "Camera",
          description: "Take a photo to create a sticker!",
        });
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h3 className="text-lg font-semibold mb-2">Create Your Own</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Turn your photos and videos into fun stickers and GIFs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {createOptions.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            className="h-auto p-4 justify-start hover:shadow-md transition-all duration-200"
            onClick={option.action}
          >
            <div className={`rounded-lg p-3 mr-4 ${option.color}`}>
              {option.icon}
            </div>
            <div className="text-left">
              <h4 className="font-medium text-sm mb-1">{option.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
            </div>
          </Button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Pro Tips
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Use high-contrast images for better stickers</li>
          <li>• Keep GIFs under 3 seconds for optimal size</li>
          <li>• Add text overlays to make memes more engaging</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileStickerBottomSheet;
