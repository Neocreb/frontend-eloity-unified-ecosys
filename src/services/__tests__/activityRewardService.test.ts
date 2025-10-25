// @ts-nocheck
import { ActivityRewardService } from '../activityRewardService';

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
  handleMarketplacePurchaseReward: jest.fn(),
  handleProductSoldReward: jest.fn(),
};

jest.mock('../enhancedEloitsService', () => ({
  enhancedEloitsService: mockEnhancedEloitsService,
}));

// Mock fetch
global.fetch = jest.fn();

describe('Activity Reward Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-token');
  });

  describe('Marketplace Activities', () => {
    it('should handle marketplace purchase reward', async () => {
      mockEnhancedEloitsService.handleMarketplacePurchaseReward.mockResolvedValueOnce({
        success: true,
        amount: 110,
        message: 'Successfully earned 110 ELO for marketplace purchase!'
      });

      const result = await ActivityRewardService.logPurchase('user-123', 'product-456', 10000, {});

      expect(result.success).toBe(true);
      expect(result.eloits).toBe(110);
      expect(mockEnhancedEloitsService.handleMarketplacePurchaseReward).toHaveBeenCalledWith(
        'user-123',
        10000,
        'product-456'
      );
    });

    it('should handle product sold reward', async () => {
      mockEnhancedEloitsService.handleProductSoldReward.mockResolvedValueOnce({
        success: true,
        amount: 1125,
        message: 'Successfully earned 1125 ELO for selling product!'
      });

      const result = await ActivityRewardService.logProductSold('user-123', 'product-456', {});

      expect(result.success).toBe(true);
      expect(result.eloits).toBe(1125);
      expect(mockEnhancedEloitsService.handleProductSoldReward).toHaveBeenCalledWith(
        'user-123',
        'product-456'
      );
    });
  });

  describe('Social Activities', () => {
    it('should log post creation', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: true,
          eloits: 3,
          walletBonus: 0,
          newTrustScore: 0,
          riskScore: 0,
          message: 'Reward earned!'
        })
      });

      const result = await ActivityRewardService.logPostCreated('user-123', 'post-456', {});

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/creator/reward',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });

    it('should log post like', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: true,
          eloits: 0.5,
          walletBonus: 0,
          newTrustScore: 0,
          riskScore: 0,
          message: 'Reward earned!'
        })
      });

      const result = await ActivityRewardService.logPostLiked('user-123', 'post-456', 30);

      expect(result.success).toBe(true);
    });

    it('should log comment', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: true,
          eloits: 1.5,
          walletBonus: 0,
          newTrustScore: 0,
          riskScore: 0,
          message: 'Reward earned!'
        })
      });

      const result = await ActivityRewardService.logComment('user-123', 'post-456', 100);

      expect(result.success).toBe(true);
    });

    it('should log share', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: true,
          eloits: 2,
          walletBonus: 0,
          newTrustScore: 0,
          riskScore: 0,
          message: 'Reward earned!'
        })
      });

      const result = await ActivityRewardService.logShare('user-123', 'post-456', 'post');

      expect(result.success).toBe(true);
    });
  });

  describe('Daily Activities', () => {
    it('should log daily login', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: true,
          eloits: 5,
          walletBonus: 0,
          newTrustScore: 0,
          riskScore: 0,
          message: 'Reward earned!'
        })
      });

      const result = await ActivityRewardService.logDailyLogin('user-123');

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing auth token', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

      const result = await ActivityRewardService.logPostCreated('user-123', 'post-456', {});

      expect(result.success).toBe(false);
      expect(result.status).toBe('no_auth');
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await ActivityRewardService.logPostCreated('user-123', 'post-456', {});

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
    });

    it('should handle non-ok responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      const result = await ActivityRewardService.logPostCreated('user-123', 'post-456', {});

      expect(result.success).toBe(false);
      expect(result.status).toBe('error');
    });
  });
});