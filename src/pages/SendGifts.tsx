// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VirtualGiftsAndTips from "@/components/premium/VirtualGiftsAndTips";
import SuggestedUsers from "@/components/profile/SuggestedUsers";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  virtualGiftsService,
  VirtualGift,
  GiftTransaction,
  TipTransaction,
  CreatorTipSettings,
  VIRTUAL_GIFTS,
} from "@/services/virtualGiftsService";
import {
  Gift,
  Heart,
  Star,
  Trophy,
  Crown,
  Coffee,
  Users,
  Search,
  TrendingUp,
  DollarSign,
  History,
  ArrowLeft,
  Sparkles,
  Zap,
  Send,
  UserCheck,
  Calendar,
  Award,
  Eye,
  EyeOff,
} from "lucide-react";

const SendGifts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");

  // Virtual Gifts & Tips state
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null);
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [tipAmount, setTipAmount] = useState(5);
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [availableGifts, setAvailableGifts] = useState<VirtualGift[]>([]);
  const [recentGifts, setRecentGifts] = useState<GiftTransaction[]>([]);
  const [recentTips, setRecentTips] = useState<TipTransaction[]>([]);
  const [tipSettings, setTipSettings] = useState<CreatorTipSettings | null>(
    null,
  );

  // Mock recent recipients
  const recentRecipients = [
    {
      id: "1",
      name: "Alice Johnson",
      username: "alice_j",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b06c?w=100&h=100&fit=crop&crop=face",
      lastGift: "2 days ago",
      totalGifts: 5,
    },
    {
      id: "2",
      name: "Bob Smith",
      username: "bob_smith",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face",
      lastGift: "1 week ago",
      totalGifts: 3,
    },
    {
      id: "3",
      name: "Carol White",
      username: "carol_w",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      lastGift: "2 weeks ago",
      totalGifts: 8,
    },
  ];

  // Mock gift categories for quick actions
  const giftCategories = [
    {
      id: "hearts",
      name: "Hearts & Love",
      icon: Heart,
      color: "bg-red-500",
      count: 12,
      description: "Express your love and appreciation",
    },
    {
      id: "achievements",
      name: "Achievements",
      icon: Trophy,
      color: "bg-yellow-500",
      count: 8,
      description: "Celebrate their success",
    },
    {
      id: "premium",
      name: "Premium Gifts",
      icon: Crown,
      color: "bg-purple-500",
      count: 15,
      description: "Exclusive and special gifts",
    },
    {
      id: "coffee",
      name: "Buy a Coffee",
      icon: Coffee,
      color: "bg-orange-500",
      count: 3,
      description: "Support with a virtual coffee",
    },
    {
      id: "seasonal",
      name: "Seasonal",
      icon: Sparkles,
      color: "bg-green-500",
      count: 6,
      description: "Holiday and seasonal gifts",
    },
    {
      id: "energy",
      name: "Energy Boost",
      icon: Zap,
      color: "bg-blue-500",
      count: 4,
      description: "Give them an energy boost",
    },
  ];

  // Load virtual gifts data
  useEffect(() => {
    loadVirtualGiftsData();
  }, []);

  const loadVirtualGiftsData = async () => {
    try {
      // Use static gifts for immediate availability
      const gifts = virtualGiftsService.getAvailableGifts();
      setAvailableGifts(gifts);

      // Load history asynchronously
      try {
        const [giftHistory, tipHistory] = await Promise.all([
          virtualGiftsService.getGiftHistory(user?.id || ""),
          virtualGiftsService.getTipHistory(user?.id || ""),
        ]);

        // Add display properties to gift history
        const enhancedGiftHistory = giftHistory.map((gift) => ({
          ...gift,
          giftName:
            gifts.find((g) => g.id === gift.giftId)?.name || "Unknown Gift",
          giftEmoji: gifts.find((g) => g.id === gift.giftId)?.emoji || "🎁",
          recipientName: "Sample User", // Mock name for demo
        }));

        // Add display properties to tip history
        const enhancedTipHistory = tipHistory.map((tip) => ({
          ...tip,
          recipientName: "Sample User", // Mock name for demo
        }));

        setRecentGifts(enhancedGiftHistory);
        setRecentTips(enhancedTipHistory);
      } catch (error) {
        console.error("Error loading history:", error);
        setRecentGifts([]);
        setRecentTips([]);
      }
    } catch (error) {
      console.error("Error loading virtual gifts data:", error);
      // Load with mock data if everything fails
      setAvailableGifts(VIRTUAL_GIFTS || []);
      setRecentGifts([]);
      setRecentTips([]);
    }
  };

  const handleSendVirtualGift = async () => {
    if (!user?.id || !selectedGift || !selectedUser) return;

    setSending(true);
    try {
      const transaction = await virtualGiftsService.sendGift(
        user.id,
        selectedUser.id,
        selectedGift.id,
        giftQuantity,
        message || undefined,
        isAnonymous,
      );

      if (transaction) {
        toast({
          title: "Gift sent! 🎁",
          description: `You sent ${giftQuantity}x ${selectedGift.name} to ${selectedUser.name}`,
        });

        // Reset form
        setSelectedGift(null);
        setGiftQuantity(1);
        setMessage("");
        setShowGiftModal(false);
        setSelectedUser(null);

        // Reload data
        loadVirtualGiftsData();
      } else {
        throw new Error("Failed to send gift");
      }
    } catch (error) {
      console.error("Error sending gift:", error);
      toast({
        title: "Failed to send gift",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendTip = async () => {
    if (!user?.id || !selectedUser) return;

    setSending(true);
    try {
      const transaction = await virtualGiftsService.sendTip(
        user.id,
        selectedUser.id,
        tipAmount,
        message || undefined,
        undefined,
        isAnonymous,
      );

      if (transaction) {
        toast({
          title: "Tip sent! 💰",
          description: `You tipped $${tipAmount} to ${selectedUser.name}`,
        });

        // Reset form
        setTipAmount(5);
        setMessage("");
        setShowGiftModal(false);
        setSelectedUser(null);

        // Reload data
        loadVirtualGiftsData();
      } else {
        throw new Error("Failed to send tip");
      }
    } catch (error) {
      console.error("Error sending tip:", error);
      toast({
        title: "Failed to send tip",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendGift = (recipient: any) => {
    setSelectedUser(recipient);
    setShowGiftModal(true);
  };

  const getCategoryIcon = (category: VirtualGift["category"]) => {
    switch (category) {
      case "basic":
        return <Coffee className="h-4 w-4" />;
      case "premium":
        return <Star className="h-4 w-4" />;
      case "special":
        return <Crown className="h-4 w-4" />;
      case "seasonal":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getRarityColor = (rarity: VirtualGift["rarity"]) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500";
      case "rare":
        return "bg-blue-500";
      case "epic":
        return "bg-purple-500";
      case "legendary":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const groupedGifts = availableGifts.reduce(
    (acc, gift) => {
      if (!acc[gift.category]) {
        acc[gift.category] = [];
      }
      acc[gift.category].push(gift);
      return acc;
    },
    {} as Record<string, VirtualGift[]>,
  );

  return (
    <>
      <Helmet>
        <title>Send Gifts | Eloity</title>
        <meta
          name="description"
          content="Send virtual gifts and tips to show appreciation in the Eloity community"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Send Virtual Gifts
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Show appreciation, celebrate achievements, and spread joy with
                virtual gifts and tips
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <div className="text-sm text-muted-foreground">Gifts Sent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">$234</div>
                <div className="text-sm text-muted-foreground">Tips Given</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">89</div>
                <div className="text-sm text-muted-foreground">Recipients</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">4.9</div>
                <div className="text-sm text-muted-foreground">
                  Happiness Score
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Browse People
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex items-center gap-2"
              >
                <Gift className="h-4 w-4" />
                Gift Categories
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Gift History
              </TabsTrigger>
            </TabsList>

            {/* Browse People Tab */}
            <TabsContent value="browse" className="space-y-6 mt-6">
              {/* Search */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search people to send gifts to..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Recipients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Recipients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentRecipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={recipient.avatar}
                              alt={recipient.name}
                            />
                            <AvatarFallback>
                              {recipient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{recipient.name}</div>
                            <div className="text-sm text-muted-foreground">
                              @{recipient.username}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last gift: {recipient.lastGift} •{" "}
                              {recipient.totalGifts} total gifts
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleSendGift(recipient)}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Send Gift
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Users */}
              <SuggestedUsers
                title="Discover People to Gift"
                variant="grid"
                maxUsers={8}
                showGiftButton={true}
                onSendGift={handleSendGift}
              />
            </TabsContent>

            {/* Gift Categories Tab */}
            <TabsContent value="categories" className="space-y-6 mt-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Gift Categories</h2>
                <p className="text-muted-foreground">
                  Choose from our collection of virtual gifts
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {giftCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    onClick={() => {
                      // Would open category selection
                      toast({
                        title: `${category.name} Selected`,
                        description: category.description,
                      });
                    }}
                  >
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <category.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        {category.description}
                      </p>
                      <Badge variant="secondary">
                        {category.count} gifts available
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <Heart className="h-6 w-6 text-red-500" />
                      <span className="text-xs">Send Love</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <Coffee className="h-6 w-6 text-orange-500" />
                      <span className="text-xs">Buy Coffee</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <Star className="h-6 w-6 text-yellow-500" />
                      <span className="text-xs">Give Star</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2"
                    >
                      <DollarSign className="h-6 w-6 text-green-500" />
                      <span className="text-xs">Send Tip</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gift History Tab */}
            <TabsContent value="history" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Your Gift History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock history items */}
                    {[
                      {
                        id: 1,
                        recipient: "Alice Johnson",
                        gift: "❤️ Red Heart",
                        amount: "$5.00",
                        date: "2 hours ago",
                        status: "delivered",
                      },
                      {
                        id: 2,
                        recipient: "Bob Smith",
                        gift: "☕ Coffee",
                        amount: "$3.00",
                        date: "1 day ago",
                        status: "delivered",
                      },
                      {
                        id: 3,
                        recipient: "Carol White",
                        gift: "🏆 Trophy",
                        amount: "$10.00",
                        date: "3 days ago",
                        status: "delivered",
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Gift className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {item.gift} to {item.recipient}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.amount}</div>
                          <Badge
                            variant={
                              item.status === "delivered"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Gift Modal */}
      {selectedUser && showGiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto sm:w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold">
                    Send Gifts & Tips to {selectedUser.name}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGiftModal(false)}
                >
                  ×
                </Button>
              </div>

              <Tabs defaultValue="gifts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="gifts">Virtual Gifts</TabsTrigger>
                  <TabsTrigger value="tips">Send Tips</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Virtual Gifts Tab */}
                <TabsContent value="gifts" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gift Selection */}
                    <div className="lg:col-span-2 space-y-4">
                      {Object.entries(groupedGifts).map(([category, gifts]) => (
                        <Card key={category}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 capitalize">
                              {getCategoryIcon(
                                category as VirtualGift["category"],
                              )}
                              {category} Gifts
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {gifts.map((gift) => (
                                <Card
                                  key={gift.id}
                                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                    selectedGift?.id === gift.id
                                      ? "ring-2 ring-primary"
                                      : ""
                                  }`}
                                  onClick={() => setSelectedGift(gift)}
                                >
                                  <CardContent className="p-3 text-center">
                                    <div className="text-3xl mb-2">
                                      {gift.emoji}
                                    </div>
                                    <h3 className="font-medium text-sm">
                                      {gift.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      ${gift.price}
                                    </p>
                                    <Badge
                                      className={`text-xs ${getRarityColor(gift.rarity)} text-white`}
                                    >
                                      {gift.rarity}
                                    </Badge>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Gift Configuration */}
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Selected Gift</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedGift ? (
                            <>
                              <div className="text-center p-4 border rounded-lg">
                                <div className="text-4xl mb-2">
                                  {selectedGift.emoji}
                                </div>
                                <h3 className="font-medium">
                                  {selectedGift.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  ${selectedGift.price} each
                                </p>
                              </div>

                              <div>
                                <Label>Quantity</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setGiftQuantity(
                                        Math.max(1, giftQuantity - 1),
                                      )
                                    }
                                  >
                                    -
                                  </Button>
                                  <span className="w-12 text-center">
                                    {giftQuantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setGiftQuantity(giftQuantity + 1)
                                    }
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label>Personal Message (Optional)</Label>
                                <Textarea
                                  placeholder="Add a personal message..."
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <Label>Send Anonymously</Label>
                                <Switch
                                  checked={isAnonymous}
                                  onCheckedChange={setIsAnonymous}
                                />
                              </div>

                              <Alert>
                                <AlertDescription>
                                  Total: $
                                  {(selectedGift.price * giftQuantity).toFixed(
                                    2,
                                  )}
                                </AlertDescription>
                              </Alert>

                              <Button
                                onClick={handleSendVirtualGift}
                                disabled={sending}
                                className="w-full"
                              >
                                {sending ? (
                                  "Sending..."
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Gift
                                  </>
                                )}
                              </Button>
                            </>
                          ) : (
                            <p className="text-center text-muted-foreground py-8">
                              Select a gift to continue
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Tips Tab */}
                <TabsContent value="tips" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Send Tip
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Tip Amount ($)</Label>
                          <div className="flex gap-2 mt-2 mb-4">
                            {[1, 5, 10, 20, 50].map((amount) => (
                              <Button
                                key={amount}
                                variant={
                                  tipAmount === amount ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setTipAmount(amount)}
                              >
                                ${amount}
                              </Button>
                            ))}
                          </div>
                          <Input
                            type="number"
                            value={tipAmount}
                            onChange={(e) =>
                              setTipAmount(Number(e.target.value))
                            }
                            min="1"
                            max="1000"
                          />
                        </div>

                        <div>
                          <Label>Personal Message (Optional)</Label>
                          <Textarea
                            placeholder="Add a personal message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label>Send Anonymously</Label>
                          <Switch
                            checked={isAnonymous}
                            onCheckedChange={setIsAnonymous}
                          />
                        </div>

                        <Button
                          onClick={handleSendTip}
                          disabled={sending || tipAmount < 1}
                          className="w-full"
                        >
                          {sending ? (
                            "Sending..."
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send ${tipAmount} Tip
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Tip Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Recipient:
                            </span>
                            <span className="font-medium">
                              {selectedUser.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Amount:
                            </span>
                            <span className="font-medium">${tipAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Platform Fee:
                            </span>
                            <span className="font-medium">$0.00</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-medium">
                            <span>Total:</span>
                            <span>${tipAmount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gift className="h-5 w-5" />
                          Recent Gifts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {recentGifts.length > 0 ? (
                            recentGifts.slice(0, 5).map((gift, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg border"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">
                                    {gift.giftEmoji || "🎁"}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {gift.giftName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      To: {gift.recipientName}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-sm">
                                    ${gift.totalAmount}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(
                                      gift.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-muted-foreground py-8">
                              No gifts sent yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Recent Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {recentTips.length > 0 ? (
                            recentTips.slice(0, 5).map((tip, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg border"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">Tip</p>
                                    <p className="text-xs text-muted-foreground">
                                      To: {tip.recipientName}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-sm">
                                    ${tip.amount}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(
                                      tip.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-muted-foreground py-8">
                              No tips sent yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SendGifts;
