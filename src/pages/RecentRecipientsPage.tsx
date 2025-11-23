// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { virtualGiftsService } from "@/services/virtualGiftsService";
import {
  ArrowLeft,
  Gift,
  Search,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

interface RecentRecipient {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  lastGiftDate: string;
  totalGiftsReceived: number;
}

const RecentRecipientsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipients, setRecipients] = useState<RecentRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadRecipients();
    }
  }, [user?.id]);

  const loadRecipients = async () => {
    setIsLoading(true);
    try {
      const data = await virtualGiftsService.getRecentRecipients(user?.id || "", 50);
      setRecipients(data);
    } catch (error) {
      console.error("Error loading recipients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecipients = recipients.filter(
    (recipient) =>
      recipient.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendGift = (recipient: RecentRecipient) => {
    navigate("/app/send-gifts", {
      state: { selectedRecipient: recipient },
    });
  };

  const totalGiftsValue = recipients.reduce(
    (sum, r) => sum + r.totalGiftsReceived,
    0
  );

  return (
    <>
      <Helmet>
        <title>Recent Recipients | Eloity</title>
        <meta name="description" content="View and send gifts to your recent gift recipients" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/send-gifts")}
              className="flex items-center gap-2 text-xs sm:text-sm mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Send Gifts
            </Button>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">
                Recent Recipients
              </h1>
              <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
                People you've sent gifts to recently. Send them more gifts to show your appreciation.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {!isLoading && (
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {recipients.length}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Recipients</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-pink-600">
                    {totalGiftsValue}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Gifts Sent</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {recipients.length > 0
                      ? (totalGiftsValue / recipients.length).toFixed(1)
                      : 0}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Avg Gifts</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-3 sm:p-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recipients List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRecipients.length > 0 ? (
            <div className="space-y-3">
              {filteredRecipients.map((recipient) => (
                <Card key={recipient.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                          <AvatarImage
                            src={recipient.avatar_url}
                            alt={recipient.display_name}
                          />
                          <AvatarFallback>{recipient.display_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate">
                            {recipient.display_name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1">
                            @{recipient.username}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <Gift className="h-3 w-3 mr-1" />
                              {recipient.totalGiftsReceived} gifts
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {recipient.lastGiftDate &&
                                new Date(recipient.lastGiftDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSendGift(recipient)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-xs sm:text-sm h-8 sm:h-auto py-1 sm:py-2 flex-shrink-0 whitespace-nowrap"
                        size="sm"
                      >
                        <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Send Gift</span>
                        <span className="sm:hidden">Send</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8 sm:py-12">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-3" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">No recipients yet</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? "No recipients match your search."
                  : "You haven't sent any gifts yet. Start by sending a gift to someone!"}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate("/app/send-gifts")} className="mt-4">
                  Send Your First Gift
                </Button>
              )}
            </Card>
          )}

          {/* Tips Section */}
          {filteredRecipients.length > 0 && (
            <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                  Gifting Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p>✨ Gifts help you build stronger relationships with your audience</p>
                <p>💝 Send gifts regularly to your most engaged followers</p>
                <p>🎯 Different gift types suit different occasions</p>
                <p>📊 Check your analytics to see which gifts are most popular</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default RecentRecipientsPage;
