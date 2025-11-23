export interface Badge {
  id: string;
  label: string;
  iconName: 'zap' | 'repeat' | 'gift' | 'award' | 'shield' | 'smartphone';
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  description?: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const AVAILABLE_BADGES: Record<string, Badge> = {
  instant: {
    id: 'instant',
    label: 'Instant',
    iconName: 'zap',
    color: 'primary',
    description: 'Instant processing',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
  },
  recurring: {
    id: 'recurring',
    label: 'Recurring',
    iconName: 'repeat',
    color: 'info',
    description: 'Set up recurring payments',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-300',
  },
  rewards: {
    id: 'rewards',
    label: 'Rewards',
    iconName: 'gift',
    color: 'success',
    description: 'Earn rewards on this service',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
  },
  crypto: {
    id: 'crypto',
    label: 'Crypto',
    iconName: 'shield',
    color: 'warning',
    description: 'Crypto enabled',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
  },
  partnership: {
    id: 'partnership',
    label: 'Partnership',
    iconName: 'award',
    color: 'secondary',
    description: 'Featured partner',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
  },
  popular: {
    id: 'popular',
    label: 'Popular',
    iconName: 'smartphone',
    color: 'danger',
    description: 'Most used service',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
  },
};

// Service-to-Badge mapping
export const SERVICE_BADGES: Record<string, string[]> = {
  'deposit': ['instant'],
  'send-money': ['instant', 'rewards'],
  'withdraw': ['instant'],
  'airtime': ['instant', 'recurring', 'rewards'],
  'data': ['instant', 'recurring', 'rewards'],
  'electricity': ['recurring', 'rewards'],
  'tv': ['recurring', 'rewards'],
  'top-up': ['instant', 'rewards'],
  'pay-bills': ['recurring', 'rewards'],
  'buy-gift-cards': ['instant', 'rewards'],
  'sell-gift-cards': ['instant', 'rewards'],
  'transfer': ['instant', 'rewards'],
  'crypto': ['crypto', 'instant'],
  'marketplace': ['rewards', 'popular'],
  'freelance': ['rewards', 'popular'],
  'gifts': ['instant', 'rewards'],
  'safebox': ['instant'],
  'request': ['instant', 'rewards'],
  'referral': ['rewards', 'popular'],
  'investments': ['crypto', 'rewards'],
  'virtual-card': ['instant', 'rewards'],
  'physical-card': ['recurring', 'rewards'],
  'travel': ['rewards'],
};

/**
 * Get badges for a specific service
 * @param serviceId - The ID of the service
 * @returns Array of badge objects for the service
 */
export function getServiceBadges(serviceId: string): Badge[] {
  const badgeIds = SERVICE_BADGES[serviceId.toLowerCase()] || [];
  return badgeIds
    .map(badgeId => AVAILABLE_BADGES[badgeId])
    .filter(Boolean);
}

/**
 * Get all unique badges across all services
 * @returns Array of all badge objects
 */
export function getAllBadges(): Badge[] {
  const uniqueIds = new Set<string>();
  Object.values(SERVICE_BADGES).forEach(badges => {
    badges.forEach(badgeId => uniqueIds.add(badgeId));
  });
  return Array.from(uniqueIds)
    .map(badgeId => AVAILABLE_BADGES[badgeId])
    .filter(Boolean);
}
