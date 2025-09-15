import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface P2POffer {
  id: string;
  user_id: string;
  offer_type: 'buy' | 'sell';
  crypto_type: string;
  amount: number;
  price_per_unit: number;
  payment_method: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  expires_at: string;
  user?: {
    name?: string;
    username?: string;
    avatar_url?: string;
  };
  total_trades?: number;
  rating?: number;
}

export interface Trade {
  id: string;
  buyer_id: string;
  seller_id: string;
  offer_id: string;
  amount: number;
  price_per_unit: number;
  total_amount: number;
  payment_method: string;
  status: 'pending' | 'paid' | 'confirmed' | 'completed' | 'cancelled' | 'disputed';
  created_at: string;
  completed_at?: string;
  cancelled_at?: string;
  updated_at: string;
  buyer?: {
    name?: string;
    username?: string;
    avatar_url?: string;
  };
  seller?: {
    name?: string;
    username?: string;
    avatar_url?: string;
  };
  offer?: P2POffer;
}

export const useRealtimeP2P = () => {
  const [offers, setOffers] = useState<P2POffer[]>([]);
  const [myOffers, setMyOffers] = useState<P2POffer[]>([]);
  const [myTrades, setMyTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerLoading, setOfferLoading] = useState(false);
  const [tradeLoading, setTradeLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch active offers
  const fetchOffers = useCallback(async (filters?: {
    crypto_type?: string;
    offer_type?: 'buy' | 'sell';
    payment_method?: string;
  }) => {
    try {
      let query = supabase
        .from('p2p_offers')
        .select(`
          *,
          user:profiles!p2p_offers_user_id_fkey (
            name,
            username,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.crypto_type) {
        query = query.eq('crypto_type', filters.crypto_type);
      }
      if (filters?.offer_type) {
        query = query.eq('offer_type', filters.offer_type);
      }
      if (filters?.payment_method) {
        query = query.eq('payment_method', filters.payment_method);
      }

      const { data, error } = await query;
      if (error) throw error;

      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to load P2P offers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch user's own offers
  const fetchMyOffers = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('p2p_offers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyOffers(data || []);
    } catch (error) {
      console.error('Error fetching my offers:', error);
    }
  }, [user?.id]);

  // Fetch user's trades
  const fetchMyTrades = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          buyer:profiles!trades_buyer_id_fkey (
            name,
            username,
            avatar_url
          ),
          seller:profiles!trades_seller_id_fkey (
            name,
            username,
            avatar_url
          ),
          offer:p2p_offers!trades_offer_id_fkey (
            crypto_type,
            payment_method,
            notes
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyTrades(data || []);
    } catch (error) {
      console.error('Error fetching my trades:', error);
    }
  }, [user?.id]);

  // Create new offer
  const createOffer = useCallback(async (offerData: {
    offer_type: 'buy' | 'sell';
    crypto_type: string;
    amount: number;
    price_per_unit: number;
    payment_method: string;
    notes?: string;
    expires_in_hours?: number;
  }) => {
    if (!user?.id) return false;

    try {
      setOfferLoading(true);
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (offerData.expires_in_hours || 24));

      const { error } = await supabase
        .from('p2p_offers')
        .insert({
          user_id: user.id,
          offer_type: offerData.offer_type,
          crypto_type: offerData.crypto_type,
          amount: offerData.amount,
          price_per_unit: offerData.price_per_unit,
          payment_method: offerData.payment_method,
          notes: offerData.notes,
          expires_at: expiresAt.toISOString(),
          status: 'active',
        });

      if (error) throw error;

      toast({
        title: "Offer Created",
        description: `Your ${offerData.offer_type} offer has been published`,
      });

      fetchMyOffers();
      fetchOffers();
      return true;
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: "Failed to create offer",
        variant: "destructive",
      });
      return false;
    } finally {
      setOfferLoading(false);
    }
  }, [user?.id, fetchMyOffers, fetchOffers, toast]);

  // Accept/respond to an offer (create trade)
  const acceptOffer = useCallback(async (
    offerId: string,
    amount?: number
  ) => {
    if (!user?.id) return false;

    try {
      setTradeLoading(true);

      // Get offer details
      const { data: offer, error: offerError } = await supabase
        .from('p2p_offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (offerError) throw offerError;
      if (!offer) throw new Error('Offer not found');

      // Determine buyer and seller based on offer type
      const tradeAmount = amount || offer.amount;
      const totalAmount = tradeAmount * offer.price_per_unit;
      
      const tradeData = {
        offer_id: offerId,
        amount: tradeAmount,
        price_per_unit: offer.price_per_unit,
        total_amount: totalAmount,
        payment_method: offer.payment_method,
        status: 'pending',
        buyer_id: offer.offer_type === 'sell' ? user.id : offer.user_id,
        seller_id: offer.offer_type === 'sell' ? offer.user_id : user.id,
      };

      const { error } = await supabase
        .from('trades')
        .insert(tradeData);

      if (error) throw error;

      toast({
        title: "Trade Initiated",
        description: "Your trade has been created successfully",
      });

      fetchMyTrades();
      return true;
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast({
        title: "Error",
        description: "Failed to create trade",
        variant: "destructive",
      });
      return false;
    } finally {
      setTradeLoading(false);
    }
  }, [user?.id, fetchMyTrades, toast]);

  // Update trade status
  const updateTradeStatus = useCallback(async (
    tradeId: string,
    status: 'paid' | 'confirmed' | 'completed' | 'cancelled' | 'disputed'
  ) => {
    if (!user?.id) return false;

    try {
      setTradeLoading(true);

      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('trades')
        .update(updateData)
        .eq('id', tradeId)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (error) throw error;

      toast({
        title: "Trade Updated",
        description: `Trade status updated to ${status}`,
      });

      fetchMyTrades();
      return true;
    } catch (error) {
      console.error('Error updating trade:', error);
      toast({
        title: "Error",
        description: "Failed to update trade",
        variant: "destructive",
      });
      return false;
    } finally {
      setTradeLoading(false);
    }
  }, [user?.id, fetchMyTrades, toast]);

  // Cancel offer
  const cancelOffer = useCallback(async (offerId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('p2p_offers')
        .update({ status: 'cancelled' })
        .eq('id', offerId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Offer Cancelled",
        description: "Your offer has been cancelled",
      });

      fetchMyOffers();
      fetchOffers();
      return true;
    } catch (error) {
      console.error('Error cancelling offer:', error);
      toast({
        title: "Error",
        description: "Failed to cancel offer",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, fetchMyOffers, fetchOffers, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const offersChannel = supabase
      .channel('p2p_offers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'p2p_offers',
        },
        (payload) => {
          console.log('Offer change:', payload);
          fetchOffers();
          fetchMyOffers();
        }
      )
      .subscribe();

    const tradesChannel = supabase
      .channel('trades')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
        },
        (payload) => {
          console.log('Trade change:', payload);
          const trade = payload.new || payload.old;
          
          // Check if this trade involves the current user
          if (trade && (trade.buyer_id === user.id || trade.seller_id === user.id)) {
            fetchMyTrades();
            
            if (payload.eventType === 'INSERT') {
              toast({
                title: "New Trade",
                description: "Someone accepted your offer",
              });
            } else if (payload.eventType === 'UPDATE' && payload.new.status !== payload.old?.status) {
              toast({
                title: "Trade Updated",
                description: `Trade status: ${payload.new.status}`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(offersChannel);
      supabase.removeChannel(tradesChannel);
    };
  }, [user?.id, fetchOffers, fetchMyOffers, fetchMyTrades, toast]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchOffers();
      fetchMyOffers();
      fetchMyTrades();
    }
  }, [user?.id, fetchOffers, fetchMyOffers, fetchMyTrades]);

  return {
    offers,
    myOffers,
    myTrades,
    loading,
    offerLoading,
    tradeLoading,
    createOffer,
    acceptOffer,
    updateTradeStatus,
    cancelOffer,
    fetchOffers,
    refetch: () => {
      fetchOffers();
      fetchMyOffers();
      fetchMyTrades();
    },
  };
};