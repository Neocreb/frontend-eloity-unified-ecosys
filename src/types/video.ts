export interface Video {
  id: string;
  url: string;
  thumbnail: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  isFollowing: boolean;
  duration?: number;
  timestamp?: string;
  tags?: string[];
  category?: string;
  allowDuets?: boolean;
  allowComments?: boolean;
  hasCaption?: boolean;
  isLiveStream?: boolean;
}

export type VideoItem = {
  id: string;
  url: string;
  thumbnail: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  isFollowing: boolean;
  duration?: number;
  timestamp?: string;
  tags?: string[];
  category?: string;
  allowDuets?: boolean;
  allowComments?: boolean;
  hasCaption?: boolean;
  isLiveStream?: boolean;
};

export type AdData = {
  id: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  url: string;
  sponsor: string;
};

export type AdItem = {
  isAd: true;
  ad: AdData;
};

export type ContentItem = VideoItem | AdItem;