import { logger } from '../utils/logger.js';

export interface KYCLevel {
  level: number;
  name: string;
  dailyDepositLimit: number;
  dailyWithdrawalLimit: number;
  monthlyLimit: number;
  requiredDocuments: string[];
  description: string;
}

export interface UserKYCStatus {
  userId: string;
  currentLevel: number;
  status: 'unverified' | 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
  documents: {
    type: string;
    url: string;
    status: 'pending' | 'approved' | 'rejected';
    uploadedAt: string;
  }[];
  rejectionReason?: string;
  nextLevelRequirements?: string[];
}

// KYC Level definitions
const KYC_LEVELS: KYCLevel[] = [
  {
    level: 0,
    name: 'Unverified',
    dailyDepositLimit: 100,
    dailyWithdrawalLimit: 0,
    monthlyLimit: 500,
    requiredDocuments: [],
    description: 'Basic account with limited access',
  },
  {
    level: 1,
    name: 'Basic',
    dailyDepositLimit: 1000,
    dailyWithdrawalLimit: 0,
    monthlyLimit: 5000,
    requiredDocuments: ['email_verification'],
    description: 'Email verified account',
  },
  {
    level: 2,
    name: 'Intermediate',
    dailyDepositLimit: 10000,
    dailyWithdrawalLimit: 1000,
    monthlyLimit: 50000,
    requiredDocuments: ['identity_document', 'selfie'],
    description: 'ID verified account with limited withdrawals',
  },
  {
    level: 3,
    name: 'Advanced',
    dailyDepositLimit: 50000,
    dailyWithdrawalLimit: 10000,
    monthlyLimit: 500000,
    requiredDocuments: ['identity_document', 'address_proof', 'selfie', 'liveness_check'],
    description: 'Fully verified account with high limits',
  },
];

class KYCService {
  /**
   * Get KYC level by number
   */
  getKYCLevel(level: number): KYCLevel | undefined {
    return KYC_LEVELS.find((l) => l.level === level);
  }

  /**
   * Get all KYC levels
   */
  getAllKYCLevels(): KYCLevel[] {
    return KYC_LEVELS;
  }

  /**
   * Check if user can perform deposit
   */
  canDeposit(userKycLevel: number, amount: number): { allowed: boolean; reason?: string; limit?: number } {
    const level = this.getKYCLevel(userKycLevel);
    if (!level) {
      return { allowed: false, reason: 'Invalid KYC level' };
    }

    if (amount > level.dailyDepositLimit) {
      return {
        allowed: false,
        reason: `Daily deposit limit of $${level.dailyDepositLimit} exceeded`,
        limit: level.dailyDepositLimit,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can perform withdrawal
   */
  canWithdraw(userKycLevel: number, amount: number): { allowed: boolean; reason?: string; limit?: number } {
    const level = this.getKYCLevel(userKycLevel);
    if (!level) {
      return { allowed: false, reason: 'Invalid KYC level' };
    }

    if (level.dailyWithdrawalLimit === 0) {
      return {
        allowed: false,
        reason: `Current KYC level (${level.name}) does not allow withdrawals. Please upgrade to level ${level.level + 1}+`,
      };
    }

    if (amount > level.dailyWithdrawalLimit) {
      return {
        allowed: false,
        reason: `Daily withdrawal limit of $${level.dailyWithdrawalLimit} exceeded`,
        limit: level.dailyWithdrawalLimit,
      };
    }

    return { allowed: true };
  }

  /**
   * Get next KYC level requirements
   */
  getNextLevelRequirements(currentLevel: number): KYCLevel | undefined {
    const nextLevel = currentLevel + 1;
    return this.getKYCLevel(nextLevel);
  }

  /**
   * Validate identity document
   */
  validateIdentityDocument(documentType: string, data: {
    documentNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    expiryDate: string;
  }): { valid: boolean; reason?: string } {
    // Basic validation
    if (!data.documentNumber || data.documentNumber.length < 5) {
      return { valid: false, reason: 'Invalid document number' };
    }

    if (!data.firstName || !data.lastName) {
      return { valid: false, reason: 'Invalid name on document' };
    }

    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      return { valid: false, reason: 'Invalid date of birth' };
    }

    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 18) {
      return { valid: false, reason: 'Must be at least 18 years old' };
    }

    const expiry = new Date(data.expiryDate);
    if (expiry < new Date()) {
      return { valid: false, reason: 'Document has expired' };
    }

    return { valid: true };
  }

  /**
   * Validate address document
   */
  validateAddressDocument(data: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    documentType: string;
  }): { valid: boolean; reason?: string } {
    if (!data.address || data.address.length < 5) {
      return { valid: false, reason: 'Invalid address' };
    }

    if (!data.city) {
      return { valid: false, reason: 'City is required' };
    }

    if (!data.country) {
      return { valid: false, reason: 'Country is required' };
    }

    return { valid: true };
  }

  /**
   * Calculate KYC tier based on transactions
   */
  calculateKYCTier(transactionHistory: {
    totalDeposits: number;
    totalWithdrawals: number;
    accountAge: number;
    documentVerifications: number;
  }): number {
    if (transactionHistory.documentVerifications >= 4) {
      return 3;
    } else if (transactionHistory.documentVerifications >= 2) {
      return 2;
    } else if (transactionHistory.totalDeposits > 0) {
      return 1;
    }
    return 0;
  }

  /**
   * Generate KYC reminder
   */
  generateKYCReminder(currentLevel: number): { message: string; nextLevel: KYCLevel } | null {
    const nextLevel = this.getNextLevelRequirements(currentLevel);
    if (!nextLevel) {
      return null;
    }

    const requiredDocs = nextLevel.requiredDocuments
      .filter((doc) => !['identity_document', 'address_proof'].includes(doc))
      .join(', ');

    return {
      message: `Upgrade to ${nextLevel.name} level to unlock withdrawal capabilities and higher limits. Complete: ${requiredDocs}`,
      nextLevel,
    };
  }

  /**
   * Get KYC status message
   */
  getStatusMessage(status: 'unverified' | 'pending' | 'approved' | 'rejected'): string {
    const messages: Record<string, string> = {
      unverified: 'Your account is not yet verified. Please complete KYC to unlock full features.',
      pending: 'Your KYC verification is being reviewed. Please wait 24-48 hours.',
      approved: 'Your account is fully verified. Enjoy unlimited features!',
      rejected: 'Your KYC verification was rejected. Please resubmit with correct documents.',
    };
    return messages[status] || 'Unknown status';
  }

  /**
   * Calculate verification score (0-100)
   */
  calculateVerificationScore(documents: Array<{ type: string; status: string }>): number {
    const documentTypes = {
      email_verification: 10,
      identity_document: 30,
      address_proof: 20,
      selfie: 20,
      liveness_check: 20,
    };

    let score = 0;
    for (const doc of documents) {
      if (doc.status === 'approved') {
        score += documentTypes[doc.type as keyof typeof documentTypes] || 0;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Get user's KYC status
   * @param userId The user ID to get KYC status for
   * @returns User KYC status information
   */
  async getKYCStatus(userId: string): Promise<UserKYCStatus> {
    // This is a simplified implementation that returns mock data
    // In a real implementation, this would query the database
    return {
      userId,
      currentLevel: 1,
      status: 'approved',
      documents: [],
    };
  }
}

export const kycService = new KYCService();
