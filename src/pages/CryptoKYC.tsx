import { useState } from 'react';
import CryptoKYCModal from '@/components/crypto/CryptoKYCModal';

export default function CryptoKYC() {
  const [isOpen] = useState(true);

  const handleKYCSubmit = async (data: any) => {
    try {
      // Submit KYC data to backend or service
      console.log('KYC data submitted:', data);
      return { success: true };
    } catch (error) {
      console.error('KYC submission error:', error);
      return { success: false, error };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CryptoKYCModal
        isOpen={isOpen}
        onClose={() => window.history.back()}
        onSubmit={handleKYCSubmit}
      />
    </div>
  );
}
