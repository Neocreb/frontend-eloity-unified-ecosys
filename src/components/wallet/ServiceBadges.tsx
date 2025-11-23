import React from 'react';
import { Zap, Repeat, Gift, Award, Shield, Smartphone } from 'lucide-react';
import { Badge, getServiceBadges } from '@/config/serviceBadges';

interface ServiceBadgesProps {
  serviceId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  maxBadges?: number;
  className?: string;
}

const getIconComponent = (iconName: string) => {
  const iconProps = { className: 'h-3 w-3' };
  switch (iconName) {
    case 'zap':
      return <Zap {...iconProps} />;
    case 'repeat':
      return <Repeat {...iconProps} />;
    case 'gift':
      return <Gift {...iconProps} />;
    case 'award':
      return <Award {...iconProps} />;
    case 'shield':
      return <Shield {...iconProps} />;
    case 'smartphone':
      return <Smartphone {...iconProps} />;
    default:
      return null;
  }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        container: 'text-2xs',
        badge: 'px-1.5 py-0.5',
      };
    case 'lg':
      return {
        container: 'text-xs',
        badge: 'px-2.5 py-1',
      };
    case 'md':
    default:
      return {
        container: 'text-xs',
        badge: 'px-2 py-0.5',
      };
  }
};

export const ServiceBadges: React.FC<ServiceBadgesProps> = ({
  serviceId,
  size = 'sm',
  showLabel = true,
  maxBadges = 3,
  className = '',
}) => {
  const badges = getServiceBadges(serviceId);
  const displayBadges = badges.slice(0, maxBadges);

  if (displayBadges.length === 0) {
    return null;
  }

  const sizeClasses = getSizeClasses(size);

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayBadges.map((badge: Badge) => (
        <div
          key={badge.id}
          className={`flex items-center gap-1 rounded-full border ${badge.bgColor} ${badge.textColor} ${badge.borderColor} ${sizeClasses.badge} transition-all hover:shadow-sm`}
          title={badge.description}
        >
          <span className="flex-shrink-0">
            {getIconComponent(badge.iconName)}
          </span>
          {showLabel && <span className="font-medium">{badge.label}</span>}
        </div>
      ))}
      {badges.length > maxBadges && (
        <div className={`flex items-center rounded-full ${sizeClasses.badge}`}>
          <span className="text-gray-500 font-medium">+{badges.length - maxBadges}</span>
        </div>
      )}
    </div>
  );
};

export default ServiceBadges;
