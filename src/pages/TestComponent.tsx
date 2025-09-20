import React, { useState, useEffect } from "react";

const TestComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("TestComponent mounted successfully");
  }, []);

  const handleIncrement = () => {
    setCount((prevCount) => prevCount + 1);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          React Test Component
        </h1>

        <p className="text-gray-600 mb-6">React hooks are working!</p>

        <div className="mb-6">
          <p className="text-lg text-gray-800 mb-4">Count: {count}</p>

          <button
            onClick={handleIncrement}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            type="button"
          >
            Increment
          </button>
        </div>

        <a
          href="/app/feed"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
        >
          Go to Feed (Direct Link)
        </a>
      </div>
    </div>
  );
};

export default TestComponent;
