import React from 'react';
import { cn } from '@/lib/utils';

interface EloityLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  showText?: boolean;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const EloityLogo: React.FC<EloityLogoProps> = ({ 
  className,
  size = 'md',
  variant = 'full',
  showText = true
}) => {
  const logoUrl = "https://cdn.builder.io/api/v1/image/assets%2F2731150f233d47328abf3dc5b64c4e4a%2F40e7963d87584676a83d092a18e6f4f2?format=webp&width=800";

  if (variant === 'text') {
    return (
      <span className={cn("font-bold text-xl bg-gradient-to-r from-eloity-cyan to-eloity-purple bg-clip-text text-transparent", className)}>
        eloity
      </span>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={cn(sizeClasses[size], className)}>
        <img 
          src={logoUrl} 
          alt="Eloity"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={sizeClasses[size]}>
        <img 
          src={logoUrl} 
          alt="Eloity Logo"
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className="font-bold text-xl bg-gradient-to-r from-eloity-cyan to-eloity-purple bg-clip-text text-transparent">
          eloity
        </span>
      )}
    </div>
  );
};

export default EloityLogo;
