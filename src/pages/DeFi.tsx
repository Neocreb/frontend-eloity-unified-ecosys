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

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <>
      <Helmet>
        <title>DeFi Dashboard - Decentralized Finance | Softchat</title>
        <meta name="description" content="Access decentralized finance protocols, stake your assets, and earn passive income through our comprehensive DeFi dashboard." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToCrypto}
                className="-ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Crypto
              </Button>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                DeFi Dashboard
              </h1>
            </div>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Stake, earn, and participate in decentralized finance
            </p>
          </div>

          {/* DeFi Dashboard Component */}
          <DeFiDashboard />
        </div>
      </div>
    </>
  );
};

export default DeFi;
