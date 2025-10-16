import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReferralService } from '@/services/referralService';

const Join: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const refCode = searchParams.get('ref');

    if (isAuthenticated) {
      // User is already logged in, redirect to feed
      navigate('/feed', { replace: true });
      return;
    }

    if (refCode) {
      // Track the referral click in the background
      ReferralService.trackReferralClick(refCode).catch(error => {
        console.error('Error tracking referral click:', error);
      });

      // Redirect to auth page with referral code
      navigate(`/auth?ref=${encodeURIComponent(refCode)}`, { replace: true });
    } else {
      // No referral code, redirect to normal auth
      navigate('/auth', { replace: true });
    }
  }, [searchParams, navigate, isAuthenticated]);

  // Show a simple loading screen while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Taking you to Eloity registration</p>
      </div>
    </div>
  );
};

export default Join;
