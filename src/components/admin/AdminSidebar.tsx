import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdmin } from "@/contexts/AdminContext";
import { AdminRole } from "@/types/admin";
import {
  Shield,
  BarChart3,
  Users,
  Settings,
  Eye,
  UserCog,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  FileText,
  ShoppingCart,
  Truck,
  Bitcoin,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Database,
  Lock,
  AlertTriangle,
} from "lucide-react";

interface AdminSidebarProps {
  className?: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  requiredRole?: AdminRole;
  requiredPermission?: string;
  badge?: string | number;
  description?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = "" }) => {
  const { currentAdmin, hasRole, hasPermission, logoutAdmin } = useAdmin();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/admin/login");
  };

  const getRoleColor = (role: AdminRole) => {
    const colors: Record<AdminRole, string> = {
      super_admin: "bg-red-500 text-white",
      content_admin: "bg-blue-500 text-white",
      user_admin: "bg-green-500 text-white",
      marketplace_admin: "bg-purple-500 text-white",
      crypto_admin: "bg-yellow-500 text-black",
      freelance_admin: "bg-orange-500 text-white",
      support_admin: "bg-gray-500 text-white",
    };
    return colors[role];
  };

  const navigationItems: NavItem[] = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "Overview and system metrics",
    },
    {
      path: "/admin/management",
      label: "Admin Management",
      icon: <UserCog className="w-5 h-5" />,
      requiredRole: "super_admin",
      description: "Manage administrator accounts",
    },
    {
      path: "/admin/users",
      label: "User Management",
      icon: <Users className="w-5 h-5" />,
      requiredPermission: "users.view",
      description: "Manage user accounts",
    },
    {
      path: "/admin/moderation",
      label: "Content Moderation",
      icon: <Eye className="w-5 h-5" />,
      requiredPermission: "content.moderate",
      badge: "12", // TODO: Get real pending count
      description: "Review reported content",
    },
    {
      path: "/admin/settings",
      label: "Platform Settings",
      icon: <Settings className="w-5 h-5" />,
      requiredPermission: "settings.all",
      description: "Configure platform settings",
    },
  ];

  const featureItems: NavItem[] = [
    {
      path: "/admin/marketplace",
      label: "Marketplace",
      icon: <ShoppingCart className="w-5 h-5" />,
      requiredPermission: "marketplace.view",
      description: "Manage marketplace",
    },
    {
      path: "/admin/delivery",
      label: "Delivery Providers",
      icon: <Truck className="w-5 h-5" />,
      requiredPermission: "marketplace.view",
      description: "Manage delivery providers",
    },
    {
      path: "/admin/crypto",
      label: "Cryptocurrency",
      icon: <Bitcoin className="w-5 h-5" />,
      requiredPermission: "crypto.view",
      description: "Trading oversight",
    },
    {
      path: "/admin/freelance",
      label: "Freelance",
      icon: <Briefcase className="w-5 h-5" />,
      requiredPermission: "freelance.view",
      description: "Job board management",
    },
  ];

  const systemItems: NavItem[] = [
    {
      path: "/admin/analytics",
      label: "Analytics",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Platform analytics",
    },
    {
      path: "/admin/logs",
      label: "System Logs",
      icon: <FileText className="w-5 h-5" />,
      requiredRole: "super_admin",
      description: "View system logs",
    },
    {
      path: "/admin/security",
      label: "Security",
      icon: <Lock className="w-5 h-5" />,
      requiredRole: "super_admin",
      description: "Security settings",
    },
  ];

  const renderNavItem = (item: NavItem) => {
    // Check permissions
    if (item.requiredRole && !hasRole(item.requiredRole)) return null;
    if (item.requiredPermission && !hasPermission(item.requiredPermission))
      return null;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) => `
          flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group
          ${
            isActive
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }
          ${isCollapsed ? "justify-center" : ""}
        `}
        title={isCollapsed ? item.label : item.description}
      >
        <div className="flex-shrink-0">{item.icon}</div>

        {!isCollapsed && (
          <>
            <span className="flex-1 font-medium">{item.label}</span>
            {item.badge && (
              <Badge
                variant="secondary"
                className="ml-auto text-xs bg-red-500 text-white"
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const renderSection = (title: string, items: NavItem[]) => {
    const visibleItems = items.filter((item) => {
      if (item.requiredRole && !hasRole(item.requiredRole)) return false;
      if (item.requiredPermission && !hasPermission(item.requiredPermission))
        return false;
      return true;
    });

    if (visibleItems.length === 0) return null;

    return (
      <div className="space-y-2">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
            {title}
          </h3>
        )}
        <div className="space-y-1">{visibleItems.map(renderNavItem)}</div>
      </div>
    );
  };

  if (!currentAdmin) {
    return (
      <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <Alert variant="destructive" className="mx-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Admin session not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className={`
      ${isCollapsed ? "w-20" : "w-64"} 
      h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
      transition-all duration-300 flex flex-col
      ${className}
    `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">
                  Admin Panel
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Eloity Control
                </p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={`${isCollapsed ? "text-center" : "space-y-3"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
              {currentAdmin.name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {currentAdmin.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {currentAdmin.email}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex flex-wrap gap-1">
              {currentAdmin.roles.map((role) => (
                <Badge key={role} className={`text-xs ${getRoleColor(role)}`}>
                  {role === "super_admin" && <Crown className="w-3 h-3 mr-1" />}
                  {role.replace("_", " ")}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {renderSection("Core", navigationItems)}
        {renderSection("Features", featureItems)}
        {renderSection("System", systemItems)}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={handleLogout}
          className={`w-full ${isCollapsed ? "px-0" : ""}`}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
