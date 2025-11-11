import React, { useEffect } from "react";
import { viteEnvVars } from "./vite-env-test";

const TestEnvVars: React.FC = () => {
  const [envVars, setEnvVars] = React.useState<Record<string, string>>({});
  const [processEnvVars, setProcessEnvVars] = React.useState<Record<string, string>>({});

  useEffect(() => {
    // This will run in the browser
    setEnvVars({
      VITE_SUPABASE_URL: viteEnvVars.VITE_SUPABASE_URL || "NOT SET",
      VITE_SUPABASE_PUBLISHABLE_KEY: viteEnvVars.VITE_SUPABASE_PUBLISHABLE_KEY || "NOT SET",
    });
    
    // Also check process.env if available
    if (typeof process !== 'undefined' && process.env) {
      setProcessEnvVars({
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || "NOT SET",
        VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "NOT SET",
      });
    }
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">From import.meta.env:</h2>
        <div className="space-y-2">
          <div>
            <strong>VITE_SUPABASE_URL:</strong>
            <div className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
              {envVars.VITE_SUPABASE_URL}
            </div>
          </div>
          <div>
            <strong>VITE_SUPABASE_PUBLISHABLE_KEY:</strong>
            <div className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
              {envVars.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 30) + (envVars.VITE_SUPABASE_PUBLISHABLE_KEY?.length > 30 ? "..." : "")}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">From process.env:</h2>
        <div className="space-y-2">
          <div>
            <strong>VITE_SUPABASE_URL:</strong>
            <div className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
              {processEnvVars.VITE_SUPABASE_URL}
            </div>
          </div>
          <div>
            <strong>VITE_SUPABASE_PUBLISHABLE_KEY:</strong>
            <div className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
              {processEnvVars.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 30) + (processEnvVars.VITE_SUPABASE_PUBLISHABLE_KEY?.length > 30 ? "..." : "")}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Validation:</h2>
        <div className="space-y-2">
          {envVars.VITE_SUPABASE_URL === "NOT SET" && (
            <div className="text-red-500 font-bold">
              ERROR: VITE_SUPABASE_URL not loaded correctly!
            </div>
          )}
          {envVars.VITE_SUPABASE_URL && envVars.VITE_SUPABASE_URL.includes("your_") && (
            <div className="text-red-500 font-bold">
              ERROR: VITE_SUPABASE_URL using placeholder values instead of real credentials!
            </div>
          )}
          {envVars.VITE_SUPABASE_PUBLISHABLE_KEY === "NOT SET" && (
            <div className="text-red-500 font-bold">
              ERROR: VITE_SUPABASE_PUBLISHABLE_KEY not loaded correctly!
            </div>
          )}
          {envVars.VITE_SUPABASE_PUBLISHABLE_KEY && envVars.VITE_SUPABASE_PUBLISHABLE_KEY.includes("your_") && (
            <div className="text-red-500 font-bold">
              ERROR: VITE_SUPABASE_PUBLISHABLE_KEY using placeholder values instead of real credentials!
            </div>
          )}
          {envVars.VITE_SUPABASE_URL && !envVars.VITE_SUPABASE_URL.includes("your_") && 
           envVars.VITE_SUPABASE_PUBLISHABLE_KEY && !envVars.VITE_SUPABASE_PUBLISHABLE_KEY.includes("your_") && (
            <div className="text-green-500 font-bold">
              SUCCESS: Environment variables appear to be properly loaded!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestEnvVars;