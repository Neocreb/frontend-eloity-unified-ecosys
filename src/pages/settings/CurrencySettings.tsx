import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe, MapPin, Check, Loader2 } from 'lucide-react';
import { useCurrency, getAfricanCurrencies } from '@/contexts/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '@/config/currencies';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import toast from 'react-hot-toast';

const CurrencySettings: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedCurrency,
    autoDetectEnabled,
    detectedCountry,
    detectedCurrency,
    setCurrency,
    toggleAutoDetect,
    isLoading,
    error
  } = useCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'popular' | 'african' | 'all'>('popular');

  // Featured currencies
  const popularCurrencies = SUPPORTED_CURRENCIES.filter(c =>
    ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'NGN', 'ZAR', 'KES'].includes(c.code)
  );

  const africanCurrencies = getAfricanCurrencies();

  const filteredCurrencies = (() => {
    let source: any[] = [];
    if (activeTab === 'popular') {
      source = popularCurrencies;
    } else if (activeTab === 'african') {
      source = africanCurrencies;
    } else {
      source = SUPPORTED_CURRENCIES;
    }

    if (!searchQuery) return source;
    return source.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  })();

  const handleCurrencySelect = async (currencyCode: string) => {
    if (selectedCurrency?.code === currencyCode) return;

    setIsSaving(true);
    try {
      await setCurrency(currencyCode);
      toast.success(`Currency changed to ${currencyCode}`);
    } catch (err) {
      toast.error('Failed to change currency');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoDetectToggle = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      await toggleAutoDetect(enabled);
      if (enabled) {
        toast.success('Auto-detection enabled. Detecting your location...');
      } else {
        toast.success('Auto-detection disabled');
      }
    } catch (err) {
      toast.error('Failed to update auto-detect setting');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading currency settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Currency Settings</h1>
            <p className="text-sm text-gray-600">Manage your preferred currency and exchange preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-sm text-red-800">{error.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Current Currency Card */}
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Current Currency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCurrency && (
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCurrency.flag}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedCurrency.code}</p>
                    <p className="text-sm text-gray-600">{selectedCurrency.name}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auto-Detection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Auto-Detection
            </CardTitle>
            <CardDescription>
              Automatically detect and use currency based on your location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Enable Auto-Detection</p>
                <p className="text-sm text-gray-600 mt-1">
                  Your system will automatically detect the best currency for your location
                </p>
              </div>
              <Switch
                checked={autoDetectEnabled}
                onCheckedChange={handleAutoDetectToggle}
                disabled={isSaving}
              />
            </div>

            {detectedCountry && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Detected Location: <span className="font-bold">{detectedCountry}</span>
                </p>
                {detectedCurrency && (
                  <p className="text-sm text-blue-800 mt-1">
                    Suggested Currency: <span className="font-semibold">{detectedCurrency.code}</span>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currency Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Currency</CardTitle>
            <CardDescription>
              Choose from supported currencies worldwide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div>
              <Label htmlFor="currency-search" className="text-gray-700 mb-2 block">
                Search Currency
              </Label>
              <Input
                id="currency-search"
                placeholder="Search by code, name, or country (e.g., USD, Nigeria, Euro)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="african">African</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              {/* Popular Currencies */}
              <TabsContent value="popular" className="space-y-2">
                <ScrollArea className="h-[500px] border rounded-lg p-4">
                  <div className="space-y-2">
                    {filteredCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => handleCurrencySelect(currency.code)}
                        disabled={isSaving}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                          selectedCurrency?.code === currency.code
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span className="text-2xl">{currency.flag}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{currency.code}</p>
                            <p className="text-sm text-gray-600">{currency.name}</p>
                          </div>
                        </div>
                        {selectedCurrency?.code === currency.code && (
                          <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                    {filteredCurrencies.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No currencies found</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* African Currencies */}
              <TabsContent value="african" className="space-y-2">
                <ScrollArea className="h-[500px] border rounded-lg p-4">
                  <div className="space-y-2">
                    {filteredCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => handleCurrencySelect(currency.code)}
                        disabled={isSaving}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                          selectedCurrency?.code === currency.code
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span className="text-2xl">{currency.flag}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{currency.code}</p>
                            <p className="text-sm text-gray-600">{currency.name}</p>
                          </div>
                        </div>
                        {selectedCurrency?.code === currency.code && (
                          <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                    {filteredCurrencies.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No African currencies found</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* All Currencies */}
              <TabsContent value="all" className="space-y-2">
                <ScrollArea className="h-[500px] border rounded-lg p-4">
                  <div className="space-y-2">
                    {filteredCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => handleCurrencySelect(currency.code)}
                        disabled={isSaving}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                          selectedCurrency?.code === currency.code
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span className="text-2xl">{currency.flag}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{currency.code}</p>
                            <p className="text-sm text-gray-600">{currency.name}</p>
                          </div>
                        </div>
                        {selectedCurrency?.code === currency.code && (
                          <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                    {filteredCurrencies.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No currencies found</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              💡 <span className="font-semibold">Pro Tip:</span> Your selected currency will be used across the entire platform, including wallet balances, prices, and historical transactions. Exchange rates are updated automatically every 24 hours.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrencySettings;
