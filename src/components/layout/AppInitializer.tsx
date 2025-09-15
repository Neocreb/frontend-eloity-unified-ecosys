import React from 'react';
import { useUserProvisioning } from '@/hooks/useUserProvisioning';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { user } = useAuth();
  const { isProvisioning } = useUserProvisioning();

  // Show loading screen while provisioning new users
  if (user && isProvisioning) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-center">
            <h2 className="text-lg font-semibold">Setting up your account</h2>
            <p className="text-muted-foreground">Please wait while we prepare everything for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;