import {
  UserProfile,
  MockUser,
} from "@/types/user";
import { Product } from "@/types/marketplace";

function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowMinus(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function product(partial: Partial<Product>): Product {
  return {
    id: partial.id || randomId("prod"),
    name: partial.name || "Sample Product",
    description: partial.description || "High quality product for demo purposes.",
    price: partial.price ?? 99.99,
    discountPrice: partial.discountPrice,
    image: partial.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
    images: partial.images || [],
    category: partial.category || "Electronics",
    subcategory: partial.subcategory,
    rating: partial.rating ?? 4.6,
    reviewCount: partial.reviewCount ?? 128,
    inStock: partial.inStock ?? true,
    stockQuantity: partial.stockQuantity ?? 50,
    isNew: partial.isNew ?? false,
    isFeatured: partial.isFeatured ?? true,
    isSponsored: partial.isSponsored ?? false,
    boostedUntil: partial.boostedUntil,
    tags: partial.tags || ["featured"],
    sellerId: partial.sellerId || "seller_1",
    sellerName: partial.sellerName || "Demo Seller",
    sellerAvatar: partial.sellerAvatar || "https://api.dicebear.com/7.x/initials/svg?seed=DS",
    sellerRating: partial.sellerRating ?? 4.8,
    sellerVerified: partial.sellerVerified ?? true,
    specifications: partial.specifications || [],
    variants: partial.variants || [],
    shippingInfo: partial.shippingInfo || {
      weight: 1.2,
      dimensions: { length: 20, width: 15, height: 8, unit: "cm" },
      freeShipping: true,
      estimatedDelivery: "3-5 business days",
      expressAvailable: true,
      internationalShipping: true,
    },
    returnPolicy: partial.returnPolicy || "30-day returns",
    warranty: partial.warranty || "1 year limited warranty",
    condition: partial.condition || "new",
    brand: partial.brand || "Eloity",
    model: partial.model || "Model X",
    weight: partial.weight || 1.2,
    dimensions: partial.dimensions || { length: 20, width: 15, height: 8, unit: "cm" },
    createdAt: partial.createdAt || nowMinus(10),
    updatedAt: partial.updatedAt || nowMinus(1),
  };
}

function baseProfile(id: string, username: string, fullName: string, bio: string): UserProfile {
  return {
    id,
    username,
    full_name: fullName,
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&size=256`,
    banner_url: `https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=1200`,
    bio,
    location: "San Francisco, CA",
    website: `https://example.com/${username}`,
    is_verified: true,
    points: 4200,
    level: "gold",
    reputation: 4.7,
    followers_count: 12800,
    following_count: 320,
    posts_count: 245,
    profile_views: 154000,
    join_date: nowMinus(260),
    last_active: nowMinus(0.2),
    is_online: true,
    profile_visibility: "public",
    allow_direct_messages: true,
    allow_notifications: true,
    skills: ["React", "TypeScript", "Design"],
    interests: ["AI", "Crypto", "E-commerce"],
    languages: ["English"],
    achievements: [
      {
        id: randomId("ach"),
        name: "Early Adopter",
        description: "Joined Eloity in its early days",
        icon: "🌟",
        category: "milestone",
        rarity: "rare",
        earned_at: nowMinus(250),
        progress: 100,
        max_progress: 100,
      },
    ],
    badges: [
      {
        id: randomId("bdg"),
        name: "Verified",
        description: "Verified creator",
        icon: "✔️",
        color: "#3b82f6",
        earned_at: nowMinus(200),
        type: "verification",
      },
    ],
  };
}

function makeUser(
  key: string,
  fullName: string,
  roleHint: "seller" | "freelancer" | "trader" | "creator",
): MockUser {
  const id = randomId("user");
  const profile = baseProfile(id, key, fullName, `${fullName} — ${roleHint} on Eloity.`);

  if (roleHint === "seller" || roleHint === "creator") {
    profile.marketplace_profile = {
      seller_id: id,
      store_name: `${fullName} Store`,
      store_description: "Quality products and excellent service.",
      store_logo: profile.avatar_url,
      store_banner: profile.banner_url,
      business_type: "individual",
      store_rating: 4.8,
      total_sales: 1240,
      total_orders: 1480,
      response_rate: 98,
      response_time: "1h",
      seller_level: "platinum",
      seller_badges: ["Top Seller", "Fast Responder"],
      featured_products: [],
      store_categories: ["Electronics", "Accessories"],
      payment_methods_accepted: ["card", "wallet", "bank"],
      shipping_locations: ["US", "EU", "NG"],
    };
  }

  if (roleHint === "freelancer" || roleHint === "creator") {
    profile.freelance_profile = {
      freelancer_id: id,
      professional_title: "Senior Full-Stack Developer",
      hourly_rate: 75,
      availability: "available",
      experience_level: "expert",
      years_experience: 7,
      portfolio_url: `https://dribbble.com/${key}`,
      services_offered: [
        {
          id: randomId("svc"),
          service_name: "Web App Development",
          description: "React/Node full-stack web applications",
          category: "Development",
          price_range: { min: 1500, max: 15000 },
          delivery_time: 14,
          featured: true,
        },
      ],
      completed_projects: 86,
      client_satisfaction: 98,
      on_time_delivery: 97,
      freelance_rating: 4.9,
      is_available_for_hire: true,
      preferred_communication: ["chat", "video"],
      working_hours: "9am-5pm",
      time_zone: "UTC-7",
      profile_completion: 100,
    };
  }

  if (roleHint === "trader" || roleHint === "creator") {
    profile.crypto_profile = {
      crypto_user_id: id,
      trading_experience: "advanced",
      risk_tolerance: "medium",
      preferred_trading_pairs: ["BTC/USDT", "ETH/USDT"],
      favorite_cryptocurrencies: ["BTC", "ETH", "SOL"],
      portfolio_value: 24500,
      total_trades: 860,
      successful_trades: 622,
      trading_volume: 1_250_000,
      p2p_trading_enabled: true,
      p2p_rating: 4.7,
      p2p_completed_trades: 180,
      kyc_level: 2,
      two_factor_enabled: true,
      preferred_payment_methods: ["bank_transfer", "wallet"],
      trading_limits: { daily_limit: 10000, weekly_limit: 50000, single_trade_limit: 5000 },
      staking_preferences: { preferred_tokens: ["ETH", "SOL"], min_staking_period: 30, auto_compound: true, risk_level: "medium" },
      defi_activity: { total_value_locked: 8200, liquidity_pools: ["ETH/USDC"], yield_farming: true, lending_borrowing: true, dex_trading: true },
      security_settings: { withdrawal_whitelist: [], api_trading_enabled: false, session_timeout: 30, login_notifications: true, suspicious_activity_alerts: true },
    };
  }

  const mockData = {
    posts: [
      {
        id: randomId("post"),
        content: "Launching a new project today!",
        createdAt: nowMinus(1),
        likes: 128,
        comments: 12,
        shares: 6,
      },
    ],
    products: [
      product({ name: "Wireless Headphones", price: 129.99, sellerId: id, sellerName: fullName }),
      product({ name: "Mechanical Keyboard", price: 89.0, sellerId: id, sellerName: fullName }),
    ],
    services: profile.freelance_profile ? profile.freelance_profile.services_offered || [] : [],
    trades: [
      { id: randomId("trade"), pair: "BTC/USDT", side: "buy", amount: 0.05, price: 45000, status: "completed" },
    ],
    reviews: [
      { id: randomId("rev"), rating: 5, content: "Excellent service and fast delivery!" },
    ],
    followers: ["user_a", "user_b"],
    following: ["user_c"],
  } as any;

  const u: MockUser = {
    id,
    email: `${key}@eloity.com`,
    name: fullName,
    avatar: profile.avatar_url!,
    points: profile.points || 0,
    level: profile.level || "silver",
    role: "user",
    created_at: profile.join_date!,
    user_metadata: { name: fullName, avatar: profile.avatar_url! },
    app_metadata: {},
    aud: "authenticated",
    profile,
    username: (_: string, username: any) => username,
    mock_data: mockData,
  };

  return u;
}

export const sarah_tech = makeUser("sarah_tech", "Sarah Johnson", "seller");
export const alex_dev = makeUser("alex_dev", "Alex Rivera", "freelancer");
export const mike_crypto = makeUser("mike_crypto", "Mike Chen", "trader");
export const emma_creates = makeUser("emma_creates", "Emma Wilson", "creator");

export const mockUsers: Record<string, MockUser> = {
  sarah_tech,
  alex_dev,
  mike_crypto,
  emma_creates,
};

export const getRandomMockUser = (): MockUser | null => {
  const keys = Object.keys(mockUsers);
  if (!keys.length) return null;
  const k = keys[Math.floor(Math.random() * keys.length)];
  return mockUsers[k];
};

export const getRandomMockUsers = (count: number): MockUser[] => {
  const keys = Object.keys(mockUsers);
  if (count >= keys.length) return keys.map(k => mockUsers[k]);
  const selected = new Set<string>();
  while (selected.size < count) {
    selected.add(keys[Math.floor(Math.random() * keys.length)]);
  }
  return Array.from(selected).map(k => mockUsers[k]);
};

export const searchMockUsers = (query: string): MockUser[] => {
  const q = query.toLowerCase();
  return Object.values(mockUsers).filter(u =>
    (u.name || "").toLowerCase().includes(q) ||
    (u.profile?.username || "").toLowerCase().includes(q) ||
    (u.profile?.bio || "").toLowerCase().includes(q)
  );
};
