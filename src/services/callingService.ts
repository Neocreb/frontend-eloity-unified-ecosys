import { supabase } from "@/integrations/supabase/client";

export interface CallSession {
  id: string;
  caller_id: string;
  callee_id: string;
  call_type: 'voice' | 'video';
  status: 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed';
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  call_quality: Record<string, any> | null;
  created_at: string;
}

export interface CallQualityMetrics {
  id: string;
  session_id: string;
  user_id: string;
  connection_time: number | null;
  latency: number | null;
  packet_loss: number | null;
  jitter: number | null;
  bitrate: number | null;
  resolution: string | null;
  frame_rate: number | null;
  recorded_at: string;
}

export interface CallParticipant {
  id: string;
  session_id: string;
  user_id: string;
  role: 'caller' | 'callee' | 'participant';
  joined_at: string | null;
  left_at: string | null;
  is_audio_muted: boolean;
  is_video_enabled: boolean;
  connection_quality: 'excellent' | 'good' | 'poor' | 'unknown';
  created_at: string;
}

class CallingService {
  private baseUrl = '/api/calls';

  // Initiate a call
  async initiateCall(calleeId: string, callType: 'voice' | 'video'): Promise<CallSession | null> {
    try {
      const response = await fetch(`${this.baseUrl}/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calleeId,
          callType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initiate call');
      }

      return result;
    } catch (error) {
      console.error('Call initiation error:', error);
      return null;
    }
  }

  // Accept a call
  async acceptCall(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${sessionId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to accept call');
      }

      return true;
    } catch (error) {
      console.error('Call accept error:', error);
      return false;
    }
  }

  // Reject a call
  async rejectCall(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${sessionId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to reject call');
      }

      return true;
    } catch (error) {
      console.error('Call reject error:', error);
      return false;
    }
  }

  // End a call
  async endCall(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${sessionId}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to end call');
      }

      return true;
    } catch (error) {
      console.error('Call end error:', error);
      return false;
    }
  }

  // Get call session by ID
  async getCallSession(sessionId: string): Promise<CallSession | null> {
    try {
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching call session:', error);
      return null;
    }
  }

  // Get user's call history
  async getCallHistory(userId: string, limit: number = 20): Promise<CallSession[]> {
    try {
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .or(`caller_id.eq.${userId},callee_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching call history:', error);
      return [];
    }
  }

  // Get call quality metrics
  async getCallQualityMetrics(sessionId: string): Promise<CallQualityMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('call_quality_metrics')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching call quality metrics:', error);
      return [];
    }
  }

  // Record call quality metrics
  async recordCallQualityMetrics(metrics: Omit<CallQualityMetrics, 'id' | 'recorded_at'>): Promise<CallQualityMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('call_quality_metrics')
        .insert({
          ...metrics,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording call quality metrics:', error);
      return null;
    }
  }

  // Get active call participants
  async getCallParticipants(sessionId: string): Promise<CallParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('call_participants')
        .select(`
          *,
          user:users!user_id(id, full_name, username, avatar_url)
        `)
        .eq('session_id', sessionId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching call participants:', error);
      return [];
    }
  }

  // Update participant status
  async updateParticipantStatus(participantId: string, updates: Partial<CallParticipant>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('call_participants')
        .update(updates)
        .eq('id', participantId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating participant status:', error);
      return false;
    }
  }

  // Create call participant record
  async createCallParticipant(participant: Omit<CallParticipant, 'id' | 'created_at'>): Promise<CallParticipant | null> {
    try {
      const { data, error } = await supabase
        .from('call_participants')
        .insert({
          ...participant,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating call participant:', error);
      return null;
    }
  }
}

export const callingService = new CallingService();
export default callingService;