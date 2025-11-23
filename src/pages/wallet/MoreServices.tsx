// @ts-nocheck
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ServiceBadges from "@/components/wallet/ServiceBadges";
import { useServiceFavorites } from "@/hooks/useServiceFavorites";
import {
  HelpCircle,
  Phone,
  Gift,
  Send,
  CreditCard,
  TrendingUp,
  Zap,
  Smartphone,
  Lightbulb,
  Tv,
  ShoppingCart,
  Heart,
  Star,
  Trophy,
  Lock,
  Wallet,
  Plane,
  Search,
  Clock,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";

interface Service {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  gradient: string;
  category: string;
  description?: string;
  badge?: string;
  isNew?: boolean;
  isHot?: boolean;
}

const MoreServices = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // All available services
  const allServices: Service[] = [
    // Money Management
    {
      id: "send-money",
      label: "Send Money",
      icon: <Send className="h-6 w-6" />,
      action: () => navigate("/app/wallet/send-money"),
      gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
      category: "Money Management",
    },
    {
      id: "request",
      label: "Request Money",
      icon: <HelpCircle className="h-6 w-6" />,
      action: () => navigate("/app/wallet/request"),
      gradient: "bg-gradient-to-br from-rose-400 to-red-500",
      category: "Money Management",
    },
    {
      id: "top-up",
      label: "Top Up",
      icon: <Phone className="h-6 w-6" />,
      action: () => navigate("/app/wallet/top-up"),
      gradient: "bg-gradient-to-br from-orange-400 to-yellow-500",
      category: "Money Management",
      isHot: true,
    },
    {
      id: "transfer",
      label: "Transfer",
      icon: <CreditCard className="h-6 w-6" />,
      action: () => navigate("/app/wallet/transfer"),
      gradient: "bg-gradient-to-br from-indigo-400 to-purple-500",
      category: "Money Management",
    },
    {
      id: "deposit",
      label: "Deposit",
      icon: <Wallet className="h-6 w-6" />,
      action: () => navigate("/app/wallet/deposit"),
      gradient: "bg-gradient-to-br from-cyan-400 to-blue-500",
      category: "Money Management",
    },
    {
      id: "withdraw",
      label: "Withdraw",
      icon: <TrendingUp className="h-6 w-6" />,
      action: () => navigate("/app/wallet/withdraw"),
      gradient: "bg-gradient-to-br from-teal-400 to-green-500",
      category: "Money Management",
    },

    // E-commerce & Shopping
    {
      id: "buy-gift-cards",
      label: "Buy Gift Cards",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/wallet/buy-gift-cards"),
      gradient: "bg-gradient-to-br from-pink-400 to-rose-500",
      category: "E-commerce",
      description: "Purchase digital gift cards",
    },
    {
      id: "sell-gift-cards",
      label: "Sell Gift Cards",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/wallet/sell-gift-cards"),
      gradient: "bg-gradient-to-br from-green-400 to-teal-500",
      category: "E-commerce",
      description: "Convert gift cards to cash",
    },
    {
      id: "gift-cards",
      label: "Gift Cards",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/wallet/gift-cards"),
      gradient: "bg-gradient-to-br from-purple-400 to-pink-500",
      category: "E-commerce",
      description: "Manage gift card balance",
    },

    // Bills & Utilities
    {
      id: "airtime",
      label: "Airtime",
      icon: <Smartphone className="h-6 w-6" />,
      action: () => navigate("/app/wallet/airtime"),
      gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
      category: "Bills & Utilities",
      description: "Buy mobile airtime",
    },
    {
      id: "data",
      label: "Data",
      icon: <Zap className="h-6 w-6" />,
      action: () => navigate("/app/wallet/data"),
      gradient: "bg-gradient-to-br from-yellow-400 to-amber-500",
      category: "Bills & Utilities",
      description: "Purchase data bundles",
    },
    {
      id: "electricity",
      label: "Electricity",
      icon: <Lightbulb className="h-6 w-6" />,
      action: () => navigate("/app/wallet/electricity"),
      gradient: "bg-gradient-to-br from-orange-400 to-red-500",
      category: "Bills & Utilities",
      isHot: true,
    },
    {
      id: "tv",
      label: "TV",
      icon: <Tv className="h-6 w-6" />,
      action: () => navigate("/app/wallet/tv"),
      gradient: "bg-gradient-to-br from-red-400 to-pink-500",
      category: "Bills & Utilities",
      isHot: true,
    },
    {
      id: "pay-bills",
      label: "Pay Bills",
      icon: <CreditCard className="h-6 w-6" />,
      action: () => navigate("/app/wallet/pay-bills"),
      gradient: "bg-gradient-to-br from-purple-400 to-indigo-500",
      category: "Bills & Utilities",
      description: "Pay various bills",
    },

    // Creator Features
    {
      id: "send-gifts",
      label: "Send Gifts",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/send-gifts"),
      gradient: "bg-gradient-to-br from-pink-500 to-purple-600",
      category: "Creator Features",
      description: "Send virtual gifts to creators",
    },
    {
      id: "creator-rewards",
      label: "Creator Rewards",
      icon: <Star className="h-6 w-6" />,
      action: () => navigate("/app/creator-studio"),
      gradient: "bg-gradient-to-br from-yellow-400 to-yellow-600",
      category: "Creator Features",
      description: "Earn from content creation",
      isNew: true,
    },
    {
      id: "referral",
      label: "Referral Program",
      icon: <Trophy className="h-6 w-6" />,
      action: () => navigate("/app/referral"),
      gradient: "bg-gradient-to-br from-green-400 to-green-600",
      category: "Creator Features",
      description: "Earn from referrals",
    },

    // Finance & Investment
    {
      id: "savings",
      label: "Savings Goals",
      icon: <Wallet className="h-6 w-6" />,
      action: () => navigate("/app/wallet"),
      gradient: "bg-gradient-to-br from-emerald-400 to-teal-600",
      category: "Finance & Investment",
      description: "Create savings goals",
      isNew: true,
    },
    {
      id: "safebox",
      label: "SafeBox",
      icon: <Lock className="h-6 w-6" />,
      action: () => navigate("/app/safebox"),
      gradient: "bg-gradient-to-br from-slate-400 to-gray-600",
      category: "Finance & Investment",
      description: "Secure your money",
      isNew: true,
    },
    {
      id: "investments",
      label: "Invest",
      icon: <TrendingUp className="h-6 w-6" />,
      action: () => navigate("/app/wallet"),
      gradient: "bg-gradient-to-br from-blue-500 to-purple-600",
      category: "Finance & Investment",
      description: "Investment opportunities",
    },

    // Cards & Virtual Services
    {
      id: "virtual-card",
      label: "Virtual Card",
      icon: <CreditCard className="h-6 w-6" />,
      action: () => navigate("/app/wallet"),
      gradient: "bg-gradient-to-br from-cyan-400 to-blue-600",
      category: "Cards & Virtual",
      description: "Create virtual cards",
      isNew: true,
    },
    {
      id: "physical-card",
      label: "Physical Card",
      icon: <CreditCard className="h-6 w-6" />,
      action: () => navigate("/app/wallet"),
      gradient: "bg-gradient-to-br from-indigo-400 to-purple-600",
      category: "Cards & Virtual",
      description: "Order physical card",
      isNew: true,
    },

    // Freelance & Services
    {
      id: "freelance",
      label: "Freelance Jobs",
      icon: <Smartphone className="h-6 w-6" />,
      action: () => navigate("/app/freelance"),
      gradient: "bg-gradient-to-br from-rose-400 to-pink-600",
      category: "Work & Earn",
      description: "Find freelance work",
    },
    {
      id: "marketplace",
      label: "Marketplace",
      icon: <ShoppingCart className="h-6 w-6" />,
      action: () => navigate("/app/marketplace"),
      gradient: "bg-gradient-to-br from-orange-400 to-yellow-600",
      category: "Work & Earn",
      description: "Buy and sell items",
    },

    // Lifestyle
    {
      id: "travel",
      label: "Travel & Hotel",
      icon: <Plane className="h-6 w-6" />,
      action: () => navigate("/app/wallet"),
      gradient: "bg-gradient-to-br from-sky-400 to-cyan-600",
      category: "Lifestyle",
      description: "Book travel & hotels",
      isNew: true,
    },
  ];

  // Recently used (mock - in production, fetch from user activity)
  const recentlyUsed = allServices.slice(0, 3);

  // Filter services based on search
  const filteredServices = useMemo(() => {
    let filtered = allServices;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.label.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Group services by category
  const groupedServices = useMemo(() => {
    const grouped: Record<string, Service[]> = {};
    filteredServices.forEach((service) => {
      if (!grouped[service.category]) {
        grouped[service.category] = [];
      }
      grouped[service.category].push(service);
    });
    return grouped;
  }, [filteredServices]);

  const categories = Array.from(new Set(allServices.map((s) => s.category)));

  const ServiceCard = ({ service }: { service: Service }) => (
    <button
      onClick={service.action}
      className="relative group flex flex-col items-center gap-2 p-3 sm:p-4 w-full transition-all duration-300 hover:scale-105"
    >
      {/* Badges */}
      <div className="absolute top-0 right-0 flex gap-1 z-10">
        {service.isHot && (
          <Badge className="bg-red-500 text-white text-xs h-5">HOT</Badge>
        )}
        {service.isNew && (
          <Badge className="bg-blue-500 text-white text-xs h-5">NEW</Badge>
        )}
      </div>

      {/* Icon Container */}
      <div
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg ${service.gradient}`}
      >
        <div className="text-white">{service.icon}</div>
      </div>

      {/* Label */}
      <div className="text-center w-full">
        <p className="font-semibold text-gray-800 text-xs sm:text-sm leading-tight">
          {service.label}
        </p>
        {service.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {service.description}
          </p>
        )}

        {/* Integration Badges */}
        <div className="mt-2 flex justify-center">
          <ServiceBadges
            serviceId={service.id}
            size="sm"
            showLabel={false}
            maxBadges={2}
            className="justify-center"
          />
        </div>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <WalletActionHeader title="All Services" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-lg"
              />
            </div>
          </div>

          {/* Category Filter */}
          {!searchQuery && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="whitespace-nowrap"
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Recently Used (only show when no search/filter) */}
          {!searchQuery && !selectedCategory && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recently Used
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
                {recentlyUsed.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          )}

          {/* Services by Category */}
          {Object.entries(groupedServices).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedServices).map(([category, services]) => (
                <div key={category}>
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    {category}
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
                    {services.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No services found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {/* Coming Soon Section */}
          <div className="mt-12 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-2">💡 Coming Soon</h3>
            <p className="text-sm text-gray-600">
              We're working on more exciting features like Insurance, Investment Products,
              and International Remittance. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreServices;
