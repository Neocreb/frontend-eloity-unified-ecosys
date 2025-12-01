import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Search,
  DollarSign,
  Clock,
  Users,
  X,
  TrendingUp,
  Star,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface FreelanceFABProps {
  className?: string;
}

const FreelanceFAB: React.FC<FreelanceFABProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { formatCurrency } = useCurrency();

  // Don't show on freelance pages to avoid duplication
  const hiddenPaths = ["/app/freelance", "/auth", "/"];
  if (hiddenPaths.some((path) => location.pathname.startsWith(path))) {
    return null;
  }

  const quickStats = [
    { label: "Active Bids", value: "3", icon: <Clock className="w-3 h-3" /> },
    {
      label: "This Month",
      value: formatCurrency(1240),
      icon: <DollarSign className="w-3 h-3" />,
    },
    {
      label: "New Jobs",
      value: "+24",
      icon: <TrendingUp className="w-3 h-3" />,
    },
  ];

  const quickActions = [
    {
      label: "Post a Job",
      icon: <Plus className="w-4 h-4" />,
      onClick: () => navigate("/app/freelance/post-job"),
      className: "bg-orange-600 hover:bg-orange-700 text-white",
      badge: "Popular",
    },
    {
      label: "Browse Jobs",
      icon: <Search className="w-4 h-4" />,
      onClick: () => navigate("/app/freelance"),
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      label: "My Dashboard",
      icon: <Award className="w-4 h-4" />,
      onClick: () => navigate("/app/freelance/dashboard"),
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
    {
      label: "Messages",
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: () => navigate("/app/chat"),
      className: "bg-purple-600 hover:bg-purple-700 text-white",
      badge: "2",
    },
  ];

  return (
    <div className={cn("fixed bottom-20 right-4 z-40 md:bottom-6", className)}>
      {/* Expanded Content */}
      {isExpanded && (
        <Card className="mb-4 w-72 shadow-xl border-orange-200 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <Briefcase className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900">
                    Freelance Hub
                  </h3>
                  <p className="text-xs text-gray-500">Quick actions</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-orange-50 to-amber-50 p-2 rounded-lg text-center"
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="text-orange-600">{stat.icon}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-500 px-2">
                  Quick Actions
                </span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  className={cn(
                    "w-full justify-start gap-2 h-10",
                    action.className,
                  )}
                >
                  {action.icon}
                  <span className="flex-1 text-left">{action.label}</span>
                  {action.badge && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 text-xs"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/app/freelance")}
                className="w-full text-orange-600 hover:bg-orange-50"
              >
                View Full Freelance Platform
                <ChevronUp className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main FAB Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-200",
          "bg-gradient-to-r from-orange-500 to-amber-500",
          "hover:from-orange-600 hover:to-amber-600",
          "focus:ring-4 focus:ring-orange-200",
          isExpanded && "rotate-45",
        )}
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Briefcase className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Notification Badge */}
      <div className="absolute -top-1 -right-1">
        <div className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-white">3</span>
        </div>
      </div>

      {/* Pulse Effect */}
      <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-20 pointer-events-none" />
    </div>
  );
};

export default FreelanceFAB;
