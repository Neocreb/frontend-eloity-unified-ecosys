// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  virtualGiftsService,
  VirtualGift,
  GiftTransaction,
  TipTransaction,
} from "@/services/virtualGiftsService";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  Award,
  History,
  DollarSign,
  Gift,
  Heart,
  Users,
  Calendar,
  Zap,
} from "lucide-react";

interface AnalyticsTabProps {
  onRefresh?: () => void;
}

interface TopRecipient {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  totalAmount: number;
  giftCount: number;
  mostFrequentGift?: VirtualGift;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ onRefresh }) => {
  const { user } = useAuth();

  // Analytics data
  const [giftStats, setGiftStats] = useState<{
    totalReceived: number;
    totalSent: number;
    totalValue: number;
    topGifts: Array<{ gift: VirtualGift; count: number }>;
  } | null>(null);

  const [tipStats, setTipStats] = useState<{
    totalTipsReceived: number;
    totalTipValue: number;
    averageTip: number;
    topTippers: Array<{
      userId: string;
      totalAmount: number;
      tipCount: number;
    }>;
  } | null>(null);

  const [recentGifts, setRecentGifts] = useState<GiftTransaction[]>([]);
  const [recentTips, setRecentTips] = useState<TipTransaction[]>([]);
  const [topRecipients, setTopRecipients] = useState<TopRecipient[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAnalyticsData();
    }
  }, [user?.id]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Load statistics
      const [gifts, tips, sentGifts] = await Promise.all([
        virtualGiftsService.getGiftStatistics(user?.id || ""),
        virtualGiftsService.getTipStatistics(user?.id || ""),
        virtualGiftsService.getSentGifts(user?.id || "", 50),
      ]);

      setGiftStats(gifts);
      setTipStats(tips);

      // Process recent gifts and build top recipients
      const enrichedGifts = await Promise.all(
        sentGifts.slice(0, 10).map(async (gift) => {
          try {
            const { data: profile } = await (window as any).supabase
              .from("profiles")
              .select("display_name, avatar_url, username")
              .eq("id", gift.to_user_id)
              .single();

            return {
              ...gift,
              recipientName: profile?.display_name || "Unknown",
              recipientUsername: profile?.username || "",
              recipientAvatar: profile?.avatar_url,
            };
          } catch (error) {
            return {
              ...gift,
              recipientName: "Unknown",
              recipientUsername: "",
            };
          }
        }),
      );

      setRecentGifts(enrichedGifts);

      // Get recent tips
      const tips_data = await virtualGiftsService.getReceivedTips(user?.id || "", 10);
      setRecentTips(tips_data);

      // Calculate top recipients
      const recipientMap = new Map<
        string,
        { totalAmount: number; giftCount: number; giftIds: string[] }
      >();

      sentGifts.forEach((gift) => {
        const key = gift.to_user_id;
        if (recipientMap.has(key)) {
          const existing = recipientMap.get(key)!;
          existing.totalAmount += gift.total_amount;
          existing.giftCount += 1;
          existing.giftIds.push(gift.gift_id);
        } else {
          recipientMap.set(key, {
            totalAmount: gift.total_amount,
            giftCount: 1,
            giftIds: [gift.gift_id],
          });
        }
      });

      // Fetch profile data for top recipients
      const topRecipientsData = await Promise.all(
        Array.from(recipientMap.entries())
          .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
          .slice(0, 5)
          .map(async ([userId, stats]) => {
            try {
              const { data: profile } = await (window as any).supabase
                .from("profiles")
                .select("id, username, display_name, avatar_url")
                .eq("id", userId)
                .single();

              return {
                id: profile?.id || userId,
                username: profile?.username || "",
                display_name: profile?.display_name || "Unknown",
                avatar_url: profile?.avatar_url,
                totalAmount: stats.totalAmount,
                giftCount: stats.giftCount,
              };
            } catch (error) {
              return {
                id: userId,
                username: "",
                display_name: "Unknown User",
                totalAmount: stats.totalAmount,
                giftCount: stats.giftCount,
              };
            }
          }),
      );

      setTopRecipients(topRecipientsData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color = "primary",
    loading = false,
  }: {
    icon: any;
    label: string;
    value: string | number;
    color?: string;
    loading?: boolean;
  }) => (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}/10`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${color}`} />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
            {loading ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : (
              <p className="text-lg sm:text-xl font-bold">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6 mt-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          icon={Gift}
          label="Gifts Sent"
          value={giftStats?.totalSent || 0}
          color="purple"
          loading={isLoading}
        />
        <StatCard
          icon={Heart}
          label="Gifts Received"
          value={giftStats?.totalReceived || 0}
          color="pink"
          loading={isLoading}
        />
        <StatCard
          icon={DollarSign}
          label="Total Value"
          value={`$${(giftStats?.totalValue || 0).toFixed(2)}`}
          color="green"
          loading={isLoading}
        />
        <StatCard
          icon={Users}
          label="Recipients"
          value={topRecipients.length}
          color="blue"
          loading={isLoading}
        />
      </div>

      {/* Top Recipients */}
      {!isLoading && topRecipients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Top Recipients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRecipients.map((recipient, index) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-xs font-bold text-primary flex-shrink-0">
                      {index + 1}
                    </div>
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarImage src={recipient.avatar_url} alt={recipient.display_name} />
                      <AvatarFallback>{recipient.display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">
                        {recipient.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recipient.giftCount} gifts • ${recipient.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Badge className="text-xs flex-shrink-0">🎁 x{recipient.giftCount}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Gifts and Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Gifts Sent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <History className="h-4 w-4 sm:h-5 sm:w-5" />
              Recent Gifts Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded" />
                ))}
              </div>
            ) : recentGifts.length > 0 ? (
              <div className="space-y-2">
                {recentGifts.slice(0, 5).map((gift, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2 min-w-0">
                      {gift.recipientAvatar && (
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarImage
                            src={gift.recipientAvatar}
                            alt={gift.recipientName}
                          />
                          <AvatarFallback>{gift.recipientName?.[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{gift.recipientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(gift.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      ${gift.totalAmount.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-xs sm:text-sm py-4">
                No gifts sent yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tips Received */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              Recent Tips Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded" />
                ))}
              </div>
            ) : recentTips.length > 0 ? (
              <div className="space-y-2">
                {recentTips.slice(0, 5).map((tip, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border">
                    <div className="min-w-0">
                      <p className="text-xs font-medium">
                        Tip {tip.isAnonymous ? "(Anonymous)" : `from ${tip.fromUserId.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tip.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      ${tip.amount.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-xs sm:text-sm py-4">
                No tips received yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Gifts Chart */}
      {!isLoading && giftStats && giftStats.topGifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              Most Popular Gifts Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {giftStats.topGifts.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.gift.emoji}</span>
                      <span className="text-xs sm:text-sm font-medium">{item.gift.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      {item.count} sent
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (item.count /
                            Math.max(...giftStats.topGifts.map((g) => g.count), 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {!isLoading && tipStats && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Total Tips Received</span>
              <span className="font-bold">${tipStats.totalTipValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Average Tip Amount</span>
              <span className="font-bold">${tipStats.averageTip.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Top Tippers</span>
              <span className="font-bold">{tipStats.topTippers.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Gift Recipients</span>
              <span className="font-bold">{topRecipients.length}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsTab;
