import React, { useEffect, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { setupGlobalErrorHandlers } from "@/lib/error-handler";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { MarketplaceProvider } from "./contexts/MarketplaceContext";
import { EnhancedMarketplaceProvider } from "./contexts/EnhancedMarketplaceContext";
import { ChatProvider } from "./contexts/ChatContext";
import { WalletProvider } from "./contexts/WalletContext";
import { LiveContentProvider } from "./contexts/LiveContentContext";
import SafeThemeProvider from "./contexts/SafeThemeProvider";
import SafeI18nProvider from "./contexts/SafeI18nProvider";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { UnifiedNotificationProvider } from "./contexts/UnifiedNotificationContext";
import { FeedProvider } from "./contexts/FeedContext";
import { UserCollectionsProvider } from "./contexts/UserCollectionsContext";
import ErrorBoundary from "./components/ui/error-boundary";

import {
  AccessibilityProvider,
  AccessibilityControlPanel,
  KeyboardNavigationHelper,
  ReadingGuide,
} from "./components/accessibility/AccessibilityFeatures";
import { OnboardingTour } from "./components/onboarding/OnboardingTour";
import { NotificationSystem } from "./components/notifications/NotificationSystem";
import {
  ConnectionStatus,
  PWAInstallPrompt,
} from "./components/mobile/MobileOptimizations";
import { RewardNotificationContainer } from "./components/rewards/RewardNotification";

import AppLayout from "./components/layout/AppLayout";
import Auth from "./pages/Auth";
import Join from "./pages/Join";
import Home from "./pages/Home";
import EnhancedFeedWithTabs from "./pages/EnhancedFeedWithTabs";
import EnhancedFreelance from "./pages/EnhancedFreelance";
import FreelanceJobs from "./pages/freelance/FreelanceJobs";
// import RoleSwitcherDashboard from "./pages/freelance/RoleSwitcherDashboard";
import UnifiedFreelanceDashboard from "./pages/freelance/UnifiedFreelanceDashboard";
import { DashboardRouteGuard } from "./components/freelance/DashboardRouteGuard";
import UpdateProfile from "./pages/freelance/UpdateProfile";
import BrowseJobs from "./pages/freelance/BrowseJobs";
import Earnings from "./pages/freelance/Earnings";
import PostJob from "./pages/freelance/PostJob";
import PostSkill from "./pages/freelance/PostSkill";
import FindFreelancers from "./pages/freelance/FindFreelancers";
import ManageProjects from "./pages/freelance/ManageProjects";
import FreelancerManageProjects from "./pages/freelance/FreelancerManageProjects";
import ApproveWork from "./pages/freelance/ApproveWork";
// import JobDetailPage from "./pages/freelance/JobDetailPage";
// import Inbox from "./chat/Inbox";
import ChatRoom from "./pages/ChatRoom";
import SimpleChatRoom from "./pages/SimpleChatRoom";
import EnhancedProfile from "./pages/EnhancedProfile";
import UnifiedProfile from "./pages/UnifiedProfile";
import ProfileStats from "./pages/profile/ProfileStats";
import ProfileFollowers from "./pages/profile/ProfileFollowers";
import ProfileFollowing from "./pages/profile/ProfileFollowing";
import ProfileViews from "./pages/profile/ProfileViews";
import UserStore from "./pages/profile/UserStore";
import UserProjects from "./pages/profile/UserProjects";
import UserTrades from "./pages/profile/UserTrades";
import Wallet from "./pages/Wallet";
import WalletAnalytics from "./pages/wallet/WalletAnalytics";
import WalletTransactions from "./pages/wallet/WalletTransactions";
import WalletIntegrations from "./pages/wallet/WalletIntegrations";
import WalletCards from "./pages/wallet/WalletCards";
import GiftCards from "./pages/wallet/GiftCards";
import SendMoney from "./pages/wallet/SendMoney";
import Request from "./pages/wallet/Request";
import Deposit from "./pages/wallet/Deposit";
import Withdraw from "./pages/wallet/Withdraw";
import Transfer from "./pages/wallet/Transfer";
import PayBills from "./pages/wallet/PayBills";
import TopUp from "./pages/wallet/TopUp";
import BuyGiftCards from "./pages/wallet/BuyGiftCards";
import SellGiftCards from "./pages/wallet/SellGiftCards";
// Crypto pages
import CryptoKYC from "./pages/CryptoKYC";
import UniversalCryptoPayment from "./pages/UniversalCryptoPayment";
import CryptoDeposit from "./pages/crypto/CryptoDeposit";
import CryptoWithdraw from "./pages/crypto/CryptoWithdraw";
import CreateP2POffer from "./pages/crypto/CreateP2POffer";
// Freelance pages
import CreateJob from "./pages/freelance/CreateJob";
import ApplyJob from "./pages/freelance/ApplyJob";
import MessageClient from "./pages/freelance/MessageClient";
// Phase 2 Modal Conversions
import CreateChallenge from "./pages/challenges/CreateChallenge";
import CreateBattle from "./pages/live/CreateBattle";
import CreateStream from "./pages/live/CreateStream";
import CreateStory from "./pages/feed/CreateStory";
import CreateContent from "./pages/content/Create";
// Phase 3 - Community Modal Conversions
import CreateGroupPage from "./pages/community/CreateGroup";
import ContributeToGroup from "./pages/community/ContributeToGroup";
import GroupContribution from "./pages/community/GroupContribution";
import CreateGroupVote from "./pages/community/CreateGroupVote";
import CreateEvent from "./pages/community/CreateEvent";
// Phase 3 - Profile Modal Conversions
import AddExternalWork from "./pages/profile/AddExternalWork";
import EditProfile from "./pages/profile/EditProfile";
// Phase 3 - Rewards Modal Conversions
import WithdrawRewards from "./pages/rewards/WithdrawRewards";
// import Marketplace from "./pages/Marketplace";
import EnhancedMarketplace from "./pages/EnhancedMarketplace";
import MarketplaceCart from "./pages/marketplace/MarketplaceCart";
import MarketplaceCheckout from "./pages/marketplace/MarketplaceCheckout";
import MarketplaceList from "./pages/marketplace/MarketplaceList";
import MarketplaceSeller from "./pages/marketplace/MarketplaceSeller";
import SellerDashboard from "./pages/marketplace/SellerDashboard";
import MarketplaceWishlist from "./pages/marketplace/MarketplaceWishlist";
import MarketplaceDashboard from "./pages/marketplace/MarketplaceDashboard";
import MarketplaceOrders from "./pages/marketplace/MarketplaceOrders";

// Delivery system imports
// import DeliveryHub from "./pages/DeliveryHub";
import DeliveryProviderRegistration from "./components/delivery/DeliveryProviderRegistration";
import DeliveryProviderDashboard from "./components/delivery/DeliveryProviderDashboard";
import Overview from "./pages/delivery/provider/Overview";
import Active from "./pages/delivery/provider/Active";
import { default as DeliveryEarnings } from "./pages/delivery/provider/Earnings";
import Reviews from "./pages/delivery/provider/Reviews";
import Vehicles from "./pages/delivery/provider/Vehicles";
import Analytics from "./pages/delivery/provider/Analytics";
import DeliveryTracking from "./components/delivery/DeliveryTracking";
import DeliveryProviderStatus from "./components/delivery/DeliveryProviderStatus";
import DeliveryProvidersAdmin from "./components/admin/DeliveryProvidersAdmin";
import DeliveryTrackingAdmin from "./components/admin/DeliveryTrackingAdmin";
import DeliveryTrackingPublic from "./pages/DeliveryTrackingPublic";
import DriverApplicationPublic from "./pages/DriverApplicationPublic";

// import CryptoMarket from "./pages/CryptoMarket";
// import EnhancedCrypto from "./pages/EnhancedCrypto";
import ProfessionalCrypto from "./pages/ProfessionalCrypto";
import CryptoTrading from "./pages/CryptoTrading";
import CryptoP2P from "./pages/CryptoP2P";
import CryptoPortfolio from "./pages/CryptoPortfolio";
import CryptoLearn from "./pages/CryptoLearn";
import DeFi from "./pages/DeFi";
import CourseDetail from "./pages/CourseDetail";
import LessonViewer from "./pages/LessonViewer";
import ArticleViewer from "./pages/ArticleViewer";
import NotFound from "./pages/NotFound";
// import Rewards from "./pages/Rewards";
import EnhancedSettings from "./pages/EnhancedSettings";
// import AdminDashboard from "./pages/admin/AdminDashboard";
import ComprehensiveAdminDashboard from "./pages/admin/ComprehensiveAdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminLogin from "./pages/AdminLogin";
import AdminManagement from "./pages/admin/AdminManagement";
import PlatformSettings from "./pages/admin/PlatformSettings";
import ContentModeration from "./pages/admin/ContentModeration";
import AdminMarketplace from "./pages/admin/AdminMarketplace";
import AdminCrypto from "./pages/admin/AdminCrypto";
import AdminDeFi from "./pages/admin/AdminDeFi";
import AdminGiftCards from "./pages/admin/AdminGiftCards";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminFreelance from "./pages/admin/AdminFreelance";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminGroupsPages from "./pages/admin/AdminGroupsPages";
import AdminKYC from "./pages/admin/AdminKYC";
import AdminFinancial from "./pages/admin/AdminFinancial";
import AdminChat from "./pages/admin/AdminChat";
import AdminBoosts from "./pages/admin/AdminBoosts";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/layout/AdminLayout";

// Import the Videos component with a different name to avoid conflicts
import VideosPage from "./pages/Videos";

import CameraPermissionTest from "./components/debug/CameraPermissionTest";
import FreelanceDashboardRouteTest from "./components/debug/FreelanceDashboardRouteTest";
import RouteTest from "./components/debug/RouteTest";
import DetailedJobPage from "./pages/DetailedJobPage";
import DetailedProductPage from "./pages/DetailedProductPage";
import DetailedEventPage from "./pages/DetailedEventPage";
import CreatorStudio from "./pages/CreatorStudio";
import EnhancedDashboardDemo from "./components/freelance/EnhancedDashboardDemo";
import UnifiedCreatorStudio from "./pages/UnifiedCreatorStudio";
import Chat from "./pages/Chat";
import ChatTest from "./pages/ChatTest";
// import Messages from "./pages/Messages";
import Explore from "./pages/Explore";
import FindUsers from "./pages/FindUsers";
import FindUsersPage from "./pages/chat/FindUsers";
import ImageUpload from "./pages/chat/ImageUpload";
import StickerCreation from "./pages/chat/StickerCreation";
import ShareMeme from "./pages/chat/ShareMeme";
import UserSearch from "./pages/search/UserSearch";
import DeleteAccount from "./pages/settings/DeleteAccount";
// Phase 3 - User List Modal Conversions
import UserFollowers from "./pages/profile/UserFollowers";
import UserFollowing from "./pages/profile/UserFollowing";
import UserViewers from "./pages/profile/UserViewers";
// Phase 3 - Crypto Detail Modal Conversion
import CryptoDetail from "./pages/crypto/CryptoDetail";
import CreateGroup from "./pages/CreateGroup";
import GlobalSearch from "./pages/GlobalSearch";
import LandingPage from "./pages/LandingPage";
import TestComponent from "./pages/TestComponent";
import SupabaseDebug from "./pages/SupabaseDebug";
import UnifiedNotifications from "./pages/UnifiedNotifications";
// import Create from "./pages/Create";
// import EnhancedPlatform from "./pages/EnhancedPlatform";
import EnhancedRewards from "./pages/EnhancedRewards";
import ProfileDemo from "./components/profile/ProfileDemo";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import CurrencyDemo from "./components/currency/CurrencyDemo";
import DataManagement from "./components/data/DataManagement";
import GamificationSystem from "./components/gamification/GamificationSystem";
import AIFeatures from "./components/ai/AIFeatures";
import AIPersonalAssistantDashboard from "./components/ai/AIPersonalAssistant";
import Blog from "./pages/Blog";
import SimpleBlog from "./pages/SimpleBlog";
import BlogPost from "./pages/BlogPost";
import CommunityEvents from "./pages/CommunityEvents";
import EventsRewards from "./pages/EventsRewards";
// import SubscriptionManager from "./components/premium/SubscriptionManager";
// import VirtualGiftsAndTips from "./components/premium/VirtualGiftsAndTips";
import EnhancedKYCVerification from "./components/kyc/EnhancedKYCVerification";
// import { LiveStreamCreator } from "./components/livestream/LiveStreamCreator";
import Groups from "./pages/Groups";
import Pages from "./pages/Pages";
import GroupDetailView from "./components/groups/GroupDetailView";
import PageDetailView from "./components/pages/PageDetailView";
import GroupManagement from "./pages/GroupManagement";
import PageManagement from "./pages/PageManagement";
import SendGifts from "./pages/SendGifts";
import PostDetail from "./pages/PostDetail";
// import FeedToggleDemo from "./pages/FeedToggleDemo";
// import IntegratedFeedDemo from "./pages/IntegratedFeedDemo";
import {
  AdsPage,
  MemoriesPage,
  SavedPage,
  SupportPage,
  HelpPage,
} from "./pages/PlaceholderPages";
import Friends from "./pages/Friends";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiesPolicy from "./pages/CookiesPolicy";
import AdvertisingPolicy from "./pages/AdvertisingPolicy";
import DispatchPartnerTerms from "./pages/DispatchPartnerTerms";
import LegalInformation from "./pages/LegalInformation";
import AdChoices from "./pages/AdChoices";
import MonetizationPolicy from "./pages/MonetizationPolicy";
import Premium from "./pages/Premium";
import CampaignCenter from "./components/campaigns/CampaignCenter";
import MemeGifTest from "./components/debug/MemeGifTest";

// Import missing components
import MarketplaceSell from "./pages/marketplace/MarketplaceSell";
import VideoDetail from "./pages/VideoDetail";
import LiveStreamPage from "./pages/LiveStreamPage";
import BattlePage from "./pages/BattlePage";
import {
  ServiceDetail,
  FreelancerProfile,
  UserPosts,
  TrustScore,
  UserLikes,
  UserShares,
  CryptoProfile,
  DeliveryProfile
} from "./pages/MissingComponents";

// Create a query client with retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once to avoid excessive requests during auth issues
      refetchOnWindowFocus: false, // Disable refetching when window regains focus
    },
  },
});

// Protected route component - now properly typed
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, session, user } = useAuth() as any;
  const [showLoadingTimeout, setShowLoadingTimeout] = React.useState(false);

  // Set a timeout to prevent infinite loading state
  React.useEffect(() => {
    if (!isLoading) {
      setShowLoadingTimeout(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowLoadingTimeout(true);
    }, 12000); // Show timeout message after 12 seconds

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  const hasAuth = !!session || !!user || isAuthenticated;

  // If loading and has auth, let it through (auth is just verifying)
  if (isLoading && hasAuth) {
    return <>{children}</>;
  }

  // If loading and no auth, show loading screen with timeout fallback
  if (isLoading && !hasAuth) {
    if (showLoadingTimeout) {
      return (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center px-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground mb-4">Taking longer than expected...</p>
            <p className="text-sm text-muted-foreground mb-6">Trying to reload authentication.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not loading, check if authenticated
  if (!hasAuth) {
    console.log("Not authenticated, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  console.log("Authentication confirmed, rendering protected route");
  return <>{children}</>;
};

// Messages redirect component to handle threadId parameter
const MessagesRedirect = () => {
  const { threadId } = useParams();
  return <Navigate to={`/app/chat/${threadId}`} replace />;
};

// Legacy admin route - currently unused
/*
const LegacyAdminRoute = ({ children }: LegacyAdminRouteProps) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin rights...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/app/feed" replace />;
  }

  return <>{children}</>;
};
*/

// Global call state component (simplified - no incoming call simulation)
const GlobalCallProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

// App routes component that uses auth context
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("App routes: Auth state", { isAuthenticated, isLoading });

  return (
    <Routes>
      {/* Admin login - accessible without authentication */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Root path shows original feature-rich landing page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/test" element={<TestComponent />} />
      <Route path="/supabase-debug" element={<SupabaseDebug />} />
      <Route path="/home" element={<Home />} />
      {/* Commented out route for missing MemeGifDemo component */}
      {/* <Route path="/meme-gif-demo" element={<MemeGifDemo />} /> */}
      <Route path="/meme-gif-test" element={<MemeGifTest />} />

      {/* Public Blog routes - accessible to everyone */}
      <Route
        path="/blog"
        element={
          <ErrorBoundary fallback={<SimpleBlog />}>
            <Blog />
          </ErrorBoundary>
        }
      />
      <Route path="/blog/:slug" element={<BlogPost />} />

      {/* Public Delivery routes - accessible to everyone */}
      <Route path="/delivery/track" element={<DeliveryTrackingPublic />} />
      <Route path="/delivery/apply" element={<DriverApplicationPublic />} />

      {/* Public Legal routes - accessible to everyone */}
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/cookies" element={<CookiesPolicy />} />
      <Route path="/advertising" element={<AdvertisingPolicy />} />
      <Route path="/dispatch-partner-terms" element={<DispatchPartnerTerms />} />
      <Route path="/legal" element={<LegalInformation />} />

      {/* Join route - for referral links */}
      <Route path="/join" element={<Join />} />

      {/* Auth route - handle loading state and redirects */}
      <Route
        path="/auth"
        element={
          isAuthenticated ? <Navigate to="/app/feed" replace /> : <Auth />
        }
      />

      {/* Protected routes - always register, ProtectedRoute will handle loading */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <FeedProvider>
                <WalletProvider>
                  <LiveContentProvider>
                    <MarketplaceProvider>
                      <EnhancedMarketplaceProvider>
                        <ChatProvider>
                          <AppLayout />
                        </ChatProvider>
                      </EnhancedMarketplaceProvider>
                    </MarketplaceProvider>
                  </LiveContentProvider>
                </WalletProvider>
              </FeedProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="feed" replace />} />
          <Route path="feed" element={<EnhancedFeedWithTabs />} />
          {/* <Route path="feed-demo" element={<FeedWithFollowDemo />} */}
          <Route path="create" element={<EnhancedFreelance />} />
          <Route path="freelance" element={<FreelanceJobs />} />
          <Route
            path="freelance/dashboard"
            element={
              <DashboardRouteGuard>
                <UnifiedFreelanceDashboard />
              </DashboardRouteGuard>
            }
          />
          <Route
            path="freelance/dashboard/freelancer"
            element={
              <DashboardRouteGuard>
                <UnifiedFreelanceDashboard />
              </DashboardRouteGuard>
            }
          />
          <Route
            path="freelance/dashboard/client"
            element={
              <DashboardRouteGuard>
                <UnifiedFreelanceDashboard />
              </DashboardRouteGuard>
            }
          />
          <Route path="freelance/update-profile" element={<UpdateProfile />} />
          <Route path="freelance/browse-jobs" element={<BrowseJobs />} />
          <Route path="freelance/earnings" element={<Earnings />} />
          <Route path="freelance/post-job" element={<PostJob />} />
          <Route path="freelance/post-skill" element={<PostSkill />} />
          <Route path="freelance/find-freelancers" element={<FindFreelancers />} />
          <Route path="freelance/manage-projects" element={<ManageProjects />} />
          <Route path="freelance/freelancer-projects" element={<FreelancerManageProjects />} />
          <Route path="freelance/approve-work" element={<ApproveWork />} />
          <Route path="freelance/job/:jobId" element={<DetailedJobPage />} />
          <Route path="freelance/service/:serviceId" element={<ServiceDetail />} />
          <Route path="freelance/profile/:username" element={<FreelancerProfile />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:threadId" element={<ChatRoom />} />
          <Route path="chat-test/:threadId" element={<ChatTest />} />
          <Route path="chat-simple/:threadId" element={<SimpleChatRoom />} />
          <Route path="chat/find-users" element={<FindUsersPage />} />
          <Route path="chat/create-group" element={<CreateGroup />} />
          <Route
            path="messages"
            element={<Navigate to="/app/chat" replace />}
          />
          <Route path="messages/:threadId" element={<MessagesRedirect />} />
          {/* <Route path="chat-demo" element={<ChatDemo />} /> */}
          <Route path="profile" element={<EnhancedProfile />} />
          <Route path="profile/:username" element={<EnhancedProfile />} />
          <Route path="profile/:username/stats" element={<ProfileStats />} />
          {/* Phase 3 - User List Full Page Conversions */}
          <Route path="profile/:username/followers" element={<UserFollowers />} />
          <Route path="profile/:username/following" element={<UserFollowing />} />
          <Route path="profile/:username/viewers" element={<UserViewers />} />
          <Route path="profile/:username/posts" element={<UserPosts />} />
          <Route path="profile/:username/trust" element={<TrustScore />} />
          <Route path="profile/:username/likes" element={<UserLikes />} />
          <Route path="profile/:username/shares" element={<UserShares />} />
          <Route path="profile/:username/store" element={<UserStore />} />
          <Route path="profile/:username/projects" element={<UserProjects />} />
          <Route path="profile/:username/trades" element={<UserTrades />} />
          <Route path="user/:username" element={<EnhancedProfile />} />
          <Route path="unified-profile" element={<UnifiedProfile />} />
          <Route path="unified-profile/:username" element={<UnifiedProfile />} />
          <Route path="demo/profiles" element={<ProfileDemo />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="wallet/analytics" element={<WalletAnalytics />} />
          <Route path="wallet/transactions" element={<WalletTransactions />} />
          <Route path="wallet/integrations" element={<WalletIntegrations />} />
          <Route path="wallet/cards" element={<WalletCards />} />
          <Route path="wallet/gift-cards" element={<GiftCards />} />
          {/* Wallet Action Routes - Full Page Flows */}
          <Route path="wallet/send-money" element={<SendMoney />} />
          <Route path="wallet/request" element={<Request />} />
          <Route path="wallet/deposit" element={<Deposit />} />
          <Route path="wallet/withdraw" element={<Withdraw />} />
          <Route path="wallet/transfer" element={<Transfer />} />
          <Route path="wallet/pay-bills" element={<PayBills />} />
          <Route path="wallet/top-up" element={<TopUp />} />
          <Route path="wallet/buy-gift-cards" element={<BuyGiftCards />} />
          <Route path="wallet/sell-gift-cards" element={<SellGiftCards />} />

          {/* Crypto Trading Routes - Full Page Flows */}
          <Route path="crypto/kyc" element={<CryptoKYC />} />
          <Route path="crypto/payment" element={<UniversalCryptoPayment />} />
          <Route path="crypto/deposit" element={<CryptoDeposit />} />
          <Route path="crypto/withdraw" element={<CryptoWithdraw />} />
          <Route path="crypto/p2p/create-offer" element={<CreateP2POffer />} />
          {/* Phase 3 - Crypto Detail Full Page Conversion */}
          <Route path="crypto/coin/:symbol" element={<CryptoDetail />} />

          {/* Freelance Routes - Full Page Implementation */}
          <Route path="freelance/create-job" element={<CreateJob />} />
          <Route path="freelance/apply/:jobId" element={<ApplyJob />} />
          <Route path="freelance/message/:clientId" element={<MessageClient />} />

          {/* Content & Live Routes - Phase 2 Implementation COMPLETE */}
          <Route path="challenges/create" element={<CreateChallenge />} />
          <Route path="live/create-battle" element={<CreateBattle />} />
          <Route path="live/create-stream" element={<CreateStream />} />
          <Route path="feed/create-story" element={<CreateStory />} />
          <Route path="content/create" element={<CreateContent />} />

          {/* Group & Community Routes - Full Page Implementation COMPLETE */}
          <Route path="community/create-group" element={<CreateGroupPage />} />
          <Route path="community/create-event" element={<CreateEvent />} />
          <Route path="community/contribute/:contributionId" element={<ContributeToGroup />} />
          <Route path="community/group-contribution/:groupId" element={<GroupContribution />} />
          <Route path="community/vote/:groupId" element={<CreateGroupVote />} />

          {/* Profile Routes */}
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="profile/add-work" element={<AddExternalWork />} />

          {/* Rewards Routes - Full Page Implementation COMPLETE */}
          <Route path="rewards/withdraw" element={<WithdrawRewards />} />

          {/* Chat & Social Routes - Pending Full Page Implementation */}
          <Route path="chat/create-sticker" element={<StickerCreation />} />
          <Route path="chat/upload-image" element={<ImageUpload />} />
          <Route path="chat/share-meme" element={<ShareMeme />} />

          {/* Feed Routes - Pending Full Page Implementation */}
          {/* <Route path="feed/story/:storyId" element={<StoryViewerPage />} /> */}
          {/* <Route path="feed/check-in" element={<CheckInPage />} /> */}
          {/* <Route path="feed/feeling" element={<FeelingPage />} /> */}
          {/* <Route path="feed/location" element={<LocationPage />} /> */}
          {/* <Route path="feed/upload-media" element={<MediaUploadPage />} /> */}
          {/* <Route path="feed/tag-people" element={<TagPeoplePage />} /> */}
          {/* <Route path="feed/share/:postId" element={<SharePostPage />} /> */}

          {/* Other Routes - Pending Full Page Implementation */}
          {/* <Route path="verify/kyc" element={<KYCPage />} /> */}
          <Route path="search/users" element={<UserSearch />} />
          <Route path="settings/delete-account" element={<DeleteAccount />} />

          <Route path="notifications" element={<UnifiedNotifications />} />

          {/* Marketplace routes */}
          <Route path="marketplace" element={<EnhancedMarketplace />} />
          <Route
            path="marketplace/browse"
            element={<Navigate to="/app/marketplace" replace />}
          />
          <Route
            path="marketplace/products"
            element={<Navigate to="/app/marketplace" replace />}
          />
          <Route
            path="marketplace/shop"
            element={<Navigate to="/app/marketplace" replace />}
          />
          <Route path="marketplace/my" element={<MarketplaceDashboard />} />
          <Route path="marketplace/orders" element={<MarketplaceOrders />} />
          <Route path="marketplace/seller" element={<SellerDashboard />} />
          <Route path="marketplace/list" element={<MarketplaceList />} />
          <Route
            path="marketplace/seller/:username"
            element={<MarketplaceSeller />}
          />
          <Route
            path="marketplace/wishlist"
            element={<MarketplaceWishlist />}
          />
          <Route path="marketplace/cart" element={<MarketplaceCart />} />
          <Route path="marketplace/product/:productId" element={<DetailedProductPage />} />
          <Route
            path="marketplace/checkout"
            element={<MarketplaceCheckout />}
          />
          <Route path="marketplace/sell" element={<MarketplaceSell />} />

          {/* Delivery routes */}
          <Route path="delivery" element={<DeliveryProviderStatus />} />
          <Route path="delivery/provider/register" element={<DeliveryProviderRegistration />} />
          <Route path="delivery/provider/dashboard" element={<DeliveryProviderDashboard />}>
            <Route index element={<Overview />} />
            <Route path="overview" element={<Overview />} />
            <Route path="active" element={<Active />} />
            <Route path="earnings" element={<DeliveryEarnings />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
          <Route path="delivery/track" element={<DeliveryTracking />} />
          <Route path="delivery/track/:trackingNumber" element={<DeliveryTracking />} />

          <Route path="crypto" element={<ProfessionalCrypto />} />
          <Route path="crypto-trading" element={<CryptoTrading />} />
          <Route path="crypto-p2p" element={<CryptoP2P />} />
          <Route path="crypto-portfolio" element={<CryptoPortfolio />} />
          <Route path="crypto-learn" element={<CryptoLearn />} />
          <Route path="defi" element={<DeFi />} />
          <Route path="course/:courseId" element={<CourseDetail />} />
          <Route path="course/:courseId/lesson/:lessonId" element={<LessonViewer />} />
          <Route path="article/:articleId" element={<ArticleViewer />} />
          <Route path="crypto/profile/:username" element={<CryptoProfile />} />
          <Route path="delivery/profile/:username" element={<DeliveryProfile />} />
          <Route path="campaigns" element={<CampaignCenter />} />
          <Route path="rewards" element={<EnhancedRewards />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="videos/:videoId" element={<VideoDetail />} />
          <Route path="live/:id" element={<LiveStreamPage />} />
          <Route path="battle/:id" element={<BattlePage />} />
          {/* Commented out route for missing DuetDemo component */}
          {/* <Route path="duet-demo" element={<DuetDemo />} /> */}
          <Route path="explore" element={<Explore />} />
          <Route path="global-search" element={<GlobalSearch />} />
          <Route path="events" element={<CommunityEvents />} />
          <Route path="events/rewards" element={<EventsRewards />} />
          <Route path="events/:eventId" element={<DetailedEventPage />} />
          <Route path="premium" element={<Premium />} />
          <Route
            path="kyc"
            element={
              <div className="container mx-auto px-4 py-6">
                <div className="max-w-4xl mx-auto">
                  <EnhancedKYCVerification onComplete={() => {
                    // Handle completion - could navigate back or show success
                    window.history.back();
                  }} />
                </div>
              </div>
            }
          />
          <Route
            path="live-streaming"
            element={<Navigate to="/app/videos?tab=live" replace />}
          />
          <Route path="settings" element={<EnhancedSettings />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />

          {/* Facebook-style navigation pages */}
          <Route path="friends" element={<Friends />} />
          <Route path="groups" element={<Groups />} />
          <Route path="groups/:groupId" element={<GroupDetailView />} />
          <Route path="groups/:groupId/manage" element={<GroupManagement />} />
          <Route path="ads" element={<AdsPage />} />
          <Route path="memories" element={<MemoriesPage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="pages" element={<Pages />} />
          <Route path="pages/:pageId" element={<PageDetailView />} />
          <Route path="pages/:pageId/manage" element={<PageManagement />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="ad-choices" element={<AdChoices />} />
          <Route path="monetization-policy" element={<MonetizationPolicy />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="creator-studio" element={<CreatorStudio />} />
          <Route path="unified-creator-studio" element={<UnifiedCreatorStudio />} />
          <Route path="send-gifts" element={<SendGifts />} />
          <Route path="post/:postId" element={<PostDetail />} />
          {/* <Route path="feed-toggle-demo" element={<FeedToggleDemo />} /> */}
          {/* <Route path="feed-demo" element={<IntegratedFeedDemo />} /> */}
          <Route path="data" element={<DataManagement />} />
          <Route path="achievements" element={<GamificationSystem />} />
          <Route path="camera-test" element={<CameraPermissionTest />} />
          <Route path="freelance-route-test" element={<FreelanceDashboardRouteTest />} />
          <Route path="route-test" element={<RouteTest />} />
          <Route path="enhanced-freelance-demo" element={<EnhancedDashboardDemo userType="freelancer" />} />
          <Route path="enhanced-client-demo" element={<EnhancedDashboardDemo userType="client" />} />
          <Route path="currency-demo" element={<CurrencyDemo />} />
          <Route
            path="ai-assistant"
            element={<AIPersonalAssistantDashboard />}
          />
          <Route
            path="ai"
            element={
              <div className="space-y-6 p-6">
                <h1 className="text-2xl font-bold">AI Features</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AIFeatures.SmartFeedCuration />
                  <AIFeatures.AIContentAssistant />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AIFeatures.SmartPricePrediction />
                  <AIFeatures.AutoContentModeration />
                </div>
              </div>
            }
          />
        </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ComprehensiveAdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="management" element={<AdminManagement />} />
        <Route path="settings" element={<PlatformSettings />} />
        <Route path="moderation" element={<ContentModeration />} />
        <Route path="marketplace" element={<AdminMarketplace />} />
        <Route path="delivery" element={<DeliveryProvidersAdmin />} />
        <Route path="delivery/tracking" element={<DeliveryTrackingAdmin />} />
        <Route path="crypto" element={<AdminCrypto />} />
        <Route path="defi" element={<AdminDeFi />} />
        <Route path="gift-cards" element={<AdminGiftCards />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="freelance" element={<AdminFreelance />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="groups-pages" element={<AdminGroupsPages />} />
        <Route path="kyc" element={<AdminKYC />} />
        <Route path="financial" element={<AdminFinancial />} />
        <Route path="chat" element={<AdminChat />} />
        <Route path="boosts" element={<AdminBoosts />} />
        <Route path="system" element={<AdminSystem />} />
      </Route>

      {/* Legacy route redirects */}
      <Route path="/feed" element={<Navigate to="/app/feed" replace />} />
      <Route
        path="/marketplace"
        element={<Navigate to="/app/marketplace" replace />}
      />
      <Route
        path="/marketplace/browse"
        element={<Navigate to="/app/marketplace" replace />}
      />
      <Route
        path="/marketplace/products"
        element={<Navigate to="/app/marketplace" replace />}
      />
      <Route
        path="/marketplace/shop"
        element={<Navigate to="/app/marketplace" replace />}
      />
      <Route
        path="/marketplace/cart"
        element={<Navigate to="/app/marketplace/cart" replace />}
      />
      <Route
        path="/marketplace/wishlist"
        element={<Navigate to="/app/marketplace/wishlist" replace />}
      />
      <Route
        path="/marketplace/checkout"
        element={<Navigate to="/app/marketplace/checkout" replace />}
      />
      <Route
        path="/marketplace/my"
        element={<Navigate to="/app/marketplace/my" replace />}
      />
      <Route
        path="/marketplace/seller"
        element={<Navigate to="/app/marketplace/seller" replace />}
      />
      <Route
        path="/marketplace/list"
        element={<Navigate to="/app/marketplace/list" replace />}
      />
      <Route path="/crypto" element={<Navigate to="/app/crypto" replace />} />
      <Route path="/crypto-trading" element={<Navigate to="/app/crypto-trading" replace />} />
      <Route path="/crypto-p2p" element={<Navigate to="/app/crypto-p2p" replace />} />
      <Route path="/crypto-portfolio" element={<Navigate to="/app/crypto-portfolio" replace />} />
      <Route path="/crypto-learn" element={<Navigate to="/app/crypto-learn" replace />} />
      <Route path="/defi" element={<Navigate to="/app/defi" replace />} />
      <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
      <Route path="/messages" element={<Navigate to="/app/chat" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="/wallet" element={<Navigate to="/app/wallet" replace />} />
      <Route path="/notifications" element={<Navigate to="/app/notifications" replace />} />
      <Route path="/events" element={<Navigate to="/app/events" replace />} />
      <Route path="/freelance" element={<Navigate to="/app/freelance" replace />} />
      <Route path="/freelance/dashboard" element={<Navigate to="/app/freelance/dashboard" replace />} />
      <Route
        path="/creator-studio"
        element={<Navigate to="/app/creator-studio" replace />}
      />
      <Route
        path="/unified-creator-studio"
        element={<Navigate to="/app/unified-creator-studio" replace />}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  console.log("App rendering");

  // Setup global error handlers for fetch aborts
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  // Register service worker for PWA
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SafeThemeProvider>
          <ErrorBoundary
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    Application Error
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Something went wrong. Please refresh the page.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            }
          >
            <SafeI18nProvider>
              <CurrencyProvider>
                <AuthProvider>
                  <UserCollectionsProvider>
                    <UnifiedNotificationProvider>
                      <AdminProvider>
                        <AccessibilityProvider>
                          <TooltipProvider>
                            <GlobalCallProvider>
                              <AppRoutes />

                              {/* Global Components */}
                              <OnboardingTour />
                              <NotificationSystem />
                              <RewardNotificationContainer />
                              <AccessibilityControlPanel />
                              <KeyboardNavigationHelper />
                              <ReadingGuide />
                              <ConnectionStatus />
                              <PWAInstallPrompt />

                              {/* Toasters */}
                              <Toaster />
                              <Sonner />
                            </GlobalCallProvider>
                          </TooltipProvider>
                        </AccessibilityProvider>
                      </AdminProvider>
                    </UnifiedNotificationProvider>
                  </UserCollectionsProvider>
                </AuthProvider>
              </CurrencyProvider>
            </SafeI18nProvider>
          </ErrorBoundary>
        </SafeThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
