import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Video,
  Square,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  Share2,
  ArrowLeft,
  Settings,
  Check,
  X,
  Upload,
  Loader2,
  Timer,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { requestCameraAccess, stopCameraStream, CameraError } from '@/utils/cameraPermissions';
import CameraPermissionDialog from '@/components/ui/camera-permission-dialog';

interface DuetRecorderProps {
  originalVideo: {
    id: string;
    url: string;
    duration: number;
    creatorUsername: string;
    creatorId: string;
    title: string;
    thumbnail?: string;
  };
  duetStyle: 'side-by-side' | 'react-respond' | 'picture-in-picture';
  onCancel: () => void;
  onComplete: (duetData: {
    videoBlob: Blob;
    duetVideoUrl: string;
    audioSource: 'original' | 'both' | 'voiceover';
    caption: string;
    tags: string[];
  }) => void;
}

const DuetRecorder: React.FC<DuetRecorderProps> = ({
  originalVideo,
  duetStyle,
  onCancel,
  onComplete,
}) => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Permission state
  const [permissionState, setPermissionState] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');
  const [permissionError, setPermissionError] = useState<string>('');
  
  // Audio/Video settings
  const [audioSource, setAudioSource] = useState<'original' | 'both' | 'voiceover'>('both');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [originalAudioEnabled, setOriginalAudioEnabled] = useState(true);
  const [micVolume, setMicVolume] = useState([80]);
  const [originalVolume, setOriginalVolume] = useState([60]);
  
  // Video refs
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const recordedVideoRef = useRef<HTMLVideoElement>(null);
  
  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Post creation state
  const [caption, setCaption] = useState(`Duet with @${originalVideo.creatorUsername}`);
  const [tags, setTags] = useState<string[]>(['duet', originalVideo.creatorUsername]);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [duetVideoUrl, setDuetVideoUrl] = useState<string>('');
  
  const { toast } = useToast();

  // Initialize camera and original video
  useEffect(() => {
    initializeMedia();
    return () => {
      cleanup();
    };
  }, []);

  const initializeMedia = async () => {
    try {
      setPermissionState('checking');

      // Use the shared camera permissions utility
      const result = await requestCameraAccess({
        video: {
          width: { ideal: 720 },
          height: { ideal: 1280 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        },
        audio: true
      });

      if (result.error) {
        setPermissionState('denied');
        setPermissionError(result.error.message);
        return;
      }

      if (result.stream) {
        streamRef.current = result.stream;
        setPermissionState('granted');

        if (userVideoRef.current) {
          userVideoRef.current.srcObject = result.stream;
        }

        // Load original video
        if (originalVideoRef.current) {
          originalVideoRef.current.src = originalVideo.url;
          originalVideoRef.current.muted = !originalAudioEnabled;
          originalVideoRef.current.currentTime = 0;
        }

        toast({
          title: 'Camera Ready!',
          description: 'You can now start recording your duet.',
        });
      }
    } catch (error: any) {
      console.error('Error accessing media:', error);
      setPermissionState('denied');
      
      let errorMessage = 'Unable to access camera and microphone.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access was denied. Please click "Allow" when prompted and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect a camera and microphone and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera does not meet the required specifications. Trying with basic settings...';
        // Try with minimal constraints
        setTimeout(() => initializeMedia(), 1000);
        return;
      }
      
      setPermissionError(errorMessage);
      toast({
        title: 'Camera Access Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      stopCameraStream(streamRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    if (!streamRef.current || permissionState !== 'granted') {
      toast({
        title: 'Camera Not Ready',
        description: 'Please allow camera access before recording.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Reset recording state
      recordedChunksRef.current = [];
      setRecordingTime(0);
      
      // Setup media recorder
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        processRecording();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      // Start original video playback
      if (originalVideoRef.current) {
        originalVideoRef.current.currentTime = 0;
        originalVideoRef.current.play();
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Stop recording when original video ends
          if (newTime >= originalVideo.duration * 1000) {
            stopRecording();
          }
          return newTime;
        });
      }, 100);

      toast({
        title: 'Recording Started',
        description: 'Recording your duet video...',
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Failed to start recording. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (originalVideoRef.current) {
      originalVideoRef.current.pause();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (originalVideoRef.current) {
        originalVideoRef.current.pause();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      if (originalVideoRef.current) {
        originalVideoRef.current.play();
      }
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= originalVideo.duration * 1000) {
            stopRecording();
          }
          return newTime;
        });
      }, 100);
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    
    try {
      // Create blob from recorded chunks
      const recordedBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setRecordedVideoBlob(recordedBlob);

      // Create a temporary URL for preview
      const videoUrl = URL.createObjectURL(recordedBlob);
      setDuetVideoUrl(videoUrl);

      // Show preview
      setShowPreview(true);
      
      toast({
        title: 'Recording Complete',
        description: 'Your duet has been recorded successfully!',
      });

    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process recording. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const retakeRecording = () => {
    if (duetVideoUrl) {
      URL.revokeObjectURL(duetVideoUrl);
    }
    setRecordedVideoBlob(null);
    setDuetVideoUrl('');
    setShowPreview(false);
    setRecordingTime(0);
    recordedChunksRef.current = [];
  };

  const publishDuet = () => {
    if (!recordedVideoBlob) return;

    onComplete({
      videoBlob: recordedVideoBlob,
      duetVideoUrl,
      audioSource,
      caption,
      tags,
    });
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDuetLayoutClass = () => {
    switch (duetStyle) {
      case 'side-by-side':
        return 'grid grid-cols-2 gap-2';
      case 'picture-in-picture':
        return 'relative';
      case 'react-respond':
        return 'flex flex-col gap-2';
      default:
        return 'grid grid-cols-2 gap-2';
    }
  };

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
          <Button variant="ghost" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Edit
          </Button>
          <h2 className="text-lg font-semibold text-white">Preview Duet</h2>
          <Button onClick={publishDuet} className="bg-red-600 hover:bg-red-700">
            <Upload className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>

        {/* Preview Video */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-sm w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
            {duetVideoUrl && (
              <video
                src={duetVideoUrl}
                controls
                className="w-full h-full object-cover"
                autoPlay
                loop
              />
            )}
          </div>
        </div>

        {/* Caption and Tags */}
        <div className="p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto space-y-4">
            <div>
              <Label htmlFor="caption" className="text-white">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="Write a caption for your duet..."
              />
            </div>
            
            <div>
              <Label className="text-white">Tags</Label>
              <Input
                value={tags.join(', ')}
                onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="duet, collaboration, fun"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Permission request UI
  if (permissionState === 'checking') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Setting up your camera...</h2>
          <p className="text-gray-400">Please wait while we prepare the duet recorder</p>
        </div>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
          <Button variant="ghost" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold text-white">Camera Permission Required</h2>
          <div></div>
        </div>

        {/* Permission Request Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md text-center text-white">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-red-400" />
            </div>

            <h3 className="text-2xl font-bold mb-4">Camera Access Needed</h3>
            <p className="text-gray-300 mb-6">{permissionError}</p>

            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 text-left">
                <h4 className="font-semibold mb-2">To enable camera access:</h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <div>
                    <strong>Chrome/Edge:</strong> Click the camera icon in the address bar and select "Allow"
                  </div>
                  <div>
                    <strong>Firefox:</strong> Click "Allow" in the permission popup
                  </div>
                  <div>
                    <strong>Safari:</strong> Go to Safari → Settings → Websites → Camera and enable access
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    💡 If you accidentally clicked "Block", you may need to refresh the page and try again
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={initializeMedia}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (permissionState === 'prompt') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
        <div className="text-center text-white">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Camera className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Allow Camera Access</h2>
          <p className="text-gray-400 mb-4">Please click "Allow" when prompted by your browser</p>
          <p className="text-sm text-gray-500">This is required to record your duet video</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white">
            Duet with @{originalVideo.creatorUsername}
          </h2>
          <Badge variant="secondary" className="mt-1">
            {duetStyle.replace('-', ' ')}
          </Badge>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Recording Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative max-w-sm w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
          <div className={getDuetLayoutClass()}>
            {/* Original Video */}
            <div className={cn(
              "relative",
              duetStyle === 'picture-in-picture' && "absolute inset-0",
              duetStyle === 'react-respond' && "h-1/2"
            )}>
              <video
                ref={originalVideoRef}
                className="w-full h-full object-cover"
                muted={!originalAudioEnabled}
                playsInline
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-blue-600 text-white">
                  @{originalVideo.creatorUsername}
                </Badge>
              </div>
            </div>

            {/* User Video */}
            <div className={cn(
              "relative",
              duetStyle === 'picture-in-picture' && "absolute bottom-4 right-4 w-24 h-32 rounded-lg overflow-hidden border-2 border-white",
              duetStyle === 'react-respond' && "h-1/2"
            )}>
              <video
                ref={userVideoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-red-600 text-white">You</Badge>
              </div>
            </div>
          </div>

          {/* Recording Overlay */}
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-mono">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}

          {/* Timer Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div
              className="h-full bg-red-500 transition-all duration-100"
              style={{
                width: `${Math.min((recordingTime / (originalVideo.duration * 1000)) * 100, 100)}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="p-4 bg-black/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white">Audio Mix</Label>
            <div className="flex gap-2">
              {['original', 'both', 'voiceover'].map((source) => (
                <Button
                  key={source}
                  variant={audioSource === source ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAudioSource(source as any)}
                  className="capitalize"
                >
                  {source === 'original' ? 'Original Only' : 
                   source === 'both' ? 'Both' : 'Voice Only'}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Your Mic</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMicEnabled(!isMicEnabled)}
                >
                  {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
              </div>
              <Slider
                value={micVolume}
                onValueChange={setMicVolume}
                max={100}
                step={1}
                disabled={!isMicEnabled}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white">Original Audio</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOriginalAudioEnabled(!originalAudioEnabled)}
                >
                  {originalAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
              <Slider
                value={originalVolume}
                onValueChange={setOriginalVolume}
                max={100}
                step={1}
                disabled={!originalAudioEnabled}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="p-4 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <>
              <Button
                variant="outline"
                onClick={retakeRecording}
                disabled={!recordedVideoBlob}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button
                size="lg"
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16"
                disabled={isProcessing || permissionState !== 'granted'}
              >
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Video className="w-6 h-6" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={!recordedVideoBlob}
              >
                Preview
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={stopRecording}
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
              <Button
                size="lg"
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="rounded-full w-16 h-16"
              >
                {isPaused ? (
                  <Play className="w-6 h-6" />
                ) : (
                  <Pause className="w-6 h-6" />
                )}
              </Button>
              <div className="text-white text-sm">
                Recording...
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuetRecorder;
