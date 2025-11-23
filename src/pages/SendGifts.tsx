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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import QuickSendTab from "@/components/gifts/QuickSendTab";
import BrowseGiftsTab from "@/components/gifts/BrowseGiftsTab";
import AnalyticsTab from "@/components/gifts/AnalyticsTab";
import SuggestedUsers from "@/components/profile/SuggestedUsers";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  virtualGiftsService,
  VirtualGift,
  GiftTransaction,
  TipTransaction,
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
  Calendar,
  Award,
  TrendingDown,
  Clock,
  BookOpen,
} from "lucide-react";

const SendGifts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("quick-send");
  const [isLoading, setIsLoading] = useState(false);

  // Selected user for modal (used in Browse Gifts)
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);

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

  // Load virtual gifts data
  useEffect(() => {
    loadVirtualGiftsData();
  }, []);

  const loadVirtualGiftsData = async () => {
    setIsLoading(true);
    try {
      const gifts = await virtualGiftsService.getVirtualGiftsFromDB();
      setAvailableGifts(gifts);

      try {
        const [giftHistory, tipHistory] = await Promise.all([
          virtualGiftsService.getGiftHistory(user?.id || ""),
          virtualGiftsService.getTipHistory(user?.id || ""),
        ]);

        const enhancedGiftHistory = giftHistory.map((gift) => ({
          ...gift,
          giftName: gifts.find((g) => g.id === gift.giftId)?.name || "Unknown Gift",
          giftEmoji: gifts.find((g) => g.id === gift.giftId)?.emoji || "🎁",
        }));

        const enhancedTipHistory = tipHistory.map((tip) => ({
          ...tip,
          recipientName: tip.recipientId,
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
      setAvailableGifts([]);
      setRecentGifts([]);
      setRecentTips([]);
    } finally {
      setIsLoading(false);
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

        setSelectedGift(null);
        setGiftQuantity(1);
        setMessage("");
        setShowGiftModal(false);
        setSelectedUser(null);

        loadVirtualGiftsData();
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

        setTipAmount(5);
        setMessage("");
        setShowGiftModal(false);
        setSelectedUser(null);

        loadVirtualGiftsData();
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

  const totalGiftsSent = recentGifts.reduce((sum, g) => sum + (g.quantity || 1), 0);
  const totalTipsGiven = recentTips.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalRecipients = new Set([
    ...recentGifts.map((g) => g.toUserId),
    ...recentTips.map((t) => t.toUserId),
  ]).size;

  return (
    <>
      <Helmet>
        <title>Send Gifts | Eloity</title>
        <meta name="description" content="Send virtual gifts and tips to show appreciation" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">
                Send Virtual Gifts
              </h1>
              <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
                Show appreciation, celebrate achievements, and spread joy with virtual gifts and tips
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {!isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {totalGiftsSent}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Gifts Sent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    ${totalTipsGiven.toFixed(0)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Tips Given</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {totalRecipients}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Recipients</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">
                    {availableGifts.length}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Available Gifts</div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3 sm:p-4">
                    <Skeleton className="h-6 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
              <TabsTrigger value="quick-send" className="text-xs sm:text-sm py-2">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Quick Send</span>
                <span className="sm:hidden">Quick</span>
              </TabsTrigger>
              <TabsTrigger value="browse" className="text-xs sm:text-sm py-2">
                <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Browse Gifts</span>
                <span className="sm:hidden">Gifts</span>
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-xs sm:text-sm py-2">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Send Tips</span>
                <span className="sm:hidden">Tips</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm py-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>

            {/* Quick Send Tab - New Enhanced Component */}
            <TabsContent value="quick-send" className="space-y-4 sm:space-y-6 mt-4">
              <QuickSendTab onGiftSent={loadVirtualGiftsData} />

              {/* Link to Recent Recipients Page */}
              <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200/50">
                <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1">
                      View All Recent Recipients
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      See a full list of everyone you've sent gifts to
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate("/app/recent-recipients")}
                    className="flex-shrink-0 text-xs sm:text-sm"
                  >
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    View All
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Browse Gifts Tab - New Enhanced Component */}
            <TabsContent value="browse" className="space-y-4 sm:space-y-6 mt-4">
              <BrowseGiftsTab onSelectGift={setSelectedGift} />
            </TabsContent>

            {/* Tips Tab */}
            <TabsContent value="tips" className="space-y-4 sm:space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                    Send Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Support creators directly with tips. Tips go directly to their wallet with no platform fees.
                  </p>

                  <div>
                    <Label className="text-sm mb-2 block">Search Creator</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search creators..."
                        className="pl-10 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm mb-2 block">Quick Tip Amounts</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 5, 10, 20, 50].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            setTipAmount(amount);
                          }}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Alert className="text-sm">
                    <Heart className="h-4 w-4" />
                    <AlertDescription>
                      Tips are instant and create meaningful connections with creators you support.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <SuggestedUsers
                maxUsers={8}
                showGiftButton={false}
                onSendGift={handleSendGift}
                variant="list"
              />
            </TabsContent>

            {/* Analytics Tab - New Enhanced Component */}
            <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4">
              <AnalyticsTab onRefresh={loadVirtualGiftsData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Gift Modal - For Browse Gifts Tab */}
      {selectedUser && showGiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-background rounded-t-lg sm:rounded-lg w-full sm:max-w-2xl sm:w-[95vw] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:fade-in">
            <div className="p-3 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                  <span className="truncate">Send to {selectedUser.name}</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => setShowGiftModal(false)}
                >
                  ×
                </Button>
              </div>

              <Tabs defaultValue="gifts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="gifts" className="text-xs sm:text-sm">
                    Gifts
                  </TabsTrigger>
                  <TabsTrigger value="tips" className="text-xs sm:text-sm">
                    Tips
                  </TabsTrigger>
                </TabsList>

                {/* Gifts Tab */}
                <TabsContent value="gifts" className="space-y-3 sm:space-y-4 mt-3">
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {availableGifts.slice(0, 10).map((gift) => (
                      <Card
                        key={gift.id}
                        className={`cursor-pointer transition-all p-2 text-center ${
                          selectedGift?.id === gift.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedGift(gift)}
                      >
                        <CardContent className="p-0">
                          <div className="text-2xl sm:text-3xl mb-1">{gift.emoji}</div>
                          <p className="text-xs font-medium truncate">${gift.price}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedGift && (
                    <Card className="border-2 border-primary/50">
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                          <span className="text-2xl">{selectedGift.emoji}</span>
                          {selectedGift.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {selectedGift.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base font-bold">
                            ${selectedGift.price}
                          </span>
                          <Badge
                            className={`${getRarityColor(selectedGift.rarity)} text-white text-xs`}
                          >
                            {selectedGift.rarity}
                          </Badge>
                        </div>

                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => setGiftQuantity(Math.max(1, giftQuantity - 1))}
                            >
                              -
                            </Button>
                            <span className="flex-1 text-center text-sm">{giftQuantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => setGiftQuantity(giftQuantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="modal-msg" className="text-xs">
                            Message (Optional)
                          </Label>
                          <Textarea
                            id="modal-msg"
                            placeholder="Add a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={2}
                            className="text-xs mt-1"
                          />
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <Label htmlFor="modal-anon" className="text-xs">
                            Anonymous
                          </Label>
                          <Switch
                            id="modal-anon"
                            checked={isAnonymous}
                            onCheckedChange={setIsAnonymous}
                          />
                        </div>

                        <div className="border-t pt-2">
                          <div className="flex justify-between font-bold text-sm mb-2">
                            <span>Total:</span>
                            <span>${(selectedGift.price * giftQuantity).toFixed(2)}</span>
                          </div>
                          <Button
                            className="w-full text-sm h-8"
                            onClick={handleSendVirtualGift}
                            disabled={sending}
                          >
                            {sending ? (
                              "Sending..."
                            ) : (
                              <>
                                <Send className="h-3 w-3 mr-1" />
                                Send Gift
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Tips Tab */}
                <TabsContent value="tips" className="space-y-3 sm:space-y-4 mt-3">
                  <Card>
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-sm sm:text-base">Tip Amount</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3">
                      <div className="grid grid-cols-5 gap-1 sm:gap-2">
                        {[1, 5, 10, 20, 50].map((amount) => (
                          <Button
                            key={amount}
                            variant={tipAmount === amount ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-7 p-1"
                            onClick={() => setTipAmount(amount)}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>

                      <div>
                        <Label htmlFor="custom-tip" className="text-xs">
                          Custom
                        </Label>
                        <Input
                          id="custom-tip"
                          type="number"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(Number(e.target.value))}
                          min="1"
                          className="text-xs h-7 mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tip-msg-modal" className="text-xs">
                          Message (Optional)
                        </Label>
                        <Textarea
                          id="tip-msg-modal"
                          placeholder="Say thanks..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={2}
                          className="text-xs mt-1"
                        />
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <Label htmlFor="tip-anon" className="text-xs">
                          Anonymous
                        </Label>
                        <Switch
                          id="tip-anon"
                          checked={isAnonymous}
                          onCheckedChange={setIsAnonymous}
                        />
                      </div>

                      <Button
                        className="w-full text-sm h-8"
                        onClick={handleSendTip}
                        disabled={sending}
                      >
                        {sending ? (
                          "Sending..."
                        ) : (
                          <>
                            <DollarSign className="h-3 w-3 mr-1" />
                            Send ${tipAmount}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
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
