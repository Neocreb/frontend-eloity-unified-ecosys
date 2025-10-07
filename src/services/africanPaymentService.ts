// @ts-nocheck
import { useToast } from "@/components/ui/use-toast";

// Mock African Payment Service
// This will be replaced with real API integration later

export interface MobileMoneyProvider {
  id: string;
  name: string;
  code: string;
  countries: string[];
  fees: {
    deposit: number;
    withdrawal: number;
    transfer: number;
  };
  limits: {
    min: number;
    max: number;
    daily: number;
  };
  supportedCurrencies: string[];
}

export interface DigitalBankProvider {
  id: string;
  name: string;
  country: string;
  accountTypes: string[];
  features: string[];
  apiEndpoint: string;
}

export interface PaymentGatewayProvider {
  id: string;
  name: string;
  countries: string[];
  acceptedMethods: string[];
  processingTime: string;
  fees: {
    percentage: number;
    fixed: number;
  };
}

export interface BankTransferRequest {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  currency: string;
  routingNumber?: string;
  sortCode?: string;
  swiftCode?: string;
  reference: string;
}

export interface MobileMoneyRequest {
  provider: string;
  phoneNumber: string;
  amount: number;
  currency: string;
  reference: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
  processingTime?: string;
  fees?: number;
}

class AfricanPaymentService {
  private mobileMoneyProviders: MobileMoneyProvider[] = [
    {
      id: "mtn_momo",
      name: "MTN Mobile Money",
      code: "MTN_MOMO",
      countries: ["Nigeria", "Ghana", "Uganda", "Rwanda", "Cameroon"],
      fees: { deposit: 1.5, withdrawal: 2.0, transfer: 1.0 },
      limits: { min: 1, max: 10000, daily: 50000 },
      supportedCurrencies: ["USD", "NGN", "GHS", "UGX", "RWF", "XAF"],
    },
    {
      id: "airtel_money",
      name: "Airtel Money",
      code: "AIRTEL_MONEY",
      countries: ["Nigeria", "Kenya", "Tanzania", "Zambia", "Madagascar"],
      fees: { deposit: 1.8, withdrawal: 2.2, transfer: 1.2 },
      limits: { min: 1, max: 8000, daily: 40000 },
      supportedCurrencies: ["USD", "NGN", "KES", "TZS", "ZMW", "MGA"],
    },
    {
      id: "safaricom_mpesa",
      name: "M-Pesa (Safaricom)",
      code: "MPESA_KE",
      countries: ["Kenya", "Tanzania", "Mozambique", "Lesotho"],
      fees: { deposit: 1.0, withdrawal: 1.5, transfer: 0.8 },
      limits: { min: 1, max: 15000, daily: 70000 },
      supportedCurrencies: ["USD", "KES", "TZS", "MZN", "LSL"],
    },
    {
      id: "orange_money",
      name: "Orange Money",
      code: "ORANGE_MONEY",
      countries: ["Senegal", "Mali", "Burkina Faso", "Niger", "Guinea"],
      fees: { deposit: 2.0, withdrawal: 2.5, transfer: 1.5 },
      limits: { min: 1, max: 5000, daily: 25000 },
      supportedCurrencies: ["USD", "XOF", "GNF"],
    },
  ];

  private digitalBanks: DigitalBankProvider[] = [
    {
      id: "kuda_bank",
      name: "Kuda Bank",
      country: "Nigeria",
      accountTypes: ["savings", "current"],
      features: ["free_transfers", "budgeting", "savings_goals"],
      apiEndpoint: "https://api.kuda.com/v2.1",
    },
    {
      id: "opay",
      name: "OPay",
      country: "Nigeria",
      accountTypes: ["wallet", "savings"],
      features: ["payments", "savings", "loans", "investments"],
      apiEndpoint: "https://api.opay.com/v1",
    },
    {
      id: "tymebank",
      name: "TymeBank",
      country: "South Africa",
      accountTypes: ["transactional", "goal_save"],
      features: ["no_monthly_fees", "goal_save", "moretyme_rewards"],
      apiEndpoint: "https://api.tymebank.co.za/v1",
    },
  ];

  private paymentGateways: PaymentGatewayProvider[] = [
    {
      id: "paystack",
      name: "Paystack",
      countries: ["Nigeria", "Ghana", "South Africa"],
      acceptedMethods: ["card", "bank_transfer", "mobile_money", "ussd"],
      processingTime: "instant",
      fees: { percentage: 1.5, fixed: 0 },
    },
    {
      id: "flutterwave",
      name: "Flutterwave",
      countries: ["Nigeria", "Kenya", "Ghana", "Uganda", "Rwanda"],
      acceptedMethods: ["card", "mobile_money", "bank_transfer", "crypto"],
      processingTime: "instant",
      fees: { percentage: 1.4, fixed: 0 },
    },
    {
      id: "chipper_cash",
      name: "Chipper Cash",
      countries: ["Nigeria", "Ghana", "Kenya", "Uganda", "Rwanda", "Tanzania"],
      acceptedMethods: ["p2p_transfer", "crypto", "mobile_money"],
      processingTime: "instant",
      fees: { percentage: 0, fixed: 0 },
    },
  ];

  // Mock API delay simulation
  private async simulateApiCall(delay: number = 2000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Generate mock transaction ID
  private generateTransactionId(): string {
    const prefix = "TXN";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  // Generate mock reference
  private generateReference(): string {
    return `REF_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  // Bank Transfer Methods
  async processBankTransfer(request: BankTransferRequest): Promise<PaymentResponse> {
    await this.simulateApiCall(2500);

    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      return {
        success: false,
        transactionId: "",
        reference: this.generateReference(),
        status: "failed",
        message: "Bank network temporarily unavailable. Please try again.",
      };
    }

    const fees = this.calculateBankTransferFees(request.amount, request.bankName);
    
    return {
      success: true,
      transactionId: this.generateTransactionId(),
      reference: request.reference,
      status: "processing",
      message: `Bank transfer initiated. Funds will be available in 1-3 business days.`,
      processingTime: "1-3 business days",
      fees,
    };
  }

  async processWithdrawalToBankAccount(request: BankTransferRequest): Promise<PaymentResponse> {
    await this.simulateApiCall(2000);

    // Validate account details
    if (!this.validateBankAccount(request)) {
      return {
        success: false,
        transactionId: "",
        reference: this.generateReference(),
        status: "failed",
        message: "Invalid bank account details. Please check and try again.",
      };
    }

    const fees = this.calculateWithdrawalFees(request.amount, request.bankName);

    return {
      success: true,
      transactionId: this.generateTransactionId(),
      reference: request.reference,
      status: "processing",
      message: `Withdrawal request submitted. Processing time: 2-5 hours for Nigerian banks, 1-2 days for international.`,
      processingTime: request.bankName.includes("Nigeria") || request.bankName.includes("GTBank") ? "2-5 hours" : "1-2 days",
      fees,
    };
  }

  // Mobile Money Methods
  async processMobileMoneyDeposit(request: MobileMoneyRequest): Promise<PaymentResponse> {
    await this.simulateApiCall(1500);

    const provider = this.mobileMoneyProviders.find(p => p.id === request.provider);
    if (!provider) {
      return {
        success: false,
        transactionId: "",
        reference: request.reference,
        status: "failed",
        message: "Unsupported mobile money provider",
      };
    }

    // Validate amount limits
    if (request.amount < provider.limits.min || request.amount > provider.limits.max) {
      return {
        success: false,
        transactionId: "",
        reference: request.reference,
        status: "failed",
        message: `Amount must be between $${provider.limits.min} and $${provider.limits.max}`,
      };
    }

    const fees = (request.amount * provider.fees.deposit) / 100;

    return {
      success: true,
      transactionId: this.generateTransactionId(),
      reference: request.reference,
      status: "pending",
      message: `Please approve the payment on your ${provider.name} app or dial the USSD code sent to your phone.`,
      processingTime: "instant",
      fees,
    };
  }

  async processMobileMoneyWithdrawal(request: MobileMoneyRequest): Promise<PaymentResponse> {
    await this.simulateApiCall(1200);

    const provider = this.mobileMoneyProviders.find(p => p.id === request.provider);
    if (!provider) {
      return {
        success: false,
        transactionId: "",
        reference: request.reference,
        status: "failed",
        message: "Unsupported mobile money provider",
      };
    }

    const fees = (request.amount * provider.fees.withdrawal) / 100;

    return {
      success: true,
      transactionId: this.generateTransactionId(),
      reference: request.reference,
      status: "completed",
      message: `${provider.name} withdrawal successful. Check your phone for confirmation.`,
      processingTime: "instant",
      fees,
    };
  }

  // Payment Gateway Methods
  async processPaymentGateway(providerId: string, amount: number, method: string): Promise<PaymentResponse> {
    await this.simulateApiCall(1800);

    const provider = this.paymentGateways.find(p => p.id === providerId);
    if (!provider) {
      return {
        success: false,
        transactionId: "",
        reference: this.generateReference(),
        status: "failed",
        message: "Unsupported payment gateway",
      };
    }

    const fees = (amount * provider.fees.percentage) / 100 + provider.fees.fixed;

    return {
      success: true,
      transactionId: this.generateTransactionId(),
      reference: this.generateReference(),
      status: "completed",
      message: `Payment processed successfully via ${provider.name}`,
      processingTime: provider.processingTime,
      fees,
    };
  }

  // Validation Methods
  private validateBankAccount(request: BankTransferRequest): boolean {
    // Basic validation
    if (!request.accountNumber || request.accountNumber.length < 10) return false;
    if (!request.accountName || request.accountName.length < 3) return false;
    if (!request.bankName) return false;

    // Validate routing codes based on bank
    if (request.bankName.includes("US") || request.bankName.includes("America")) {
      return !!request.routingNumber && request.routingNumber.length === 9;
    }

    if (request.bankName.includes("UK") || request.bankName.includes("SA")) {
      return !!request.sortCode && request.sortCode.length >= 6;
    }

    // For African banks, SWIFT code is usually required for international transfers
    if (request.amount > 1000) {
      return !!request.swiftCode && request.swiftCode.length >= 8;
    }

    return true;
  }

  private validatePhoneNumber(phoneNumber: string, countryCode?: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, "");
    
    // African phone number patterns
    const patterns = {
      nigeria: /^(234|0)[789]\d{9}$/,
      kenya: /^(254|0)[17]\d{8}$/,
      ghana: /^(233|0)[25]\d{8}$/,
      southAfrica: /^(27|0)[678]\d{8}$/,
      uganda: /^(256|0)[37]\d{8}$/,
    };

    // Check if it matches any African pattern
    return Object.values(patterns).some(pattern => pattern.test(cleaned)) || 
           (cleaned.length >= 10 && cleaned.length <= 15); // General international format
  }

  // Fee Calculation Methods
  private calculateBankTransferFees(amount: number, bankName: string): number {
    if (bankName.includes("Kuda") || bankName.includes("Opay")) {
      return 0; // Many digital banks offer free transfers
    }

    if (bankName.includes("Nigeria") || bankName.includes("GTBank") || bankName.includes("Access")) {
      return Math.min(amount * 0.005, 10); // 0.5% capped at $10 for Nigerian banks
    }

    return Math.min(amount * 0.015, 25); // 1.5% capped at $25 for international
  }

  private calculateWithdrawalFees(amount: number, bankName: string): number {
    if (amount < 10) return 0.5; // Minimum fee
    
    if (bankName.includes("Nigeria")) {
      return Math.min(amount * 0.01, 5); // 1% capped at $5 for Nigerian banks
    }

    return Math.min(amount * 0.025, 15); // 2.5% capped at $15 for international
  }

  // Utility Methods
  getMobileMoneyProviders(): MobileMoneyProvider[] {
    return this.mobileMoneyProviders;
  }

  getDigitalBanks(): DigitalBankProvider[] {
    return this.digitalBanks;
  }

  getPaymentGateways(): PaymentGatewayProvider[] {
    return this.paymentGateways;
  }

  getProviderByCountry(country: string): {
    mobileMoneyProviders: MobileMoneyProvider[];
    digitalBanks: DigitalBankProvider[];
    paymentGateways: PaymentGatewayProvider[];
  } {
    return {
      mobileMoneyProviders: this.mobileMoneyProviders.filter(p => 
        p.countries.some(c => c.toLowerCase().includes(country.toLowerCase()))
      ),
      digitalBanks: this.digitalBanks.filter(b => 
        b.country.toLowerCase().includes(country.toLowerCase())
      ),
      paymentGateways: this.paymentGateways.filter(g => 
        g.countries.some(c => c.toLowerCase().includes(country.toLowerCase()))
      ),
    };
  }

  // Transaction Status Methods
  async checkTransactionStatus(transactionId: string): Promise<{
    status: "pending" | "processing" | "completed" | "failed";
    message: string;
    updatedAt: string;
  }> {
    await this.simulateApiCall(500);

    // Simulate status progression
    const statuses = ["pending", "processing", "completed"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] as any;

    return {
      status: randomStatus,
      message: this.getStatusMessage(randomStatus),
      updatedAt: new Date().toISOString(),
    };
  }

  private getStatusMessage(status: string): string {
    switch (status) {
      case "pending":
        return "Transaction is awaiting confirmation";
      case "processing":
        return "Transaction is being processed";
      case "completed":
        return "Transaction completed successfully";
      case "failed":
        return "Transaction failed. Please try again.";
      default:
        return "Unknown status";
    }
  }

  // Country and Currency Detection
  detectCountryFromPhone(phoneNumber: string): string | null {
    const cleaned = phoneNumber.replace(/\D/g, "");
    
    if (cleaned.startsWith("234")) return "Nigeria";
    if (cleaned.startsWith("254")) return "Kenya";
    if (cleaned.startsWith("233")) return "Ghana";
    if (cleaned.startsWith("27")) return "South Africa";
    if (cleaned.startsWith("256")) return "Uganda";
    if (cleaned.startsWith("255")) return "Tanzania";
    if (cleaned.startsWith("260")) return "Zambia";
    if (cleaned.startsWith("263")) return "Zimbabwe";
    if (cleaned.startsWith("265")) return "Malawi";
    if (cleaned.startsWith("267")) return "Botswana";

    return null;
  }

  getCurrencyForCountry(country: string): string {
    const currencyMap: Record<string, string> = {
      "Nigeria": "NGN",
      "Kenya": "KES",
      "Ghana": "GHS",
      "South Africa": "ZAR",
      "Uganda": "UGX",
      "Tanzania": "TZS",
      "Zambia": "ZMW",
      "Zimbabwe": "ZWL",
      "Malawi": "MWK",
      "Botswana": "BWP",
    };

    return currencyMap[country] || "USD";
  }
}

// Export singleton instance
export const africanPaymentService = new AfricanPaymentService();

// Export types for use in components
export type {
  MobileMoneyProvider,
  DigitalBankProvider,
  PaymentGatewayProvider,
  BankTransferRequest,
  MobileMoneyRequest,
  PaymentResponse,
};
