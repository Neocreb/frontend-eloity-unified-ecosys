import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Info } from "lucide-react";
import { P2POffer } from "@/types/user";
import P2POfferCard from "./P2POfferCard";
import { Button } from "@/components/ui/button";
import CryptoKYCModal from "./CryptoKYCModal";

const P2PMarketplace = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [offers, setOffers] = useState<P2POffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(true); // Mock verified status
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const mockOffers: P2POffer[] = Array.from({ length: 8 }, (_, i) => ({
          id: `offer-${i}`,
          type: Math.random() > 0.5 ? 'buy' : 'sell',
          crypto_amount: selectedCrypto === 'btc' ? 0.1 + Math.random() * 0.9 : 10 + Math.random() * 90,
          crypto_symbol: selectedCrypto.toUpperCase(),
          fiat_price: selectedCrypto === 'btc' ? 52000 + Math.random() * 1000 : 3000 + Math.random() * 100,
          fiat_currency: 'USD',
          min_order: 1000,
          max_order: 50000,
          payment_methods: ['Bank Transfer', 'Wise', 'Revolut'].sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * 2)),
          seller: {
            id: `user-${i}`,
            name: `Trader${i + 1}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
            is_verified: Math.random() > 0.5,
            rating: 4 + Math.random(),
            total_trades: Math.floor(10 + Math.random() * 990)
          },
          created_at: new Date().toISOString(),
          status: 'active'
        }));

        const filteredOffers = mockOffers.filter(offer => {
          const matchesType = activeTab === 'buy' ? offer.type === 'sell' : offer.type === 'buy';
          const matchesPayment = selectedPayment === 'all' || 
                               offer.payment_methods.includes(selectedPayment);
          
          return matchesType && matchesPayment;
        }).sort((a, b) => {
          if (activeTab === 'buy') {
            return a.fiat_price - b.fiat_price;
          } else {
            return b.fiat_price - a.fiat_price;
          }
        });

        setOffers(filteredOffers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching P2P offers:", error);
        toast({
          title: "Unable to fetch P2P offers",
          description: "Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchOffers();
    
    // Refresh offers every 30 seconds
    const interval = setInterval(fetchOffers, 30000);
    return () => clearInterval(interval);
  }, [activeTab, selectedCrypto, selectedPayment, toast]);

  const handleOfferAction = (offer: P2POffer) => {
    const action = activeTab === 'buy' ? 'buy' : 'sell';

    toast({
      title: `${action === 'buy' ? 'Buy' : 'Sell'} Order Initiated`,
      description: `You're about to ${action} ${offer.crypto_symbol} at ${offer.fiat_price} ${offer.fiat_currency}`,
    });
  };

  const handleDepositClick = () => {
    navigate("/app/crypto/deposit");
  };

  const handleWithdrawClick = () => {
    if (!isVerified) {
      toast({
        title: "Verification Required",
        description: "You need to complete KYC verification before withdrawing funds.",
        variant: "destructive",
      });
      return;
    }
    navigate("/app/crypto/withdraw");
  };

  const handleKYCSubmit = async (data: any) => {
    // Mock KYC submission
    return new Promise<{success: boolean}>((resolve) => {
      setTimeout(() => {
        setIsVerified(true);
        resolve({ success: true });
      }, 1500);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>P2P Trading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="sticky top-0 z-10 bg-background pt-4 pb-6 border-b">
            <div className="flex flex-col sm:flex-row gap-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buy' | 'sell')} className="flex-1">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="buy">Buy Crypto</TabsTrigger>
                  <TabsTrigger value="sell">Sell Crypto</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex flex-1 gap-4">
                <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Crypto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                      <SelectItem value="usdt">Tether (USDT)</SelectItem>
                      <SelectItem value="sol">Solana (SOL)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Payment Methods</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Wise">Wise</SelectItem>
                      <SelectItem value="Revolut">Revolut</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Wallet Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDepositClick}
                    className="text-xs"
                  >
                    Deposit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWithdrawClick}
                    className="text-xs"
                    disabled={!isVerified}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading offers...</p>
              </div>
            ) : offers.length === 0 ? (
              <div className="py-12 text-center">
                <Info className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No offers found</p>
                <p className="text-muted-foreground">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <P2POfferCard 
                    key={offer.id}
                    offer={offer}
                    onAction={handleOfferAction}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CryptoKYCModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        onSubmit={handleKYCSubmit}
      />
    </div>
  );
};

export default P2PMarketplace;
