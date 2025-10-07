// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from "react";
import { StickerData } from "@/types/sticker";
import { useToast } from "@/components/ui/use-toast";

interface UserCollections {
  memes: StickerData[];
  gifs: StickerData[];
  stickers: StickerData[];
}

interface UserCollectionsContextType {
  collections: UserCollections;
  saveToCollection: (media: Omit<StickerData, "id">, collection: "memes" | "gifs" | "stickers") => string;
  removeFromCollection: (mediaId: string, collection: "memes" | "gifs" | "stickers") => void;
  isInCollection: (mediaUrl: string, collection: "memes" | "gifs" | "stickers") => boolean;
  getMediaById: (mediaId: string) => StickerData | null;
  clearCollection: (collection: "memes" | "gifs" | "stickers") => void;
  importCollection: (items: StickerData[], collection: "memes" | "gifs" | "stickers") => void;
}

const UserCollectionsContext = createContext<UserCollectionsContextType | null>(null);

export const useUserCollections = () => {
  const context = useContext(UserCollectionsContext);
  if (!context) {
    throw new Error("useUserCollections must be used within UserCollectionsProvider");
  }
  return context;
};

interface UserCollectionsProviderProps {
  children: React.ReactNode;
}

export const UserCollectionsProvider: React.FC<UserCollectionsProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [collections, setCollections] = useState<UserCollections>({
    memes: [],
    gifs: [],
    stickers: [],
  });

  // Load collections from localStorage on mount
  useEffect(() => {
    try {
      const savedCollections = localStorage.getItem("userCollections");
      if (savedCollections) {
        const parsed = JSON.parse(savedCollections);
        setCollections({
          memes: parsed.memes || [],
          gifs: parsed.gifs || [],
          stickers: parsed.stickers || [],
        });
      }
    } catch (error) {
      console.error("Error loading collections:", error);
    }
  }, []);

  // Save collections to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("userCollections", JSON.stringify(collections));
    } catch (error) {
      console.error("Error saving collections:", error);
    }
  }, [collections]);

  const saveToCollection = (media: Omit<StickerData, "id">, collection: "memes" | "gifs" | "stickers"): string => {
    const id = `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newItem: StickerData = {
      ...media,
      id,
      packId: `user_${collection}`,
      packName: `My ${collection.charAt(0).toUpperCase() + collection.slice(1)}`,
      usageCount: 0,
      tags: [...(media.tags || []), "user-generated", collection],
    };

    setCollections(prev => ({
      ...prev,
      [collection]: [newItem, ...prev[collection]],
    }));

    return id;
  };

  const removeFromCollection = (mediaId: string, collection: "memes" | "gifs" | "stickers") => {
    setCollections(prev => ({
      ...prev,
      [collection]: prev[collection].filter(item => item.id !== mediaId),
    }));
  };

  const isInCollection = (mediaUrl: string, collection: "memes" | "gifs" | "stickers"): boolean => {
    return collections[collection].some(item => item.fileUrl === mediaUrl);
  };

  const getMediaById = (mediaId: string): StickerData | null => {
    for (const collection of Object.values(collections)) {
      const found = collection.find(item => item.id === mediaId);
      if (found) return found;
    }
    return null;
  };

  const clearCollection = (collection: "memes" | "gifs" | "stickers") => {
    setCollections(prev => ({
      ...prev,
      [collection]: [],
    }));
    
    toast({
      title: "Collection cleared",
      description: `All ${collection} have been removed from your collection`,
    });
  };

  const importCollection = (items: StickerData[], collection: "memes" | "gifs" | "stickers") => {
    const processedItems = items.map(item => ({
      ...item,
      id: item.id || `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      packId: `user_${collection}`,
      packName: `My ${collection.charAt(0).toUpperCase() + collection.slice(1)}`,
      tags: [...(item.tags || []), "user-generated", collection],
    }));

    setCollections(prev => ({
      ...prev,
      [collection]: [...processedItems, ...prev[collection]],
    }));

    toast({
      title: "Collection imported",
      description: `${items.length} items added to your ${collection}`,
    });
  };

  const contextValue: UserCollectionsContextType = {
    collections,
    saveToCollection,
    removeFromCollection,
    isInCollection,
    getMediaById,
    clearCollection,
    importCollection,
  };

  return (
    <UserCollectionsContext.Provider value={contextValue}>
      {children}
    </UserCollectionsContext.Provider>
  );
};

export default UserCollectionsProvider;
