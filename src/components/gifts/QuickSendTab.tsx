// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  virtualGiftsService,
  VirtualGift,
} from "@/services/virtualGiftsService";
import SuggestedUsers from "@/components/profile/SuggestedUsers";
import {
  Zap,
  Search,
  Sparkles,
  Send,
  Clock,
  Users,
  AlertCircle,
} from "lucide-react";

interface QuickSendTabProps {
  onGiftSent?: () => void;
}

interface SearchResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

const QuickSendTab: React.FC<QuickSendTabProps> = ({ onGiftSent }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Search and recipient selection state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<SearchResult | null>(null);

  // Gift selection state
  const [availableGifts, setAvailableGifts] = useState<VirtualGift[]>([]);
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null);
  const [giftQuantity, setGiftQuantity] = useState(1);

  // Send state
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Recent recipients state
  const [recentRecipients, setRecentRecipients] = useState<any[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // Tab for choosing how to select recipient
  const [recipientTab, setRecipientTab] = useState<"search" | "recent" | "suggested">("search");

  useEffect(() => {
    loadGiftsAndRecipients();
  }, [user?.id]);

  const loadGiftsAndRecipients = async () => {
    try {
      // Load available gifts
      const gifts = await virtualGiftsService.getVirtualGiftsFromDB();
      setAvailableGifts(gifts);

      // Load recent recipients
      if (user?.id) {
        setIsLoadingRecent(true);
        const recipients = await virtualGiftsService.getRecentRecipients(user.id, 8);
        setRecentRecipients(recipients);
        setIsLoadingRecent(false);
      }
    } catch (error) {
      console.error("Error loading gifts and recipients:", error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search for users by username or display_name
      const { data, error } = await (window as any).supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq("id", user?.id || "")
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Search failed",
        description: "Could not search for users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecipient = (recipient: SearchResult) => {
    setSelectedRecipient(recipient);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSendGift = async () => {
    if (!user?.id || !selectedRecipient || !selectedGift) {
      toast({
        title: "Missing information",
        description: "Please select a recipient and a gift.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const transaction = await virtualGiftsService.sendGift(
        user.id,
        selectedRecipient.id,
        selectedGift.id,
        giftQuantity,
        message || undefined,
        isAnonymous,
      );

      if (transaction) {
        toast({
          title: "Gift sent! 🎁",
          description: `You sent ${giftQuantity}x ${selectedGift.name} to ${selectedRecipient.display_name}`,
        });

        // Reset form
        setSelectedRecipient(null);
        setSelectedGift(null);
        setGiftQuantity(1);
        setMessage("");
        setIsAnonymous(false);
        setRecipientTab("search");

        // Reload recent recipients
        loadGiftsAndRecipients();

        // Trigger callback
        onGiftSent?.();
      }
    } catch (error) {
      console.error("Error sending gift:", error);
      toast({
        title: "Failed to send gift",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
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

  // Group gifts by category
  const giftsByCategory = availableGifts.reduce(
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
    <div className="space-y-4 sm:space-y-6 mt-4">
      {/* Step 1: Select Recipient */}
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full text-xs sm:text-sm font-bold">
              1
            </span>
            Choose Recipient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={recipientTab} onValueChange={(tab: any) => setRecipientTab(tab)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search" className="text-xs sm:text-sm">
                <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Search</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Recent</span>
                <span className="sm:hidden">Recent</span>
              </TabsTrigger>
              <TabsTrigger value="suggested" className="text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Suggested</span>
                <span className="sm:hidden">Suggested</span>
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-3 mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username or name..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 text-sm"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {isSearching ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleSelectRecipient(result)}
                      className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={result.avatar_url} alt={result.display_name} />
                        <AvatarFallback>{result.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">
                          {result.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">@{result.username}</p>
                      </div>
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="text-center py-4 text-xs sm:text-sm text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs sm:text-sm text-muted-foreground">
                    Start typing to search
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Recent Tab */}
            <TabsContent value="recent" className="space-y-2 mt-3">
              {isLoadingRecent ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Loading recent recipients...
                </div>
              ) : recentRecipients.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recentRecipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      onClick={() =>
                        handleSelectRecipient({
                          id: recipient.id,
                          username: recipient.username,
                          display_name: recipient.display_name,
                          avatar_url: recipient.avatar_url,
                        })
                      }
                      className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={recipient.avatar_url} alt={recipient.display_name} />
                        <AvatarFallback>{recipient.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">
                          {recipient.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {recipient.totalGiftsReceived} gifts sent
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs sm:text-sm text-muted-foreground">
                  No recent recipients yet
                </div>
              )}
            </TabsContent>

            {/* Suggested Tab */}
            <TabsContent value="suggested" className="mt-3">
              <SuggestedUsers
                maxUsers={6}
                showGiftButton={false}
                onSendGift={(user) =>
                  handleSelectRecipient({
                    id: user.id,
                    username: user.username,
                    display_name: user.display_name || user.username,
                    avatar_url: user.avatar_url,
                  })
                }
                variant="grid"
              />
            </TabsContent>
          </Tabs>

          {selectedRecipient && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={selectedRecipient.avatar_url} alt={selectedRecipient.display_name} />
                <AvatarFallback>{selectedRecipient.display_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedRecipient.display_name}</p>
                <p className="text-xs text-muted-foreground">@{selectedRecipient.username}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRecipient(null)}
                className="text-xs h-7"
              >
                Change
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Choose Gift */}
      {selectedRecipient && (
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full text-xs sm:text-sm font-bold">
                2
              </span>
              Choose Gift
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(giftsByCategory).map(([category, gifts]) => (
              <div key={category}>
                <Label className="text-xs sm:text-sm font-semibold capitalize mb-2 block">
                  {category} Gifts
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {gifts.map((gift) => (
                    <div
                      key={gift.id}
                      onClick={() => setSelectedGift(gift)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all text-center ${
                        selectedGift?.id === gift.id
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-1">{gift.emoji}</div>
                      <p className="text-xs font-medium truncate">{gift.name}</p>
                      <p className="text-xs text-muted-foreground">${gift.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {selectedGift && (
              <Card className="bg-muted/50 border-primary/50">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <span className="text-2xl">{selectedGift.emoji}</span>
                    {selectedGift.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {selectedGift.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-bold">
                      ${(selectedGift.price * giftQuantity).toFixed(2)}
                    </span>
                    <Badge className={`${getRarityColor(selectedGift.rarity)} text-white text-xs`}>
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
                      <span className="flex-1 text-center text-xs">{giftQuantity}</span>
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
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Message and Send */}
      {selectedRecipient && selectedGift && (
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full text-xs sm:text-sm font-bold">
                3
              </span>
              Confirm & Send
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="quick-message" className="text-xs sm:text-sm">
                Message (Optional)
              </Label>
              <Textarea
                id="quick-message"
                placeholder="Add a personal message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="text-xs mt-2"
              />
            </div>

            <div className="flex items-center justify-between py-2 border rounded-lg px-3">
              <Label htmlFor="quick-anon" className="text-xs sm:text-sm cursor-pointer">
                Send Anonymously
              </Label>
              <Switch
                id="quick-anon"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>

            <Alert className="text-xs sm:text-sm">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                You're about to send {giftQuantity}x {selectedGift.name} to{" "}
                {selectedRecipient.display_name} for $
                {(selectedGift.price * giftQuantity).toFixed(2)}
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSendGift}
              disabled={isSending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              size="lg"
            >
              {isSending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Gift Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Recipients Quick Access */}
      {recentRecipients.length > 0 && !selectedRecipient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Frequently Gifted To
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {recentRecipients.slice(0, 8).map((recipient) => (
                <div
                  key={recipient.id}
                  onClick={() =>
                    handleSelectRecipient({
                      id: recipient.id,
                      username: recipient.username,
                      display_name: recipient.display_name,
                      avatar_url: recipient.avatar_url,
                    })
                  }
                  className="p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors text-center"
                >
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2">
                    <AvatarImage src={recipient.avatar_url} alt={recipient.display_name} />
                    <AvatarFallback>{recipient.display_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-medium truncate">{recipient.display_name}</p>
                  <p className="text-xs text-muted-foreground">{recipient.totalGiftsReceived} gifts</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickSendTab;
