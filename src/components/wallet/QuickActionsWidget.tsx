import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWalletContext } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  RequestMoneyModal,
  TransferModal,
  PayBillModal,
  TopUpModal,
} from "./QuickActionModals";
import EnhancedSendMoneyModal from "./EnhancedSendMoneyModal";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Repeat,
  Star,
  TrendingUp,
  Gift,
  CreditCard,
  Smartphone,
  Zap,
  Clock,
  Users,
  Target,
  Lightbulb,
  Sparkles,
  Receipt,

} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  badge?: string;
}

interface Recommendation {
  id: string;
  type: "savings" | "investment" | "spending" | "security" | "feature";
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: "high" | "medium" | "low";
  action: {
    label: string;
    onClick: () => void;
  };
}

interface RecentRecipient {
  id: string;
  name: string;
  avatar?: string;
  lastAmount: number;
  frequency: number;
}

const QuickActionsWidget = () => {
  const { walletBalance, transactions, getTotalEarnings } = useWalletContext();
  const { user } = useAuth();

  const [recentRecipients, setRecentRecipients] = useState<RecentRecipient[]>([
    { id: "1", name: "John Doe", lastAmount: 250, frequency: 5 },
    { id: "2", name: "Sarah Smith", lastAmount: 100, frequency: 3 },
    { id: "3", name: "Mike Johnson", lastAmount: 75, frequency: 2 },
  ]);

  // Modal states
  const [showSendModal, setShowSendModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: "send",
      label: "Send Money",
      icon: <Send className="h-4 w-4" />,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => setShowSendModal(true),
    },
    {
      id: "request",
      label: "Request",
      icon: <ArrowDownLeft className="h-4 w-4" />,
      color: "bg-green-500 hover:bg-green-600",
      action: () => setShowRequestModal(true),
    },
    {
      id: "withdraw",
      label: "Withdraw",
      icon: <ArrowUpRight className="h-4 w-4" />,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => {
        // This will use the existing withdraw modal from the main dashboard
        const withdrawButton = document.querySelector('[data-action="withdraw"]') as HTMLButtonElement;
        if (withdrawButton) {
          withdrawButton.click();
        }
      },
    },
    {
      id: "transfer",
      label: "Transfer",
      icon: <Repeat className="h-4 w-4" />,
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => setShowTransferModal(true),
    },
    {
      id: "pay-bill",
      label: "Pay Bill",
      icon: <Receipt className="h-4 w-4" />,
      color: "bg-red-500 hover:bg-red-600",
      action: () => setShowPayBillModal(true),
    },
    {
      id: "top-up",
      label: "Top Up",
      icon: <Smartphone className="h-4 w-4" />,
      color: "bg-indigo-500 hover:bg-indigo-600",
      action: () => setShowTopUpModal(true),
    },
  ];

  // Smart Recommendations based on user behavior and data
  const recommendations: Recommendation[] = useMemo(() => {
    const recs: Recommendation[] = [];
    
    if (!walletBalance) return recs;

    // Savings recommendation
    if (walletBalance.total > 1000) {
      recs.push({
        id: "savings",
        type: "savings",
        title: "Start a Savings Goal",
        description: "You have a good balance. Consider setting aside 20% for savings.",
        icon: <Target className="h-5 w-5" />,
        priority: "medium",
        action: {
          label: "Set Goal",
          onClick: () => console.log("Set savings goal"),
        },
      });
    }

    // Investment recommendation
    if (walletBalance.crypto > 0 && getTotalEarnings(30) > 500) {
      recs.push({
        id: "investment",
        type: "investment",
        title: "Diversify Your Portfolio",
        description: "Your crypto earnings are growing. Consider diversifying your investments.",
        icon: <TrendingUp className="h-5 w-5" />,
        priority: "high",
        action: {
          label: "Explore",
          onClick: () => console.log("Explore investments"),
        },
      });
    }

    // Spending insights
    const recentTransactions = transactions.filter(t => 
      new Date(t.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    if (recentTransactions.length > 10) {
      recs.push({
        id: "spending",
        type: "spending",
        title: "Monitor Your Spending",
        description: "You've made many transactions this week. Review your spending patterns.",
        icon: <Zap className="h-5 w-5" />,
        priority: "medium",
        action: {
          label: "View Report",
          onClick: () => console.log("View spending report"),
        },
      });
    }

    // Security recommendation
    if (!user?.profile?.two_factor_enabled) {
      recs.push({
        id: "security",
        type: "security",
        title: "Enable 2FA for Better Security",
        description: "Protect your account with two-factor authentication.",
        icon: <Sparkles className="h-5 w-5" />,
        priority: "high",
        action: {
          label: "Enable 2FA",
          onClick: () => console.log("Enable 2FA"),
        },
      });
    }

    // Feature recommendation
    if (walletBalance.freelance > 0) {
      recs.push({
        id: "feature",
        type: "feature",
        title: "Try Auto-Invest",
        description: "Automatically invest a portion of your freelance earnings.",
        icon: <Gift className="h-5 w-5" />,
        priority: "low",
        action: {
          label: "Learn More",
          onClick: () => console.log("Learn about auto-invest"),
        },
      });
    }

    return recs.slice(0, 3); // Show max 3 recommendations
  }, [walletBalance, transactions, getTotalEarnings, user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "savings": return <Target className="h-4 w-4" />;
      case "investment": return <TrendingUp className="h-4 w-4" />;
      case "spending": return <Zap className="h-4 w-4" />;
      case "security": return <Sparkles className="h-4 w-4" />;
      case "feature": return <Gift className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={`${action.color} text-white border-none hover:scale-105 transition-transform flex flex-col items-center gap-2 h-auto py-4`}
                onClick={action.action}
              >
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
                {action.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {action.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-col sm:flex-row items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-full">
                  {rec.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <Badge className={getPriorityColor(rec.priority)} variant="secondary">
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={rec.action.onClick}
                  className="w-full sm:w-auto mt-2 sm:mt-0"
                >
                  {rec.action.label}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Recipients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRecipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => console.log(`Send to ${recipient.name}`)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={recipient.avatar} />
                  <AvatarFallback>
                    {recipient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{recipient.name}</p>
                  <p className="text-xs text-gray-600 truncate">
                    Last sent: ${recipient.lastAmount} • {recipient.frequency} times
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0">
                  <Send className="h-3 w-3 sm:mr-1" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>



      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +${getTotalEarnings(1).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Earned Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {transactions.filter(t =>
                  new Date(t.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Quick Action Modals */}
      <EnhancedSendMoneyModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
      />

      <RequestMoneyModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />

      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />

      <PayBillModal
        isOpen={showPayBillModal}
        onClose={() => {
          setShowPayBillModal(false);
        }}
      />

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
      />
    </div>
  );
};

export default QuickActionsWidget;
