// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Settings,
  Sparkles,
  Zap,
  BarChart3,
  Bell,
  Users,
  Home,
  FolderOpen,
  FileText,
  DollarSign,
  Brain,
  MessageCircle,
} from "lucide-react";

// Import enhanced components
import { ActivityIndicator } from "./RealTimeNotifications";
import { CustomizableDashboard } from "./DashboardWidgets";
import { OnboardingTour, HelpCenter, ContextualHelp } from "./OnboardingTour";
import { KeyboardShortcuts, AccessibilitySettings, SkipToContent } from "./KeyboardShortcuts";
import { PerformanceMonitor, DashboardSkeleton, MemoizedCard } from "./PerformanceOptimizations";
import { FreelanceNavigationTabs, TabItem } from "./FreelanceNavigationTabs";

interface EnhancedDashboardDemoProps {
  userType: "freelancer" | "client";
}

const navigationItems: TabItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Home,
    description: "Dashboard overview and quick stats",
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderOpen,
    description: "Active & completed projects",
    badge: "5",
  },
  {
    id: "proposals",
    label: "Proposals",
    icon: FileText,
    description: "Submitted proposals",
  },
  {
    id: "earnings",
    label: "Earnings",
    icon: DollarSign,
    description: "Revenue & analytics",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: Sparkles,
    description: "Boost your profile",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Business intelligence",
  },
];

export const EnhancedDashboardDemo: React.FC<EnhancedDashboardDemoProps> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Show onboarding for demo
    if (!hasSeenTour) {
      setTimeout(() => setShowOnboarding(true), 2000);
    }
  }, [hasSeenTour]);

  const handleTourComplete = () => {
    setHasSeenTour(true);
    setShowOnboarding(false);
  };

  // Enhanced header with all new features
  const EnhancedHeader = () => (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              {userType === "freelancer" ? (
                <Briefcase className="w-6 h-6 text-white" />
              ) : (
                <Users className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <ContextualHelp 
                title={`${userType === "freelancer" ? "Freelance" : "Client"} Hub`}
                content={`Your enhanced dashboard with real-time notifications, customizable widgets, and intelligent insights.`}
              >
                <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                  {userType === "freelancer" ? "Freelance" : "Client"} Hub Enhanced
                </h1>
              </ContextualHelp>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {userType === "freelancer" ? "Manage your freelance business" : "Hire talent and manage projects"}
                </p>
                <ActivityIndicator isActive={true} label="Live Updates" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <RealTimeNotifications userType={userType} />
            <Button
              variant={isCustomizing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsCustomizing(!isCustomizing)}
              data-testid="customize-button"
              className="hidden sm:flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {isCustomizing ? "Done Customizing" : "Customize Dashboard"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      {/* Accessibility Enhancement */}
      <SkipToContent />
      
      {/* Enhanced Header */}
      <EnhancedHeader />
      
      {/* Enhanced Navigation with Real-time Badges */}
      <FreelanceNavigationTabs
        tabs={navigationItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant={isMobile ? "compact" : "default"}
      />

      {/* Main Content with Enhancements */}
      <main 
        id="main-content" 
        data-testid="main-content" 
        className="p-4 sm:p-6" 
        tabIndex={-1}
      >
        {activeTab === "overview" && (
          <div className="space-y-6" data-testid="overview-content">
            {/* Show customizable dashboard or enhanced overview */}
            {isCustomizing ? (
              <CustomizableDashboard userType={userType} />
            ) : (
              <div className="space-y-6">
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MemoizedCard
                    title={userType === "freelancer" ? "Total Earnings" : "Total Spending"}
                    value="$12,450"
                    change="+15% this month"
                    icon={<DollarSign className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                  />
                  <MemoizedCard
                    title="Active Projects"
                    value="8"
                    icon={<FolderOpen className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-br from-blue-500 to-cyan-600"
                  />
                  <MemoizedCard
                    title={userType === "freelancer" ? "Success Rate" : "Satisfaction Rate"}
                    value="96%"
                    change="+2% this month"
                    icon={<BarChart3 className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-br from-purple-500 to-violet-600"
                  />
                  <MemoizedCard
                    title={userType === "freelancer" ? "Response Time" : "Avg. Hiring Time"}
                    value="< 2hrs"
                    icon={<Zap className="w-6 h-6 text-white" />}
                    color="bg-gradient-to-br from-orange-500 to-amber-600"
                  />
                </div>

                {/* Demo Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Enhanced Features Demo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Bell className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Real-time Notifications</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Live updates for messages, payments, and project milestones
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Customizable Widgets</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Drag, resize, and personalize your dashboard layout
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">Keyboard Shortcuts</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Press "?" to see all available shortcuts and commands
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Badge variant="outline">✨ Onboarding Tour</Badge>
                      <Badge variant="outline">���� Contextual Help</Badge>
                      <Badge variant="outline">♿ Accessibility Features</Badge>
                      <Badge variant="outline">📊 Performance Monitor</Badge>
                      <Badge variant="outline">🚀 Optimistic UI</Badge>
                      <Badge variant="outline">💾 Auto-save Preferences</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== "overview" && (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {navigationItems.find(item => item.id === activeTab)?.label}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This enhanced section would contain all the improved functionality
            </p>
          </div>
        )}
      </main>

      {/* All Enhanced Components */}
      <KeyboardShortcuts 
        onNavigate={setActiveTab}
        onToggleCustomization={() => setIsCustomizing(!isCustomizing)}
      />
      <AccessibilitySettings />
      <HelpCenter />
      <PerformanceMonitor />
      
      {/* Interactive Onboarding Tour */}
      <OnboardingTour
        userType={userType}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleTourComplete}
      />
    </div>
  );
};

export default EnhancedDashboardDemo;
