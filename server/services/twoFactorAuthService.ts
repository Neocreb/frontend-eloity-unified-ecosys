import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { logger } from '../utils/logger.js';

export interface TwoFactorMethod {
  type: 'email' | 'sms' | 'totp' | 'backup_codes';
  enabled: boolean;
  verified: boolean;
  setUpAt?: string;
  lastUsedAt?: string;
}

export interface TwoFactorSetup {
  method: 'email' | 'sms' | 'totp';
  status: 'pending' | 'confirmed' | 'verified';
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
}

class TwoFactorAuthService {
  /**
   * Generate a 6-digit verification code
   */
  generateVerificationCode(): string {
    return Math.random().toString().slice(2, 8).padStart(6, '0');
  }

  /**
   * Generate backup codes for account recovery
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Setup TOTP (Time-Based One-Time Password)
   */
  async setupTOTP(userId: string, email: string): Promise<TwoFactorSetup> {
    try {
      const secret = speakeasy.generateSecret({
        name: `Eloity (${email})`,
        issuer: 'Eloity',
        length: 32,
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      return {
        method: 'totp',
        status: 'pending',
        secret: secret.base32,
        qrCode,
        backupCodes: this.generateBackupCodes(),
      };
    } catch (error) {
      logger.error('Error setting up TOTP:', error);
      throw error;
    }
  }

  /**
   * Verify TOTP token
   */
  verifyTOTP(secret: string, token: string): boolean {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2,
      });
      return !!verified;
    } catch (error) {
      logger.error('Error verifying TOTP:', error);
      return false;
    }
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(code: string, backupCodes: string[]): { valid: boolean; remaining: string[] } {
    const index = backupCodes.indexOf(code);
    if (index === -1) {
      return { valid: false, remaining: backupCodes };
    }

    const remaining = backupCodes.filter((c, i) => i !== index);
    return { valid: true, remaining };
  }

  /**
   * Validate verification code format
   */
  validateCodeFormat(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  /**
   * Check if code has expired
   */
  isCodeExpired(generatedTime: string, expiryMinutes: number = 10): boolean {
    const generated = new Date(generatedTime).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - generated) / (1000 * 60);
    return diffMinutes > expiryMinutes;
  }

  /**
   * Generate secure code with expiry
   */
  generateSecureCode(): { code: string; expiresAt: string } {
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    return { code, expiresAt };
  }

  /**
   * Calculate code attempt penalty (for rate limiting)
   */
  calculateAttemptPenalty(failedAttempts: number): { penalty: number; locked: boolean } {
    if (failedAttempts >= 5) {
      return { penalty: 300, locked: true };
    } else if (failedAttempts >= 3) {
      return { penalty: 60, locked: false };
    }
    return { penalty: 0, locked: false };
  }

  /**
   * Generate 2FA setup instructions
   */
  generateSetupInstructions(method: 'email' | 'sms' | 'totp'): string {
    const instructions: Record<string, string> = {
      email: `
1. A verification code will be sent to your registered email address
2. Check your email inbox (and spam folder)
3. Enter the 6-digit code below
4. The code expires in 10 minutes
      `,
      sms: `
1. A verification code will be sent to your registered phone number via SMS
2. Check your SMS inbox
3. Enter the 6-digit code below
4. The code expires in 10 minutes
      `,
      totp: `
1. Scan the QR code with an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
2. Enter the 6-digit code from the app below
3. Save your backup codes in a secure location
4. Codes refresh every 30 seconds
      `,
    };
    return instructions[method] || '';
  }

  /**
   * Get available 2FA methods
   */
  getAvailableMethods(): string[] {
    return ['email', 'sms', 'totp'];
  }

  /**
   * Validate 2FA setup
   */
  validate2FASetup(method: TwoFactorMethod[]): { valid: boolean; reason?: string } {
    const hasEnabledMethod = method.some((m) => m.enabled && m.verified);
    if (!hasEnabledMethod) {
      return { valid: false, reason: 'At least one verified 2FA method must be enabled' };
    }
    return { valid: true };
  }

  /**
   * Get 2FA recovery instructions
   */
  getRecoveryInstructions(): string {
    return `
If you cannot access your 2FA methods:
1. Contact support with proof of identity
2. We will verify your account details
3. Temporary access will be granted for 24 hours
4. Set up new 2FA methods immediately
5. Your account will require re-verification

For security, this process may take 1-2 business days.
    `;
  }
}

export const twoFactorAuthService = new TwoFactorAuthService();
