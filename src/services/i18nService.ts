export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  exchangeRate: number; // Rate relative to USD
}

export interface Region {
  code: string;
  name: string;
  countries: string[];
  currencies: string[];
  languages: string[];
  paymentMethods: string[];
  culturalNotes: string[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: "bank" | "mobile" | "card" | "crypto" | "ewallet";
  countries: string[];
  currencies: string[];
  description: string;
  fees: {
    fixed: number;
    percentage: number;
  };
  processingTime: string;
  limits: {
    min: number;
    max: number;
    daily: number;
  };
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    rtl: false,
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    rtl: false,
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    rtl: false,
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    rtl: false,
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    rtl: false,
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    rtl: false,
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
    rtl: false,
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸��",
    rtl: true,
  },
];

export const SUPPORTED_CURRENCIES: Currency[] = [
  // Major Global Currencies
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    country: "United States",
    exchangeRate: 1.0,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    country: "European Union",
    exchangeRate: 0.85,
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    country: "United Kingdom",
    exchangeRate: 0.75,
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    country: "Japan",
    exchangeRate: 110.0,
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    country: "China",
    exchangeRate: 6.5,
  },

  // African Currencies
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    country: "Nigeria",
    exchangeRate: 760.0,
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "₵",
    country: "Ghana",
    exchangeRate: 12.0,
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    country: "South Africa",
    exchangeRate: 18.5,
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    country: "Kenya",
    exchangeRate: 125.0,
  },
  {
    code: "EGP",
    name: "Egyptian Pound",
    symbol: "£",
    country: "Egypt",
    exchangeRate: 31.0,
  },
  {
    code: "MAD",
    name: "Moroccan Dirham",
    symbol: "د.م.",
    country: "Morocco",
    exchangeRate: 10.2,
  },
  {
    code: "TND",
    name: "Tunisian Dinar",
    symbol: "د.ت",
    country: "Tunisia",
    exchangeRate: 3.1,
  },
  {
    code: "XOF",
    name: "West African CFA Franc",
    symbol: "F",
    country: "West Africa",
    exchangeRate: 580.0,
  },
  {
    code: "XAF",
    name: "Central African CFA Franc",
    symbol: "F",
    country: "Central Africa",
    exchangeRate: 580.0,
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
    symbol: "USh",
    country: "Uganda",
    exchangeRate: 3700.0,
  },

  // Other Important Currencies
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    country: "Canada",
    exchangeRate: 1.35,
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    country: "Australia",
    exchangeRate: 1.45,
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "CHF",
    country: "Switzerland",
    exchangeRate: 0.92,
  },
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    country: "India",
    exchangeRate: 83.0,
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    country: "Brazil",
    exchangeRate: 5.2,
  },
  {
    code: "MXN",
    name: "Mexican Peso",
    symbol: "$",
    country: "Mexico",
    exchangeRate: 17.5,
  },
];

export const AFRICAN_PAYMENT_METHODS: PaymentMethod[] = [
  // Nigeria
  {
    id: "paystack",
    name: "Paystack",
    type: "ewallet",
    countries: ["NG"],
    currencies: ["NGN", "USD"],
    description:
      "Popular payment processor in Nigeria supporting cards and bank transfers",
    fees: { fixed: 0, percentage: 1.5 },
    processingTime: "Instant",
    limits: { min: 100, max: 1000000, daily: 5000000 },
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    type: "ewallet",
    countries: ["NG", "GH", "KE", "UG", "ZA"],
    currencies: ["NGN", "GHS", "KES", "UGX", "ZAR", "USD"],
    description: "Pan-African payment platform supporting multiple countries",
    fees: { fixed: 0, percentage: 1.4 },
    processingTime: "Instant",
    limits: { min: 100, max: 2000000, daily: 10000000 },
  },
  {
    id: "bank_transfer_ng",
    name: "Nigerian Bank Transfer",
    type: "bank",
    countries: ["NG"],
    currencies: ["NGN"],
    description: "Direct bank transfer using Nigerian banking system",
    fees: { fixed: 50, percentage: 0 },
    processingTime: "1-2 hours",
    limits: { min: 1000, max: 5000000, daily: 10000000 },
  },

  // Ghana
  {
    id: "mtn_momo_gh",
    name: "MTN Mobile Money",
    type: "mobile",
    countries: ["GH"],
    currencies: ["GHS"],
    description: "Mobile money service in Ghana",
    fees: { fixed: 0, percentage: 1.0 },
    processingTime: "Instant",
    limits: { min: 1, max: 5000, daily: 20000 },
  },
  {
    id: "vodafone_cash",
    name: "Vodafone Cash",
    type: "mobile",
    countries: ["GH"],
    currencies: ["GHS"],
    description: "Vodafone mobile money service",
    fees: { fixed: 0, percentage: 1.2 },
    processingTime: "Instant",
    limits: { min: 1, max: 5000, daily: 20000 },
  },

  // South Africa
  {
    id: "eft_za",
    name: "EFT (Electronic Funds Transfer)",
    type: "bank",
    countries: ["ZA"],
    currencies: ["ZAR"],
    description: "Standard bank transfer in South Africa",
    fees: { fixed: 5, percentage: 0 },
    processingTime: "1-3 hours",
    limits: { min: 100, max: 1000000, daily: 5000000 },
  },
  {
    id: "capitec_pay",
    name: "Capitec Pay",
    type: "mobile",
    countries: ["ZA"],
    currencies: ["ZAR"],
    description: "Capitec Bank mobile payment solution",
    fees: { fixed: 0, percentage: 0.5 },
    processingTime: "Instant",
    limits: { min: 10, max: 25000, daily: 100000 },
  },

  // Kenya
  {
    id: "mpesa",
    name: "M-Pesa",
    type: "mobile",
    countries: ["KE"],
    currencies: ["KES"],
    description: "Leading mobile money service in Kenya",
    fees: { fixed: 0, percentage: 1.0 },
    processingTime: "Instant",
    limits: { min: 1, max: 300000, daily: 500000 },
  },
  {
    id: "airtel_money_ke",
    name: "Airtel Money",
    type: "mobile",
    countries: ["KE", "UG"],
    currencies: ["KES", "UGX"],
    description: "Airtel mobile money service",
    fees: { fixed: 0, percentage: 1.5 },
    processingTime: "Instant",
    limits: { min: 10, max: 100000, daily: 300000 },
  },

  // Multi-country crypto solutions
  {
    id: "binance_p2p",
    name: "Binance P2P",
    type: "crypto",
    countries: ["NG", "GH", "KE", "ZA", "UG"],
    currencies: ["NGN", "GHS", "KES", "ZAR", "UGX", "USDT", "BTC"],
    description: "Peer-to-peer crypto trading with local currency support",
    fees: { fixed: 0, percentage: 0 },
    processingTime: "15-30 minutes",
    limits: { min: 50, max: 10000000, daily: 50000000 },
  },
];

export const REGIONAL_CONFIG: Region[] = [
  {
    code: "na",
    name: "North America",
    countries: ["US", "CA", "MX"],
    currencies: ["USD", "CAD", "MXN"],
    languages: ["en", "es", "fr"],
    paymentMethods: ["stripe", "paypal", "bank_transfer", "card"],
    culturalNotes: [
      "Business-focused communication preferred",
      "Individual achievement emphasized",
      "Direct communication style",
    ],
  },
  {
    code: "eu",
    name: "Europe",
    countries: ["DE", "FR", "ES", "IT", "GB"],
    currencies: ["EUR", "GBP"],
    languages: ["en", "de", "fr", "es"],
    paymentMethods: ["sepa", "card", "paypal"],
    culturalNotes: [
      "Privacy and data protection highly valued",
      "Quality and craftsmanship important",
      "Formal communication in business",
    ],
  },
  {
    code: "af",
    name: "Africa",
    countries: ["NG", "GH", "KE", "ZA", "UG", "EG", "MA", "TN"],
    currencies: [
      "NGN",
      "GHS",
      "KES",
      "ZAR",
      "UGX",
      "EGP",
      "MAD",
      "TND",
      "XOF",
      "XAF",
    ],
    languages: ["en", "fr", "ar"],
    paymentMethods: [
      "paystack",
      "flutterwave",
      "mpesa",
      "mtn_momo_gh",
      "binance_p2p",
    ],
    culturalNotes: [
      "Community and relationships highly valued",
      "Mobile-first approach to technology",
      "Trust and reputation crucial for business",
      "Extended family considerations in financial decisions",
    ],
  },
  {
    code: "as",
    name: "Asia",
    countries: ["CN", "JP", "IN", "SG", "KR"],
    currencies: ["CNY", "JPY", "INR", "SGD", "KRW"],
    languages: ["zh", "ja", "en"],
    paymentMethods: ["alipay", "wechat_pay", "bank_transfer"],
    culturalNotes: [
      "Respect and hierarchy important",
      "Long-term relationships valued",
      "Technology adoption rapid",
    ],
  },
];

class I18nService {
  private currentLanguage: string = "en";
  private currentCurrency: string = "USD";
  private currentRegion: string = "na";
  private translations: Map<string, any> = new Map();

  constructor() {
    // Defer initialization to avoid issues with SSR and early module loading
    if (typeof window !== "undefined") {
      try {
        this.detectUserLanguage();
        this.detectUserCurrency();
        this.detectUserRegion();
      } catch (error) {
        console.warn("Failed to auto-detect locale settings:", error);
      }
    }
  }

  // Language Management
  detectUserLanguage(): void {
    if (typeof window === "undefined" || !navigator) {
      return; // Default to "en" set in initial state
    }
    try {
      const browserLang = navigator.language.split("-")[0];
      const supportedLang = SUPPORTED_LANGUAGES.find(
        (lang) => lang.code === browserLang,
      );
      this.currentLanguage = supportedLang ? browserLang : "en";
    } catch (error) {
      console.warn("Failed to detect user language:", error);
    }
  }

  setLanguage(langCode: string): void {
    const supported = SUPPORTED_LANGUAGES.find(
      (lang) => lang.code === langCode,
    );
    if (supported) {
      this.currentLanguage = langCode;

      // Only access browser APIs if available
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("eloity_language", langCode);
        } catch (error) {
          console.warn("Failed to save language preference:", error);
        }
        try {
          this.loadTranslations();
        } catch (error) {
          console.warn("Failed to load translations:", error);
        }
        try {
          // Update document direction for RTL languages
          document.dir = supported.rtl ? "rtl" : "ltr";
          document.documentElement.lang = langCode;
        } catch (error) {
          console.warn("Failed to update document language:", error);
        }
      }
    }
  }

  getCurrentLanguage(): Language {
    return (
      SUPPORTED_LANGUAGES.find((lang) => lang.code === this.currentLanguage) ||
      SUPPORTED_LANGUAGES[0]
    );
  }

  // Currency Management
  detectUserCurrency(): void {
    // First, check if currency is saved in localStorage (same key as CurrencyContext)
    if (typeof window !== "undefined") {
      try {
        const savedCurrency = localStorage.getItem("preferred_currency");
        if (savedCurrency) {
          const supported = SUPPORTED_CURRENCIES.find(
            (curr) => curr.code === savedCurrency,
          );
          if (supported) {
            this.currentCurrency = savedCurrency;
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to read currency preference from localStorage:", error);
      }
    }

    // If no saved currency, try to detect based on user's location/timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Simple mapping based on timezone
    if (timezone.includes("Europe")) {
      this.currentCurrency = "EUR";
    } else if (timezone.includes("London")) {
      this.currentCurrency = "GBP";
    } else if (
      timezone.includes("Lagos") ||
      timezone.includes("Africa/Lagos")
    ) {
      this.currentCurrency = "NGN";
    } else if (timezone.includes("Africa/Accra")) {
      this.currentCurrency = "GHS";
    } else if (timezone.includes("Africa/Johannesburg")) {
      this.currentCurrency = "ZAR";
    } else if (timezone.includes("Africa/Nairobi")) {
      this.currentCurrency = "KES";
    } else if (timezone.includes("Asia/Shanghai")) {
      this.currentCurrency = "CNY";
    } else if (timezone.includes("Asia/Tokyo")) {
      this.currentCurrency = "JPY";
    } else {
      this.currentCurrency = "USD";
    }
  }

  setCurrency(currencyCode: string): void {
    const supported = SUPPORTED_CURRENCIES.find(
      (curr) => curr.code === currencyCode,
    );
    if (supported) {
      this.currentCurrency = currencyCode;
      if (typeof window !== "undefined") {
        try {
          // Use the same localStorage key as CurrencyContext for consistency
          localStorage.setItem("preferred_currency", currencyCode);
          // Also set old key for backward compatibility
          localStorage.setItem("eloity_currency", currencyCode);
        } catch (error) {
          console.warn("Failed to save currency preference:", error);
        }
      }
    }
  }

  getCurrentCurrency(): Currency {
    return (
      SUPPORTED_CURRENCIES.find((curr) => curr.code === this.currentCurrency) ||
      SUPPORTED_CURRENCIES[0]
    );
  }

  // Region Management
  detectUserRegion(): void {
    const currency = this.getCurrentCurrency();
    const region = REGIONAL_CONFIG.find((r) =>
      r.currencies.includes(currency.code),
    );
    this.currentRegion = region ? region.code : "na";
  }

  setRegion(regionCode: string): void {
    const region = REGIONAL_CONFIG.find((r) => r.code === regionCode);
    if (region) {
      this.currentRegion = regionCode;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("eloity_region", regionCode);
        } catch (error) {
          console.warn("Failed to save region preference:", error);
        }
      }
    }
  }

  getCurrentRegion(): Region {
    return (
      REGIONAL_CONFIG.find((r) => r.code === this.currentRegion) ||
      REGIONAL_CONFIG[0]
    );
  }

  // Translation Management
  async loadTranslations(): Promise<void> {
    try {
      // In a real app, you would load from API or import translation files
      const translations = await this.getTranslationsForLanguage(
        this.currentLanguage,
      );
      this.translations.set(this.currentLanguage, translations);
    } catch (error) {
      console.error("Failed to load translations:", error);
    }
  }

  translate(key: string, params?: Record<string, string>): string {
    const translations = this.translations.get(this.currentLanguage);
    let text = translations?.[key] || key;

    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{{${param}}}`, value);
      });
    }

    return text;
  }

  // Currency Conversion
  convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency?: string,
  ): number {
    const target = toCurrency || this.currentCurrency;
    const fromRate =
      SUPPORTED_CURRENCIES.find((c) => c.code === fromCurrency)?.exchangeRate ||
      1;
    const toRate =
      SUPPORTED_CURRENCIES.find((c) => c.code === target)?.exchangeRate || 1;

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }

  formatCurrency(amount: number, currencyCode?: string): string {
    const currency = currencyCode
      ? SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode)
      : this.getCurrentCurrency();

    if (!currency) return amount.toString();

    try {
      return new Intl.NumberFormat(this.currentLanguage, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: currency.code === "JPY" ? 0 : 2,
      }).format(amount);
    } catch {
      return `${currency.symbol}${amount.toFixed(2)}`;
    }
  }

  // Payment Methods
  getAvailablePaymentMethods(countryCode?: string): PaymentMethod[] {
    const region = this.getCurrentRegion();
    let methods = AFRICAN_PAYMENT_METHODS;

    if (countryCode) {
      methods = methods.filter((method) =>
        method.countries.includes(countryCode),
      );
    } else {
      methods = methods.filter((method) =>
        method.countries.some((country) => region.countries.includes(country)),
      );
    }

    return methods.filter((method) =>
      method.currencies.includes(this.currentCurrency),
    );
  }

  // Cultural Adaptation
  getCulturalNotes(): string[] {
    return this.getCurrentRegion().culturalNotes;
  }

  getLocalizedDateFormat(): string {
    const lang = this.getCurrentLanguage();
    switch (lang.code) {
      case "en":
        return "MM/DD/YYYY";
      case "de":
      case "fr":
        return "DD/MM/YYYY";
      case "zh":
      case "ja":
        return "YYYY/MM/DD";
      default:
        return "MM/DD/YYYY";
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.currentLanguage).format(date);
  }

  formatNumber(number: number): string {
    return new Intl.NumberFormat(this.currentLanguage).format(number);
  }

  // Mock translation data - in a real app, these would be loaded from files
  private async getTranslationsForLanguage(
    langCode: string,
  ): Promise<Record<string, string>> {
    const baseTranslations = {
      // Navigation
      "nav.home": "Home",
      "nav.feed": "Feed",
      "nav.explore": "Explore",
      "nav.create": "Create",
      "nav.messages": "Messages",
      "nav.profile": "Profile",
      "nav.wallet": "Wallet",
      "nav.marketplace": "Marketplace",
      "nav.crypto": "Crypto",
      "nav.videos": "Videos",
      "nav.settings": "Settings",

      // Common Actions
      "action.save": "Save",
      "action.cancel": "Cancel",
      "action.delete": "Delete",
      "action.edit": "Edit",
      "action.share": "Share",
      "action.like": "Like",
      "action.comment": "Comment",
      "action.follow": "Follow",
      "action.buy": "Buy",
      "action.sell": "Sell",
      "action.send": "Send",
      "action.receive": "Receive",

      // Trading
      "trading.buy": "Buy",
      "trading.sell": "Sell",
      "trading.price": "Price",
      "trading.amount": "Amount",
      "trading.total": "Total",
      "trading.balance": "Balance",
      "trading.portfolio": "Portfolio",
      "trading.orders": "Orders",
      "trading.history": "History",

      // Marketplace
      "marketplace.products": "Products",
      "marketplace.cart": "Cart",
      "marketplace.checkout": "Checkout",
      "marketplace.shipping": "Shipping",
      "marketplace.payment": "Payment",
      "marketplace.order": "Order",
      "marketplace.seller": "Seller",
      "marketplace.buyer": "Buyer",

      // Wallet
      "wallet.balance": "Balance",
      "wallet.deposit": "Deposit",
      "wallet.withdraw": "Withdraw",
      "wallet.transfer": "Transfer",
      "wallet.transaction": "Transaction",
      "wallet.fee": "Fee",
      "wallet.confirmed": "Confirmed",
      "wallet.pending": "Pending",

      // AI Assistant
      "ai.assistant": "AI Assistant",
      "ai.insights": "AI Insights",
      "ai.suggestions": "Suggestions",
      "ai.recommendation": "Recommendation",
      "ai.confidence": "Confidence",
      "ai.analysis": "Analysis",
    };

    // Language-specific translations
    const translations: Record<string, Record<string, string>> = {
      en: baseTranslations,
      es: {
        ...baseTranslations,
        "nav.home": "Inicio",
        "nav.feed": "Feed",
        "nav.explore": "Explorar",
        "nav.create": "Crear",
        "nav.messages": "Mensajes",
        "nav.profile": "Perfil",
        "nav.wallet": "Billetera",
        "nav.marketplace": "Mercado",
        "nav.crypto": "Cripto",
        "nav.videos": "Videos",
        "nav.settings": "Configuración",
        "action.save": "Guardar",
        "action.cancel": "Cancelar",
        "action.delete": "Eliminar",
        "trading.buy": "Comprar",
        "trading.sell": "Vender",
        "trading.price": "Precio",
        "ai.assistant": "Asistente IA",
      },
      fr: {
        ...baseTranslations,
        "nav.home": "Accueil",
        "nav.feed": "Fil",
        "nav.explore": "Explorer",
        "nav.create": "Créer",
        "nav.messages": "Messages",
        "nav.profile": "Profil",
        "nav.wallet": "Portefeuille",
        "nav.marketplace": "Marché",
        "nav.crypto": "Crypto",
        "nav.videos": "Vidéos",
        "nav.settings": "Paramètres",
        "action.save": "Sauvegarder",
        "action.cancel": "Annuler",
        "trading.buy": "Acheter",
        "trading.sell": "Vendre",
        "ai.assistant": "Assistant IA",
      },
      de: {
        ...baseTranslations,
        "nav.home": "Startseite",
        "nav.feed": "Feed",
        "nav.explore": "Entdecken",
        "nav.create": "Erstellen",
        "nav.messages": "Nachrichten",
        "nav.profile": "Profil",
        "nav.wallet": "Wallet",
        "nav.marketplace": "Marktplatz",
        "nav.crypto": "Krypto",
        "nav.videos": "Videos",
        "nav.settings": "Einstellungen",
        "action.save": "Speichern",
        "action.cancel": "Abbrechen",
        "trading.buy": "Kaufen",
        "trading.sell": "Verkaufen",
        "ai.assistant": "KI-Assistent",
      },
      zh: {
        ...baseTranslations,
        "nav.home": "首页",
        "nav.feed": "动态",
        "nav.explore": "探索",
        "nav.create": "创建",
        "nav.messages": "消息",
        "nav.profile": "个人资料",
        "nav.wallet": "钱包",
        "nav.marketplace": "市场",
        "nav.crypto": "加密货币",
        "nav.videos": "视频",
        "nav.settings": "设置",
        "action.save": "保存",
        "action.cancel": "取消",
        "trading.buy": "买入",
        "trading.sell": "卖出",
        "ai.assistant": "AI助手",
      },
      ja: {
        ...baseTranslations,
        "nav.home": "ホーム",
        "nav.feed": "フィード",
        "nav.explore": "探索",
        "nav.create": "作成",
        "nav.messages": "メッセージ",
        "nav.profile": "プロフィール",
        "nav.wallet": "ウォレット",
        "nav.marketplace": "マーケット",
        "nav.crypto": "クリプト",
        "nav.videos": "動画",
        "nav.settings": "設定",
        "action.save": "保存",
        "action.cancel": "キャンセル",
        "trading.buy": "購入",
        "trading.sell": "売却",
        "ai.assistant": "AIアシスタント",
      },
    };

    return translations[langCode] || translations.en;
  }

  // Get user's preferred settings
  getUserPreferences(): {
    language: Language;
    currency: Currency;
    region: Region;
    paymentMethods: PaymentMethod[];
    culturalNotes: string[];
  } {
    return {
      language: this.getCurrentLanguage(),
      currency: this.getCurrentCurrency(),
      region: this.getCurrentRegion(),
      paymentMethods: this.getAvailablePaymentMethods(),
      culturalNotes: this.getCulturalNotes(),
    };
  }
}

export const i18nService = new I18nService();
