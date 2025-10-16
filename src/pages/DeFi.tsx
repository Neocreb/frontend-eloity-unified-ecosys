import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import DeFiDashboard from "@/components/crypto/DeFiDashboard";

const DeFi = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access DeFi features.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
  }, [user, navigate, toast]);

  const handleBackToCrypto = () => {
    navigate("/app/crypto");
  };
  const [refreshTick, setRefreshTick] = useState(0);
  const handleRefresh = () => setRefreshTick((t) => t + 1);

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <>
      <Helmet>
        <title>DeFi Dashboard - Decentralized Finance | Eloity</title>
        <meta name="description" content="Access decentralized finance protocols, stake your assets, and earn passive income through our comprehensive DeFi dashboard." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToCrypto}
              aria-label="Back to Crypto"
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0 text-center">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                DeFi Dashboard
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                Stake, earn, and participate in decentralized finance
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              aria-label="Refresh"
              className="shrink-0"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>

          {/* DeFi Dashboard Component */}
          <DeFiDashboard key={refreshTick} />
        </div>
      </div>
    </>
  );
};

export default DeFi;
