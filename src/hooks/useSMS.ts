import { useState, useCallback } from 'react';
import { smsService, type SendSMSData, type SendOTPData, type VerifyOTPData, type BulkSMSData } from '@/services/smsService';

export const useSMS = () => {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendSMS = useCallback(async (data: SendSMSData) => {
    setIsSending(true);
    setError(null);
    
    try {
      const result = await smsService.sendSMS(data);
      
      if (!result.success) {
        setError(result.error || 'Failed to send SMS');
        return result;
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  }, []);

  const sendOTP = useCallback(async (data: SendOTPData) => {
    setIsSending(true);
    setError(null);
    
    try {
      const result = await smsService.sendOTP(data);
      
      if (!result.success) {
        setError(result.error || 'Failed to send OTP');
        return result;
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  }, []);

  const verifyOTP = useCallback(async (data: VerifyOTPData) => {
    setIsVerifying(true);
    setError(null);
    
    try {
      const result = await smsService.verifyOTP(data);
      
      if (!result.success) {
        setError(result.error || 'Failed to verify OTP');
        return result;
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const sendBulkSMS = useCallback(async (data: BulkSMSData) => {
    setIsSending(true);
    setError(null);
    
    try {
      const result = await smsService.sendBulkSMS(data);
      
      if (!result.success) {
        setError(result.error || 'Failed to send bulk SMS');
        return result;
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    isSending,
    isVerifying,
    error,
    sendSMS,
    sendOTP,
    verifyOTP,
    sendBulkSMS,
  };
};