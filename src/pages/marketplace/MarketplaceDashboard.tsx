import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart } from "lucide-react";
import BuyerDashboard from "./BuyerDashboard";
import EnhancedSellerDashboard from "./EnhancedSellerDashboard";

export default function MarketplaceDashboard() {
  const [view, setView] = useState<"buyer" | "seller">(() => {
    const saved = localStorage.getItem("marketplace_dashboard_view");
    return saved === "seller" ? "seller" : "buyer";
    // default to buyer to match previous behavior
  });

  useEffect(() => {
    localStorage.setItem("marketplace_dashboard_view", view);
  }, [view]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Marketplace Dashboard</h1>
              <Badge variant="secondary" className="hidden sm:inline">
                Switch views
              </Badge>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("buyer")}
                className={`${
                  view === "buyer"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                } flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all`}
                aria-pressed={view === "buyer"}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Buyer</span>
                <span className="sm:hidden">Buy</span>
                {view === "buyer" && (
                  <Badge className="ml-1 bg-blue-600 text-white">On</Badge>
                )}
              </button>
              <button
                onClick={() => setView("seller")}
                className={`${
                  view === "seller"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                } flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all`}
                aria-pressed={view === "seller"}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Seller</span>
                <span className="sm:hidden">Sell</span>
                {view === "seller" && (
                  <Badge className="ml-1 bg-green-600 text-white">On</Badge>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        {view === "buyer" && <BuyerDashboard />}
        {view === "seller" && <EnhancedSellerDashboard />}
      </div>
    </div>
  );
}
