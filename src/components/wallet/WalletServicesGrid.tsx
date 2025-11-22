import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  ArrowUpRight,
  Phone,
  Smartphone,
  Tv,
  Lock,
  Lightbulb,
  MoreHorizontal,
  Coins,
  Heart,
  Gift,
  Settings,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Service {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: {
    text: string;
    variant: "hot" | "popular" | "new";
  };
}

const WalletServicesGrid = () => {
  const navigate = useNavigate();
  const [showMoreServices, setShowMoreServices] = useState(false);

  const mainServices: Service[] = [
    // Row 1: Transfer Services (3 items)
    {
      id: "to-opay",
      label: "To OPay",
      icon: <User className="h-6 w-6" />,
      action: () => navigate("/app/wallet/send-money"),
    },
    {
      id: "to-bank",
      label: "To Bank",
      icon: <Building2 className="h-6 w-6" />,
      action: () => navigate("/app/wallet/transfer"),
    },
    {
      id: "withdraw",
      label: "Withdraw",
      icon: <ArrowUpRight className="h-6 w-6" />,
      action: () => navigate("/app/wallet/withdraw"),
    },

    // Row 2: Telecom & Entertainment (4 items)
    {
      id: "airtime",
      label: "Airtime",
      icon: <Phone className="h-6 w-6" />,
      action: () => navigate("/app/wallet/airtime"),
      badge: { text: "Up to 6%", variant: "hot" },
    },
    {
      id: "data",
      label: "Data",
      icon: <Smartphone className="h-6 w-6" />,
      action: () => navigate("/app/wallet/data"),
    },
    {
      id: "betting",
      label: "Betting",
      icon: <Settings className="h-6 w-6" />,
      action: () => navigate("/app/wallet/betting"),
    },
    {
      id: "tv",
      label: "TV",
      icon: <Tv className="h-6 w-6" />,
      action: () => navigate("/app/wallet/tv"),
    },

    // Row 3: Savings & Community (4 items)
    {
      id: "safebox",
      label: "Safebox",
      icon: <Lock className="h-6 w-6" />,
      action: () => navigate("/app/wallet/safebox"),
    },
    {
      id: "loan",
      label: "Loan",
      icon: <Coins className="h-6 w-6" />,
      action: () => navigate("/app/wallet/loan"),
    },
    {
      id: "play4achild",
      label: "Play4aChild",
      icon: <Heart className="h-6 w-6" />,
      action: () => navigate("/app/wallet/play4achild"),
    },
    {
      id: "more",
      label: "More",
      icon: <Gift className="h-6 w-6" />,
      action: () => setShowMoreServices(true),
    },
  ];

  const moreServices: Service[] = [
    {
      id: "deposit",
      label: "Deposit",
      icon: <ArrowUpRight className="h-6 w-6" />,
      action: () => navigate("/app/wallet/deposit"),
    },
    {
      id: "electricity",
      label: "Electricity",
      icon: <Lightbulb className="h-6 w-6" />,
      action: () => navigate("/app/wallet/electricity"),
    },
    {
      id: "gift-cards",
      label: "Gift Cards",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/wallet/gift-cards"),
    },
    {
      id: "pay-bills",
      label: "Pay Bills",
      icon: <Lightbulb className="h-6 w-6" />,
      action: () => navigate("/app/wallet/pay-bills"),
    },
  ];

  const ServiceCard = ({ service }: { service: Service }) => (
    <button
      onClick={service.action}
      className="relative group flex flex-col items-center gap-3 p-4 sm:p-5 w-full"
    >
      {/* Icon Container with teal background */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg bg-teal-100">
        <div className="text-teal-600">
          {service.icon}
        </div>

        {/* Badge */}
        {service.badge && (
          <div
            className={`absolute -top-2 -right-2 px-2.5 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap ${
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

      {/* Label */}
      <div className="text-center w-full">
        <p className="font-medium text-gray-700 text-sm sm:text-base leading-tight">{service.label}</p>
      </div>
    </button>
  );

  return (
    <div className="space-y-6 bg-gray-50 rounded-2xl p-6">
      {/* Main Services Grid */}
      <div className="space-y-6">
        {/* Row 1: 3 items */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {mainServices.slice(0, 3).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Row 2: 4 items */}
        <div className="grid grid-cols-4 gap-4 sm:gap-6">
          {mainServices.slice(3, 7).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Row 3: 4 items */}
        <div className="grid grid-cols-4 gap-4 sm:gap-6">
          {mainServices.slice(7, 11).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* More Services Modal */}
      <Dialog open={showMoreServices} onOpenChange={setShowMoreServices}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>More Services</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-h-96 overflow-y-auto p-4">
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
