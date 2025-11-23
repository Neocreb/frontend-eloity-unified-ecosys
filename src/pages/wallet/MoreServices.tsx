import { useNavigate } from "react-router-dom";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import {
  HelpCircle,
  Phone,
  Gift,
} from "lucide-react";

interface Service {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  gradient: string;
}

const MoreServices = () => {
  const navigate = useNavigate();

  const services: Service[] = [
    {
      id: "request",
      label: "Request Money",
      icon: <HelpCircle className="h-6 w-6" />,
      action: () => navigate("/app/wallet/request"),
      gradient: "bg-gradient-to-br from-rose-400 to-red-500",
    },
    {
      id: "top-up",
      label: "Top Up",
      icon: <Phone className="h-6 w-6" />,
      action: () => navigate("/app/wallet/top-up"),
      gradient: "bg-gradient-to-br from-orange-400 to-yellow-500",
    },
    {
      id: "gift-cards",
      label: "Gift Cards",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/wallet/gift-cards"),
      gradient: "bg-gradient-to-br from-purple-400 to-pink-500",
    },
    {
      id: "buy-gift-cards",
      label: "Buy Gift Cards",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/wallet/buy-gift-cards"),
      gradient: "bg-gradient-to-br from-pink-400 to-rose-500",
    },
    {
      id: "sell-gift-cards",
      label: "Sell Gift Cards",
      icon: <Gift className="h-6 w-6" />,
      action: () => navigate("/app/wallet/sell-gift-cards"),
      gradient: "bg-gradient-to-br from-green-400 to-teal-500",
    },
  ];

  const ServiceCard = ({ service }: { service: Service }) => (
    <button
      onClick={service.action}
      className="relative group flex flex-col items-center gap-3 p-4 sm:p-5 w-full transition-all duration-300 hover:scale-105"
    >
      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:shadow-xl ${service.gradient}`}>
        <div className="text-white">
          {service.icon}
        </div>
      </div>

      <div className="text-center w-full">
        <p className="font-semibold text-gray-800 text-sm sm:text-base leading-tight">{service.label}</p>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <WalletActionHeader title="More Services" />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreServices;
