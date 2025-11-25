import { useState, useCallback } from 'react';

export interface KYCTriggerState {
  isOpen: boolean;
  feature: string;
  reason: string;
  requiresKYC: boolean;
}

const FEATURE_TRIGGERS = {
  'marketplace_sell': 'Enable seller features to list products',
  'crypto_trade': 'Complete verification to start trading crypto',
  'freelance_offer': 'Verify to post freelance services',
  'withdraw_earnings': 'Verify your identity to withdraw earnings',
  'creator_fund': 'Complete verification to access creator monetization',
};

export function useKYCTrigger() {
  const [kycState, setKYCState] = useState<KYCTriggerState>({
    isOpen: false,
    feature: 'withdraw_earnings',
    reason: 'This feature requires verification',
    requiresKYC: false,
  });

  /**
   * Open KYC modal with specific feature
   */
  const triggerKYC = useCallback((feature: string, reason?: string) => {
    setKYCState({
      isOpen: true,
      feature,
      reason: reason || (FEATURE_TRIGGERS[feature as keyof typeof FEATURE_TRIGGERS] || 'This feature requires verification'),
      requiresKYC: true,
    });
  }, []);

  /**
   * Open KYC modal from API error
   */
  const handleKYCError = useCallback((error: any) => {
    if (error?.response?.status === 403 && error?.response?.data?.code === 'KYC_REQUIRED') {
      const { feature } = error.response.data;
      triggerKYC(feature, error.response.data.message);
      return true;
    }
    return false;
  }, [triggerKYC]);

  /**
   * Close KYC modal
   */
  const closeKYC = useCallback(() => {
    setKYCState(prev => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Reset KYC state
   */
  const resetKYC = useCallback(() => {
    setKYCState({
      isOpen: false,
      feature: 'withdraw_earnings',
      reason: 'This feature requires verification',
      requiresKYC: false,
    });
  }, []);

  return {
    kycState,
    triggerKYC,
    handleKYCError,
    closeKYC,
    resetKYC,
  };
}
