// Mock data for videos and ads
import { VideoItem, AdItem } from "@/types/video";

export const mockVideos: VideoItem[] = [
  {
    id: "video-1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://picsum.photos/400/600?random=1",
    title: "Amazing Nature Documentary",
    description: "Explore the wonders of nature in this breathtaking documentary.",
    user: {
      id: "user-1",
      name: "Nature Explorer",
      avatar: "https://i.pravatar.cc/150?img=10",
      username: "natureexplorer",
      verified: true
    },
    stats: {
      likes: 15420,
      comments: 892,
      shares: 245,
      views: 89321
    },
    duration: 180,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    tags: ["nature", "documentary", "wildlife"],
    isLiked: false,
    isFollowing: false
  },
  {
    id: "video-2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://picsum.photos/400/600?random=2",
    title: "Creative Animation Short",
    description: "A stunning piece of creative animation that pushes boundaries.",
    user: {
      id: "user-2",
      name: "Creative Studio",
      avatar: "https://i.pravatar.cc/150?img=11",
      username: "creativestudio",
      verified: false
    },
    stats: {
      likes: 8934,
      comments: 567,
      shares: 123,
      views: 45678
    },
    duration: 145,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    tags: ["animation", "creative", "art"],
    isLiked: true,
    isFollowing: true
  },
  {
    id: "video-3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail: "https://picsum.photos/400/600?random=3",
    title: "Epic Adventure Story",
    description: "Join our hero on an epic journey through magical lands.",
    user: {
      id: "user-3",
      name: "Adventure Films",
      avatar: "https://i.pravatar.cc/150?img=12",
      username: "adventurefilms",
      verified: true
    },
    stats: {
      likes: 23456,
      comments: 1234,
      shares: 456,
      views: 123456
    },
    duration: 200,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    tags: ["adventure", "story", "fantasy"],
    isLiked: false,
    isFollowing: false
  },
  {
    id: "video-4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnail: "https://picsum.photos/400/600?random=4",
    title: "Sci-Fi Thriller",
    description: "A gripping sci-fi thriller that will keep you on the edge of your seat.",
    user: {
      id: "user-4",
      name: "Sci-Fi Studios",
      avatar: "https://i.pravatar.cc/150?img=13",
      username: "scifistudios",
      verified: true
    },
    stats: {
      likes: 18765,
      comments: 987,
      shares: 321,
      views: 87654
    },
    duration: 175,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    tags: ["scifi", "thriller", "action"],
    isLiked: true,
    isFollowing: false
  },
  {
    id: "video-5",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://picsum.photos/400/600?random=5",
    title: "Cooking Masterclass",
    description: "Learn professional cooking techniques from top chefs.",
    user: {
      id: "user-5",
      name: "Chef's Kitchen",
      avatar: "https://i.pravatar.cc/150?img=14",
      username: "chefskitchen",
      verified: false
    },
    stats: {
      likes: 12345,
      comments: 678,
      shares: 234,
      views: 56789
    },
    duration: 165,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    tags: ["cooking", "food", "tutorial"],
    isLiked: false,
    isFollowing: true
  }
];

export const mockAdData: AdItem['ad'] = {
  id: "ad-1",
  title: "Upgrade to Eloity Premium",
  description: "Unlock exclusive features, verified badges, and premium content. Join thousands of creators earning Eloits!",
  image: "https://picsum.photos/400/600?random=ad1",
  ctaText: "Get Premium",
  ctaUrl: "/premium",
  sponsor: "Eloity",
  type: "premium_subscription",
  targetingData: {
    demographics: ["18-35"],
    interests: ["social media", "content creation", "crypto"],
    location: "global"
  }
};