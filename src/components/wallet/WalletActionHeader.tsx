import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface WalletActionHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export const WalletActionHeader = ({
  title,
  subtitle,
  onBack,
}: WalletActionHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4 px-4 sm:px-6 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="flex-shrink-0 hover:bg-gray-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletActionHeader;
