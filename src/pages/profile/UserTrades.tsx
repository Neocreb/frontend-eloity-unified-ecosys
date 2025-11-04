import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  Clock,
  MessageSquare,
  ArrowLeft,
  Share2,
  Verified,
  Calendar,
  Shield,
  CreditCard,
  AlertCircle,
  CheckCircle,
  User,
} from "lucide-react";
import { UserProfile } from "@/types/user";
import { profileService } from "@/services/profileService";
import { apiClient, apiCall } from "@/lib/api";

interface P2PTrade {
  id: string;
  type: "buy" | "sell";
  crypto: string;
  crypto_symbol: string;
  fiat_currency: string;
  amount: number;
  price_per_unit: number;
  total_amount: number;
  payment_methods: string[];
  min_limit: number;
  max_limit: number;
  status: "active" | "completed" | "cancelled" | "in_progress";
  completion_rate?: number;
  created_at: string;
  updated_at: string;
  trading_partner?: {
    name: string;
    avatar: string;
    rating: number;
    trades_count: number;
  };
}

interface TradingStats {
  totalTrades: number;
  completedTrades: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
  responseTime: string;
  memberSince: string;
  totalVolume: number;
  successfulTrades: number;
  disputeRate: number;
  favoritePayments: string[];
}

const UserTrades: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active_orders");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTrades, setActiveTrades] = useState<P2PTrade[]>([]);
  const [completedTrades, setCompletedTrades] = useState<P2PTrade[]>([]);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [cryptoPortfolio, setCryptoPortfolio] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const getTradeStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "completed": return "bg-blue-500";
      case "in_progress": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTradeTypeColor = (type: string) => {
    return type === "buy" ? "text-green-600" : "text-red-600";
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!username) {
        setError("Username is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        const profileData = await profileService.getUserByUsername(username);
        if (!profileData) {
          setError("User not found");
          setLoading(false);
          return;
        }
        
        setProfile(profileData);
        
        // Fetch trading stats
        try {
          const statsResponse = await apiCall(`/trading-stats/${profileData.id}`);
          setTradingStats(statsResponse.data);
        } catch (statsError) {
          console.error("Failed to fetch trading stats:", statsError);
          setTradingStats(null);
        }
        
        // Fetch payment methods
        try {
          const paymentsResponse = await apiCall(`/payment-methods/${profileData.id}`);
          setPaymentMethods(paymentsResponse.data);
        } catch (paymentsError) {
          console.error("Failed to fetch payment methods:", paymentsError);
          setPaymentMethods([]);
        }
        
        // Fetch crypto portfolio
        try {
          const portfolioResponse = await apiCall(`/portfolio/${profileData.id}`);
          setCryptoPortfolio(portfolioResponse.data);
        } catch (portfolioError) {
          console.error("Failed to fetch crypto portfolio:", portfolioError);
          setCryptoPortfolio([]);
        }
        
        // Fetch reviews
        try {
          const reviewsResponse = await apiCall(`/reviews/${profileData.id}`);
          setReviews(reviewsResponse.data);
        } catch (reviewsError) {
          console.error("Failed to fetch reviews:", reviewsError);
          setReviews([]);
        }
        
        // Fetch user's P2P trades
        try {
          const tradesResponse = await apiClient.getCryptoTrades();
          // Type guard to ensure we're working with the right data structure
          let tradesData: P2PTrade[] = [];
          if (Array.isArray(tradesResponse)) {
            tradesData = tradesResponse.filter((trade: any) => trade.user_id === profileData.id);
          } else if (tradesResponse && typeof tradesResponse === 'object' && 'trades' in tradesResponse) {
            tradesData = (tradesResponse.trades as any[]).filter((trade: any) => trade.user_id === profileData.id).map((trade: any) => ({
              ...trade,
              status: trade.status as "active" | "completed" | "cancelled" | "in_progress"
            }));
          }
          // Removed mock data fallback to comply with no mock data policy
          
          setActiveTrades(tradesData.filter((t) => t.status === "active" || t.status === "in_progress"));
          setCompletedTrades(tradesData.filter((t) => t.status === "completed"));
        } catch (tradeError) {
          console.error("Failed to fetch trades:", tradeError);
          setError("Failed to load trading data");
          // Clear trades state on error
          setActiveTrades([]);
          setCompletedTrades([]);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading trading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">
            <User className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-muted-foreground">The requested user profile could not be found.</p>
          <Button 
            className="mt-4" 
            asChild
          >
            <Link to="/app/profile">Back to Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show error if no trading stats are available
  if (!tradingStats && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Data Unavailable</h2>
          <p className="text-muted-foreground">Trading statistics are not available for this user.</p>
          <Button 
            className="mt-4" 
            asChild
          >
            <Link to={`/app/profile/${username}`}>Back to Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to={`/app/profile/${username}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Profile</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share Trading Profile
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link to="/app/crypto-p2p">Open P2P Marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Trader Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                {/* Trader Info */}
                <div className="text-center mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name || profile.username || "User"} />
                    <AvatarFallback className="text-lg">
                      {profile.full_name ? profile.full_name.split(" ").map(n => n[0]).join("") : (profile.username ? profile.username.substring(0, 2).toUpperCase() : "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-xl font-bold">{profile.full_name || profile.username}</h1>
                    {profile.is_verified && (
                      <Verified className="h-5 w-5 text-blue-500" />
                    )}
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified Trader
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">@{profile.username || "unknown"}</p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{tradingStats ? tradingStats.averageRating : 0}</span>
                    <span className="text-muted-foreground text-sm">
                      ({tradingStats ? tradingStats.totalReviews : 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Trading Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Trades</span>
                    <span className="font-semibold">{tradingStats ? tradingStats.totalTrades : 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold text-green-600">{tradingStats ? tradingStats.completionRate : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <span className="font-semibold">{tradingStats ? tradingStats.responseTime : "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Volume</span>
                    <span className="font-semibold">${tradingStats ? tradingStats.totalVolume.toLocaleString() : 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dispute Rate</span>
                    <span className="font-semibold text-green-600">{tradingStats ? tradingStats.disputeRate : 0}%</span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="space-y-3 pt-6 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.location || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Trading since {tradingStats ? tradingStats.memberSince : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Usually responds in {tradingStats ? tradingStats.responseTime : "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Use a default icon if method.icon is not available */}
                        {method.icon ? (
                          <method.icon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{method.name || method.type}</span>
                      </div>
                      {method.available ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {cryptoPortfolio.map((crypto, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">
                            {crypto.symbol || crypto.currency}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{crypto.name || crypto.asset}</div>
                          <div className="text-xs text-muted-foreground">
                            {crypto.amount || crypto.balance} {crypto.symbol || crypto.currency}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          ${typeof crypto.value === 'number' ? crypto.value.toLocaleString() : (crypto.amount * crypto.price).toLocaleString()}
                        </div>
                        <div className={`text-xs ${crypto.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {crypto.change >= 0 ? '+' : ''}{crypto.change || crypto.change24h || 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{profile.full_name || profile.username}'s Trading Activity</h2>
              <p className="text-muted-foreground">{profile.bio || "No bio available"}</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="active_orders">Active Orders</TabsTrigger>
                <TabsTrigger value="trade_history">Trade History</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>

              {/* Active Orders Tab */}
              <TabsContent value="active_orders" className="mt-6">
                <div className="space-y-4">
                  {activeTrades.map((trade) => (
                    <Card key={trade.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/app/crypto-p2p?type=${trade.type}&symbol=${trade.crypto_symbol}&fiat=${trade.fiat_currency}&min=${trade.min_limit}&max=${trade.max_limit}`)}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-4 h-4 rounded-full ${getTradeStatusColor(trade.status)}`} />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-bold text-lg ${getTradeTypeColor(trade.type)}`}>
                                  {trade.type.toUpperCase()}
                                </span>
                                <span className="font-medium">{trade.crypto}</span>
                                <Badge variant="outline">{trade.status.replace('_', ' ')}</Badge>
                              </div>
                              <p className="text-muted-foreground text-sm">
                                {trade.amount} {trade.crypto_symbol} for {trade.fiat_currency}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              ${trade.price_per_unit.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">per {trade.crypto_symbol}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Amount</div>
                            <div className="font-medium">{trade.amount} {trade.crypto_symbol}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Total Value</div>
                            <div className="font-medium">${trade.total_amount.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Min Limit</div>
                            <div className="font-medium">${trade.min_limit.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Max Limit</div>
                            <div className="font-medium">${trade.max_limit.toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Payment:</span>
                            <div className="flex gap-2 flex-wrap">
                              {trade.payment_methods.map((method, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {method}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button className="w-full sm:w-auto" size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/app/crypto-p2p?type=${trade.type}&symbol=${trade.crypto_symbol}&fiat=${trade.fiat_currency}&min=${trade.min_limit}&max=${trade.max_limit}`); }}>
                              Continue on P2P
                            </Button>
                            <Button className="w-full sm:w-auto" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact Trader
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Trade History Tab */}
              <TabsContent value="trade_history" className="mt-6">
                <div className="space-y-4">
                  {completedTrades.map((trade) => (
                    <Card key={trade.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-4 h-4 rounded-full ${getTradeStatusColor(trade.status)}`} />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-bold text-lg ${getTradeTypeColor(trade.type)}`}>
                                  {trade.type.toUpperCase()}
                                </span>
                                <span className="font-medium">{trade.crypto}</span>
                                <Badge className="bg-green-100 text-green-800">Completed</Badge>
                              </div>
                              <p className="text-muted-foreground text-sm">
                                Completed on {new Date(trade.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              ${trade.price_per_unit.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">per {trade.crypto_symbol}</div>
                          </div>
                        </div>

                        {trade.trading_partner && (
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={trade.trading_partner.avatar} alt={trade.trading_partner.name} />
                                <AvatarFallback>
                                  {trade.trading_partner.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{trade.trading_partner.name}</div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                  <span>{trade.trading_partner.rating}</span>
                                  <span>•</span>
                                  <span>{trade.trading_partner.trades_count} trades</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${trade.total_amount.toLocaleString()}</div>
                              <div className="text-sm text-green-600">
                                {trade.completion_rate}% completion rate
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar>
                            <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.reviewerName || "Reviewer"} />
                            <AvatarFallback>{review.reviewerName ? review.reviewerName.substring(0, 2).toUpperCase() : "R"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.reviewerName || "Anonymous"}</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= (review.rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{new Date(review.date || review.createdAt).toLocaleDateString() || "Recent"}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.comment || review.feedback || "No comment provided"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="statistics" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Trading Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ${tradingStats ? tradingStats.totalVolume.toLocaleString() : 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Total trading volume</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {tradingStats ? tradingStats.completionRate : 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">Trade completion rate</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Total Trades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {tradingStats ? tradingStats.totalTrades : 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Completed transactions</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTrades;