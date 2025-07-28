import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Radio, Video } from 'lucide-react';
import { useLiveContentContext } from '../../contexts/LiveContentContext';
import { useToast } from '../../hooks/use-toast';

const LiveStreamTest: React.FC = () => {
  const { addLiveStream, allLiveContent } = useLiveContentContext();
  const { toast } = useToast();

  const handleTestStream = () => {
    const streamId = addLiveStream({
      title: "Test Live Stream",
      description: "Testing the live streaming functionality",
      category: "test",
    });
    
    toast({
      title: "Test Stream Created!",
      description: `Stream ID: ${streamId}`,
    });
  };

  const handleTestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      toast({
        title: "Camera Test Successful!",
        description: "Camera and microphone are working",
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: "Camera Test Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5" />
          Live Stream Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Current live content count: {allLiveContent.length}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            User-owned streams: {allLiveContent.filter(c => c.isUserOwned).length}
          </p>
        </div>

        <Button 
          onClick={handleTestCamera}
          className="w-full flex items-center gap-2"
          variant="outline"
        >
          <Video className="w-4 h-4" />
          Test Camera Access
        </Button>

        <Button 
          onClick={handleTestStream}
          className="w-full flex items-center gap-2"
        >
          <Radio className="w-4 h-4" />
          Create Test Stream
        </Button>

        {allLiveContent.map(content => (
          <div key={content.id} className="p-2 bg-gray-100 rounded text-sm">
            <div>ID: {content.id}</div>
            <div>Title: {content.title}</div>
            <div>User Owned: {content.isUserOwned ? 'Yes' : 'No'}</div>
            <div>Active: {content.isActive ? 'Yes' : 'No'}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LiveStreamTest;
