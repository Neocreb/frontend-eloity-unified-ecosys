// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Eye,
  EyeOff,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
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
  const [tipSettings, setTipSettings] = useState<CreatorTipSettings | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, recipientId]);

  const loadData = async () => {
    try {
      const gifts = virtualGiftsService.getAvailableGifts();
      setAvailableGifts(gifts);

      try {
        const settings = await virtualGiftsService.getCreatorTipSettings(recipientId);
        setTipSettings(settings);
        if (settings?.suggestedAmounts && settings.suggestedAmounts.length > 0) {
          setTipAmount(settings.suggestedAmounts[0]);
        }
      } catch (error) {
        console.log("Using default tip settings");
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
      setAvailableGifts(VIRTUAL_GIFTS || []);
    }
  };

  const handleSendGift = async () => {
    if (!user?.id || !selectedGift) return;

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
          description: `You sent ${giftQuantity}x ${selectedGift.name}`,
        });

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
          description: `You tipped $${tipAmount}`,
        });

        setTipAmount(tipSettings?.suggestedAmounts?.[0] || 5);
        setMessage("");
        setIsOpen(false);
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

  const topGifts = availableGifts.slice(0, 8);
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
            setIsOpen(true);
          },
        })
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs text-gray-500 flex items-center gap-1"
          onClick={() => setIsOpen(true)}
        >
          <Gift className="w-3 h-3" />
          Gift
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto sm:w-full p-3 sm:p-6">
          <DialogHeader className="pb-2 sm:pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="truncate">Send to {recipientName}</span>
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => setIsOpen(false)}
              >
                ×
              </Button>
            </div>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              <TabsTrigger value="gifts" className="text-xs sm:text-sm py-1.5">
                <Gift className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Gifts</span>
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-xs sm:text-sm py-1.5">
                <DollarSign className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Tips</span>
              </TabsTrigger>
            </TabsList>

            {/* Gifts Tab - Optimized for Mobile */}
            <TabsContent value="gifts" className="space-y-3 mt-3 sm:space-y-4">
              {/* Battle Recipient Selection */}
              {recipientType === 'battle' && battleData && (
                <Card className="bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20 p-2 sm:p-4">
                  <CardHeader className="p-2 pb-2">
                    <CardTitle className="text-sm sm:text-base flex items-center justify-center gap-2">
                      Choose Recipient
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Card
                        className={`cursor-pointer transition-all p-2 ${
                          selectedRecipient?.id === battleData.creator1.id
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : ''
                        }`}
                        onClick={() => setSelectedRecipient({
                          id: battleData.creator1.id,
                          name: battleData.creator1.displayName,
                          username: battleData.creator1.username,
                          avatar: battleData.creator1.avatar,
                        })}
                      >
                        <CardContent className="p-2 text-center">
                          <Avatar className="w-10 h-10 mx-auto mb-1">
                            <AvatarImage src={battleData.creator1.avatar} />
                            <AvatarFallback className="text-xs">{battleData.creator1.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-xs">{battleData.creator1.displayName}</h3>
                          <Badge className="mt-1 bg-blue-500 text-white text-xs">Team Blue</Badge>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all p-2 ${
                          selectedRecipient?.id === battleData.creator2.id
                            ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20'
                            : ''
                        }`}
                        onClick={() => setSelectedRecipient({
                          id: battleData.creator2.id,
                          name: battleData.creator2.displayName,
                          username: battleData.creator2.username,
                          avatar: battleData.creator2.avatar,
                        })}
                      >
                        <CardContent className="p-2 text-center">
                          <Avatar className="w-10 h-10 mx-auto mb-1">
                            <AvatarImage src={battleData.creator2.avatar} />
                            <AvatarFallback className="text-xs">{battleData.creator2.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-xs">{battleData.creator2.displayName}</h3>
                          <Badge className="mt-1 bg-red-500 text-white text-xs">Team Red</Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Featured Gifts - Quick Selection */}
              <div>
                <h3 className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  Popular Gifts
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {topGifts.map((gift) => (
                    <Card
                      key={gift.id}
                      className={`cursor-pointer transition-all p-1.5 sm:p-2 text-center ${
                        selectedGift?.id === gift.id
                          ? "ring-2 ring-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedGift(gift)}
                    >
                      <CardContent className="p-0">
                        <div className="text-2xl sm:text-3xl mb-0.5">
                          {gift.emoji}
                        </div>
                        <p className="text-xs font-medium truncate">
                          ${gift.price.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Gift Details & Send */}
              {selectedGift && (
                <Card className="border-2 border-primary/50">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl">{selectedGift.emoji}</span>
                      {selectedGift.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {selectedGift.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">${selectedGift.price.toFixed(2)}</span>
                      <Badge className={`${getRarityColor(selectedGift.rarity)} text-white text-xs`}>
                        {selectedGift.rarity}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-xs">Qty: {giftQuantity}</Label>
                      <div className="flex items-center gap-1 mt-1">
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
                          onClick={() => setGiftQuantity(Math.min(99, giftQuantity + 1))}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="gift-msg" className="text-xs">Message (Optional)</Label>
                      <Textarea
                        id="gift-msg"
                        placeholder="Say something..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                        className="text-xs mt-1"
                      />
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="gift-anon" className="text-xs">Anonymous</Label>
                      <Switch
                        id="gift-anon"
                        checked={isAnonymous}
                        onCheckedChange={setIsAnonymous}
                      />
                    </div>

                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Total:</span>
                        <span>${(selectedGift.price * giftQuantity).toFixed(2)}</span>
                      </div>
                      <Button
                        className="w-full text-sm h-8"
                        onClick={handleSendGift}
                        disabled={sending}
                      >
                        {sending ? "Sending..." : <>
                          <Send className="h-3 w-3 mr-1" />
                          Send Gift
                        </>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!selectedGift && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <Gift className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Select a gift to send
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* More Options Button */}
              <Button
                variant="outline"
                className="w-full text-xs sm:text-sm"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/app/send-gifts");
                }}
              >
                <MoreHorizontal className="h-3 w-3 mr-1" />
                More Options
              </Button>
            </TabsContent>

            {/* Tips Tab - Optimized for Mobile */}
            <TabsContent value="tips" className="space-y-3 mt-3 sm:space-y-4">
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Send a Tip
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {tipSettings && !tipSettings.isEnabled ? (
                    <Alert className="text-xs sm:text-sm">
                      <AlertDescription>
                        {recipientName} is not currently accepting tips.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      {/* Quick Amount Buttons */}
                      {tipSettings?.suggestedAmounts && tipSettings.suggestedAmounts.length > 0 && (
                        <div>
                          <Label className="text-xs">Quick Amount</Label>
                          <div className="grid grid-cols-5 gap-1 mt-1">
                            {tipSettings.suggestedAmounts.map((amount) => (
                              <Button
                                key={amount}
                                variant={tipAmount === amount ? "default" : "outline"}
                                size="sm"
                                className="text-xs h-7 px-2"
                                onClick={() => setTipAmount(amount)}
                              >
                                ${amount}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Amount */}
                      <div>
                        <Label htmlFor="tip-amt" className="text-xs">Custom Amount</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
                          <Input
                            id="tip-amt"
                            type="number"
                            min={tipSettings?.minTipAmount || 1}
                            max={tipSettings?.maxTipAmount || 1000}
                            step="0.01"
                            value={tipAmount}
                            onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                            className="pl-7 text-xs h-7"
                          />
                        </div>
                        {tipSettings && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Range: ${tipSettings.minTipAmount} - ${tipSettings.maxTipAmount}
                          </p>
                        )}
                      </div>

                      {/* Tip Slider */}
                      <div>
                        <Label className="text-xs">Amount: ${tipAmount}</Label>
                        <Slider
                          value={[tipAmount]}
                          onValueChange={(value) => setTipAmount(value[0])}
                          min={tipSettings?.minTipAmount || 1}
                          max={Math.min(tipSettings?.maxTipAmount || 100, 100)}
                          step={0.5}
                          className="mt-2"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <Label htmlFor="tip-msg" className="text-xs">Message (Optional)</Label>
                        <Textarea
                          id="tip-msg"
                          placeholder="Say thanks..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={2}
                          className="text-xs mt-1"
                        />
                      </div>

                      {/* Anonymous Option */}
                      <div className="flex items-center justify-between py-1">
                        <Label htmlFor="tip-anon" className="text-xs flex items-center gap-1">
                          {isAnonymous ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                          Anonymous
                        </Label>
                        <Switch
                          id="tip-anon"
                          checked={isAnonymous}
                          onCheckedChange={setIsAnonymous}
                        />
                      </div>

                      {/* Send Button */}
                      <Button
                        className="w-full text-sm h-8"
                        onClick={handleSendTip}
                        disabled={sending || tipAmount <= 0 || (tipSettings && !tipSettings.isEnabled)}
                      >
                        {sending ? "Sending..." : <>
                          <DollarSign className="h-3 w-3 mr-1" />
                          Send ${tipAmount} Tip
                        </>}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
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
