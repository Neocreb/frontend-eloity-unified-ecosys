// @ts-nocheck
import { africanBankingService, Bank } from './africanBankingService';

export interface AccountVerificationResult {
  isValid: boolean;
  accountName?: string;
  bankName?: string;
  errors: string[];
  warnings: string[];
  confidence: number; // 0-100
}

export interface VerificationRequest {
  bankId: string;
  accountNumber: string;
  countryCode: string;
}

export class AccountVerificationService {
  // Mock account database for demonstration
  private mockAccounts = new Map<string, {
    accountName: string;
    accountNumber: string;
    bankId: string;
    isActive: boolean;
  }>([
    // Nigerian accounts
    ['gtbank-ng:1234567890', { accountName: 'John Doe', accountNumber: '1234567890', bankId: 'gtbank-ng', isActive: true }],
    ['kuda-ng:0987654321', { accountName: 'Jane Smith', accountNumber: '0987654321', bankId: 'kuda-ng', isActive: true }],
    ['zenith-ng:1111222233', { accountName: 'Michael Johnson', accountNumber: '1111222233', bankId: 'zenith-ng', isActive: true }],
    ['access-ng:5555666677', { accountName: 'Sarah Wilson', accountNumber: '5555666677', bankId: 'access-ng', isActive: true }],
    
    // Kenyan accounts
    ['mpesa-ke:254701234567', { accountName: 'David Kimani', accountNumber: '254701234567', bankId: 'mpesa-ke', isActive: true }],
    ['kcb-ke:1234567890123', { accountName: 'Grace Wanjiku', accountNumber: '1234567890123', bankId: 'kcb-ke', isActive: true }],
    
    // South African accounts
    ['fnb-za:62123456789', { accountName: 'Thabo Mthembu', accountNumber: '62123456789', bankId: 'fnb-za', isActive: true }],
    ['capitec-za:1234567890', { accountName: 'Nomsa Dlamini', accountNumber: '1234567890', bankId: 'capitec-za', isActive: true }],
    
    // Ghanaian accounts
    ['mtn-momo-gh:233241234567', { accountName: 'Kwame Asante', accountNumber: '233241234567', bankId: 'mtn-momo-gh', isActive: true }],
    ['gcb-gh:1234567890123456', { accountName: 'Akosua Mensah', accountNumber: '1234567890123456', bankId: 'gcb-gh', isActive: true }],
  ]);

  async verifyAccount(request: VerificationRequest): Promise<AccountVerificationResult> {
    const { bankId, accountNumber, countryCode } = request;
    
    // Get bank information
    const bank = africanBankingService.getBankById(bankId);
    if (!bank) {
      return {
        isValid: false,
        errors: ['Invalid bank selected'],
        warnings: [],
        confidence: 0
      };
    }

    // Validate account number format
    if (!africanBankingService.validateAccountNumber(accountNumber, bank.code)) {
      return {
        isValid: false,
        errors: [`Invalid account number format for ${bank.name}`],
        warnings: [],
        confidence: 0
      };
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check mock account database
    const accountKey = `${bankId}:${accountNumber}`;
    const mockAccount = this.mockAccounts.get(accountKey);

    if (mockAccount) {
      if (!mockAccount.isActive) {
        return {
          isValid: false,
          errors: ['Account is inactive'],
          warnings: [],
          confidence: 90
        };
      }

      return {
        isValid: true,
        accountName: mockAccount.accountName,
        bankName: bank.name,
        errors: [],
        warnings: [],
        confidence: 95
      };
    }

    // For demo purposes, generate random responses for unknown accounts
    const randomSuccess = Math.random() > 0.3; // 70% success rate
    
    if (randomSuccess) {
      // Generate a mock name based on country
      const mockNames = this.getMockNamesByCountry(countryCode);
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      
      return {
        isValid: true,
        accountName: randomName,
        bankName: bank.name,
        errors: [],
        warnings: this.getAccountWarnings(bank, accountNumber),
        confidence: 85
      };
    } else {
      const possibleErrors = [
        'Account not found',
        'Account number does not exist',
        'Invalid account number for this bank',
        'Account verification temporarily unavailable'
      ];
      
      return {
        isValid: false,
        errors: [possibleErrors[Math.floor(Math.random() * possibleErrors.length)]],
        warnings: [],
        confidence: 80
      };
    }
  }

  private getMockNamesByCountry(countryCode: string): string[] {
    const namesByCountry: { [key: string]: string[] } = {
      'NG': [
        'Adebayo Ogundimu', 'Chioma Nwosu', 'Emeka Okoro', 'Fatima Abubakar',
        'Kemi Adeyemi', 'Olumide Fakunle', 'Nkechi Okonkwo', 'Tunde Bakare'
      ],
      'KE': [
        'James Wanjiku', 'Mary Kimani', 'Peter Otieno', 'Grace Muthoni',
        'David Kipchoge', 'Agnes Wambui', 'Samuel Karanja', 'Ruth Njeri'
      ],
      'ZA': [
        'Thabo Molefe', 'Nomsa Dlamini', 'Sipho Ngcobo', 'Lindiwe Mthembu',
        'Mandla Zulu', 'Precious Mokoena', 'Lucky Sithole', 'Beauty Mahlangu'
      ],
      'GH': [
        'Kwame Asante', 'Akosua Mensah', 'Kofi Adjei', 'Ama Boateng',
        'Yaw Osei', 'Efua Gyasi', 'Kweku Appiah', 'Abena Owusu'
      ],
      'UG': [
        'Moses Mukasa', 'Sarah Nalwoga', 'Daniel Ssemakula', 'Grace Nakato',
        'Patrick Bbumba', 'Esther Namusoke', 'Simon Kiprotich', 'Rebecca Atim'
      ],
      'EG': [
        'Ahmed Hassan', 'Fatma Ali', 'Mohamed Ibrahim', 'Nour El-Din',
        'Yasmin Farouk', 'Omar Mahmoud', 'Heba Mostafa', 'Karim Rashad'
      ]
    };

    return namesByCountry[countryCode] || [
      'John Smith', 'Jane Doe', 'Robert Johnson', 'Emily Brown',
      'Michael Davis', 'Sarah Wilson', 'David Miller', 'Lisa Anderson'
    ];
  }

  private getAccountWarnings(bank: Bank, accountNumber: string): string[] {
    const warnings: string[] = [];

    // Add warnings based on bank type
    if (bank.type === 'mobile_money') {
      warnings.push('Mobile money transfers may have daily limits');
    }

    if (bank.type === 'digital') {
      warnings.push('Digital bank transfers are usually instant');
    }

    // Add warnings for new or unusual patterns
    if (accountNumber.startsWith('0000')) {
      warnings.push('Please verify account number - unusual pattern detected');
    }

    // Add warnings for high-fee transfers
    if (bank.fees.domestic > 100) {
      warnings.push('This bank charges higher transfer fees');
    }

    return warnings;
  }

  // Get transfer limits for a bank
  getTransferLimits(bank: Bank): {
    daily: { min: number; max: number };
    perTransaction: { min: number; max: number };
    monthly: { min: number; max: number };
  } {
    // Default limits - in practice these would come from bank APIs
    const defaultLimits = {
      daily: { min: 1, max: 1000000 },
      perTransaction: { min: 1, max: 500000 },
      monthly: { min: 1, max: 10000000 }
    };

    // Adjust limits based on bank type
    if (bank.type === 'mobile_money') {
      return {
        daily: { min: 1, max: 100000 },
        perTransaction: { min: 1, max: 50000 },
        monthly: { min: 1, max: 2000000 }
      };
    }

    if (bank.type === 'digital') {
      return {
        daily: { min: 1, max: 2000000 },
        perTransaction: { min: 1, max: 1000000 },
        monthly: { min: 1, max: 20000000 }
      };
    }

    return defaultLimits;
  }

  // Validate transfer amount against limits
  validateTransferAmount(amount: number, bank: Bank): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const limits = this.getTransferLimits(bank);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (amount < limits.perTransaction.min) {
      errors.push(`Minimum transfer amount is $${limits.perTransaction.min}`);
    }

    if (amount > limits.perTransaction.max) {
      errors.push(`Maximum transfer amount is $${limits.perTransaction.max.toLocaleString()}`);
    }

    if (amount > limits.daily.max * 0.8) {
      warnings.push('This transfer is close to your daily limit');
    }

    if (amount > 10000) {
      warnings.push('Large transfers may require additional verification');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Get estimated transfer time
  getEstimatedTransferTime(bank: Bank, transferType: 'domestic' | 'international' | 'instant', amount: number): string {
    const baseTime = bank.processingTime[transferType];
    
    // Add delays for large amounts
    if (amount > 50000 && transferType !== 'instant') {
      return `${baseTime} (may take longer for verification)`;
    }

    // Add country-specific notes
    if (bank.country === 'Nigeria' && transferType === 'domestic' && bank.type === 'commercial') {
      return `${baseTime} (weekdays only)`;
    }

    return baseTime;
  }
}

export const accountVerificationService = new AccountVerificationService();
