import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Star,
  MessageCircle,
  Filter,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Globe,
  CreditCard,
  Smartphone,
  Building,
  DollarSign,
  Timer,
  Award,
  Eye,
  ThumbsUp,
  Flag,
  Lock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cryptoService } from "@/services/cryptoService";
import { cryptoNotificationService } from "@/services/cryptoNotificationService";
import { useAuth } from "@/contexts/AuthContext";
import { P2POffer, P2PTrade, UserProfile } from "@/types/crypto";
import P2PEscrowSystem from "./P2PEscrowSystem";
import P2PDisputeResolution from "./P2PDisputeResolution";
import { cn } from "@/lib/utils";

export interface EnhancedP2PMarketplaceProps {
  triggerCreateOffer?: boolean;
  onCreateOfferTriggered?: () => void;
}

export default function EnhancedP2PMarketplace({
  triggerCreateOffer = false,
  onCreateOfferTriggered
}: EnhancedP2PMarketplaceProps) {
  const [marketplaceTab, setMarketplaceTab] = useState("buy");
  const [offers, setOffers] = useState<P2POffer[]>([]);
  const [myTrades, setMyTrades] = useState<P2PTrade[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [selectedFiat, setSelectedFiat] = useState("USD");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [showOfferDetails, setShowOfferDetails] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<P2POffer | null>(null);
  const [showEscrowSystem, setShowEscrowSystem] = useState(false);
  const [showDisputeResolution, setShowDisputeResolution] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);

  // Create offer form state
  const [newOffer, setNewOffer] = useState({
    type: "SELL" as "BUY" | "SELL",
    asset: "BTC",
    fiatCurrency: "USD",
    price: "",
    minAmount: "",
    maxAmount: "",
    totalAmount: "",
    paymentMethods: [] as string[],
    terms: "",
    autoReply: "",
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const assets = ["BTC", "ETH", "USDT", "BNB", "ADA", "SOL", "DOT", "AVAX"];
  const fiatCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "NGN",
    "KES",
    "GHS",
    "ZAR",
    "EGP",
  ];
  const paymentMethods = [
    { id: "bank", name: "Bank Transfer", icon: Building },
    { id: "wise", name: "Wise", icon: Globe },
    { id: "paypal", name: "PayPal", icon: CreditCard },
    { id: "revolut", name: "Revolut", icon: Smartphone },
    { id: "mobile", name: "Mobile Money", icon: Smartphone },
    { id: "cash", name: "Cash", icon: DollarSign },
  ];

  useEffect(() => {
    loadP2PData();
  }, [selectedAsset, selectedFiat, selectedPayment, minAmount, searchQuery, marketplaceTab]);

  // Handle external create offer trigger
  useEffect(() => {
    if (triggerCreateOffer) {
      setShowCreateOffer(true);
      onCreateOfferTriggered?.();
    }
  }, [triggerCreateOffer, onCreateOfferTriggered]);

  const loadP2PData = async () => {
    setIsLoading(true);
    try {
      const offersData = await cryptoService.getP2POffers({
        asset: selectedAsset,
        fiatCurrency: selectedFiat,
        type: marketplaceTab.toUpperCase(),
      });
      setOffers(offersData || []);
      // In a real app, load user's trades
      setMyTrades([]);
    } catch (error) {
      console.error("Failed to load P2P data:", error);
      // Use mock data for testing filters
      const mockOffers: any[] = [
        {
          id: "offer-1",
          userId: "user-1",
          type: "SELL" as const,
          asset: selectedAsset,
          fiatCurrency: selectedFiat,
          price: 45000,
          minAmount: 100,
          maxAmount: 5000,
          totalAmount: 10000,
          availableAmount: 10000,
          paymentMethods: [
            { id: "bank", name: "Bank Transfer", type: "BANK_TRANSFER" as const, processingTime: "1-2 hours", isActive: true },
            { id: "mobile", name: "Mobile Money", type: "DIGITAL_WALLET" as const, processingTime: "Instant", isActive: true }
          ],
          terms: "Payment within 15 minutes",
          status: "ACTIVE" as const,
          completionRate: 98.5,
          avgReleaseTime: 12,
          totalTrades: 125,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            id: "user-1",
            username: "CryptoTrader01",
            avatar: "",
            rating: 4.8,
            totalTrades: 125,
            completionRate: 98.5,
            avgReleaseTime: 12,
            isVerified: true,
            kycLevel: 2,
            isOnline: true
          }
        },
        {
          id: "offer-2",
          userId: "user-2",
          type: "BUY" as const,
          asset: selectedAsset,
          fiatCurrency: selectedFiat,
          price: 44800,
          minAmount: 50,
          maxAmount: 3000,
          totalAmount: 8000,
          availableAmount: 8000,
          paymentMethods: [
            { id: "paypal", name: "PayPal", type: "DIGITAL_WALLET" as const, processingTime: "Instant", isActive: true },
            { id: "wise", name: "Wise", type: "BANK_TRANSFER" as const, processingTime: "1-3 hours", isActive: true }
          ],
          terms: "Quick release guaranteed",
          status: "ACTIVE" as const,
          completionRate: 99.1,
          avgReleaseTime: 8,
          totalTrades: 89,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            id: "user-2",
            username: "FastTrader",
            avatar: "",
            rating: 4.9,
            totalTrades: 89,
            completionRate: 99.1,
            avgReleaseTime: 8,
            isVerified: true,
            kycLevel: 3,
            isOnline: true
          }
        }
      ];
      setOffers(mockOffers);
      console.warn("P2P marketplace: Using fallback mock data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    try {
      const offerData = {
        crypto_type: newOffer.asset,
        offer_type: newOffer.type.toLowerCase(),
        amount: parseFloat(newOffer.totalAmount),
        price_per_unit: parseFloat(newOffer.price),
        payment_method: newOffer.paymentMethods.join(','),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        notes: newOffer.terms || undefined,
      };

      const createdOffer = await cryptoService.createP2POffer(offerData);
      setOffers((prev) => [createdOffer, ...prev]);
      setShowCreateOffer(false);

      // Reset form
      setNewOffer({
        type: "SELL",
        asset: "BTC",
        fiatCurrency: "USD",
        price: "",
        minAmount: "",
        maxAmount: "",
        totalAmount: "",
        paymentMethods: [],
        terms: "",
        autoReply: "",
      });

      toast({
        title: "Offer Created",
        description: "Your P2P offer has been created successfully",
      });

      // Send unified notification
      if (user?.id) {
        await cryptoNotificationService.notifyP2PTrade(
          user.id,
          "offer created",
          newOffer.asset,
          parseFloat(newOffer.totalAmount)
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create offer",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "NGN" ? "USD" : currency, // Fallback for unsupported currencies
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatCrypto = (amount: number, asset: string) => {
    return `${amount.toFixed(8)} ${asset}`;
  };

  const getTraderRating = (rating: number) => {
    if (rating >= 4.8) return { color: "text-green-600", label: "Excellent" };
    if (rating >= 4.5) return { color: "text-blue-600", label: "Very Good" };
    if (rating >= 4.0) return { color: "text-yellow-600", label: "Good" };
    return { color: "text-red-600", label: "Fair" };
  };

  const getReleaseTimeColor = (minutes: number) => {
    if (minutes <= 15) return "text-green-600";
    if (minutes <= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredOffers = offers.filter((offer) => {
    if (
      searchQuery &&
      !offer.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (
      selectedPayment !== "all" &&
      !offer.paymentMethods.some((pm) => pm.id === selectedPayment)
    ) {
      return false;
    }

    if (minAmount && offer.maxAmount < parseFloat(minAmount)) {
      return false;
    }

    if (maxAmount && offer.minAmount > parseFloat(maxAmount)) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Trust Indicators */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-2 md:flex md:items-center md:justify-center gap-3 md:gap-8 text-xs md:text-sm">
            <div className="flex items-center gap-1 md:gap-2 text-blue-800">
              <Shield className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="font-medium truncate">Escrow Protection</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 text-green-800">
              <Award className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="font-medium truncate">Verified Traders</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 text-purple-800">
              <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="font-medium truncate">24/7 Support</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 text-orange-800">
              <Users className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="font-medium truncate">Active Community</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Filters */}
      <div className="flex items-center gap-2 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-16 h-8 text-xs border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset} value={asset}>
                  {asset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select
          value={selectedPayment}
          onValueChange={(value) => {
            setSelectedPayment(value);
            console.log('Payment method changed to:', value);
          }}
        >
          <SelectTrigger className="w-32 h-8 text-xs border-gray-300 flex-shrink-0">
            <SelectValue placeholder="All Payment..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {paymentMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Amount"
          value={minAmount}
          onChange={(e) => {
            setMinAmount(e.target.value);
            console.log('Amount changed to:', e.target.value);
          }}
          type="number"
          className="w-20 h-8 text-xs border-gray-300 flex-shrink-0"
        />

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 border-gray-300 hover:bg-gray-50 flex-shrink-0"
          onClick={() => {
            console.log('Filter button clicked');
            setSelectedPayment("all");
            setMinAmount("");
            setSearchQuery("");
            setSelectedAsset("BTC");
          }}
        >
          <Filter className="h-3 w-3" />
          <span className="bg-orange-500 text-white text-xs w-3 h-3 rounded-full flex items-center justify-center ml-1 text-[10px]">1</span>
        </Button>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading offers...</p>
          </div>
        ) : filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => {
            const ratingInfo = getTraderRating(offer.user.rating);
            return (
              <Card
                key={offer.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedOffer(offer);
                  setShowOfferDetails(true);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Trader Info */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={offer.user.avatar} />
                        <AvatarFallback>
                          {offer.user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {offer.user.username}
                          </span>
                          {offer.user.isVerified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            KYC {offer.user.kycLevel}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className={ratingInfo.color}>
                              {offer.user.rating.toFixed(1)} (
                              {ratingInfo.label})
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{offer.user.totalTrades} trades</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>
                              {offer.user.completionRate.toFixed(1)}%
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock
                              className={cn(
                                "h-4 w-4",
                                getReleaseTimeColor(
                                  offer.user.avgReleaseTime,
                                ),
                              )}
                            />
                            <span
                              className={getReleaseTimeColor(
                                offer.user.avgReleaseTime,
                              )}
                            >
                              ~{offer.user.avgReleaseTime}min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Offer Details */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center lg:text-left">
                      <div>
                        <div className="text-sm text-gray-600">Price</div>
                        <div className="font-bold text-lg">
                          {formatCurrency(offer.price, offer.fiatCurrency)}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600">
                          Available
                        </div>
                        <div className="font-semibold">
                          {formatCrypto(
                            offer.availableAmount / offer.price,
                            offer.asset,
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600">Limits</div>
                        <div className="font-semibold text-sm">
                          {formatCurrency(
                            offer.minAmount,
                            offer.fiatCurrency,
                          )}{" "}
                          -
                          {formatCurrency(
                            offer.maxAmount,
                            offer.fiatCurrency,
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600 mb-2">
                          Payment
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {offer.paymentMethods
                            .slice(0, 2)
                            .map((method) => (
                              <Badge
                                key={method.id}
                                variant="outline"
                                className="text-xs"
                              >
                                {method.name}
                              </Badge>
                            ))}
                          {offer.paymentMethods.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{offer.paymentMethods.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col gap-2">
                      <Button
                        className={cn(
                          "w-full",
                          offer.type === "SELL"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700",
                        )}
                        onClick={() => {
                          // Simulate starting escrow trade
                          const mockTrade = {
                            id: `trade-${Date.now()}`,
                            buyerId:
                              offer.type === "SELL"
                                ? "currentUser"
                                : offer.userId,
                            sellerId:
                              offer.type === "SELL"
                                ? offer.userId
                                : "currentUser",
                            asset: offer.asset,
                            amount: 0.1,
                            fiatAmount: offer.price * 0.1,
                            fiatCurrency: offer.fiatCurrency,
                            price: offer.price,
                            paymentMethod:
                              offer.paymentMethods[0]?.name ||
                              "Bank Transfer",
                            status: "INITIATED",
                            escrowStatus: "PENDING",
                            timeRemaining: 30,
                            autoReleaseTime: new Date(
                              Date.now() + 30 * 60000,
                            ).toISOString(),
                            buyer:
                              offer.type === "SELL"
                                ? {
                                    id: "currentUser",
                                    username: "You",
                                    avatar: "",
                                    rating: 4.8,
                                    completedTrades: 15,
                                  }
                                : offer.user,
                            seller:
                              offer.type === "SELL"
                                ? offer.user
                                : {
                                    id: "currentUser",
                                    username: "You",
                                    avatar: "",
                                    rating: 4.8,
                                    completedTrades: 15,
                                  },
                            steps: [
                              {
                                id: "1",
                                title: "Escrow Initialized",
                                description:
                                  "Trade created and escrow started",
                                status: "COMPLETED",
                                completedAt: new Date().toISOString(),
                              },
                              {
                                id: "2",
                                title: "Payment Required",
                                description: "Buyer needs to make payment",
                                status: "IN_PROGRESS",
                                estimatedTime: 15,
                              },
                              {
                                id: "3",
                                title: "Payment Confirmation",
                                description:
                                  "Seller confirms payment received",
                                status: "PENDING",
                                estimatedTime: 5,
                              },
                              {
                                id: "4",
                                title: "Asset Release",
                                description:
                                  "Cryptocurrency released to buyer",
                                status: "PENDING",
                                estimatedTime: 2,
                              },
                            ],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          };
                          setSelectedTrade(mockTrade);
                          setShowEscrowSystem(true);
                        }}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        {offer.type === "SELL"
                          ? "Buy with Escrow"
                          : "Sell with Escrow"}
                      </Button>

                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </div>

                  {offer.terms && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Terms: {offer.terms}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Offers Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or create your own offer
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Offer Dialog */}
      <Dialog open={showCreateOffer} onOpenChange={setShowCreateOffer}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create P2P Offer</DialogTitle>
            <DialogDescription>
              Create a new offer to buy or sell cryptocurrency
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Offer Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                I want to
              </label>
              <Tabs
                value={newOffer.type.toLowerCase()}
                onValueChange={(value) =>
                  setNewOffer((prev) => ({
                    ...prev,
                    type: value.toUpperCase() as "BUY" | "SELL",
                  }))
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sell" className="text-green-600">
                    Sell {newOffer.asset}
                  </TabsTrigger>
                  <TabsTrigger value="buy" className="text-red-600">
                    Buy {newOffer.asset}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Asset and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Asset</label>
                <Select
                  value={newOffer.asset}
                  onValueChange={(value) =>
                    setNewOffer((prev) => ({ ...prev, asset: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset} value={asset}>
                        {asset}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fiat Currency
                </label>
                <Select
                  value={newOffer.fiatCurrency}
                  onValueChange={(value) =>
                    setNewOffer((prev) => ({ ...prev, fiatCurrency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fiatCurrencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price and Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price per {newOffer.asset} ({newOffer.fiatCurrency})
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newOffer.price}
                  onChange={(e) =>
                    setNewOffer((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Total Amount ({newOffer.fiatCurrency})
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newOffer.totalAmount}
                  onChange={(e) =>
                    setNewOffer((prev) => ({
                      ...prev,
                      totalAmount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Min Order ({newOffer.fiatCurrency})
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newOffer.minAmount}
                  onChange={(e) =>
                    setNewOffer((prev) => ({
                      ...prev,
                      minAmount: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Max Order ({newOffer.fiatCurrency})
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newOffer.maxAmount}
                  onChange={(e) =>
                    setNewOffer((prev) => ({
                      ...prev,
                      maxAmount: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Payment Methods
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={newOffer.paymentMethods.includes(method.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewOffer((prev) => ({
                            ...prev,
                            paymentMethods: [...prev.paymentMethods, method.id],
                          }));
                        } else {
                          setNewOffer((prev) => ({
                            ...prev,
                            paymentMethods: prev.paymentMethods.filter(
                              (id) => id !== method.id,
                            ),
                          }));
                        }
                      }}
                    />
                    <method.icon className="h-4 w-4" />
                    <span className="text-sm">{method.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms and Auto Reply */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Terms (Optional)
              </label>
              <Input
                placeholder="e.g., Payment within 15 minutes required"
                value={newOffer.terms}
                onChange={(e) =>
                  setNewOffer((prev) => ({ ...prev, terms: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Auto Reply Message (Optional)
              </label>
              <Input
                placeholder="e.g., Thank you for your order. Please make payment within 15 minutes."
                value={newOffer.autoReply}
                onChange={(e) =>
                  setNewOffer((prev) => ({
                    ...prev,
                    autoReply: e.target.value,
                  }))
                }
              />
            </div>

            {/* Summary */}
            {newOffer.price && newOffer.totalAmount && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="font-medium">Offer Summary:</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>You will {newOffer.type.toLowerCase()}:</span>
                    <span>
                      {formatCrypto(
                        parseFloat(newOffer.totalAmount) /
                          parseFloat(newOffer.price),
                        newOffer.asset,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>For:</span>
                    <span>
                      {formatCurrency(
                        parseFloat(newOffer.totalAmount),
                        newOffer.fiatCurrency,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>
                      {formatCurrency(
                        parseFloat(newOffer.price),
                        newOffer.fiatCurrency,
                      )}{" "}
                      per {newOffer.asset}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateOffer(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOffer}
                disabled={
                  !newOffer.price ||
                  !newOffer.totalAmount ||
                  !newOffer.minAmount ||
                  !newOffer.maxAmount ||
                  newOffer.paymentMethods.length === 0
                }
              >
                Create Offer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Offer Details Dialog */}
      <Dialog open={showOfferDetails} onOpenChange={setShowOfferDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedOffer?.type === "SELL" ? "Buy" : "Sell"}{" "}
              {selectedOffer?.asset}
            </DialogTitle>
            <DialogDescription>
              Trade with {selectedOffer?.user.username}
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-6">
              {/* Trader Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedOffer.user.avatar} />
                  <AvatarFallback>
                    {selectedOffer.user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {selectedOffer.user.username}
                    </span>
                    {selectedOffer.user.isVerified && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>Rating: {selectedOffer.user.rating.toFixed(1)}/5</div>
                    <div>Trades: {selectedOffer.user.totalTrades}</div>
                    <div>
                      Completion: {selectedOffer.user.completionRate.toFixed(1)}
                      %
                    </div>
                    <div>
                      Avg Release: ~{selectedOffer.user.avgReleaseTime}min
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Price</div>
                    <div className="text-xl font-bold">
                      {formatCurrency(
                        selectedOffer.price,
                        selectedOffer.fiatCurrency,
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Available</div>
                    <div className="font-semibold">
                      {formatCrypto(
                        selectedOffer.availableAmount / selectedOffer.price,
                        selectedOffer.asset,
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Order Limits</div>
                    <div className="font-semibold">
                      {formatCurrency(
                        selectedOffer.minAmount,
                        selectedOffer.fiatCurrency,
                      )}{" "}
                      -{" "}
                      {formatCurrency(
                        selectedOffer.maxAmount,
                        selectedOffer.fiatCurrency,
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Payment Methods</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedOffer.paymentMethods.map((method) => (
                        <Badge
                          key={method.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {method.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              {selectedOffer.terms && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800 mb-1">
                    Terms & Conditions:
                  </div>
                  <div className="text-sm text-yellow-700">
                    {selectedOffer.terms}
                  </div>
                </div>
              )}

              {/* Trade Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Amount ({selectedOffer.fiatCurrency})
                  </label>
                  <Input
                    type="number"
                    placeholder={`${selectedOffer.minAmount} - ${selectedOffer.maxAmount}`}
                    min={selectedOffer.minAmount}
                    max={selectedOffer.maxAmount}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowOfferDetails(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={cn(
                      selectedOffer.type === "SELL"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700",
                    )}
                  >
                    {selectedOffer.type === "SELL" ? "Buy" : "Sell"}{" "}
                    {selectedOffer.asset}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Escrow System Modal */}
      {selectedTrade && (
        <P2PEscrowSystem
          trade={selectedTrade}
          currentUserId="currentUser"
          isOpen={showEscrowSystem}
          onClose={() => {
            setShowEscrowSystem(false);
            setSelectedTrade(null);
          }}
          onAction={(action, data) => {
            console.log("Escrow action:", action, data);
            if (action === "open_dispute") {
              setShowEscrowSystem(false);
              const mockDispute = {
                id: `dispute-${Date.now()}`,
                tradeId: selectedTrade.id,
                complainantId: "currentUser",
                respondentId:
                  selectedTrade.sellerId === "currentUser"
                    ? selectedTrade.buyerId
                    : selectedTrade.sellerId,
                reason: "Payment Issue",
                category: "PAYMENT_ISSUE",
                status: "OPEN",
                priority: "MEDIUM",
                description: "Payment was made but not confirmed by seller",
                evidence: [],
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deadlineAt: new Date(
                  Date.now() + 48 * 60 * 60 * 1000,
                ).toISOString(),
                trade: {
                  asset: selectedTrade.asset,
                  amount: selectedTrade.amount,
                  fiatAmount: selectedTrade.fiatAmount,
                  fiatCurrency: selectedTrade.fiatCurrency,
                  paymentMethod: selectedTrade.paymentMethod,
                },
                complainant: selectedTrade.buyer,
                respondent: selectedTrade.seller,
              };
              setSelectedDispute(mockDispute);
              setShowDisputeResolution(true);
            }
            toast({
              title: "Action Processed",
              description: `${action.replace("_", " ")} has been processed.`,
            });
          }}
        />
      )}

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <P2PDisputeResolution
          dispute={selectedDispute}
          currentUserId="currentUser"
          isOpen={showDisputeResolution}
          onClose={() => {
            setShowDisputeResolution(false);
            setSelectedDispute(null);
          }}
          onSubmitEvidence={(evidence) => {
            console.log("Evidence submitted:", evidence);
            toast({
              title: "Evidence Submitted",
              description: "Your evidence has been uploaded successfully.",
            });
          }}
          onSendMessage={(message) => {
            console.log("Message sent:", message);
          }}
          onAcceptResolution={() => {
            toast({
              title: "Resolution Accepted",
              description: "You have accepted the dispute resolution.",
            });
            setShowDisputeResolution(false);
            setSelectedDispute(null);
          }}
          onAppealResolution={() => {
            toast({
              title: "Appeal Submitted",
              description: "Your appeal has been submitted for review.",
            });
          }}
        />
      )}
    </div>
  );
}
