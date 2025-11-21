export interface WalletBalance {
  total: number;
  ecommerce: number;
  crypto: number;
  rewards: number;
  freelance: number;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "earned" | "transfer";
  amount: number;
  source: "ecommerce" | "crypto" | "rewards" | "freelance" | "bank" | "card";
  description: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
  sourceIcon?: string;
}

export interface WalletSource {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
  description: string;
}

export interface WithdrawalRequest {
  amount: number;
  source?: "total" | "ecommerce" | "crypto" | "rewards" | "freelance";
  recipientType: "bank_account" | "username" | "email" | "mobile_money";
  bankAccountId?: string;
  username?: string;
  email?: string;
  mobilePhone?: string;
  description?: string;
}

export interface DepositRequest {
  amount: number;
  method: "card" | "bank" | "crypto" | "mobile" | "ewallet";
  methodProviderId: string;
  source: "ecommerce" | "crypto" | "rewards" | "freelance";
  countryCode: string;
  currency: string;
  description?: string;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  bankName: string;
  accountHolderName: string;
  accountHolderPhone?: string;
  countryCode: string;
  currency: string;
  isDefault: boolean;
  isVerified: boolean;
  bankCode?: string;
  swiftCode?: string;
}

export interface WithdrawalMethod {
  id: string;
  userId: string;
  methodType: "bank_account" | "username" | "email" | "mobile_money";
  displayName?: string;
  bankAccountId?: string;
  username?: string;
  email?: string;
  mobilePhone?: string;
  mobileProvider?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}
