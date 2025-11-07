import React, { useState, useEffect } from 'react';
import { useCalling } from '@/hooks/useCalling';
import { VoiceVideoCall } from '@/components/chat/VoiceVideoCall';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Video, History, User } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface CallManagerProps {
  onCallStarted?: (sessionId: string) => void;
  onCallEnded?: (sessionId: string) => void;
}

const CallManager: React.FC<CallManagerProps> = ({ onCallStarted, onCallEnded }) => {
  const { user } = useAuth();
  const userId = user?.id || '';
  
  const {
    activeCall,
    callParticipants,
    isReceivingCall,
    callHistory,
    loading,
    error,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    fetchCallHistory,
    updateParticipantStatus,
    setActiveCall,
    setIsReceivingCall,
  } = useCalling(userId);

  const [calleeId, setCalleeId] = useState('');
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [showHistory, setShowHistory] = useState(false);

  // Fetch call history on mount
  useEffect(() => {
    if (userId) {
      fetchCallHistory();
    }
  }, [userId, fetchCallHistory]);

  const handleInitiateCall = async () => {
    if (!calleeId) {
      alert('Please enter a user ID to call');
      return;
    }

    const result = await initiateCall(calleeId, callType);
    
    if (result.success && result.session) {
      onCallStarted?.(result.session.id);
    }
  };

  const handleAcceptCall = async () => {
    if (activeCall) {
      const result = await acceptCall(activeCall.id);
      
      if (result.success) {
        onCallStarted?.(activeCall.id);
      }
    }
  };

  const handleRejectCall = async () => {
    if (activeCall) {
      await rejectCall(activeCall.id);
      setIsReceivingCall(false);
      setActiveCall(null);
    }
  };

  const handleEndCall = async () => {
    if (activeCall) {
      await endCall(activeCall.id);
      onCallEnded?.(activeCall.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Connected</span>;
      case 'ended':
        return <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">Ended</span>;
      case 'missed':
        return <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">Missed</span>;
      default:
        return <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Ringing</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Call initiation form */}
      {!activeCall && !isReceivingCall && (
        <Card>
          <CardHeader>
            <CardTitle>Start a Call</CardTitle>
            <CardDescription>Initiate a voice or video call with another user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calleeId">User ID to Call</Label>
              <Input
                id="calleeId"
                placeholder="Enter user ID"
                value={calleeId}
                onChange={(e) => setCalleeId(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="callType">Call Type</Label>
              <Select value={callType} onValueChange={(value: 'voice' | 'video') => setCallType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select call type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voice">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Voice Call
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video Call
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleInitiateCall} 
              disabled={loading || !calleeId}
              className="w-full"
            >
              {loading ? 'Calling...' : callType === 'video' ? 'Start Video Call' : 'Start Voice Call'}
            </Button>
            
            {error && (
              <div className="text-red-500 text-sm">
                Error: {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Incoming call notification */}
      {isReceivingCall && activeCall && (
        <VoiceVideoCall
          isOpen={true}
          onClose={handleRejectCall}
          callType={activeCall.call_type}
          participants={callParticipants.map(p => ({
            id: p.user_id,
            name: p.user?.full_name || 'Unknown User',
            avatar: p.user?.avatar_url || '',
            isAudioMuted: p.is_audio_muted,
            isVideoEnabled: p.is_video_enabled,
            isScreenSharing: false,
            connectionQuality: p.connection_quality,
          }))}
          currentUser={{
            id: userId,
            name: user?.user_metadata?.full_name || 'You',
            avatar: user?.user_metadata?.avatar_url || '',
            isAudioMuted: false,
            isVideoEnabled: activeCall.call_type === 'video',
            isScreenSharing: false,
            connectionQuality: 'excellent',
          }}
          onToggleAudio={() => {}}
          onToggleVideo={() => {}}
          onToggleScreenShare={() => {}}
          onEndCall={handleRejectCall}
          isIncoming={true}
          onAcceptCall={handleAcceptCall}
          onDeclineCall={handleRejectCall}
        />
      )}

      {/* Active call interface */}
      {activeCall && !isReceivingCall && (
        <VoiceVideoCall
          isOpen={true}
          onClose={handleEndCall}
          callType={activeCall.call_type}
          participants={callParticipants.map(p => ({
            id: p.user_id,
            name: p.user?.full_name || 'Unknown User',
            avatar: p.user?.avatar_url || '',
            isAudioMuted: p.is_audio_muted,
            isVideoEnabled: p.is_video_enabled,
            isScreenSharing: false,
            connectionQuality: p.connection_quality,
          }))}
          currentUser={{
            id: userId,
            name: user?.user_metadata?.full_name || 'You',
            avatar: user?.user_metadata?.avatar_url || '',
            isAudioMuted: false,
            isVideoEnabled: activeCall.call_type === 'video',
            isScreenSharing: false,
            connectionQuality: 'excellent',
          }}
          onToggleAudio={() => {}}
          onToggleVideo={() => {}}
          onToggleScreenShare={() => {}}
          onEndCall={handleEndCall}
        />
      )}

      {/* Call history */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Call History</CardTitle>
              <CardDescription>Your recent calls</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </CardHeader>
        
        {showHistory && (
          <CardContent>
            {callHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No call history yet
              </div>
            ) : (
              <div className="space-y-3">
                {callHistory.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        {call.call_type === 'video' ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <Phone className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {call.caller_id === userId ? 'Outgoing' : 'Incoming'} {call.call_type} call
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(call.created_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(call.status)}
                      {call.duration_seconds && (
                        <span className="text-sm text-gray-500">
                          {Math.floor(call.duration_seconds / 60)}:{(call.duration_seconds % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default CallManager;