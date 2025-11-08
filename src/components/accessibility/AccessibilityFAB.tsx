// @ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Accessibility } from 'lucide-react';

interface AccessibilityFABProps {
  videoElement?: HTMLVideoElement | null;
  className?: string;
}

const AccessibilityFAB: React.FC<AccessibilityFABProps> = ({
  className = ''
}) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate('/app/settings#accessibility')}
      className={`w-12 h-12 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 ${className}`}
      title="Accessibility Settings"
      aria-label="Open accessibility settings"
    >
      <Accessibility className="w-6 h-6" />
    </Button>
  );
};

export default AccessibilityFAB;
