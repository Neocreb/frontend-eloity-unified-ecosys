import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '@/config/currencies';
import type { Currency } from '@/config/currencies';
import { supabase } from '@/integrations/supabase/client';

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

interface CurrencyContextType {
  selectedCurrency: Currency | null;
  isLoading: boolean;
  error: Error | null;
  exchangeRates: Map<string, number>;
  autoDetectEnabled: boolean;
  detectedCountry: string | null;
  detectedCurrency: Currency | null;
  setCurrency: (currencyCode: string) => Promise<void>;
  toggleAutoDetect: (enabled: boolean) => Promise<void>;
  convertAmount: (amount: number, fromCode: string, toCode: string) => number;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  getExchangeRate: (fromCode: string, toCode: string) => number | null;
  refreshExchangeRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface ConversionOptions {
  decimals?: number;
  showSymbol?: boolean;
  showCode?: boolean;
  locale?: string;
}

export const useCurrencyConversion = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrencyConversion must be used within a CurrencyProvider');
  }

  const formatAmountWithOptions = (amount: number, currencyCode?: string, options?: ConversionOptions): string => {
    const code = currencyCode || context.selectedCurrency?.code || DEFAULT_CURRENCY;
    const currency = getCurrencyByCode(code);

    if (!currency) return `${amount.toFixed(2)}`;

    const {
      decimals = currency.decimals,
      showSymbol = true,
      showCode = false,
      locale = 'en-US'
    } = options || {};

    const formattedNumber = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);

    let result = formattedNumber;

    if (showSymbol) {
      if ((currency as any).isCrypto) {
        result = `${result} ${currency.symbol}`;
      } else {
        result = `${currency.symbol}${result}`;
      }
    }

    if (showCode) {
      result = `${result} ${currency.code}`;
    }

    return result;
  };

  return {
    convertToUserCurrency: (amount: number, fromCurrency: string) => ({
      amount: context.convertAmount(amount, fromCurrency, context.selectedCurrency?.code || DEFAULT_CURRENCY),
      rate: context.getExchangeRate(fromCurrency, context.selectedCurrency?.code || DEFAULT_CURRENCY) || 1,
    }),
    userCurrency: context.selectedCurrency,
    formatAmount: formatAmountWithOptions,
  };
};

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const { user, session } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [detectedCurrency, setDetectedCurrency] = useState<Currency | null>(null);

  // Initialize currency on component mount and user change
  useEffect(() => {
    const initializeCurrency = async () => {
      setIsLoading(true);
      try {
        if (!user?.id || !session) {
          const detected = await detectCurrencyByLocation();
          setSelectedCurrency(detected || getCurrencyByCode(DEFAULT_CURRENCY)!);
          setIsLoading(false);
          return;
        }

        // Fetch user's saved currency preference
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('preferred_currency, auto_detect_currency')
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        const userCurrency = profile?.preferred_currency;
        const userAutoDetect = profile?.auto_detect_currency !== false;

        setAutoDetectEnabled(userAutoDetect);

        if (userAutoDetect) {
          const detected = await detectCurrencyByLocation();
          if (detected) {
            setSelectedCurrency(detected);
            setDetectedCurrency(detected);
          } else {
            setSelectedCurrency(getCurrencyByCode(userCurrency || DEFAULT_CURRENCY)!);
          }
        } else if (userCurrency) {
          setSelectedCurrency(getCurrencyByCode(userCurrency)!);
        } else {
          setSelectedCurrency(getCurrencyByCode(DEFAULT_CURRENCY)!);
        }

        await fetchExchangeRates();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize currency'));
        setSelectedCurrency(getCurrencyByCode(DEFAULT_CURRENCY)!);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCurrency();
  }, [user?.id, session]);

  const detectCurrencyByLocation = async (): Promise<Currency | null> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      setDetectedCountry(data.country_name || null);
      
      const currencyCode = data.currency || null;
      if (currencyCode) {
        const currency = getCurrencyByCode(currencyCode);
        setDetectedCurrency(currency || null);
        return currency || null;
      }
      return null;
    } catch (err) {
      console.error('Geolocation detection failed:', err);
      return null;
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/currency/rates');
      if (!response.ok) throw new Error('Failed to fetch exchange rates');
      
      const data = await response.json();
      if (data.success && data.rates) {
        const ratesMap = new Map<string, number>();
        data.rates.forEach((rate: { from: string; to: string; rate: number }) => {
          ratesMap.set(`${rate.from}_${rate.to}`, rate.rate);
        });
        setExchangeRates(ratesMap);
      }
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch exchange rates'));
    }
  };

  const setCurrency = useCallback(async (currencyCode: string) => {
    try {
      const currency = getCurrencyByCode(currencyCode);
      if (!currency) throw new Error('Invalid currency code');

      setSelectedCurrency(currency);

      if (user?.id && session) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ preferred_currency: currencyCode })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        localStorage.setItem('preferred_currency', currencyCode);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to set currency'));
      throw err;
    }
  }, [user?.id, session]);

  const toggleAutoDetect = useCallback(async (enabled: boolean) => {
    try {
      setAutoDetectEnabled(enabled);

      if (enabled) {
        const detected = await detectCurrencyByLocation();
        if (detected) {
          setSelectedCurrency(detected);
        }
      }

      if (user?.id && session) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ auto_detect_currency: enabled })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        localStorage.setItem('auto_detect_currency', String(enabled));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update auto-detect setting'));
      throw err;
    }
  }, [user?.id, session]);

  const convertAmount = useCallback((amount: number, fromCode: string, toCode: string): number => {
    if (fromCode === toCode) return amount;

    const rate = exchangeRates.get(`${fromCode}_${toCode}`);
    if (!rate) {
      console.warn(`No exchange rate found for ${fromCode} to ${toCode}`);
      return amount;
    }

    return parseFloat((amount * rate).toFixed(2));
  }, [exchangeRates]);

  const formatCurrency = useCallback((amount: number, currencyCode?: string): string => {
    const code = currencyCode || selectedCurrency?.code || DEFAULT_CURRENCY;
    const currency = getCurrencyByCode(code);
    
    if (!currency) return `${amount.toFixed(2)}`;

    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(amount);

    return formatted;
  }, [selectedCurrency]);

  const getExchangeRate = useCallback((fromCode: string, toCode: string): number | null => {
    if (fromCode === toCode) return 1;
    return exchangeRates.get(`${fromCode}_${toCode}`) || null;
  }, [exchangeRates]);

  const refreshExchangeRates = useCallback(async () => {
    await fetchExchangeRates();
  }, []);

  const value = useMemo<CurrencyContextType>(
    () => ({
      selectedCurrency,
      isLoading,
      error,
      exchangeRates,
      autoDetectEnabled,
      detectedCountry,
      detectedCurrency,
      setCurrency,
      toggleAutoDetect,
      convertAmount,
      formatCurrency,
      getExchangeRate,
      refreshExchangeRates,
    }),
    [
      selectedCurrency,
      isLoading,
      error,
      exchangeRates,
      autoDetectEnabled,
      detectedCountry,
      detectedCurrency,
      setCurrency,
      toggleAutoDetect,
      convertAmount,
      formatCurrency,
      getExchangeRate,
      refreshExchangeRates,
    ]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Helper functions
export function getCurrencyByCode(code: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find(c => c.code === code);
}

export function getCurrencyByCountry(country: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find(c => c.country === country);
}

export function getAfricanCurrencies(): Currency[] {
  return SUPPORTED_CURRENCIES.filter(c => {
    const africanCountries = [
      'Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Egypt', 'Uganda', 'Tanzania',
      'Senegal', 'Ivory Coast', 'Morocco', 'Cameroon', 'Ethiopia'
    ];
    return africanCountries.includes(c.country);
  });
}
