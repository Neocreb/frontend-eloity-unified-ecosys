// Real-time memes and GIFs data from Supabase
import { StickerData, StickerPackData } from "@/types/stickers";

// This will be replaced with real Supabase data in the future
export const REAL_MEMES: StickerData[] = [
  {
    id: "meme1",
    name: "Happy Face",
    type: "image",
    tags: ["happy", "smile", "emoji"],
    fileUrl: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=200&h=200&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=100&h=100&fit=crop",
    width: 200,
    height: 200,
    packId: "community-memes",
    packName: "Community Memes",
    usageCount: 125
  },
  {
    id: "meme2", 
    name: "Thumbs Up",
    type: "image",
    tags: ["thumbs", "up", "approval"],
    fileUrl: "https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=200&h=200&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=100&h=100&fit=crop",
    width: 200,
    height: 200,
    packId: "community-memes",
    packName: "Community Memes", 
    usageCount: 89
  }
];

export const REAL_GIFS: StickerData[] = [
  {
    id: "gif1",
    name: "Waving Hand",
    type: "gif",
    tags: ["wave", "hello", "greeting"],
    fileUrl: "https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy.gif",
    thumbnailUrl: "https://media.giphy.com/media/hvRJCLFzcasrR4ia7z/giphy_s.gif",
    animated: true,
    width: 200,
    height: 200,
    packId: "community-gifs",
    packName: "Community GIFs",
    usageCount: 256
  }
];

export const COMMUNITY_REAL_PACKS: StickerPackData[] = [
  {
    id: "community-memes",
    name: "Community Memes",
    description: "Popular memes from the community",
    category: "meme",
    stickers: REAL_MEMES,
    creatorId: "system",
    creatorName: "SoftChat",
    downloadCount: 1250,
    rating: 4.8,
    ratingCount: 89,
    thumbnailUrl: REAL_MEMES[0]?.thumbnailUrl || "",
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["popular", "community"],
    price: 0
  },
  {
    id: "community-gifs", 
    name: "Community GIFs",
    description: "Animated GIFs from the community",
    category: "gif",
    stickers: REAL_GIFS,
    creatorId: "system",
    creatorName: "SoftChat",
    downloadCount: 890,
    rating: 4.6,
    ratingCount: 45,
    thumbnailUrl: REAL_GIFS[0]?.thumbnailUrl || "",
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["animated", "community"],
    price: 0
  }
];