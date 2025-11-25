import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, AlertCircle, CheckCircle2, Clock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface KYCTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiresKYC: boolean;
  reason?: string;
}

const FEATURE_INFO: Record<string, {
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  estimatedTime: string;
  requirements: string[];
}> = {
  marketplace_sell: {
    title: 'Enable Seller Features',
    description: 'Start selling products on Eloity marketplace',
    icon: <Lock className="w-6 h-6" />,
    benefits: [
      'List unlimited products',
      'Access seller dashboard',
      'Withdraw earnings',
      'Seller reputation badge'
    ],
    estimatedTime: '10-15 minutes',
    requirements: [
      'Valid government-issued ID',
      'Proof of address',
      'Bank account details'
    ]
  },
  crypto_trade: {
    title: 'Unlock Crypto Trading',
    description: 'Buy and sell cryptocurrencies on Eloity',
    icon: <Lock className="w-6 h-6" />,
    benefits: [
      'Trade 100+ cryptocurrencies',
      'P2P trading capabilities',
      'Advanced order types',
      'Crypto verified badge'
    ],
    estimatedTime: '10-15 minutes',
    requirements: [
      'Valid government-issued ID',
      'Proof of address',
      'Biometric verification'
    ]
  },
  freelance_offer: {
    title: 'Start Offering Services',
    description: 'Create and manage freelance services',
    icon: <Lock className="w-6 h-6" />,
    benefits: [
      'Post service offerings',
      'Access to job proposals',
      'Withdraw client payments',
      'Freelancer badge'
    ],
    estimatedTime: '5-10 minutes',
    requirements: [
      'Valid government-issued ID',
      'Bank account details'
    ]
  },
  withdraw_earnings: {
    title: 'Verify to Withdraw',
    description: 'Complete verification to withdraw your earnings',
    icon: <Lock className="w-6 h-6" />,
    benefits: [
      'Withdraw to bank account',
      'Withdraw to crypto wallet',
      'Withdraw to gift card',
      'No withdrawal limits'
    ],
    estimatedTime: '10-15 minutes',
    requirements: [
      'Valid government-issued ID',
      'Proof of address'
    ]
  },
  creator_fund: {
    title: 'Access Creator Fund',
    description: 'Monetize your content and access creator rewards',
    icon: <Lock className="w-6 h-6" />,
    benefits: [
      'Earn from content views',
      'Creator monetization fund',
      'Withdraw creator earnings',
      'Creator badge'
    ],
    estimatedTime: '10-15 minutes',
    requirements: [
      'Valid government-issued ID',
      'Proof of address'
    ]
  }
};

export default function KYCTriggerModal({
  isOpen,
  onClose,
  feature = 'withdraw_earnings',
  requiresKYC = true,
  reason = 'This feature requires verification'
}: KYCTriggerModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(feature);

  const featureInfo = FEATURE_INFO[selectedFeature] || FEATURE_INFO.withdraw_earnings;

  const handleStartKYC = async () => {
    setIsLoading(true);
    try {
      // Navigate to KYC verification page with callback
      navigate('/kyc-verification', {
        state: {
          source: selectedFeature,
          returnTo: window.location.pathname,
        }
      });
      onClose();
    } catch (error) {
      console.error('Error starting KYC:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {featureInfo.icon}
                {featureInfo.title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {featureInfo.description}
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="ml-2">
              Unverified
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="ml-2 text-blue-900">
              {reason || 'Complete verification to access this feature'}
            </AlertDescription>
          </Alert>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                What You'll Get
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {featureInfo.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                Verification Requirements
              </CardTitle>
              <CardDescription>
                We need this information to keep our platform safe and compliant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {featureInfo.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-600 rounded-full flex-shrink-0" />
                    <span className="text-sm text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Time Estimate */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-semibold text-sm text-gray-900">Estimated Time</p>
              <p className="text-sm text-gray-600">{featureInfo.estimatedTime}</p>
            </div>
          </div>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Why do we need this?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3 text-gray-600">
              <p>
                We're regulated by financial authorities in multiple countries. Verification helps us:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Prevent fraud and money laundering</li>
                <li>Protect your account and transactions</li>
                <li>Comply with local laws and regulations</li>
                <li>Keep your personal data secure</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartKYC}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Loading...' : 'Complete Verification'}
          </Button>
        </div>

        {/* Security Notice */}
        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Your information is encrypted and stored securely. We never share your data with third parties.
        </p>
      </DialogContent>
    </Dialog>
  );
}
