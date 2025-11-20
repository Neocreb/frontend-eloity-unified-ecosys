import { useState } from 'react';
import CryptoKYCModal from '@/components/crypto/CryptoKYCModal';

export default function CryptoKYC() {
  const [isOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <CryptoKYCModal
        isOpen={isOpen}
        onClose={() => window.history.back()}
      />
    </div>
  );
}
