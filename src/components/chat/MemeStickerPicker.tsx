import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Smile,
  Heart,
  ThumbsUp,
  Coffee,
  Briefcase,
  Gamepad2,
  Sparkles,
  Star,
  Download,
  Plus,
  Search,
  Clock,
  MoreVertical,
  Trash2,
  Flag,
  Share,
  Bookmark,
  BookmarkCheck,
  Upload,
  Grid3X3,
  List,
  Filter,
  TrendingUp,
  Crown,
  Users,
  Zap,
  Camera,
  Image as ImageIcon,
  Palette,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  StickerData,
  StickerPackData,
  StickerCategory,
  StickerPickerTab,
  UserStickerLibrary,
  EMOJI_STICKER_PACKS
} from "@/types/sticker";
import { EnhancedMediaCreationPanel } from "./EnhancedMediaCreationPanel";
import { useUserCollections } from "@/contexts/UserCollectionsContext";

// Placeholder for community content - will be fetched from Supabase
const SAMPLE_MEMES: any[] = [];
const SAMPLE_GIFS: any[] = [];

interface MemeStickerPickerProps {
  onStickerSelect: (sticker: StickerData) => void;
  onClose?: () => void;
  className?: string;
  isMobile?: boolean;
}

// Sticker picker tabs configuration - focused on Memes, GIFs, Create
const STICKER_TABS: StickerPickerTab[] = [
  { id: "memes", name: "Memes", icon: <Zap className="w-4 h-4" /> },
  { id: "gifs", name: "GIFs", icon: <Camera className="w-4 h-4" /> },
  { id: "add_new", name: "Create", icon: <Plus className="w-4 h-4" /> },
];

export const MemeStickerPicker: React.FC<MemeStickerPickerProps> = ({
  onStickerSelect,
  onClose,
  className,
  isMobile = false,
}) => {
  const { toast } = useToast();
  const { collections, saveToCollection, removeFromCollection } = useUserCollections();
  const [activeTab, setActiveTab] = useState<string>("memes");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPack, setSelectedPack] = useState<StickerPackData | null>(null);
  
  // Create unified packs that combine user collections with community content
  const unifiedMemePack: StickerPackData = {
    id: "memes",
    name: "Memes",
    description: `All memes (${collections.memes.length + SAMPLE_MEMES.length})`,
    category: "memes" as StickerCategory,
    // User memes first, then community memes
    stickers: [...collections.memes, ...SAMPLE_MEMES],
    creatorId: "unified",
    creatorName: "Community",
    downloadCount: 0,
    rating: 5.0,
    ratingCount: 0,
    isPublic: true,
    isPremium: false,
    isOfficial: false,
    tags: ["memes", "community", "unified"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const unifiedGifPack: StickerPackData = {
    id: "gifs",
    name: "GIFs",
    description: `All GIFs (${collections.gifs.length + SAMPLE_GIFS.length})`,
    category: "gifs" as StickerCategory,
    // User GIFs first, then community GIFs
    stickers: [...collections.gifs, ...SAMPLE_GIFS],
    creatorId: "unified",
    creatorName: "Community",
    downloadCount: 0,
    rating: 5.0,
    ratingCount: 0,
    isPublic: true,
    isPremium: false,
    isOfficial: false,
    tags: ["gifs", "animated", "community", "unified"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const userCollectionPacks: StickerPackData[] = [unifiedMemePack, unifiedGifPack];

  const [userLibrary, setUserLibrary] = useState<UserStickerLibrary>({
    recentStickers: [],
    favoriteStickers: [],
    downloadedPacks: userCollectionPacks,
    customPacks: [],
  });

  const [availablePacks, setAvailablePacks] = useState<StickerPackData[]>(userCollectionPacks);
  const [trendingPacks, setTrendingPacks] = useState<StickerPackData[]>([]);

  // Update packs when collections change to maintain unified view
  React.useEffect(() => {
    const updatedUnifiedMemePack: StickerPackData = {
      id: "memes",
      name: "Memes",
      description: `All memes (${collections.memes.length + SAMPLE_MEMES.length})`,
      category: "memes" as StickerCategory,
      // User memes first, then community memes
      stickers: [...collections.memes, ...SAMPLE_MEMES],
      creatorId: "unified",
      creatorName: "Community",
      downloadCount: 0,
      rating: 5.0,
      ratingCount: 0,
      isPublic: true,
      isPremium: false,
      isOfficial: false,
      tags: ["memes", "community", "unified"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedUnifiedGifPack: StickerPackData = {
      id: "gifs",
      name: "GIFs",
      description: `All GIFs (${collections.gifs.length + SAMPLE_GIFS.length})`,
      category: "gifs" as StickerCategory,
      // User GIFs first, then community GIFs
      stickers: [...collections.gifs, ...SAMPLE_GIFS],
      creatorId: "unified",
      creatorName: "Community",
      downloadCount: 0,
      rating: 5.0,
      ratingCount: 0,
      isPublic: true,
      isPremium: false,
      isOfficial: false,
      tags: ["gifs", "animated", "community", "unified"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPacks = [updatedUnifiedMemePack, updatedUnifiedGifPack];

    setAvailablePacks(updatedPacks);
    setUserLibrary(prev => ({
      ...prev,
      downloadedPacks: updatedPacks,
    }));
  }, [collections]);

  // Filter stickers based on search query
  const filteredStickers = useMemo(() => {
    if (activeTab === "create") return [];

    const pack = availablePacks.find(p => p.id === activeTab);
    if (!pack) return [];

    return pack.stickers.filter(sticker =>
      searchQuery === "" ||
      sticker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sticker.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeTab, searchQuery, availablePacks]);

  const handleStickerClick = (sticker: StickerData) => {
    onStickerSelect(sticker);
    
    // Add to recent stickers
    setUserLibrary(prev => ({
      ...prev,
      recentStickers: [
        sticker,
        ...prev.recentStickers.filter(s => s.id !== sticker.id).slice(0, 19)
      ]
    }));
    
    toast({
      title: "Sticker sent!",
      description: `Sent ${sticker.name} sticker`,
    });
  };

  const handleToggleFavorite = (sticker: StickerData, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setUserLibrary(prev => {
      const isFavorite = prev.favoriteStickers.some(s => s.id === sticker.id);
      
      return {
        ...prev,
        favoriteStickers: isFavorite
          ? prev.favoriteStickers.filter(s => s.id !== sticker.id)
          : [...prev.favoriteStickers, sticker]
      };
    });
    
    toast({
      title: userLibrary.favoriteStickers.some(s => s.id === sticker.id) 
        ? "Removed from favorites" 
        : "Added to favorites",
      description: sticker.name,
    });
  };

  const handleDownloadPack = (pack: StickerPackData) => {
    setUserLibrary(prev => ({
      ...prev,
      downloadedPacks: [...prev.downloadedPacks, pack]
    }));
    
    toast({
      title: "Pack downloaded!",
      description: `${pack.name} pack is now available in your library`,
    });
  };

  const handleReportSticker = (sticker: StickerData) => {
    toast({
      title: "Sticker reported",
      description: "Thank you for helping keep our community safe",
    });
  };

  const handleShareSticker = (sticker: StickerData) => {
    toast({
      title: "Share feature",
      description: "Sticker sharing coming soon!",
    });
  };

  const renderStickerGrid = (stickers: StickerData[]) => {
    if (stickers.length === 0) {
      return (
        <div className={cn(
          "flex flex-col items-center justify-center text-muted-foreground text-center",
          isMobile ? "h-24 px-2" : "h-48"
        )}>
          <Sparkles className={cn("mb-2 opacity-50", isMobile ? "w-6 h-6" : "w-12 h-12")} />
          <p className={cn("font-medium", isMobile ? "text-xs" : "text-lg")}>No {activeTab} found</p>
          <p className={cn(isMobile ? "text-[10px] mt-0.5" : "text-sm")}>
            {searchQuery ? "Try a different search" : `Create your own ${activeTab} using the Create tab!`}
          </p>
        </div>
      );
    }

    return (
      <div className={cn(
        "grid",
        viewMode === "grid"
          ? (isMobile ? "grid-cols-3 gap-3" : "grid-cols-4 gap-3")
          : "grid-cols-1 gap-2"
      )}>
        {stickers.map((sticker) => (
          <StickerCard
            key={sticker.id}
            sticker={sticker}
            viewMode={viewMode}
            isMobile={isMobile}
            isFavorite={userLibrary.favoriteStickers.some(s => s.id === sticker.id)}
            onClick={() => handleStickerClick(sticker)}
            onToggleFavorite={(e) => handleToggleFavorite(sticker, e)}
            onReport={() => handleReportSticker(sticker)}
            onShare={() => handleShareSticker(sticker)}
          />
        ))}
      </div>
    );
  };

  const renderPackGrid = (packs: StickerPackData[]) => {
    return (
      <div className={cn(
        "grid",
        isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"
      )}>
        {packs.map((pack) => (
          <StickerPackCard
            key={pack.id}
            pack={pack}
            isMobile={isMobile}
            isDownloaded={userLibrary.downloadedPacks.some(p => p.id === pack.id)}
            onDownload={() => handleDownloadPack(pack)}
            onView={() => setSelectedPack(pack)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg",
      isMobile
        ? "w-full h-[65vh] max-h-[420px] flex flex-col mx-2"
        : "w-96 h-[500px] flex flex-col",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "border-b border-gray-200 dark:border-gray-700 flex-shrink-0",
        isMobile ? "p-2" : "p-3 md:p-4"
      )}>
        <div className={cn(
          "flex items-center justify-between",
          isMobile ? "mb-2" : "mb-3"
        )}>
          <h3 className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>Stickers</h3>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="h-8 w-8"
              >
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={cn(isMobile ? "h-9 w-9" : "h-8 w-8")}
              >
                ×
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={cn(
            "absolute left-3 text-muted-foreground",
            isMobile ? "top-2 h-4 w-4" : "top-2.5 h-4 w-4"
          )} />
          <Input
            placeholder={isMobile ? "Search..." : "Search stickers..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("pl-10", isMobile ? "h-8 text-sm" : "h-9")}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        <div className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <ScrollArea className="w-full">
            <TabsList className={cn(
              "inline-flex h-auto bg-transparent w-full",
              isMobile ? "p-0.5 justify-start" : "p-1 justify-start"
            )}>
              {STICKER_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "flex items-center gap-1 text-xs rounded-lg transition-all whitespace-nowrap",
                    "data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900",
                    "data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300",
                    isMobile ? "min-w-[38px] px-1 py-1.5 flex-col gap-0.5" : "px-2 py-2 flex-row gap-2"
                  )}
                >
                  <span className={isMobile ? "text-xs" : ""}>{tab.icon}</span>
                  <span className={cn(
                    isMobile ? "text-[9px] leading-none" : "text-xs",
                    isMobile && tab.name.length > 5 ? "hidden" : ""
                  )}>
                    {isMobile ? tab.name.slice(0, 3) : tab.name}
                  </span>
                  {tab.count && tab.count > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-3 min-w-[12px]">
                      {tab.count > 9 ? "9+" : tab.count}
                    </Badge>
                  )}
                  {tab.premium && (
                    <Crown className="w-2.5 h-2.5 text-yellow-500" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ScrollArea className="h-full">
            <div className={cn(
              isMobile ? "p-2 pb-4" : "p-3 md:p-4"
            )}>
              {/* Memes */}
              <TabsContent value="memes" className="mt-0">
                {renderStickerGrid(filteredStickers)}
              </TabsContent>

              {/* GIFs */}
              <TabsContent value="gifs" className="mt-0">
                {renderStickerGrid(filteredStickers)}
              </TabsContent>

              {/* Create New */}
              <TabsContent value="create" className="mt-0">
                <EnhancedMediaCreationPanel
                  isMobile={isMobile}
                  saveToCollectionFirst={true}
                  onMediaSaved={(mediaId, collection) => {
                    toast({
                      title: "Media saved!",
                      description: `Your ${collection.slice(0, -1)} has been saved to your collection and is now available in the ${collection.charAt(0).toUpperCase() + collection.slice(1)} tab`,
                    });
                    // Switch to the appropriate tab to show the saved media
                    if (collection === "memes") {
                      setActiveTab("memes");
                    } else if (collection === "gifs") {
                      setActiveTab("gifs");
                    }
                  }}
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </div>
      </Tabs>

      {/* Pack Detail Dialog */}
      {selectedPack && (
        <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedPack.name}</DialogTitle>
              <DialogDescription>{selectedPack.description}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {selectedPack.stickers.map((sticker) => (
                <Button
                  key={sticker.id}
                  variant="ghost"
                  className="h-12 w-12 p-0 text-2xl"
                  onClick={() => {
                    handleStickerClick(sticker);
                    setSelectedPack(null);
                  }}
                >
                  {sticker.emoji}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Pack Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className={cn("max-w-md", isMobile && "w-[95vw] max-h-[90vh] overflow-y-auto")}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Create Sticker Pack
            </DialogTitle>
            <DialogDescription>
              Create your own custom sticker pack by uploading images or using AI generation
            </DialogDescription>
          </DialogHeader>
          <StickerPackCreationDialog
            isMobile={isMobile}
            onClose={() => setShowCreateDialog(false)}
            onPackCreated={(pack) => {
              // Add the new pack to user's custom packs
              setUserLibrary(prev => ({
                ...prev,
                customPacks: [...prev.customPacks, pack]
              }));
              setShowCreateDialog(false);
              toast({
                title: "Pack created!",
                description: `${pack.name} has been added to your collection`,
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Individual sticker card component
interface StickerCardProps {
  sticker: StickerData;
  viewMode: "grid" | "list";
  isMobile: boolean;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onReport: () => void;
  onShare: () => void;
}

const StickerCard: React.FC<StickerCardProps> = ({
  sticker,
  viewMode,
  isMobile,
  isFavorite,
  onClick,
  onToggleFavorite,
  onReport,
  onShare,
}) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    if (isMobile) {
      longPressTimer.current = setTimeout(() => {
        setIsLongPress(true);
        onToggleFavorite(new MouseEvent('click') as any);
      }, 500); // 500ms long press
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isLongPress) {
      onClick();
    }
    setIsLongPress(false);
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPress(false);
  };
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group">
        <div className="text-2xl" onClick={onClick}>
          {sticker.emoji}
        </div>
        <div className="flex-1 min-w-0" onClick={onClick}>
          <p className="font-medium truncate">{sticker.name}</p>
          <p className="text-xs text-muted-foreground">
            Used {sticker.usageCount} times
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleFavorite}
          >
            {isFavorite ? 
              <BookmarkCheck className="w-4 h-4 text-red-500" /> : 
              <Bookmark className="w-4 h-4" />
            }
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onReport} className="text-destructive">
                <Flag className="w-4 h-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        className={cn(
          "p-1 hover:bg-muted/70 rounded-lg transition-all duration-200 relative touch-manipulation",
          isMobile
            ? "h-20 w-full min-h-[80px] active:scale-95"
            : "h-24 w-full hover:scale-105 active:scale-95"
        )}
        onClick={isMobile ? undefined : onClick}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        onMouseLeave={handleMouseLeave}
      >
        {sticker.type === "image" || sticker.type === "gif" || sticker.type === "meme" ? (
          <div className="relative w-full h-full">
            <img
              src={sticker.thumbnailUrl || sticker.fileUrl}
              alt={sticker.name}
              className="w-full h-full object-cover rounded-md"
              loading="lazy"
            />
            {(sticker.animated || sticker.type === "gif") && (
              <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                GIF
              </div>
            )}
            {sticker.type === "meme" && !sticker.animated && (
              <div className="absolute bottom-1 left-1 bg-purple-600/80 text-white text-xs px-1 py-0.5 rounded">
                MEME
              </div>
            )}
            {/* Show if this is user-created content */}
            {sticker.tags?.includes("user-generated") && (
              <div className="absolute top-1 left-1 bg-blue-600/80 text-white text-xs px-1 py-0.5 rounded">
                YOURS
              </div>
            )}
          </div>
        ) : (
          <span className={cn(isMobile ? "text-2xl" : "text-4xl")}>
            {sticker.emoji}
          </span>
        )}

        {/* Animated indicator */}
        {sticker.type === "animated" && (
          <div className={cn(
            "absolute top-0 right-0 bg-blue-500 rounded-full animate-pulse",
            isMobile ? "w-1.5 h-1.5" : "w-2 h-2"
          )}></div>
        )}
      </Button>

      {/* Hover/Touch actions - better positioning for mobile */}
      {!isMobile && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 rounded-full shadow-md"
            onClick={onToggleFavorite}
          >
            {isFavorite ?
              <Heart className="w-3 h-3 text-red-500 fill-current" /> :
              <Heart className="w-3 h-3" />
            }
          </Button>
        </div>
      )}

      {/* Mobile: Show favorite status as small indicator */}
      {isMobile && isFavorite && (
        <div className="absolute -top-0.5 -right-0.5">
          <Heart className="w-2.5 h-2.5 text-red-500 fill-current" />
        </div>
      )}

      {/* Tooltip - only on desktop */}
      {!isMobile && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {sticker.name}
        </div>
      )}
    </div>
  );
};

// Sticker pack card component
interface StickerPackCardProps {
  pack: StickerPackData;
  isMobile: boolean;
  isDownloaded: boolean;
  onDownload: () => void;
  onView: () => void;
}

const StickerPackCard: React.FC<StickerPackCardProps> = ({
  pack,
  isMobile,
  isDownloaded,
  onDownload,
  onView,
}) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm flex items-center gap-2">
              {pack.name}
              {pack.isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
              {pack.isOfficial && <Badge variant="secondary" className="text-xs">Official</Badge>}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {pack.stickers.length} stickers
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span className="text-xs">{pack.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-4 gap-1 mb-3">
          {pack.stickers.slice(0, 4).map((sticker) => (
            <div key={sticker.id} className="text-lg text-center">
              {sticker.emoji}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onView} className="flex-1">
            View
          </Button>
          {!isDownloaded && (
            <Button size="sm" onClick={onDownload} className="flex-1">
              <Download className="w-3 h-3 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Sticker pack creation dialog component
interface StickerPackCreationDialogProps {
  isMobile: boolean;
  onClose: () => void;
  onPackCreated: (pack: StickerPackData) => void;
}

const StickerPackCreationDialog: React.FC<StickerPackCreationDialogProps> = ({
  isMobile,
  onClose,
  onPackCreated,
}) => {
  const { toast } = useToast();
  const [packName, setPackName] = useState("");
  const [packDescription, setPackDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [creationMethod, setCreationMethod] = useState<"upload" | "camera" | "ai">("upload");
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      if (selectedImages.length + files.length > 20) {
        toast({
          title: "Too many images",
          description: "A sticker pack can have maximum 20 stickers",
          variant: "destructive",
        });
        return;
      }
      setSelectedImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePack = async () => {
    if (!packName.trim()) {
      toast({
        title: "Pack name required",
        description: "Please enter a name for your sticker pack",
        variant: "destructive",
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "No stickers added",
        description: "Please add at least one sticker to create a pack",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // In a real app, you would upload images to your backend/storage
      // For demo purposes, we'll create a mock pack with data URLs
      const stickers: StickerData[] = await Promise.all(
        selectedImages.map(async (file, index) => {
          const reader = new FileReader();
          return new Promise<StickerData>((resolve) => {
            reader.onload = (e) => {
              resolve({
                id: `custom_${Date.now()}_${index}`,
                name: file.name.replace(/\.[^/.]+$/, ""),
                emoji: "", // No emoji for custom image stickers
                fileUrl: e.target?.result as string,
                thumbnailUrl: e.target?.result as string,
                type: "image",
                tags: ["custom", "user-generated"],
                usageCount: 0,
                packId: `pack_${Date.now()}`,
                packName: packName,
                width: 512,
                height: 512,
                animated: false,
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const newPack: StickerPackData = {
        id: `pack_${Date.now()}`,
        name: packName,
        description: packDescription || `Custom pack with ${stickers.length} stickers`,
        category: "custom" as StickerCategory,
        stickers,
        creatorId: "current_user", // Would be actual user ID
        creatorName: "You",
        downloadCount: 0,
        rating: 5,
        isOfficial: false,
        isPremium: false,
        isPublic: true,
        tags: ["custom", "user-generated"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ratingCount: 0,
      };

      onPackCreated(newPack);
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Failed to create sticker pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Pack Details */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Pack Name</label>
          <Input
            placeholder="Enter pack name..."
            value={packName}
            onChange={(e) => setPackName(e.target.value)}
            maxLength={50}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Description (Optional)</label>
          <Input
            placeholder="Describe your sticker pack..."
            value={packDescription}
            onChange={(e) => setPackDescription(e.target.value)}
            maxLength={200}
          />
        </div>
      </div>

      {/* Creation Method */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Creation Method</label>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant={creationMethod === "upload" ? "default" : "outline"}
            onClick={() => setCreationMethod("upload")}
            className="justify-start h-auto p-3"
          >
            <Upload className="w-4 h-4 mr-2" />
            <div className="text-left">
              <p className="font-medium text-sm">Upload Images</p>
              <p className="text-xs text-muted-foreground">Select images from your device</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => setCreationMethod("camera")}
            className="justify-start h-auto p-3"
          >
            <Camera className="w-4 h-4 mr-2" />
            <div className="text-left">
              <p className="font-medium text-sm">Take Photos</p>
              <p className="text-xs text-muted-foreground">Capture and create instantly</p>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => setCreationMethod("upload")}
            className="justify-start h-auto p-3"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <div className="text-left">
              <p className="font-medium text-sm">Create GIF</p>
              <p className="text-xs text-muted-foreground">Convert videos to animated stickers</p>
            </div>
          </Button>
        </div>
      </div>

      {/* File Upload */}
      {creationMethod === "upload" && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-auto p-4 border-dashed"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Choose Images</p>
                <p className="text-xs text-muted-foreground">
                  Select up to 20 images (PNG, JPG, GIF)
                </p>
              </div>
            </div>
          </Button>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Selected Images ({selectedImages.length}/20)
              </p>
              <div className={cn(
                "grid gap-2",
                isMobile ? "grid-cols-3" : "grid-cols-4"
              )}>
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleCreatePack}
          disabled={isCreating || !packName.trim() || selectedImages.length === 0}
          className="flex-1"
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Pack
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Sticker creation panel component
interface StickerCreationPanelProps {
  isMobile: boolean;
  onCreatePack: () => void;
}

const StickerCreationPanel: React.FC<StickerCreationPanelProps> = ({
  isMobile,
  onCreatePack,
}) => {
  return (
    <div className={cn("space-y-4", isMobile && "px-2")}>
      <div className="text-center">
        <Palette className={cn("mx-auto mb-4 text-primary", isMobile ? "w-8 h-8" : "w-12 h-12")} />
        <h3 className={cn("font-semibold mb-2", isMobile ? "text-base" : "text-lg")}>
          Create Your Own Stickers
        </h3>
        <p className={cn("text-muted-foreground mb-6", isMobile ? "text-xs" : "text-sm")}>
          Turn your images into stickers and share them with the world
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={onCreatePack}
          className={cn("justify-start h-auto", isMobile ? "p-3" : "p-4")}
        >
          <div className="flex items-center gap-3">
            <Upload className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
            <div className="text-left">
              <p className={cn("font-medium", isMobile ? "text-sm" : "")}>Upload Images</p>
              <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
                Create a pack from your photos
              </p>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className={cn("justify-start h-auto", isMobile ? "p-3" : "p-4")}
        >
          <div className="flex items-center gap-3">
            <Camera className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
            <div className="text-left">
              <p className={cn("font-medium", isMobile ? "text-sm" : "")}>Take Photos</p>
              <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
                Use camera to create stickers
              </p>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className={cn("justify-start h-auto", isMobile ? "p-3" : "p-4")}
        >
          <div className="flex items-center gap-3">
            <ImageIcon className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
            <div className="text-left">
              <p className={cn("font-medium", isMobile ? "text-sm" : "")}>AI Generator</p>
              <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
                Generate with AI (Coming Soon)
              </p>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default MemeStickerPicker;
