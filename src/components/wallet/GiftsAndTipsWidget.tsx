import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Gift,
  DollarSign,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { virtualGiftsService } from "@/services/virtualGiftsService";
import { useNavigate } from "react-router-dom";

interface GiftRecord {
  id: string;
  giftName: string;
  giftEmoji: string;
  amount: number;
  quantity: number;
  createdAt: string;
}

interface TipRecord {
  id: string;
  amount: number;
  createdAt: string;
}

interface GiftTipsWidgetData {
  recentGifts: GiftRecord[];
  recentTips: TipRecord[];
  totalGiftsSent: number;
  totalTipsSent: number;
  totalSpent: number;
}

const GiftsAndTipsWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<GiftTipsWidgetData>({
    recentGifts: [],
    recentTips: [],
    totalGiftsSent: 0,
    totalTipsSent: 0,
    totalSpent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGiftsTipsData();
  }, [user?.id]);

  const loadGiftsTipsData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [giftHistory, tipHistory] = await Promise.all([
        virtualGiftsService.getGiftHistory(user.id),
        virtualGiftsService.getTipHistory(user.id),
      ]);

      const totalGiftsCost = giftHistory.reduce((sum, gift) => sum + gift.totalAmount, 0);
      const totalTips = tipHistory.reduce((sum, tip) => sum + tip.amount, 0);

      setData({
        recentGifts: giftHistory.slice(0, 4),
        recentTips: tipHistory.slice(0, 4),
        totalGiftsSent: giftHistory.length,
        totalTipsSent: tipHistory.length,
        totalSpent: totalGiftsCost + totalTips,
      });
    } catch (error) {
      console.error("Error loading gifts/tips data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Gift className="h-5 w-5 text-purple-500" />
            <span>Gifts & Tips</span>
            {data.totalSpent > 0 && (
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                ${data.totalSpent.toFixed(2)} invested
              </Badge>
            )}
          </CardTitle>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
          >
            <a href="/app/send-gifts">
              Send More <ArrowRight className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : data.recentGifts.length === 0 && data.recentTips.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No gifts or tips sent yet
            </p>
            <Button
              onClick={() => navigate("/app/send-gifts")}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Gift className="h-4 w-4 mr-2" />
              Send Your First Gift
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium mb-1">Gifts Sent</p>
                <p className="text-xl font-bold text-purple-700">{data.totalGiftsSent}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                <p className="text-xs text-green-600 font-medium mb-1">Tips Sent</p>
                <p className="text-xl font-bold text-green-700">${data.totalTipsSent.toFixed(2)}</p>
              </div>
            </div>

            {/* Recent Gifts & Tips Combined Timeline */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Recent Activity
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {/* Combine and sort gifts and tips */}
                {(() => {
                  const combined = [
                    ...data.recentGifts.map((g) => ({
                      id: g.id,
                      type: "gift" as const,
                      emoji: g.giftEmoji,
                      name: g.giftName,
                      amount: g.amount,
                      quantity: g.quantity,
                      timestamp: g.createdAt,
                    })),
                    ...data.recentTips.map((t) => ({
                      id: t.id,
                      type: "tip" as const,
                      emoji: "💵",
                      name: "Tip",
                      amount: t.amount,
                      quantity: 1,
                      timestamp: t.createdAt,
                    })),
                  ].sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  );

                  return combined.length > 0 ? (
                    combined.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xl flex-shrink-0">{item.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.type === "gift" ? item.name : "Tip Sent"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p
                            className={`text-sm font-semibold ${
                              item.type === "gift"
                                ? "text-purple-600"
                                : "text-green-600"
                            }`}
                          >
                            -${item.amount.toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              ×{item.quantity}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : null;
                })()}
              </div>
            </div>

            {/* View More CTA */}
            {(data.totalGiftsSent > 4 || data.totalTipsSent > 4) && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => navigate("/app/rewards?tab=gifts")}
              >
                <TrendingUp className="h-4 w-4" />
                View Detailed Analytics
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GiftsAndTipsWidget;
