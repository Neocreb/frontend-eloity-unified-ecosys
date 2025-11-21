import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Gift,
  DollarSign,
  TrendingUp,
  Heart,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { virtualGiftsService } from "@/services/virtualGiftsService";

interface GiftTipStats {
  totalGiftsSent: number;
  totalGiftsCost: number;
  totalTipsSent: number;
  uniqueGiftRecipients: number;
  uniqueTipRecipients: number;
  mostSentGift: {
    name: string;
    emoji: string;
    count: number;
  } | null;
  recentGifts: Array<{
    id: string;
    giftName: string;
    giftEmoji: string;
    amount: number;
    quantity: number;
    createdAt: string;
  }>;
  recentTips: Array<{
    id: string;
    amount: number;
    createdAt: string;
  }>;
}

export default function GiftsTipsAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<GiftTipStats>({
    totalGiftsSent: 0,
    totalGiftsCost: 0,
    totalTipsSent: 0,
    uniqueGiftRecipients: 0,
    uniqueTipRecipients: 0,
    mostSentGift: null,
    recentGifts: [],
    recentTips: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [giftHistory, tipHistory] = await Promise.all([
        virtualGiftsService.getGiftHistory(user.id),
        virtualGiftsService.getTipHistory(user.id),
      ]);

      // Calculate gift statistics
      const giftsByName: Record<string, any> = {};
      let totalGiftsCost = 0;
      const giftRecipients = new Set<string>();

      giftHistory.forEach((gift) => {
        totalGiftsCost += gift.totalAmount;
        giftRecipients.add(gift.recipientId);

        if (!giftsByName[gift.giftId]) {
          giftsByName[gift.giftId] = {
            name: gift.giftName,
            emoji: gift.giftEmoji,
            count: 0,
          };
        }
        giftsByName[gift.giftId].count += gift.quantity || 1;
      });

      // Find most sent gift
      let mostSentGift = null;
      let maxCount = 0;
      for (const [_, gift] of Object.entries(giftsByName)) {
        if (gift.count > maxCount) {
          maxCount = gift.count;
          mostSentGift = gift;
        }
      }

      // Calculate tip statistics
      let totalTipsSent = 0;
      const tipRecipients = new Set<string>();

      tipHistory.forEach((tip) => {
        totalTipsSent += tip.amount;
        tipRecipients.add(tip.recipientId);
      });

      setStats({
        totalGiftsSent: giftHistory.length,
        totalGiftsCost: totalGiftsCost,
        totalTipsSent: totalTipsSent,
        uniqueGiftRecipients: giftRecipients.size,
        uniqueTipRecipients: tipRecipients.size,
        mostSentGift,
        recentGifts: giftHistory.slice(0, 5),
        recentTips: tipHistory.slice(0, 5),
      });
    } catch (error) {
      console.error("Error loading gift/tip stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gifts Sent */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gifts Sent</p>
                <p className="text-2xl font-bold">{stats.totalGiftsSent}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  to {stats.uniqueGiftRecipients} people
                </p>
              </div>
              <Gift className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Gifts Spent */}
        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gifts Value</p>
                <p className="text-2xl font-bold">${stats.totalGiftsCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  invested
                </p>
              </div>
              <Heart className="h-8 w-8 text-pink-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Tips Sent */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tips Sent</p>
                <p className="text-2xl font-bold">${stats.totalTipsSent.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  to {stats.uniqueTipRecipients} creators
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Most Sent Gift */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Most Sent</p>
                <p className="text-2xl font-bold">
                  {stats.mostSentGift ? `${stats.mostSentGift.emoji}` : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.mostSentGift ? `${stats.mostSentGift.count}x ${stats.mostSentGift.name}` : "No gifts yet"}
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Gifts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-500" />
              Recent Gifts Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentGifts.length > 0 ? (
                stats.recentGifts.map((gift) => (
                  <div key={gift.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{gift.giftEmoji}</span>
                      <div>
                        <p className="font-medium text-sm">{gift.giftName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(gift.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">${gift.amount.toFixed(2)}</p>
                      {gift.quantity > 1 && (
                        <Badge variant="secondary" className="text-xs">x{gift.quantity}</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No gifts sent yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Recent Tips Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTips.length > 0 ? (
                stats.recentTips.map((tip) => (
                  <div key={tip.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">Tip</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tip.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-semibold text-sm text-green-600">
                      +${tip.amount.toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No tips sent yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Send More Gifts & Tips</h3>
            <p className="text-sm text-muted-foreground">
              Support creators and spread joy in the community
            </p>
          </div>
          <Button
            onClick={() => navigate("/app/send-gifts")}
            className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Send Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
