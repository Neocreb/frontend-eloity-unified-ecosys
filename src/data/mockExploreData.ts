export interface TrendingTopic {
  id: string;
  name: string;
  posts: number;
  category: string;
}

export interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  verified: boolean;
  followers: number;
}

export interface MockGroupSummary {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  cover: string;
  privacy: "public" | "private";
  location?: string;
  isJoined: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
}

export interface MockPageSummary {
  id: string;
  name: string;
  followers: number;
  category: string;
  verified: boolean;
  avatar: string;
  description: string;
  pageType: "brand" | "business" | "organization" | "public_figure";
  isFollowing: boolean;
  website?: string;
  location?: string;
  posts?: number;
  engagement?: number;
}

export const trendingTopics: TrendingTopic[] = [
  {
    id: "topic-ai-governance",
    name: "AIGovernance",
    posts: 15843,
    category: "Technology",
  },
  {
    id: "topic-creator-economy",
    name: "CreatorGrants",
    posts: 11207,
    category: "Creator Economy",
  },
  {
    id: "topic-marketplace-growth",
    name: "MarketplaceLaunch",
    posts: 9821,
    category: "Business",
  },
  {
    id: "topic-remote-work",
    name: "AsyncWorkflows",
    posts: 8744,
    category: "Productivity",
  },
  {
    id: "topic-crypto-payments",
    name: "StablecoinFlows",
    posts: 7640,
    category: "Finance",
  },
  {
    id: "topic-livestreaming",
    name: "LiveCommerce",
    posts: 6928,
    category: "Livestreaming",
  },
  {
    id: "topic-community-events",
    name: "CommunitySummits",
    posts: 6182,
    category: "Community",
  },
  {
    id: "topic-ai-creatives",
    name: "GenerativeArt",
    posts: 5839,
    category: "Design",
  },
];

export const suggestedUsers: SuggestedUser[] = [
  {
    id: "user-eloity-001",
    name: "Sarah Johnson",
    username: "sarah.builds",
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
    bio: "Product lead building collaborative tooling for remote-first teams.",
    verified: true,
    followers: 42100,
  },
  {
    id: "user-eloity-002",
    name: "Carlos Mendes",
    username: "carlos.designs",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    bio: "Design systems strategist helping creators scale their visual identity.",
    verified: false,
    followers: 18950,
  },
  {
    id: "user-eloity-003",
    name: "Amina Yusuf",
    username: "amina.codes",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
    bio: "Full-stack engineer focused on payments and multi-currency wallets.",
    verified: true,
    followers: 26540,
  },
  {
    id: "user-eloity-004",
    name: "Lina Park",
    username: "lina.streams",
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
    bio: "Livestream producer hosting weekly marketplace growth clinics.",
    verified: false,
    followers: 15320,
  },
  {
    id: "user-eloity-005",
    name: "Kwame Boateng",
    username: "kwame.trades",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    bio: "Crypto analyst sharing insight on mobile-first trading cultures.",
    verified: true,
    followers: 33780,
  },
  {
    id: "user-eloity-006",
    name: "Maya Patel",
    username: "maya.creates",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    bio: "Creative director curating brand partnerships for independent creators.",
    verified: false,
    followers: 17860,
  },
];

export const groups: MockGroupSummary[] = [
  {
    id: "group-product-founders",
    name: "Product Founder Alliance",
    description:
      "A tactical community for product builders sharing roadmaps, experiments, and growth stories.",
    members: 18542,
    category: "Product",
    cover:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    privacy: "public",
    location: "Global",
    isJoined: true,
    isOwner: false,
    isAdmin: true,
  },
  {
    id: "group-creator-studio",
    name: "Unified Creator Studio",
    description:
      "Creators and editors collaborating on short-form video formats, monetization, and analytics.",
    members: 25680,
    category: "Creator Economy",
    cover:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80",
    privacy: "public",
    location: "Remote",
    isJoined: false,
  },
  {
    id: "group-africa-commerce",
    name: "Africa Commerce Collective",
    description:
      "Regional operators swapping playbooks for logistics, payments, and cross-border marketplace growth.",
    members: 14320,
    category: "Business",
    cover:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    privacy: "private",
    location: "Nairobi",
    isJoined: true,
    isOwner: false,
    isAdmin: false,
  },
  {
    id: "group-remote-ops",
    name: "Remote Ops Architects",
    description:
      "Operations leaders optimizing async rituals, knowledge bases, and distributed hiring pipelines.",
    members: 9875,
    category: "Operations",
    cover:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80",
    privacy: "public",
    location: "Berlin",
    isJoined: false,
  },
  {
    id: "group-crypto-p2p",
    name: "Crypto P2P Guild",
    description:
      "Seasoned traders coordinating liquidity, compliance readiness, and on-ramp partnerships.",
    members: 21234,
    category: "Finance",
    cover:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
    privacy: "private",
    location: "Remote",
    isJoined: true,
    isOwner: true,
    isAdmin: true,
  },
  {
    id: "group-wellness-creators",
    name: "Wellness Creators Lab",
    description:
      "Mindfulness coaches and wellness creators designing supportive, inclusive digital programs.",
    members: 7420,
    category: "Lifestyle",
    cover:
      "https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=1600&q=80",
    privacy: "public",
    location: "Cape Town",
    isJoined: false,
  },
];

export const pages: MockPageSummary[] = [
  {
    id: "page-eloity-labs",
    name: "Eloity Labs",
    followers: 132450,
    category: "Technology",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=200&q=80",
    description:
      "Building the unified ecosystem for creators, freelancers, and community-led marketplaces.",
    pageType: "organization",
    isFollowing: true,
    website: "https://eloity.com",
    posts: 482,
    engagement: 7.2,
  },
  {
    id: "page-softchat",
    name: "Softchat Studio",
    followers: 87420,
    category: "Communications",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=200&q=80",
    description:
      "Intelligent messaging infrastructure for communities, commerce, and collaborative work.",
    pageType: "business",
    isFollowing: false,
    website: "https://softchat.io",
    location: "San Francisco",
    posts: 268,
    engagement: 6.5,
  },
  {
    id: "page-marketplace-collective",
    name: "Marketplace Collective",
    followers: 46580,
    category: "Business",
    verified: false,
    avatar:
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=200&q=80",
    description:
      "Global network of operators sharing GTM, retention, and logistics tactics.",
    pageType: "organization",
    isFollowing: false,
    website: "https://marketplacecollective.org",
    posts: 193,
    engagement: 5.1,
  },
  {
    id: "page-creator-alliance",
    name: "Creator Alliance",
    followers: 57890,
    category: "Creator Economy",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=200&q=80",
    description:
      "Premium insights, deal flow, and monetization resources for independent creators.",
    pageType: "brand",
    isFollowing: true,
    posts: 326,
    engagement: 8.4,
  },
  {
    id: "page-finpay",
    name: "FinPay Africa",
    followers: 68940,
    category: "Finance",
    verified: false,
    avatar:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=200&q=80",
    description:
      "Modern payment rails for high-growth marketplaces across the continent.",
    pageType: "business",
    isFollowing: false,
    location: "Lagos",
    posts: 152,
    engagement: 6.1,
  },
  {
    id: "page-wellness-hub",
    name: "Wellness Hub",
    followers: 31280,
    category: "Lifestyle",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=200&q=80",
    description:
      "Curated wellness experiences, retreats, and digital care programs for busy teams.",
    pageType: "public_figure",
    isFollowing: false,
    posts: 214,
    engagement: 5.8,
  },
];
