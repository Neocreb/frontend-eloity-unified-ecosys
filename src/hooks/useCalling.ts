import { useState, useEffect, useCallback } from 'react';
import { callingService } from '@/services/callingService';
import type { CallSession, CallParticipant } from '@/services/callingService';

export const useCalling = (userId: string) => {
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [callParticipants, setCallParticipants] = useState<CallParticipant[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [callHistory, setCallHistory] = useState<CallSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize call state
  const initializeCall = useCallback((session: CallSession) => {
    setActiveCall(session);
    setIsCalling(session.caller_id === userId);
    setIsReceivingCall(session.callee_id === userId && session.status === 'ringing');
  }, [userId]);

  // Initiate a call
  const initiateCall = useCallback(async (calleeId: string, callType: 'voice' | 'video') => {
    setLoading(true);
    setError(null);
    
    try {
      const session = await callingService.initiateCall(calleeId, callType);
      
      if (session) {
        initializeCall(session);
        return { success: true, session };
      } else {
        throw new Error('Failed to initiate call');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate call';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [initializeCall]);

  // Accept an incoming call
  const acceptCall = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await callingService.acceptCall(sessionId);
      
      if (success && activeCall) {
        const updatedCall: CallSession = { 
          ...activeCall, 
          status: 'connected' as const
        };
        setActiveCall(updatedCall);
        setIsReceivingCall(false);
        return { success: true };
      } else {
        throw new Error('Failed to accept call');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept call';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [activeCall]);

  // Reject or end a call
  const endCall = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await callingService.endCall(sessionId);
      
      if (success) {
        setActiveCall(null);
        setIsCalling(false);
        setIsReceivingCall(false);
        setCallParticipants([]);
        return { success: true };
      } else {
        throw new Error('Failed to end call');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end call';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reject an incoming call
  const rejectCall = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await callingService.rejectCall(sessionId);
      
      if (success) {
        setActiveCall(null);
        setIsReceivingCall(false);
        return { success: true };
      } else {
        throw new Error('Failed to reject call');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject call';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch call history
  const fetchCallHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const history = await callingService.getCallHistory(userId);
      setCallHistory(history);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch call history';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch call participants
  const fetchCallParticipants = useCallback(async (sessionId: string) => {
    try {
      const participants = await callingService.getCallParticipants(sessionId);
      setCallParticipants(participants);
    } catch (err) {
      console.error('Error fetching call participants:', err);
    }
  }, []);

  // Update participant status (mute/unmute, video on/off)
  const updateParticipantStatus = useCallback(async (participantId: string, updates: Partial<CallParticipant>) => {
    try {
      const success = await callingService.updateParticipantStatus(participantId, updates);
      
      if (success) {
        // Update local state
        setCallParticipants(prev => 
          prev.map(p => 
            p.id === participantId ? { ...p, ...updates } : p
          )
        );
      }
      
      return success;
    } catch (err) {
      console.error('Error updating participant status:', err);
      return false;
    }
  }, []);

  // Listen for incoming calls (this would typically use WebSockets or Supabase realtime)
  useEffect(() => {
    // In a real implementation, you would set up a listener for incoming calls
    // For now, we'll just simulate with a mock implementation
    
    // This is where you would connect to a WebSocket or Supabase realtime channel
    // to listen for incoming call notifications
    
    return () => {
      // Clean up listeners
    };
  }, [userId]);

  // Update call participants when active call changes
  useEffect(() => {
    if (activeCall) {
      fetchCallParticipants(activeCall.id);
    }
  }, [activeCall, fetchCallParticipants]);

  return {
    // State
    activeCall,
    callParticipants,
    isCalling,
    isReceivingCall,
    callHistory,
    loading,
    error,
    
    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    fetchCallHistory,
    updateParticipantStatus,
    
    // Utilities
    setActiveCall,
    setIsReceivingCall,
  };
};