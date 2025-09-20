import React from "react";

const SimpleLanding: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Eloity</h1>
        <p className="text-xl text-gray-600 mb-8">Coming Soon</p>
        <a
          href="/app/feed"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Enter App
        </a>
      </div>
    </div>
  );
};

export default SimpleLanding;
