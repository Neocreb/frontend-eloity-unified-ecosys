import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [envVarsStatus, setEnvVarsStatus] = useState<'missing' | 'present'>('missing');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [authTestResult, setAuthTestResult] = useState<string | null>(null);

  useEffect(() => {
    checkEnvironmentVariables();
    checkSupabaseConnection();
  }, []);

  const checkEnvironmentVariables = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    console.log("Environment variables check:");
    console.log("VITE_SUPABASE_URL:", url);
    console.log("VITE_SUPABASE_PUBLISHABLE_KEY available:", !!key);
    
    if (url && key) {
      setEnvVarsStatus('present');
    } else {
      setEnvVarsStatus('missing');
      setErrorDetails(`Missing: ${!url ? 'VITE_SUPABASE_URL ' : ''}${!key ? 'VITE_SUPABASE_PUBLISHABLE_KEY' : ''}`);
    }
  };

  const checkSupabaseConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      // Test a simple connection
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Supabase connection error:", error);
        setConnectionStatus('error');
        setErrorDetails(error.message);
      } else {
        console.log("Supabase connection successful");
        setConnectionStatus('connected');
        setErrorDetails(null);
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setConnectionStatus('error');
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testAuthFlow = async () => {
    setIsTestingAuth(true);
    setAuthTestResult(null);

    try {
      // Test with demo credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "demo@eloity.com",
        password: "password123"
      });

      if (error) {
        setAuthTestResult(`Auth test failed: ${error.message}`);
      } else {
        setAuthTestResult("Auth test successful!");
        // Sign out immediately
        await supabase.auth.signOut();
      }
    } catch (error) {
      setAuthTestResult(`Auth test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingAuth(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'connected' || status === 'present' ? 'default' : 
                   status === 'error' || status === 'missing' ? 'destructive' : 'secondary';
    
    return (
      <Badge variant={variant as any} className="ml-2">
        {status}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Supabase Connection Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Variables Check */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(envVarsStatus)}
            <span className="font-medium">Environment Variables</span>
          </div>
          {getStatusBadge(envVarsStatus)}
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(connectionStatus)}
            <span className="font-medium">Supabase Connection</span>
          </div>
          {getStatusBadge(connectionStatus)}
        </div>

        {/* Error Details */}
        {errorDetails && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              <strong>Error:</strong> {errorDetails}
            </p>
          </div>
        )}

        {/* Environment Info */}
        <div className="p-3 bg-gray-50 border rounded-lg">
          <h4 className="font-medium mb-2">Environment Info:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</p>
            <p><strong>API Key:</strong> {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '••••••••••••' + import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.slice(-8) : 'Not set'}</p>
          </div>
        </div>

        {/* Auth Test */}
        <div className="space-y-2">
          <Button 
            onClick={testAuthFlow} 
            disabled={isTestingAuth || connectionStatus !== 'connected'}
            className="w-full"
          >
            {isTestingAuth ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing Authentication...
              </>
            ) : (
              'Test Authentication Flow'
            )}
          </Button>
          
          {authTestResult && (
            <div className={`p-3 border rounded-lg ${authTestResult.includes('successful') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-sm ${authTestResult.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {authTestResult}
              </p>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
          Refresh Page
        </Button>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;
