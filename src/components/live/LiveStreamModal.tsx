import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Radio, 
  Video, 
  Users, 
  Globe, 
  Lock, 
  Eye, 
  Settings,
  Play,
  Square
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { liveStreamService } from '@/services/liveStreamService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LiveStreamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStreamStart?: (streamId: string) => void;
}

const LiveStreamModal: React.FC<LiveStreamModalProps> = ({ 
  open, 
  onOpenChange,
  onStreamStart
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [streamCategory, setStreamCategory] = useState('general');
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const categories = [
    { value: 'general', label: 'General' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'music', label: 'Music' },
    { value: 'art', label: 'Art' },
    { value: 'education', label: 'Education' },
    { value: 'cooking', label: 'Cooking' },
    { value: 'travel', label: 'Travel' },
    { value: 'sports', label: 'Sports' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'tech', label: 'Technology' },
  ];
  
  const handleCreateStream = async () => {
    if (!streamTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your stream.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const stream = await liveStreamService.createLiveStream({
        title: streamTitle,
        description: streamDescription,
        category: streamCategory,
      });
      
      toast({
        title: "Stream Created!",
        description: "Your live stream is ready to start.",
      });
      
      onOpenChange(false);
      onStreamStart?.(stream.id);
      navigate(`/app/live/${stream.id}`);
    } catch (error) {
      console.error("Error creating stream:", error);
      toast({
        title: "Error",
        description: "Failed to create stream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500" />
            Go Live
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Stream Preview */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Video className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Camera preview</p>
              </div>
            </div>
            
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-black/50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500 text-white text-xs">
                    LIVE PREVIEW
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {streamTitle || 'Untitled Stream'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stream Information */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Stream Title *
              </label>
              <Input
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="What are you streaming today?"
                maxLength={100}
                className="text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                {streamTitle.length}/100
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                Description
              </label>
              <Textarea
                value={streamDescription}
                onChange={(e) => setStreamDescription(e.target.value)}
                placeholder="Tell your audience what to expect..."
                rows={3}
                maxLength={500}
                className="text-base resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {streamDescription.length}/500
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                Category
              </label>
              <Select value={streamCategory} onValueChange={setStreamCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                Privacy
              </label>
              <Select value={privacy} onValueChange={(value: any) => setPrivacy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="unlisted">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Unlisted
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Private
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Enable Chat</div>
                  <div className="text-xs text-gray-500">Allow viewers to chat during your stream</div>
                </div>
                <Switch
                  checked={chatEnabled}
                  onCheckedChange={setChatEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Record Stream</div>
                  <div className="text-xs text-gray-500">Save this stream to your videos</div>
                </div>
                <Switch
                  checked={recordingEnabled}
                  onCheckedChange={setRecordingEnabled}
                />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateStream}
              className="flex-1 bg-red-500 hover:bg-red-600"
              disabled={!streamTitle.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 mr-2" />
                  Go Live
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveStreamModal;