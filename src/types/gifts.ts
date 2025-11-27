export interface VirtualGift {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  price: number;
  currency: string;
  category: string;
  rarity: string;
  animation: string | null;
  sound: string | null;
  effects: Record<string, any> | null;
  available: boolean;
  seasonal_start: string | null;
  seasonal_end: string | null;
  created_at: string;
  updated_at: string;
  popularity?: number;
}

export interface GiftTransaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  gift_id: string;
  quantity: number;
  total_amount: number;
  message: string | null;
  is_anonymous: boolean;
  status: string;
  content_id: string | null;
  created_at: string;
  updated_at: string;
  // Added for joined profile data
  sender?: {
    username: string;
    avatar_url: string;
  };
  receiver?: {
    username: string;
    avatar_url: string;
  };
}

export interface TipTransaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: string;
  message: string | null;
  content_id: string | null;
  is_anonymous: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  // Added for joined profile data
  sender?: {
    username: string;
    avatar_url: string;
  };
  receiver?: {
    username: string;
    avatar_url: string;
  };
}