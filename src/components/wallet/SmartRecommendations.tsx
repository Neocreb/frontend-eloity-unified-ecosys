import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Zap, Sparkles, Gift } from "lucide-react";
import { useWalletContext } from "@/contexts/WalletContext";
import { useAuth } from "@/contexts/AuthContext";

const SmartRecommendations = () => {
  const { walletBalance, transactions, getTotalEarnings } = useWalletContext();
  const { user } = useAuth();

  const recs: {
    id: string; title: string; description: string; priority: 'high'|'medium'|'low'; icon: JSX.Element;
  }[] = [];

  if (walletBalance && walletBalance.total > 1000) {
    recs.push({ id:'savings', title:'Start a Savings Goal', description:'Consider setting aside 20% for savings.', priority:'medium', icon:<Target className="h-4 w-4"/> });
  }
  if (walletBalance && walletBalance.crypto > 0 && getTotalEarnings(30) > 500) {
    recs.push({ id:'investment', title:'Diversify Your Portfolio', description:'Your crypto earnings are growing. Consider diversifying.', priority:'high', icon:<TrendingUp className="h-4 w-4"/> });
  }
  const recent = transactions.filter(t=> new Date(t.timestamp||'').getTime() > Date.now()-7*24*60*60*1000);
  if (recent.length>10) {
    recs.push({ id:'spending', title:'Monitor Your Spending', description:'You have many transactions this week. Review patterns.', priority:'medium', icon:<Zap className="h-4 w-4"/> });
  }
  if (!(user as any)?.profile?.two_factor_enabled) {
    recs.push({ id:'security', title:'Enable 2FA for Better Security', description:'Protect your account with two-factor authentication.', priority:'high', icon:<Sparkles className="h-4 w-4"/> });
  }
  if (walletBalance && walletBalance.freelance > 0) {
    recs.push({ id:'feature', title:'Try Auto-Invest', description:'Automatically invest a portion of freelance earnings.', priority:'low', icon:<Gift className="h-4 w-4"/> });
  }

  const color=(p:'high'|'medium'|'low')=> p==='high'? 'bg-red-100 text-red-800': p==='medium'? 'bg-yellow-100 text-yellow-800':'bg-blue-100 text-blue-800';

  if (recs.length===0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recs.slice(0,3).map(r=> (
          <div key={r.id} className="flex items-start gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">{r.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium text-sm">{r.title}</div>
                <Badge className={color(r.priority)} variant="secondary">{r.priority}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">{r.description}</div>
            </div>
            <Button size="sm" variant="outline">View</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartRecommendations;
