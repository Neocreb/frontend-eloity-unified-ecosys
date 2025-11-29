import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  Search,
  Sparkles,
  Gift,
  DollarSign,
  Heart,
  TrendingUp,
  Clock,
  User,
  Users,
  Filter,
  Send,
  Plus,
  Star,
} from 'lucide-react';
import { SuggestedUsers } from '@/components/gifts/SuggestedUsers';
import { VirtualGift, GiftTransaction, TipTransaction } from '@/types/gifts';
import { supabase } from '@/lib/supabase';
import QuickSendTab from '@/components/gifts/QuickSendTab';
import BrowseGiftsTab from '@/components/gifts/BrowseGiftsTab';
import AnalyticsTab from '@/components/gifts/AnalyticsTab';

const SendGifts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('quick-send');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null);
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [tipAmount, setTipAmount] = useState(5);
  const [virtualGifts, setVirtualGifts] = useState<VirtualGift[]>([]);
  const [recentGifts, setRecentGifts] = useState<GiftTransaction[]>([]);
  const [recentTips, setRecentTips] = useState<TipTransaction[]>([]);
  const [stats, setStats] = useState({
    totalGiftsSent: 0,
    totalTipsSent: 0,
    totalSpent: 0,
  });

  // Load virtual gifts data
  const loadVirtualGiftsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch virtual gifts
      const { data: giftsData, error: giftsError } = await supabase
        .from('virtual_gifts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (giftsError) throw giftsError;
      setVirtualGifts(giftsData || []);
      
      // Fetch recent gift transactions
      const { data: giftsTxData, error: giftsTxError } = await supabase
        .from('gift_transactions')
        .select(`
          *,
          sender:profiles!gift_transactions_sender_id_fkey(username, avatar_url),
          receiver:profiles!gift_transactions_receiver_id_fkey(username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (giftsTxError) throw giftsTxError;
      setRecentGifts(giftsTxData || []);
      
      // Fetch recent tip transactions
      const { data: tipsTxData, error: tipsTxError } = await supabase
        .from('tip_transactions')
        .select(`
          *,
          sender:profiles!tip_transactions_sender_id_fkey(username, avatar_url),
          receiver:profiles!tip_transactions_receiver_id_fkey(username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (tipsTxError) throw tipsTxError;
      setRecentTips(tipsTxData || []);
      
      // Calculate stats
      const totalGiftsSent = giftsTxData?.length || 0;
      const totalTipsSent = tipsTxData?.length || 0;
      const totalGiftsSpent = giftsTxData?.reduce((sum: number, tx: GiftTransaction) => sum + tx.total_amount, 0) || 0;
      const totalTipsSpent = tipsTxData?.reduce((sum: number, tx: TipTransaction) => sum + tx.amount, 0) || 0;
      
      setStats({
        totalGiftsSent,
        totalTipsSent,
        totalSpent: totalGiftsSpent + totalTipsSpent,
      });
    } catch (error) {
      console.error('Error loading virtual gifts data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load gift data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVirtualGiftsData();
  }, []);

  const handleSendGift = async (gift: VirtualGift, quantity: number, userId: string) => {
    try {
      setIsLoading(true);
      
      // Create gift transaction
      const { data, error } = await supabase
        .from('gift_transactions')
        .insert({
          from_user_id: 'current-user-id', // Replace with actual user ID
          to_user_id: userId,
          gift_id: gift.id,
          quantity: quantity,
          total_amount: gift.price * quantity,
          message: '',
          status: 'completed',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Gift Sent!',
        description: `Successfully sent ${quantity}x ${gift.name} to the creator.`,
      });
      
      // Reload data
      loadVirtualGiftsData();
    } catch (error) {
      console.error('Error sending gift:', error);
      toast({
        title: 'Error',
        description: 'Failed to send gift. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Send Virtual Gifts & Tips - Eloity</title>
        <meta name="description" content="Send virtual gifts and tips to show appreciation" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                  Send Gifts & Tips
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Show appreciation to creators with virtual gifts and tips
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/30">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-purple-300">Gifts Sent</p>
                      <p className="text-lg sm:text-xl font-bold text-purple-50">{stats.totalGiftsSent}</p>
                    </div>
                    <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/30">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-blue-300">Tips Sent</p>
                      <p className="text-lg sm:text-xl font-bold text-blue-50">{stats.totalTipsSent}</p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/30">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-green-300">Total Spent</p>
                      <p className="text-lg sm:text-xl font-bold text-green-50">${stats.totalSpent.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/20 border-amber-500/30">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-amber-300">Top Gift</p>
                      <p className="text-lg sm:text-xl font-bold text-amber-50">
                        {virtualGifts.length > 0 ? virtualGifts[0].name : 'None'}
                      </p>
                    </div>
                    <Star className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 scrollbar-hide">
              <TabsList className="inline-flex h-auto p-0 bg-transparent gap-0 border-none w-min rounded-none">
                <TabsTrigger value="quick-send" className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                  Quick Send
                </TabsTrigger>
                <TabsTrigger value="browse" className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                  Browse Gifts
                </TabsTrigger>
                <TabsTrigger value="tips" className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                  Send Tips
                </TabsTrigger>
                <TabsTrigger value="analytics" className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base">
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Quick Send Tab */}
            <TabsContent value="quick-send" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <QuickSendTab onGiftSent={loadVirtualGiftsData} />
            </TabsContent>

            {/* Browse Gifts Tab */}
            <TabsContent value="browse" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <BrowseGiftsTab onSelectGift={setSelectedGift} />
            </TabsContent>

            {/* Tips Tab */}
            <TabsContent value="tips" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
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

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <AnalyticsTab onRefresh={loadVirtualGiftsData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SendGifts;
