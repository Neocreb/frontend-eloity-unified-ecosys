import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TestNavigation: React.FC = () => {
  const navigate = useNavigate();
  
  const testLiveNavigation = () => {
    // Test with a known ID or a generated one for testing
    const testId = 'test-live-stream-id';
    console.log('Navigating to live stream with ID:', testId);
    navigate(`/app/live/${testId}`);
  };
  
  const testBattleNavigation = () => {
    // Test with a known ID or a generated one for testing
    const testId = 'test-battle-id';
    console.log('Navigating to battle with ID:', testId);
    navigate(`/app/battle/${testId}`);
  };
  
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Test Navigation</h2>
      <p>Click the buttons below to test navigation to live streams and battles:</p>
      
      <div className="flex gap-4">
        <Button onClick={testLiveNavigation}>
          Test Live Stream Navigation
        </Button>
        <Button onClick={testBattleNavigation}>
          Test Battle Navigation
        </Button>
      </div>
    </div>
  );
};

export default TestNavigation;