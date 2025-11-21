import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Gift,
  Heart,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { virtualGiftsService } from "@/services/virtualGiftsService";

interface GiftTip {
  id: string;
  type: "gift" | "tip";
  direction: "sent" | "received";
  recipientId?: string;
  recipientName?: string;
  senderId?: string;
  senderName?: string;
  amount: number;
  giftName?: string;
  giftEmoji?: string;
  quantity?: number;
  message?: string;
  isAnonymous?: boolean;
  createdAt: string;
}

interface GiftTransactionDisplayProps {
  limit?: number;
  showTitle?: boolean;
  compact?: boolean;
}

export const GiftTransactionDisplay = ({
  limit = 10,
  showTitle = true,
  compact = false,
}: GiftTransactionDisplayProps) => {
  const { user } = useAuth();
  const [giftTipTransactions, setGiftTipTransactions] = useState<GiftTip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGiftTipTransactions();
  }, [user?.id]);

  const loadGiftTipTransactions = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [giftHistory, tipHistory] = await Promise.all([
        virtualGiftsService.getGiftHistory(user.id),
        virtualGiftsService.getTipHistory(user.id),
      ]);

      const giftTransactions: GiftTip[] = giftHistory.map((gift) => ({
        id: gift.id,
        type: "gift",
        direction: "sent",
        recipientId: gift.recipientId,
        amount: gift.totalAmount,
        giftName: gift.giftName,
        giftEmoji: gift.giftEmoji || "🎁",
        quantity: gift.quantity,
        message: gift.message,
        isAnonymous: gift.isAnonymous,
        createdAt: gift.createdAt,
      }));

      const tipTransactions: GiftTip[] = tipHistory.map((tip) => ({
        id: tip.id,
        type: "tip",
        direction: "sent",
        recipientId: tip.recipientId,
        amount: tip.amount,
        createdAt: tip.createdAt,
      }));

      const combined = [...giftTransactions, ...tipTransactions]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit);

      setGiftTipTransactions(combined);
    } catch (error) {
      console.error("Error loading gift/tip transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (transaction: GiftTip) => {
    if (transaction.type === "gift") {
      return <Gift className="h-4 w-4 text-purple-500" />;
    } else {
      return <DollarSign className="h-4 w-4 text-green-500" />;
    }
  };

  const getTransactionLabel = (transaction: GiftTip) => {
    if (transaction.type === "gift") {
      return `Sent ${transaction.giftEmoji} ${transaction.giftName}`;
    } else {
      return `Tipped $${transaction.amount.toFixed(2)}`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Gift & Tip Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (giftTipTransactions.length === 0) {
    return null;
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Gift & Tip Activity
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {giftTipTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 ${
                compact ? "text-sm" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  {getTransactionIcon(transaction)}
                </div>
                <div>
                  <div className={`font-medium ${compact ? "text-xs" : "text-sm"}`}>
                    {getTransactionLabel(transaction)}
                  </div>
                  <div className={`text-muted-foreground ${compact ? "text-xs" : "text-xs"}`}>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-purple-600">
                  ${transaction.amount.toFixed(2)}
                </span>
                {transaction.isAnonymous && (
                  <Badge variant="secondary" className="text-xs">
                    Anonymous
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GiftTransactionDisplay;
