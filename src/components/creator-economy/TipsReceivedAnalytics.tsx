import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DollarSign,
  TrendingUp,
  Heart,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { virtualGiftsService } from "@/services/virtualGiftsService";

interface TipRecord {
  id: string;
  amount: number;
  currency?: string;
  senderId?: string;
  senderName?: string;
  message?: string;
  createdAt: string;
  recipientId: string;
}

interface TipsAnalyticsData {
  totalTipsReceived: number;
  totalAmount: number;
  averageTip: number;
  tipsThisMonth: number;
  amountThisMonth: number;
  uniqueTippers: number;
  recentTips: TipRecord[];
  topTippers: Array<{
    senderId: string;
    senderName: string;
    totalAmount: number;
    tipCount: number;
  }>;
  dailyTips: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

const TipsReceivedAnalytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState<TipsAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    loadTipsData();
  }, [user?.id, timeRange]);

  const loadTipsData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const tipHistory = await virtualGiftsService.getTipHistory(user.id, true);

      // Calculate analytics
      const now = new Date();
      const startDate = new Date();

      if (timeRange === "week") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeRange === "month") {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setFullYear(2020); // Get all historical data
      }

      const totalAmount = tipHistory.reduce((sum, tip) => sum + tip.amount, 0);
      const tipsThisMonth = tipHistory.filter(
        (tip) => new Date(tip.createdAt) >= startDate
      ).length;
      const amountThisMonth = tipHistory
        .filter((tip) => new Date(tip.createdAt) >= startDate)
        .reduce((sum, tip) => sum + tip.amount, 0);

      // Calculate top tippers
      const tipperMap = new Map<
        string,
        { name: string; amount: number; count: number }
      >();
      tipHistory.forEach((tip) => {
        const senderId = tip.senderId || "anonymous";
        const senderName = tip.senderName || "Anonymous Tipper";
        const existing = tipperMap.get(senderId);
        tipperMap.set(senderId, {
          name: senderName,
          amount: (existing?.amount || 0) + tip.amount,
          count: (existing?.count || 0) + 1,
        });
      });

      const topTippers = Array.from(tipperMap.entries())
        .map(([id, data]) => ({
          senderId: id,
          senderName: data.name,
          totalAmount: data.amount,
          tipCount: data.count,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5);

      // Calculate daily tips
      const dailyTipsMap = new Map<string, { amount: number; count: number }>();
      tipHistory.forEach((tip) => {
        const date = new Date(tip.createdAt).toLocaleDateString();
        const existing = dailyTipsMap.get(date);
        dailyTipsMap.set(date, {
          amount: (existing?.amount || 0) + tip.amount,
          count: (existing?.count || 0) + 1,
        });
      });

      const dailyTips = Array.from(dailyTipsMap.entries())
        .map(([date, data]) => ({
          date,
          ...data,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days

      setData({
        totalTipsReceived: tipHistory.length,
        totalAmount,
        averageTip: tipHistory.length > 0 ? totalAmount / tipHistory.length : 0,
        tipsThisMonth,
        amountThisMonth,
        uniqueTippers: tipperMap.size,
        recentTips: tipHistory.slice(0, 8),
        topTippers,
        dailyTips,
      });
    } catch (error) {
      console.error("Error loading tips analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!data || data.totalTipsReceived === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Tips Yet
          </h3>
          <p className="text-gray-600 text-center mb-6 max-w-sm">
            When viewers send you tips, they'll appear here. Keep creating great content!
          </p>
          <Badge variant="secondary">Tips are a great way to earn!</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(["week", "month", "all"] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
            className="capitalize"
          >
            {range === "all" ? "All Time" : `Last ${range === "week" ? "Week" : "Month"}`}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tips */}
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Total Tips</p>
                <p className="text-2xl font-bold text-green-900">
                  ${data.totalAmount.toFixed(2)}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  {data.totalTipsReceived} tips from {data.uniqueTippers} people
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-40" />
            </div>
          </CardContent>
        </Card>

        {/* Average Tip */}
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">
                  Average Tip
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  ${data.averageTip.toFixed(2)}
                </p>
                <p className="text-xs text-blue-600 mt-2">Per tip</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-40" />
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">
                  This Month
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  ${data.amountThisMonth.toFixed(2)}
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  {data.tipsThisMonth} tips
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500 opacity-40" />
            </div>
          </CardContent>
        </Card>

        {/* Unique Tippers */}
        <Card className="border-l-4 border-l-pink-500 bg-gradient-to-br from-pink-50 to-pink-100/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-pink-700 font-medium mb-1">
                  Unique Tippers
                </p>
                <p className="text-2xl font-bold text-pink-900">
                  {data.uniqueTippers}
                </p>
                <p className="text-xs text-pink-600 mt-2">
                  Supporting creators
                </p>
              </div>
              <Users className="h-8 w-8 text-pink-500 opacity-40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tippers and Recent Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tippers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Top Supporters
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topTippers.length > 0 ? (
              <div className="space-y-3">
                {data.topTippers.map((tipper, index) => (
                  <div
                    key={tipper.senderId}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {tipper.senderName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tipper.tipCount} tip{tipper.tipCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm font-semibold text-green-600">
                        ${tipper.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No tips received yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Recent Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentTips.length > 0 ? (
              <div className="space-y-3">
                {data.recentTips.map((tip) => (
                  <div
                    key={tip.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {tip.senderName || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tip.createdAt).toLocaleDateString()}
                      </p>
                      {tip.message && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          "{tip.message}"
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm font-semibold text-green-600">
                        +${tip.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No tips received yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown Chart Info */}
      {data.dailyTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Tips Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Daily tips breakdown for the selected period:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {data.dailyTips.map((day) => (
                  <div
                    key={day.date}
                    className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center"
                  >
                    <p className="text-xs text-gray-500 mb-1">{day.date}</p>
                    <p className="text-sm font-semibold text-green-600">
                      ${day.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{day.count} tip(s)</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="flex-shrink-0">
            <Heart className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-blue-900 text-sm mb-1">
              💡 Maximize Your Tips
            </h4>
            <p className="text-sm text-blue-700">
              Engage with your community, create valuable content, and watch your tips grow. Each tip is a direct show of support from your viewers!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TipsReceivedAnalytics;
