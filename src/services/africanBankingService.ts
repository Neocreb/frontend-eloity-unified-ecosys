// @ts-nocheck
export interface Bank {
  id: string;
  name: string;
  code: string;
  country: string;
  logo?: string;
  type: 'commercial' | 'digital' | 'mobile_money' | 'microfinance';
  transferTypes: string[];
  fees: {
    domestic: number;
    international: number;
    instant: number;
  };
  currency: string;
  processingTime: {
    domestic: string;
    international: string;
    instant: string;
  };
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  dialCode: string;
  flag: string;
  region: string;
  banks: Bank[];
  mobileMoney: Bank[];
}

export const africanCountries: Country[] = [
  {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    dialCode: '+234',
    flag: '🇳🇬',
    region: 'West Africa',
    banks: [
      {
        id: 'gtbank-ng',
        name: 'Guaranty Trust Bank',
        code: '058',
        country: 'Nigeria',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 50, international: 2500, instant: 100 },
        currency: 'NGN',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'zenith-ng',
        name: 'Zenith Bank',
        code: '057',
        country: 'Nigeria',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 50, international: 2500, instant: 100 },
        currency: 'NGN',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'access-ng',
        name: 'Access Bank',
        code: '044',
        country: 'Nigeria',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 50, international: 2500, instant: 100 },
        currency: 'NGN',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'firstbank-ng',
        name: 'First Bank of Nigeria',
        code: '011',
        country: 'Nigeria',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 50, international: 2500, instant: 100 },
        currency: 'NGN',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'uba-ng',
        name: 'United Bank for Africa',
        code: '033',
        country: 'Nigeria',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 50, international: 2500, instant: 100 },
        currency: 'NGN',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'kuda-ng',
        name: 'Kuda Bank',
        code: '090267',
        country: 'Nigeria',
        type: 'digital',
        transferTypes: ['domestic', 'instant'],
        fees: { domestic: 0, international: 2000, instant: 0 },
        currency: 'NGN',
        processingTime: { domestic: 'Instant', international: '1-2 days', instant: 'Instant' }
      },
      {
        id: 'opay-ng',
        name: 'OPay',
        code: '999992',
        country: 'Nigeria',
        type: 'digital',
        transferTypes: ['domestic', 'instant'],
        fees: { domestic: 0, international: 1500, instant: 0 },
        currency: 'NGN',
        processingTime: { domestic: 'Instant', international: '1-2 days', instant: 'Instant' }
      }
    ],
    mobileMoney: [
      {
        id: 'mtn-momo-ng',
        name: 'MTN MoMo',
        code: 'MTN',
        country: 'Nigeria',
        type: 'mobile_money',
        transferTypes: ['domestic', 'instant'],
        fees: { domestic: 10, international: 500, instant: 15 },
        currency: 'NGN',
        processingTime: { domestic: 'Instant', international: '1 hour', instant: 'Instant' }
      }
    ]
  },
  {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    dialCode: '+254',
    flag: '🇰🇪',
    region: 'East Africa',
    banks: [
      {
        id: 'kcb-ke',
        name: 'Kenya Commercial Bank',
        code: '01',
        country: 'Kenya',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 30, international: 1500, instant: 50 },
        currency: 'KES',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'equity-ke',
        name: 'Equity Bank',
        code: '68',
        country: 'Kenya',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 30, international: 1500, instant: 50 },
        currency: 'KES',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'coop-ke',
        name: 'Co-operative Bank',
        code: '11',
        country: 'Kenya',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 30, international: 1500, instant: 50 },
        currency: 'KES',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      }
    ],
    mobileMoney: [
      {
        id: 'mpesa-ke',
        name: 'M-Pesa',
        code: 'MPESA',
        country: 'Kenya',
        type: 'mobile_money',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 5, international: 300, instant: 10 },
        currency: 'KES',
        processingTime: { domestic: 'Instant', international: '30 minutes', instant: 'Instant' }
      },
      {
        id: 'airtel-money-ke',
        name: 'Airtel Money',
        code: 'AIRTEL',
        country: 'Kenya',
        type: 'mobile_money',
        transferTypes: ['domestic', 'instant'],
        fees: { domestic: 5, international: 200, instant: 8 },
        currency: 'KES',
        processingTime: { domestic: 'Instant', international: '1 hour', instant: 'Instant' }
      }
    ]
  },
  {
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    dialCode: '+27',
    flag: '🇿🇦',
    region: 'Southern Africa',
    banks: [
      {
        id: 'standard-za',
        name: 'Standard Bank',
        code: '051001',
        country: 'South Africa',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 15, international: 500, instant: 25 },
        currency: 'ZAR',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'fnb-za',
        name: 'First National Bank',
        code: '250655',
        country: 'South Africa',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 15, international: 500, instant: 25 },
        currency: 'ZAR',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'capitec-za',
        name: 'Capitec Bank',
        code: '470010',
        country: 'South Africa',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 10, international: 450, instant: 20 },
        currency: 'ZAR',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'tymebank-za',
        name: 'TymeBank',
        code: '678910',
        country: 'South Africa',
        type: 'digital',
        transferTypes: ['domestic', 'instant'],
        fees: { domestic: 0, international: 350, instant: 0 },
        currency: 'ZAR',
        processingTime: { domestic: 'Instant', international: '1-2 days', instant: 'Instant' }
      }
    ],
    mobileMoney: []
  },
  {
    code: 'GH',
    name: 'Ghana',
    currency: 'GHS',
    dialCode: '+233',
    flag: '🇬🇭',
    region: 'West Africa',
    banks: [
      {
        id: 'gcb-gh',
        name: 'GCB Bank',
        code: '040',
        country: 'Ghana',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 5, international: 150, instant: 10 },
        currency: 'GHS',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'ecobank-gh',
        name: 'Ecobank Ghana',
        code: '130',
        country: 'Ghana',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 5, international: 150, instant: 10 },
        currency: 'GHS',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      }
    ],
    mobileMoney: [
      {
        id: 'mtn-momo-gh',
        name: 'MTN Mobile Money',
        code: 'MTN',
        country: 'Ghana',
        type: 'mobile_money',
        transferTypes: ['domestic', 'instant'],
        fees: { domestic: 2, international: 50, instant: 3 },
        currency: 'GHS',
        processingTime: { domestic: 'Instant', international: '1 hour', instant: 'Instant' }
      },
      {
        id: 'vodafone-cash-gh',
        name: 'Vodafone Cash',
        code: 'VODAFONE',
        country: 'Ghana',
        type: 'mobile_money',
        transferTypes: ['domestic', 'instant'],
        fees: { domestic: 2, international: 50, instant: 3 },
        currency: 'GHS',
        processingTime: { domestic: 'Instant', international: '1 hour', instant: 'Instant' }
      }
    ]
  },
  {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    dialCode: '+256',
    flag: '🇺🇬',
    region: 'East Africa',
    banks: [
      {
        id: 'stanbic-ug',
        name: 'Stanbic Bank Uganda',
        code: '031',
        country: 'Uganda',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 2000, international: 50000, instant: 5000 },
        currency: 'UGX',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      }
    ],
    mobileMoney: [
      {
        id: 'mtn-momo-ug',
        name: 'MTN Mobile Money',
        code: 'MTN',
        country: 'Uganda',
        type: 'mobile_money',
        transferTypes: ['domestic', 'instant'],
        fees: { domestic: 500, international: 10000, instant: 800 },
        currency: 'UGX',
        processingTime: { domestic: 'Instant', international: '1 hour', instant: 'Instant' }
      },
      {
        id: 'airtel-money-ug',
        name: 'Airtel Money',
        code: 'AIRTEL',
        country: 'Uganda',
        type: 'mobile_money',
        transferTypes: ['domestic', 'instant'],
        fees: { domestic: 500, international: 10000, instant: 800 },
        currency: 'UGX',
        processingTime: { domestic: 'Instant', international: '1 hour', instant: 'Instant' }
      }
    ]
  },
  {
    code: 'EG',
    name: 'Egypt',
    currency: 'EGP',
    dialCode: '+20',
    flag: '🇪🇬',
    region: 'North Africa',
    banks: [
      {
        id: 'nbe-eg',
        name: 'National Bank of Egypt',
        code: '003',
        country: 'Egypt',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 25, international: 400, instant: 50 },
        currency: 'EGP',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      },
      {
        id: 'cib-eg',
        name: 'Commercial International Bank',
        code: '030',
        country: 'Egypt',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 25, international: 400, instant: 50 },
        currency: 'EGP',
        processingTime: { domestic: '2-24 hours', international: '1-3 days', instant: 'Instant' }
      }
    ],
    mobileMoney: []
  }
];

// Additional countries for broader coverage
export const globalCountries: Country[] = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    dialCode: '+1',
    flag: '🇺🇸',
    region: 'North America',
    banks: [
      {
        id: 'chase-us',
        name: 'Chase Bank',
        code: '021000021',
        country: 'United States',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 3, international: 45, instant: 15 },
        currency: 'USD',
        processingTime: { domestic: '1-2 days', international: '3-5 days', instant: 'Instant' }
      },
      {
        id: 'boa-us',
        name: 'Bank of America',
        code: '026009593',
        country: 'United States',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 3, international: 45, instant: 15 },
        currency: 'USD',
        processingTime: { domestic: '1-2 days', international: '3-5 days', instant: 'Instant' }
      }
    ],
    mobileMoney: []
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    dialCode: '+44',
    flag: '🇬🇧',
    region: 'Europe',
    banks: [
      {
        id: 'hsbc-gb',
        name: 'HSBC Bank',
        code: '400000',
        country: 'United Kingdom',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 0, international: 25, instant: 5 },
        currency: 'GBP',
        processingTime: { domestic: '2 hours', international: '1-2 days', instant: 'Instant' }
      },
      {
        id: 'barclays-gb',
        name: 'Barclays Bank',
        code: '200000',
        country: 'United Kingdom',
        type: 'commercial',
        transferTypes: ['domestic', 'international', 'instant'],
        fees: { domestic: 0, international: 25, instant: 5 },
        currency: 'GBP',
        processingTime: { domestic: '2 hours', international: '1-2 days', instant: 'Instant' }
      }
    ],
    mobileMoney: []
  }
];

export class AfricanBankingService {
  private allCountries: Country[];

  constructor() {
    this.allCountries = [...africanCountries, ...globalCountries];
  }

  // Get all countries
  getAllCountries(): Country[] {
    return this.allCountries;
  }

  // Get African countries only
  getAfricanCountries(): Country[] {
    return africanCountries;
  }

  // Get country by code
  getCountryByCode(code: string): Country | undefined {
    return this.allCountries.find(country => country.code === code);
  }

  // Get banks by country
  getBanksByCountry(countryCode: string): Bank[] {
    const country = this.getCountryByCode(countryCode);
    return country ? [...country.banks, ...country.mobileMoney] : [];
  }

  // Get bank by ID
  getBankById(bankId: string): Bank | undefined {
    for (const country of this.allCountries) {
      const bank = [...country.banks, ...country.mobileMoney].find(bank => bank.id === bankId);
      if (bank) return bank;
    }
    return undefined;
  }

  // Validate account number format
  validateAccountNumber(accountNumber: string, bankCode: string): boolean {
    // Nigerian banks typically use 10 digits
    if (bankCode.length === 3) {
      return /^\d{10}$/.test(accountNumber);
    }
    // Other formats can be added as needed
    return /^\d{8,20}$/.test(accountNumber);
  }

  // Calculate transfer fee
  calculateTransferFee(amount: number, bank: Bank, transferType: 'domestic' | 'international' | 'instant'): number {
    const baseFee = bank.fees[transferType];
    // Some banks may have percentage-based fees for larger amounts
    if (amount > 1000000) { // Large transfers
      return Math.max(baseFee, amount * 0.001); // 0.1% for large transfers
    }
    return baseFee;
  }

  // Get popular banks for quick selection
  getPopularBanks(countryCode?: string): Bank[] {
    if (countryCode) {
      const country = this.getCountryByCode(countryCode);
      if (!country) return [];
      
      // Return top 3 banks for the country
      return [...country.banks, ...country.mobileMoney]
        .sort((a, b) => a.type === 'digital' ? -1 : 1)
        .slice(0, 3);
    }

    // Return popular African banks
    const popularBankIds = [
      'gtbank-ng', 'kuda-ng', 'mpesa-ke', 'standard-za', 'tymebank-za',
      'mtn-momo-gh', 'opay-ng', 'equity-ke', 'fnb-za'
    ];

    return popularBankIds
      .map(id => this.getBankById(id))
      .filter((bank): bank is Bank => bank !== undefined);
  }

  // Search banks
  searchBanks(query: string, countryCode?: string): Bank[] {
    let banks: Bank[] = [];
    
    if (countryCode) {
      banks = this.getBanksByCountry(countryCode);
    } else {
      banks = this.allCountries.flatMap(country => [...country.banks, ...country.mobileMoney]);
    }

    return banks.filter(bank => 
      bank.name.toLowerCase().includes(query.toLowerCase()) ||
      bank.code.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Validate transfer request
  validateTransfer(recipientData: {
    country: string;
    bankId: string;
    accountNumber: string;
    accountName: string;
    amount: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const bank = this.getBankById(recipientData.bankId);
    if (!bank) {
      errors.push('Invalid bank selected');
    }

    if (!this.validateAccountNumber(recipientData.accountNumber, bank?.code || '')) {
      errors.push('Invalid account number format');
    }

    if (recipientData.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!recipientData.accountName.trim()) {
      errors.push('Account name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const africanBankingService = new AfricanBankingService();
