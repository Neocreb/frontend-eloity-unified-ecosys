import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Star,
  MapPin,
  Clock,
  MessageSquare,
  Heart,
  ArrowLeft,
  Share2,
  DollarSign,
  Verified,
  Calendar,
  Shield,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Coins,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  AlertCircle,
  CheckCircle,
  Eye,
  Filter,
  RefreshCw,
  Target,
} from "lucide-react";
import { UserProfile } from "@/types/user";

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
  const [tradeFilter, setTradeFilter] = useState("all");

  // Mock data - in real app, fetch from API
  const userProfile: UserProfile = {
    id: "1",
    username: username || "",
    full_name: "Michael Chen",
    avatar_url: "/placeholder.svg",
    banner_url: "/placeholder.svg",
    bio: "Experienced crypto trader with focus on security and reliability. Available for P2P trading.",
    location: "Singapore",
    website: "https://michaelchen.trade",
    verified: true,
    created_at: "2021-08-15",
    followers_count: 3240,
    following_count: 890,
    posts_count: 124,
  };

  const tradingStats: TradingStats = {
    totalTrades: 847,
    completedTrades: 823,
    averageRating: 4.8,
    totalReviews: 234,
    completionRate: 97.2,
    responseTime: "< 5 minutes",
    memberSince: "2021",
    totalVolume: 2450000,
    successfulTrades: 823,
    disputeRate: 0.3,
    favoritePayments: ["Bank Transfer", "PayPal", "Wise", "Cash"],
  };

  const activeTrades: P2PTrade[] = [
    {
      id: "1",
      type: "sell",
      crypto: "Bitcoin",
      crypto_symbol: "BTC",
      fiat_currency: "USD",
      amount: 0.5,
      price_per_unit: 42500,
      total_amount: 21250,
      payment_methods: ["Bank Transfer", "PayPal"],
      min_limit: 1000,
      max_limit: 5000,
      status: "active",
      created_at: "2024-01-18T10:30:00Z",
      updated_at: "2024-01-18T10:30:00Z",
    },
    {
      id: "2",
      type: "buy",
      crypto: "Ethereum",
      crypto_symbol: "ETH",
      fiat_currency: "USD",
      amount: 10,
      price_per_unit: 2580,
      total_amount: 25800,
      payment_methods: ["Wise", "Bank Transfer"],
      min_limit: 500,
      max_limit: 3000,
      status: "active",
      created_at: "2024-01-17T15:45:00Z",
      updated_at: "2024-01-17T15:45:00Z",
    },
  ];

  const completedTrades: P2PTrade[] = [
    {
      id: "3",
      type: "sell",
      crypto: "Bitcoin",
      crypto_symbol: "BTC",
      fiat_currency: "USD",
      amount: 1.2,
      price_per_unit: 41800,
      total_amount: 50160,
      payment_methods: ["Bank Transfer"],
      min_limit: 2000,
      max_limit: 10000,
      status: "completed",
      completion_rate: 98,
      created_at: "2024-01-15T09:15:00Z",
      updated_at: "2024-01-16T14:22:00Z",
      trading_partner: {
        name: "Sarah Williams",
        avatar: "/placeholder.svg",
        rating: 4.9,
        trades_count: 156,
      },
    },
  ];

  const paymentMethods = [
    { name: "Bank Transfer", icon: Building, available: true },
    { name: "PayPal", icon: CreditCard, available: true },
    { name: "Wise", icon: Smartphone, available: true },
    { name: "Cash", icon: Banknote, available: false },
  ];

  const cryptoPortfolio = [
    { symbol: "BTC", name: "Bitcoin", amount: 2.45, value: 104125, change: 2.4 },
    { symbol: "ETH", name: "Ethereum", amount: 15.8, value: 40764, change: -1.2 },
    { symbol: "USDT", name: "Tether", amount: 5000, value: 5000, change: 0.1 },
  ];

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
                    <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name} />
                    <AvatarFallback className="text-lg">
                      {userProfile.full_name?.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-xl font-bold">{userProfile.full_name}</h1>
                    {userProfile.verified && (
                      <Verified className="h-5 w-5 text-blue-500" />
                    )}
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified Trader
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">@{userProfile.username}</p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{tradingStats.averageRating}</span>
                    <span className="text-muted-foreground text-sm">
                      ({tradingStats.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Trading Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Trades</span>
                    <span className="font-semibold">{tradingStats.totalTrades}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold text-green-600">{tradingStats.completionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <span className="font-semibold">{tradingStats.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Volume</span>
                    <span className="font-semibold">${tradingStats.totalVolume.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dispute Rate</span>
                    <span className="font-semibold text-green-600">{tradingStats.disputeRate}%</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mb-6">
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Trade
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </Button>
                </div>

                {/* Profile Info */}
                <div className="space-y-3 pt-6 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Trading since {tradingStats.memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Usually responds in {tradingStats.responseTime}</span>
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
                        <method.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{method.name}</span>
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
                            {crypto.symbol}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{crypto.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {crypto.amount} {crypto.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          ${crypto.value.toLocaleString()}
                        </div>
                        <div className={`text-xs ${crypto.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {crypto.change >= 0 ? '+' : ''}{crypto.change}%
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
              <h2 className="text-2xl font-bold mb-2">{userProfile.full_name}'s Trading Activity</h2>
              <p className="text-muted-foreground">{userProfile.bio}</p>
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

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Payment:</span>
                            <div className="flex gap-2">
                              {trade.payment_methods.map((method, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {method}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/app/crypto-p2p?type=${trade.type}&symbol=${trade.crypto_symbol}&fiat=${trade.fiat_currency}&min=${trade.min_limit}&max=${trade.max_limit}`); }}>
                              Continue on P2P
                            </Button>
                            <Button size="sm">
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
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" alt="Reviewer" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">John Doe</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 text-yellow-500 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        "Excellent trader! Fast response time and smooth transaction. Highly recommended for Bitcoin trading."
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" alt="Reviewer" />
                          <AvatarFallback>SM</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Sarah Miller</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 text-yellow-500 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">1 week ago</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        "Professional and reliable trader. The transaction was completed exactly as promised. Will trade again!"
                      </p>
                    </CardContent>
                  </Card>
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
                        ${tradingStats.totalVolume.toLocaleString()}
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
                        {tradingStats.completionRate}%
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
                        {tradingStats.totalTrades}
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
