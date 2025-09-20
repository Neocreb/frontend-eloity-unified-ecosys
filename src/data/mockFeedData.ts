// Mock data for feed stories
import { Story } from "@/components/feed/Stories";

export const mockStories: Story[] = [
  {
    id: "story-1",
    user: {
      id: "user-1",
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
      username: "johndoe"
    },
    media: {
      type: "image",
      url: "https://picsum.photos/400/800?random=1",
      thumbnail: "https://picsum.photos/150/150?random=1"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isViewed: false
  },
  {
    id: "story-2",
    user: {
      id: "user-2",
      name: "Jane Smith",
      avatar: "https://i.pravatar.cc/150?img=2",
      username: "janesmith"
    },
    media: {
      type: "video",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail: "https://picsum.photos/150/150?random=2"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isViewed: true
  },
  {
    id: "story-3",
    user: {
      id: "user-3",
      name: "Alex Johnson",
      avatar: "https://i.pravatar.cc/150?img=3",
      username: "alexjohnson"
    },
    media: {
      type: "image",
      url: "https://picsum.photos/400/800?random=3",
      thumbnail: "https://picsum.photos/150/150?random=3"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    isViewed: false
  },
  {
    id: "story-4",
    user: {
      id: "user-4",
      name: "Emily Davis",
      avatar: "https://i.pravatar.cc/150?img=4",
      username: "emilydavis"
    },
    media: {
      type: "image",
      url: "https://picsum.photos/400/800?random=4",
      thumbnail: "https://picsum.photos/150/150?random=4"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    isViewed: true
  },
  {
    id: "story-5",
    user: {
      id: "user-5",
      name: "Michael Brown",
      avatar: "https://i.pravatar.cc/150?img=5",
      username: "michaelbrown"
    },
    media: {
      type: "video",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail: "https://picsum.photos/150/150?random=5"
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    isViewed: false
  }
];