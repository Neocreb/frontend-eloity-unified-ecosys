// Mock data generator for development and testing purposes
// This should be replaced with real data from the database in production

export interface MockPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    joinedAt: string;
  };
  content: string;
  images?: string[];
  video?: string;
  timestamp: string;
  likes: number;
  comments: MockComment[];
  isLiked: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
}

export interface MockComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    joinedAt: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: MockComment[];
}

export interface MockMember {
  id: string;
  name: string;
  avatar: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

export interface MockEvent {
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

// Generate mock posts for a group
export const generateMockPosts = (groupId: string, count: number = 5): MockPost[] => {
  const posts: MockPost[] = [];
  
  const sampleContent = [
    "Just joined this amazing group! Looking forward to connecting with everyone.",
    "Has anyone tried the new feature? Would love to hear your thoughts!",
    "Sharing some resources I found helpful for our group topic.",
    "What are your thoughts on the latest industry trends?",
    "Excited to announce our upcoming group event!",
    "Does anyone have recommendations for learning resources?",
    "Just completed a project related to our group focus. Happy to share insights!",
    "Looking for collaborators on an interesting project. Let me know if interested!",
    "Quick tip that might help everyone in our group.",
    "Curious about everyone's experience with the new tools."
  ];

  for (let i = 0; i < count; i++) {
    const postId = `post-${groupId}-${Date.now()}-${i}`;
    const randomContent = sampleContent[Math.floor(Math.random() * sampleContent.length)];
    
    posts.push({
      id: postId,
      author: {
        id: `user-${Math.floor(Math.random() * 1000)}`,
        name: `User ${Math.floor(Math.random() * 100)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${postId}`,
        role: ["owner", "admin", "member"][Math.floor(Math.random() * 3)] as "owner" | "admin" | "member",
        joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      content: `${randomContent} [Post #${i + 1} for group ${groupId.substring(0, 8)}]`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 50),
      isLiked: Math.random() > 0.7,
      isPinned: Math.random() > 0.9,
      comments: generateMockComments(groupId, postId, Math.floor(Math.random() * 5)),
      images: Math.random() > 0.8 ? [
        `https://source.unsplash.com/800x600/?technology,${i}`,
        `https://source.unsplash.com/800x600/?business,${i}`
      ] : undefined
    });
  }
  
  return posts;
};

// Generate mock comments for a post
const generateMockComments = (groupId: string, postId: string, count: number): MockComment[] => {
  const comments: MockComment[] = [];
  
  const sampleComments = [
    "Great post! Thanks for sharing.",
    "I have a different perspective on this.",
    "Can you elaborate more on this point?",
    "This is exactly what I was looking for!",
    "I tried this approach and it worked well.",
    "Has anyone encountered any issues with this?",
    "Would love to see more examples like this.",
    "Thanks for the insights!",
    "This is very helpful. Bookmarked for later.",
    "Do you have any resources to recommend?"
  ];

  for (let i = 0; i < count; i++) {
    const commentId = `comment-${postId}-${i}`;
    const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
    
    comments.push({
      id: commentId,
      author: {
        id: `user-${Math.floor(Math.random() * 1000)}`,
        name: `Commenter ${Math.floor(Math.random() * 50)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${commentId}`,
        role: ["member", "member", "admin"][Math.floor(Math.random() * 3)] as "owner" | "admin" | "member",
        joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      content: `${randomComment} [Comment #${i + 1}]`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 10),
      isLiked: Math.random() > 0.8,
      replies: Math.random() > 0.7 ? generateMockReplies(groupId, commentId, Math.floor(Math.random() * 3)) : undefined
    });
  }
  
  return comments;
};

// Generate mock replies for a comment
const generateMockReplies = (groupId: string, commentId: string, count: number): MockComment[] => {
  const replies: MockComment[] = [];
  
  const sampleReplies = [
    "I agree with this point.",
    "Thanks for the clarification!",
    "That's a good question.",
    "I think it depends on the context.",
    "Here's my experience with this.",
    "Would you recommend this approach?",
    "I've seen similar results.",
    "This is helpful, thanks!"
  ];

  for (let i = 0; i < count; i++) {
    const replyId = `reply-${commentId}-${i}`;
    const randomReply = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
    
    replies.push({
      id: replyId,
      author: {
        id: `user-${Math.floor(Math.random() * 1000)}`,
        name: `Replier ${Math.floor(Math.random() * 30)}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${replyId}`,
        role: "member",
        joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      content: `${randomReply} [Reply #${i + 1}]`,
      timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(Math.random() * 5),
      isLiked: Math.random() > 0.8
    });
  }
  
  return replies;
};

// Generate mock events for a group
export const generateMockEvents = (groupId: string, count: number = 3): MockEvent[] => {
  const events: MockEvent[] = [];
  
  const sampleEvents = [
    {
      title: "Weekly Discussion Meeting",
      description: "Join us for our weekly group discussion and knowledge sharing session."
    },
    {
      title: "Expert Guest Session",
      description: "Special session with industry experts sharing insights and answering questions."
    },
    {
      title: "Project Collaboration Workshop",
      description: "Hands-on workshop for collaborating on group projects and initiatives."
    },
    {
      title: "Networking Happy Hour",
      description: "Informal networking event to connect with fellow group members."
    },
    {
      title: "Learning & Development Session",
      description: "Educational session covering new tools and techniques relevant to our group."
    }
  ];

  for (let i = 0; i < count; i++) {
    const eventIndex = Math.floor(Math.random() * sampleEvents.length);
    const eventTemplate = sampleEvents[eventIndex];
    
    // Generate a date within the next 30 days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30));
    
    events.push({
      id: `event-${groupId}-${Date.now()}-${i}`,
      title: eventTemplate.title,
      description: eventTemplate.description,
      date: futureDate.toISOString().split('T')[0],
      time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 4) * 15 === 0 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
      location: Math.random() > 0.5 ? ["Online", "Main Conference Room", "Community Center", "Virtual Meeting"][Math.floor(Math.random() * 4)] : undefined,
      attendees: Math.floor(Math.random() * 50) + 10,
      isAttending: Math.random() > 0.7,
      cover: Math.random() > 0.5 ? `https://source.unsplash.com/800x400/?meeting,${i}` : undefined
    });
  }
  
  return events;
};

// Generate mock members for a group
export const generateMockMembers = (groupId: string, count: number = 10): MockMember[] => {
  const members: MockMember[] = [];
  
  // Add owner
  members.push({
    id: `owner-${groupId}`,
    name: "Group Owner",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=owner-${groupId}`,
    role: "owner",
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  });
  
  // Add admins
  const adminCount = Math.min(2, count - 1);
  for (let i = 0; i < adminCount; i++) {
    members.push({
      id: `admin-${groupId}-${i}`,
      name: `Admin ${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin-${groupId}-${i}`,
      role: "admin",
      joinedAt: new Date(Date.now() - (60 + Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  // Add regular members
  const memberCount = count - members.length;
  for (let i = 0; i < memberCount; i++) {
    members.push({
      id: `member-${groupId}-${i}`,
      name: `Member ${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=member-${groupId}-${i}`,
      role: "member",
      joinedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return members;
};

export default {
  generateMockPosts,
  generateMockEvents,
  generateMockMembers
};