import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Star,
  Users,
  Award,
  Zap,
  Crown,
  TrendingUp,
  Settings,
  Gift,
  Target,
  Activity,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Import all the components we've built
import ComprehensiveEarningsDashboard from "@/components/dashboard/ComprehensiveEarningsDashboard";
import ReferralDashboard from "@/components/referral/ReferralDashboard";
import LevelsBoostsDashboard from "@/components/levels/LevelsBoostsDashboard";
import ActivityEconomyDashboard from "@/components/activity-economy/ActivityEconomyDashboard";
import UnifiedCreatorEconomy from "@/components/creator-economy/UnifiedCreatorEconomy";
import RewardSystemAdmin from "@/components/admin/RewardSystemAdmin";

interface CreatorEconomyHubProps {
  defaultTab?: string;
  adminAccess?: boolean;
}

const CreatorEconomyHub: React.FC<CreatorEconomyHubProps> = ({
  defaultTab = "dashboard",
  adminAccess = false,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: DollarSign,
      description: "Complete earnings overview",
      component: ComprehensiveEarningsDashboard,
    },
    {
      id: "activities",
      label: "Activities",
      icon: Activity,
      description: "Activity rewards & tracking",
      component: ActivityEconomyDashboard,
    },
    {
      id: "levels",
      label: "Levels & Boosts",
      icon: Zap,
      description: "Level up and boost earnings",
      component: LevelsBoostsDashboard,
    },
    {
      id: "referrals",
      label: "Referrals",
      icon: Users,
      description: "Invite friends & earn commissions",
      component: ReferralDashboard,
    },
    {
      id: "creator",
      label: "Creator Studio",
      icon: Star,
      description: "Advanced creator tools",
      component: UnifiedCreatorEconomy,
    },
  ];

  if (adminAccess) {
    tabs.push({
      id: "admin",
      label: "Admin",
      icon: Shield,
      description: "System administration",
      component: RewardSystemAdmin,
    });
  }

  const activeComponent = tabs.find((tab) => tab.id === activeTab)?.component;
  const ActiveComponent = activeComponent || ComprehensiveEarningsDashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Eloity Creator Economy
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Earn from everything you do. Complete monetization ecosystem for
            creators and active users.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-4">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-muted-foreground">Total Platform</p>
                <p className="font-bold">$2.4M+ Paid</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">Active Earners</p>
                <p className="font-bold">50K+ Users</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Star className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <p className="text-sm text-muted-foreground">Eloity Points</p>
                <p className="font-bold">12M+ Issued</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="text-sm text-muted-foreground">Growth</p>
                <p className="font-bold">+127% Monthly</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Current Tab Description */}
        <div className="text-center">
          <p className="text-muted-foreground">
            {tabs.find((tab) => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <ActiveComponent />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Smart Reward Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• AI-powered quality scoring</li>
                <li>• Anti-abuse protection</li>
                <li>• Dynamic decay algorithms</li>
                <li>• Trust-based multipliers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Multi-Module Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Social Media & Content</li>
                <li>• Marketplace & E-commerce</li>
                <li>• Freelance & Services</li>
                <li>• Crypto Trading & P2P</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-500" />
                Partnership Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Lifetime referral commissions</li>
                <li>• Tiered partnership levels</li>
                <li>• Exclusive creator benefits</li>
                <li>• Revenue sharing programs</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-2xl font-bold">Ready to Start Earning?</h2>
          <p className="text-muted-foreground">
            Join thousands of creators already earning on Eloity
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Star className="w-4 h-4 mr-2" />
              Start Creating
            </Button>
            <Button size="lg" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Refer Friends
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorEconomyHub;
