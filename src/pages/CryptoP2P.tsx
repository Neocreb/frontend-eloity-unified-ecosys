import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Users, Shield, Clock, Filter, History, Plus } from "lucide-react";
import { BannerAd } from "@/components/ads/BannerAd";
import EnhancedP2PMarketplace from "@/components/crypto/EnhancedP2PMarketplace";

const CryptoP2P = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("market");
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [tradingMode, setTradingMode] = useState("buy");

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the P2P marketplace.",
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
        <title>Crypto P2P Trading - Peer-to-Peer Marketplace | Eloity</title>
        <meta name="description" content="Trade cryptocurrencies directly with other users in a secure peer-to-peer environment." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Navigation */}
          <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
            {/* Left side - Back button and Navigation Tabs */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToCrypto}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab("market")}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 whitespace-nowrap py-2 ${
                    activeTab === "market" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
                  }`}
                >
                  Market
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 whitespace-nowrap py-2 ${
                    activeTab === "orders" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab("my-offers")}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 whitespace-nowrap py-2 ${
                    activeTab === "my-offers" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
                  }`}
                >
                  My Offers
                </button>
                <button
                  onClick={() => setActiveTab("neoai")}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 whitespace-nowrap py-2 ${
                    activeTab === "neoai" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"
                  }`}
                >
                  NeoAi
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            {activeTab === "market" && (
              <>
                {/* Banner Ad - Only on Market Tab */}
                <div className="py-6">
                  <BannerAd position="top" />
                </div>

                {/* Trading Controls - Only on Market Tab */}
                <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                  {/* Mobile: Stack vertically, Desktop: Side by side */}
                  <div className="flex items-center justify-between w-full sm:w-auto">
                    {/* Left side - Buy/Sell Buttons */}
                    <div className="flex items-center">
                      <Tabs value={tradingMode} onValueChange={setTradingMode}>
                        <TabsList className="grid grid-cols-2 h-9 w-28">
                          <TabsTrigger value="buy" className="text-green-600 data-[state=active]:text-green-700 data-[state=active]:bg-green-50 text-sm">
                            Buy
                          </TabsTrigger>
                          <TabsTrigger value="sell" className="text-red-600 data-[state=active]:text-red-700 data-[state=active]:bg-red-50 text-sm">
                            Sell
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Right side - Currency Selector (Mobile: same row) */}
                    <div className="flex items-center gap-2 sm:hidden">
                      <span className="text-sm text-gray-600">Currency:</span>
                      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                        <SelectTrigger className="w-20 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">NGN</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="KES">KES</SelectItem>
                          <SelectItem value="GHS">GHS</SelectItem>
                          <SelectItem value="ZAR">ZAR</SelectItem>
                          <SelectItem value="EGP">EGP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Center - Create Offer Button */}
                  <div className="flex justify-center w-full sm:flex-1">
                    <Button
                      onClick={() => setTriggerCreateOffer(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9 w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Offer
                    </Button>
                  </div>

                  {/* Right side - Currency Selector (Desktop only) */}
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Currency:</span>
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                      <SelectTrigger className="w-24 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">NGN</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="GHS">GHS</SelectItem>
                        <SelectItem value="ZAR">ZAR</SelectItem>
                        <SelectItem value="EGP">EGP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <EnhancedP2PMarketplace
                  triggerCreateOffer={triggerCreateOffer}
                  onCreateOfferTriggered={() => setTriggerCreateOffer(false)}
                />
              </>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Order Management
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Select defaultValue="all">
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Orders</SelectItem>
                              <SelectItem value="ongoing">Ongoing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="disputed">Disputed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select defaultValue="30d">
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7d">Last 7 days</SelectItem>
                              <SelectItem value="30d">Last 30 days</SelectItem>
                              <SelectItem value="90d">Last 90 days</SelectItem>
                              <SelectItem value="all">All time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          More Filters
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">Ongoing</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                        <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">0</div>
                        <div className="text-sm text-red-600 dark:text-red-400">Cancelled</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">$0</div>
                        <div className="text-sm text-purple-600 dark:text-purple-400">Total Volume</div>
                      </div>
                    </div>

                    {/* Empty State */}
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                        No Orders Yet
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                        Start trading on the market to see your active and completed orders here.
                        All order activity and history will be tracked in this dashboard.
                      </p>
                      <Button
                        onClick={() => setActiveTab("market")}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Go to Market
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "my-offers" && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">My Offers</h3>
                  <p className="text-gray-600">
                    Create and manage your buy/sell offers
                  </p>
                  <Button className="mt-4">Create Offer</Button>
                </CardContent>
              </Card>
            )}

            {activeTab === "neoai" && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">NeoAi Matching</h3>
                  <p className="text-gray-600">
                    AI-powered smart matching for optimal P2P trades
                  </p>
                  <Button className="mt-4">Enable Smart Matching</Button>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default CryptoP2P;
