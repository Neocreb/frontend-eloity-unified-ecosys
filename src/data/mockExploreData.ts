// Temporary mock explore data to resolve import errors during API transition
// This file will be removed once full API integration is complete

export interface TrendingTopic {
  id: string;
  name: string;
  posts: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

export interface SuggestedUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  followers: number;
  isFollowing: boolean;
  mutualConnections: number;
  location?: string;
  isOnline: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  cover: string;
  privacy: 'public' | 'private';
  isJoined: boolean;
  recentActivity?: string;
}

export interface Page {
  id: string;
  name: string;
  description: string;
  followers: number;
  category: string;
  cover: string;
  verified: boolean;
  isFollowing: boolean;
}

// Trending Topics Data
export const trendingTopics: TrendingTopic[] = [
  {
    id: 'topic1',
    name: 'React 18',
    posts: 15420,
    trend: 'up',
    category: 'Technology'
  },
  {
    id: 'topic2', 
    name: 'TypeScript',
    posts: 8930,
    trend: 'up',
    category: 'Programming'
  },
  {
    id: 'topic3',
    name: 'Blockchain',
    posts: 6250,
    trend: 'stable',
    category: 'Crypto'
  },
  {
    id: 'topic4',
    name: 'AI & ML',
    posts: 12800,
    trend: 'up',
    category: 'Technology'
  },
  {
    id: 'topic5',
    name: 'Web3',
    posts: 4560,
    trend: 'down',
    category: 'Crypto'
  }
];

// Suggested Users Data
export const suggestedUsers: SuggestedUser[] = [
  {
    id: 'user1',
    username: 'sarah_tech',
    full_name: 'Sarah Johnson',
    avatar_url: '/api/placeholder/150/150',
    bio: 'Tech entrepreneur and developer advocate',
    followers: 1250,
    isFollowing: false,
    mutualConnections: 12,
    location: 'San Francisco, CA',
    isOnline: true
  },
  {
    id: 'user2',
    username: 'alex_dev', 
    full_name: 'Alex Chen',
    avatar_url: '/api/placeholder/150/150',
    bio: 'Full-stack developer specializing in React and Node.js',
    followers: 890,
    isFollowing: false,
    mutualConnections: 8,
    location: 'New York, NY',
    isOnline: false
  },
  {
    id: 'user3',
    username: 'mike_crypto',
    full_name: 'Mike Rodriguez',
    avatar_url: '/api/placeholder/150/150',
    bio: 'Cryptocurrency trader and blockchain enthusiast',
    followers: 2100,
    isFollowing: true,
    mutualConnections: 25,
    location: 'Austin, TX',
    isOnline: true
  },
  {
    id: 'user4',
    username: 'emma_creates',
    full_name: 'Emma Williams',
    avatar_url: '/api/placeholder/150/150',
    bio: 'Digital artist and content creator',
    followers: 3400,
    isFollowing: false,
    mutualConnections: 15,
    location: 'Los Angeles, CA',
    isOnline: false
  }
];

// Groups Data
export const groups: Group[] = [
  {
    id: 'group1',
    name: 'React Developers',
    description: 'A community for React developers to share knowledge and best practices',
    members: 15420,
    category: 'Technology',
    cover: '/api/placeholder/400/200',
    privacy: 'public',
    isJoined: false,
    recentActivity: '15 new posts today'
  },
  {
    id: 'group2',
    name: 'Crypto Trading Hub',
    description: 'Professional cryptocurrency trading discussion and analysis',
    members: 8930,
    category: 'Finance',
    cover: '/api/placeholder/400/200',
    privacy: 'public',
    isJoined: true,
    recentActivity: 'New market analysis posted'
  },
  {
    id: 'group3',
    name: 'UI/UX Designers',
    description: 'Design inspiration, critiques, and career discussions',
    members: 6250,
    category: 'Design',
    cover: '/api/placeholder/400/200',
    privacy: 'public',
    isJoined: false,
    recentActivity: 'Weekly design challenge started'
  },
  {
    id: 'group4',
    name: 'Startup Founders',
    description: 'Entrepreneurship, funding, and business growth strategies',
    members: 4560,
    category: 'Business',
    cover: '/api/placeholder/400/200',
    privacy: 'private',
    isJoined: true,
    recentActivity: 'Networking event announced'
  },
  {
    id: 'group5',
    name: 'Machine Learning',
    description: 'AI, ML algorithms, research papers and practical applications',
    members: 12800,
    category: 'Technology',
    cover: '/api/placeholder/400/200',
    privacy: 'public',
    isJoined: false,
    recentActivity: 'New research paper discussion'
  }
];

// Pages Data
export const pages: Page[] = [
  {
    id: 'page1',
    name: 'TechCrunch',
    description: 'Latest technology news and startup stories',
    followers: 125000,
    category: 'News',
    cover: '/api/placeholder/400/200',
    verified: true,
    isFollowing: false
  },
  {
    id: 'page2',
    name: 'GitHub',
    description: 'The world\'s leading software development platform',
    followers: 89000,
    category: 'Technology',
    cover: '/api/placeholder/400/200',
    verified: true,
    isFollowing: true
  },
  {
    id: 'page3',
    name: 'Product Hunt',
    description: 'Discover new products and startups every day',
    followers: 67500,
    category: 'Technology',
    cover: '/api/placeholder/400/200',
    verified: true,
    isFollowing: false
  },
  {
    id: 'page4',
    name: 'Y Combinator',
    description: 'Startup accelerator and investment firm',
    followers: 45600,
    category: 'Business',
    cover: '/api/placeholder/400/200',
    verified: true,
    isFollowing: true
  },
  {
    id: 'page5',
    name: 'MIT Technology Review',
    description: 'The leading source for emerging technology research',
    followers: 78900,
    category: 'Science',
    cover: '/api/placeholder/400/200',
    verified: true,
    isFollowing: false
  }
];

// Export default object for compatibility
export default {
  trendingTopics,
  suggestedUsers,
  groups,
  pages
};