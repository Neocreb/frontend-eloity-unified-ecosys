// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Gift,
  Heart,
  DollarSign,
  Star,
  Sparkles,
  Crown,
  Coffee,
  Send,
  UserCheck,
  TrendingUp,
  Calendar,
  Award,
  Eye,
  EyeOff,
  ShoppingBag,
  Image,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  virtualGiftsService,
  VIRTUAL_GIFTS,
  VirtualGift,
  GiftTransaction,
  TipTransaction,
  CreatorTipSettings,
} from "@/services/virtualGiftsService";

interface VirtualGiftsAndTipsProps {
  recipientId: string;
  recipientName: string;
  contentId?: string;
  trigger?: React.ReactNode;
  recipientType?: 'video' | 'livestream' | 'battle';
  battleData?: {
    creator1: {
      id: string;
      username: string;
      displayName: string;
      avatar: string;
    };
    creator2: {
      id: string;
      username: string;
      displayName: string;
      avatar: string;
    };
  };
}

const VirtualGiftsAndTips: React.FC<VirtualGiftsAndTipsProps> = ({
  recipientId,
  recipientName,
  contentId,
  trigger,
  recipientType = 'video',
  battleData,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Debug log
  console.log("VirtualGiftsAndTips rendered for:", recipientName);
  const [activeTab, setActiveTab] = useState("gifts");
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string;
    name: string;
    username: string;
    avatar: string;
  } | null>(null);
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

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, recipientId]);

  const loadData = async () => {
    try {
      // Load static gifts immediately
      const gifts = virtualGiftsService.getAvailableGifts();
      setAvailableGifts(gifts);

      // Try to load settings asynchronously
      try {
        const settings =
          await virtualGiftsService.getCreatorTipSettings(recipientId);
        setTipSettings(settings);

        if (
          settings?.suggestedAmounts &&
          settings.suggestedAmounts.length > 0
        ) {
          setTipAmount(settings.suggestedAmounts[0]);
        }
      } catch (error) {
        console.log("Using default tip settings");
        // Use default settings if service fails
        setTipSettings({
          id: "default",
          userId: recipientId,
          isEnabled: true,
          minTipAmount: 1,
          maxTipAmount: 1000,
          suggestedAmounts: [1, 5, 10, 20, 50],
          allowAnonymous: true,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Use fallback data
      setAvailableGifts([
        {
          id: "heart",
          name: "Heart",
          emoji: "❤️",
          description: "Show some love",
          price: 0.99,
          currency: "USD",
          category: "basic",
          rarity: "common",
          available: true,
        },
        {
          id: "coffee",
          name: "Coffee",
          emoji: "☕",
          description: "Buy them a coffee!",
          price: 1.99,
          currency: "USD",
          category: "basic",
          rarity: "common",
          available: true,
        },
      ]);
    }
  };

  const handleSendGift = async () => {
    if (!user?.id || !selectedGift) return;

    // For battles, ensure a recipient is selected
    if (recipientType === 'battle' && !selectedRecipient) {
      toast({
        title: "Select Recipient",
        description: "Please choose who to send the gift to",
        variant: "destructive",
      });
      return;
    }

    const targetRecipientId = selectedRecipient?.id || recipientId;
    const targetRecipientName = selectedRecipient?.name || recipientName;

    setSending(true);
    try {
      const transaction = await virtualGiftsService.sendGift(
        user.id,
        targetRecipientId,
        selectedGift.id,
        giftQuantity,
        message || undefined,
        isAnonymous,
      );

      if (transaction) {
        toast({
          title: "Gift sent! 🎁",
          description: `You sent ${giftQuantity}x ${selectedGift.name} to ${targetRecipientName}`,
        });

        // Reset form
        setSelectedGift(null);
        setGiftQuantity(1);
        setMessage("");
        setSelectedRecipient(null);
        setIsOpen(false);
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
    if (!user?.id) return;

    // Validate tip amount
    if (tipSettings?.minTipAmount && tipAmount < tipSettings.minTipAmount) {
      toast({
        title: "Tip amount too low",
        description: `Minimum tip amount is $${tipSettings.minTipAmount}`,
        variant: "destructive",
      });
      return;
    }

    if (tipSettings?.maxTipAmount && tipAmount > tipSettings.maxTipAmount) {
      toast({
        title: "Tip amount too high",
        description: `Maximum tip amount is $${tipSettings.maxTipAmount}`,
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const transaction = await virtualGiftsService.sendTip(
        user.id,
        recipientId,
        tipAmount,
        message || undefined,
        contentId,
        isAnonymous,
      );

      if (transaction) {
        toast({
          title: "Tip sent! 💰",
          description: `You tipped $${tipAmount} to ${recipientName}`,
        });

        // Reset form
        setTipAmount(tipSettings?.suggestedAmounts?.[0] || 5);
        setMessage("");
        setIsOpen(false);
      } else {
        throw new Error("Failed to send tip");
      }
    } catch (error) {
      console.error(
        "Error sending tip:",
        error instanceof Error ? error.message : error,
      );
      toast({
        title: "Failed to send tip",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
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
      {trigger ? (
        React.cloneElement(trigger as React.ReactElement, {
          onClick: (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Gift trigger clicked, opening dialog");
            setIsOpen(true);
          },
        })
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs text-gray-500 flex items-center gap-1"
          onClick={() => {
            console.log("Default gift button clicked");
            setIsOpen(true);
          }}
        >
          <Gift className="w-3 h-3" />
          Gift
        </Button>
      )}

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          console.log("Dialog state changing to:", open);
          setIsOpen(open);
        }}
      >
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Send Gifts & Tips to {recipientName}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="gifts">Gifts</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
              <TabsTrigger value="merchandise">Merch</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="gifts" className="space-y-6">
              {/* Recipient Selection for Battles */}
              {recipientType === 'battle' && battleData && (
                <Card className="bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20">
                  <CardHeader>
                    <CardTitle className="text-center flex items-center justify-center gap-2">
                      <Gift className="w-5 h-5 text-purple-500" />
                      Choose Recipient
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative grid grid-cols-2 gap-4">
                      {/* VS Badge */}
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="bg-gradient-to-r from-red-500 to-blue-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                          VS
                        </div>
                      </div>
                      {/* Creator 1 */}
                      <Card
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                          selectedRecipient?.id === battleData.creator1.id
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105 shadow-lg'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedRecipient({
                          id: battleData.creator1.id,
                          name: battleData.creator1.displayName,
                          username: battleData.creator1.username,
                          avatar: battleData.creator1.avatar,
                        })}
                      >
                        <CardContent className="p-4 text-center">
                          <Avatar className="w-16 h-16 mx-auto mb-3">
                            <AvatarImage src={battleData.creator1.avatar} />
                            <AvatarFallback>{battleData.creator1.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold">{battleData.creator1.displayName}</h3>
                          <p className="text-sm text-muted-foreground">@{battleData.creator1.username}</p>
                          <Badge className="mt-2 bg-blue-500 text-white">Team Blue</Badge>
                        </CardContent>
                      </Card>

                      {/* Creator 2 */}
                      <Card
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                          selectedRecipient?.id === battleData.creator2.id
                            ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20 scale-105 shadow-lg'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedRecipient({
                          id: battleData.creator2.id,
                          name: battleData.creator2.displayName,
                          username: battleData.creator2.username,
                          avatar: battleData.creator2.avatar,
                        })}
                      >
                        <CardContent className="p-4 text-center">
                          <Avatar className="w-16 h-16 mx-auto mb-3">
                            <AvatarImage src={battleData.creator2.avatar} />
                            <AvatarFallback>{battleData.creator2.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold">{battleData.creator2.displayName}</h3>
                          <p className="text-sm text-muted-foreground">@{battleData.creator2.username}</p>
                          <Badge className="mt-2 bg-red-500 text-white">Team Red</Badge>
                        </CardContent>
                      </Card>
                    </div>

                    {selectedRecipient && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          ✅ Sending gift to <strong>{selectedRecipient.name}</strong>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gift Selection */}
                <div className="lg:col-span-2 space-y-4">
                  {Object.entries(groupedGifts).map(([category, gifts]) => (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 capitalize">
                          {getCategoryIcon(category as VirtualGift["category"])}
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
                                  variant="secondary"
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

                {/* Gift Customization */}
                <div className="space-y-4">
                  {selectedGift && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{selectedGift.emoji}</span>
                          {selectedGift.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {selectedGift.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">
                            ${selectedGift.price}
                          </span>
                          <Badge
                            className={`${getRarityColor(selectedGift.rarity)} text-white`}
                          >
                            {selectedGift.rarity}
                          </Badge>
                        </div>

                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setGiftQuantity(Math.max(1, giftQuantity - 1))
                              }
                            >
                              -
                            </Button>
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              max="99"
                              value={giftQuantity}
                              onChange={(e) =>
                                setGiftQuantity(
                                  Math.max(1, parseInt(e.target.value) || 1),
                                )
                              }
                              className="w-20 text-center"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setGiftQuantity(Math.min(99, giftQuantity + 1))
                              }
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="gift-message">
                            Personal Message (Optional)
                          </Label>
                          <Textarea
                            id="gift-message"
                            placeholder="Add a personal message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="anonymous-gift">
                            Send Anonymously
                          </Label>
                          <Switch
                            id="anonymous-gift"
                            checked={isAnonymous}
                            onCheckedChange={setIsAnonymous}
                          />
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span>Total:</span>
                            <span className="text-xl font-bold">
                              ${(selectedGift.price * giftQuantity).toFixed(2)}
                            </span>
                          </div>

                          <Button
                            className="w-full"
                            onClick={handleSendGift}
                            disabled={sending}
                          >
                            {sending ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                                Sending...
                              </div>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Gift
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!selectedGift && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Select a gift to customize and send
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-6">
              <div className="max-w-md mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Send a Tip
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tipSettings && !tipSettings.isEnabled ? (
                      <Alert>
                        <AlertDescription>
                          {recipientName} is not currently accepting tips.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        {/* Suggested amounts */}
                        {tipSettings?.suggestedAmounts &&
                          tipSettings.suggestedAmounts.length > 0 && (
                            <div>
                              <Label>Quick Amounts</Label>
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                {tipSettings.suggestedAmounts.map((amount) => (
                                  <Button
                                    key={amount}
                                    variant={
                                      tipAmount === amount
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setTipAmount(amount)}
                                  >
                                    ${amount}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Custom amount */}
                        <div>
                          <Label htmlFor="tip-amount">Custom Amount</Label>
                          <div className="relative mt-1">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="tip-amount"
                              type="number"
                              min={tipSettings?.minTipAmount || 1}
                              max={tipSettings?.maxTipAmount || 1000}
                              step="0.01"
                              value={tipAmount}
                              onChange={(e) =>
                                setTipAmount(parseFloat(e.target.value) || 0)
                              }
                              className="pl-10"
                            />
                          </div>
                          {tipSettings && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Min: ${tipSettings.minTipAmount} • Max: $
                              {tipSettings.maxTipAmount}
                            </p>
                          )}
                        </div>

                        {/* Tip slider */}
                        <div>
                          <Label>Amount: ${tipAmount}</Label>
                          <Slider
                            value={[tipAmount]}
                            onValueChange={(value) => setTipAmount(value[0])}
                            min={tipSettings?.minTipAmount || 1}
                            max={tipSettings?.maxTipAmount || 100}
                            step={0.5}
                            className="mt-2"
                          />
                        </div>

                        {/* Message */}
                        <div>
                          <Label htmlFor="tip-message">
                            Message (Optional)
                          </Label>
                          <Textarea
                            id="tip-message"
                            placeholder="Add a personal message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                          />
                        </div>

                        {/* Anonymous option */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="anonymous-tip">
                              Send Anonymously
                            </Label>
                            {isAnonymous ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </div>
                          <Switch
                            id="anonymous-tip"
                            checked={isAnonymous}
                            onCheckedChange={setIsAnonymous}
                          />
                        </div>

                        {/* Thank you message preview */}
                        {tipSettings?.thankYouMessage && (
                          <Alert>
                            <Heart className="h-4 w-4" />
                            <AlertDescription>
                              <strong>{recipientName}:</strong> "
                              {tipSettings.thankYouMessage}"
                            </AlertDescription>
                          </Alert>
                        )}

                        <Button
                          className="w-full"
                          onClick={handleSendTip}
                          disabled={
                            sending ||
                            tipAmount <= 0 ||
                            (tipSettings && !tipSettings.isEnabled)
                          }
                        >
                          {sending ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                              Sending...
                            </div>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Send ${tipAmount} Tip
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="merchandise" className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <ShoppingBag className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Creator Merchandise</h3>
                </div>

                <p className="text-muted-foreground mb-6">
                  Support {recipientName} by purchasing their official merchandise
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto flex items-center justify-center">
                        <Image className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-medium">T-Shirts</h4>
                      <p className="text-sm text-muted-foreground">Starting at $25</p>
                    </div>
                  </Card>

                  <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg mx-auto flex items-center justify-center">
                        <Coffee className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-medium">Mugs</h4>
                      <p className="text-sm text-muted-foreground">Starting at $15</p>
                    </div>
                  </Card>

                  <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg mx-auto flex items-center justify-center">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-medium">Accessories</h4>
                      <p className="text-sm text-muted-foreground">Starting at $10</p>
                    </div>
                  </Card>

                  <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-lg mx-auto flex items-center justify-center">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-medium">Limited</h4>
                      <p className="text-sm text-muted-foreground">Exclusive items</p>
                    </div>
                  </Card>
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={() => {
                    // Navigate to marketplace with creator filter
                    window.open('/app/marketplace?creator=' + recipientId, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All in Marketplace
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Gift & Tip History
                </h3>
                <p className="text-muted-foreground">
                  Your transaction history with {recipientName} will appear here
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VirtualGiftsAndTips;

// Quick tip button component for easy integration
export const QuickTipButton: React.FC<{
  recipientId: string;
  recipientName: string;
  amount?: number;
  contentId?: string;
}> = ({ recipientId, recipientName, amount = 5, contentId }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleQuickTip = async () => {
    if (!user?.id) return;

    try {
      const transaction = await virtualGiftsService.sendTip(
        user.id,
        recipientId,
        amount,
        undefined,
        contentId,
        false,
      );

      if (transaction) {
        toast({
          title: "Tip sent! 💰",
          description: `You tipped $${amount} to ${recipientName}`,
        });
      }
    } catch (error) {
      console.error(
        "Error sending quick tip:",
        error instanceof Error ? error.message : error,
      );
      toast({
        title: "Failed to send tip",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleQuickTip}>
      <DollarSign className="h-3 w-3 mr-1" />${amount}
    </Button>
  );
};
