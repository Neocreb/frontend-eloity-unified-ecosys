import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useWalletContext } from "@/contexts/WalletContext";

const RecentTransactions = () => {
  const { transactions } = useWalletContext();
  const items = [...transactions].sort((a,b)=>new Date(b.timestamp||'').getTime()-new Date(a.timestamp||'').getTime()).slice(0,5);

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
