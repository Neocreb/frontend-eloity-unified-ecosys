import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  ArrowUpRight,
  Phone,
  Zap,
  Dices,
  Tv,
  Lock,
  Banknote,
  Heart,
  MoreHorizontal,
  Smartphone,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Service {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  action: () => void;
  badge?: {
    text: string;
    variant: "popular" | "new" | "hot";
  };
}

const WalletServicesGrid = () => {
  const navigate = useNavigate();
  const [showMoreServices, setShowMoreServices] = useState(false);

  const allServices: Service[] = [
    // Primary Transfer Services
    {
      id: "opay",
      label: "To OPay",
      description: "Send to OPay users",
      icon: <User className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-blue-400 to-blue-500",
      action: () => navigate("/app/wallet/send-money"),
    },
    {
      id: "bank",
      label: "To Bank",
      description: "Send to bank account",
      icon: <Building2 className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-green-400 to-green-500",
      action: () => navigate("/app/wallet/transfer"),
    },
    {
      id: "withdraw",
      label: "Withdraw",
      description: "Cash out funds",
      icon: <ArrowUpRight className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-emerald-400 to-emerald-500",
      action: () => navigate("/app/wallet/withdraw"),
    },

    // Telecom Services
    {
      id: "airtime",
      label: "Airtime",
      description: "Buy airtime",
      icon: <Phone className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-orange-400 to-orange-500",
      action: () => navigate("/app/wallet/top-up"),
      badge: { text: "Up to 6%", variant: "hot" },
    },
    {
      id: "data",
      label: "Data",
      description: "Buy data bundles",
      icon: <Zap className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-violet-400 to-violet-500",
      action: () => navigate("/app/wallet/top-up"),
    },
    {
      id: "betting",
      label: "Betting",
      description: "Place bets",
      icon: <Dices className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-cyan-400 to-cyan-500",
      action: () => navigate("/app/wallet/top-up"),
    },
    {
      id: "tv",
      label: "TV",
      description: "TV subscriptions",
      icon: <Tv className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-pink-400 to-pink-500",
      action: () => navigate("/app/wallet/top-up"),
    },

    // Additional Services
    {
      id: "safebox",
      label: "Safebox",
      description: "Secure savings",
      icon: <Lock className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-indigo-400 to-indigo-500",
      action: () => navigate("/app/wallet/top-up"),
    },
    {
      id: "loan",
      label: "Loan",
      description: "Quick loans",
      icon: <Banknote className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-amber-400 to-amber-500",
      action: () => navigate("/app/wallet/top-up"),
    },
    {
      id: "play4child",
      label: "Play4aChild",
      description: "Support children",
      icon: <Heart className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-rose-400 to-rose-500",
      action: () => navigate("/app/wallet/top-up"),
    },

    // Additional Hidden Services for "More" modal
    {
      id: "paybills",
      label: "Pay Bills",
      description: "Pay bills & utilities",
      icon: <Smartphone className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-red-400 to-red-500",
      action: () => navigate("/app/wallet/pay-bills"),
    },
    {
      id: "insurance",
      label: "Insurance",
      description: "Buy insurance",
      icon: <Lock className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-purple-400 to-purple-500",
      action: () => navigate("/app/wallet/top-up"),
    },
    {
      id: "education",
      label: "Education",
      description: "Pay school fees",
      icon: <Smartphone className="h-7 w-7" />,
      color: "text-white",
      bgColor: "from-teal-400 to-teal-500",
      action: () => navigate("/app/wallet/top-up"),
    },
  ];

  // Display first 9 services in main grid, rest in modal
  const mainServices = allServices.slice(0, 9);
  const moreServices = allServices.slice(9);

  const ServiceCard = ({ service }: { service: Service }) => (
    <button
      onClick={service.action}
      className={`relative h-32 rounded-2xl bg-gradient-to-br ${service.bgColor} ${service.color} shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group overflow-hidden`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Badge */}
      {service.badge && (
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm ${
            service.badge.variant === "hot"
              ? "bg-red-500/80"
              : service.badge.variant === "popular"
              ? "bg-amber-500/80"
              : "bg-blue-500/80"
          }`}
        >
          {service.badge.text}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full group-hover:scale-110 transition-transform duration-300">
          {service.icon}
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm leading-tight">{service.label}</p>
          <p className="text-xs opacity-90">{service.description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Main Services Grid - 4 columns */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {mainServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}

          {/* More Button */}
          <button
            onClick={() => setShowMoreServices(true)}
            className="relative h-32 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full group-hover:scale-110 transition-transform duration-300">
                <MoreHorizontal className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm leading-tight">More</p>
                <p className="text-xs opacity-90">View all</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* More Services Modal */}
      <Dialog open={showMoreServices} onOpenChange={setShowMoreServices}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>All Services</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
            {allServices.map((service) => (
              <div key={service.id} onClick={() => setShowMoreServices(false)}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletServicesGrid;
