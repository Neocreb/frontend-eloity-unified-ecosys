// @ts-nocheck
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AdminUser, AdminRole, AdminSession } from "@/types/admin";
import { AdminService } from "@/services/adminService";

interface AdminContextType {
  currentAdmin: AdminUser | null;
  adminSession: AdminSession | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: AdminRole) => boolean;
  hasPermission: (permission: string) => boolean;
  loginAsAdmin: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  refreshAdminSession: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  currentAdmin: null,
  adminSession: null,
  isAdminAuthenticated: false,
  isLoading: true,
  hasRole: () => false,
  hasPermission: () => false,
  loginAsAdmin: async () => ({ success: false }),
  logoutAdmin: async () => {},
  refreshAdminSession: async () => {},
});

export const useAdmin = () => useContext(AdminContext);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAdminSession();
  }, []);

  useEffect(() => {
    if (!adminSession) return;

    // Check session validity every 5 minutes
    const interval = setInterval(checkSessionValidity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [adminSession]);

  const initializeAdminSession = async () => {
    let mounted = true;

    try {
      setIsLoading(true);

      // Check for existing admin session
      const sessionToken = localStorage.getItem("admin_session");
      const adminData = localStorage.getItem("admin_user");

      if (sessionToken && adminData) {
        try {
          const admin = JSON.parse(adminData);

          // Validate session is still active
          const isValid = await validateSession(sessionToken);

          // Only update state if component is still mounted
          if (mounted && isValid) {
            setCurrentAdmin(admin);
            setAdminSession({
              id: `session-${admin.id}`,
              adminId: admin.id,
              sessionToken,
              ipAddress: window.location.hostname,
              userAgent: navigator.userAgent,
              isActive: true,
              expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
              createdAt: new Date(),
            });
          } else if (!isValid) {
            // Session invalid, clear storage
            localStorage.removeItem("admin_session");
            localStorage.removeItem("admin_user");
          }
        } catch (error) {
          console.error("Error parsing admin data:", error);
          localStorage.removeItem("admin_session");
          localStorage.removeItem("admin_user");
        }
      }
    } catch (error) {
      console.error("Error initializing admin session:", error);
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  };

  const validateSession = async (sessionToken: string): Promise<boolean> => {
    try {
      // In a real implementation, this would validate with the backend
      // For now, we'll assume the session is valid if it exists
      return true;
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  };

  const checkSessionValidity = async () => {
    if (!adminSession?.sessionToken) return;

    const isValid = await validateSession(adminSession.sessionToken);
    if (!isValid) {
      await logoutAdmin();
    }
  };

  const loginAsAdmin = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const result = await AdminService.adminLogin({ email, password });

      if (result.success && result.user && result.session) {
        setCurrentAdmin(result.user);
        setAdminSession(result.session);

        // Store in localStorage
        localStorage.setItem("admin_session", result.session.sessionToken);
        localStorage.setItem("admin_user", JSON.stringify(result.user));

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Admin login error:", error);
      return { success: false, error: "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAdmin = async (): Promise<void> => {
    try {
      if (adminSession?.sessionToken) {
        await AdminService.adminLogout(adminSession.sessionToken);
      }
    } catch (error) {
      console.error("Admin logout error:", error);
    } finally {
      // Clear state and storage
      setCurrentAdmin(null);
      setAdminSession(null);
      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_user");
    }
  };

  const refreshAdminSession = async (): Promise<void> => {
    if (!currentAdmin) return;

    try {
      // Refresh admin data
      const refreshedAdmin = await AdminService.getAdminUser(currentAdmin.id);
      if (refreshedAdmin) {
        setCurrentAdmin(refreshedAdmin);
        localStorage.setItem("admin_user", JSON.stringify(refreshedAdmin));
      }
    } catch (error) {
      console.error("Error refreshing admin session:", error);
    }
  };

  const hasRole = (role: AdminRole): boolean => {
    return currentAdmin?.roles.includes(role) || false;
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentAdmin) return false;

    // Super admins have all permissions
    if (currentAdmin.roles.includes("super_admin")) return true;

    // Check specific permissions
    return currentAdmin.permissions.includes(permission);
  };

  const isAdminAuthenticated = !!(currentAdmin && adminSession?.isActive);

  const contextValue: AdminContextType = {
    currentAdmin,
    adminSession,
    isAdminAuthenticated,
    isLoading,
    hasRole,
    hasPermission,
    loginAsAdmin,
    logoutAdmin,
    refreshAdminSession,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
