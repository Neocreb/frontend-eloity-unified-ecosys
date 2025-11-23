import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useServiceFavorites } from '@/hooks/useServiceFavorites';
import { Button } from '@/components/ui/button';

// Import service definitions to get icons
import {
  Phone,
  Send,
  Plus,
  ArrowUp,
  Gift,
  ShoppingCart,
  Smartphone,
  CreditCard,
  TrendingUp,
  Lock,
  Trophy,
  Wallet,
  Zap,
} from 'lucide-react';

// Service ID to icon mapping
const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'deposit': <Plus className="h-5 w-5" />,
  'send-money': <Send className="h-5 w-5" />,
  'withdraw': <ArrowUp className="h-5 w-5" />,
  'airtime': <Phone className="h-5 w-5" />,
  'data': <Smartphone className="h-5 w-5" />,
  'electricity': <Zap className="h-5 w-5" />,
  'tv': <CreditCard className="h-5 w-5" />,
  'gifts': <Gift className="h-5 w-5" />,
  'marketplace': <ShoppingCart className="h-5 w-5" />,
  'investments': <TrendingUp className="h-5 w-5" />,
  'safebox': <Lock className="h-5 w-5" />,
  'referral': <Trophy className="h-5 w-5" />,
};

// Service ID to label mapping
const SERVICE_LABELS: Record<string, string> = {
  'deposit': 'Deposit',
  'send-money': 'Send Money',
  'withdraw': 'Withdraw',
  'airtime': 'Airtime',
  'data': 'Data',
  'electricity': 'Electricity',
  'tv': 'TV',
  'gifts': 'Gifts',
  'marketplace': 'Marketplace',
  'investments': 'Invest',
  'safebox': 'SafeBox',
  'referral': 'Referral',
  'buy-gift-cards': 'Gift Cards',
  'sell-gift-cards': 'Sell Cards',
  'top-up': 'Top Up',
  'pay-bills': 'Bills',
  'transfer': 'Transfer',
  'crypto': 'Crypto',
  'freelance': 'Freelance',
  'request': 'Request',
  'virtual-card': 'Virtual Card',
  'physical-card': 'Physical Card',
  'travel': 'Travel',
};

// Service ID to route mapping
const SERVICE_ROUTES: Record<string, string> = {
  'deposit': '/app/wallet/deposit',
  'send-money': '/app/wallet/send-money',
  'withdraw': '/app/wallet/withdraw',
  'airtime': '/app/wallet/airtime',
  'data': '/app/wallet/data',
  'electricity': '/app/wallet/electricity',
  'tv': '/app/wallet/tv',
  'gifts': '/app/send-gifts',
  'marketplace': '/app/marketplace',
  'investments': '/app/wallet',
  'safebox': '/app/safebox',
  'referral': '/app/referral',
  'buy-gift-cards': '/app/wallet/buy-gift-cards',
  'sell-gift-cards': '/app/wallet/sell-gift-cards',
  'top-up': '/app/wallet/top-up',
  'pay-bills': '/app/wallet/pay-bills',
  'transfer': '/app/wallet/transfer',
  'crypto': '/app/crypto',
  'freelance': '/app/freelance',
  'request': '/app/wallet/request',
  'virtual-card': '/app/wallet',
  'physical-card': '/app/wallet',
  'travel': '/app/wallet',
};

export const ServiceFavoritesBar: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, isLoading, toggleFavorite } = useServiceFavorites();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth
      );
    }
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  const handleServiceClick = (serviceId: string) => {
    const route = SERVICE_ROUTES[serviceId] || '/app/wallet/more-services';
    navigate(route);
  };

  if (isLoading || favorites.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        <h3 className="text-sm font-bold text-gray-900">Favorite Services</h3>
      </div>

      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
        )}

        {/* Favorites Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
          onScroll={checkScroll}
        >
          {favorites.map((favorite) => (
            <button
              key={favorite.serviceId}
              onClick={() => handleServiceClick(favorite.serviceId)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all active:scale-95"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                {SERVICE_ICONS[favorite.serviceId] || <Wallet className="h-5 w-5" />}
              </div>
              <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">
                {SERVICE_LABELS[favorite.serviceId] || favorite.serviceId}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(favorite.serviceId);
                }}
                className="absolute top-1 right-1"
                title="Remove from favorites"
              >
                <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
              </button>
            </button>
          ))}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceFavoritesBar;
