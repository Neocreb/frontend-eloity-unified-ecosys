import React from 'react';
import { Link } from 'react-router-dom';
import TestNavigation from './TestNavigation';

const RouteTest: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Route Testing</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Navigation Tests</h2>
        <TestNavigation />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Direct Links</h2>
        <div className="flex flex-wrap gap-4">
          <Link 
            to="/app/live/test-live-stream-id" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Test Live Stream
          </Link>
          <Link 
            to="/app/battle/test-battle-id" 
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Go to Test Battle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RouteTest;
