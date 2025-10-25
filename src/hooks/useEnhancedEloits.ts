// @ts-nocheck
import { useState, useEffect } from 'react';
import { enhancedEloitsService } from '@/services/enhancedEloitsService';

export const useEnhancedEloits = (userId: string | null) => {
  const [userEloitsData, setUserEloitsData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [trustHistory, setTrustHistory] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user's Eloits data
        const userData = await enhancedEloitsService.getUserEloitsData(userId);
        setUserEloitsData(userData);

        // Fetch transaction history
        const transactionData = await enhancedEloitsService.getTransactionHistory(userId);
        setTransactions(transactionData);

        // Fetch trust history
        const trustData = await enhancedEloitsService.getTrustHistory(userId);
        setTrustHistory(trustData);

        // Fetch referrals
        const referralData = await enhancedEloitsService.getUserReferrals(userId);
        setReferrals(referralData);

        // Fetch redemptions
        const redemptionData = await enhancedEloitsService.getRedemptions(userId);
        setRedemptions(redemptionData);
      } catch (err) {
        console.error('Error fetching Eloits data:', err);
        setError('Failed to fetch Eloits data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const awardPoints = async (actionType: string, metadata: Record<string, any> = {}) => {
    if (!userId) return null;

    try {
      const result = await enhancedEloitsService.awardPoints(userId, actionType, metadata);
      if (result?.success) {
        // Refresh user data after successful award
        const userData = await enhancedEloitsService.getUserEloitsData(userId);
        setUserEloitsData(userData);
        
        // Refresh transactions
        const transactionData = await enhancedEloitsService.getTransactionHistory(userId);
        setTransactions(transactionData);
      }
      return result;
    } catch (err) {
      console.error('Error awarding points:', err);
      setError('Failed to award points');
      return null;
    }
  };

  const updateTrustScore = async (scoreChange: number, reason: string, activityType?: string) => {
    if (!userId) return false;

    try {
      const result = await enhancedEloitsService.updateTrustScore(userId, scoreChange, reason, activityType);
      if (result) {
        // Refresh user data after successful trust score update
        const userData = await enhancedEloitsService.getUserEloitsData(userId);
        setUserEloitsData(userData);
        
        // Refresh trust history
        const trustData = await enhancedEloitsService.getTrustHistory(userId);
        setTrustHistory(trustData);
      }
      return result;
    } catch (err) {
      console.error('Error updating trust score:', err);
      setError('Failed to update trust score');
      return false;
    }
  };

  const requestRedemption = async (amount: number, payoutMethod: string, payoutDetails: Record<string, any>) => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    try {
      const result = await enhancedEloitsService.requestRedemption(userId, amount, payoutMethod, payoutDetails);
      if (result.success) {
        // Refresh redemptions after successful request
        const redemptionData = await enhancedEloitsService.getRedemptions(userId);
        setRedemptions(redemptionData);
      }
      return result;
    } catch (err) {
      console.error('Error requesting redemption:', err);
      setError('Failed to request redemption');
      return { success: false, message: 'Failed to request redemption' };
    }
  };

  const processReferral = async (refereeId: string, referralCode: string) => {
    if (!userId) return { success: false, message: 'User not authenticated' };

    try {
      const result = await enhancedEloitsService.processMultiLevelReferral(userId, refereeId, referralCode);
      if (result.success) {
        // Refresh referrals after successful processing
        const referralData = await enhancedEloitsService.getUserReferrals(userId);
        setReferrals(referralData);
        
        // Refresh user data
        const userData = await enhancedEloitsService.getUserEloitsData(userId);
        setUserEloitsData(userData);
      }
      return result;
    } catch (err) {
      console.error('Error processing referral:', err);
      setError('Failed to process referral');
      return { success: false, message: 'Failed to process referral' };
    }
  };

  const getSystemConfig = async () => {
    try {
      const config = await enhancedEloitsService.getSystemConfig();
      return config;
    } catch (err) {
      console.error('Error fetching system config:', err);
      setError('Failed to fetch system config');
      return null;
    }
  };

  const checkForSpam = async (actionType: string) => {
    if (!userId) return { isSpam: false };

    try {
      const result = await enhancedEloitsService.checkForSpam(userId, actionType);
      return result;
    } catch (err) {
      console.error('Error checking for spam:', err);
      return { isSpam: false };
    }
  };

  return {
    userEloitsData,
    transactions,
    trustHistory,
    referrals,
    redemptions,
    loading,
    error,
    awardPoints,
    updateTrustScore,
    requestRedemption,
    processReferral,
    getSystemConfig,
    checkForSpam
  };
};