import { User } from "@supabase/supabase-js";

// Core User Profile Interface
export interface UserProfile {
  // Basic Information
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";

  // Platform Stats
  is_verified?: boolean;
  points?: number;
  level?: UserLevel;
  role?: string;
  reputation?: number;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  profile_views?: number;
  join_date?: string;
  last_active?: string;
  is_online?: boolean;

  // Premium Subscription Status
  is_premium?: boolean;
  premium_tier?: "free" | "creator" | "professional" | "enterprise";
  subscription_status?: "active" | "cancelled" | "expired" | "trial";
  subscription_expires_at?: string;
  subscription_auto_renew?: boolean;
  subscription_created_at?: string;

  // Privacy Settings
  profile_visibility?: "public" | "followers" | "private";
  show_email?: boolean;
  show_phone?: boolean;
  show_location?: boolean;
  allow_direct_messages?: boolean;
  allow_notifications?: boolean;

  // Financial Information
  bank_account_name?: string;
  bank_account_number?: string;
  bank_name?: string;
  preferred_currency?: string;
  timezone?: string;

  // KYC and Verification
  kyc_level?: 0 | 1 | 2 | 3;
  kyc_verified_at?: string;

  // Extended Profile Features
  marketplace_profile?: MarketplaceProfile;
  freelance_profile?: FreelanceProfile;
  crypto_profile?: CryptoProfile;
  social_profile?: SocialProfile;
  business_profile?: BusinessProfile;
  skills?: string[];
  interests?: string[];
  languages?: string[];
  achievements?: Achievement[];
  badges?: Badge[];
}

// Marketplace-specific profile information
export interface MarketplaceProfile {
  seller_id?: string;
  store_name?: string;
  store_description?: string;
  store_logo?: string;
  store_banner?: string;
  business_type?: "individual" | "business";
  business_registration?: string;
  tax_id?: string;
  return_policy?: string;
  shipping_policy?: string;
  refund_policy?: string;
  store_rating?: number;
  total_sales?: number;
  total_orders?: number;
  response_rate?: number;
  response_time?: string;
  store_created_at?: string;
  is_store_active?: boolean;
  seller_level?: "bronze" | "silver" | "gold" | "platinum";
  seller_badges?: string[];
  featured_products?: string[];
  store_categories?: string[];
  payment_methods_accepted?: string[];
  shipping_locations?: string[];
  business_hours?: BusinessHours;
  social_media_links?: SocialMediaLinks;
}

// Freelance-specific profile information
export interface FreelanceProfile {
  freelancer_id?: string;
  professional_title?: string;
  hourly_rate?: number;
  availability?: "available" | "busy" | "unavailable";
  experience_level?: "entry" | "intermediate" | "expert";
  years_experience?: number;
  portfolio_url?: string;
  resume_url?: string;
  certifications?: Certification[];
  education?: Education[];
  work_experience?: WorkExperience[];
  services_offered?: ServiceOffered[];
  specializations?: string[];
  preferred_project_types?: string[];
  min_project_budget?: number;
  max_project_budget?: number;
  completed_projects?: number;
  client_satisfaction?: number;
  on_time_delivery?: number;
  freelance_rating?: number;
  is_available_for_hire?: boolean;
  preferred_communication?: string[];
  working_hours?: string;
  time_zone?: string;
  profile_completion?: number;
}

// Crypto-specific profile information
export interface CryptoProfile {
  crypto_user_id?: string;
  trading_experience?: "beginner" | "intermediate" | "advanced" | "expert";
  risk_tolerance?: "low" | "medium" | "high";
  preferred_trading_pairs?: string[];
  favorite_cryptocurrencies?: string[];
  portfolio_value?: number;
  total_trades?: number;
  successful_trades?: number;
  trading_volume?: number;
  p2p_trading_enabled?: boolean;
  p2p_rating?: number;
  p2p_completed_trades?: number;
  kyc_level?: 0 | 1 | 2 | 3;
  kyc_verified_at?: string;
  two_factor_enabled?: boolean;
  preferred_payment_methods?: string[];
  trading_limits?: TradingLimits;
  staking_preferences?: StakingPreferences;
  defi_activity?: DeFiActivity;
  security_settings?: SecuritySettings;
}

// Social media and content creation profile
export interface SocialProfile {
  content_creator?: boolean;
  follower_milestone?: number;
  content_categories?: string[];
  posting_frequency?: string;
  engagement_rate?: number;
  top_performing_posts?: string[];
  collaborations_completed?: number;
  brand_partnerships?: string[];
  monetization_enabled?: boolean;
  creator_fund_eligible?: boolean;
  verified_creator?: boolean;
  content_guidelines_accepted?: boolean;
}

// Business profile for companies/organizations
export interface BusinessProfile {
  company_name?: string;
  company_size?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  industry?: string;
  company_description?: string;
  founded_year?: number;
  headquarters?: string;
  company_website?: string;
  company_email?: string;
  company_phone?: string;
  linkedin_page?: string;
  company_registration_number?: string;
  vat_number?: string;
  is_verified_business?: boolean;
  verification_documents?: string[];
  team_members?: TeamMember[];
  departments?: string[];
  company_culture?: string[];
  hiring?: boolean;
  remote_work_policy?: "office" | "remote" | "hybrid";
}

// Supporting interfaces
export interface BusinessHours {
  monday?: TimeSlot;
  tuesday?: TimeSlot;
  wednesday?: TimeSlot;
  thursday?: TimeSlot;
  friday?: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
}

export interface TimeSlot {
  open: string;
  close: string;
  closed?: boolean;
}

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  telegram?: string;
  discord?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  verified: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
  gpa?: number;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description?: string;
  achievements?: string[];
}

export interface ServiceOffered {
  id: string;
  service_name: string;
  description: string;
  category: string;
  price_range: {
    min: number;
    max: number;
  };
  delivery_time: number; // in days
  featured: boolean;
}

export interface TradingLimits {
  daily_limit?: number;
  weekly_limit?: number;
  monthly_limit?: number;
  single_trade_limit?: number;
}

export interface StakingPreferences {
  preferred_tokens?: string[];
  min_staking_period?: number;
  auto_compound?: boolean;
  risk_level?: "low" | "medium" | "high";
}

export interface DeFiActivity {
  total_value_locked?: number;
  liquidity_pools?: string[];
  yield_farming?: boolean;
  lending_borrowing?: boolean;
  dex_trading?: boolean;
}

export interface SecuritySettings {
  withdrawal_whitelist?: string[];
  api_trading_enabled?: boolean;
  session_timeout?: number;
  login_notifications?: boolean;
  suspicious_activity_alerts?: boolean;
}

export interface TeamMember {
  user_id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  joined_date: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earned_at: string;
  progress?: number;
  max_progress?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at: string;
  type: "verification" | "achievement" | "milestone" | "special";
}

// Extended User interface
export interface ExtendedUser extends User {
  name: string;
  username: string;
  avatar: string;
  points: number;
  level: string;
  role: string;
  profile?: UserProfile;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
}

// User interaction interfaces
export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    is_verified: boolean;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read: boolean;
  sender?: {
    name: string;
    avatar: string;
  };
}

export interface ChatConversation {
  id: string;
  participants: string[];
  last_message?: ChatMessage;
  created_at: string;
  updated_at: string;
  unread_count: number;
  participant_profile?: {
    id: string;
    name: string;
    avatar: string;
    is_online: boolean;
  };
}

export type UserLevel = "bronze" | "silver" | "gold" | "platinum" | "diamond";

// P2P marketplace types
export interface P2POffer {
  id: string;
  type: "buy" | "sell";
  crypto_amount: number;
  crypto_symbol: string;
  fiat_price: number;
  fiat_currency: string;
  min_order: number;
  max_order: number;
  payment_methods: string[];
  seller: {
    id: string;
    name: string;
    avatar: string;
    is_verified: boolean;
    rating: number;
    total_trades: number;
  };
  created_at: string;
  status: "active" | "completed" | "cancelled";
}

// User relationship and interaction types
export interface UserRelationship {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  type: "follow" | "block" | "mute";
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  feed: FeedPreferences;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  product_updates: boolean;
  social_activity: boolean;
  trading_alerts: boolean;
  order_updates: boolean;
  security_alerts: boolean;
}

export interface PrivacySettings {
  profile_visibility: "public" | "followers" | "private";
  show_online_status: boolean;
  show_last_seen: boolean;
  allow_direct_messages: "everyone" | "followers" | "none";
  allow_tagging: boolean;
  show_activity_status: boolean;
  data_sharing: boolean;
}

export interface FeedPreferences {
  content_types: string[];
  languages: string[];
  sensitive_content: boolean;
  autoplay_videos: boolean;
  show_suggested_content: boolean;
}

// Mock user data for demonstration
export interface MockUser extends ExtendedUser {
  mock_data: {
    posts: any[];
    products: any[];
    services: any[];
    trades: any[];
    reviews: any[];
    followers: string[];
    following: string[];
  };
}
