// @ts-nocheck
import { ReferralService } from '../referralService';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Mock enhancedEloitsService
const mockEnhancedEloitsService = {
  processMultiLevelReferral: jest.fn(),
};

// Mock ActivityRewardService
const mockActivityRewardService = {
  logActivity: jest.fn(),
};

jest.mock('../enhancedEloitsService', () => ({
  enhancedEloitsService: mockEnhancedEloitsService,
}));

jest.mock('../activityRewardService', () => ({
  ActivityRewardService: mockActivityRewardService,
}));

// Mock fetch
global.fetch = jest.fn();

describe('Referral Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-token');
  });

  describe('Referral Processing', () => {
    it('should process referral signup with multi-level rewards', async () => {
      // Mock the referral signup API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          referrerId: 'user-123',
          refereeId: 'user-456'
        })
      });

      // Mock multi-level referral processing
      mockEnhancedEloitsService.processMultiLevelReferral.mockResolvedValueOnce({
        success: true,
        message: 'Multi-level referral processed successfully',
        rewards: [
          { level: 1, amount: 1000, userId: 'user-123' },
          { level: 2, amount: 100, userId: 'user-789' }
        ]
      });

      // Mock activity logging
      mockActivityRewardService.logActivity.mockResolvedValueOnce({
        success: true,
        eloits: 1000,
        message: 'Referral reward earned!'
      }).mockResolvedValueOnce({
        success: true,
        eloits: 100,
        message: 'Multi-level referral reward earned!'
      });

      const result = await ReferralService.processReferralSignup({
        referralCode: 'REF123',
        newUserId: 'user-456'
      });

      expect(result).toBe(true);
      expect(mockEnhancedEloitsService.processMultiLevelReferral).toHaveBeenCalledWith(
        'user-123',
        'user-456',
        'REF123'
      );
      expect(mockActivityRewardService.logActivity).toHaveBeenCalledTimes(2);
    });

    it('should handle referral signup API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      const result = await ReferralService.processReferralSignup({
        referralCode: 'INVALID',
        newUserId: 'user-456'
      });

      expect(result).toBe(false);
    });
  });

  describe('Referral Link Generation', () => {
    it('should generate referral link', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          data: {
            id: 'link-123',
            referralCode: 'REF123',
            referralUrl: 'http://localhost:8080/join?ref=REF123'
          }
        })
      });

      const result = await ReferralService.generateReferralLink({
        type: 'general',
        description: 'Test referral link'
      });

      expect(result).toEqual({
        id: 'link-123',
        referralCode: 'REF123',
        referralUrl: 'http://localhost:8080/join?ref=REF123'
      });
    });

    it('should handle missing auth token', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

      const result = await ReferralService.generateReferralLink();

      expect(result).toBeNull();
    });
  });

  describe('Referral Data Retrieval', () => {
    it('should get referral links', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          data: [
            {
              id: 'link-123',
              referralCode: 'REF123',
              clickCount: 5,
              signupCount: 2
            }
          ]
        })
      });

      const result = await ReferralService.getReferralLinks();

      expect(result).toEqual([
        {
          id: 'link-123',
          referralCode: 'REF123',
          clickCount: 5,
          signupCount: 2
        }
      ]);
    });

    it('should get referral stats', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          data: {
            totalReferrals: 10,
            totalEarnings: 5000,
            conversionRate: 20
          }
        })
      });

      const result = await ReferralService.getReferralStats();

      expect(result).toEqual({
        totalReferrals: 10,
        totalEarnings: 5000,
        conversionRate: 20
      });
    });
  });

  describe('Utility Methods', () => {
    it('should generate referral code', () => {
      const code = ReferralService.generateReferralCode('user-123456789');
      expect(code).toMatch(/^SC[A-Z0-9]{6}[A-Z0-9]{4}$/);
    });

    it('should build referral URL', () => {
      const url = ReferralService.buildReferralUrl('REF123');
      expect(url).toBe('http://localhost/join?ref=REF123');
    });

    it('should copy to clipboard', async () => {
      // Mock clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn().mockResolvedValueOnce(undefined)
        },
        writable: true
      });

      const result = await ReferralService.copyToClipboard('test text');
      expect(result).toBe(true);
    });
  });

  describe('Partnership Tiers', () => {
    it('should get partnership tiers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          data: [
            {
              id: 'bronze',
              name: 'Bronze Partner',
              minimumReferrals: 5
            }
          ]
        })
      });

      const result = await ReferralService.getPartnershipTiers();

      expect(result).toEqual([
        {
          id: 'bronze',
          name: 'Bronze Partner',
          minimumReferrals: 5
        }
      ]);
    });

    it('should return default partnership tiers on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const result = await ReferralService.getPartnershipTiers();

      expect(result).toHaveLength(4); // Default tiers
      expect(result[0].id).toBe('bronze');
    });
  });
});