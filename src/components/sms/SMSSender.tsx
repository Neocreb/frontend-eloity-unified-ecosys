import React, { useState } from 'react';
import { useSMS } from '@/hooks/useSMS';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface SMSSenderProps {
  onOTPSent?: (otpId: string, maskedPhone: string) => void;
}

const SMSSender: React.FC<SMSSenderProps> = ({ onOTPSent }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [purpose, setPurpose] = useState('verification');
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState('');
  const { isSending, isVerifying, error, sendSMS, sendOTP, verifyOTP } = useSMS();

  const handleSendSMS = async () => {
    if (!phoneNumber || !message) {
      toast({
        title: 'Error',
        description: 'Please enter both phone number and message',
        variant: 'destructive',
      });
      return;
    }

    const result = await sendSMS({
      phoneNumber,
      message,
      type: 'general',
    });

    if (result.success) {
      toast({
        title: 'Success',
        description: 'SMS sent successfully',
      });
      setMessage('');
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to send SMS',
        variant: 'destructive',
      });
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || !purpose) {
      toast({
        title: 'Error',
        description: 'Please enter both phone number and purpose',
        variant: 'destructive',
      });
      return;
    }

    const result = await sendOTP({
      phoneNumber,
      purpose,
      expiryMinutes: 10,
    });

    if (result.success) {
      setOtpId(result.otpId || '');
      toast({
        title: 'Success',
        description: `OTP sent to ${result.maskedPhone}`,
      });
      
      if (onOTPSent && result.otpId && result.maskedPhone) {
        onOTPSent(result.otpId, result.maskedPhone);
      }
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to send OTP',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpId || !otp) {
      toast({
        title: 'Error',
        description: 'Please enter both OTP ID and OTP code',
        variant: 'destructive',
      });
      return;
    }

    const result = await verifyOTP({
      otpId,
      otp,
      phoneNumber,
    });

    if (result.success) {
      toast({
        title: 'Success',
        description: 'OTP verified successfully',
      });
      setOtp('');
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to verify OTP',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>SMS Services</CardTitle>
        <CardDescription>Send SMS messages and handle OTP verification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Enter your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSendSMS} 
          disabled={isSending}
          className="w-full"
        >
          {isSending ? 'Sending...' : 'Send SMS'}
        </Button>

        <div className="border-t pt-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">OTP Purpose</Label>
            <Input
              id="purpose"
              type="text"
              placeholder="e.g., account verification"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleSendOTP} 
            disabled={isSending}
            className="w-full mt-2"
          >
            {isSending ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="otp">OTP Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          </div>

          <Button 
            onClick={handleVerifyOTP} 
            disabled={isVerifying}
            className="w-full mt-2"
          >
            {isVerifying ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            Error: {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SMSSender;