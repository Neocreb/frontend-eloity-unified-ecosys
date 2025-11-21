export interface PaymentMethod {
  id: string;
  region: string;
  countryCode: string;
  countryName: string;
  methodType: 'bank' | 'mobile' | 'ewallet' | 'card' | 'crypto';
  providerName: string;
  providerCode: string;
  isDepositEnabled: boolean;
  isWithdrawalEnabled: boolean;
  minAmount: number;
  maxAmount: number;
  depositFeePercentage?: number;
  depositFlatFee?: number;
  withdrawalFeePercentage?: number;
  withdrawalFlatFee?: number;
  processingTimeMinutes: number;
  currency: string;
  icon?: string;
  color?: string;
  description?: string;
  apiEndpoint?: string;
}

export interface RegionConfig {
  region: string;
  countryCode: string;
  countryName: string;
  currency: string;
  locale: string;
  phonePrefix: string;
  banks: PaymentMethod[];
  mobileProviders: PaymentMethod[];
  ewallets: PaymentMethod[];
  cards: PaymentMethod[];
  crypto: PaymentMethod[];
}

const PAYMENT_METHODS: PaymentMethod[] = [
  // Nigeria
  { id: 'access_bank_ng', region: 'West Africa', countryCode: 'NG', countryName: 'Nigeria', methodType: 'bank', providerName: 'Access Bank', providerCode: 'access_bank', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFlatFee: 0, withdrawalFlatFee: 50, processingTimeMinutes: 1440, currency: 'NGN', icon: '🏦', color: 'red' },
  { id: 'gtbank_ng', region: 'West Africa', countryCode: 'NG', countryName: 'Nigeria', methodType: 'bank', providerName: 'GTBank', providerCode: 'gtbank', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFlatFee: 0, withdrawalFlatFee: 50, processingTimeMinutes: 1440, currency: 'NGN', icon: '🏦', color: 'blue' },
  { id: 'first_bank_ng', region: 'West Africa', countryCode: 'NG', countryName: 'Nigeria', methodType: 'bank', providerName: 'First Bank', providerCode: 'first_bank', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFlatFee: 0, withdrawalFlatFee: 50, processingTimeMinutes: 1440, currency: 'NGN', icon: '🏦', color: 'green' },
  { id: 'zenith_bank_ng', region: 'West Africa', countryCode: 'NG', countryName: 'Nigeria', methodType: 'bank', providerName: 'Zenith Bank', providerCode: 'zenith_bank', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFlatFee: 0, withdrawalFlatFee: 50, processingTimeMinutes: 1440, currency: 'NGN', icon: '🏦', color: 'purple' },
  { id: 'mtn_momo_ng', region: 'West Africa', countryCode: 'NG', countryName: 'Nigeria', methodType: 'mobile', providerName: 'MTN Mobile Money', providerCode: 'mtn_momo_ng', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 500000, depositFeePercentage: 1.5, withdrawalFeePercentage: 1.5, processingTimeMinutes: 5, currency: 'NGN', icon: '📱', color: 'yellow', description: 'MTN mobile money wallet' },
  { id: 'airtel_money_ng', region: 'West Africa', countryCode: 'NG', countryName: 'Nigeria', methodType: 'mobile', providerName: 'Airtel Money', providerCode: 'airtel_money_ng', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 500000, depositFeePercentage: 1.5, withdrawalFeePercentage: 1.5, processingTimeMinutes: 5, currency: 'NGN', icon: '📱', color: 'red' },
  { id: 'paystack_ng', region: 'West Africa', countryCode: 'NG', countryName: 'Nigeria', methodType: 'ewallet', providerName: 'Paystack', providerCode: 'paystack_ng', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 5000000, depositFeePercentage: 1.5, withdrawalFeePercentage: 1.5, processingTimeMinutes: 2, currency: 'NGN', icon: '💳', color: 'blue', description: 'Payment gateway' },
  { id: 'flutterwave_ng', region: 'West Africa', countryCode: 'NG', countryName: 'Nigeria', methodType: 'ewallet', providerName: 'Flutterwave', providerCode: 'flutterwave_ng', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 5000000, depositFeePercentage: 1.8, withdrawalFeePercentage: 1.8, processingTimeMinutes: 2, currency: 'NGN', icon: '💳', color: 'purple' },
  { id: 'opay_ng', region: 'West Africa', countryCode: 'NG', countryName: 'Nigeria', methodType: 'ewallet', providerName: 'OPay', providerCode: 'opay_ng', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFeePercentage: 1.0, withdrawalFeePercentage: 1.0, processingTimeMinutes: 1, currency: 'NGN', icon: '💳', color: 'green', description: 'OPay wallet' },

  // Kenya
  { id: 'kcb_bank_ke', region: 'East Africa', countryCode: 'KE', countryName: 'Kenya', methodType: 'bank', providerName: 'KCB Bank', providerCode: 'kcb_bank', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFlatFee: 0, withdrawalFlatFee: 50, processingTimeMinutes: 1440, currency: 'KES', icon: '🏦', color: 'red' },
  { id: 'equity_bank_ke', region: 'East Africa', countryCode: 'KE', countryName: 'Kenya', methodType: 'bank', providerName: 'Equity Bank', providerCode: 'equity_bank', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFlatFee: 0, withdrawalFlatFee: 50, processingTimeMinutes: 1440, currency: 'KES', icon: '🏦', color: 'orange' },
  { id: 'mpesa_ke', region: 'East Africa', countryCode: 'KE', countryName: 'Kenya', methodType: 'mobile', providerName: 'M-Pesa', providerCode: 'mpesa_ke', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 50, maxAmount: 500000, depositFeePercentage: 0.5, withdrawalFeePercentage: 0.5, processingTimeMinutes: 1, currency: 'KES', icon: '📱', color: 'green', description: 'Safaricom M-Pesa' },
  { id: 'pesapal_ke', region: 'East Africa', countryCode: 'KE', countryName: 'Kenya', methodType: 'ewallet', providerName: 'Pesapal', providerCode: 'pesapal_ke', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFeePercentage: 2.0, withdrawalFeePercentage: 2.0, processingTimeMinutes: 5, currency: 'KES', icon: '💳', color: 'blue' },

  // Ghana
  { id: 'ecobank_gh', region: 'West Africa', countryCode: 'GH', countryName: 'Ghana', methodType: 'bank', providerName: 'Ecobank Ghana', providerCode: 'ecobank_gh', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFlatFee: 0, withdrawalFlatFee: 50, processingTimeMinutes: 1440, currency: 'GHS', icon: '🏦', color: 'green' },
  { id: 'mtn_momo_gh', region: 'West Africa', countryCode: 'GH', countryName: 'Ghana', methodType: 'mobile', providerName: 'MTN Mobile Money', providerCode: 'mtn_momo_gh', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 500000, depositFeePercentage: 1.0, withdrawalFeePercentage: 1.0, processingTimeMinutes: 5, currency: 'GHS', icon: '📱', color: 'yellow' },

  // South Africa
  { id: 'fnb_za', region: 'Southern Africa', countryCode: 'ZA', countryName: 'South Africa', methodType: 'bank', providerName: 'FNB', providerCode: 'fnb_za', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 2000000, depositFlatFee: 0, withdrawalFlatFee: 50, processingTimeMinutes: 1440, currency: 'ZAR', icon: '🏦', color: 'blue' },
  { id: 'standard_bank_za', region: 'Southern Africa', countryCode: 'ZA', countryName: 'South Africa', methodType: 'bank', providerName: 'Standard Bank', providerCode: 'standard_bank_za', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 2000000, depositFlatFee: 0, withdrawalFlatFee: 50, processingTimeMinutes: 1440, currency: 'ZAR', icon: '🏦', color: 'gold' },

  // India
  { id: 'icici_bank_in', region: 'South Asia', countryCode: 'IN', countryName: 'India', methodType: 'bank', providerName: 'ICICI Bank', providerCode: 'icici_bank_in', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 5000000, depositFlatFee: 0, withdrawalFlatFee: 100, processingTimeMinutes: 1440, currency: 'INR', icon: '🏦', color: 'orange' },
  { id: 'hdfc_bank_in', region: 'South Asia', countryCode: 'IN', countryName: 'India', methodType: 'bank', providerName: 'HDFC Bank', providerCode: 'hdfc_bank_in', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 5000000, depositFlatFee: 0, withdrawalFlatFee: 100, processingTimeMinutes: 1440, currency: 'INR', icon: '🏦', color: 'red' },
  { id: 'paytm_in', region: 'South Asia', countryCode: 'IN', countryName: 'India', methodType: 'ewallet', providerName: 'PayTM', providerCode: 'paytm_in', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFeePercentage: 2.0, withdrawalFeePercentage: 2.0, processingTimeMinutes: 2, currency: 'INR', icon: '💳', color: 'blue', description: 'PayTM wallet' },
  { id: 'gpay_in', region: 'South Asia', countryCode: 'IN', countryName: 'India', methodType: 'ewallet', providerName: 'Google Pay', providerCode: 'gpay_in', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFlatFee: 0, withdrawalFlatFee: 0, processingTimeMinutes: 1, currency: 'INR', icon: '💳', color: 'blue', description: 'Google Pay' },

  // Philippines
  { id: 'bdo_ph', region: 'Southeast Asia', countryCode: 'PH', countryName: 'Philippines', methodType: 'bank', providerName: 'BDO Unibank', providerCode: 'bdo_ph', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 5000000, depositFlatFee: 0, withdrawalFlatFee: 50, processingTimeMinutes: 1440, currency: 'PHP', icon: '🏦', color: 'blue' },
  { id: 'gcash_ph', region: 'Southeast Asia', countryCode: 'PH', countryName: 'Philippines', methodType: 'mobile', providerName: 'GCash', providerCode: 'gcash_ph', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 50, maxAmount: 500000, depositFeePercentage: 1.0, withdrawalFeePercentage: 1.0, processingTimeMinutes: 2, currency: 'PHP', icon: '📱', color: 'blue', description: 'GCash mobile wallet' },
  { id: 'paymaya_ph', region: 'Southeast Asia', countryCode: 'PH', countryName: 'Philippines', methodType: 'ewallet', providerName: 'PayMaya', providerCode: 'paymaya_ph', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 100, maxAmount: 1000000, depositFeePercentage: 2.0, withdrawalFeePercentage: 2.0, processingTimeMinutes: 5, currency: 'PHP', icon: '💳', color: 'red' },

  // Global
  { id: 'stripe_us', region: 'Global', countryCode: 'US', countryName: 'United States', methodType: 'card', providerName: 'Credit/Debit Card (Stripe)', providerCode: 'stripe_us', isDepositEnabled: true, isWithdrawalEnabled: false, minAmount: 100, maxAmount: 5000000, depositFeePercentage: 2.9, depositFlatFee: 0.30, processingTimeMinutes: 5, currency: 'USD', icon: '💳', color: 'blue', description: 'Visa, Mastercard, Amex' },
  { id: 'bitcoin', region: 'Global', countryCode: 'XX', countryName: 'International', methodType: 'crypto', providerName: 'Bitcoin', providerCode: 'btc', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 0.001, maxAmount: 100, processingTimeMinutes: 30, currency: 'BTC', icon: '₿', color: 'orange', description: 'Bitcoin blockchain' },
  { id: 'ethereum', region: 'Global', countryCode: 'XX', countryName: 'International', methodType: 'crypto', providerName: 'Ethereum', providerCode: 'eth', isDepositEnabled: true, isWithdrawalEnabled: true, minAmount: 0.01, maxAmount: 1000, processingTimeMinutes: 30, currency: 'ETH', icon: '⟠', color: 'purple', description: 'Ethereum blockchain' },
];

const REGION_CONFIGS: RegionConfig[] = [
  {
    region: 'West Africa',
    countryCode: 'NG',
    countryName: 'Nigeria',
    currency: 'NGN',
    locale: 'en-NG',
    phonePrefix: '+234',
    banks: PAYMENT_METHODS.filter(m => m.countryCode === 'NG' && m.methodType === 'bank'),
    mobileProviders: PAYMENT_METHODS.filter(m => m.countryCode === 'NG' && m.methodType === 'mobile'),
    ewallets: PAYMENT_METHODS.filter(m => m.countryCode === 'NG' && m.methodType === 'ewallet'),
    cards: PAYMENT_METHODS.filter(m => m.methodType === 'card'),
    crypto: PAYMENT_METHODS.filter(m => m.methodType === 'crypto'),
  },
  {
    region: 'East Africa',
    countryCode: 'KE',
    countryName: 'Kenya',
    currency: 'KES',
    locale: 'en-KE',
    phonePrefix: '+254',
    banks: PAYMENT_METHODS.filter(m => m.countryCode === 'KE' && m.methodType === 'bank'),
    mobileProviders: PAYMENT_METHODS.filter(m => m.countryCode === 'KE' && m.methodType === 'mobile'),
    ewallets: PAYMENT_METHODS.filter(m => m.countryCode === 'KE' && m.methodType === 'ewallet'),
    cards: PAYMENT_METHODS.filter(m => m.methodType === 'card'),
    crypto: PAYMENT_METHODS.filter(m => m.methodType === 'crypto'),
  },
  {
    region: 'West Africa',
    countryCode: 'GH',
    countryName: 'Ghana',
    currency: 'GHS',
    locale: 'en-GH',
    phonePrefix: '+233',
    banks: PAYMENT_METHODS.filter(m => m.countryCode === 'GH' && m.methodType === 'bank'),
    mobileProviders: PAYMENT_METHODS.filter(m => m.countryCode === 'GH' && m.methodType === 'mobile'),
    ewallets: PAYMENT_METHODS.filter(m => m.countryCode === 'GH' && m.methodType === 'ewallet'),
    cards: PAYMENT_METHODS.filter(m => m.methodType === 'card'),
    crypto: PAYMENT_METHODS.filter(m => m.methodType === 'crypto'),
  },
  {
    region: 'Southern Africa',
    countryCode: 'ZA',
    countryName: 'South Africa',
    currency: 'ZAR',
    locale: 'en-ZA',
    phonePrefix: '+27',
    banks: PAYMENT_METHODS.filter(m => m.countryCode === 'ZA' && m.methodType === 'bank'),
    mobileProviders: PAYMENT_METHODS.filter(m => m.countryCode === 'ZA' && m.methodType === 'mobile'),
    ewallets: PAYMENT_METHODS.filter(m => m.countryCode === 'ZA' && m.methodType === 'ewallet'),
    cards: PAYMENT_METHODS.filter(m => m.methodType === 'card'),
    crypto: PAYMENT_METHODS.filter(m => m.methodType === 'crypto'),
  },
  {
    region: 'South Asia',
    countryCode: 'IN',
    countryName: 'India',
    currency: 'INR',
    locale: 'en-IN',
    phonePrefix: '+91',
    banks: PAYMENT_METHODS.filter(m => m.countryCode === 'IN' && m.methodType === 'bank'),
    mobileProviders: PAYMENT_METHODS.filter(m => m.countryCode === 'IN' && m.methodType === 'mobile'),
    ewallets: PAYMENT_METHODS.filter(m => m.countryCode === 'IN' && m.methodType === 'ewallet'),
    cards: PAYMENT_METHODS.filter(m => m.methodType === 'card'),
    crypto: PAYMENT_METHODS.filter(m => m.methodType === 'crypto'),
  },
  {
    region: 'Southeast Asia',
    countryCode: 'PH',
    countryName: 'Philippines',
    currency: 'PHP',
    locale: 'en-PH',
    phonePrefix: '+63',
    banks: PAYMENT_METHODS.filter(m => m.countryCode === 'PH' && m.methodType === 'bank'),
    mobileProviders: PAYMENT_METHODS.filter(m => m.countryCode === 'PH' && m.methodType === 'mobile'),
    ewallets: PAYMENT_METHODS.filter(m => m.countryCode === 'PH' && m.methodType === 'ewallet'),
    cards: PAYMENT_METHODS.filter(m => m.methodType === 'card'),
    crypto: PAYMENT_METHODS.filter(m => m.methodType === 'crypto'),
  },
  {
    region: 'Global',
    countryCode: 'US',
    countryName: 'United States',
    currency: 'USD',
    locale: 'en-US',
    phonePrefix: '+1',
    banks: [],
    mobileProviders: [],
    ewallets: [],
    cards: PAYMENT_METHODS.filter(m => m.methodType === 'card'),
    crypto: PAYMENT_METHODS.filter(m => m.methodType === 'crypto'),
  },
];

export const paymentMethods = {
  getMethodsByCountry: (countryCode: string) => {
    return PAYMENT_METHODS.filter(m => m.countryCode === countryCode || m.countryCode === 'XX');
  },

  getRegionConfig: (countryCode: string): RegionConfig | undefined => {
    return REGION_CONFIGS.find(r => r.countryCode === countryCode);
  },

  getBanksByCountry: (countryCode: string) => {
    return PAYMENT_METHODS.filter(m => m.countryCode === countryCode && m.methodType === 'bank');
  },

  getMobileProvidersByCountry: (countryCode: string) => {
    return PAYMENT_METHODS.filter(m => m.countryCode === countryCode && m.methodType === 'mobile');
  },

  getEwalletsByCountry: (countryCode: string) => {
    return PAYMENT_METHODS.filter(m => m.countryCode === countryCode && m.methodType === 'ewallet');
  },

  getGlobalCards: () => {
    return PAYMENT_METHODS.filter(m => m.methodType === 'card');
  },

  getCryptoMethods: () => {
    return PAYMENT_METHODS.filter(m => m.methodType === 'crypto');
  },

  getAllRegions: () => REGION_CONFIGS,

  calculateDepositFee: (amount: number, method: PaymentMethod): { fee: number; total: number } => {
    let fee = 0;
    if (method.depositFeePercentage) {
      fee += (amount * method.depositFeePercentage) / 100;
    }
    if (method.depositFlatFee) {
      fee += method.depositFlatFee;
    }
    return { fee, total: amount + fee };
  },

  calculateWithdrawalFee: (amount: number, method: PaymentMethod): { fee: number; net: number } => {
    let fee = 0;
    if (method.withdrawalFeePercentage) {
      fee += (amount * method.withdrawalFeePercentage) / 100;
    }
    if (method.withdrawalFlatFee) {
      fee += method.withdrawalFlatFee;
    }
    return { fee, net: amount - fee };
  },
};

export default paymentMethods;
