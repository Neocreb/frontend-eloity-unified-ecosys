import {
  UserProfile,
  MockUser,
  MarketplaceProfile,
  FreelanceProfile,
  CryptoProfile,
  Achievement,
  Badge,
} from "@/types/user";
import { Product } from "@/types/marketplace";

// Predefined mock users showcasing different profile types
export const mockUsers: Record<string, MockUser> = {
  // Tech Entrepreneur & Marketplace Seller
  sarah_tech: {
    id: "mock-sarah-tech",
    email: "sarah@techstore.com",
    name: "Sarah Chen",
    avatar:
      "https://ui-avatars.com/api/?name=Sarah+Chen&background=4f46e5&color=fff&size=256",
    points: 8500,
    level: "platinum",
    role: "user",
    created_at: "2021-03-15T00:00:00Z",
    user_metadata: {
      name: "Sarah Chen",
      avatar:
        "https://ui-avatars.com/api/?name=Sarah+Chen&background=4f46e5&color=fff&size=256",
    },
    profile: {
      id: "mock-sarah-tech",
      username: "sarah_tech",
      full_name: "Sarah Chen",
      avatar_url:
        "https://ui-avatars.com/api/?name=Sarah+Chen&background=4f46e5&color=fff&size=256",
      banner_url: "https://source.unsplash.com/1200x400/?technology,startup",
      bio: "🚀 Tech Entrepreneur & Gadget Enthusiast\n💼 CEO of TechStore Solutions\n🌟 Passionate about innovation and quality products\n\n✨ Featured seller with 1000+ happy customers\n🎯 Specializing in premium electronics and smart devices\n📱 Always hunting for the latest tech trends",
      location: "San Francisco, CA",
      website: "https://techstore-solutions.com",
      is_verified: true,
      points: 8500,
      level: "platinum",
      reputation: 4.9,
      followers_count: 3420,
      following_count: 890,
      posts_count: 156,
      profile_views: 25600,
      join_date: "2021-03-15T00:00:00Z",
      last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_online: true,
      profile_visibility: "public",
      skills: [
        "E-commerce",
        "Product Photography",
        "Customer Service",
        "Tech Innovation",
        "Business Strategy",
      ],
      interests: [
        "Technology",
        "Entrepreneurship",
        "Photography",
        "Travel",
        "Innovation",
      ],
      languages: ["English", "Mandarin"],
      marketplace_profile: {
        seller_id: "mock-sarah-tech",
        store_name: "TechStore Premium",
        store_description:
          "Your one-stop destination for premium electronics and innovative gadgets. We carefully curate the latest technology to bring you the best products at competitive prices.",
        store_logo:
          "https://ui-avatars.com/api/?name=TS&background=4f46e5&color=fff&size=128",
        store_banner:
          "https://source.unsplash.com/1200x300/?electronics,technology",
        business_type: "business",
        business_registration: "TS-2021-SF-001",
        return_policy: "30-day hassle-free returns on all products",
        shipping_policy:
          "Free shipping on orders over $100. Express delivery available.",
        store_rating: 4.9,
        total_sales: 2840,
        total_orders: 1250,
        response_rate: 98,
        response_time: "< 1 hour",
        is_store_active: true,
        seller_level: "platinum",
        store_categories: ["Electronics", "Smart Devices", "Accessories"],
        payment_methods_accepted: [
          "Credit Card",
          "PayPal",
          "Apple Pay",
          "Crypto",
        ],
        shipping_locations: ["Worldwide"],
        store_created_at: "2021-03-20T00:00:00Z",
      },
      achievements: [
        {
          id: "top_seller",
          name: "Top Seller",
          description: "Achieved over 1000 successful sales",
          icon: "🏆",
          category: "sales",
          rarity: "epic",
          earned_at: "2022-08-15T00:00:00Z",
        },
        {
          id: "customer_favorite",
          name: "Customer Favorite",
          description: "Maintained 4.9+ rating for 6 months",
          icon: "⭐",
          category: "quality",
          rarity: "rare",
          earned_at: "2022-11-20T00:00:00Z",
        },
      ],
      badges: [
        {
          id: "verified_seller",
          name: "Verified Seller",
          description: "Completed business verification",
          icon: "✅",
          color: "blue",
          earned_at: "2021-04-01T00:00:00Z",
          type: "verification",
        },
      ],
    },
    app_metadata: {},
    aud: "authenticated",
    username: () => "sarah_tech",
    mock_data: {
      posts: [
        {
          id: "post-1",
          content:
            "Just launched our new collection of smart home devices! 🏠✨ These products are going to revolutionize how we interact with our homes. Check out the reviews - customers are loving them! #SmartHome #Innovation #TechStore",
          image: "https://source.unsplash.com/800x600/?smart,home",
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 89,
          comments: 23,
          shares: 12,
        },
        {
          id: "post-2",
          content:
            "Behind the scenes at our product photography studio 📸 Quality images make all the difference in e-commerce. We invest in professional photography to showcase every detail of our products!",
          image: "https://source.unsplash.com/800x600/?photography,studio",
          created_at: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          likes: 145,
          comments: 31,
          shares: 8,
        },
      ],
      products: [
        {
          id: "prod-1",
          name: "Smart WiFi Security Camera",
          description:
            "4K Ultra HD security camera with night vision, motion detection, and mobile app control",
          price: 199.99,
          image: "https://source.unsplash.com/400x400/?security,camera",
          category: "Electronics",
          rating: 4.8,
          review_count: 156,
        },
        {
          id: "prod-2",
          name: "Wireless Charging Pad",
          description:
            "Fast wireless charging pad compatible with all Qi-enabled devices",
          price: 49.99,
          discount_price: 39.99,
          image: "https://source.unsplash.com/400x400/?wireless,charger",
          category: "Accessories",
          rating: 4.7,
          review_count: 89,
        },
      ],
      services: [],
      trades: [],
      reviews: [],
      followers: [],
      following: [],
    },
  },

  // Freelance Developer
  alex_dev: {
    id: "mock-alex-dev",
    email: "alex@freelancedev.pro",
    name: "Alex Rodriguez",
    avatar:
      "https://ui-avatars.com/api/?name=Alex+Rodriguez&background=10b981&color=fff&size=256",
    points: 6750,
    level: "gold",
    role: "user",
    created_at: "2021-07-22T00:00:00Z",
    user_metadata: {
      name: "Alex Rodriguez",
      avatar:
        "https://ui-avatars.com/api/?name=Alex+Rodriguez&background=10b981&color=fff&size=256",
    },
    profile: {
      id: "mock-alex-dev",
      username: "alex_dev",
      full_name: "Alex Rodriguez",
      avatar_url:
        "https://ui-avatars.com/api/?name=Alex+Rodriguez&background=10b981&color=fff&size=256",
      banner_url: "https://source.unsplash.com/1200x400/?coding,developer",
      bio: "💻 Full Stack Developer & Digital Craftsman\n🚀 5+ years building amazing web applications\n⚡ React, Node.js, Python specialist\n\n🎯 Helping startups and businesses bring ideas to life\n✨ Clean code, beautiful design, seamless user experience\n🌟 Top-rated freelancer with 50+ completed projects",
      location: "Barcelona, Spain",
      website: "https://alexrodriguez.dev",
      is_verified: true,
      points: 6750,
      level: "gold",
      reputation: 4.8,
      followers_count: 1890,
      following_count: 650,
      posts_count: 89,
      profile_views: 12400,
      join_date: "2021-07-22T00:00:00Z",
      last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      is_online: true,
      skills: [
        "JavaScript",
        "React",
        "Node.js",
        "Python",
        "PostgreSQL",
        "AWS",
        "UI/UX Design",
      ],
      interests: [
        "Web Development",
        "Open Source",
        "Design",
        "Music",
        "Travel",
      ],
      languages: ["English", "Spanish", "Catalan"],
      freelance_profile: {
        freelancer_id: "mock-alex-dev",
        professional_title: "Senior Full Stack Developer",
        hourly_rate: 75,
        availability: "available",
        experience_level: "expert",
        years_experience: 5,
        portfolio_url: "https://alexrodriguez.dev/portfolio",
        completed_projects: 52,
        client_satisfaction: 96,
        freelance_rating: 4.8,
        is_available_for_hire: true,
        specializations: [
          "React Development",
          "API Design",
          "E-commerce Solutions",
          "Mobile-First Design",
        ],
        preferred_project_types: [
          "Web Applications",
          "E-commerce",
          "SaaS Platforms",
        ],
        min_project_budget: 1000,
        max_project_budget: 50000,
        services_offered: [
          {
            id: "service-1",
            service_name: "Full Stack Web Application",
            description:
              "Complete web application development from concept to deployment",
            category: "Development",
            price_range: { min: 2000, max: 15000 },
            delivery_time: 21,
            featured: true,
          },
        ],
      },
    },
    app_metadata: {},
    aud: "authenticated",
    username: () => "alex_dev",
    mock_data: {
      posts: [
        {
          id: "post-1",
          content:
            "Just deployed a new e-commerce platform for a client! 🚀 Built with React, Node.js, and PostgreSQL. The performance improvements are incredible - 40% faster load times! #WebDev #React #Performance",
          image: "https://source.unsplash.com/800x600/?ecommerce,website",
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          likes: 156,
          comments: 34,
          shares: 18,
        },
      ],
      products: [],
      services: [
        {
          id: "service-1",
          title: "Full Stack Web Development",
          description:
            "Complete web application development from design to deployment",
          category: "Development",
          price_range: { min: 2000, max: 15000 },
          delivery_time: 21,
          featured: true,
        },
        {
          id: "service-2",
          title: "API Development & Integration",
          description:
            "RESTful API development and third-party service integration",
          category: "Backend",
          price_range: { min: 800, max: 5000 },
          delivery_time: 10,
          featured: false,
        },
      ],
      trades: [],
      reviews: [],
      followers: [],
      following: [],
    },
  },

  // Crypto Trader
  mike_crypto: {
    id: "mock-mike-crypto",
    email: "mike@cryptotrader.pro",
    name: "Mike Thompson",
    avatar:
      "https://ui-avatars.com/api/?name=Mike+Thompson&background=f59e0b&color=fff&size=256",
    points: 9200,
    level: "diamond",
    role: "user",
    created_at: "2020-12-10T00:00:00Z",
    user_metadata: {
      name: "Mike Thompson",
      avatar:
        "https://ui-avatars.com/api/?name=Mike+Thompson&background=f59e0b&color=fff&size=256",
    },
    profile: {
      id: "mock-mike-crypto",
      username: "mike_crypto",
      full_name: "Mike Thompson",
      avatar_url:
        "https://ui-avatars.com/api/?name=Mike+Thompson&background=f59e0b&color=fff&size=256",
      banner_url:
        "https://source.unsplash.com/1200x400/?cryptocurrency,bitcoin",
      bio: "₿ Crypto Trader & Blockchain Enthusiast\n📈 3+ years in crypto markets | DeFi specialist\n🎯 Technical analysis & risk management expert\n\n🔥 Sharing market insights and trading strategies\n💎 HODL believer with active trading approach\n🌐 Building the future of decentralized finance",
      location: "Austin, TX",
      website: "https://cryptoinsights.blog",
      is_verified: true,
      points: 9200,
      level: "diamond",
      reputation: 4.7,
      followers_count: 5600,
      following_count: 1200,
      posts_count: 234,
      profile_views: 45600,
      join_date: "2020-12-10T00:00:00Z",
      last_active: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      is_online: true,
      skills: [
        "Technical Analysis",
        "Risk Management",
        "DeFi",
        "Blockchain Technology",
        "Market Research",
      ],
      interests: [
        "Cryptocurrency",
        "Blockchain",
        "Finance",
        "Technology",
        "Economics",
      ],
      languages: ["English"],
      crypto_profile: {
        crypto_user_id: "mock-mike-crypto",
        trading_experience: "expert",
        risk_tolerance: "medium",
        preferred_trading_pairs: ["BTC/USD", "ETH/USD", "ADA/USD", "SOL/USD"],
        favorite_cryptocurrencies: ["Bitcoin", "Ethereum", "Cardano", "Solana"],
        total_trades: 847,
        successful_trades: 623,
        p2p_trading_enabled: true,
        p2p_rating: 4.8,
        p2p_completed_trades: 156,
        kyc_level: 3,
        two_factor_enabled: true,
        preferred_payment_methods: ["Bank Transfer", "PayPal", "Crypto"],
        trading_limits: {
          daily_limit: 50000,
          weekly_limit: 200000,
          monthly_limit: 500000,
        },
      },
    },
    app_metadata: {},
    aud: "authenticated",
    username: () => "mike_crypto",
    mock_data: {
      posts: [
        {
          id: "post-1",
          content:
            "Bitcoin breaking through resistance levels! 📈 This could be the start of the next bull run. Remember to DYOR and manage your risk. Not financial advice! #Bitcoin #Crypto #TechnicalAnalysis",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 234,
          comments: 67,
          shares: 45,
        },
      ],
      products: [],
      services: [],
      trades: [
        {
          id: "trade-1",
          pair: "BTC/USD",
          amount: 0.5,
          price: 43500,
          type: "buy",
          status: "completed",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      reviews: [],
      followers: [],
      following: [],
    },
  },

  // Content Creator
  emma_creates: {
    id: "mock-emma-creates",
    email: "emma@contentcreator.com",
    name: "Emma Wilson",
    avatar:
      "https://ui-avatars.com/api/?name=Emma+Wilson&background=ec4899&color=fff&size=256",
    points: 4200,
    level: "silver",
    role: "user",
    created_at: "2022-01-18T00:00:00Z",
    user_metadata: {
      name: "Emma Wilson",
      avatar:
        "https://ui-avatars.com/api/?name=Emma+Wilson&background=ec4899&color=fff&size=256",
    },
    profile: {
      id: "mock-emma-creates",
      username: "emma_creates",
      full_name: "Emma Wilson",
      avatar_url:
        "https://ui-avatars.com/api/?name=Emma+Wilson&background=ec4899&color=fff&size=256",
      banner_url: "https://source.unsplash.com/1200x400/?creativity,art",
      bio: "🎨 Digital Artist & Content Creator\n📸 Sharing creativity and inspiration daily\n✨ Teaching design through visual storytelling\n\n🌟 Helping brands tell their stories\n🎯 Specializing in social media content\n💫 Let's create something amazing together!",
      location: "Los Angeles, CA",
      website: "https://emmawilson.art",
      is_verified: false,
      points: 4200,
      level: "silver",
      reputation: 4.6,
      followers_count: 8900,
      following_count: 2300,
      posts_count: 445,
      profile_views: 67800,
      join_date: "2022-01-18T00:00:00Z",
      last_active: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      is_online: true,
      skills: [
        "Digital Art",
        "Content Creation",
        "Social Media",
        "Photography",
        "Brand Design",
      ],
      interests: ["Art", "Design", "Photography", "Travel", "Fashion", "Music"],
      languages: ["English", "French"],
      social_profile: {
        content_creator: true,
        follower_milestone: 8900,
        content_categories: ["Art", "Design", "Lifestyle"],
        posting_frequency: "Daily",
        engagement_rate: 8.5,
        collaborations_completed: 23,
        brand_partnerships: ["Adobe", "Canva", "Wacom"],
        monetization_enabled: true,
        verified_creator: false,
      },
    },
    app_metadata: {},
    aud: "authenticated",
    username: () => "emma_creates",
    mock_data: {
      posts: [
        {
          id: "post-1",
          content:
            "New digital art piece finished! 🎨✨ This one was inspired by the sunset at Venice Beach. Sometimes the best inspiration comes from just stepping outside and observing the world around us. #DigitalArt #Inspiration #VeniceBeach",
          image: "https://source.unsplash.com/800x600/?digital,art",
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          likes: 287,
          comments: 45,
          shares: 23,
        },
      ],
      products: [],
      services: [],
      trades: [],
      reviews: [],
      followers: [],
      following: [],
    },
  },
};

// Function to get a random mock user
export const getRandomMockUser = (): MockUser => {
  const userKeys = Object.keys(mockUsers);
  const randomKey = userKeys[Math.floor(Math.random() * userKeys.length)];
  return mockUsers[randomKey];
};

// Function to get multiple random users
export const getRandomMockUsers = (count: number): MockUser[] => {
  const userKeys = Object.keys(mockUsers);
  const shuffled = userKeys.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((key) => mockUsers[key]);
};

// Function to search mock users by username
export const searchMockUsers = (query: string): MockUser[] => {
  if (!query) return Object.values(mockUsers);

  return Object.values(mockUsers).filter(
    (user) =>
      user.profile?.username?.toLowerCase().includes(query.toLowerCase()) ||
      user.profile?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      user.profile?.bio?.toLowerCase().includes(query.toLowerCase()),
  );
};

// Export individual users for easy access
export const { sarah_tech, alex_dev, mike_crypto, emma_creates } = mockUsers;
