import { VideoItem } from "@/types/video";

export const mockVideos: VideoItem[] = [
  {
    id: "v_1",
    url: "https://videos.pexels.com/video-files/856985/856985-sd_360_640_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    description: "Building a modern web app with React and TypeScript",
    likes: 1240,
    comments: 98,
    shares: 54,
    author: {
      name: "Emma Wilson",
      username: "emma_creates",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
      verified: true,
    },
    isFollowing: true,
  },
  {
    id: "v_2",
    url: "https://videos.pexels.com/video-files/3183687/3183687-uhd_2560_1440_25fps.mp4",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    description: "Typing speed tips for developers",
    likes: 860,
    comments: 41,
    shares: 18,
    author: {
      name: "Alex Rivera",
      username: "alex_dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      verified: false,
    },
    isFollowing: false,
  },
];
