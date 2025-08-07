import React from "react";
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
import { I18nProvider } from "./contexts/I18nContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { UnifiedNotificationProvider } from "./contexts/UnifiedNotificationContext";
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

import AppLayout from "./components/layout/AppLayout";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import EnhancedFeed from "./pages/EnhancedFeed";
import EnhancedFreelance from "./pages/EnhancedFreelance";
import FreelanceJobs from "./pages/freelance/FreelanceJobs";
import RoleSwitcherDashboard from "./pages/freelance/RoleSwitcherDashboard";
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
import JobDetailPage from "./pages/freelance/JobDetailPage";
import Inbox from "./chat/Inbox";
import ChatRoom from "./chat/ChatRoom";
import ChatDemo from "./pages/ChatDemo";
import WhatsAppChatDemo from "./pages/WhatsAppChatDemo";
import EnhancedProfile from "./pages/EnhancedProfile";
import UnifiedProfile from "./pages/UnifiedProfile";
import ProfileStats from "./pages/profile/ProfileStats";
import ProfileFollowers from "./pages/profile/ProfileFollowers";
import ProfileFollowing from "./pages/profile/ProfileFollowing";
import ProfileViews from "./pages/profile/ProfileViews";
import ProfileViews from "./pages/profile/ProfileViews";
import Wallet from "./pages/Wallet";
import Marketplace from "./pages/Marketplace";
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
import DeliveryHub from "./pages/DeliveryHub";
import DeliveryProviderRegistration from "./components/delivery/DeliveryProviderRegistration";
import DeliveryProviderDashboard from "./components/delivery/DeliveryProviderDashboard";
import DeliveryTracking from "./components/delivery/DeliveryTracking";
import DeliveryProviderStatus from "./components/delivery/DeliveryProviderStatus";
import DeliveryProvidersAdmin from "./components/admin/DeliveryProvidersAdmin";
import DeliveryTrackingPublic from "./pages/DeliveryTrackingPublic";
import DriverApplicationPublic from "./pages/DriverApplicationPublic";

import CryptoMarket from "./pages/CryptoMarket";
import EnhancedCrypto from "./pages/EnhancedCrypto";
import NotFound from "./pages/NotFound";
import Rewards from "./pages/Rewards";
import EnhancedSettings from "./pages/EnhancedSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ComprehensiveAdminDashboard from "./pages/admin/ComprehensiveAdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminLogin from "./pages/AdminLogin";
import AdminManagement from "./pages/admin/AdminManagement";
import PlatformSettings from "./pages/admin/PlatformSettings";
import ContentModeration from "./pages/admin/ContentModeration";
import AdminMarketplace from "./pages/admin/AdminMarketplace";
import AdminCrypto from "./pages/admin/AdminCrypto";
import AdminFreelance from "./pages/admin/AdminFreelance";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminGroupsPages from "./pages/admin/AdminGroupsPages";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/layout/AdminLayout";

import EnhancedVideosV2 from "./pages/EnhancedVideosV2";
import TikTokStyleVideos from "./pages/TikTokStyleVideos";
import EnhancedTikTokVideos from "./pages/EnhancedTikTokVideos";
import EnhancedTikTokVideosV3 from "./pages/EnhancedTikTokVideosV3";
import DuetDemo from "./pages/DuetDemo";
import CameraPermissionTest from "./components/debug/CameraPermissionTest";
import FreelanceDashboardRouteTest from "./components/debug/FreelanceDashboardRouteTest";
import CreatorStudio from "./pages/CreatorStudio";
import EnhancedDashboardDemo from "./components/freelance/EnhancedDashboardDemo";
import UnifiedCreatorStudio from "./pages/UnifiedCreatorStudio";
import Chat from "./pages/Chat";
import Messages from "./pages/Messages";
import Explore from "./pages/Explore";
import GlobalSearch from "./pages/GlobalSearch";
import LandingPage from "./pages/LandingPage";
import TestComponent from "./pages/TestComponent";
import UnifiedNotifications from "./pages/UnifiedNotifications";
import Create from "./pages/Create";
import EnhancedPlatform from "./pages/EnhancedPlatform";
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
import SubscriptionManager from "./components/premium/SubscriptionManager";
import VirtualGiftsAndTips from "./components/premium/VirtualGiftsAndTips";
import EnhancedKYCVerification from "./components/kyc/EnhancedKYCVerification";
import { LiveStreamCreator } from "./components/livestream/LiveStreamCreator";
import Groups from "./pages/Groups";
import Pages from "./pages/Pages";
import GroupDetailView from "./components/groups/GroupDetailView";
import PageDetailView from "./components/pages/PageDetailView";
import GroupManagement from "./pages/GroupManagement";
import PageManagement from "./pages/PageManagement";
import SendGifts from "./pages/SendGifts";
import {
  FriendsPage,
  AdsPage,
  MemoriesPage,
  SavedPage,
  SupportPage,
  HelpPage,
} from "./pages/PlaceholderPages";
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
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  console.log("Authentication confirmed, rendering protected route");
  return <>{children}</>;
};

// Legacy admin route component for backward compatibility
interface LegacyAdminRouteProps {
  children: React.ReactNode;
}

// Messages redirect component to handle threadId parameter
const MessagesRedirect = () => {
  const { threadId } = useParams();
  return <Navigate to={`/app/chat/${threadId}`} replace />;
};

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
      <Route path="/home" element={<Home />} />

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

      {/* Auth route - handle loading state and redirects */}
      <Route
        path="/auth"
        element={
          isAuthenticated ? <Navigate to="/app/feed" replace /> : <Auth />
        }
      />

      {/* Protected routes - only render when not loading */}
      {!isLoading && (
        <Route
          path="/app"
          element={
            <ProtectedRoute>
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
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="feed" replace />} />
          <Route path="feed" element={<EnhancedFeed />} />
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
          <Route path="freelance/job/:jobId" element={<JobDetailPage />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:threadId" element={<ChatRoom />} />
          <Route
            path="messages"
            element={<Navigate to="/app/chat" replace />}
          />
          <Route path="messages/:threadId" element={<MessagesRedirect />} />
          <Route path="chat-demo" element={<ChatDemo />} />
          <Route path="profile" element={<EnhancedProfile />} />
          <Route path="profile/:username" element={<EnhancedProfile />} />
          <Route path="profile/:username/stats" element={<ProfileStats />} />
          <Route path="profile/:username/followers" element={<ProfileFollowers />} />
          <Route path="profile/:username/following" element={<ProfileFollowing />} />
          <Route path="profile/:username/views" element={<ProfileViews />} />
          <Route path="user/:username" element={<EnhancedProfile />} />
          <Route path="unified-profile" element={<UnifiedProfile />} />
          <Route path="unified-profile/:username" element={<UnifiedProfile />} />
          <Route path="demo/profiles" element={<ProfileDemo />} />
          <Route path="wallet" element={<Wallet />} />
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
          <Route
            path="marketplace/checkout"
            element={<MarketplaceCheckout />}
          />

          {/* Delivery routes */}
          <Route path="delivery" element={<DeliveryProviderStatus />} />
          <Route path="delivery/provider/register" element={<DeliveryProviderRegistration />} />
          <Route path="delivery/provider/dashboard" element={<DeliveryProviderDashboard />} />
          <Route path="delivery/track" element={<DeliveryTracking />} />
          <Route path="delivery/track/:trackingNumber" element={<DeliveryTracking />} />

          <Route path="crypto" element={<EnhancedCrypto />} />
          <Route path="campaigns" element={<CampaignCenter />} />
          <Route path="rewards" element={<EnhancedRewards />} />
          <Route path="videos" element={<EnhancedTikTokVideosV3 />} />
          <Route path="duet-demo" element={<DuetDemo />} />
          <Route path="explore" element={<Explore />} />
          <Route path="global-search" element={<GlobalSearch />} />
          <Route path="events" element={<CommunityEvents />} />
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
          <Route path="friends" element={<FriendsPage />} />
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
          <Route path="data" element={<DataManagement />} />
          <Route path="achievements" element={<GamificationSystem />} />
          <Route path="camera-test" element={<CameraPermissionTest />} />
          <Route path="freelance-route-test" element={<FreelanceDashboardRouteTest />} />
          <Route path="enhanced-freelance-demo" element={<EnhancedDashboardDemo userType="freelancer" />} />
          <Route path="enhanced-client-demo" element={<EnhancedDashboardDemo userType="client" />} />
          <Route path="whatsapp-chat-demo" element={<WhatsAppChatDemo />} />
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
      )}

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
        <Route path="crypto" element={<AdminCrypto />} />
        <Route path="freelance" element={<AdminFreelance />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="groups-pages" element={<AdminGroupsPages />} />
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
      <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
      <Route path="/messages" element={<Navigate to="/app/chat" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="/wallet" element={<Navigate to="/app/wallet" replace />} />
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
  React.useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  // Register service worker for PWA
  React.useEffect(() => {
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
            <I18nProvider>
              <CurrencyProvider>
                <AuthProvider>
                  <UnifiedNotificationProvider>
                    <AdminProvider>
                    <AccessibilityProvider>
                      <TooltipProvider>
                        <GlobalCallProvider>
                          <AppRoutes />

                          {/* Global Components */}
                          <OnboardingTour />
                          <NotificationSystem />
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
                </AuthProvider>
              </CurrencyProvider>
            </I18nProvider>
          </ErrorBoundary>
        </SafeThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
