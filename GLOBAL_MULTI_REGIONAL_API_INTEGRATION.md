# 🌍 GLOBAL MULTI-REGIONAL API INTEGRATION SYSTEM

## 🎯 OVERVIEW: GLOBAL PLATFORM ARCHITECTURE

### Regional Service Distribution:
- 🌍 **Africa**: Flutterwave, MTN MoMo, Smile Identity, Africa's Talking
- 🇺🇸 **North America**: Stripe, PayPal, Plaid, Twilio
- 🇪🇺 **Europe**: Adyen, SEPA, Open Banking, Vonage  
- 🇦🇺 **Asia-Pacific**: Razorpay, Alipay, WeChat Pay, Paymi
- 🇲🇽 **Latin America**: MercadoPago, PagSeguro, Conekta
- 🌐 **Global**: Wise, Coinbase, WorldRemit, Jumio

---

## 🏗️ ARCHITECTURE: REGIONAL SERVICE FACTORY

### 1. **`src/services/globalServiceFactory.ts`** (NEW)
```typescript
import { RegionConfig, PaymentProvider, KYCProvider, SmsProvider } from '../types/global';

export enum SupportedRegions {
  AFRICA = 'africa',
  NORTH_AMERICA = 'north_america', 
  EUROPE = 'europe',
  ASIA_PACIFIC = 'asia_pacific',
  LATIN_AMERICA = 'latin_america',
  MIDDLE_EAST = 'middle_east'
}

export enum SupportedCountries {
  // Africa
  NIGERIA = 'NG', KENYA = 'KE', GHANA = 'GH', SOUTH_AFRICA = 'ZA',
  UGANDA = 'UG', TANZANIA = 'TZ', EGYPT = 'EG', MOROCCO = 'MA',
  
  // North America  
  UNITED_STATES = 'US', CANADA = 'CA', MEXICO = 'MX',
  
  // Europe
  UNITED_KINGDOM = 'GB', GERMANY = 'DE', FRANCE = 'FR', ITALY = 'IT',
  SPAIN = 'ES', NETHERLANDS = 'NL', POLAND = 'PL', SWEDEN = 'SE',
  
  // Asia Pacific
  INDIA = 'IN', CHINA = 'CN', JAPAN = 'JP', AUSTRALIA = 'AU',
  SINGAPORE = 'SG', SOUTH_KOREA = 'KR', THAILAND = 'TH', VIETNAM = 'VN',
  
  // Latin America
  BRAZIL = 'BR', ARGENTINA = 'AR', COLOMBIA = 'CO', CHILE = 'CL',
  PERU = 'PE', VENEZUELA = 'VE',
  
  // Middle East
  UAE = 'AE', SAUDI_ARABIA = 'SA', QATAR = 'QA', KUWAIT = 'KW'
}

export class GlobalServiceFactory {
  private regionConfigs: Map<SupportedRegions, RegionConfig> = new Map();

  constructor() {
    this.initializeRegionalConfigs();
  }

  private initializeRegionalConfigs() {
    // Africa Configuration
    this.regionConfigs.set(SupportedRegions.AFRICA, {
      paymentProviders: [
        {
          id: 'flutterwave',
          name: 'Flutterwave',
          countries: ['NG', 'KE', 'GH', 'ZA', 'UG', 'TZ'],
          methods: ['card', 'bank_transfer', 'mobile_money'],
          currencies: ['NGN', 'KES', 'GHS', 'ZAR', 'UGX', 'TZS'],
          fees: { percentage: 1.4, fixed: 0 },
          limits: { min: 1, max: 1000000 },
          apiConfig: {
            baseUrl: 'https://api.flutterwave.com/v3',
            authType: 'bearer',
            testMode: process.env.NODE_ENV !== 'production'
          }
        },
        {
          id: 'paystack',
          name: 'Paystack', 
          countries: ['NG', 'GH', 'ZA'],
          methods: ['card', 'bank_transfer', 'ussd'],
          currencies: ['NGN', 'GHS', 'ZAR'],
          fees: { percentage: 1.5, fixed: 0 },
          limits: { min: 1, max: 500000 }
        },
        {
          id: 'mtn_momo',
          name: 'MTN Mobile Money',
          countries: ['NG', 'GH', 'UG', 'RW', 'CM'],
          methods: ['mobile_money'],
          currencies: ['NGN', 'GHS', 'UGX', 'RWF', 'XAF'],
          fees: { percentage: 1.5, fixed: 0 }
        }
      ],
      kycProviders: [
        {
          id: 'smile_identity',
          name: 'Smile Identity',
          countries: ['NG', 'KE', 'GH', 'ZA', 'UG'],
          supportedDocuments: ['bvn', 'nin', 'passport', 'voters_card'],
          verificationLevels: [1, 2, 3],
          processingTime: '1-5 minutes'
        },
        {
          id: 'youverify',
          name: 'Youverify',
          countries: ['NG', 'GH', 'KE'],
          supportedDocuments: ['bvn', 'ghana_card', 'national_id'],
          verificationLevels: [1, 2, 3]
        }
      ],
      smsProviders: [
        {
          id: 'africas_talking',
          name: "Africa's Talking",
          countries: ['KE', 'UG', 'TZ', 'RW', 'MW'],
          features: ['sms', 'voice', 'ussd'],
          costPerSms: 0.02
        },
        {
          id: 'termii',
          name: 'Termii',
          countries: ['NG', 'GH', 'KE'],
          features: ['sms', 'voice', 'whatsapp', 'email'],
          costPerSms: 0.025
        }
      ]
    });

    // North America Configuration
    this.regionConfigs.set(SupportedRegions.NORTH_AMERICA, {
      paymentProviders: [
        {
          id: 'stripe',
          name: 'Stripe',
          countries: ['US', 'CA'],
          methods: ['card', 'ach', 'apple_pay', 'google_pay'],
          currencies: ['USD', 'CAD'],
          fees: { percentage: 2.9, fixed: 0.30 },
          limits: { min: 0.50, max: 999999 },
          apiConfig: {
            baseUrl: 'https://api.stripe.com/v1',
            authType: 'bearer',
            testMode: process.env.NODE_ENV !== 'production'
          }
        },
        {
          id: 'paypal',
          name: 'PayPal',
          countries: ['US', 'CA', 'MX'],
          methods: ['paypal', 'card'],
          currencies: ['USD', 'CAD', 'MXN'],
          fees: { percentage: 3.49, fixed: 0.49 }
        },
        {
          id: 'plaid',
          name: 'Plaid',
          countries: ['US', 'CA'],
          methods: ['bank_transfer', 'ach'],
          currencies: ['USD', 'CAD'],
          fees: { percentage: 0.5, fixed: 0 },
          features: ['account_verification', 'balance_check']
        }
      ],
      kycProviders: [
        {
          id: 'jumio',
          name: 'Jumio',
          countries: ['US', 'CA'],
          supportedDocuments: ['drivers_license', 'passport', 'state_id'],
          verificationLevels: [1, 2, 3],
          processingTime: '1-3 minutes',
          features: ['liveness_detection', 'document_verification']
        },
        {
          id: 'onfido',
          name: 'Onfido',
          countries: ['US', 'CA'],
          supportedDocuments: ['drivers_license', 'passport', 'national_id'],
          verificationLevels: [1, 2, 3],
          features: ['facial_recognition', 'document_verification']
        }
      ],
      smsProviders: [
        {
          id: 'twilio',
          name: 'Twilio',
          countries: ['US', 'CA', 'MX'],
          features: ['sms', 'voice', 'whatsapp', 'email'],
          costPerSms: 0.0075
        }
      ]
    });

    // Europe Configuration  
    this.regionConfigs.set(SupportedRegions.EUROPE, {
      paymentProviders: [
        {
          id: 'adyen',
          name: 'Adyen',
          countries: ['GB', 'DE', 'FR', 'IT', 'ES', 'NL'],
          methods: ['card', 'sepa', 'ideal', 'sofort', 'giropay'],
          currencies: ['EUR', 'GBP'],
          fees: { percentage: 2.2, fixed: 0.11 }
        },
        {
          id: 'stripe_eu',
          name: 'Stripe',
          countries: ['GB', 'DE', 'FR', 'IT', 'ES'],
          methods: ['card', 'sepa', 'bancontact', 'eps'],
          currencies: ['EUR', 'GBP'],
          fees: { percentage: 1.4, fixed: 0.25 }
        },
        {
          id: 'open_banking',
          name: 'Open Banking',
          countries: ['GB'],
          methods: ['bank_transfer'],
          currencies: ['GBP'],
          fees: { percentage: 0.1, fixed: 0 }
        }
      ],
      kycProviders: [
        {
          id: 'onfido_eu',
          name: 'Onfido',
          countries: ['GB', 'DE', 'FR', 'IT', 'ES'],
          supportedDocuments: ['passport', 'national_id', 'drivers_license'],
          verificationLevels: [1, 2, 3],
          gdprCompliant: true
        }
      ],
      smsProviders: [
        {
          id: 'vonage',
          name: 'Vonage',
          countries: ['GB', 'DE', 'FR', 'IT', 'ES'],
          features: ['sms', 'voice'],
          costPerSms: 0.05
        }
      ]
    });

    // Asia Pacific Configuration
    this.regionConfigs.set(SupportedRegions.ASIA_PACIFIC, {
      paymentProviders: [
        {
          id: 'razorpay',
          name: 'Razorpay',
          countries: ['IN'],
          methods: ['card', 'netbanking', 'upi', 'wallet'],
          currencies: ['INR'],
          fees: { percentage: 2.0, fixed: 0 }
        },
        {
          id: 'alipay',
          name: 'Alipay',
          countries: ['CN'],
          methods: ['alipay'],
          currencies: ['CNY'],
          fees: { percentage: 0.6, fixed: 0 }
        },
        {
          id: 'paymi',
          name: 'PayMI',
          countries: ['AU'],
          methods: ['bank_transfer', 'bpay'],
          currencies: ['AUD'],
          fees: { percentage: 1.1, fixed: 0.30 }
        }
      ],
      kycProviders: [
        {
          id: 'jumio_apac',
          name: 'Jumio',
          countries: ['IN', 'AU', 'SG', 'JP'],
          supportedDocuments: ['passport', 'national_id', 'aadhaar'],
          verificationLevels: [1, 2, 3]
        }
      ],
      smsProviders: [
        {
          id: 'msg91',
          name: 'MSG91',
          countries: ['IN'],
          features: ['sms', 'voice', 'whatsapp'],
          costPerSms: 0.006
        }
      ]
    });

    // Latin America Configuration
    this.regionConfigs.set(SupportedRegions.LATIN_AMERICA, {
      paymentProviders: [
        {
          id: 'mercadopago',
          name: 'MercadoPago',
          countries: ['BR', 'AR', 'MX', 'CO', 'CL', 'PE'],
          methods: ['card', 'pix', 'boleto', 'oxxo'],
          currencies: ['BRL', 'ARS', 'MXN', 'COP', 'CLP', 'PEN'],
          fees: { percentage: 3.99, fixed: 0 }
        },
        {
          id: 'pagseguro',
          name: 'PagSeguro',
          countries: ['BR'],
          methods: ['card', 'pix', 'boleto'],
          currencies: ['BRL'],
          fees: { percentage: 3.79, fixed: 0 }
        },
        {
          id: 'conekta',
          name: 'Conekta',
          countries: ['MX'],
          methods: ['card', 'oxxo', 'spei'],
          currencies: ['MXN'],
          fees: { percentage: 3.6, fixed: 3.0 }
        }
      ],
      kycProviders: [
        {
          id: 'truora',
          name: 'Truora',
          countries: ['BR', 'MX', 'CO'],
          supportedDocuments: ['cpf', 'rfc', 'cedula'],
          verificationLevels: [1, 2, 3]
        }
      ],
      smsProviders: [
        {
          id: 'zenvia',
          name: 'Zenvia',
          countries: ['BR', 'AR', 'MX'],
          features: ['sms', 'whatsapp'],
          costPerSms: 0.03
        }
      ]
    });
  }

  // Get optimal providers for a country
  getProvidersForCountry(countryCode: string): {
    paymentProviders: PaymentProvider[];
    kycProviders: KYCProvider[];
    smsProviders: SmsProvider[];
  } {
    const region = this.getRegionForCountry(countryCode);
    const config = this.regionConfigs.get(region);

    if (!config) {
      throw new Error(`No configuration found for country: ${countryCode}`);
    }

    return {
      paymentProviders: config.paymentProviders.filter(provider => 
        provider.countries.includes(countryCode)
      ),
      kycProviders: config.kycProviders.filter(provider =>
        provider.countries.includes(countryCode)
      ),
      smsProviders: config.smsProviders.filter(provider =>
        provider.countries.includes(countryCode)
      )
    };
  }

  // Get best payment provider for specific criteria
  getBestPaymentProvider(
    countryCode: string, 
    method: string, 
    currency: string,
    amount?: number
  ): PaymentProvider | null {
    const providers = this.getProvidersForCountry(countryCode).paymentProviders;
    
    return providers
      .filter(provider => 
        provider.methods.includes(method) && 
        provider.currencies.includes(currency) &&
        (!amount || (amount >= provider.limits.min && amount <= provider.limits.max))
      )
      .sort((a, b) => {
        // Sort by fees (lowest first)
        const feeA = a.fees.percentage + (a.fees.fixed || 0);
        const feeB = b.fees.percentage + (b.fees.fixed || 0);
        return feeA - feeB;
      })[0] || null;
  }

  // Get region for country
  private getRegionForCountry(countryCode: string): SupportedRegions {
    const countryToRegion: Record<string, SupportedRegions> = {
      // Africa
      'NG': SupportedRegions.AFRICA, 'KE': SupportedRegions.AFRICA,
      'GH': SupportedRegions.AFRICA, 'ZA': SupportedRegions.AFRICA,
      'UG': SupportedRegions.AFRICA, 'TZ': SupportedRegions.AFRICA,
      'EG': SupportedRegions.AFRICA, 'MA': SupportedRegions.AFRICA,
      
      // North America
      'US': SupportedRegions.NORTH_AMERICA, 'CA': SupportedRegions.NORTH_AMERICA,
      'MX': SupportedRegions.NORTH_AMERICA,
      
      // Europe
      'GB': SupportedRegions.EUROPE, 'DE': SupportedRegions.EUROPE,
      'FR': SupportedRegions.EUROPE, 'IT': SupportedRegions.EUROPE,
      'ES': SupportedRegions.EUROPE, 'NL': SupportedRegions.EUROPE,
      
      // Asia Pacific
      'IN': SupportedRegions.ASIA_PACIFIC, 'CN': SupportedRegions.ASIA_PACIFIC,
      'JP': SupportedRegions.ASIA_PACIFIC, 'AU': SupportedRegions.ASIA_PACIFIC,
      'SG': SupportedRegions.ASIA_PACIFIC,
      
      // Latin America
      'BR': SupportedRegions.LATIN_AMERICA, 'AR': SupportedRegions.LATIN_AMERICA,
      'CO': SupportedRegions.LATIN_AMERICA, 'CL': SupportedRegions.LATIN_AMERICA,
      'PE': SupportedRegions.LATIN_AMERICA
    };

    return countryToRegion[countryCode] || SupportedRegions.AFRICA; // Default fallback
  }

  // Get all supported countries
  getSupportedCountries(): string[] {
    const countries = new Set<string>();
    this.regionConfigs.forEach(config => {
      config.paymentProviders.forEach(provider => {
        provider.countries.forEach(country => countries.add(country));
      });
    });
    return Array.from(countries);
  }

  // Check if country is supported
  isCountrySupported(countryCode: string): boolean {
    return this.getSupportedCountries().includes(countryCode);
  }
}

export const globalServiceFactory = new GlobalServiceFactory();
```

---

## 💳 UNIFIED PAYMENT SERVICE

### 2. **`src/services/unifiedPaymentService.ts`** (NEW)
```typescript
import { globalServiceFactory } from './globalServiceFactory';
import { detectUserCountry } from '../utils/geolocation';

export interface UniversalPaymentRequest {
  amount: number;
  currency: string;
  method: 'card' | 'bank_transfer' | 'mobile_money' | 'digital_wallet';
  userCountry?: string;
  preferredProvider?: string;
  customerData: {
    email: string;
    phone?: string;
    name: string;
  };
  metadata?: any;
}

export class UnifiedPaymentService {
  async processPayment(request: UniversalPaymentRequest) {
    const userCountry = request.userCountry || await detectUserCountry();
    
    // Get optimal payment provider
    const provider = globalServiceFactory.getBestPaymentProvider(
      userCountry,
      request.method,
      request.currency,
      request.amount
    );

    if (!provider) {
      throw new Error(`No payment provider available for ${userCountry} with method ${request.method}`);
    }

    // Route to appropriate service
    switch (provider.id) {
      case 'stripe':
      case 'stripe_eu':
        return this.processStripePayment(request, provider);
      
      case 'flutterwave':
        return this.processFlutterwavePayment(request, provider);
      
      case 'paypal':
        return this.processPayPalPayment(request, provider);
      
      case 'adyen':
        return this.processAdyenPayment(request, provider);
      
      case 'razorpay':
        return this.processRazorpayPayment(request, provider);
      
      case 'mercadopago':
        return this.processMercadoPagoPayment(request, provider);
      
      default:
        throw new Error(`Payment provider ${provider.id} not implemented`);
    }
  }

  private async processStripePayment(request: UniversalPaymentRequest, provider: any) {
    const Stripe = await import('stripe');
    const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100), // Convert to cents
      currency: request.currency.toLowerCase(),
      payment_method_types: ['card'],
      metadata: request.metadata
    });

    return {
      success: true,
      provider: 'stripe',
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    };
  }

  private async processFlutterwavePayment(request: UniversalPaymentRequest, provider: any) {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: `TX-${Date.now()}`,
        amount: request.amount,
        currency: request.currency,
        payment_options: request.method,
        customer: request.customerData,
        redirect_url: process.env.FRONTEND_URL + '/payment/callback'
      })
    });

    const data = await response.json();
    return {
      success: true,
      provider: 'flutterwave',
      paymentUrl: data.data.link,
      paymentId: data.data.id
    };
  }

  private async processPayPalPayment(request: UniversalPaymentRequest, provider: any) {
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getPayPalAccessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: request.currency,
            value: request.amount.toFixed(2)
          }
        }],
        application_context: {
          return_url: process.env.FRONTEND_URL + '/payment/success',
          cancel_url: process.env.FRONTEND_URL + '/payment/cancel'
        }
      })
    });

    const data = await response.json();
    return {
      success: true,
      provider: 'paypal',
      paymentUrl: data.links.find(link => link.rel === 'approve').href,
      paymentId: data.id
    };
  }

  private async processRazorpayPayment(request: UniversalPaymentRequest, provider: any) {
    const Razorpay = await import('razorpay');
    const razorpay = new Razorpay.default({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await razorpay.orders.create({
      amount: Math.round(request.amount * 100), // Convert to paise
      currency: request.currency,
      receipt: `receipt_${Date.now()}`
    });

    return {
      success: true,
      provider: 'razorpay',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    };
  }

  private async processMercadoPagoPayment(request: UniversalPaymentRequest, provider: any) {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{
          title: 'Eloity Payment',
          quantity: 1,
          unit_price: request.amount
        }],
        payer: {
          email: request.customerData.email
        },
        back_urls: {
          success: process.env.FRONTEND_URL + '/payment/success',
          failure: process.env.FRONTEND_URL + '/payment/failure',
          pending: process.env.FRONTEND_URL + '/payment/pending'
        }
      })
    });

    const data = await response.json();
    return {
      success: true,
      provider: 'mercadopago',
      paymentUrl: data.init_point,
      preferenceId: data.id
    };
  }

  private async getPayPalAccessToken(): Promise<string> {
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
  }

  // Get available payment methods for user's country
  async getAvailablePaymentMethods(countryCode?: string): Promise<any[]> {
    const userCountry = countryCode || await detectUserCountry();
    const providers = globalServiceFactory.getProvidersForCountry(userCountry);
    
    const methods = new Set<string>();
    providers.paymentProviders.forEach(provider => {
      provider.methods.forEach(method => methods.add(method));
    });

    return Array.from(methods).map(method => ({
      id: method,
      name: this.getMethodDisplayName(method),
      icon: this.getMethodIcon(method),
      providers: providers.paymentProviders.filter(p => p.methods.includes(method))
    }));
  }

  private getMethodDisplayName(method: string): string {
    const names = {
      'card': 'Credit/Debit Card',
      'bank_transfer': 'Bank Transfer',
      'mobile_money': 'Mobile Money',
      'digital_wallet': 'Digital Wallet',
      'paypal': 'PayPal',
      'apple_pay': 'Apple Pay',
      'google_pay': 'Google Pay',
      'sepa': 'SEPA Direct Debit',
      'ideal': 'iDEAL',
      'sofort': 'Sofort',
      'pix': 'PIX',
      'boleto': 'Boleto',
      'oxxo': 'OXXO',
      'upi': 'UPI',
      'alipay': 'Alipay',
      'wechat_pay': 'WeChat Pay'
    };
    return names[method] || method.replace('_', ' ').toUpperCase();
  }

  private getMethodIcon(method: string): string {
    const icons = {
      'card': 'CreditCard',
      'bank_transfer': 'Building',
      'mobile_money': 'Smartphone',
      'digital_wallet': 'Wallet',
      'paypal': 'PayPal',
      'apple_pay': 'Apple',
      'google_pay': 'Google'
    };
    return icons[method] || 'CreditCard';
  }
}

export const unifiedPaymentService = new UnifiedPaymentService();
```

---

## 🆔 GLOBAL KYC SERVICE

### 3. **`src/services/globalKycService.ts`** (NEW)
```typescript
import { globalServiceFactory } from './globalServiceFactory';
import { detectUserCountry } from '../utils/geolocation';

export interface GlobalKYCRequest {
  userCountry: string;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  frontImage?: string; // Base64 or file URL
  backImage?: string;
  selfieImage?: string;
}

export class GlobalKYCService {
  async verifyIdentity(request: GlobalKYCRequest) {
    const providers = globalServiceFactory.getProvidersForCountry(request.userCountry).kycProviders;
    
    if (providers.length === 0) {
      throw new Error(`No KYC providers available for ${request.userCountry}`);
    }

    // Use the first available provider (can be made smarter)
    const provider = providers[0];

    switch (provider.id) {
      case 'smile_identity':
        return this.verifyWithSmileIdentity(request);
      
      case 'youverify':
        return this.verifyWithYouverify(request);
      
      case 'jumio':
      case 'jumio_apac':
        return this.verifyWithJumio(request);
      
      case 'onfido':
      case 'onfido_eu':
        return this.verifyWithOnfido(request);
      
      case 'truora':
        return this.verifyWithTruora(request);
      
      default:
        throw new Error(`KYC provider ${provider.id} not implemented`);
    }
  }

  private async verifyWithSmileIdentity(request: GlobalKYCRequest) {
    const response = await fetch('https://3eydmgh10d.execute-api.us-west-2.amazonaws.com/test/identity_verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partner_id: process.env.SMILE_IDENTITY_PARTNER_ID,
        job_id: `job_${Date.now()}`,
        job_type: 4,
        country: request.userCountry,
        id_type: request.documentType.toUpperCase(),
        id_number: request.documentNumber,
        first_name: request.firstName,
        last_name: request.lastName,
        phone_number: request.phoneNumber
      })
    });

    const data = await response.json();
    return {
      provider: 'smile_identity',
      verified: data.ResultCode === '1012',
      confidence: data.ConfidenceValue,
      details: data
    };
  }

  private async verifyWithJumio(request: GlobalKYCRequest) {
    const response = await fetch('https://api.jumio.com/api/v4/identityverification/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.JUMIO_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerInternalReference: `user_${Date.now()}`,
        workflowId: process.env.JUMIO_WORKFLOW_ID,
        userReference: request.firstName + '_' + request.lastName
      })
    });

    const data = await response.json();
    return {
      provider: 'jumio',
      transactionId: data.transactionReference,
      redirectUrl: data.redirectUrl,
      verified: false // Will be updated via webhook
    };
  }

  private async verifyWithOnfido(request: GlobalKYCRequest) {
    const response = await fetch('https://api.onfido.com/v3/checks', {
      method: 'POST',
      headers: {
        'Authorization': `Token token=${process.env.ONFIDO_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        applicant_id: request.documentNumber, // Should be pre-created applicant
        report_names: ['document', 'facial_similarity_photo'],
        document_ids: [request.frontImage], // Pre-uploaded document ID
        applicant_provides_data: true
      })
    });

    const data = await response.json();
    return {
      provider: 'onfido',
      checkId: data.id,
      status: data.status,
      verified: data.status === 'complete'
    };
  }

  private async verifyWithYouverify(request: GlobalKYCRequest) {
    let endpoint = '';
    
    // Route to specific verification endpoint based on document type
    switch (request.documentType.toLowerCase()) {
      case 'bvn':
        endpoint = 'identity/ng/bvn';
        break;
      case 'ghana_card':
        endpoint = 'identity/gh/ghana-card';
        break;
      default:
        endpoint = 'identity/ng/nin';
    }

    const response = await fetch(`https://api.youverify.co/v2/${endpoint}`, {
      method: 'POST',
      headers: {
        'Token': process.env.YOUVERIFY_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: request.documentNumber,
        isSubjectConsent: true,
        firstName: request.firstName,
        lastName: request.lastName,
        phone: request.phoneNumber
      })
    });

    const data = await response.json();
    return {
      provider: 'youverify',
      verified: data.success,
      details: data.data
    };
  }

  private async verifyWithTruora(request: GlobalKYCRequest) {
    const response = await fetch('https://api.truora.com/v1/validations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TRUORA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'person',
        user_authorized: true,
        account_id: process.env.TRUORA_ACCOUNT_ID,
        country: request.userCountry,
        person: {
          first_name: request.firstName,
          last_name: request.lastName,
          document_type: request.documentType,
          document_number: request.documentNumber
        }
      })
    });

    const data = await response.json();
    return {
      provider: 'truora',
      validationId: data.validation_id,
      verified: data.score > 0.8 // Truora uses score-based verification
    };
  }

  // Get available document types for country
  async getDocumentTypes(countryCode: string): Promise<string[]> {
    const providers = globalServiceFactory.getProvidersForCountry(countryCode).kycProviders;
    
    const documentTypes = new Set<string>();
    providers.forEach(provider => {
      provider.supportedDocuments.forEach(doc => documentTypes.add(doc));
    });

    return Array.from(documentTypes);
  }

  // Get KYC requirements for country
  async getKYCRequirements(countryCode: string) {
    const providers = globalServiceFactory.getProvidersForCountry(countryCode).kycProviders;
    
    return {
      country: countryCode,
      availableProviders: providers.length,
      supportedDocuments: this.getDocumentTypes(countryCode),
      verificationLevels: providers[0]?.verificationLevels || [1, 2, 3],
      processingTime: providers[0]?.processingTime || '1-5 minutes',
      requirements: this.getCountrySpecificRequirements(countryCode)
    };
  }

  private async getCountrySpecificRequirements(countryCode: string): Promise<string[]> {
    const requirements = {
      'NG': ['BVN or NIN', 'Phone number verification', 'Address proof'],
      'KE': ['National ID', 'Phone number verification'],
      'GH': ['Ghana Card', 'Phone number verification'],
      'US': ['Social Security Number', 'Government-issued ID', 'Address verification'],
      'GB': ['National Insurance Number', 'Passport or Driving License'],
      'IN': ['Aadhaar or PAN Card', 'Phone number verification'],
      'BR': ['CPF', 'RG or CNH', 'Address proof']
    };

    return requirements[countryCode] || ['Government-issued ID', 'Phone verification'];
  }
}

export const globalKycService = new GlobalKYCService();
```

---

## 📱 GLOBAL SMS/COMMUNICATION SERVICE

### 4. **`src/services/globalSmsService.ts`** (NEW)
```typescript
import { globalServiceFactory } from './globalServiceFactory';

export class GlobalSmsService {
  async sendOTP(phoneNumber: string, otp: string, countryCode?: string): Promise<any> {
    const userCountry = countryCode || this.detectCountryFromPhone(phoneNumber);
    const providers = globalServiceFactory.getProvidersForCountry(userCountry).smsProviders;
    
    if (providers.length === 0) {
      throw new Error(`No SMS providers available for ${userCountry}`);
    }

    const provider = this.selectBestProvider(providers, phoneNumber);

    switch (provider.id) {
      case 'twilio':
        return this.sendViaTwilio(phoneNumber, `Your Eloity verification code is: ${otp}`);
      
      case 'africas_talking':
        return this.sendViaAfricasTalking(phoneNumber, otp);
      
      case 'termii':
        return this.sendViaTermii(phoneNumber, otp);
      
      case 'vonage':
        return this.sendViaVonage(phoneNumber, `Your verification code: ${otp}`);
      
      case 'msg91':
        return this.sendViaMsg91(phoneNumber, otp);
      
      case 'zenvia':
        return this.sendViaZenvia(phoneNumber, otp);
      
      default:
        throw new Error(`SMS provider ${provider.id} not implemented`);
    }
  }

  private async sendViaTwilio(phoneNumber: string, message: string) {
    const twilio = await import('twilio');
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    return {
      success: true,
      provider: 'twilio',
      messageId: result.sid,
      status: result.status
    };
  }

  private async sendViaAfricasTalking(phoneNumber: string, otp: string) {
    const AfricasTalking = await import('africas-talking');
    const africasTalking = AfricasTalking.default({
      apiKey: process.env.AFRICAS_TALKING_API_KEY,
      username: process.env.AFRICAS_TALKING_USERNAME
    });

    const sms = africasTalking.SMS;
    const result = await sms.send({
      to: phoneNumber,
      message: `Your Eloity verification code is: ${otp}. Valid for 10 minutes.`,
      from: 'SOFTCHAT'
    });

    return {
      success: result.SMSMessageData.Recipients[0].status === 'Success',
      provider: 'africas_talking',
      messageId: result.SMSMessageData.Recipients[0].messageId,
      cost: result.SMSMessageData.Recipients[0].cost
    };
  }

  private async sendViaTermii(phoneNumber: string, otp: string) {
    const response = await fetch('https://api.ng.termii.com/api/sms/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TERMII_API_KEY,
        message_type: 'NUMERIC',
        to: phoneNumber,
        from: 'Eloity',
        channel: 'sms',
        pin_attempts: 3,
        pin_time_to_live: 10,
        pin_length: 6,
        pin_placeholder: '< 1234 >',
        message_text: 'Your Eloity verification code is < 1234 >. Valid for 10 minutes.',
        pin_type: 'NUMERIC'
      })
    });

    const data = await response.json();
    return {
      success: data.status === 'success',
      provider: 'termii',
      pinId: data.pinId,
      details: data
    };
  }

  private detectCountryFromPhone(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Country code mapping
    const countryMappings = {
      '1': 'US',     // US/Canada
      '44': 'GB',    // UK
      '49': 'DE',    // Germany
      '33': 'FR',    // France
      '91': 'IN',    // India
      '86': 'CN',    // China
      '81': 'JP',    // Japan
      '55': 'BR',    // Brazil
      '234': 'NG',   // Nigeria
      '254': 'KE',   // Kenya
      '233': 'GH',   // Ghana
      '27': 'ZA',    // South Africa
      '256': 'UG',   // Uganda
      '255': 'TZ'    // Tanzania
    };

    for (const [code, country] of Object.entries(countryMappings)) {
      if (cleaned.startsWith(code)) {
        return country;
      }
    }

    return 'US'; // Default fallback
  }

  private selectBestProvider(providers: any[], phoneNumber: string): any {
    // Select provider based on cost and reliability
    return providers.sort((a, b) => a.costPerSms - b.costPerSms)[0];
  }
}

export const globalSmsService = new GlobalSmsService();
```

---

## 🌐 ENVIRONMENT VARIABLES

### **`.env` - Global Services Configuration**
```bash
# Global Feature Flags
ENABLE_GLOBAL_PAYMENTS=true
ENABLE_REGIONAL_KYC=true
ENABLE_MULTI_CURRENCY=true

# North America - Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# North America - PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_BASE_URL=https://api.sandbox.paypal.com

# North America - Plaid
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox

# Europe - Adyen
ADYEN_API_KEY=your_adyen_api_key
ADYEN_MERCHANT_ACCOUNT=your_merchant_account

# Asia Pacific - Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Latin America - MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_token

# Africa - Flutterwave & Paystack
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx

# Africa - Mobile Money
MTN_MOMO_SUBSCRIPTION_KEY=xxx
MTN_MOMO_API_KEY=xxx

# Global KYC - Jumio
JUMIO_API_TOKEN=your_jumio_token
JUMIO_WORKFLOW_ID=your_workflow_id

# Global KYC - Onfido
ONFIDO_API_TOKEN=your_onfido_token

# Africa KYC - Smile Identity
SMILE_IDENTITY_PARTNER_ID=xxx
SMILE_IDENTITY_API_KEY=xxx

# Africa KYC - Youverify
YOUVERIFY_TOKEN=xxx

# Latin America KYC - Truora
TRUORA_API_KEY=xxx
TRUORA_ACCOUNT_ID=xxx

# Global SMS - Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Africa SMS - Africa's Talking
AFRICAS_TALKING_API_KEY=xxx
AFRICAS_TALKING_USERNAME=xxx

# Africa SMS - Termii
TERMII_API_KEY=xxx

# Europe SMS - Vonage
VONAGE_API_KEY=xxx
VONAGE_API_SECRET=xxx

# India SMS - MSG91
MSG91_AUTH_KEY=xxx

# LatAm SMS - Zenvia
ZENVIA_API_TOKEN=xxx
```

---

## 🔧 INTEGRATION INTO EXISTING FILES

### Update `src/lib/api.ts`
```typescript
// ADD these methods to ApiClient class:

// Global payment methods
async initializeGlobalPayment(paymentData: UniversalPaymentRequest) {
  return this.request("/payments/global/initialize", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}

async getAvailablePaymentMethods(countryCode?: string) {
  const query = countryCode ? `?country=${countryCode}` : '';
  return this.request(`/payments/methods${query}`);
}

// Global KYC methods
async submitGlobalKYC(kycData: GlobalKYCRequest) {
  return this.request("/kyc/global/verify", {
    method: "POST",
    body: JSON.stringify(kycData),
  });
}

async getKYCRequirements(countryCode: string) {
  return this.request(`/kyc/requirements/${countryCode}`);
}

// Global SMS methods
async sendGlobalOTP(phoneNumber: string, countryCode?: string) {
  return this.request("/sms/global/otp", {
    method: "POST",
    body: JSON.stringify({ phoneNumber, countryCode }),
  });
}
```

---

## 🎯 USAGE EXAMPLES

### Payment Processing
```typescript
// Automatically detect best payment method for user
const paymentRequest = {
  amount: 100,
  currency: 'USD',
  method: 'card',
  customerData: {
    email: 'user@example.com',
    name: 'John Doe'
  }
};

const result = await unifiedPaymentService.processPayment(paymentRequest);
// Will use Stripe for US users, Flutterwave for Nigerian users, etc.
```

### KYC Verification
```typescript
// Automatically route to appropriate KYC provider
const kycRequest = {
  userCountry: 'NG',
  documentType: 'bvn',
  documentNumber: '12345678901',
  firstName: 'John',
  lastName: 'Doe'
};

const verification = await globalKycService.verifyIdentity(kycRequest);
// Will use Smile Identity for Nigeria, Jumio for US, etc.
```

This global system automatically routes users to the best regional services based on their location, ensuring optimal conversion rates and user experience worldwide! 🌍
