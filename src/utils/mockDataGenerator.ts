// Temporary mock data generator to resolve import errors during API transition
// This file will be removed once full API integration is complete

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

interface Post {
  id: string;
  author: Member;
  content: string;
  images?: string[];
  video?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
}

interface Comment {
  id: string;
  author: Member;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  attendees: number;
  isAttending: boolean;
  cover?: string;
}

// Sample user profiles for generating mock data
const sampleUsers = [
  {
    id: "user1",
    name: "Sarah Johnson",
    avatar: "/api/placeholder/150/150",
    role: "admin" as const,
    joinedAt: "2023-01-15"
  },
  {
    id: "user2", 
    name: "Alex Chen",
    avatar: "/api/placeholder/150/150",
    role: "member" as const,
    joinedAt: "2023-03-22"
  },
  {
    id: "user3",
    name: "Mike Rodriguez", 
    avatar: "/api/placeholder/150/150",
    role: "member" as const,
    joinedAt: "2023-02-10"
  },
  {
    id: "user4",
    name: "Emma Williams",
    avatar: "/api/placeholder/150/150", 
    role: "member" as const,
    joinedAt: "2023-04-05"
  }
];

export const generateMockPosts = (groupId: string, count: number): Post[] => {
  const posts: Post[] = [];
  
  for (let i = 0; i < count; i++) {
    const author = sampleUsers[i % sampleUsers.length];
    const post: Post = {
      id: `${groupId}-post-${i}`,
      author,
      content: `This is a sample post for group ${groupId}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      timestamp: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      likes: Math.floor(Math.random() * 20),
      comments: [],
      isLiked: Math.random() > 0.5,
      isPinned: i === 0
    };
    posts.push(post);
  }
  
  return posts;
};

export const generateMockEvents = (groupId: string, count: number): Event[] => {
  const events: Event[] = [];
  
  const eventTitles = [
    "Weekly Meetup",
    "Coding Workshop", 
    "Tech Talk",
    "Networking Event"
  ];
  
  for (let i = 0; i < count; i++) {
    const event: Event = {
      id: `${groupId}-event-${i}`,
      title: eventTitles[i % eventTitles.length],
      description: `Join us for an exciting ${eventTitles[i % eventTitles.length].toLowerCase()} in group ${groupId}`,
      date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: "18:00",
      location: "Virtual Meeting Room",
      attendees: Math.floor(Math.random() * 50) + 10,
      isAttending: Math.random() > 0.5,
      cover: "/api/placeholder/400/200"
    };
    events.push(event);
  }
  
  return events;
};

export const generateMockMembers = (groupId: string, count: number): Member[] => {
  const members: Member[] = [];
  
  for (let i = 0; i < count; i++) {
    const user = sampleUsers[i % sampleUsers.length];
    const member: Member = {
      ...user,
      id: `${groupId}-member-${i}`,
      name: `${user.name} ${i > 3 ? i : ''}`.trim()
    };
    members.push(member);
  }
  
  return members;
};