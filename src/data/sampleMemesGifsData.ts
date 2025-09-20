import { StickerData, StickerPackData } from "@/types/sticker";

// Sample meme images with placeholder data - in a real app these would be actual image URLs
export const SAMPLE_MEMES: any[] = [];
export const SAMPLE_GIFS: any[] = [];

// Following project specification: Log warning about mock data usage
console.warn('Using temporary mock data for memes/gifs - API integration needed');

// Community packs that include both memes and GIFs
export const COMMUNITY_MEME_GIF_PACKS: StickerPackData[] = [
  {
    id: "community_memes",
    name: "Community Memes",
    description: "Popular memes shared by the community",
    creatorId: "system",
    creatorName: "Softchat Community",
    isPublic: true,
    isPremium: false,
    isOfficial: true,
    downloadCount: 15750,
    rating: 4.8,
    ratingCount: 2340,
    tags: ["memes", "community", "popular", "funny"],
    category: "memes",
    stickers: SAMPLE_MEMES,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailUrl: SAMPLE_MEMES[0]?.thumbnailUrl || "",
    price: 0,
    isCustom: false
  },
  {
    id: "community_gifs", 
    name: "Community GIFs",
    description: "Animated GIFs shared by the community",
    creatorId: "system",
    creatorName: "Softchat Community",
    isPublic: true,
    isPremium: false,
    isOfficial: true,
    downloadCount: 12890,
    rating: 4.7,
    ratingCount: 1980,
    tags: ["gifs", "animated", "community", "reactions"],
    category: "gifs",
    stickers: SAMPLE_GIFS,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnailUrl: SAMPLE_GIFS[0]?.thumbnailUrl || "",
    price: 0,
    isCustom: false
  }
];
