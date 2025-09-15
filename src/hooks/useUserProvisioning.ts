import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useUserProvisioning() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProvisioned, setIsProvisioned] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  useEffect(() => {
    if (!user || isProvisioned) return;

    const provisionUser = async () => {
      setIsProvisioning(true);
      
      try {
        console.log('Provisioning user:', user.id);
        
        const { data, error } = await supabase.rpc('provision_current_user');
        
        if (error) {
          console.error('Provisioning error:', error);
          toast({
            title: "Setup Error",
            description: "Failed to initialize your account. Please refresh and try again.",
            variant: "destructive",
          });
          return;
        }
        
        console.log('User provisioned successfully');
        setIsProvisioned(true);
        
        // Optional: Show success toast for new users
        toast({
          title: "Welcome!",
          description: "Your account has been set up successfully.",
        });
        
      } catch (error) {
        console.error('Unexpected provisioning error:', error);
        toast({
          title: "Setup Error", 
          description: "An unexpected error occurred during setup.",
          variant: "destructive",
        });
      } finally {
        setIsProvisioning(false);
      }
    };

    provisionUser();
  }, [user, isProvisioned, toast]);

  return {
    isProvisioned,
    isProvisioning
  };
}