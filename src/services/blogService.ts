// @ts-nocheck
import {
  BlogPost,
  BlogCategory,
  BlogComment,
  BlogStats,
  RSSFeedItem,
} from "@/types/blog";

// Mock data for blog categories
const mockCategories: BlogCategory[] = [
  {
    id: "1",
    name: "Crypto Education",
    slug: "crypto-education",
    description:
      "Learn the fundamentals of cryptocurrency and blockchain technology",
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "Trading Strategies",
    slug: "trading-strategies",
    description: "Advanced trading techniques and market analysis",
    color: "bg-green-500",
  },
  {
    id: "3",
    name: "DeFi Insights",
    slug: "defi-insights",
    description: "Decentralized finance protocols and opportunities",
    color: "bg-purple-500",
  },
  {
    id: "4",
    name: "Market Analysis",
    slug: "market-analysis",
    description: "Technical and fundamental analysis of crypto markets",
    color: "bg-orange-500",
  },
  {
    id: "5",
    name: "Platform Updates",
    slug: "platform-updates",
    description: "Latest features and improvements to our platform",
    color: "bg-indigo-500",
  },
];

// Mock data for blog posts
const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Understanding Bitcoin: A Beginner's Guide to Digital Gold",
    slug: "understanding-bitcoin-beginners-guide",
    excerpt:
      "Learn the fundamentals of Bitcoin, how it works, and why it's considered digital gold in the cryptocurrency world.",
    content: `
# Understanding Bitcoin: A Beginner's Guide to Digital Gold

Bitcoin represents a revolutionary approach to money and financial transactions. As the first and most well-known cryptocurrency, it has paved the way for an entire digital asset ecosystem.

## What is Bitcoin?

Bitcoin is a decentralized digital currency that operates without a central authority like a bank or government. It was created in 2009 by an anonymous person or group known as Satoshi Nakamoto.

## Key Features

- **Decentralized**: No single entity controls Bitcoin
- **Limited Supply**: Only 21 million Bitcoin will ever exist
- **Transparent**: All transactions are recorded on a public ledger
- **Secure**: Protected by cryptographic algorithms

## How Bitcoin Works

Bitcoin transactions are verified by network nodes through cryptography and recorded in a public distributed ledger called a blockchain...
    `,
    author: {
      id: "1",
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&q=80&w=150",
      bio: "Crypto educator and blockchain enthusiast with 5+ years of experience",
    },
    publishedAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    tags: ["Bitcoin", "Cryptocurrency", "Blockchain", "Beginner"],
    category: mockCategories[0],
    featuredImage:
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=800",
    readingTime: 8,
    likes: 245,
    views: 1520,
    status: "published",
    difficulty: "BEGINNER",
    relatedAssets: ["BTC"],
  },
  {
    id: "2",
    title: "Advanced Trading Patterns: Mastering Technical Analysis",
    slug: "advanced-trading-patterns-technical-analysis",
    excerpt:
      "Dive deep into advanced technical analysis patterns that professional traders use to identify market opportunities.",
    content: `
# Advanced Trading Patterns: Mastering Technical Analysis

Technical analysis is the art and science of reading price charts to predict future market movements. Understanding advanced patterns can give you a significant edge in trading.

## Essential Chart Patterns

### Head and Shoulders
This reversal pattern signals a potential change in trend direction...

### Cup and Handle
A bullish continuation pattern that often leads to significant breakouts...

### Fibonacci Retracements
Using mathematical ratios to identify support and resistance levels...
    `,
    author: {
      id: "2",
      name: "Marcus Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
      bio: "Professional trader with 10+ years of experience in crypto markets",
    },
    publishedAt: "2024-01-12T14:30:00Z",
    updatedAt: "2024-01-12T14:30:00Z",
    tags: ["Trading", "Technical Analysis", "Chart Patterns", "Advanced"],
    category: mockCategories[1],
    featuredImage:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
    readingTime: 12,
    likes: 189,
    views: 987,
    status: "published",
    difficulty: "ADVANCED",
    relatedAssets: ["BTC", "ETH", "ADA"],
  },
  {
    id: "3",
    title: "DeFi Yield Farming: Opportunities and Risks",
    slug: "defi-yield-farming-opportunities-risks",
    excerpt:
      "Explore the world of decentralized finance yield farming, understanding both the potential rewards and associated risks.",
    content: `
# DeFi Yield Farming: Opportunities and Risks

Yield farming has become one of the most popular ways to earn passive income in the DeFi ecosystem. However, it comes with both opportunities and risks that every investor should understand.

## What is Yield Farming?

Yield farming involves lending your crypto assets to generate returns in the form of additional cryptocurrency...

## Popular Yield Farming Strategies

1. **Liquidity Mining**: Providing liquidity to decentralized exchanges
2. **Lending Protocols**: Earning interest on deposited assets
3. **Staking**: Participating in network consensus mechanisms
    `,
    author: {
      id: "3",
      name: "Emma Thompson",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
      bio: "DeFi researcher and protocol analyst",
    },
    publishedAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-10T09:15:00Z",
    tags: ["DeFi", "Yield Farming", "Passive Income", "Risk Management"],
    category: mockCategories[2],
    featuredImage:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
    readingTime: 10,
    likes: 167,
    views: 756,
    status: "published",
    difficulty: "INTERMEDIATE",
    relatedAssets: ["ETH", "UNI", "AAVE"],
  },
  {
    id: "4",
    title: "Market Sentiment Analysis: Reading Between the Lines",
    slug: "market-sentiment-analysis-reading-between-lines",
    excerpt:
      "Learn how to gauge market sentiment using various indicators and social metrics to make better trading decisions.",
    content: `
# Market Sentiment Analysis: Reading Between the Lines

Understanding market sentiment is crucial for successful trading. It helps you identify when markets are overextended and potential reversal points.

## Key Sentiment Indicators

### Fear and Greed Index
This index measures market emotions on a scale from 0 (extreme fear) to 100 (extreme greed)...

### Social Media Metrics
Twitter mentions, Reddit discussions, and Google search trends can provide valuable insights...

### On-Chain Metrics
Blockchain data reveals what investors are actually doing with their assets...
    `,
    author: {
      id: "4",
      name: "David Kim",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      bio: "Quantitative analyst specializing in market sentiment",
    },
    publishedAt: "2024-01-08T16:45:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
    tags: ["Market Analysis", "Sentiment", "Trading Psychology", "Indicators"],
    category: mockCategories[3],
    featuredImage:
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800",
    readingTime: 9,
    likes: 134,
    views: 623,
    status: "published",
    difficulty: "INTERMEDIATE",
    relatedAssets: ["BTC", "ETH"],
  },
  {
    id: "5",
    title: "Platform Update: New AI-Powered Trading Features",
    slug: "platform-update-ai-powered-trading-features",
    excerpt:
      "Discover our latest AI-powered trading features designed to help you make smarter investment decisions.",
    content: `
# Platform Update: New AI-Powered Trading Features

We're excited to announce the launch of our new AI-powered trading features that will revolutionize how you trade cryptocurrencies on our platform.

## New Features

### AI Market Predictions
Our advanced machine learning algorithms analyze market data to provide trading predictions...

### Smart Portfolio Optimization
Automatically rebalance your portfolio based on market conditions and your risk tolerance...

### Sentiment-Based Alerts
Get notified when market sentiment shifts significantly for your tracked assets...

## How to Access

These features are available in the Pro Trading section of your dashboard...
    `,
    author: {
      id: "5",
      name: "Alex Johnson",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
      bio: "Product Manager at Eloity",
    },
    publishedAt: "2024-01-05T11:20:00Z",
    updatedAt: "2024-01-05T11:20:00Z",
    tags: ["Platform Update", "AI", "Trading", "New Features"],
    category: mockCategories[4],
    featuredImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    readingTime: 6,
    likes: 298,
    views: 1234,
    status: "published",
    difficulty: "BEGINNER",
  },
  {
    id: "6",
    title: "Ethereum 2.0: The Future of Smart Contracts",
    slug: "ethereum-2-future-smart-contracts",
    excerpt:
      "Explore the improvements and benefits that Ethereum 2.0 brings to the smart contract ecosystem.",
    content: `
# Ethereum 2.0: The Future of Smart Contracts

Ethereum 2.0 represents a major upgrade to the Ethereum network, bringing significant improvements in scalability, security, and sustainability.

## Key Improvements

### Proof of Stake
The transition from Proof of Work to Proof of Stake reduces energy consumption by 99.95%...

### Sharding
Horizontal scaling solution that increases transaction throughput...

### eWASM
New virtual machine that improves smart contract execution...

## Impact on DeFi

The improvements will make DeFi applications faster and cheaper to use...
    `,
    author: {
      id: "1",
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&q=80&w=150",
      bio: "Crypto educator and blockchain enthusiast with 5+ years of experience",
    },
    publishedAt: "2024-01-03T13:30:00Z",
    updatedAt: "2024-01-03T13:30:00Z",
    tags: ["Ethereum", "Smart Contracts", "Blockchain", "Technology"],
    category: mockCategories[0],
    featuredImage:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800",
    readingTime: 11,
    likes: 212,
    views: 891,
    status: "published",
    difficulty: "INTERMEDIATE",
    relatedAssets: ["ETH"],
  },
];

class BlogService {
  // Get all blog posts with optional filtering (simple version)
  async getBlogPostsSimple(
    category?: string,
    tags?: string[],
    difficulty?: string,
    limit?: number,
  ): Promise<BlogPost[]> {
    let filteredPosts = [...mockBlogPosts];

    if (category) {
      filteredPosts = filteredPosts.filter(
        (post) => post.category.slug === category,
      );
    }

    if (tags && tags.length > 0) {
      filteredPosts = filteredPosts.filter((post) =>
        tags.some((tag) =>
          post.tags.some((postTag) =>
            postTag.toLowerCase().includes(tag.toLowerCase()),
          ),
        ),
      );
    }

    if (difficulty) {
      filteredPosts = filteredPosts.filter(
        (post) => post.difficulty === difficulty,
      );
    }

    // Sort by published date (newest first)
    filteredPosts.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    if (limit) {
      filteredPosts = filteredPosts.slice(0, limit);
    }

    return filteredPosts;
  }

  // Get single blog post by slug
  async getBlogPost(slug: string): Promise<BlogPost | null> {
    const post = mockBlogPosts.find((post) => post.slug === slug);
    return post || null;
  }

  // Get blog categories
  async getCategories(): Promise<BlogCategory[]> {
    return mockCategories;
  }

  // Get RSS feed items for crypto learning
  async getRSSFeedItems(limit: number = 10): Promise<RSSFeedItem[]> {
    const posts = await this.getBlogPosts();

    return posts.slice(0, limit).map((post) => ({
      id: post.id,
      title: post.title,
      description: post.excerpt,
      link: `/blog/${post.slug}`,
      pubDate: post.publishedAt,
      category: post.category.name,
      tags: post.tags,
      author: post.author.name,
      difficulty: post.difficulty,
      relatedAssets: post.relatedAssets,
    }));
  }

  // Get crypto-related blog posts for learning tab
  async getCryptoLearningPosts(limit: number = 6): Promise<BlogPost[]> {
    const cryptoTags = [
      "Bitcoin",
      "Ethereum",
      "Blockchain",
      "Trading",
      "DeFi",
      "Cryptocurrency",
    ];
    return this.getBlogPosts(undefined, cryptoTags, undefined, limit);
  }

  // Get blog statistics
  async getBlogStats(): Promise<BlogStats> {
    const totalPosts = mockBlogPosts.length;
    const totalViews = mockBlogPosts.reduce((sum, post) => sum + post.views, 0);
    const totalLikes = mockBlogPosts.reduce((sum, post) => sum + post.likes, 0);
    // Mock comment count
    const totalComments = Math.floor(totalLikes * 0.3);

    const categoryStats = mockCategories.map((category) => ({
      category,
      postCount: mockBlogPosts.filter(
        (post) => post.category.id === category.id,
      ).length,
    }));

    return {
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      topCategories: categoryStats.sort((a, b) => b.postCount - a.postCount),
    };
  }

  // Search blog posts
  async searchPosts(query: string): Promise<BlogPost[]> {
    const lowercaseQuery = query.toLowerCase();
    return mockBlogPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowercaseQuery) ||
        post.excerpt.toLowerCase().includes(lowercaseQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
        post.content.toLowerCase().includes(lowercaseQuery),
    );
  }

  // Get blog posts with pagination and filtering for main blog page
  async getBlogPosts(filters?: {
    category?: string;
    tags?: string[];
    difficulty?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ posts: BlogPost[]; total: number; hasMore: boolean }> {
    let filteredPosts = [...mockBlogPosts];

    if (filters?.category) {
      filteredPosts = filteredPosts.filter(
        (post) => post.category.slug === filters.category,
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      filteredPosts = filteredPosts.filter((post) =>
        filters.tags!.some((tag) =>
          post.tags.some((postTag) =>
            postTag.toLowerCase().includes(tag.toLowerCase()),
          ),
        ),
      );
    }

    if (filters?.difficulty) {
      filteredPosts = filteredPosts.filter(
        (post) => post.difficulty === filters.difficulty,
      );
    }

    // Sort by published date (newest first)
    filteredPosts.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    const total = filteredPosts.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || filteredPosts.length;

    const paginatedPosts = filteredPosts.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      posts: paginatedPosts,
      total,
      hasMore,
    };
  }

  // Generate RSS feed XML for crypto learning
  async generateRSSFeed(): Promise<string> {
    const posts = await this.getCryptoLearningPosts(20);
    const lastBuildDate = new Date().toUTCString();

    const rssItems = posts
      .map((post) => {
        const pubDate = new Date(post.publishedAt).toUTCString();
        const categories = [post.category.name, ...post.tags].join(", ");

        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://eloity.com/blog/${post.slug}</link>
      <guid isPermaLink="true">https://eloity.com/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author><![CDATA[${post.author.name}]]></author>
      <category><![CDATA[${categories}]]></category>
      <difficulty>${post.difficulty}</difficulty>
      <readingTime>${post.readingTime}</readingTime>
      ${post.relatedAssets?.map((asset) => `<relatedAsset>${asset}</relatedAsset>`).join("\n      ") || ""}
    </item>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Eloity Crypto Learning Blog</title>
    <link>https://eloity.com/blog</link>
    <description>Educational content about cryptocurrency, blockchain technology, and trading strategies from Eloity</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="https://eloity.com/api/blog/rss" rel="self" type="application/rss+xml"/>
    <generator>Eloity Blog System</generator>
    <managingEditor>team@eloity.com (Eloity Team)</managingEditor>
    <webMaster>tech@eloity.com (Eloity Tech)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} Eloity. All rights reserved.</copyright>
    <category>Cryptocurrency</category>
    <category>Blockchain</category>
    <category>Trading</category>
    <category>Education</category>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`;
  }

  // Get featured blog posts for crypto learning section
  async getFeaturedCryptoContent(limit: number = 6): Promise<BlogPost[]> {
    // Prioritize posts with high engagement and crypto-related content
    const cryptoPosts = await this.getCryptoLearningPosts();

    // Sort by a combination of likes, views, and recency
    return cryptoPosts
      .sort((a, b) => {
        const scoreA =
          a.likes * 2 +
          a.views * 0.1 +
          new Date(a.publishedAt).getTime() / 1000000000;
        const scoreB =
          b.likes * 2 +
          b.views * 0.1 +
          new Date(b.publishedAt).getTime() / 1000000000;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }
}

export const blogService = new BlogService();
