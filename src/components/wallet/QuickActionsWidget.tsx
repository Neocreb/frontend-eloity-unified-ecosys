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
  BuyGiftCardModal,
  SellGiftCardModal,
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
  Store,
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
  const [showBuyGiftModal, setShowBuyGiftModal] = useState(false);
  const [showSellGiftModal, setShowSellGiftModal] = useState(false);

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
      icon: <CreditCard className="h-4 w-4" />,
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

  // Smart Recommendations removed from this widget to avoid duplication on the dashboard

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

      {/* Smart Recommendations moved to dedicated component on the page */}

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
        onClose={() => setShowPayBillModal(false)}
      />

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
      />
    </div>
  );
};

export default QuickActionsWidget;
