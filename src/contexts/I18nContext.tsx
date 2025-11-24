import React, { createContext, useContext, useState, useEffect, FC, ReactNode } from "react";
import {
  i18nService,
  type Language,
  type Currency,
  type Region,
  type PaymentMethod,
  SUPPORTED_LANGUAGES,
  SUPPORTED_CURRENCIES,
  REGIONAL_CONFIG,
} from "@/services/i18nService";

interface I18nContextType {
  // Current settings
  currentLanguage: Language;
  currentCurrency: Currency;
  currentRegion: Region;
  availablePaymentMethods: PaymentMethod[];

  // Available options
  supportedLanguages: Language[];
  supportedCurrencies: Currency[];
  regions: Region[];

  // Actions
  setLanguage: (langCode: string) => void;
  setCurrency: (currencyCode: string) => void;
  setRegion: (regionCode: string) => void;

  // Translation
  t: (key: string, params?: Record<string, string>) => string;

  // Formatting
  formatCurrency: (amount: number, currencyCode?: string) => string;
  formatDate: (date: Date) => string;
  formatNumber: (number: number) => string;
  convertCurrency: (
    amount: number,
    fromCurrency: string,
    toCurrency?: string,
  ) => number;

  // Cultural
  culturalNotes: string[];
  dateFormat: string;

  // Loading state
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const I18nProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES[0],
  );
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(
    SUPPORTED_CURRENCIES[0],
  );
  const [currentRegion, setCurrentRegion] = useState<Region>(
    REGIONAL_CONFIG[0],
  );
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const [culturalNotes, setCulturalNotes] = useState<string[]>([]);

  useEffect(() => {
    initializeI18n();
  }, []);

  const initializeI18n = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      // Load saved preferences or detect automatically (only in browser)
      let savedLanguage = null;
      let savedCurrency = null;

      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        try {
          savedLanguage = localStorage.getItem("eloity_language");
          savedCurrency = localStorage.getItem("eloity_currency");
        } catch (storageError) {
          console.warn("Failed to access localStorage:", storageError);
        }
      }

      let savedRegion = null;
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        try {
          savedRegion = localStorage.getItem("eloity_region");
        } catch (storageError) {
          console.warn("Failed to access localStorage for region:", storageError);
        }
      }

      if (savedLanguage) {
        i18nService.setLanguage(savedLanguage);
      }
      if (savedCurrency) {
        i18nService.setCurrency(savedCurrency);
      }
      if (savedRegion) {
        i18nService.setRegion(savedRegion);
      }

      // Update state with current settings
      updateCurrentSettings();

      // Load translations
      await i18nService.loadTranslations();
    } catch (error) {
      console.error("Failed to initialize i18n:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrentSettings = () => {
    const language = i18nService.getCurrentLanguage();
    const currency = i18nService.getCurrentCurrency();
    const region = i18nService.getCurrentRegion();
    const paymentMethods = i18nService.getAvailablePaymentMethods();
    const notes = i18nService.getCulturalNotes();

    setCurrentLanguage(language);
    setCurrentCurrency(currency);
    setCurrentRegion(region);
    setAvailablePaymentMethods(paymentMethods);
    setCulturalNotes(notes);
  };

  const handleSetLanguage = (langCode: string) => {
    i18nService.setLanguage(langCode);
    updateCurrentSettings();
  };

  const handleSetCurrency = (currencyCode: string) => {
    i18nService.setCurrency(currencyCode);
    updateCurrentSettings();
  };

  const handleSetRegion = (regionCode: string) => {
    i18nService.setRegion(regionCode);
    updateCurrentSettings();
  };

  const translate = (key: string, params?: Record<string, string>) => {
    return i18nService.translate(key, params);
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    return i18nService.formatCurrency(amount, currencyCode);
  };

  const formatDate = (date: Date) => {
    return i18nService.formatDate(date);
  };

  const formatNumber = (number: number) => {
    return i18nService.formatNumber(number);
  };

  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency?: string,
  ) => {
    return i18nService.convertCurrency(amount, fromCurrency, toCurrency);
  };

  const value: I18nContextType = {
    // Current settings
    currentLanguage,
    currentCurrency,
    currentRegion,
    availablePaymentMethods,

    // Available options
    supportedLanguages: SUPPORTED_LANGUAGES,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    regions: REGIONAL_CONFIG,

    // Actions
    setLanguage: handleSetLanguage,
    setCurrency: handleSetCurrency,
    setRegion: handleSetRegion,

    // Translation
    t: translate,

    // Formatting
    formatCurrency,
    formatDate,
    formatNumber,
    convertCurrency,

    // Cultural
    culturalNotes,
    dateFormat: hasError ? "MM/DD/YYYY" : i18nService.getLocalizedDateFormat(),

    // Loading
    isLoading,
  };

  // Fallback UI for critical errors
  if (hasError && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading language settings...</p>
        </div>
      </div>
    );
  }

  // If there's an error but not loading, use fallback values
  if (hasError) {
    console.warn("I18n service failed, using fallback values");
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

export { I18nProvider };
export default I18nContext;
