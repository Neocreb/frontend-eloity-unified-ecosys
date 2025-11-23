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
  Gift,
  Plus,
} from "lucide-react";

interface Service {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  gradient: string;
  iconColor: string;
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
      id: "to-eloity",
      label: "To Eloity",
      icon: <User className="h-6 w-6" />,
      action: () => navigate("/app/wallet/send-money"),
      gradient: "bg-gradient-to-br from-teal-400 to-cyan-500",
      iconColor: "text-white",
    },
    {
      id: "transfer",
      label: "Transfer",
      icon: <Building2 className="h-6 w-6" />,
      action: () => navigate("/app/wallet/transfer"),
      gradient: "bg-gradient-to-br from-green-400 to-emerald-500",
      iconColor: "text-white",
    },
    {
      id: "withdraw",
      label: "Withdraw",
      icon: <ArrowUpRight className="h-6 w-6" />,
      action: () => navigate("/app/wallet/withdraw"),
      gradient: "bg-gradient-to-br from-purple-400 to-blue-500",
      iconColor: "text-white",
    },

    // Row 2: Telecom & Entertainment (4 items)
    {
      id: "airtime",
      label: "Airtime",
      icon: <Phone className="h-6 w-6" />,
      action: () => navigate("/app/wallet/airtime"),
      gradient: "bg-gradient-to-br from-orange-400 to-red-500",
      iconColor: "text-white",
      badge: { text: "Up to 6%", variant: "hot" },
    },
    {
      id: "data",
      label: "Data",
      icon: <Smartphone className="h-6 w-6" />,
      action: () => navigate("/app/wallet/data"),
      gradient: "bg-gradient-to-br from-blue-400 to-indigo-500",
      iconColor: "text-white",
    },
    {
      id: "electricity",
      label: "Electricity",
      icon: <Lightbulb className="h-6 w-6" />,
      action: () => navigate("/app/wallet/electricity"),
      gradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
      iconColor: "text-white",
    },
    {
      id: "tv",
      label: "TV",
      icon: <Tv className="h-6 w-6" />,
      action: () => navigate("/app/wallet/tv"),
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
      iconColor: "text-white",
    },

    // Row 3: Savings & Other Services (4 items)
    {
      id: "safebox",
      label: "Safebox",
      icon: <Lock className="h-6 w-6" />,
      action: () => navigate("/app/wallet/safebox"),
      gradient: "bg-gradient-to-br from-teal-400 to-green-500",
      iconColor: "text-white",
    },
    {
      id: "deposit",
      label: "Deposit",
      icon: <Plus className="h-6 w-6" />,
      action: () => navigate("/app/wallet/deposit"),
      gradient: "bg-gradient-to-br from-cyan-400 to-teal-500",
      iconColor: "text-white",
    },
    {
      id: "pay-bills",
      label: "Pay Bills",
      icon: <Lightbulb className="h-6 w-6" />,
      action: () => navigate("/app/wallet/pay-bills"),
      gradient: "bg-gradient-to-br from-blue-400 to-purple-500",
      iconColor: "text-white",
    },
    {
      id: "more",
      label: "More",
      icon: <Gift className="h-6 w-6" />,
      action: () => setShowMoreServices(true),
      gradient: "bg-gradient-to-br from-gray-400 to-gray-500",
      iconColor: "text-white",
    },
  ];

  const moreServices: Service[] = [
    {
      id: "request",
      label: "Request",
      icon: <HelpCircle className="h-6 w-6" />,
      action: () => navigate("/app/wallet/request"),
      gradient: "bg-gradient-to-br from-rose-400 to-red-500",
      iconColor: "text-white",
    },
    {
      id: "money-request",
      label: "Money Request",
      icon: <HelpCircle className="h-6 w-6" />,
      action: () => navigate("/app/wallet/money-request"),
      gradient: "bg-gradient-to-br from-pink-400 to-rose-500",
      iconColor: "text-white",
    },
    {
      id: "top-up",
      label: "Top Up",
      icon: <Phone className="h-6 w-6" />,
      action: () => navigate("/app/wallet/top-up"),
      gradient: "bg-gradient-to-br from-orange-400 to-yellow-500",
      iconColor: "text-white",
    },
    {
      id: "gift-cards",
      label: "Gift Cards",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/wallet/gift-cards"),
      gradient: "bg-gradient-to-br from-purple-400 to-pink-500",
      iconColor: "text-white",
    },
    {
      id: "buy-gift-cards",
      label: "Buy Gift Cards",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/wallet/buy-gift-cards"),
      gradient: "bg-gradient-to-br from-pink-400 to-rose-500",
      iconColor: "text-white",
    },
    {
      id: "sell-gift-cards",
      label: "Sell Gift Cards",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/wallet/sell-gift-cards"),
      gradient: "bg-gradient-to-br from-green-400 to-teal-500",
      iconColor: "text-white",
    },
  ];

  const ServiceCard = ({ service }: { service: Service }) => (
    <button
      onClick={service.action}
      className="relative group flex flex-col items-center gap-3 p-4 sm:p-5 w-full transition-all duration-300 hover:scale-105"
    >
      {/* Icon Container with gradient background */}
      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:shadow-xl ${service.gradient}`}>
        <div className={service.iconColor}>
          {service.icon}
        </div>

        {/* Badge */}
        {service.badge && (
          <div
            className={`absolute -top-2 -right-2 px-2.5 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap ${
              service.badge.variant === "hot"
                ? "bg-red-600"
                : service.badge.variant === "popular"
                ? "bg-amber-600"
                : "bg-blue-600"
            }`}
          >
            {service.badge.text}
          </div>
        )}
      </div>

      {/* Label */}
      <div className="text-center w-full">
        <p className="font-semibold text-gray-800 text-sm sm:text-base leading-tight">{service.label}</p>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-h-96 overflow-y-auto p-4">
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
