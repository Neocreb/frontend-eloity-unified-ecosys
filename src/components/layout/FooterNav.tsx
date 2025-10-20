import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Video,
  ShoppingCart,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";

const FooterNav = () => {
  const location = useLocation();

  const navItems = [
    {
      icon: Home,
      label: "Feed",
      href: "/app/feed",
      active: location.pathname === "/app" || location.pathname === "/app/feed",
    },
    {
      icon: Search,
      label: "Explore",
      href: "/app/explore",
      active: location.pathname === "/app/explore",
    },
    {
      icon: Briefcase,
      label: "Freelance",
      href: "/app/freelance",
      active:
        location.pathname === "/app/freelance" ||
        location.pathname.startsWith("/app/freelance"),
    },
    {
      icon: Video,
      label: "Videos",
      href: "/app/videos",
      active: location.pathname === "/app/videos",
    },
    {
      icon: ShoppingCart,
      label: "Market",
      href: "/app/marketplace",
      active:
        location.pathname === "/app/marketplace" ||
        location.pathname.startsWith("/app/marketplace"),
    },
    {
      icon: TrendingUp,
      label: "Crypto",
      href: "/app/crypto",
      active:
        location.pathname === "/app/crypto" ||
        location.pathname.startsWith("/app/crypto"),
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t md:hidden z-40 safe-area-pb">
      <div className="grid grid-cols-6 h-14 sm:h-16 px-1 w-full max-w-full">
        {navItems.map((item) => (
          <Link key={item.href} to={item.href} className="w-full min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full flex flex-col items-center justify-center py-1 px-0.5 h-full rounded-none text-center min-w-0",
                item.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-3 w-3 sm:h-4 sm:w-4 mb-0.5 sm:mb-1 flex-shrink-0",
                  item.active ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="text-[10px] sm:text-xs leading-none truncate w-full">
                {item.label}
              </span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FooterNav;
