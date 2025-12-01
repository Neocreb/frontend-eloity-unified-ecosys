import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Crypto } from "@/pages/CryptoMarket";

interface CryptoTradePanelProps {
  crypto: Crypto | null;
  onTrade: (type: 'buy' | 'sell', amount: number) => void;
}

const CryptoTradePanel = ({ crypto, onTrade }: CryptoTradePanelProps) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');
  const [usdValue, setUsdValue] = useState<string>('');
  const { formatCurrency, userCurrency } = useCurrency();
  
  if (!crypto) return null;
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value);
      
      // Calculate USD value
      const numValue = parseFloat(value) || 0;
      setUsdValue((numValue * crypto.current_price).toFixed(2));
    }
  };
  
  const handleUsdValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setUsdValue(value);
      
      // Calculate crypto amount
      const numValue = parseFloat(value) || 0;
      setAmount((numValue / crypto.current_price).toFixed(8));
    }
  };
  
  const handleTrade = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onTrade(tradeType, numAmount);
      setAmount('');
      setUsdValue('');
    }
  };
  
  return (
    <Card className="h-full crypto-card-premium border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg crypto-text-premium">
          Trade {crypto.name} ({crypto.symbol.toUpperCase()})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2 crypto-card-premium crypto-border-premium">
            <TabsTrigger value="buy" className="crypto-text-premium data-[state=active]:crypto-gradient-bg">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="crypto-text-premium data-[state=active]:crypto-gradient-bg">Sell</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="crypto-text-premium">Amount ({crypto.symbol.toUpperCase()})</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                />
                <div className="absolute right-3 top-2.5 text-sm crypto-text-muted-premium">
                  {crypto.symbol.toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="crypto-text-premium">Value ({userCurrency?.code || 'USD'})</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="0.00"
                  value={usdValue}
                  onChange={handleUsdValueChange}
                />
                <div className="absolute right-3 top-2.5 text-sm crypto-text-muted-premium">
                  {userCurrency?.code || 'USD'}
                </div>
              </div>
            </div>
            
            <div className="text-sm crypto-text-muted-premium">
              1 {crypto.symbol.toUpperCase()} = {formatCurrency(crypto.current_price)}
            </div>
            
            <Button 
              onClick={handleTrade}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full"
              variant={tradeType === 'buy' ? 'default' : 'destructive'}
            >
              {tradeType === 'buy' ? 'Buy' : 'Sell'} {crypto.symbol.toUpperCase()}
            </Button>
            
            <div className="crypto-gradient-bg crypto-border-premium border p-3 rounded-md text-sm">
              <div className="font-medium mb-1 crypto-text-premium">Mock Trading Account</div>
              <div className="flex justify-between crypto-text-secondary-premium">
                <span>Available {userCurrency?.code || 'USD'}:</span>
                <span>{formatCurrency(10000)}</span>
              </div>
              <div className="flex justify-between mt-1 crypto-text-secondary-premium">
                <span>Available {crypto.symbol.toUpperCase()}:</span>
                <span>{tradeType === 'buy' ? '0.00' : '1.25'}</span>
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CryptoTradePanel;
