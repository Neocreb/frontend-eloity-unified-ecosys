// @ts-nocheck
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Shield,
  BarChart3,
  Users,
  Settings,
  Eye,
  UserCog,
  Bell,
  Briefcase,
  ShoppingCart,
  Bitcoin,
  MessageSquare,
  Star,
  Flag,
  CreditCard,
  Zap,
  Globe,
  FileText,
  AlertTriangle,
  Database,
  Activity,
  UserCheck,
} from "lucide-react";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: BarChart3,
    description: "Platform overview and analytics",
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Manage users, KYC, and permissions",
  },
  {
    title: "KYC Verification",
    href: "/admin/kyc",
    icon: UserCheck,
    description: "Review identity verifications and compliance",
  },
  {
    title: "Freelance",
    href: "/admin/freelance",
    icon: Briefcase,
    description: "Jobs, projects, and freelancer management",
  },
  {
    title: "Marketplace",
    href: "/admin/marketplace",
    icon: ShoppingCart,
    description: "Products, orders, and seller management",
  },
  {
    title: "P2P Trading",
    href: "/admin/crypto",
    icon: Bitcoin,
    description: "Crypto trading and dispute resolution",
  },
  {
    title: "Content Moderation",
    href: "/admin/moderation",
    icon: Eye,
    description: "Review reports and moderate content",
  },
  {
    title: "Financial",
    href: "/admin/financial",
    icon: CreditCard,
    description: "Platform earnings and wallet management",
  },
  {
    title: "Boost System",
    href: "/admin/boosts",
    icon: Zap,
    description: "Content promotion and advertising",
  },
  {
    title: "Chat & Messages",
    href: "/admin/chat",
    icon: MessageSquare,
    description: "Monitor and moderate communications",
  },
  {
    title: "Reports & Analytics",
    href: "/admin/analytics",
    icon: Activity,
    description: "Detailed platform analytics",
  },
  {
    title: "System Health",
    href: "/admin/system",
    icon: Database,
    description: "Server performance and monitoring",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Platform configuration and admin settings",
  },
];

interface ComprehensiveAdminNavProps {
  className?: string;
  onNavigate?: () => void;
}

export function ComprehensiveAdminNav({
  className,
  onNavigate,
}: ComprehensiveAdminNavProps) {
  const location = useLocation();

  return (
    <nav className={cn("space-y-2", className)}>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Admin Panel
        </h2>
        <div className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t">
        <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
          Quick Actions
        </h3>
        <div className="space-y-1">
          <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground w-full text-left">
            <Bell className="h-4 w-4" />
            <span>Send Global Alert</span>
          </button>
          <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground w-full text-left">
            <Flag className="h-4 w-4" />
            <span>Emergency Lockdown</span>
          </button>
          <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground w-full text-left">
            <Globe className="h-4 w-4" />
            <span>Platform Status</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
