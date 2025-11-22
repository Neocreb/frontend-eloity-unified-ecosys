import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  ArrowUpRight,
  Phone,
  Zap,
  Tv,
  Lock,
  Lightbulb,
  Send,
  HelpCircle,
  MoreHorizontal,
  ArrowLeftRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Service {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  bgGradient: string;
  action: () => void;
  badge?: {
    text: string;
    variant: "popular" | "new" | "hot";
  };
}

const WalletServicesGrid = () => {
  const navigate = useNavigate();
  const [showMoreServices, setShowMoreServices] = useState(false);

  const mainServices: Service[] = [
    // Row 1: Transfer Services
    {
      id: "to-eloity",
      label: "To Eloity",
      description: "Send to users",
      icon: <User className="h-6 w-6" />,
      bgColor: "bg-teal-100",
      bgGradient: "from-teal-400 to-teal-500",
      action: () => navigate("/app/wallet/send-money"),
    },
    {
      id: "to-bank",
      label: "To Bank",
      description: "Bank transfer",
      icon: <Building2 className="h-6 w-6" />,
      bgColor: "bg-green-100",
      bgGradient: "from-green-400 to-green-500",
      action: () => navigate("/app/wallet/transfer"),
    },
    {
      id: "convert",
      label: "Convert",
      description: "Change currency",
      icon: <ArrowLeftRight className="h-6 w-6" />,
      bgColor: "bg-emerald-100",
      bgGradient: "from-emerald-400 to-emerald-500",
      action: () => navigate("/app/wallet/deposit"),
    },

    // Row 2: Telecom & Savings
    {
      id: "airtime",
      label: "Airtime",
      description: "Buy credit",
      icon: <Phone className="h-6 w-6" />,
      bgColor: "bg-orange-100",
      bgGradient: "from-orange-400 to-orange-500",
      action: () => navigate("/app/wallet/airtime"),
      badge: { text: "Up to 6%", variant: "hot" },
    },
    {
      id: "data",
      label: "Data",
      description: "Internet bundles",
      icon: <Zap className="h-6 w-6" />,
      bgColor: "bg-violet-100",
      bgGradient: "from-violet-400 to-violet-500",
      action: () => navigate("/app/wallet/data"),
    },
    {
      id: "tv",
      label: "TV",
      description: "Subscriptions",
      icon: <Tv className="h-6 w-6" />,
      bgColor: "bg-pink-100",
      bgGradient: "from-pink-400 to-pink-500",
      action: () => navigate("/app/wallet/tv"),
    },
    {
      id: "safebox",
      label: "Safebox",
      description: "Save & earn",
      icon: <Lock className="h-6 w-6" />,
      bgColor: "bg-indigo-100",
      bgGradient: "from-indigo-400 to-indigo-500",
      action: () => navigate("/app/wallet/safebox"),
    },

    // Row 3: Bills & Requests
    {
      id: "electricity",
      label: "Electricity",
      description: "Pay bills",
      icon: <Lightbulb className="h-6 w-6" />,
      bgColor: "bg-yellow-100",
      bgGradient: "from-yellow-400 to-yellow-500",
      action: () => navigate("/app/wallet/electricity"),
    },
    {
      id: "send-money",
      label: "Send Money",
      description: "Quick transfer",
      icon: <Send className="h-6 w-6" />,
      bgColor: "bg-blue-100",
      bgGradient: "from-blue-400 to-blue-500",
      action: () => navigate("/app/wallet/send-money"),
    },
    {
      id: "request",
      label: "Request",
      description: "Ask for money",
      icon: <HelpCircle className="h-6 w-6" />,
      bgColor: "bg-cyan-100",
      bgGradient: "from-cyan-400 to-cyan-500",
      action: () => navigate("/app/wallet/money-request"),
    },
  ];

  const moreServices: Service[] = [
    {
      id: "pay-bills",
      label: "Pay Bills",
      description: "Utilities",
      icon: <Lightbulb className="h-6 w-6" />,
      bgColor: "bg-red-100",
      bgGradient: "from-red-400 to-red-500",
      action: () => navigate("/app/wallet/pay-bills"),
    },
    {
      id: "deposit",
      label: "Deposit",
      description: "Add funds",
      icon: <ArrowUpRight className="h-6 w-6" />,
      bgColor: "bg-green-100",
      bgGradient: "from-green-400 to-green-500",
      action: () => navigate("/app/wallet/deposit"),
    },
    {
      id: "withdraw",
      label: "Withdraw",
      description: "Cash out",
      icon: <ArrowUpRight className="h-6 w-6" />,
      bgColor: "bg-purple-100",
      bgGradient: "from-purple-400 to-purple-500",
      action: () => navigate("/app/wallet/withdraw"),
    },
    {
      id: "gift-cards",
      label: "Gift Cards",
      description: "Buy & sell",
      icon: <User className="h-6 w-6" />,
      bgColor: "bg-pink-100",
      bgGradient: "from-pink-400 to-pink-500",
      action: () => navigate("/app/wallet/gift-cards"),
    },
  ];

  const ServiceCard = ({ service }: { service: Service }) => (
    <button
      onClick={service.action}
      className="relative group flex flex-col items-center gap-2 p-4 sm:p-5"
    >
      {/* Icon Container with background */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
        style={{
          backgroundColor: service.bgColor,
        }}
      >
        <div className="text-white drop-shadow-md">
          {service.icon}
        </div>
        
        {/* Badge */}
        {service.badge && (
          <div
            className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold text-white whitespace-nowrap ${
              service.badge.variant === "hot"
                ? "bg-red-500"
                : service.badge.variant === "popular"
                ? "bg-amber-500"
                : "bg-blue-500"
            }`}
          >
            {service.badge.text}
          </div>
        )}
      </div>

      {/* Label and Description */}
      <div className="text-center w-full">
        <p className="font-semibold text-gray-900 text-sm leading-tight">{service.label}</p>
        <p className="text-xs text-gray-600 mt-0.5">{service.description}</p>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Main Services Grid - 12 column grid (3, 4, 4 layout) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {mainServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}

        {/* More Button */}
        <button
          onClick={() => setShowMoreServices(true)}
          className="relative group flex flex-col items-center gap-2 p-4 sm:p-5"
        >
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg bg-gray-200"
          >
            <MoreHorizontal className="h-6 w-6 text-gray-700 drop-shadow-md" />
          </div>
          <div className="text-center w-full">
            <p className="font-semibold text-gray-900 text-sm leading-tight">More</p>
            <p className="text-xs text-gray-600 mt-0.5">View all</p>
          </div>
        </button>
      </div>

      {/* More Services Modal */}
      <Dialog open={showMoreServices} onOpenChange={setShowMoreServices}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>More Services</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 max-h-96 overflow-y-auto">
            {moreServices.map((service) => (
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
