import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, Gift, DollarSign, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useWalletContext } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";
import { virtualGiftsService } from "@/services/virtualGiftsService";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  timestamp?: string;
  type?: "wallet" | "gift" | "tip";
  icon?: React.ReactNode;
  label?: string;
  emoji?: string;
}

const RecentTransactions = () => {
  const { transactions: walletTransactions } = useWalletContext();
  const { user } = useAuth();
  const [giftTipTransactions, setGiftTipTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadGiftTipTransactions();
  }, [user?.id]);

  const loadGiftTipTransactions = async () => {
    if (!user?.id) return;
    try {
      const [giftHistory, tipHistory] = await Promise.all([
        virtualGiftsService.getGiftHistory(user.id),
        virtualGiftsService.getTipHistory(user.id),
      ]);

      const gifts: Transaction[] = giftHistory.map((gift) => ({
        id: gift.id,
        description: `Sent ${gift.giftEmoji || "🎁"} ${gift.giftName} gift${gift.quantity && gift.quantity > 1 ? 's' : ''}`,
        amount: -gift.totalAmount, // Negative because it's outgoing
        timestamp: gift.createdAt,
        type: "gift",
        emoji: gift.giftEmoji,
      }));

      const tips: Transaction[] = tipHistory.map((tip) => ({
        id: tip.id,
        description: `Sent tip`,
        amount: -tip.amount, // Negative because it's outgoing
        timestamp: tip.createdAt,
        type: "tip",
      }));

      setGiftTipTransactions([...gifts, ...tips]);
    } catch (error) {
      console.error("Error loading gift/tip transactions:", error);
    }
  };

  const allTransactions: Transaction[] = [
    ...walletTransactions.map((t) => ({
      ...t,
      type: "wallet" as const,
    })),
    ...giftTipTransactions,
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime()
    )
    .slice(0, 8);

  const getIcon = (transaction: Transaction) => {
    if (transaction.type === "gift") {
      return <Gift className="h-4 w-4 text-purple-500" />;
    } else if (transaction.type === "tip") {
      return <DollarSign className="h-4 w-4 text-green-500" />;
    } else {
      const positive = (transaction.amount as number) >= 0;
      return positive ? (
        <ArrowDownRight className="h-4 w-4 text-green-600" />
      ) : (
        <ArrowUpRight className="h-4 w-4 text-red-600" />
      );
    }
  };

  const items = allTransactions;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button asChild variant="link" className="p-0">
          <Link to="/app/wallet/transactions">See All</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((t)=>{
          const positive = (t.amount as number) >= 0;
          return (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30">
              <div className="flex items-center gap-3">
                {positive ? (
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <div className="text-sm font-medium">{t.description}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.timestamp||'').toLocaleString()}</div>
                </div>
              </div>
              <div className={`font-semibold ${positive? 'text-green-600':'text-red-600'}`}>
                {positive?'+':''}${Math.abs(t.amount as number).toFixed(2)}
              </div>
            </div>
          );
        })}
        {items.length===0 && (
          <div className="text-sm text-muted-foreground">No transactions yet.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
