import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SupabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const testSupabase = async () => {
      try {
        console.log("Testing Supabase client...");
        console.log("Supabase URL:", supabase.rest.url);
        
        // Try a simple query to test the connection
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1);
        
        if (error) {
          setTestResult(`❌ Supabase Error: ${error.message}`);
          console.error("Supabase Error:", error);
        } else {
          setTestResult(`✅ Supabase Connection Successful! Found ${data?.length || 0} records.`);
          console.log("Supabase Success:", data);
        }
      } catch (error: any) {
        setTestResult(`❌ Exception: ${error.message}`);
        console.error("Exception:", error);
      } finally {
        setLoading(false);
      }
    };

    testSupabase();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Client Test</h1>
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span>Testing Supabase connection...</span>
          </div>
        ) : (
          <div className="font-mono text-sm bg-gray-100 p-2 rounded">
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseTest;