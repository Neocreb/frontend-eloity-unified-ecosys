import { useState } from 'react';
import UniversalCryptoPaymentModal from '@/components/payments/UniversalCryptoPaymentModal';

export default function UniversalCryptoPayment() {
  const [isOpen] = useState(true);

  const handlePaymentSubmit = async (data: any) => {
    try {
      // Submit payment data to backend or service
      console.log('Payment data submitted:', data);
      return { success: true };
    } catch (error) {
      console.error('Payment submission error:', error);
      return { success: false, error };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UniversalCryptoPaymentModal
        isOpen={isOpen}
        onClose={() => window.history.back()}
        onSubmit={handlePaymentSubmit}
      />
    </div>
  );
}
