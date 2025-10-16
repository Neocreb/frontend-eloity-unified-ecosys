import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AdvancedTradingInterface from "@/components/crypto/AdvancedTradingInterface";
import TradingPairSelector from "@/components/crypto/TradingPairSelector";

const CryptoTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPair, setSelectedPair] = useState(searchParams.get("pair") || "ETHUSDT");

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the trading platform.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
  }, [user, navigate, toast]);

  const handleBackToCrypto = () => {
    navigate("/app/crypto");
  };

  const handlePairSelect = (pair: string) => {
    setSelectedPair(pair);
    setSearchParams({ pair });
    toast({
      title: "Trading Pair Changed",
      description: `Switched to ${pair} trading`,
    });
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <>
      <Helmet>
        <title>Crypto Trading - Professional Trading Platform | Eloity</title>
        <meta name="description" content="Professional cryptocurrency trading with advanced charts, real-time data, and comprehensive trading tools." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Exchange-Style Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToCrypto}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Trading
                </h1>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <TradingPairSelector
                  currentPair={selectedPair}
                  onPairSelect={handlePairSelect}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Live Market
              </span>
            </div>
          </div>

          {/* Trading Interface */}
          <AdvancedTradingInterface selectedPair={selectedPair.replace("USDT", "/USDT")} />
        </div>
      </div>
    </>
  );
};

export default CryptoTrading;
