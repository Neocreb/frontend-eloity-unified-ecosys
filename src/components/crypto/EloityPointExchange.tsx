import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ArrowRight, Info, RefreshCcw } from "lucide-react";
import { useToast } from "../ui/use-toast";
import CryptoKYCModal from "./CryptoKYCModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface Currency {
  id: string;
  name: string;
  symbol: string;
  icon: string;
}

const EloityPointExchange = () => {
  const [fromCurrency, setFromCurrency] = useState("eloitypoints");
  const [toCurrency, setToCurrency] = useState("btc");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("0");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionRate, setConversionRate] = useState(0);
  const [fee, setFee] = useState(0);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(true); // Mock verified status
  const navigate = useNavigate();
  const { toast } = useToast();

  const currencies: Currency[] = [
    {
      id: "eloitypoints",
      name: "EloityPoints",
      symbol: "EP",
      icon: "🔮"
    },
    { 
      id: "btc", 
      name: "Bitcoin", 
      symbol: "BTC", 
      icon: "₿" 
    },
    { 
      id: "eth", 
      name: "Ethereum", 
      symbol: "ETH", 
      icon: "Ξ" 
    },
    { 
      id: "usdt", 
      name: "Tether", 
      symbol: "USDT", 
      icon: "₮" 
    },
    { 
      id: "sol", 
      name: "Solana", 
      symbol: "SOL", 
      icon: "◎" 
    },
  ];

  // Get currency details by ID
  const getCurrency = (id: string) => {
    return currencies.find((c) => c.id === id) || currencies[0];
  };

  // Update conversion rate when currencies change
  useEffect(() => {
    const from = fromCurrency;
    const to = toCurrency;
    
    // Mock conversion rates
    const rates: Record<string, Record<string, number>> = {
      eloitypoints: {
        btc: 0.00000035, // ~2,857,143 EP = 1 BTC
        eth: 0.000005, // ~200,000 EP = 1 ETH
        usdt: 0.015, // ~66.67 EP = 1 USDT
        sol: 0.0008, // ~1,250 EP = 1 SOL
      },
      btc: {
        eloitypoints: 2857143, // 1 BTC = ~2,857,143 EP
        eth: 16, // 1 BTC = 16 ETH
        usdt: 52800, // 1 BTC = $52,800
        sol: 335, // 1 BTC = 335 SOL
      },
      eth: {
        eloitypoints: 200000, // 1 ETH = 200,000 EP
        btc: 0.0625, // 1 ETH = 0.0625 BTC
        usdt: 3145, // 1 ETH = $3,145
        sol: 20, // 1 ETH = 20 SOL
      },
      usdt: {
        eloitypoints: 66.67, // 1 USDT = ~66.67 EP
        btc: 0.000019, // 1 USDT = 0.000019 BTC
        eth: 0.00032, // 1 USDT = 0.00032 ETH
        sol: 0.00633, // 1 USDT = 0.00633 SOL
      },
      sol: {
        eloitypoints: 1250, // 1 SOL = 1,250 EP
        btc: 0.003, // 1 SOL = 0.003 BTC
        eth: 0.05, // 1 SOL = 0.05 ETH
        usdt: 157.83, // 1 SOL = $157.83
      },
    };

    // Set the conversion rate
    if (from !== to && rates[from] && rates[from][to]) {
      setConversionRate(rates[from][to]);
    } else if (from === to) {
      setConversionRate(1);
    } else {
      setConversionRate(0);
    }

    // Set fee percentage (mock)
    // Higher fee for EloityPoints conversions
    if (from === "eloitypoints" || to === "eloitypoints") {
      setFee(0.03); // 3% fee
    } else {
      setFee(0.015); // 1.5% standard fee
    }
  }, [fromCurrency, toCurrency]);

  // Calculate conversion when amount changes
  useEffect(() => {
    if (amount && conversionRate) {
      const parsedAmount = parseFloat(amount);
      if (!isNaN(parsedAmount)) {
        const converted = parsedAmount * conversionRate;
        const feeAmount = converted * fee;
        const finalAmount = converted - feeAmount;
        setConvertedAmount(finalAmount.toFixed(8));
      }
    } else {
      setConvertedAmount("0");
    }
  }, [amount, conversionRate, fee]);

  const handleConvert = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    // Simulate API call
    setTimeout(() => {
      const fromCurrencyDetails = getCurrency(fromCurrency);
      const toCurrencyDetails = getCurrency(toCurrency);
      const parsedAmount = parseFloat(amount);
      const convertedValue = parseFloat(convertedAmount);
      
      setIsConverting(false);
      toast({
        title: "Conversion Successful",
        description: `Converted ${parsedAmount} ${fromCurrencyDetails.symbol} to ${convertedValue.toFixed(6)} ${toCurrencyDetails.symbol}`,
      });
      
      // Clear form
      setAmount("");
    }, 1500);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setAmount("");
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

  const fromCurrencyDetails = getCurrency(fromCurrency);
  const toCurrencyDetails = getCurrency(toCurrency);

  const feeAmount = parseFloat(convertedAmount) * fee;
  const feePercentage = fee * 100;

  const formattedConversionRate = conversionRate < 0.001 
    ? conversionRate.toFixed(8)
    : conversionRate.toFixed(4);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Convert EloityPoints</CardTitle>
              <CardDescription>
                Exchange EloityPoints for crypto or convert between cryptocurrencies
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
              {/* From Currency Section */}
              <div className="col-span-1 md:col-span-3 space-y-2">
                <label className="text-sm font-medium">From</label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          <div className="flex items-center">
                            <span className="mr-2">{currency.icon}</span>
                            {currency.name} ({currency.symbol})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    {fromCurrencyDetails.symbol}
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="col-span-1 md:col-span-1 flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={swapCurrencies}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* To Currency Section */}
              <div className="col-span-1 md:col-span-3 space-y-2">
                <label className="text-sm font-medium">To</label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          <div className="flex items-center">
                            <span className="mr-2">{currency.icon}</span>
                            {currency.name} ({currency.symbol})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="relative bg-muted rounded-md p-3 flex items-center">
                  <span className="text-lg font-semibold">
                    {parseFloat(convertedAmount) < 0.001
                      ? parseFloat(convertedAmount).toFixed(8)
                      : parseFloat(convertedAmount).toFixed(6)}
                  </span>
                  <span className="ml-1 text-muted-foreground">
                    {toCurrencyDetails.symbol}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversion Details */}
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="text-muted-foreground">Conversion Rate</div>
                  <div>
                    1 {fromCurrencyDetails.symbol} = {formattedConversionRate}{" "}
                    {toCurrencyDetails.symbol}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center text-muted-foreground">
                    <span>Fee ({feePercentage}%)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80">
                          <p>
                            A fee of {feePercentage}% is charged on all conversions. 
                            Higher fees apply for EloityPoints conversions.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div>
                    {feeAmount.toFixed(8)} {toCurrencyDetails.symbol}
                  </div>
                </div>
                
                <div className="flex justify-between font-medium pt-2">
                  <div>You'll receive</div>
                  <div>
                    {parseFloat(convertedAmount) < 0.001
                      ? parseFloat(convertedAmount).toFixed(8)
                      : parseFloat(convertedAmount).toFixed(6)}{" "}
                    {toCurrencyDetails.symbol}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              disabled={!amount || parseFloat(amount) <= 0 || isConverting}
              onClick={handleConvert}
            >
              {isConverting ? (
                <div className="flex items-center">
                  <RefreshCcw className="animate-spin h-4 w-4 mr-2" />
                  Converting...
                </div>
              ) : (
                <div className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convert Now
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Conversion History Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Conversion History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent conversions</p>
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

export default EloityPointExchange;
