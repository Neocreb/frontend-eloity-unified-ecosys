import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  History,
  Handshake,
  ArrowUpDown,
  Activity,
  UserPlus,
  Star,
  Trophy,
  Gift,
  Target,
} from "lucide-react";

interface CreatorEconomyHeaderProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const CreatorEconomyHeader = ({
  activeTab,
  setActiveTab,
}: CreatorEconomyHeaderProps) => {
  const { user } = useAuth();
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3, category: "creator" },
    { id: "content", label: "Content", icon: TrendingUp, category: "creator" },
    { id: "boosts", label: "Boosts", icon: Zap, category: "creator" },
    {
      id: "subscribers",
      label: "Subscribers",
      icon: Users,
      category: "creator",
    },
    {
      id: "withdraw",
      label: "Withdraw",
      icon: ArrowUpDown,
      category: "creator",
    },
    { id: "history", label: "History", icon: History, category: "creator" },
    {
      id: "activity",
      label: "Activity Feed",
      icon: Activity,
      category: "activity",
      highlight: true,
    },
    {
      id: "challenges",
      label: "Challenges",
      icon: Target,
      category: "activity",
    },
    {
      id: "battles",
      label: "Battles",
      icon: Trophy,
      category: "activity",
    },
    {
      id: "gifts",
      label: "Gifts & Tips",
      icon: Gift,
      category: "activity",
    },
    {
      id: "referrals",
      label: "Referrals",
      icon: UserPlus,
      category: "activity",
    },
    {
      id: "partnerships",
      label: "Partnerships",
      icon: Handshake,
      category: "creator",
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Hi, {user?.profile?.full_name || user?.profile?.username || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Earn and grow your income
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200 mb-1"
            >
              Rewards
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Star className="w-3 h-3 mr-1" />
              Creator Economy
            </Badge>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="space-y-3">
        {/* Creator Economy Tabs */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Creator Economy
          </p>
          <div className="flex flex-wrap gap-2">
            {tabs
              .filter((tab) => tab.category === "creator")
              .map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "hover:bg-purple-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Button>
                );
              })}
          </div>
        </div>

        {/* Activity Economy Tabs */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Activity Economy 2.0{" "}
            <Badge variant="secondary" className="ml-2 text-xs">
              NEW
            </Badge>
          </p>
          <div className="flex flex-wrap gap-2">
            {tabs
              .filter((tab) => tab.category === "activity")
              .map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-blue-600 hover:bg-blue-700"
                        : tab.highlight
                          ? "hover:bg-blue-50 border-blue-200 text-blue-700"
                          : "hover:bg-gray-50"
                    } ${
                      tab.highlight ? "ring-2 ring-blue-200 ring-offset-1" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.highlight && (
                      <Badge
                        variant="secondary"
                        className="ml-1 text-xs bg-blue-100 text-blue-700"
                      >
                        NEW
                      </Badge>
                    )}
                  </Button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorEconomyHeader;
