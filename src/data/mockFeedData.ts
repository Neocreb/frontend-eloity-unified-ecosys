import { Post } from "@/types/post";
import { PostComment } from "@/types/user";
import { Story } from "@/components/feed/Stories";

export const mockComments: PostComment[] = [
  {
    id: "1",
    post_id: "1",
    user_id: "101",
    content: "This is amazing news! Can't wait to see how the token performs.",
    created_at: "2023-04-15T10:30:00Z",
    user: {
      name: "John Smith",
      username: "johnsmith",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      is_verified: false
    }
  },
  {
    id: "2",
    post_id: "1",
    user_id: "102",
    content: "I've been following this project for months. It's finally paying off!",
    created_at: "2023-04-15T11:15:00Z",
    user: {
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      is_verified: true
    }
  }
];

export const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Andrew Miller",
      username: "andrew",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      verified: true,
    },
    content: "It's a record-breaking day for ION! The token has reached a new all-time high, shattering expectations and proving that innovation and resilience always win.",
    createdAt: "5m ago",
    likes: 12000,
    comments: 12,
    shares: 442,
  },
  {
    id: "ad1",
    isAd: true,
    author: {
      name: "FitLife Pro",
      username: "fitlifepro",
      avatar: "https://randomuser.me/api/portraits/men/88.jpg",
      verified: true,
    },
    content: "Transform your body and mind with our new fitness app! Get personalized workouts, nutrition plans, and more. 🏋️‍♂️",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop",
    createdAt: "Sponsored",
    likes: 0,
    comments: 0,
    shares: 0,
    adUrl: "https://example.com/fitlife",
    adCta: "Download Now",
  },
  {
    id: "2",
    author: {
      name: "Mark Poland",
      username: "markpoland",
      avatar: "https://randomuser.me/api/portraits/men/44.jpg",
      verified: true,
    },
    content: "✨ It's Official: Bitcoin Hits $100,000! 🚀\n\nToday marks a historic moment in the world of finance. Bitcoin, the first cryptocurrency, has officially crossed the $100,000 mark—a milestone that once seemed like a distant dream but has now become reality. 🌙✨",
    createdAt: "5m ago",
    likes: 8500,
    comments: 320,
    shares: 256,
  },
  {
    id: "3",
    author: {
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      verified: true,
    },
    content: "Just launched my new NFT collection on Softchat marketplace! Check it out and let me know what you think. #NFT #DigitalArt",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
    createdAt: "2h ago",
    likes: 356,
    comments: 42,
    shares: 18,
  },
];

export const mockStories: Story[] = [
  { id: "1", username: "you", avatar: "https://randomuser.me/api/portraits/men/32.jpg", isUser: true },
  { id: "2", username: "mysteriox", avatar: "https://randomuser.me/api/portraits/men/43.jpg", hasNewStory: true, isUser: false },
  { id: "3", username: "foxxydude", avatar: "https://randomuser.me/api/portraits/men/62.jpg", hasNewStory: true, isUser: false },
  { id: "4", username: "mikeyduy", avatar: "https://randomuser.me/api/portraits/men/52.jpg", hasNewStory: true, isUser: false },
  { id: "5", username: "suppe", avatar: "https://randomuser.me/api/portraits/men/66.jpg", isUser: false },
  { id: "6", username: "jane_doe", avatar: "https://randomuser.me/api/portraits/women/22.jpg", hasNewStory: true, isUser: false },
  { id: "7", username: "chris90", avatar: "https://randomuser.me/api/portraits/men/29.jpg", isUser: false },
  { id: "8", username: "lisa", avatar: "https://randomuser.me/api/portraits/women/65.jpg", hasNewStory: true, isUser: false },
];
