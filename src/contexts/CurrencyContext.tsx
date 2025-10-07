import { createContext, useContext, useState, useEffect, type ReactNode, type FC } from 'react';
import { currencyService, type ConversionOptions, type ConversionResult } from '@/services/currencyService';
import { 
  type Currency, 
  DEFAULT_CURRENCY, 
  getCurrencyByCode,
  getDefaultCurrency 
} from '@/config/currencies';

interface CurrencyContextType {
  // Current user's preferred currency
  userCurrency: Currency;
  baseCurrency: Currency; // Usually USD for internal calculations
  
  // Currency management
  setUserCurrency: (currencyCode: string) => void;
  getSupportedCurrencies: () => Currency[];
  getCurrenciesByCategory: (category: Currency['category']) => Currency[];
  
  // Conversion functions
  convert: (amount: number, fromCurrency: string, toCurrency?: string, options?: ConversionOptions) => ConversionResult;
  convertToUserCurrency: (amount: number, fromCurrency: string, options?: ConversionOptions) => ConversionResult;
  convertFromUserCurrency: (amount: number, toCurrency: string, options?: ConversionOptions) => ConversionResult;
  
  // Formatting functions
  formatAmount: (amount: number, currencyCode?: string, options?: ConversionOptions) => string;
  formatPrice: (price: number, currencyCode?: string, options?: ConversionOptions) => string;
  formatUserCurrency: (amount: number, options?: ConversionOptions) => string;
  
  // Utility functions
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  defaultCurrency?: string;
}

export const CurrencyProvider: FC<CurrencyProviderProps> = ({ 
  children, 
  defaultCurrency = DEFAULT_CURRENCY 
}) => {
  const [userCurrency, setUserCurrencyState] = useState<Currency>(() => {
    // Try to get from localStorage first
    const saved = localStorage.getItem('preferred-currency');
    if (saved) {
      const currency = getCurrencyByCode(saved);
      if (currency) return currency;
    }
    
    // Fallback to default
    return getCurrencyByCode(defaultCurrency) || getDefaultCurrency();
  });
  
  const [baseCurrency] = useState<Currency>(getCurrencyByCode('USD') || getDefaultCurrency());
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Save user currency preference to localStorage
  useEffect(() => {
    localStorage.setItem('preferred-currency', userCurrency.code);
  }, [userCurrency]);

  // Initialize currency service and set up automatic updates
  useEffect(() => {
    const initializeCurrency = async () => {
      setIsLoading(true);
      try {
        await currencyService.updateExchangeRates();
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to initialize currency service:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCurrency();

    // Set up periodic updates (every 5 minutes)
    const interval = setInterval(async () => {
      try {
        await currencyService.updateExchangeRates();
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to update exchange rates:', error);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const setUserCurrency = (currencyCode: string) => {
    const currency = getCurrencyByCode(currencyCode);
    if (currency) {
      setUserCurrencyState(currency);
    } else {
      console.warn(`Invalid currency code: ${currencyCode}`);
    }
  };

  const convert = (
    amount: number, 
    fromCurrency: string, 
    toCurrency: string = userCurrency.code, 
    options?: ConversionOptions
  ): ConversionResult => {
    return currencyService.convert(amount, fromCurrency, toCurrency, options);
  };

  const convertToUserCurrency = (
    amount: number, 
    fromCurrency: string, 
    options?: ConversionOptions
  ): ConversionResult => {
    return currencyService.convert(amount, fromCurrency, userCurrency.code, options);
  };

  const convertFromUserCurrency = (
    amount: number, 
    toCurrency: string, 
    options?: ConversionOptions
  ): ConversionResult => {
    return currencyService.convert(amount, userCurrency.code, toCurrency, options);
  };

  const formatAmount = (
    amount: number, 
    currencyCode: string = userCurrency.code, 
    options?: ConversionOptions
  ): string => {
    return currencyService.formatAmount(amount, currencyCode, options);
  };

  const formatPrice = (
    price: number, 
    currencyCode: string = userCurrency.code, 
    options?: ConversionOptions
  ): string => {
    return currencyService.formatPrice(price, currencyCode, options);
  };

  const formatUserCurrency = (
    amount: number, 
    options?: ConversionOptions
  ): string => {
    return currencyService.formatAmount(amount, userCurrency, options);
  };

  const refreshRates = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await currencyService.updateExchangeRates();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: CurrencyContextType = {
    userCurrency,
    baseCurrency,
    setUserCurrency,
    getSupportedCurrencies: currencyService.getSupportedCurrencies,
    getCurrenciesByCategory: currencyService.getCurrenciesByCategory,
    convert,
    convertToUserCurrency,
    convertFromUserCurrency,
    formatAmount,
    formatPrice,
    formatUserCurrency,
    isLoading,
    lastUpdated,
    refreshRates
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Additional hooks for common use cases
export const useUserCurrency = () => {
  const { userCurrency } = useCurrency();
  return userCurrency;
};

export const useCurrencyConversion = () => {
  const { convert, convertToUserCurrency, convertFromUserCurrency } = useCurrency();
  return { convert, convertToUserCurrency, convertFromUserCurrency };
};

export const useCurrencyFormatting = () => {
  const { formatAmount, formatPrice, formatUserCurrency } = useCurrency();
  return { formatAmount, formatPrice, formatUserCurrency };
};

export default CurrencyContext;
