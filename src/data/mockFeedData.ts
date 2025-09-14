import { Post } from "@/types/post";

export const mockPosts: Post[] = [
  {
    id: "p_1",
    author: {
      name: "Sarah Johnson",
      username: "sarah_tech",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      verified: true,
    },
    content: "Just launched a new AI-powered productivity tool! 🚀",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200",
    location: "San Francisco, CA",
    taggedUsers: ["alex_dev"],
    createdAt: "2h ago",
    likes: 245,
    comments: 38,
    shares: 15,
  },
  {
    id: "p_2",
    author: {
      name: "Alex Rivera",
      username: "alex_dev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      verified: false,
    },
    content: "Open-sourced a starter for React + TS + Vite. Feedback welcome!",
    image: undefined,
    location: null,
    taggedUsers: null,
    createdAt: "5h ago",
    likes: 112,
    comments: 19,
    shares: 7,
    poll: {
      question: "Which state library do you prefer?",
      options: ["Zustand", "Redux Toolkit", "Jotai", "MobX"],
    },
  },
  {
    id: "p_3",
    author: {
      name: "Mike Chen",
      username: "mike_crypto",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      verified: true,
    },
    content: "BTC testing resistance. Watching 45k level closely. 📈",
    createdAt: "1d ago",
    likes: 320,
    comments: 64,
    shares: 22,
  },
];
