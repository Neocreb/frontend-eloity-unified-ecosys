import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CryptoChart from "@/components/crypto/CryptoChart";
import CryptoList from "@/components/crypto/CryptoList";
import CryptoTradePanel from "@/components/crypto/CryptoTradePanel";
import CryptoPortfolio from "@/components/crypto/CryptoPortfolio";
import P2PMarketplace from "@/components/crypto/P2PMarketplace";
import EloitExchange from "@/components/crypto/SoftPointExchange";
import CryptoWalletActions from "@/components/crypto/CryptoWalletActions";
import AdvancedTradingInterface from "@/components/crypto/AdvancedTradingInterface";
import EnhancedP2PMarketplace from "@/components/crypto/EnhancedP2PMarketplace";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { realAPIService } from "@/services/realAPIService"; // Import the real API service

export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  image: string;
}

const CryptoMarket = () => {
  const [activeTab, setActiveTab] = useState("market");
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        // Use real API service with fallback to intelligent simulation
        const cryptoSymbols = ["bitcoin", "ethereum", "tether", "solana", "cardano", "dogecoin", "polkadot", "chainlink"];
        
        // Fetch data for each cryptocurrency
        const cryptoData = await Promise.all(
          cryptoSymbols.map(async (symbol) => {
            const response = await realAPIService.getCryptoPrice(symbol);
            
            // Map the response to our Crypto interface
            if (response.success) {
              return {
                id: symbol,
                name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
                symbol: symbol,
                current_price: response.data.price,
                market_cap: response.data.marketCap || 0,
                total_volume: response.data.volume24h || 0,
                price_change_percentage_24h: response.data.change24h || 0,
                image: `https://assets.coingecko.com/coins/images/${getCoinGeckoId(symbol)}/large/${symbol}.png`,
              };
            }
            
            // Fallback to mock data if API fails
            return getMockCryptoData(symbol);
          })
        );
        
        setCryptos(cryptoData);
        setSelectedCrypto(cryptoData[0]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        toast({
          title: "Error",
          description:
            "Failed to fetch cryptocurrency data. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    // Helper function to map symbols to CoinGecko IDs
    const getCoinGeckoId = (symbol: string) => {
      const idMap: Record<string, string> = {
        bitcoin: "1",
        ethereum: "279",
        tether: "325",
        solana: "4128",
        cardano: "975",
        dogecoin: "5",
        polkadot: "12171",
        chainlink: "877"
      };
      return idMap[symbol] || symbol;
    };

    // Helper function to get mock data as fallback
    const getMockCryptoData = (symbol: string): Crypto => {
      const mockData: Record<string, Crypto> = {
        bitcoin: {
          id: "bitcoin",
          name: "Bitcoin",
          symbol: "btc",
          current_price: 52835.42,
          market_cap: 1034278909176,
          total_volume: 25982611987,
          price_change_percentage_24h: 2.34,
          image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        },
        ethereum: {
          id: "ethereum",
          name: "Ethereum",
          symbol: "eth",
          current_price: 3145.79,
          market_cap: 377339750529,
          total_volume: 18245920134,
          price_change_percentage_24h: -1.23,
          image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        },
        tether: {
          id: "tether",
          name: "Tether",
          symbol: "usdt",
          current_price: 1.0,
          market_cap: 99258852784,
          total_volume: 47895732908,
          price_change_percentage_24h: 0.02,
          image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
        },
        solana: {
          id: "solana",
          name: "Solana",
          symbol: "sol",
          current_price: 157.83,
          market_cap: 69573985610,
          total_volume: 2945801497,
          price_change_percentage_24h: 5.67,
          image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        },
        cardano: {
          id: "cardano",
          name: "Cardano",
          symbol: "ada",
          current_price: 0.57,
          market_cap: 20187657290,
          total_volume: 591872345,
          price_change_percentage_24h: -2.15,
          image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
        },
        dogecoin: {
          id: "dogecoin",
          name: "Dogecoin",
          symbol: "doge",
          current_price: 0.17,
          market_cap: 24753982341,
          total_volume: 1389752043,
          price_change_percentage_24h: 3.42,
          image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
        },
        polkadot: {
          id: "polkadot",
          name: "Polkadot",
          symbol: "dot",
          current_price: 7.92,
          market_cap: 10982365923,
          total_volume: 343298712,
          price_change_percentage_24h: -3.78,
          image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
        },
        chainlink: {
          id: "chainlink",
          name: "Chainlink",
          symbol: "link",
          current_price: 18.37,
          market_cap: 10754982713,
          total_volume: 589371285,
          price_change_percentage_24h: 0.87,
          image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
        },
      };
      
      return mockData[symbol] || mockData.bitcoin;
    };

    fetchCryptos();

    // Set up polling for real-time price updates
    const interval = setInterval(() => {
      fetchCryptos(); // Refresh data every 30 seconds
    }, 30000);

    return () => clearInterval(interval);
  }, [toast]);

  const handleCryptoSelect = (crypto: Crypto) => {
    setSelectedCrypto(crypto);
  };

  const handleTrade = (type: "buy" | "sell", amount: number) => {
    if (!selectedCrypto) return;

    // In a real app, this would call an API to place the trade
    console.log(`${type} ${amount} of ${selectedCrypto.name}`);

    toast({
      title: "Order Placed",
      description: `Successfully ${type === "buy" ? "bought" : "sold"} ${amount} ${selectedCrypto.symbol.toUpperCase()}`,
    });
  };

  const handleKYCSubmit = async (data: any) => {
    try {
      // In a real app, this would upload documents and update the user's KYC status
      console.log("KYC data submitted:", data);

      // Simulate API call to update KYC status
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "KYC Submitted",
        description:
          "Your verification documents have been submitted for review.",
      });

      return { success: true };
    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast({
        title: "Error",
        description:
          "Failed to submit verification documents. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return (
    <>
      <Helmet>
        <title>Crypto Market | Eloity</title>
      </Helmet>

      <div className="max-w-7xl mx-auto crypto-page-container">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 crypto-text-premium">
          Crypto Market
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 md:grid-cols-6 mb-4 md:mb-8 h-auto p-1 crypto-card-premium crypto-border-premium">
            <TabsTrigger
              value="market"
              className="text-xs md:text-sm px-2 py-2 crypto-text-premium data-[state=active]:crypto-gradient-bg"
            >
              Market
            </TabsTrigger>
            <TabsTrigger
              value="trading"
              className="text-xs md:text-sm px-2 py-2 crypto-text-premium data-[state=active]:crypto-gradient-bg"
            >
              Pro Trading
            </TabsTrigger>
            <TabsTrigger value="p2p" className="text-xs md:text-sm px-2 py-2 crypto-text-premium data-[state=active]:crypto-gradient-bg">
              P2P
            </TabsTrigger>
            <TabsTrigger
              value="enhanced-p2p"
              className="text-xs md:text-sm px-1 py-2 crypto-text-premium data-[state=active]:crypto-gradient-bg"
            >
              Enhanced P2P
            </TabsTrigger>
            <TabsTrigger
              value="convert"
              className="text-xs md:text-sm px-2 py-2 crypto-text-premium data-[state=active]:crypto-gradient-bg"
            >
              Convert
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="text-xs md:text-sm px-2 py-2 crypto-text-premium data-[state=active]:crypto-gradient-bg"
            >
              Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="lg:col-span-3">
                {isLoading || !selectedCrypto ? (
                  <Card className="crypto-card-premium">
                    <CardContent className="p-0">
                      <Skeleton className="h-[300px] md:h-[400px] w-full" />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="crypto-card-premium rounded-lg">
                    <CryptoChart crypto={selectedCrypto} />
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                {isLoading || !selectedCrypto ? (
                  <Card className="crypto-card-premium">
                    <CardContent className="p-0">
                      <Skeleton className="h-[300px] md:h-[400px] w-full" />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="crypto-card-premium rounded-lg">
                    <CryptoTradePanel
                      crypto={selectedCrypto}
                      onTrade={handleTrade}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 md:mt-6 grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
              <div className="xl:col-span-3">
                <Card className="crypto-card-premium">
                  <CardContent className="p-0">
                    {isLoading ? (
                      <Skeleton className="h-[300px] md:h-[400px] w-full" />
                    ) : (
                      <CryptoList
                        cryptos={cryptos}
                        selectedCryptoId={selectedCrypto?.id || ""}
                        onSelectCrypto={handleCryptoSelect}
                        isLoading={isLoading}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="xl:col-span-1">
                <div className="crypto-card-premium rounded-lg">
                  <CryptoPortfolio />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trading">
            <AdvancedTradingInterface />
          </TabsContent>

          <TabsContent value="p2p">
            <P2PMarketplace />
          </TabsContent>

          <TabsContent value="enhanced-p2p">
            <EnhancedP2PMarketplace />
          </TabsContent>

          <TabsContent value="convert">
            <EloitExchange />
          </TabsContent>

          <TabsContent value="wallet">
            <CryptoWalletActions onKYCSubmit={handleKYCSubmit} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CryptoMarket;
