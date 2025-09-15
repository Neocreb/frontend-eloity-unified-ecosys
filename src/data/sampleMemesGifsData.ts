import { StickerData, StickerPackData } from "@/types/sticker";

// Sample meme images with placeholder data - in a real app these would be actual image URLs
export const SAMPLE_MEMES: StickerData[] = [
  {
    id: "meme_1",
    name: "Drake Pointing",
    fileUrl: "https://via.placeholder.com/300x300/FFB6C1/000000?text=Drake+Pointing",
    thumbnailUrl: "https://via.placeholder.com/150x150/FFB6C1/000000?text=Drake",
    packId: "community_memes",
    packName: "Community Memes",
    type: "meme",
    width: 300,
    height: 300,
    usageCount: 1250,
    tags: ["drake", "pointing", "popular", "choice"],
    metadata: {
      topText: "",
      bottomText: "",
      stickerType: "meme"
    }
  },
  {
    id: "meme_2", 
    name: "Distracted Boyfriend",
    fileUrl: "https://via.placeholder.com/400x300/98FB98/000000?text=Distracted+Boyfriend",
    thumbnailUrl: "https://via.placeholder.com/150x150/98FB98/000000?text=Distracted",
    packId: "community_memes",
    packName: "Community Memes", 
    type: "meme",
    width: 400,
    height: 300,
    usageCount: 980,
    tags: ["distracted", "boyfriend", "choice", "meme"],
    metadata: {
      topText: "",
      bottomText: "",
      stickerType: "meme"
    }
  },
  {
    id: "meme_3",
    name: "Woman Yelling at Cat",
    fileUrl: "https://via.placeholder.com/500x300/DDA0DD/000000?text=Woman+Yelling+Cat",
    thumbnailUrl: "https://via.placeholder.com/150x150/DDA0DD/000000?text=Yelling+Cat",
    packId: "community_memes",
    packName: "Community Memes",
    type: "meme", 
    width: 500,
    height: 300,
    usageCount: 875,
    tags: ["woman", "cat", "yelling", "table", "argument"],
    metadata: {
      topText: "",
      bottomText: "",
      stickerType: "meme"
    }
  },
  {
    id: "meme_4",
    name: "This is Fine",
    fileUrl: "https://via.placeholder.com/400x400/F0E68C/000000?text=This+is+Fine",
    thumbnailUrl: "https://via.placeholder.com/150x150/F0E68C/000000?text=Fine",
    packId: "community_memes",
    packName: "Community Memes",
    type: "meme",
    width: 400,
    height: 400,
    usageCount: 756,
    tags: ["fine", "fire", "dog", "calm", "disaster"],
    metadata: {
      topText: "",
      bottomText: "",
      stickerType: "meme"
    }
  },
  {
    id: "meme_5",
    name: "Expanding Brain",
    fileUrl: "https://via.placeholder.com/300x600/ADD8E6/000000?text=Expanding+Brain",
    thumbnailUrl: "https://via.placeholder.com/150x150/ADD8E6/000000?text=Brain",
    packId: "community_memes",
    packName: "Community Memes",
    type: "meme",
    width: 300,
    height: 600,
    usageCount: 643,
    tags: ["brain", "expanding", "smart", "levels", "evolution"],
    metadata: {
      topText: "",
      bottomText: "",
      stickerType: "meme"
    }
  }
];

// Sample GIF data - in a real app these would be actual GIF URLs
export const SAMPLE_GIFS: StickerData[] = [
  {
    id: "gif_1",
    name: "Dancing Cat",
    fileUrl: "https://via.placeholder.com/300x300/FFE4E1/000000?text=Dancing+Cat+GIF",
    thumbnailUrl: "https://via.placeholder.com/150x150/FFE4E1/000000?text=Cat",
    packId: "community_gifs",
    packName: "Community GIFs",
    type: "gif",
    width: 300,
    height: 300,
    usageCount: 2150,
    tags: ["cat", "dancing", "happy", "animated", "cute"],
    animated: true,
    metadata: {
      duration: 2.5,
      stickerType: "gif"
    }
  },
  {
    id: "gif_2",
    name: "Thumbs Up",
    fileUrl: "https://via.placeholder.com/250x250/E6E6FA/000000?text=Thumbs+Up+GIF",
    thumbnailUrl: "https://via.placeholder.com/150x150/E6E6FA/000000?text=Thumbs",
    packId: "community_gifs",
    packName: "Community GIFs",
    type: "gif",
    width: 250,
    height: 250,
    usageCount: 1890,
    tags: ["thumbs", "up", "approval", "good", "animated"],
    animated: true,
    metadata: {
      duration: 1.8,
      stickerType: "gif"
    }
  },
  {
    id: "gif_3",
    name: "Applause",
    fileUrl: "https://via.placeholder.com/350x250/F5DEB3/000000?text=Applause+GIF", 
    thumbnailUrl: "https://via.placeholder.com/150x150/F5DEB3/000000?text=Clap",
    packId: "community_gifs",
    packName: "Community GIFs",
    type: "gif",
    width: 350,
    height: 250,
    usageCount: 1456,
    tags: ["applause", "clapping", "celebration", "hands", "animated"],
    animated: true,
    metadata: {
      duration: 3.0,
      stickerType: "gif"
    }
  },
  {
    id: "gif_4",
    name: "Heart Eyes",
    fileUrl: "https://via.placeholder.com/280x280/FFB6C1/000000?text=Heart+Eyes+GIF",
    thumbnailUrl: "https://via.placeholder.com/150x150/FFB6C1/000000?text=Hearts",
    packId: "community_gifs", 
    packName: "Community GIFs",
    type: "gif",
    width: 280,
    height: 280,
    usageCount: 1234,
    tags: ["heart", "eyes", "love", "emoji", "animated"],
    animated: true,
    metadata: {
      duration: 2.2,
      stickerType: "gif"
    }
  },
  {
    id: "gif_5",
    name: "Laughing Emoji",
    fileUrl: "https://via.placeholder.com/300x300/98FB98/000000?text=Laughing+GIF",
    thumbnailUrl: "https://via.placeholder.com/150x150/98FB98/000000?text=LOL",
    packId: "community_gifs",
    packName: "Community GIFs", 
    type: "gif",
    width: 300,
    height: 300,
    usageCount: 1876,
    tags: ["laughing", "lol", "funny", "emoji", "animated"],
    animated: true,
    metadata: {
      duration: 1.5,
      stickerType: "gif"
    }
  },
  {
    id: "gif_6",
    name: "Waving Hand",
    fileUrl: "https://via.placeholder.com/250x250/DDA0DD/000000?text=Wave+GIF",
    thumbnailUrl: "https://via.placeholder.com/150x150/DDA0DD/000000?text=Wave",
    packId: "community_gifs",
    packName: "Community GIFs",
    type: "gif", 
    width: 250,
    height: 250,
    usageCount: 1098,
    tags: ["wave", "hand", "hello", "goodbye", "animated"],
    animated: true,
    metadata: {
      duration: 2.0,
      stickerType: "gif"
    }
  }
];

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
